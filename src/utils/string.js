export function deriveInitials(name) {
  if (!name) return 'GP'
  const initials = name
    .split(' ')
    .map(w => w[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2)
  return initials || 'GP'
}

export function sanitizePhone(phone) {
  return phone.replace(/\D/g, '')
}

export function formatPrice(price) {
  if (!price) return '—'
  return `€${parseFloat(price).toFixed(2)}`
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function daysUntil(dateStr) {
  if (!dateStr) return null
  const now = new Date()
  const date = new Date(dateStr)
  const days = Math.ceil((date - now) / (1000 * 60 * 60 * 24))
  return days > 0 ? days : null
}
