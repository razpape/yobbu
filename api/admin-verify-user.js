import { supabase, ALLOWED_ORIGINS, setCors, verifyAdminSession } from './admin-auth.js'

export default async function handler(req, res) {
  setCors(req, res)

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const auth = verifyAdminSession(req.headers.authorization)
  if (!auth.valid) {
    console.warn('[Admin Verify User] Unauthorized attempt')
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { user_id, action, notes, reason } = req.body

  if (!user_id || typeof user_id !== 'string') {
    return res.status(400).json({ error: 'Valid user_id required' })
  }

  if (!['verify', 'revoke', 'approve_photo', 'reject_photo'].includes(action)) {
    return res.status(400).json({ error: 'Invalid action' })
  }

  try {
    const now = new Date().toISOString()
    let updateData = {}

    if (action === 'verify') {
      if (!notes || typeof notes !== 'string') {
        return res.status(400).json({ error: 'Admin notes required for verification' })
      }
      updateData = {
        whatsapp_verified: true,
        whatsapp_verified_at: now,
        whatsapp_verified_by_admin: true,
        admin_verification_notes: notes.slice(0, 500),
        verification_revoked_at: null,
        verification_revoked_reason: null,
      }
    } else if (action === 'revoke') {
      if (!reason || typeof reason !== 'string' || !reason.trim()) {
        return res.status(400).json({ error: 'Revocation reason required' })
      }
      updateData = {
        whatsapp_verified: false,
        whatsapp_verified_at: null,
        verification_revoked_at: now,
        verification_revoked_reason: reason.slice(0, 500),
      }
    } else if (action === 'approve_photo') {
      updateData = {
        photo_verified: true,
        photo_pending: false,
      }
    } else if (action === 'reject_photo') {
      updateData = {
        photo_verified: false,
        photo_pending: false,
        avatar_url: null,
      }
    }

    // Update user profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user_id)

    if (updateError) throw updateError

    // Audit log
    await supabase.from('admin_audit_log').insert({
      admin_email: auth.user.email,
      admin_id: auth.user.id,
      action,
      target_user_id: user_id,
      notes: notes || reason || null,
      timestamp: now,
    }).catch(err => console.error('[Admin] Audit log error:', err.message))

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('[Admin Verify User] Error:', err.message)
    return res.status(500).json({ error: 'Operation failed' })
  }
}
