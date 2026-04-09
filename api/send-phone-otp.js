import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// Twilio credentials
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER

// Simple in-memory OTP store (use Redis in production)
const otpStore = new Map()

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { phone } = req.body

  if (!phone || !phone.match(/^\+?[1-9]\d{1,14}$/)) {
    return res.status(400).json({ error: 'Valid phone number required' })
  }

  try {
    // Rate limiting - check last send time
    const key = `otp:${phone}`
    const lastSent = otpStore.get(`${key}:time`)
    if (lastSent && Date.now() - lastSent < 60000) {
      return res.status(429).json({ 
        error: 'Please wait 1 minute before requesting another code',
        retryAfter: Math.ceil((60000 - (Date.now() - lastSent)) / 1000)
      })
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Store OTP with 10-minute expiry
    const expiresAt = Date.now() + 10 * 60 * 1000
    otpStore.set(key, { code: otp, expiresAt, attempts: 0 })
    otpStore.set(`${key}:time`, Date.now())

    // Clean up expired entries (simple cleanup)
    for (const [k, v] of otpStore.entries()) {
      if (v.expiresAt && v.expiresAt < Date.now()) {
        otpStore.delete(k)
      }
    }

    // Send SMS via Twilio if credentials exist
    console.log('Twilio check:', { 
      hasSid: !!twilioAccountSid, 
      hasToken: !!twilioAuthToken, 
      hasNumber: !!twilioPhoneNumber,
      sidPrefix: twilioAccountSid?.substring(0, 10) 
    })
    
    if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
      try {
        console.log('Sending SMS to:', phone)
        const twilioResponse = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              'Authorization': 'Basic ' + Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64'),
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              From: twilioPhoneNumber,
              To: phone,
              Body: `Your Yobbu verification code: ${otp}. Valid for 10 minutes.`,
            }),
          }
        )
        
        const twilioData = await twilioResponse.text()
        console.log('Twilio response:', twilioResponse.status, twilioData)
        
        if (!twilioResponse.ok) {
          console.error('Twilio error:', twilioData)
        }
      } catch (smsError) {
        console.error('SMS send failed:', smsError)
      }
    } else {
      console.log(`[DEV] OTP for ${phone}: ${otp}`)
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', phone)
      .single()

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      isNewUser: !existingUser,
      debugCode: otp, // DEBUG: Remove in production
    })

  } catch (err) {
    console.error('Send OTP error:', err)
    res.status(500).json({ error: 'Failed to send OTP' })
  }
}
