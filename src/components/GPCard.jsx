import { useState } from 'react'
import ContactModal from './ContactModal'
import { ShieldCheckIcon, LockIcon, CalendarIcon, MapPinIcon } from './Icons'

function formatPrice(raw) {
  if (!raw) return null
  const str = String(raw).trim()
  if (str.includes('$') || str.includes('€') || str.includes('£')) return str.replace('/kg/kg', '/kg')
  if (str.toLowerCase().includes('/kg')) return str.replace('/kg/kg', '/kg')
  const num = parseFloat(str)
  if (!isNaN(num)) return `$${num}`
  return str
}

export default function GPCard({ gp, lang, user, onContactClick, onViewProfile }) {
  const [showModal, setShowModal] = useState(false)
  const [hovered, setHovered] = useState(false)
  const isFr = lang === 'fr'

  const fromCity = gp.from_city || gp.from || ''
  const toCity   = gp.to_city   || gp.to   || ''
  const initials = gp.initials || gp.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'GP'
  const price    = formatPrice(gp.price)
  const accentColor = gp.color || '#C8891C'

  const daysLabel = (() => {
    if (!gp.date) return null
    const diff = Math.ceil((new Date(gp.date) - new Date().setHours(0, 0, 0, 0)) / 86400000)
    if (diff < 0)   return null
    if (diff === 0) return isFr ? "Aujourd'hui" : 'Today'
    if (diff === 1) return isFr ? 'Demain' : 'Tomorrow'
    return null
  })()

  const handleContact = (e) => {
    e.stopPropagation()
    if (!user) { onContactClick(); return }
    setShowModal(true)
  }

  const sendWhatsApp = (message) => {
    const phone = gp.phone?.replace(/\D/g, '')
    if (phone) window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
    setShowModal(false)
  }

  return (
    <>
      {showModal && (
        <ContactModal
          gp={{ ...gp, price }}
          lang={lang}
          onClose={() => setShowModal(false)}
          onSend={sendWhatsApp}
        />
      )}

      <div
        onClick={() => onViewProfile && onViewProfile(gp)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: '#fff',
          borderRadius: 16,
          border: '1.5px solid ' + (hovered ? '#D4C4A8' : '#EDEAE4'),
          overflow: 'hidden',
          cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif",
          transition: 'box-shadow .2s, transform .2s, border-color .2s',
          boxShadow: hovered ? '0 8px 32px rgba(0,0,0,.09)' : '0 1px 4px rgba(0,0,0,.04)',
          transform: hovered ? 'translateY(-1px)' : 'none',
          marginBottom: 10,
        }}
      >
        {/* ── 3-COLUMN MAIN ROW ── */}
        <div style={{ display: 'flex', alignItems: 'stretch' }}>

          {/* COL 1 — Avatar */}
          <div style={{
            width: 88, flexShrink: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 7,
            padding: '18px 10px',
            borderRight: '1px solid #F0EDE8',
          }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 46, height: 46, borderRadius: '50%',
                background: gp.bg || '#FFF3D6',
                border: `2px solid ${accentColor}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'DM Serif Display', serif",
                fontSize: 16, fontWeight: 700, color: accentColor,
              }}>
                {initials}
              </div>
              {gp.id_verified && (
                <div style={{
                  position: 'absolute', bottom: -1, right: -1, width: 16, height: 16,
                  borderRadius: '50%', background: '#fff', border: '1.5px solid #E6C87A',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ShieldCheckIcon size={8} color="#C8891C" />
                </div>
              )}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#1A1710', lineHeight: 1.2, maxWidth: 68, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {gp.name || 'Traveler'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, marginTop: 3 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: gp.phone_verified ? '#22c55e' : '#D1C9C0', display: 'inline-block' }} />
                <span style={{ fontSize: 9, fontWeight: 600, color: gp.phone_verified ? '#2D8B4E' : '#B0A090', whiteSpace: 'nowrap' }}>
                  {gp.phone_verified ? (isFr ? 'Vérifié' : 'Verified') : (isFr ? 'Non vérifié' : 'Unverified')}
                </span>
              </div>
            </div>
          </div>

          {/* COL 2 — Route + chips (fills remaining space) */}
          <div style={{ flex: 1, minWidth: 0, padding: '16px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}>

            {/* Route */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#B0A090', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 3 }}>
                  {isFr ? 'Départ' : 'From'}
                </div>
                <div style={{ fontSize: 19, fontWeight: 900, color: '#1A1710', lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-.3px' }}>
                  {fromCity}
                </div>
              </div>

              <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', opacity: 0.2, marginTop: 12 }}>
                <div style={{ width: 20, height: 1.5, background: '#1A1710' }} />
                <svg width="8" height="8" viewBox="0 0 10 10" fill="#1A1710"><polygon points="0,0 10,5 0,10" /></svg>
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#B0A090', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 3 }}>
                  {isFr ? 'Arrivée' : 'To'}
                </div>
                <div style={{ fontSize: 19, fontWeight: 900, color: '#1A1710', lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-.3px' }}>
                  {toCity}
                </div>
              </div>
            </div>

            {/* Chips */}
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
              {gp.date && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: 11, fontWeight: 600,
                  background: daysLabel ? '#FFFBF0' : '#F5F3EF',
                  border: `1px solid ${daysLabel ? '#F0D878' : '#E5E1DB'}`,
                  color: daysLabel ? '#7C4E0A' : '#5A5248',
                  borderRadius: 6, padding: '3px 8px',
                }}>
                  <CalendarIcon size={10} color={daysLabel ? '#C8891C' : '#8A8070'} />
                  {gp.date}
                  {daysLabel && (
                    <span style={{ background: '#C8891C', color: '#fff', borderRadius: 4, padding: '1px 5px', fontSize: 10, fontWeight: 700, marginLeft: 2 }}>
                      {daysLabel}
                    </span>
                  )}
                </span>
              )}
              {gp.flight_number && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, background: '#F0FAF4', border: '1px solid #BBE0CA', color: '#1A6B3C', borderRadius: 6, padding: '3px 8px' }}>
                  {gp.flight_number}
                </span>
              )}
            </div>
          </div>

          {/* COL 3 — Price + CTA */}
          <div style={{
            width: 140, flexShrink: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '16px 16px',
            borderLeft: '1px solid #F0EDE8',
            background: '#FAFAF8',
          }}>
            <div style={{ textAlign: 'center' }}>
              {price ? (
                <>
                  <div style={{ fontSize: 26, fontWeight: 900, color: '#1A1710', lineHeight: 1, fontFamily: "'DM Serif Display', serif", letterSpacing: '-.5px' }}>
                    {price}
                  </div>
                  <div style={{ fontSize: 10, color: '#B0A090', marginTop: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                    / kg
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 11, color: '#B0A090', fontStyle: 'italic' }}>
                  {isFr ? 'À négocier' : 'Negotiable'}
                </div>
              )}
            </div>

            {gp.phone_verified ? (
              <button
                onClick={handleContact}
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: 9,
                  background: hovered ? '#B8780C' : '#C8891C',
                  color: '#fff', border: 'none',
                  fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                  transition: 'background .15s', whiteSpace: 'nowrap',
                }}
              >
                {isFr ? 'Contacter' : 'Contact'}
              </button>
            ) : (
              <div style={{
                width: '100%', padding: '8px 10px', borderRadius: 9,
                background: '#F0EDE8', border: '1px solid #E5E1DB',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              }}>
                <LockIcon size={11} color="#C0B8B0" />
                <span style={{ fontSize: 11, fontWeight: 600, color: '#C0B8B0', whiteSpace: 'nowrap' }}>
                  {isFr ? 'Indisponible' : 'Unavailable'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── PICKUP / DROPOFF — always visible ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 18px',
          background: '#F7F5F1',
          borderTop: '1px solid #EDEAE4',
          flexWrap: 'wrap',
        }}>
          <MapPinIcon size={11} color="#C8891C" />
          <span style={{ fontSize: 11, color: '#8A8070', fontWeight: 500 }}>
            {isFr ? 'Ramassage' : 'Pickup'}:
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, color: gp.pickup_area ? '#3D3829' : '#C0B8B0' }}>
            {gp.pickup_area || (isFr ? 'Non précisé' : 'Not specified')}
          </span>
          <span style={{ fontSize: 11, color: '#D0C8C0' }}>·</span>
          <span style={{ fontSize: 11, color: '#8A8070', fontWeight: 500 }}>
            {isFr ? 'Livraison' : 'Dropoff'}:
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, color: gp.dropoff_area ? '#3D3829' : '#C0B8B0' }}>
            {gp.dropoff_area || (isFr ? 'Non précisé' : 'Not specified')}
          </span>
        </div>

      </div>
    </>
  )
}
