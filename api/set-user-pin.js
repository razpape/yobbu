import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

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

  const { userId, pin } = req.body

  if (!userId || !pin) {
    return res.status(400).json({ error: 'User ID and PIN required' })
  }

  if (!pin.match(/^\d{4}$/)) {
    return res.status(400).json({ error: 'PIN must be 4 digits' })
  }

  try {
    // Hash the PIN
    const pinHash = await bcrypt.hash(pin, 10)

    // Get device fingerprint (simple version)
    const deviceId = req.headers['user-agent'] || 'unknown'

    // Update user
    const { error } = await supabase
      .from('profiles')
      .update({
        pin_hash: pinHash,
        trusted_device_id: deviceId,
        trusted_device_bound_at: new Date().toISOString(),
        // Upgrade to tier 2 if they have email, otherwise stay tier 1
      })
      .eq('id', userId)

    if (error) {
      console.error('Update error:', error)
      throw error
    }

    res.status(200).json({
      success: true,
      message: 'PIN set successfully',
    })

  } catch (err) {
    console.error('Set PIN error:', err)
    res.status(500).json({ error: 'Failed to save PIN' })
  }
}
