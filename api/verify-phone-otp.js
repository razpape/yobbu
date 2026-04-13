import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://yobbu.vercel.app,https://yobbu.com,http://localhost:5173').split(',')
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

export default async function handler(req, res) {
  setCors(req, res)

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { phone, code } = req.body

  if (!phone || !code) {
    return res.status(400).json({ error: 'Phone and code required' })
  }

  try {
    // Fetch OTP record (not yet checking code — need to track attempts first)
    const { data: otpRecord, error: otpError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('phone', phone)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle()

    if (otpError) throw otpError

    if (!otpRecord) {
      console.log(`[OTP] No active code for ${phone}`)
      return res.status(400).json({ error: 'Invalid or expired code' })
    }

    // Brute force protection — lock after MAX_ATTEMPTS
    const attempts = (otpRecord.attempts || 0) + 1
    if (attempts > MAX_ATTEMPTS) {
      await supabase.from('otp_codes').delete().eq('id', otpRecord.id)
      console.warn(`[OTP] Too many attempts for ${phone} — code invalidated`)
      return res.status(429).json({ error: 'Too many attempts. Please request a new code.' })
    }

    // Check code
    if (String(otpRecord.code).trim() !== String(code).trim()) {
      // Increment attempt counter
      await supabase.from('otp_codes').update({ attempts }).eq('id', otpRecord.id)
      const remaining = MAX_ATTEMPTS - attempts
      console.log(`[OTP] Wrong code for ${phone} — attempt ${attempts}/${MAX_ATTEMPTS}`)
      if (remaining <= 0) {
        await supabase.from('otp_codes').delete().eq('id', otpRecord.id)
        return res.status(429).json({ error: 'Too many attempts. Please request a new code.' })
      }
      return res.status(400).json({ error: `Invalid code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.` })
    }

    // Valid — delete it so it can't be reused
    await supabase.from('otp_codes').delete().eq('id', otpRecord.id)
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

      const { data: authData, error: createError } = await supabase.auth.admin.createUser({
        email,
        password: crypto.randomUUID(),
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
      await supabase
        .from('profiles')
        .update({ phone_verified_at: new Date().toISOString() })
        .eq('id', user.id)
    }

    // Create session
    const deterministicPassword = crypto
      .createHmac('sha256', process.env.SUPABASE_SERVICE_ROLE_KEY || 'fallback')
      .update(phone)
      .digest('hex')

    await supabase.auth.admin.updateUserById(user.id, { password: deterministicPassword })

    const email = `${phone.replace(/\D/g, '')}@phone.yobbu.app`
    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
      email,
      password: deterministicPassword,
    })

    if (sessionError) throw sessionError

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
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
      },
      isNewUser,
      hasPin: !!user.pin_hash,
    })

  } catch (err) {
    console.error('[OTP] Verify error:', err.message)
    return res.status(500).json({ error: 'Verification failed: ' + err.message })
  }
}
