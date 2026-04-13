import { useState } from 'react'
import { ShieldCheck, Plane } from 'lucide-react'
import { ShipIcon } from './Icons'
import ContactModal from './ContactModal'

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
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

  const dateLabel = (() => {
    if (days === null) return null
    if (days === 0) return { text: isFr ? "Aujourd'hui" : 'Today',      color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' }
    if (days === 1) return { text: isFr ? 'Demain'      : 'Tomorrow',   color: '#C8891C', bg: '#fff7ed', border: '#fed7aa' }
    if (days <= 6)  return { text: isFr ? 'Cette semaine' : 'This week', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' }
    const now = new Date(); const tripDate = new Date(gp.date)
    if (tripDate.getMonth() === now.getMonth() && tripDate.getFullYear() === now.getFullYear())
      return { text: isFr ? 'Ce mois-ci' : 'This month', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' }
    return { text: gp.date, color: '#6B6860', bg: '#F5F3EF', border: '#E5E1DB' }
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
        .gp-card {
          background: #fff;
          border: 1px solid #EAEAEA;
          border-radius: 16px;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
          transition: box-shadow .2s, border-color .2s;
          opacity: 1;
        }
        .gp-card:hover {
          box-shadow: 0 6px 24px rgba(0,0,0,0.08);
          border-color: #C8891C66;
        }
        .gp-inner {
          display: grid;
          grid-template-columns: 180px 1fr 140px;
          align-items: center;
          min-height: 96px;
        }
        .gp-col-left  { padding: 20px; border-right: 1px solid #F0EDE8; height: 100%; display: flex; flex-direction: column; justify-content: center; }
        .gp-col-mid   { padding: 20px 24px; }
        .gp-col-right { padding: 20px; border-left: 1px solid #F0EDE8; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; }
        .gp-footer    { border-top: 1px solid #F0EDE8; background: #FAFAF8; padding: 8px 20px; display: flex; align-items: center; gap: 6px; }

        @media (max-width: 640px) {
          .gp-inner { grid-template-columns: 1fr; }
          .gp-col-left  { border-right: none; border-bottom: 1px solid #F0EDE8; padding: 14px 16px; height: auto; flex-direction: row; align-items: center; gap: 12px; }
          .gp-col-mid   { padding: 12px 16px; }
          .gp-col-mid .gp-route-from { font-size: 17px !important; }
          .gp-col-mid .gp-route-to   { font-size: 17px !important; }
          .gp-col-right { border-left: none; border-top: 1px solid #F0EDE8; padding: 12px 16px; flex-direction: column; align-items: stretch; height: auto; gap: 10px; }
          .gp-col-right .gp-price-block { display: flex; align-items: center; gap: 6px; }
          .gp-col-right .gp-price-block .gp-price-num { font-size: 20px !important; }
          .gp-col-right button { width: 100% !important; padding: 15px !important; font-size: 15px !important; border-radius: 12px !important; }
        }
      `}</style>

      <div className="gp-card" style={{ opacity: isDisabled ? 0.5 : 1 }}>
        <div className="gp-inner" style={{ cursor: isDisabled ? 'default' : 'pointer' }} onClick={() => !isDisabled && onViewProfile?.(gp)}>

          {/* LEFT — Traveler */}
          <div className="gp-col-left">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 42, height: 42, borderRadius: '50%',
                background: gp.avatar_url ? 'transparent' : (gp.bg || `${accent}18`),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'DM Serif Display', serif",
                fontSize: 15, fontWeight: 700, color: accent,
                flexShrink: 0, overflow: 'hidden',
              }}>
                {gp.avatar_url
                  ? <img src={gp.avatar_url} alt={gp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1710', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {gp.name || 'Traveler'}
                </div>
                {verified && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <ShieldCheck size={12} color="#16a34a" strokeWidth={2.5} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#16a34a' }}>
                      {isFr ? 'Vérifié' : 'Verified'}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {gp.space && (
              <div style={{ marginTop: 10, fontSize: 11, color: '#A09080' }}>
                {isFr ? 'Espace disponible' : 'Space available'}
                <strong style={{ color: '#5A5248', marginLeft: 4 }}>{gp.space}</strong>
              </div>
            )}
          </div>

          {/* MID — Route */}
          <div className="gp-col-mid">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>

              {/* FROM */}
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div className="gp-route-from" style={{ fontSize: 20, fontWeight: 800, color: '#1A1710', lineHeight: 1 }}>
                  {fromCity}
                </div>
                <div style={{ fontSize: 10, color: '#A09080', fontWeight: 500, marginTop: 3, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                  {isFr ? 'Départ' : 'From'}
                </div>
              </div>

              {/* Line + date badge */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 0 }}>
                {dateLabel && (
                  <div style={{
                    padding: '3px 10px',
                    borderRadius: 20,
                    background: dateLabel.bg,
                    border: `1px solid ${dateLabel.border}`,
                    fontSize: 11,
                    fontWeight: 700,
                    color: dateLabel.color,
                    whiteSpace: 'nowrap',
                  }}>
                    {dateLabel.text}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#D0C8C0', flexShrink: 0 }} />
                  <div style={{ flex: 1, height: 1, background: '#E0D8D0' }} />
                  {gp.service_type === 'groupage'
                    ? <ShipIcon size={14} color="#185FA5" style={{ flexShrink: 0 }} />
                    : <Plane size={14} color="#C8891C" strokeWidth={1.5} style={{ flexShrink: 0 }} />
                  }
                  <div style={{ flex: 1, height: 1, background: '#E0D8D0' }} />
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#C8891C', flexShrink: 0 }} />
                </div>
                {gp.flight_number && (
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#A09080', letterSpacing: '.04em' }}>
                    {gp.flight_number}
                  </div>
                )}
              </div>

              {/* TO */}
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div className="gp-route-to" style={{ fontSize: 20, fontWeight: 800, color: '#C8891C', lineHeight: 1 }}>
                  {toCity}
                </div>
                <div style={{ fontSize: 10, color: '#A09080', fontWeight: 500, marginTop: 3, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                  {isFr ? 'Arrivée' : 'To'}
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT — Price + CTA */}
          <div className="gp-col-right">
            <div className="gp-price-block" style={{ textAlign: 'center' }}>
              {price ? (
                <>
                  <div className="gp-price-num" style={{ fontSize: 22, fontWeight: 900, color: '#1A1710', fontFamily: "'DM Serif Display', serif", lineHeight: 1, letterSpacing: '-.3px' }}>
                    {price}
                  </div>
                  <div style={{ fontSize: 10, color: '#B0A090', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginTop: 3 }}>
                    {isFr ? 'par kg' : 'per kg'}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 12, color: '#B0A090', fontStyle: 'italic' }}>
                  {isFr ? 'Négociable' : 'Negotiable'}
                </div>
              )}
            </div>

            {isDisabled ? (
              <div style={{
                padding: '7px 16px', borderRadius: 8,
                background: isFull ? '#fef3c7' : '#fee2e2',
                fontSize: 11, fontWeight: 700,
                color: isFull ? '#92400e' : '#991b1b',
              }}>
                {isFull ? (isFr ? 'Complet' : 'Full') : (isFr ? 'Indisponible' : 'Unavailable')}
              </div>
            ) : (
              <button
                onClick={handleContact}
                style={{
                  width: '100%',
                  padding: '10px 0',
                  background: '#25D366',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  transition: 'background .15s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#1DA851'}
                onMouseLeave={e => e.currentTarget.style.background = '#25D366'}
              >
                <WhatsAppIcon />
                {isFr ? 'Contacter' : 'Contact'}
              </button>
            )}
          </div>

        </div>

        {/* Footer — service type + addresses */}
        <div className="gp-footer" style={{ flexWrap: 'wrap', gap: 6 }}>
          {/* Service type badge */}
          {gp.service_type === 'groupage' && (
            <span style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em',
              padding: '2px 8px', borderRadius: 20,
              background: '#EFF6FF', color: '#1d4ed8', border: '1px solid #bfdbfe',
              flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <ShipIcon size={10} color="#1d4ed8" />
              {isFr ? 'Bateau — groupage' : 'Boat — groupage'}
            </span>
          )}
          {gp.service_type === 'baggage' && (
            <span style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em',
              padding: '2px 8px', borderRadius: 20,
              background: '#FFF8EB', color: '#C8891C', border: '1px solid #F0C878',
              flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <Plane size={10} color="#C8891C" strokeWidth={2.5} />
              {isFr ? 'Avion — bagage' : 'Plane — luggage'}
            </span>
          )}

          {(gp.pickup_area || gp.dropoff_area) && (
            <>
              <span style={{ color: '#D0C8C0', fontSize: 11 }}>·</span>
              <span style={{ fontSize: 11, color: '#A09080' }}>
                {gp.service_type === 'groupage'
                  ? (isFr ? 'Dépôt :' : 'Drop-off:')
                  : (isFr ? 'Récupère à' : 'Picks up in')}
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#3D3829' }}>
                {gp.pickup_area || '—'}
              </span>
              {gp.dropoff_area && (
                <>
                  <span style={{ color: '#D0C8C0', fontSize: 11 }}>·</span>
                  <span style={{ fontSize: 11, color: '#A09080' }}>
                    {gp.service_type === 'groupage'
                      ? (isFr ? 'Retrait :' : 'Pickup:')
                      : (isFr ? 'Livre à' : 'Drops off in')}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#3D3829' }}>
                    {gp.dropoff_area}
                  </span>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
