import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { userId, pin } = req.body

  if (!userId || !pin) {
    return res.status(400).json({ error: 'User ID and PIN required' })
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('pin_hash')
      .eq('id', userId)
      .single()

    if (error || !profile) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (!profile.pin_hash) {
      return res.status(400).json({ error: 'No PIN set for this account' })
    }

    const isValid = await bcrypt.compare(String(pin), profile.pin_hash)

    if (!isValid) {
      console.log(`[PIN] Wrong PIN for user ${userId}`)
      return res.status(400).json({ error: 'Incorrect PIN' })
    }

    console.log(`[PIN] Verified for user ${userId}`)
    return res.status(200).json({ success: true })

  } catch (err) {
    console.error('[PIN] Error:', err.message)
    return res.status(500).json({ error: 'PIN verification failed' })
  }
}
