import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

// Manual verification - user confirms they sent the code
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

  const { userId } = req.body

  if (!userId) {
    return res.status(400).json({ error: 'User ID required' })
  }

  try {
    // Get the user's current code
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('whatsapp_inbound_code, whatsapp_inbound_expires_at, whatsapp_verified')
      .eq('id', userId)
      .single()

    if (fetchError || !profile) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Already verified
    if (profile.whatsapp_verified) {
      return res.status(200).json({ 
        status: 'already_verified',
        message: 'WhatsApp already verified'
      })
    }

    // No code generated
    if (!profile.whatsapp_inbound_code) {
      return res.status(400).json({ 
        error: 'No verification code found',
        details: 'Please generate a code first'
      })
    }

    // Check if code expired
    if (new Date(profile.whatsapp_inbound_expires_at) < new Date()) {
      return res.status(400).json({ 
        error: 'Code expired',
        details: 'Please generate a new code'
      })
    }

    // Mark as verified (manual verification - we trust the user sent it)
    // In production with webhook, this would be done automatically
    const now = new Date().toISOString()
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        whatsapp_verified: true,
        whatsapp_verified_at: now,
        whatsapp_verified_method: 'manual_inbound', // Track that this was manual
        whatsapp_inbound_code: null,
        whatsapp_inbound_expires_at: null,
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Update error:', updateError)
      return res.status(500).json({ error: 'Failed to verify' })
    }

    res.status(200).json({
      status: 'success',
      message: 'WhatsApp verified successfully',
    })

  } catch (err) {
    console.error('Server error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}
