// Simple phone number validator for E.164 format
// Validates international phone numbers in +[country code][number] format

export function isValidPhone(phone) {
  if (typeof phone !== 'string') return false

  // E.164 format: +[1-9][0-9]{1,14}
  const e164Regex = /^\+[1-9]\d{1,14}$/

  if (!e164Regex.test(phone)) return false

  // Additional checks
  // Reject obviously fake numbers (all same digit, invalid length)
  const digits = phone.replace(/\D/g, '')

  // Must have at least 7 digits (excluding +)
  if (digits.length < 7) return false

  // Reject if all digits are the same (e.g., +1111111111)
  if (/^(\d)\1+$/.test(digits)) return false

  // Reject obviously invalid country codes
  const countryCode = phone.slice(1, 4) // +[1-3 digits]
  const invalidCountryCodes = ['000', '001', '999'] // Reserved/invalid codes
  if (invalidCountryCodes.includes(countryCode)) return false

  return true
}

export function sanitizePhone(phone) {
  if (typeof phone !== 'string') return ''
  return phone.replace(/[^\d+]/g, '') // Keep only digits and +
}

export function maskPhone(phone) {
  if (!phone || typeof phone !== 'string') return '****'
  // Show only last 4 digits: +XXX***XXXX
  return phone.slice(0, 4) + '*'.repeat(Math.max(0, phone.length - 8)) + phone.slice(-4)
}

export default {
  isValidPhone,
  sanitizePhone,
  maskPhone,
}
