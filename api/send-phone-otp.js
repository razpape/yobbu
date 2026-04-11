import { createClient } from '@supabase/supabase-js'

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

  const { phone } = req.body

  if (!phone || !phone.match(/^\+?[1-9]\d{1,14}$/)) {
    return res.status(400).json({ error: 'Valid phone number required' })
  }

  try {
    console.log(`[send] phone="${phone}"`)

    // Send OTP via Twilio Verify
    const response = await fetch(
      `https://verify.twilio.com/v2/Services/${verifyServiceSid}/Verifications`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: phone, Channel: 'sms', Ttl: '1800' }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('Twilio Verify error:', data)
      return res.status(400).json({ error: data.message || 'Failed to send code' })
    }

    console.log(`Verify OTP sent to ${phone}, status: ${data.status}, sid: ${data.sid}`)

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', phone)
      .single()

    res.status(200).json({
      success: true,
      message: 'Verification code sent',
      isNewUser: !existingUser,
      verificationSid: data.sid,
    })

  } catch (err) {
    console.error('Send OTP error:', err)
    res.status(500).json({ error: 'Failed to send code' })
  }
}
