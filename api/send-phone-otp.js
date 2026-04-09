import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

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

    // TODO: Send actual SMS via Twilio or other provider
    // For now, return OTP in development mode
    console.log(`OTP for ${phone}: ${otp}`)

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', phone)
      .single()

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      // Only return OTP in development!
      ...(process.env.NODE_ENV === 'development' && { otp }),
      isNewUser: !existingUser,
    })

  } catch (err) {
    console.error('Send OTP error:', err)
    res.status(500).json({ error: 'Failed to send OTP' })
  }
}
