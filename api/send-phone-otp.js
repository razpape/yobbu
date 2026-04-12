import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID
const twilioAuthToken  = process.env.TWILIO_AUTH_TOKEN
const twilioVerifySid  = process.env.TWILIO_VERIFY_SERVICE_SID

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { phone } = req.body

  if (!phone || !phone.match(/^\+[1-9]\d{1,14}$/)) {
    return res.status(400).json({ error: 'Valid phone number required' })
  }

  try {
    // Enforce 60-second cooldown between sends
    const { data: recent } = await supabase
      .from('otp_codes')
      .select('expires_at')
      .eq('phone', phone)
      .maybeSingle()

    if (recent) {
      const sentAt = new Date(recent.expires_at).getTime() - 10 * 60 * 1000
      const secondsSinceSent = Math.floor((Date.now() - sentAt) / 1000)
      if (secondsSinceSent < 60) {
        return res.status(429).json({
          error: `Please wait ${60 - secondsSinceSent} seconds before requesting a new code.`
        })
      }
    }

    // Generate 6-digit code and store it
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    await supabase.from('otp_codes').delete().eq('phone', phone)
    const { error: insertError } = await supabase
      .from('otp_codes')
      .insert({ phone, code, expires_at: expiresAt })
    if (insertError) throw insertError

    // DEV MODE: skip SMS and print code to terminal
    if (process.env.DEV_SKIP_SMS === 'true') {
      console.log(`\n==============================`)
      console.log(`  OTP for ${phone}: ${code}`)
      console.log(`==============================\n`)
      const { data: existingUser } = await supabase
        .from('profiles').select('id').eq('phone', phone).maybeSingle()
      return res.status(200).json({ success: true, message: 'Verification code sent', isNewUser: !existingUser })
    }

    // Send via Twilio Verify with CustomCode (A2P-compliant delivery via short codes)
    const response = await fetch(
      `https://verify.twilio.com/v2/Services/${twilioVerifySid}/Verifications`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To:         phone,
          Channel:    'sms',
          CustomCode: code,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('[OTP] Twilio error:', data.message, '| code:', data.code)
      await supabase.from('otp_codes').delete().eq('phone', phone)

      if (data.code === 20429) {
        return res.status(429).json({
          error: 'Twilio has temporarily rate-limited this number. Please try a different number or wait 24 hours.'
        })
      }
      return res.status(400).json({ error: data.message || 'Failed to send code' })
    }

    console.log(`[OTP] Sent to ${phone} | SID: ${data.sid}`)

    const { data: existingUser } = await supabase
      .from('profiles').select('id').eq('phone', phone).maybeSingle()

    return res.status(200).json({
      success: true,
      message: 'Verification code sent',
      isNewUser: !existingUser,
    })

  } catch (err) {
    console.error('[OTP] Error:', err.message)
    return res.status(500).json({ error: 'Failed to send code' })
  }
}
