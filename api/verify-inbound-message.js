import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// Webhook handler for incoming WhatsApp messages
export default async function handler(req, res) {
  // Handle GET for webhook verification (required by some providers)
  if (req.method === 'GET') {
    const challenge = req.query['hub.challenge']
    if (challenge) {
      return res.status(200).send(challenge)
    }
    return res.status(200).json({ status: 'Webhook active' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Extract message data from webhook payload
    // Format varies by provider (Twilio, Meta, etc.)
    const payload = req.body
    
    // Twilio format
    const fromNumber = payload.From || payload.from || payload.sender
    const messageBody = payload.Body || payload.body || payload.message || payload.text
    
    if (!fromNumber || !messageBody) {
      return res.status(400).json({ error: 'Missing message data' })
    }

    // Normalize phone number
    const normalizedPhone = fromNumber.replace(/\D/g, '').replace(/^0/, '')
    const phoneHash = crypto.createHash('sha256').update(normalizedPhone).digest('hex')

    // Find user with matching inbound code
    const { data: profile, error: findError } = await supabase
      .from('profiles')
      .select('*')
      .eq('whatsapp_inbound_code', messageBody.trim())
      .gt('whatsapp_inbound_expires_at', new Date().toISOString())
      .single()

    if (findError || !profile) {
      // Code not found or expired - could send error message back
      return res.status(200).json({ 
        status: 'Code not found or expired',
        action: 'ignore'
      })
    }

    // Verify the phone number hash matches (optional extra security)
    // Store the verified number hash
    const now = new Date().toISOString()
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        whatsapp_verified: true,
        whatsapp_number: maskPhone(normalizedPhone),
        whatsapp_number_hash: phoneHash,
        whatsapp_verified_at: now,
        whatsapp_inbound_code: null,
        whatsapp_inbound_expires_at: null,
        whatsapp_inbound_verified_from: fromNumber,
      })
      .eq('id', profile.id)

    if (updateError) {
      return res.status(500).json({ error: 'Verification failed' })
    }

    // Success - user is now verified
    res.status(200).json({
      status: 'success',
      message: 'WhatsApp verified successfully',
      userId: profile.id,
    })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}

function maskPhone(phone) {
  if (phone.length < 8) return phone
  const visibleStart = phone.slice(0, 3)
  const visibleEnd = phone.slice(-3)
  const masked = phone.slice(3, -3).replace(/\d/g, '*')
  return `${visibleStart}${masked}${visibleEnd}`
}
