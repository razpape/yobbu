import { useState } from 'react'
import { ShieldCheck, Plane, MapPin } from 'lucide-react'
import { ShipIcon } from './Icons'
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
  if (!isNaN(num)) return `$${num}`
  return String(raw).replace('/kg/kg', '/kg')
}

function daysUntil(dateStr) {
  if (!dateStr) return null
  const diff = Math.ceil((new Date(dateStr) - new Date().setHours(0, 0, 0, 0)) / 86400000)
  return diff < 0 ? null : diff
}

export default function GPCard({ gp, lang, user, onContactClick, onViewProfile }) {
  const [showModal, setShowModal] = useState(false)
  const [hovered, setHovered] = useState(false)
  const isFr = lang === 'fr'

  const fromCity   = gp.from_city || gp.from || '—'
  const toCity     = gp.to_city   || gp.to   || '—'
  const initials   = gp.initials  || gp.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'GP'
  const price      = formatPrice(gp.price)
  const accent     = gp.color || '#C8891C'
  const days       = daysUntil(gp.date)
  const isFull     = gp.availability_status === 'full'
  const isUnavail  = gp.availability_status === 'unavailable'
  const isDisabled = isFull || isUnavail
  const verified   = gp.phone_verified || gp.verified?.phone
  const isGroupage = gp.service_type === 'groupage'

  const dateLabel = (() => {
    if (days === null) return null
    if (days === 0) return { text: isFr ? "Aujourd'hui" : 'Today',       color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' }
    if (days === 1) return { text: isFr ? 'Demain'      : 'Tomorrow',    color: '#d97706', bg: '#fffbeb', border: '#fde68a' }
    if (days <= 6)  return { text: isFr ? 'Cette semaine' : 'This week',  color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' }
    const now = new Date(); const tripDate = new Date(gp.date)
    if (tripDate.getMonth() === now.getMonth() && tripDate.getFullYear() === now.getFullYear())
      return { text: isFr ? 'Ce mois-ci' : 'This month', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' }
    return { text: gp.date, color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' }
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
        .gpcard-v2 {
          background: #fff;
          border-radius: 14px;
          font-family: 'DM Sans', sans-serif;
          transition: all .25s cubic-bezier(.4,0,.2,1);
          position: relative;
          overflow: hidden;
          border: 1px solid transparent;
          box-shadow: 0 1px 3px rgba(0,0,0,.04), 0 1px 2px rgba(0,0,0,.06);
        }
        .gpcard-v2:hover {
          box-shadow: 0 10px 40px rgba(0,0,0,.08), 0 2px 8px rgba(0,0,0,.04);
          border-color: rgba(200,137,28,.15);
          transform: translateY(-1px);
        }
        .gpcard-v2::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: linear-gradient(180deg, #C8891C 0%, #E6A832 100%);
          border-radius: 14px 0 0 14px;
          opacity: 0;
          transition: opacity .25s;
        }
        .gpcard-v2:hover::before { opacity: 1; }

        .gpcard-body {
          display: flex;
          align-items: center;
          padding: 18px 20px;
          gap: 20px;
        }

        .gpcard-avatar-area {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          flex-shrink: 0;
          width: 170px;
        }

        .gpcard-route-area {
          flex: 1;
          min-width: 0;
        }

        .gpcard-action-area {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-shrink: 0;
        }

        .gpcard-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 20px 14px;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .gpcard-body {
            flex-direction: column;
            align-items: stretch;
            padding: 16px;
            gap: 14px;
          }
          .gpcard-avatar-area {
            width: 100%;
            padding-bottom: 12px;
            border-bottom: 1px solid #f3f4f6;
          }
          .gpcard-action-area {
            flex-direction: column;
            gap: 10px;
          }
          .gpcard-action-area .gpcard-price-pill {
            align-self: flex-start;
          }
          .gpcard-action-area .gpcard-cta {
            width: 100% !important;
            padding: 14px !important;
            font-size: 14px !important;
            border-radius: 12px !important;
          }
          .gpcard-meta {
            padding: 0 16px 12px;
          }
        }
      `}</style>

      <div
        className="gpcard-v2"
        style={{ opacity: isDisabled ? 0.55 : 1, cursor: isDisabled ? 'default' : 'pointer' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => !isDisabled && onViewProfile?.(gp)}
      >
        {/* Main body */}
        <div className="gpcard-body">

          {/* Avatar + Name */}
          <div className="gpcard-avatar-area">
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: gp.avatar_url ? '#f3f4f6' : `linear-gradient(135deg, ${accent}20, ${accent}08)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'DM Serif Display', serif",
                fontSize: 17, fontWeight: 700, color: accent,
                overflow: 'hidden',
                border: `2px solid ${gp.avatar_url ? '#f3f4f6' : accent + '25'}`,
                transition: 'border-color .2s',
                ...(hovered && !isDisabled ? { borderColor: accent + '50' } : {}),
              }}>
                {gp.avatar_url
                  ? <img src={gp.avatar_url} alt={gp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : initials}
              </div>
              {verified && (
                <div style={{
                  position: 'absolute', bottom: -2, right: -2,
                  width: 18, height: 18, borderRadius: '50%',
                  background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,.1)',
                }}>
                  <ShieldCheck size={12} color="#059669" strokeWidth={2.5} />
                </div>
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: 14, fontWeight: 700, color: '#111827',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                lineHeight: 1.3,
              }}>
                {gp.name || 'Traveler'}
              </div>
              {verified && (
                <span style={{ fontSize: 11, fontWeight: 500, color: '#059669', lineHeight: 1.2 }}>
                  {isFr ? 'Vérifié' : 'Verified'}
                </span>
              )}
              {gp.photo_verified && (
                <span style={{ fontSize: 11, fontWeight: 500, color: '#d97706', marginLeft: verified ? 8 : 0 }}>
                  {isFr ? 'Photo ID' : 'Photo ID'}
                </span>
              )}
            </div>
          </div>

          {/* Route */}
          <div className="gpcard-route-area">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* From city */}
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: 17, fontWeight: 800, color: '#111827',
                  lineHeight: 1.1, letterSpacing: '-.2px',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {fromCity}
                </div>
              </div>

              {/* Flight line */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', minWidth: 40, gap: 0 }}>
                <div style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: '#d1d5db', flexShrink: 0,
                }} />
                <div style={{
                  flex: 1, height: 0,
                  borderTop: '1.5px dashed #d1d5db',
                  margin: '0 -1px',
                }} />
                <div style={{
                  flexShrink: 0, width: 28, height: 28, borderRadius: '50%',
                  background: isGroupage ? '#eff6ff' : '#fffbeb',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isGroupage
                    ? <ShipIcon size={13} color="#2563eb" />
                    : <Plane size={13} color="#C8891C" strokeWidth={2} />
                  }
                </div>
                <div style={{
                  flex: 1, height: 0,
                  borderTop: '1.5px dashed #d1d5db',
                  margin: '0 -1px',
                }} />
                <div style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: '#C8891C', flexShrink: 0,
                }} />
              </div>

              {/* To city */}
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: 17, fontWeight: 800, color: '#C8891C',
                  lineHeight: 1.1, letterSpacing: '-.2px',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {toCity}
                </div>
              </div>
            </div>

            {/* Date + flight number row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              {dateLabel && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '2px 10px', borderRadius: 20,
                  background: dateLabel.bg, border: `1px solid ${dateLabel.border}`,
                  fontSize: 11, fontWeight: 600, color: dateLabel.color,
                  lineHeight: 1.6,
                }}>
                  {dateLabel.text}
                </span>
              )}
              {gp.flight_number && (
                <span style={{
                  fontSize: 11, fontWeight: 600, color: '#9ca3af',
                  letterSpacing: '.03em', fontFamily: "'DM Mono', 'SF Mono', monospace",
                }}>
                  {gp.flight_number}
                </span>
              )}
            </div>
          </div>

          {/* Price + CTA */}
          <div className="gpcard-action-area">
            {/* Price */}
            <div className="gpcard-price-pill" style={{
              background: price ? '#f9fafb' : 'transparent',
              borderRadius: 10,
              padding: price ? '8px 14px' : '8px 0',
              textAlign: 'center',
              minWidth: 64,
            }}>
              {price ? (
                <>
                  <div style={{
                    fontSize: 20, fontWeight: 800, color: '#111827',
                    fontFamily: "'DM Serif Display', serif",
                    lineHeight: 1, letterSpacing: '-.3px',
                  }}>
                    {price}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 500, color: '#9ca3af', marginTop: 2, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                    {isFr ? '/ kg' : '/ kg'}
                  </div>
                </>
              ) : (
                <span style={{ fontSize: 12, fontWeight: 500, color: '#9ca3af', fontStyle: 'italic' }}>
                  {isFr ? 'Négociable' : 'Negotiable'}
                </span>
              )}
            </div>

            {/* CTA */}
            {isDisabled ? (
              <div style={{
                padding: '8px 16px', borderRadius: 10,
                background: isFull ? '#fef3c7' : '#fee2e2',
                fontSize: 12, fontWeight: 700,
                color: isFull ? '#92400e' : '#991b1b',
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}>
                {isFull ? (isFr ? 'Complet' : 'Full') : (isFr ? 'Indisponible' : 'Unavailable')}
              </div>
            ) : (
              <button
                className="gpcard-cta"
                onClick={handleContact}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #25D366, #20BA5A)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  transition: 'all .2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 7,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 8px rgba(37,211,102,.25)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #20BA5A, #1DA851)'
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,211,102,.35)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #25D366, #20BA5A)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(37,211,102,.25)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <WhatsAppIcon size={14} />
                {isFr ? 'Contacter' : 'Contact'}
              </button>
            )}
          </div>
        </div>

        {/* Meta footer — service type + pickup/dropoff */}
        {(gp.service_type || gp.pickup_area || gp.dropoff_area) && (
          <div className="gpcard-meta">
            {isGroupage && (
              <span style={{
                fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em',
                padding: '3px 9px', borderRadius: 6,
                background: '#eff6ff', color: '#2563eb',
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                <ShipIcon size={10} color="#2563eb" />
                {isFr ? 'Bateau' : 'Boat'}
              </span>
            )}
            {gp.service_type === 'baggage' && (
              <span style={{
                fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em',
                padding: '3px 9px', borderRadius: 6,
                background: '#fffbeb', color: '#d97706',
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                <Plane size={10} color="#d97706" strokeWidth={2.5} />
                {isFr ? 'Avion' : 'Plane'}
              </span>
            )}
            {gp.pickup_area && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#6b7280' }}>
                <MapPin size={10} color="#9ca3af" strokeWidth={2} />
                {gp.pickup_area}
              </span>
            )}
            {gp.pickup_area && gp.dropoff_area && (
              <span style={{ fontSize: 10, color: '#d1d5db' }}>→</span>
            )}
            {gp.dropoff_area && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#6b7280' }}>
                <MapPin size={10} color="#C8891C" strokeWidth={2} />
                {gp.dropoff_area}
              </span>
            )}
          </div>
        )}
      </div>
    </>
  )
}
