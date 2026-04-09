import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// OTP storage now in Supabase table 'otp_codes'
// Keeping Map for fallback during transition
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

  const { phone, code } = req.body

  if (!phone || !code) {
    return res.status(400).json({ error: 'Phone and code required' })
  }

  try {
    console.log('Verify OTP request:', { phone, code, storeSize: otpStore.size })
    
    // Try to get OTP from Supabase first (serverless compatible)
    let stored = null
    let fromDb = false
    
    const { data: dbOtp, error: dbError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('phone', phone)
      .single()
    
    if (!dbError && dbOtp) {
      stored = {
        code: dbOtp.code,
        expiresAt: new Date(dbOtp.expires_at).getTime(),
        attempts: dbOtp.attempts || 0
      }
      fromDb = true
      console.log('Found OTP in database')
    } else {
      // Fallback to memory store
      const key = `otp:${phone}`
      stored = otpStore.get(key)
      console.log('Stored OTP from memory:', stored ? 'found' : 'NOT FOUND')
    }

    // Check if OTP exists and not expired
    if (!stored) {
      console.log('OTP not found for phone:', phone)
      return res.status(400).json({ error: 'Code expired. Please request a new one.' })
    }

    if (stored.expiresAt < Date.now()) {
      if (!fromDb) {
        const key = `otp:${phone}`
        otpStore.delete(key)
      }
      return res.status(400).json({ error: 'Code expired. Please request a new one.' })
    }

    // Check attempts
    if (stored.attempts >= 5) {
      if (!fromDb) {
        const key = `otp:${phone}`
        otpStore.delete(key)
      }
      return res.status(400).json({ error: 'Too many attempts. Please request a new code.' })
    }

    // Verify code
    if (stored.code !== code) {
      stored.attempts++
      // Update attempts in database if using DB
      if (fromDb) {
        await supabase.from('otp_codes').update({ attempts: stored.attempts }).eq('phone', phone)
      } else {
        const key = `otp:${phone}`
        otpStore.set(key, stored)
      }
      const remaining = 5 - stored.attempts
      return res.status(400).json({ 
        error: `Invalid code. ${remaining} attempts remaining.` 
      })
    }

    // OTP verified - delete it from memory/DB
    if (fromDb) {
      await supabase.from('otp_codes').delete().eq('phone', phone)
    } else {
      const key = `otp:${phone}`
      otpStore.delete(key)
    }

    // Check if user exists
    let { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone', phone)
      .single()

    let isNewUser = false

    if (!user) {
      // Create new user
      isNewUser = true
      
      // First create auth user
      const { data: authUser, error: authError } = await supabase.auth.signUp({
        email: `${phone.replace(/\D/g, '')}@phone.yobbu.app`,
        password: crypto.randomUUID(), // Random password, they'll use PIN
      })

      if (authError) {
        throw authError
      }

      // Create profile
      const { data: newUser, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.user.id,
          phone: phone,
          phone_verified_at: new Date().toISOString(),
          verification_tier: 1,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (createError) {
        throw createError
      }

      user = newUser
    } else {
      // Update phone verified timestamp
      await supabase
        .from('profiles')
        .update({ phone_verified_at: new Date().toISOString() })
        .eq('id', user.id)
    }

    // Check if user has PIN set
    const hasPin = !!user.pin_hash

    // Create session
    const { data: session, error: sessionError } = await supabase.auth.signInWithPassword({
      email: user.email || `${phone.replace(/\D/g, '')}@phone.yobbu.app`,
      password: user.phone, // This won't work, need different approach
    })

    // Return user info
    res.status(200).json({
      success: true,
      message: 'Phone verified successfully',
      user: {
        id: user.id,
        phone: user.phone,
        firstName: user.first_name,
        lastName: user.last_name,
        verificationTier: user.verification_tier,
      },
      isNewUser,
      hasPin,
    })

  } catch (err) {
    console.error('Verify OTP error:', err.message, err.stack)
    res.status(500).json({ error: 'Verification failed: ' + err.message })
  }
}
