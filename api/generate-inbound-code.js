import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId } = req.body

  if (!userId) {
    return res.status(400).json({ error: 'User ID required' })
  }

  try {
    // Generate a unique 6-digit code based on user ID + timestamp
    const timestamp = Date.now()
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Store the code with 10-minute expiry
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    
    const { error } = await supabase
      .from('profiles')
      .update({
        whatsapp_inbound_code: code,
        whatsapp_inbound_expires_at: expiresAt,
        whatsapp_inbound_attempts: 0,
      })
      .eq('id', userId)

    if (error) {
      return res.status(500).json({ error: 'Failed to generate code' })
    }

    // Return the code and instructions
    res.status(200).json({
      code,
      expiresAt,
      instructions: {
        en: `Send this code to our WhatsApp: ${code}`,
        fr: `Envoyez ce code à notre WhatsApp : ${code}`,
      },
      // Your business WhatsApp number (display only, not for direct API calls)
      businessNumber: process.env.WHATSAPP_BUSINESS_NUMBER || '+1 (555) 123-4567',
    })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}
