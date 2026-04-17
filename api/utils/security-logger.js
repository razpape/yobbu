import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LOG_DIR = path.join(__dirname, '../../logs')
const LOG_FILE = path.join(LOG_DIR, 'security.log')

// Ensure logs directory exists
try {
  await fs.mkdir(LOG_DIR, { recursive: true })
} catch (err) {
  console.error('Failed to create logs directory:', err.message)
}

function timestamp() {
  return new Date().toISOString()
}

export async function logSecurityEvent(eventType, details = {}) {
  const logEntry = {
    timestamp: timestamp(),
    type: eventType,
    ...details,
  }

  const logLine = JSON.stringify(logEntry) + '\n'

  try {
    await fs.appendFile(LOG_FILE, logLine)
  } catch (err) {
    console.error('[SecurityLogger] Failed to write log:', err.message)
  }

  // Also log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[${eventType}]`, details)
  }
}

export async function logFailedAuth(reason, details = {}) {
  await logSecurityEvent('FAILED_AUTH', { reason, ...details })
}

export async function logUnauthorizedAccess(endpoint, details = {}) {
  await logSecurityEvent('UNAUTHORIZED_ACCESS', { endpoint, ...details })
}

export async function logRateLimitExceeded(ip, endpoint) {
  await logSecurityEvent('RATE_LIMIT_EXCEEDED', { ip, endpoint })
}

export async function logBruteForceAttempt(phone, attempts) {
  await logSecurityEvent('BRUTE_FORCE_ATTEMPT', { phone: hashPhone(phone), attempts })
}

function hashPhone(phone) {
  if (!phone) return 'unknown'
  return phone.slice(-4).padStart(phone.length, '*')
}

export default {
  logSecurityEvent,
  logFailedAuth,
  logUnauthorizedAccess,
  logRateLimitExceeded,
  logBruteForceAttempt,
}
