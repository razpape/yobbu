import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { phone, code, verificationSid } = req.body

  if (!phone || !code) {
    return res.status(400).json({ error: 'Phone and code required' })
  }

  try {
    // TEMPORARY: bypass code for development
    const DEV_BYPASS_CODE = '000000'
    const isBypass = code === DEV_BYPASS_CODE

    if (!isBypass) {
      // Verify using SID if available (avoids phone format mismatch), fallback to phone
      const checkParams = verificationSid
        ? { VerificationSid: verificationSid, Code: code }
        : { To: phone, Code: code }

      const response = await fetch(
        `https://verify.twilio.com/v2/Services/${verifyServiceSid}/VerificationChecks`,
        {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams(checkParams),
        }
      )

      const data = await response.json()

      if (!response.ok || data.status !== 'approved') {
        console.error('Verify check failed:', JSON.stringify(data))
        const reason = data.status === 'expired' ? 'Code expired, please request a new one'
          : data.status === 'max_attempts_reached' ? 'Too many attempts, please request a new code'
          : data.status === 'canceled' ? 'Code was canceled, please request a new one'
          : data.message || 'Invalid or expired code'
        return res.status(400).json({ error: reason })
      }
    }

    console.log(`Phone verified: ${phone}${isBypass ? ' (dev bypass)' : ''}`)

    // Find or create user
    let { data: user } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone', phone)
      .single()

    let isNewUser = false

    if (!user) {
      isNewUser = true

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: `${phone.replace(/\D/g, '')}@phone.yobbu.app`,
        password: crypto.randomUUID(),
        email_confirm: true,
      })

      if (authError) throw authError

      // Create profile
      const { data: newUser, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          phone,
          phone_verified_at: new Date().toISOString(),
          verification_tier: 1,
          created_at: new Date().toISOString(),
        })
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

    // Set a deterministic password so we can sign in and get a real session
    const deterministicPassword = crypto
      .createHmac('sha256', process.env.SUPABASE_SERVICE_ROLE_KEY || 'fallback')
      .update(phone)
      .digest('hex')

    await supabase.auth.admin.updateUserById(user.id, { password: deterministicPassword })

    // Sign in to get a proper session
    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
      email: `${phone.replace(/\D/g, '')}@phone.yobbu.app`,
      password: deterministicPassword,
    })

    if (sessionError) throw sessionError

    res.status(200).json({
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
    res.status(500).json({ error: 'Verification failed: ' + err.message })
  }
}
