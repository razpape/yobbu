import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { phone, code } = req.body

  if (!phone || !code) {
    return res.status(400).json({ error: 'Phone and code required' })
  }

  try {
    // Look up code in Supabase — no Twilio involved in verification
    const { data: otpRecord, error: otpError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('phone', phone)
      .eq('code', String(code).trim())
      .gt('expires_at', new Date().toISOString())
      .single()

    if (otpError || !otpRecord) {
      console.log(`[verify] failed for ${phone} — code not found or expired`)
      return res.status(400).json({ error: 'Invalid or expired code' })
    }

    // Code is valid — delete it so it can't be reused
    await supabase.from('otp_codes').delete().eq('id', otpRecord.id)

    console.log(`[verify] success for ${phone}`)

    // Find or create user
    let { data: user } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone', phone)
      .single()

    let isNewUser = false

    if (!user) {
      const email = `${phone.replace(/\D/g, '')}@phone.yobbu.app`

      // Find existing auth user or create new one
      let authUserId
      const { data: listData } = await supabase.auth.admin.listUsers({ perPage: 1000 })
      const existingAuthUser = listData?.users?.find(u => u.email === email)

      if (existingAuthUser) {
        authUserId = existingAuthUser.id
        isNewUser = false
      } else {
        isNewUser = true
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email,
          password: crypto.randomUUID(),
          email_confirm: true,
        })
        if (authError) throw authError
        authUserId = authData.user.id
      }

      const { data: newUser, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authUserId,
          phone,
          phone_verified_at: new Date().toISOString(),
          verification_tier: 1,
          created_at: new Date().toISOString(),
        }, { onConflict: 'id' })
        .select()
        .single()

      if (profileError) throw profileError
      user = newUser
    } else {
      await supabase
        .from('profiles')
        .update({ phone_verified_at: new Date().toISOString() })
        .eq('id', user.id)
    }

    // Generate deterministic password and sign in to get a session
    const deterministicPassword = crypto
      .createHmac('sha256', process.env.SUPABASE_SERVICE_ROLE_KEY || 'fallback')
      .update(phone)
      .digest('hex')

    await supabase.auth.admin.updateUserById(user.id, { password: deterministicPassword })

    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
      email: `${phone.replace(/\D/g, '')}@phone.yobbu.app`,
      password: deterministicPassword,
    })

    if (sessionError) throw sessionError

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
    console.error('Verify OTP error:', err.message)
    return res.status(500).json({ error: 'Verification failed: ' + err.message })
  }
}
