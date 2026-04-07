import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const sha256 = (str) => crypto.createHash('sha256').update(str).digest('hex')

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { userId, otp } = req.body
  if (!userId || !otp) return res.status(400).json({ error: 'Missing userId or otp' })

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('whatsapp_otp_hash, whatsapp_otp_expires_at, whatsapp_verified')
    .eq('id', userId)
    .single()

  if (error || !profile) return res.status(404).json({ error: 'User not found' })
  if (profile.whatsapp_verified) return res.status(400).json({ error: 'Already verified' })
  if (!profile.whatsapp_otp_hash) return res.status(400).json({ error: 'No pending verification. Please request a new code.' })

  // Check expiry
  if (!profile.whatsapp_otp_expires_at || new Date(profile.whatsapp_otp_expires_at) < new Date()) {
    return res.status(400).json({ error: 'Code has expired. Please request a new one.', expired: true })
  }

  // Verify
  const inputHash = sha256(otp.toString().trim())
  if (inputHash !== profile.whatsapp_otp_hash) {
    return res.status(400).json({ error: 'Incorrect code. Please try again.', invalid: true })
  }

  // Mark verified and clear OTP fields
  const { error: updateErr } = await supabaseAdmin
    .from('profiles')
    .update({
      whatsapp_verified:          true,
      whatsapp_verified_at:       new Date().toISOString(),
      whatsapp_verified_by_admin: false,
      whatsapp_otp_hash:          null,
      whatsapp_otp_expires_at:    null,
      verification_revoked_at:    null,
      verification_revoked_reason: null,
    })
    .eq('id', userId)

  if (updateErr) return res.status(500).json({ error: 'Failed to confirm verification' })

  return res.json({ success: true })
}
