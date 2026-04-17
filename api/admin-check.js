import { supabase, ALLOWED_ORIGINS, setCors, verifyAdminSession } from './admin-auth.js'

export default async function handler(req, res) {
  setCors(req, res)

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const auth = verifyAdminSession(req.headers.authorization)

  if (!auth.valid) {
    return res.status(401).json({ valid: false })
  }

  return res.status(200).json({ valid: true, email: auth.user.email })
}
