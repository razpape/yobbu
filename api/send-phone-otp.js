import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { isValidPhone } from './utils/phone-validator.js'
import { logSecurityEvent, logRateLimitExceeded } from './utils/security-logger.js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN
const twilioVerifySid = process.env.TWILIO_VERIFY_SERVICE_SID

const ALLOWED_ORIGINS = process.env.NODE_ENV === 'production'
  ? (process.env.ALLOWED_ORIGINS || 'https://yobbu.vercel.app,https://yobbu.com').split(',')
  : (process.env.ALLOWED_ORIGINS || 'https://yobbu.vercel.app,https://yobbu.com,http://localhost:5173').split(',')

const OTP_LENGTH = 6
const OTP_TTL_MINUTES = 10
const RESEND_COOLDOWN_SECONDS = 60
const MAX_RESENDS_PER_HOUR = 3
const MAX_PHONES_PER_IP_HOUR = 10

function hashOtp(code) {
  return crypto.createHash('sha256').update(code).digest('hex')
}

function generateSecureOtp(length = OTP_LENGTH) {
  const bytes = crypto.randomBytes(Math.ceil(length * Math.log2(10) / 8))
  let code = ''
  for (let i = 0; i < length; i++) {
    code += Math.floor((bytes[i] / 255) * 10)
  }
  return code.slice(0, length)
}

export default async function handler(req, res) {
  const origin = req.headers.origin || ''
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Vary', 'Origin')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { phone } = req.body
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || 'unknown'

  if (!phone || !isValidPhone(phone)) {
    await logSecurityEvent('INVALID_PHONE_FORMAT', { phone: phone?.slice(-4) || 'empty', ip: clientIp })
    return res.status(400).json({ error: 'Valid phone number required' })
  }

  try {
    // Rate limit: max 10 different phone numbers per IP per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count: ipPhoneCount } = await supabase
      .from('otp_codes')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', clientIp)
      .gte('created_at', oneHourAgo)

    if ((ipPhoneCount || 0) >= MAX_PHONES_PER_IP_HOUR) {
      await logRateLimitExceeded(clientIp, '/api/send-phone-otp')
      return res.status(429).json({ error: 'Too many requests from this IP. Try again later.' })
    }

    // Resend cooldown: 60 seconds between sends
    const { data: recent } = await supabase
      .from('otp_codes')
      .select('created_at')
      .eq('phone', phone)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (recent) {
      const secondsSinceSent = Math.floor((Date.now() - new Date(recent.created_at).getTime()) / 1000)
      if (secondsSinceSent < RESEND_COOLDOWN_SECONDS) {
        return res.status(429).json({
          error: `Please wait ${RESEND_COOLDOWN_SECONDS - secondsSinceSent} seconds before requesting a new code.`
        })
      }
    }

    // Resend limit: max 3 per hour
    const { count: recentCount } = await supabase
      .from('otp_codes')
      .select('*', { count: 'exact', head: true })
      .eq('phone', phone)
      .is('deleted_at', null)
      .gte('created_at', oneHourAgo)

    if ((recentCount || 0) >= MAX_RESENDS_PER_HOUR) {
      console.warn(`[OTP] Phone resend limit exceeded: ${phone}`)
      return res.status(429).json({ error: 'Too many code requests. Try again after 1 hour.' })
    }

    // Generate secure code
    const code = generateSecureOtp(OTP_LENGTH)
    const codeHash = hashOtp(code)
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString()

    // Mark old codes as deleted (soft delete for audit)
    await supabase
      .from('otp_codes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('phone', phone)
      .is('deleted_at', null)
      .catch(err => console.error('[OTP] Cleanup error:', err.message))

    // Store hashed code
    const { error: insertError } = await supabase
      .from('otp_codes')
      .insert({
        phone,
        code_hash: codeHash,
        expires_at: expiresAt,
        ip_address: clientIp,
        created_at: new Date().toISOString(),
      })

    if (insertError) throw insertError

    // DEV MODE: skip SMS and log code to terminal
    if (process.env.DEV_SKIP_SMS === 'true') {
      console.log(`\n==============================`)
      console.log(`  OTP for ${phone}: ${code}`)
      console.log(`==============================\n`)
      const { data: existingUser } = await supabase
        .from('profiles').select('id').eq('phone', phone).maybeSingle()
      return res.status(200).json({ success: true, message: 'Verification code sent', isNewUser: !existingUser })
    }

    // Send via Twilio
    const response = await fetch(
      `https://verify.twilio.com/v2/Services/${twilioVerifySid}/Verifications`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: phone,
          Channel: 'sms',
          CustomCode: code,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('[OTP] Twilio error:', data.code)
      await supabase.from('otp_codes').update({ deleted_at: new Date().toISOString() }).eq('phone', phone).is('deleted_at', null)

      if (data.code === 20429) {
        return res.status(429).json({
          error: 'Service temporarily unavailable. Please try again in a few minutes.'
        })
      }
      return res.status(400).json({ error: 'Failed to send code. Please check your number and try again.' })
    }

    console.log(`[OTP] Sent to ${phone}`)

    const { data: existingUser } = await supabase
      .from('profiles').select('id').eq('phone', phone).maybeSingle()

    return res.status(200).json({
      success: true,
      message: 'Verification code sent',
      isNewUser: !existingUser,
    })

  } catch (err) {
    console.error('[OTP] Error:', err.message)
    return res.status(500).json({ error: 'Failed to send code. Please try again.' })
  }
}
