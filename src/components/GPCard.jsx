import { useState } from 'react'
import { ShieldCheck, BadgeCheck } from 'lucide-react'
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

function daysUntil(str) {
  if (!str) return null
  const diff = Math.ceil((new Date(str) - new Date().setHours(0,0,0,0)) / 86400000)
  return diff < 0 ? null : diff
}

export default function GPCard({ gp, lang, user, onContactClick, onViewProfile }) {
  const [showModal, setShowModal] = useState(false)
  const [avatarErr, setAvatarErr] = useState(false)

  const isFr      = lang === 'fr'
  const locale    = isFr ? 'fr-FR' : 'en-US'
  const from      = gp.from_city || gp.from || '—'
  const to        = gp.to_city   || gp.to   || '—'
  const initials  = (gp.name || 'GP').split(' ').map(w => w[0]).filter(Boolean).join('').toUpperCase().slice(0, 2) || 'GP'
  const price     = formatPrice(gp.price)
  const accent    = gp.color || '#C8891C'
  const verified  = gp.phone_verified || gp.verified?.phone
  const days      = daysUntil(gp.date)
  const isFull    = gp.availability_status === 'full'
  const isUnavail = gp.availability_status === 'unavailable'
  const disabled  = isFull || isUnavail
  const departDate = formatDate(gp.date, locale)
  const badge     = gp.badge !== undefined ? gp.badge : true // TEST: change to gp.badge when done

  const urgency = (() => {
    if (days === 0) return { label: isFr ? "Aujourd'hui" : 'Today',       c: '#059669' }
    if (days === 1) return { label: isFr ? 'Demain'      : 'Tomorrow',    c: '#D97706' }
    if (days <= 6)  return { label: isFr ? 'Cette sem.'  : 'This week',   c: '#2563EB' }
    if (days <= 30) return { label: isFr ? 'Ce mois'     : 'This month',  c: '#7C3AED' }
    return { label: isFr ? 'Prochain mois' : 'Next month', c: '#6366F1' }
  })()

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

      <style>{`
        .gpc-wrap {
          background: #fff;
          border: 1px solid #EBEBEB;
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: box-shadow .18s, border-color .18s;
        }
        .gpc-wrap:hover { box-shadow: 0 6px 24px rgba(0,0,0,.07); border-color: #DDDAD5; }

        /* Left: traveler name */
        .gpc-traveler {
          padding: 22px 22px;
          background: #FDFBF8;
          display: flex;
          align-items: center;
          gap: 14px;
          border-right: 1px solid #F2F0ED;
          min-width: 100px;
        }

        /* Middle: route/destination */
        .gpc-route {
          padding: 22px 24px;
          flex: 1;
          min-width: 0;
          border-right: 1px solid #F2F0ED;
        }

        /* Right: CTA */
        .gpc-action {
          padding: 22px 22px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          min-width: 100px;
          position: relative;
        }

        @media (max-width: 640px) {
          .gpc-wrap { flex-direction: column; }
          .gpc-route, .gpc-traveler { border-right: none; border-bottom: 1px solid #F2F0ED; }
          .gpc-traveler { min-width: unset; }
          .gpc-action { flex-direction: row; justify-content: space-between; min-width: unset; }
          .gpc-cta { flex: 1; justify-content: center !important; }
        }
      `}</style>

      <div
        className="gpc-wrap"
        style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? 'default' : 'pointer' }}
        onClick={() => !disabled && onViewProfile?.(gp)}
      >

        {/* ── LEFT: Traveler name ── */}
        <div className="gpc-traveler">
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 46, height: 46, borderRadius: '50%',
              background: `linear-gradient(135deg, ${accent}28, ${accent}0e)`,
              border: `2px solid ${accent}30`,
              overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'DM Serif Display', serif",
              fontSize: 16, fontWeight: 700, color: accent,
            }}>
              {gp.avatar_url && !avatarErr
                ? <img src={gp.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setAvatarErr(true)} />
                : initials}
            </div>
            {verified && (
              <div style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 16, height: 16, borderRadius: '50%',
                background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ShieldCheck size={9} color="#16A34A" strokeWidth={2.5} />
              </div>
            )}
          </div>

          {/* Name */}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {gp.name || 'Traveler'}
            </div>
            {badge && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4, padding: '2px 8px', background: '#EFF6FF', borderRadius: 12, border: '1px solid #3B82F6' }}>
                <BadgeCheck size={12} color="#3B82F6" strokeWidth={2.5} />
                <span style={{ fontSize: 9, fontWeight: 700, color: '#3B82F6' }}>
                  {isFr ? 'Vérifié' : 'Verified'}
                </span>
              </div>
            )}
            {!badge && (
              <div style={{ fontSize: 11, color: verified ? '#16A34A' : '#9CA3AF', fontWeight: verified ? 600 : 400, marginTop: 4 }}>
                {verified ? (isFr ? '✓ Vérifié' : '✓ Verified') : (isFr ? 'Voyageur' : 'Traveler')}
              </div>
            )}
          </div>
        </div>

        {/* ── MIDDLE: Destination ── */}
        <div className="gpc-route">
          <div style={{ fontSize: 10, fontWeight: 700, color: '#B5AFA8', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 14 }}>
            {isFr ? 'Itinéraire' : 'Route'}
          </div>

          {/* Cities + arrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#111', letterSpacing: '-.6px', lineHeight: 1, fontFamily: "'DM Serif Display', serif" }}>{from}</div>
              {gp.pickup_area && <div style={{ fontSize: 11, color: '#A09898', marginTop: 4 }}>{gp.pickup_area}</div>}
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0, minWidth: 40 }}>
              <div style={{ flex: 1, height: '1.5px', background: `linear-gradient(90deg, #D4C9BA, ${accent})` }} />
              <div style={{ fontSize: 16, margin: '0 2px', lineHeight: 1 }}>✈</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: accent, letterSpacing: '-.6px', lineHeight: 1, fontFamily: "'DM Serif Display', serif" }}>{to}</div>
              {gp.dropoff_area && <div style={{ fontSize: 11, color: '#A09898', marginTop: 4 }}>{gp.dropoff_area}</div>}
            </div>
          </div>

          {/* Departure */}
          {departDate && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#B5AFA8', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                {isFr ? 'Départ' : 'Departs'}
              </span>
              <div style={{
                background: urgency.c,
                color: '#fff',
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}>
                {urgency.label}
              </div>
              <span style={{ fontSize: 11, color: '#6B7280' }}>{departDate}</span>
            </div>
          )}
        </div>

        {/* ── RIGHT: CTA + date ── */}
        <div className="gpc-action">
          {/* CTA */}
          {disabled ? (
            <div style={{ padding: '8px 16px', borderRadius: 10, fontSize: 11, fontWeight: 700, background: isFull ? '#FEF3C7' : '#FEE2E2', color: isFull ? '#92400E' : '#991B1B' }}>
              {isFull ? (isFr ? 'Complet' : 'Full') : (isFr ? 'Indisponible' : 'Unavailable')}
            </div>
          ) : (
            <button
              className="gpc-cta"
              onClick={handleContact}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '10px 16px', borderRadius: 12, border: 'none',
                background: '#25D366', color: '#fff',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'opacity .15s', whiteSpace: 'nowrap',
                width: '100%', justifyContent: 'center',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '.8'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <WhatsAppIcon size={13} />
              WhatsApp
            </button>
          )}

          {/* Date posted — bottom right */}
          {departDate && (
            <div style={{ position: 'absolute', bottom: 10, right: 22, fontSize: 9, color: '#B5AFA8', fontWeight: 600 }}>
              Posted on: {urgency
                ? <span style={{ color: urgency.c }}>{urgency.label}</span>
                : departDate}
            </div>
          )}
        </div>

      </div>
    </>
  )
}
