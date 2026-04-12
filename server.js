import express from 'express'
import { readdir } from 'fs/promises'
import { resolve, join } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { config } from 'dotenv'

config() // Load .env

const app = express()
app.use(express.json())

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
