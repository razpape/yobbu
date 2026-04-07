import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

// Uses the service role key — never exposed to client
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY   // set in your .env (NOT the anon key)
)

const sha256 = (str) => crypto.createHash('sha256').update(str).digest('hex')

// Normalise phone: strip everything except digits, remove leading +
const normalise = (phone) => phone.replace(/[^\d]/g, '')

// Mask phone for display: +221 77****123
function maskPhone(normalised) {
  if (normalised.length <= 4) return `+${'*'.repeat(normalised.length)}`
  const visible = normalised.slice(-3)
  const hidden  = '*'.repeat(Math.max(0, normalised.length - 5))
  return `+${normalised.slice(0, normalised.length > 10 ? normalised.length - 10 : 2)} ${hidden}${visible}`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { userId, phone } = req.body
  if (!userId || !phone) return res.status(400).json({ error: 'Missing userId or phone' })

  const normalised = normalise(phone)
  if (normalised.length < 7 || normalised.length > 15) {
    return res.status(400).json({ error: 'Invalid phone number format' })
  }

  // Load profile to check rate limit
  const { data: profile, error: profileErr } = await supabaseAdmin
    .from('profiles')
    .select('whatsapp_otp_last_sent_at, whatsapp_number_hash, whatsapp_verified')
    .eq('id', userId)
    .single()

  if (profileErr || !profile) return res.status(404).json({ error: 'User not found' })

  if (profile.whatsapp_verified) {
    return res.status(400).json({ error: 'Already verified' })
  }

  // Rate limit: 60-second cooldown between sends
  if (profile.whatsapp_otp_last_sent_at) {
    const secondsAgo = (Date.now() - new Date(profile.whatsapp_otp_last_sent_at)) / 1000
    if (secondsAgo < 60) {
      return res.status(429).json({
        error: 'Please wait before requesting a new code',
        retryAfter: Math.ceil(60 - secondsAgo),
        cooldown: true,
      })
    }
  }

  // Check that no other account uses this phone number
  const phoneHash = sha256(normalised)
  const { data: existingUser } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('whatsapp_number_hash', phoneHash)
    .neq('id', userId)
    .maybeSingle()

  if (existingUser) {
    return res.status(409).json({ error: 'This phone number is already linked to another account' })
  }

  // Generate OTP
  const otp       = Math.floor(100000 + Math.random() * 900000).toString()
  const otpHash   = sha256(otp)
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()

  // Persist OTP hash + phone hash in profile
  const { error: saveErr } = await supabaseAdmin
    .from('profiles')
    .update({
      whatsapp_otp_hash:         otpHash,
      whatsapp_otp_expires_at:   expiresAt,
      whatsapp_otp_last_sent_at: new Date().toISOString(),
      whatsapp_number_hash:      phoneHash,
      whatsapp_number:           maskPhone(normalised),
    })
    .eq('id', userId)

  if (saveErr) return res.status(500).json({ error: 'Failed to store OTP' })

  // Send via Twilio WhatsApp
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken  = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886'

  if (!accountSid || !authToken) {
    // Dev mode: log OTP to console instead of sending
    console.log(`[DEV] WhatsApp OTP for ${normalised}: ${otp}`)
    return res.json({ success: true, expiresAt, dev: true })
  }

  const body = new URLSearchParams({
    From: fromNumber,
    To:   `whatsapp:+${normalised}`,
    Body: `Your Yobbu verification code is: *${otp}*\n\nThis code expires in 5 minutes. Never share it with anyone.`,
  })

  try {
    const twilioRes = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method:  'POST',
        headers: {
          'Content-Type':  'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        },
        body: body.toString(),
      }
    )
    const data = await twilioRes.json()
    if (!twilioRes.ok) {
      console.error('Twilio error:', data)
      return res.status(502).json({ error: 'Failed to send WhatsApp message. Please try again.' })
    }
    return res.json({ success: true, expiresAt })
  } catch (err) {
    console.error('Twilio fetch error:', err)
    return res.status(502).json({ error: 'Failed to send WhatsApp message' })
  }
}
