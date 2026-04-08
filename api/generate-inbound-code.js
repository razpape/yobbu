import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required env vars: VITE_SUPABASE_URL/SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  // Enable CORS
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

  // Check env vars
  if (!supabaseUrl || !supabaseKey) {
    console.error('Server configuration error: Missing Supabase credentials')
    return res.status(500).json({ 
      error: 'Server configuration error',
      details: 'Missing database credentials'
    })
  }

  try {
    // Generate a unique 6-digit code
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
      console.error('Supabase error:', error)
      // Check if it's a column not found error
      if (error.message?.includes('column') || error.message?.includes('whatsapp_inbound_code')) {
        return res.status(500).json({ 
          error: 'Database setup required',
          details: 'Please run the SQL migration to add whatsapp_inbound_code column'
        })
      }
      return res.status(500).json({ 
        error: 'Failed to generate code',
        details: error.message 
      })
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
    console.error('Server error:', err)
    res.status(500).json({ 
      error: 'Server error',
      details: err.message || 'Unknown error'
    })
  }
}
