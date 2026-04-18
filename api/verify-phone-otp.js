import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { logBruteForceAttempt, logSecurityEvent } from './utils/security-logger.js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const ALLOWED_ORIGINS = process.env.NODE_ENV === 'production'
  ? (process.env.ALLOWED_ORIGINS || 'https://yobbu.vercel.app,https://yobbu.com').split(',')
  : (process.env.ALLOWED_ORIGINS || 'https://yobbu.vercel.app,https://yobbu.com,http://localhost:5173').split(',')
const MAX_ATTEMPTS = 5

function setCors(req, res) {
  const origin = req.headers.origin || ''
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Vary', 'Origin')
}

function hashOtp(code) {
  return crypto.createHash('sha256').update(code).digest('hex')
}

export default async function handler(req, res) {
  setCors(req, res)

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { phone, code } = req.body

  if (!phone || !code) {
    return res.status(400).json({ error: 'Phone and code required' })
  }

  try {
    // Fetch OTP record
    const { data: otpRecord, error: otpError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('phone', phone)
      .is('deleted_at', null)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle()

    if (otpError) throw otpError

    if (!otpRecord) {
      console.log(`[OTP] No active code for ${phone}`)
      return res.status(400).json({ error: 'Code expired or not found. Please request a new code.' })
    }

    // Brute force protection
    const attempts = (otpRecord.attempts || 0) + 1
    if (attempts > MAX_ATTEMPTS) {
      await supabase.from('otp_codes').update({ deleted_at: new Date().toISOString() }).eq('id', otpRecord.id)
      await logBruteForceAttempt(phone, attempts)
      return res.status(429).json({ error: 'Too many attempts. Please request a new code.' })
    }

    // Compare code hash (timing-safe)
    const codeHash = hashOtp(String(code).trim())
    const isValid = crypto.timingSafeEqual(
      Buffer.from(codeHash),
      Buffer.from(otpRecord.code_hash)
    )

    if (!isValid) {
      await supabase.from('otp_codes').update({ attempts }).eq('id', otpRecord.id)
      const remaining = MAX_ATTEMPTS - attempts
      console.log(`[OTP] Wrong code for ${phone} — attempt ${attempts}/${MAX_ATTEMPTS}`)

      if (remaining <= 0) {
        await supabase.from('otp_codes').update({ deleted_at: new Date().toISOString() }).eq('id', otpRecord.id)
        return res.status(429).json({ error: 'Too many attempts. Please request a new code.' })
      }

      return res.status(400).json({
        error: `Invalid code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
      })
    }

    // Mark code as used
    await supabase.from('otp_codes').update({ deleted_at: new Date().toISOString() }).eq('id', otpRecord.id)
    console.log(`[OTP] Verified for ${phone}`)

    // Find or create user
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone', phone)
      .maybeSingle()

    let user = existingProfile
    let isNewUser = false

    if (!user) {
      isNewUser = true
      const email = `${phone.replace(/\D/g, '')}@phone.yobbu.app`
      const securePassword = crypto.randomUUID()

      const { data: authData, error: createError } = await supabase.auth.admin.createUser({
        email,
        password: securePassword,
        email_confirm: true,
      })

      let authUserId

      if (createError) {
        if (createError.message?.toLowerCase().includes('already')) {
          const { data: { users: allUsers } } = await supabase.auth.admin.listUsers({ perPage: 1000 })
          const existing = allUsers?.find(u => u.email === email)
          if (!existing) throw new Error('Could not locate existing auth user')
          authUserId = existing.id
          isNewUser = false
        } else {
          throw createError
        }
      } else {
        authUserId = authData.user.id
      }

      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authUserId,
          phone,
          phone_verified_at: new Date().toISOString(),
          verification_tier: 1,
        }, { onConflict: 'id' })
        .select()
        .single()

      if (profileError) throw profileError
      user = newProfile
    } else {
      // Mark phone as verified on existing user
      await supabase
        .from('profiles')
        .update({ phone_verified_at: new Date().toISOString() })
        .eq('id', user.id)
    }

    // Generate JWT tokens
    const jwtSecret = process.env.SUPABASE_JWT_SECRET
    if (!jwtSecret) throw new Error('SUPABASE_JWT_SECRET not configured')

    const now = Math.floor(Date.now() / 1000)
    const accessToken = jwt.sign(
      {
        sub: user.id,
        aud: 'authenticated',
        role: 'authenticated',
        iat: now,
        exp: now + 3600, // 1 hour
      },
      jwtSecret
    )

    const refreshToken = crypto.randomUUID()

    console.log(`[OTP] Session created for user ${user.id}`)

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        firstName: user.first_name,
        lastName: user.last_name,
        verificationTier: user.verification_tier,
      },
      session: {
        access_token: accessToken,
        refresh_token: refreshToken,
      },
      isNewUser,
      hasPin: !!user.pin_hash,
    })

  } catch (err) {
    console.error('[OTP] Verify error:', err.message)
    return res.status(500).json({ error: 'Verification failed. Please try again.' })
  }
}
