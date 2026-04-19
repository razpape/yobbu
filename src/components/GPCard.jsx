import { useState, useEffect } from 'react'
import ContactModal from './ContactModal'

function WhatsAppIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

function formatPrice(raw) {
  if (!raw) return null
  const num = parseFloat(String(raw))
  return !isNaN(num) ? `$${num}` : String(raw).replace('/kg/kg', '/kg')
}

function formatDate(str, locale) {
  if (!str) return null
  const d = new Date(str)
  return isNaN(d) ? str : d.toLocaleDateString(locale, { day: 'numeric', month: 'short' })
}

function formatPostDate(str, locale) {
  if (!str) return null
  const d = new Date(str)
  return isNaN(d) ? str : d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })
}

function daysUntil(str) {
  if (!str) return null
  const diff = Math.ceil((new Date(str) - new Date().setHours(0,0,0,0)) / 86400000)
  return diff < 0 ? null : diff
}

export default function GPCard({ gp, lang, user, onContactClick, onViewProfile }) {
  const [showModal, setShowModal] = useState(false)
  const [avatarErr, setAvatarErr] = useState(false)
  const [countdown, setCountdown] = useState(null)

  const isFr      = lang === 'fr'
  const locale    = isFr ? 'fr-FR' : 'en-US'
  const from      = gp.from_city || gp.from || '—'
  const to        = gp.to_city   || gp.to   || '—'
  const initials  = (gp.name || 'GP').split(' ').map(w => w[0]).filter(Boolean).join('').toUpperCase().slice(0, 2) || 'GP'
  const price     = formatPrice(gp.price)
  const accent    = gp.color || '#10B981'
  const verified  = gp.phone_verified || gp.verified?.phone
  const days      = daysUntil(gp.date)
  const isFull    = gp.availability_status === 'full'
  const isUnavail = gp.availability_status === 'unavailable'
  const disabled  = isFull || isUnavail
  const departDate = formatDate(gp.date, locale)
  const badge     = gp.badge !== undefined ? gp.badge : true // TEST: change to gp.badge when done

  const urgency = (() => {
    if (days === 0) return { label: isFr ? "Aujourd'hui" : 'Today',       c: '#059669' }
    if (days === 1) return { label: isFr ? 'Demain'      : 'Tomorrow',    c: '#10B981' }
    if (days <= 6)  return { label: isFr ? 'Cette sem.'  : 'This week',   c: '#2563EB' }
    if (days <= 30) return { label: isFr ? 'Ce mois'     : 'This month',  c: '#7C3AED' }
    return { label: isFr ? 'Prochain mois' : 'Next month', c: '#6366F1' }
  })()

  useEffect(() => {
    if (!gp.date) return
    const updateCountdown = () => {
      const now = new Date()
      const departure = new Date(gp.date)
      const diffMs = departure - now
      if (diffMs < 0) return
      const diffHours = Math.floor(diffMs / 3600000)
      if (diffHours >= 24) {
        setCountdown(null)
        return
      }
      const mins = Math.floor((diffMs % 3600000) / 60000)
      setCountdown({ hours: diffHours, mins })
    }
    updateCountdown()
    const interval = setInterval(updateCountdown, 60000)
    return () => clearInterval(interval)
  }, [gp.date])

  const handleContact = (e) => {
    e.stopPropagation()
    if (!user) { onContactClick(); return }
    setShowModal(true)
  }

  const sendWhatsApp = (msg) => {
    const phone = gp.phone?.replace(/\D/g, '')
    if (phone) window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank')
    setShowModal(false)
  }

  return (
    <>
      {showModal && (
        <ContactModal gp={{ ...gp, price }} lang={lang} onClose={() => setShowModal(false)} onSend={sendWhatsApp} />
      )}

      <div
        onClick={() => !disabled && onViewProfile?.(gp)}
        style={{
          background: '#fff',
          border: '1px solid #E8E4DE',
          borderRadius: 16,
          padding: '16px 14px',
          fontFamily: "'DM Sans', sans-serif",
          cursor: disabled ? 'default' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          transition: 'all .2s',
        }}
        onMouseEnter={e => !disabled && (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.08)')}
        onMouseLeave={e => !disabled && (e.currentTarget.style.boxShadow = 'none')}
      >
        {/* Header: Avatar + Name + Rating + Tag */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: `linear-gradient(135deg, ${accent}22, ${accent}08)`,
              border: `1.5px solid ${accent}25`,
              overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'DM Serif Display', serif",
              fontSize: 14, fontWeight: 700, color: accent,
            }}>
              {gp.avatar_url && !avatarErr
                ? <img src={gp.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setAvatarErr(true)} />
                : initials}
            </div>
            {verified && (
              <div style={{
                position: 'absolute', bottom: -2, right: -2,
                width: 18, height: 18, borderRadius: '50%',
                background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10,
              }}>
                ✓
              </div>
            )}
          </div>

          {/* Name + Rating */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1F2937', lineHeight: 1.3 }}>
              {gp.name || 'GP'}
            </div>
            {gp.avg_rating && (
              <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
                ★ {gp.avg_rating} • {gp.review_count || 0} {isFr ? 'voyages' : 'trips'}
              </div>
            )}
          </div>

          {/* Availability tag */}
          {departDate && (
            <div style={{
              background: countdown ? '#A85A3A' : urgency.c,
              color: '#fff',
              padding: '4px 10px',
              borderRadius: 12,
              fontSize: countdown ? 9 : 10,
              fontWeight: 700,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}>
              {countdown ? `${countdown.hours}h ${countdown.mins}m` : urgency.label}
            </div>
          )}
        </div>

        {/* Route: From → To */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, paddingLeft: 2 }}>
          <div style={{ textAlign: 'center', minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#1F2937', letterSpacing: '-.3px', fontFamily: "'DM Serif Display', serif" }}>
              {from}
            </div>
            {gp.pickup_area && <div style={{ fontSize: 9, color: '#9CA3AF', marginTop: 1 }}>{gp.pickup_area}</div>}
          </div>

          <div style={{ fontSize: 12, color: '#D4C4A8', flexShrink: 0 }}>→</div>

          <div style={{ textAlign: 'center', minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: accent, letterSpacing: '-.3px', fontFamily: "'DM Serif Display', serif" }}>
              {to}
            </div>
            {gp.dropoff_area && <div style={{ fontSize: 9, color: '#9CA3AF', marginTop: 1 }}>{gp.dropoff_area}</div>}
          </div>
        </div>

        {/* Info row: Departure + Price */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid #F0EDE8' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#B5AFA8', textTransform: 'uppercase', letterSpacing: '.05em' }}>
              {isFr ? 'Départ' : 'Depart'}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#1F2937', marginTop: 2 }}>
              {departDate}
            </div>
          </div>
          {price && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#B5AFA8', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                {isFr ? 'Tarif' : 'Price'}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#10B981', marginTop: 2 }}>
                {price}<span style={{ fontSize: 10, color: '#6B7280' }}>/kg</span>
              </div>
            </div>
          )}
        </div>

        {/* CTA Button */}
        {disabled ? (
          <div style={{ width: '100%', padding: '10px', textAlign: 'center', borderRadius: 10, fontSize: 12, fontWeight: 700, background: isFull ? '#EDD8C4' : '#F3F4F6', color: isFull ? '#8B4A2E' : '#6B7280' }}>
            {isFull ? (isFr ? 'Complet' : 'Full') : (isFr ? 'Indisponible' : 'Unavailable')}
          </div>
        ) : (
          <button
            onClick={handleContact}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '10px 14px', borderRadius: 10, border: 'none',
              background: '#25D366', color: '#fff',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'opacity .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <WhatsAppIcon size={14} />
            {isFr ? 'WhatsApp' : 'WhatsApp'}
          </button>
        )}
      </div>
    </>
  )
}
