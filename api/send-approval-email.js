import nodemailer from 'nodemailer'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { to, name, route, date } = req.body
  if (!to) return res.status(400).json({ error: 'Missing email' })

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })

  try {
    await transporter.sendMail({
      from: `Yobbu <${process.env.GMAIL_USER}>`,
      to,
      subject: '✈️ Your listing is live on Yobbu!',
      html: `
        <div style="font-family:'DM Sans',Arial,sans-serif;max-width:560px;margin:0 auto;background:#FDFBF7;border-radius:16px;overflow:hidden;">
          <div style="background:#1A1710;padding:28px 32px;text-align:center;">
            <div style="font-size:28px;font-weight:800;color:#fff;letter-spacing:-.5px;">
              Yob<span style="color:#C8891C">bu</span>
            </div>
          </div>
          <div style="padding:36px 32px;">
            <div style="font-size:40px;text-align:center;margin-bottom:16px;">🎉</div>
            <h1 style="font-size:24px;color:#1A1710;margin:0 0 8px;text-align:center;">
              Your listing is live!
            </h1>
            <p style="font-size:15px;color:#8A8070;text-align:center;line-height:1.6;margin:0 0 28px;">
              Hi <strong style="color:#1A1710">${name}</strong>, your trip has been approved by the Yobbu team and is now visible to senders.
            </p>
            <div style="background:#fff;border:1px solid rgba(0,0,0,.06);border-radius:12px;padding:20px;margin-bottom:24px;">
              <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
                <span style="font-size:12px;color:#8A8070;text-transform:uppercase;letter-spacing:.08em;">Route</span>
                <span style="font-size:14px;font-weight:600;color:#1A1710;">${route}</span>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span style="font-size:12px;color:#8A8070;text-transform:uppercase;letter-spacing:.08em;">Date</span>
                <span style="font-size:14px;font-weight:600;color:#1A1710;">${date}</span>
              </div>
            </div>
            <div style="background:#F0FAF4;border:1px solid #C8E6D4;border-radius:10px;padding:14px 16px;margin-bottom:24px;font-size:13px;color:#1A5C38;">
              🛡 Senders can now find and contact you directly on WhatsApp.
            </div>
            <a href="https://yobbu.co" style="display:block;text-align:center;background:#C8891C;color:#fff;text-decoration:none;padding:14px;border-radius:12px;font-weight:600;font-size:15px;">
              View your listing →
            </a>
          </div>
          <div style="padding:16px 32px;border-top:1px solid rgba(0,0,0,.06);text-align:center;font-size:11px;color:#B0A090;">
            © 2026 Yobbu · <a href="https://yobbu.co" style="color:#C8891C;text-decoration:none;">yobbu.co</a>
          </div>
        </div>
      `,
    })

    return res.json({ success: true })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
