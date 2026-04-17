import { supabase, ALLOWED_ORIGINS, setCors, verifyAdminSession } from './admin-auth.js'

export default async function handler(req, res) {
  setCors(req, res)

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const auth = verifyAdminSession(req.headers.authorization)
  if (!auth.valid) {
    console.warn('[Admin Trip Update] Unauthorized attempt:', req.body?.trip_id)
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { trip_id, field, value } = req.body

  // Validate inputs
  if (!trip_id || typeof trip_id !== 'string') {
    return res.status(400).json({ error: 'Valid trip_id required' })
  }

  const allowedFields = ['approved', 'featured', 'suspended', 'phone_verified', 'id_verified', 'community_verified']
  if (!allowedFields.includes(field)) {
    console.warn('[Admin Trip Update] Invalid field attempt:', field, 'by', auth.user.email)
    return res.status(400).json({ error: 'Invalid field' })
  }

  if (typeof value !== 'boolean') {
    return res.status(400).json({ error: 'Value must be boolean' })
  }

  try {
    // Update trip
    const { error: updateError } = await supabase
      .from('trips')
      .update({ [field]: value })
      .eq('id', trip_id)

    if (updateError) throw updateError

    // Log action (server-side, with real admin context)
    await supabase.from('admin_audit_log').insert({
      admin_email: auth.user.email,
      admin_id: auth.user.id,
      action: `update_trip_${field}`,
      target_trip_id: trip_id,
      new_value: value,
      timestamp: new Date().toISOString(),
    }).catch(err => console.error('[Admin] Audit log error:', err.message))

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('[Admin Trip Update] Error:', err.message)
    return res.status(500).json({ error: 'Update failed' })
  }
}
