import nodemailer from 'nodemailer'

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://yobbu.vercel.app,https://yobbu.com,http://localhost:5173').split(',')

function sanitize(str) {
  if (typeof str !== 'string') return ''
  return str.replace(/[<>&"'`]/g, c => ({ '<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;', "'":'&#x27;', '`':'&#x60;' }[c]))
}

export default async function handler(req, res) {
  const origin = req.headers.origin || ''
  if (ALLOWED_ORIGINS.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Vary', 'Origin')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  // Require admin secret — blocks anyone who isn't the admin panel
  const adminSecret = req.headers['x-admin-secret']
  if (!adminSecret || adminSecret !== process.env.ADMIN_API_SECRET) {
    console.warn('[Email] Unauthorized approval email attempt')
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { to, name, route, date } = req.body
  if (!to || typeof to !== 'string' || !to.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' })
  }

  const safeName  = sanitize(name  || 'Traveler')
  const safeRoute = sanitize(route || '—')
  const safeDate  = sanitize(date  || '—')

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  })

  try {
    await transporter.sendMail({
      from: `Yobbu <${process.env.GMAIL_USER}>`,
      to,
      subject: 'Your listing is live on Yobbu!',
      html: `
        <div style="font-family:'DM Sans',Arial,sans-serif;max-width:560px;margin:0 auto;background:#FDFBF7;border-radius:16px;overflow:hidden;">
          <div style="background:#1A1710;padding:28px 32px;text-align:center;">
            <div style="font-size:28px;font-weight:800;color:#fff;letter-spacing:-.5px;">Yob<span style="color:#C8891C">bu</span></div>
          </div>
          <div style="padding:36px 32px;">
            <h1 style="font-size:24px;color:#1A1710;margin:0 0 8px;text-align:center;">Your listing is live!</h1>
            <p style="font-size:15px;color:#8A8070;text-align:center;line-height:1.6;margin:0 0 28px;">
              Hi <strong style="color:#1A1710">${safeName}</strong>, your trip has been approved and is now visible to senders.
            </p>
            <div style="background:#fff;border:1px solid rgba(0,0,0,.06);border-radius:12px;padding:20px;margin-bottom:24px;">
              <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
                <span style="font-size:12px;color:#8A8070;text-transform:uppercase;letter-spacing:.08em;">Route</span>
                <span style="font-size:14px;font-weight:600;color:#1A1710;">${safeRoute}</span>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span style="font-size:12px;color:#8A8070;text-transform:uppercase;letter-spacing:.08em;">Date</span>
                <span style="font-size:14px;font-weight:600;color:#1A1710;">${safeDate}</span>
              </div>
            </div>
            <div style="background:#F0FAF4;border:1px solid #C8E6D4;border-radius:10px;padding:14px 16px;margin-bottom:24px;font-size:13px;color:#1A5C38;">
              Senders can now find and contact you directly on WhatsApp.
            </div>
            <a href="https://yobbu.co" style="display:block;text-align:center;background:#C8891C;color:#fff;text-decoration:none;padding:14px;border-radius:12px;font-weight:600;font-size:15px;">View your listing</a>
          </div>
          <div style="padding:16px 32px;border-top:1px solid rgba(0,0,0,.06);text-align:center;font-size:11px;color:#B0A090;">
            &copy; 2026 Yobbu &middot; <a href="https://yobbu.co" style="color:#C8891C;text-decoration:none;">yobbu.co</a>
          </div>
        </div>
      `,
    })
    return res.json({ success: true })
  } catch (err) {
    console.error('[Email] Approval send error:', err.message)
    return res.status(500).json({ error: 'Failed to send email' })
  }
}
