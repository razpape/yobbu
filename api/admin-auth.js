import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const ALLOWED_ORIGINS = process.env.NODE_ENV === 'production'
  ? (process.env.ALLOWED_ORIGINS || 'https://yobbu.vercel.app,https://yobbu.com').split(',')
  : (process.env.ALLOWED_ORIGINS || 'https://yobbu.vercel.app,https://yobbu.com,http://localhost:5173').split(',')
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)

function setCors(req, res) {
  const origin = req.headers.origin || ''
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Vary', 'Origin')
}

async function verifyAdminSession(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'Missing or invalid authorization' }
  }

  const token = authHeader.slice(7)

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return { valid: false, error: 'Invalid session' }
    }

    if (!user.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      return { valid: false, error: 'User is not an admin', user }
    }

    return { valid: true, user }
  } catch (err) {
    console.error('[Admin Auth] Token verification error:', err.message)
    return { valid: false, error: 'Session verification failed' }
  }
}

export { supabase, ALLOWED_ORIGINS, setCors, verifyAdminSession }
