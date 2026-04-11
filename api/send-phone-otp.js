import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID
const twilioAuthToken  = process.env.TWILIO_AUTH_TOKEN
const twilioFromNumber = process.env.TWILIO_PHONE_NUMBER

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
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    // Clear old codes for this phone
    await supabase.from('otp_codes').delete().eq('phone', phone)

    // Store new code in Supabase
    const { error: insertError } = await supabase.from('otp_codes').insert({ phone, code, expires_at: expiresAt })
    if (insertError) throw insertError

    // Send SMS via Twilio Programmable Messaging
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: phone,
          From: twilioFromNumber,
          Body: `Your Yobbu verification code is: ${code}. Valid for 10 minutes.`,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('Twilio SMS error:', data)
      await supabase.from('otp_codes').delete().eq('phone', phone)
      return res.status(400).json({ error: data.message || 'Failed to send code' })
    }

    console.log(`[send] OTP sent to ${phone}`)

    const { data: existingUser } = await supabase
      .from('profiles').select('id').eq('phone', phone).single()

    return res.status(200).json({
      success: true,
      message: 'Verification code sent',
      isNewUser: !existingUser,
    })

  } catch (err) {
    console.error('Send OTP error:', err.message)
    return res.status(500).json({ error: 'Failed to send code' })
  }
}
