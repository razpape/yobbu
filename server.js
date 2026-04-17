import express from 'express'
import { readdir } from 'fs/promises'
import { resolve, join } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { config } from 'dotenv'
import rateLimit from 'express-rate-limit'

config() // Load .env

const app = express()

// Security middleware
app.disable('x-powered-by')
app.use(express.json({ limit: '10kb' }))

// HTTPS enforcement in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(`https://${req.header('host')}${req.url}`)
    }
    next()
  })
}

// Rate limiting: 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
})
app.use('/api/', limiter)

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'")
  next()
})

// Request timeout
app.use((req, res, next) => {
  req.setTimeout(30000)
  res.setTimeout(30000)
  next()
})

// Auto-load all /api handlers
const apiDir = resolve('api')
const files = await readdir(apiDir)

for (const file of files) {
  if (!file.endsWith('.js')) continue
  const route = '/api/' + file.replace('.js', '')
  const filePath = pathToFileURL(join(apiDir, file)).href
  try {
    const mod = await import(filePath)
    const handler = mod.default
    app.all(route, (req, res) => handler(req, res))
    console.log(`  Loaded: ${route}`)
  } catch (err) {
    console.warn(`  Skipped ${route}: ${err.message}`)
  }
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Error handler (generic responses to prevent information leakage)
app.use((err, req, res, next) => {
  console.error('[Server] Unhandled error:', err.message)
  res.status(500).json({ error: 'Internal server error' })
})

const PORT = process.env.API_PORT || 3001
const server = app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`)
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use.\nClose all terminals, open a fresh one, and run: npm run dev\n`)
  } else {
    console.error('Server error:', err.message)
  }
  process.exit(1)
})
