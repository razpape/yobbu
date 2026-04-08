import { useState } from 'react'
import ContactModal from './ContactModal'
import { ShieldCheckIcon, LockIcon } from './Icons'

const CITY_CODES = {
  'New York':'JFK','Paris':'CDG','Atlanta':'ATL','Houston':'IAH',
  'Washington DC':'DCA','London':'LHR','Montreal':'YUL','Brussels':'BRU',
  'Madrid':'MAD','Barcelona':'BCN','Bilbao':'BIO','Marseille':'MRS',
  'Lyon':'LYS','Milan':'MXP','Rome':'FCO','Lisbon':'LIS',
  'Dakar':'DSS','Conakry':'CKY','Abidjan':'ABJ','Bamako':'BKO',
  'Lomé':'LFW','Accra':'ACC','Cotonou':'COO','Casablanca':'CMN',
  'Nouakchott':'NKC','Bissau':'OXB','Freetown':'FNA','Banjul':'BJL',
}

function formatPrice(raw) {
  if (!raw) return null
  const str = String(raw).trim()
  if (str.includes('$') || str.includes('€') || str.includes('£')) return str.replace('/kg/kg','/kg')
  if (str.toLowerCase().includes('/kg')) return str.replace('/kg/kg','/kg')
  const num = parseFloat(str)
  if (!isNaN(num)) return `$${num}/kg`
  return str
}

const CARD_CSS = `
.gpcard-grid {
  display: grid;
  grid-template-columns: 200px 1fr auto auto auto;
  align-items: center;
  gap: 0;
  padding: 18px 24px;
  width: 100%;
}
.gpcard-grid > * {
  padding: 0 16px;
}
.gpcard-grid > *:first-child { padding-left: 0; }
.gpcard-grid > *:last-child { padding-right: 0; }

.gpcard-divider {
  width: 1px;
  height: 48px;
  background: rgba(0,0,0,.06);
  flex-shrink: 0;
  padding: 0 !important;
}

@media (max-width: 900px) {
  .gpcard-grid {
    grid-template-columns: 180px 1fr auto auto;
    gap: 0;
    padding: 16px 18px;
  }
  .gpcard-stats { display: none !important; }
  .gpcard-stats-divider { display: none !important; }
}

@media (max-width: 640px) {
  .gpcard-grid {
    grid-template-columns: 1fr !important;
    gap: 12px !important;
    padding: 14px !important;
  }
  .gpcard-divider { display: none !important; }
  .gpcard-stats { display: flex !important; }
  .gpcard-stats-divider { display: none !important; }
  .gpcard-badges { flex-direction: row !important; flex-wrap: wrap; }
  .gpcard-action {
    width: 100% !important;
    justify-content: space-between !important;
    border-top: 1px solid rgba(0,0,0,.06);
    padding-top: 12px !important;
  }
}
`

export default function GPCard({ gp, lang, user, onContactClick, onViewProfile }) {
  const [hovered, setHovered]     = useState(false)
  const [btnHover, setBtnHover]   = useState(false)
  const [showModal, setShowModal] = useState(false)
  const isFr = lang === 'fr'

  const fromCity = gp.from_city || gp.from || ''
  const toCity   = gp.to_city   || gp.to   || ''
  const fromCode = CITY_CODES[fromCity] || fromCity.slice(0,3).toUpperCase()
  const toCode   = CITY_CODES[toCity]   || toCity.slice(0,3).toUpperCase()
  const initials = gp.initials || gp.name?.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) || 'GP'
  const rating   = Number(gp.rating) || 5.0
  const price    = formatPrice(gp.price)

  const daysLeft = (() => {
    if (!gp.date) return null
    const diff = Math.ceil((new Date(gp.date) - new Date().setHours(0,0,0,0)) / 86400000)
    if (diff < 0) return null
    if (diff === 0) return isFr ? 'Aujourd\'hui' : 'Today'
    if (diff === 1) return isFr ? 'Demain' : 'Tomorrow'
    return isFr ? `Dans ${diff} jours` : `${diff} days left`
  })()

  const handleContact = (e) => {
    e.stopPropagation()
    if (!user) { onContactClick(); return }
    setShowModal(true)
  }

  const sendWhatsApp = (message) => {
    const msg = encodeURIComponent(message)
    const phone = gp.phone?.replace(/\D/g, '')
    if (phone) window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
    setShowModal(false)
  }

  const hasStats = (gp.trips != null && gp.trips > 0) || (gp.delivered != null && gp.delivered > 0) || (gp.responseTime && gp.responseTime !== '—')

  return (
    <>
      <style>{CARD_CSS}</style>
      {showModal && (
        <ContactModal
          gp={{ ...gp, price }}
          lang={lang}
          onClose={() => setShowModal(false)}
          onSend={sendWhatsApp}
        />
      )}

      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onViewProfile && onViewProfile(gp)}
        style={{
          cursor: onViewProfile ? 'pointer' : 'default',
          background: '#fff',
          borderRadius: 16,
          border: `1px solid ${hovered ? 'rgba(200,137,28,.2)' : 'rgba(0,0,0,.07)'}`,
          marginBottom: 10,
          transition: 'all .2s cubic-bezier(.4,0,.2,1)',
          transform: hovered ? 'translateY(-2px)' : 'none',
          boxShadow: hovered ? '0 10px 36px rgba(0,0,0,.08)' : '0 1px 6px rgba(0,0,0,.04)',
          fontFamily: 'DM Sans, sans-serif',
          overflow: 'hidden',
        }}
      >
        <div className="gpcard-grid">

          {/* ── 1. Avatar + Name ── */}
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ position:'relative', flexShrink:0 }}>
              <div style={{
                width:48, height:48, borderRadius:'50%',
                background: gp.bg || '#FFF8EB',
                color: gp.color || '#C8891C',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontFamily:'DM Serif Display, serif', fontSize:16, fontWeight:700,
              }}>
                {initials}
              </div>
              {gp.id_verified && (
                <div style={{ position:'absolute', bottom:-2, right:-2, width:16, height:16, borderRadius:'50%', background:'#fff', border:'1.5px solid #F0C878', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <ShieldCheckIcon size={9} color="#C8891C" />
                </div>
              )}
            </div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontFamily:'DM Serif Display, serif', fontSize:16, color:'#1A1710', letterSpacing:'-.2px', marginBottom:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                {gp.name}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:3 }}>
                {[1,2,3,4,5].map(i => (
                  <span key={i} style={{ color: i <= Math.round(rating) ? '#C8891C' : '#E8DDD0', fontSize:11 }}>★</span>
                ))}
                <span style={{ fontSize:11, fontWeight:600, color:'#1A1710', marginLeft:2 }}>{rating.toFixed(1)}</span>
              </div>
              {gp.member_since && (
                <div style={{ fontSize:10, color:'#B0A090', marginTop:1 }}>
                  {isFr ? 'Depuis' : 'Since'} {gp.member_since}
                </div>
              )}
            </div>
          </div>

          {/* ── divider ── */}
          <div className="gpcard-divider" />

          {/* ── 2. Route ── */}
          <div style={{ display:'flex', alignItems:'center', gap:14, minWidth:0 }}>
            <div style={{ textAlign:'center', flexShrink:0 }}>
              <div style={{ fontFamily:'DM Serif Display, serif', fontSize:24, color:'#1A1710', letterSpacing:'-1px', lineHeight:1 }}>{fromCode}</div>
              <div style={{ fontSize:10, color:'#8A8070', marginTop:3 }}>{fromCity}</div>
            </div>

            <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:5, minWidth:80 }}>
              <div style={{ width:'100%', height:1.5, background:'linear-gradient(90deg,#C8891C,#E5A630,#C8891C)', position:'relative' }}>
                <span style={{ position:'absolute', top:-9, left:'50%', transform:'translateX(-50%)', fontSize:12 }}>✈</span>
              </div>
              {gp.date && (
                <span style={{ fontSize:10, fontWeight:600, color:'#C8891C', background:'#FFF8EB', border:'1px solid #F0C878', borderRadius:20, padding:'1px 8px', whiteSpace:'nowrap' }}>
                  {gp.date}
                </span>
              )}
              {daysLeft && (
                <span style={{ fontSize:10, fontWeight:600, color: daysLeft === 'Today' || daysLeft === "Aujourd'hui" ? '#DC2626' : '#6B7280', whiteSpace:'nowrap' }}>
                  {daysLeft}
                </span>
              )}
            </div>

            <div style={{ textAlign:'center', flexShrink:0 }}>
              <div style={{ fontFamily:'DM Serif Display, serif', fontSize:24, color:'#1A1710', letterSpacing:'-1px', lineHeight:1 }}>{toCode}</div>
              <div style={{ fontSize:10, color:'#8A8070', marginTop:3 }}>{toCity}</div>
            </div>
          </div>

          {/* ── divider ── */}
          <div className="gpcard-divider gpcard-stats-divider" />

          {/* ── 3. Stats + Badges ── */}
          <div className="gpcard-stats" style={{ display:'flex', alignItems:'center', gap:20 }}>
            {(gp.trips != null && gp.trips > 0) && (
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:9, color:'#B0A090', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:2 }}>
                  {isFr ? 'Voyages' : 'Trips'}
                </div>
                <div style={{ fontFamily:'DM Serif Display, serif', fontSize:18, color:'#1A1710', lineHeight:1 }}>
                  {gp.trips}
                </div>
              </div>
            )}
            {(gp.delivered != null && gp.delivered > 0) && (
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:9, color:'#B0A090', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:2 }}>
                  {isFr ? 'Livrés' : 'Delivered'}
                </div>
                <div style={{ fontFamily:'DM Serif Display, serif', fontSize:18, color:'#1A1710', lineHeight:1 }}>
                  {gp.delivered}
                </div>
              </div>
            )}
            {gp.responseTime && gp.responseTime !== '—' && (
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:9, color:'#B0A090', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:2 }}>
                  {isFr ? 'Réponse' : 'Response'}
                </div>
                <div style={{ fontSize:13, fontWeight:600, color:'#2D8B4E', lineHeight:1 }}>
                  {gp.responseTime}
                </div>
              </div>
            )}

            {/* Verification badges */}
            <div className="gpcard-badges" style={{ display:'flex', flexDirection:'column', gap:4 }}>
              {gp.phone_verified && (
                <span style={{ fontSize:10, fontWeight:600, background:'#F0FAF4', color:'#1A5C38', border:'1px solid #B8DCC8', borderRadius:20, padding:'2px 8px', display:'inline-flex', alignItems:'center', gap:3, whiteSpace:'nowrap' }}>
                  <span style={{ width:4, height:4, borderRadius:'50%', background:'#2D8B4E', display:'inline-block' }} />
                  {isFr ? 'Téléphone' : 'Phone'}
                </span>
              )}
              {gp.id_verified && (
                <span style={{ fontSize:10, fontWeight:600, background:'#FFF8EB', color:'#7A5200', border:'1px solid #EABD6A', borderRadius:20, padding:'2px 8px', display:'inline-flex', alignItems:'center', gap:3, whiteSpace:'nowrap' }}>
                  <span style={{ width:4, height:4, borderRadius:'50%', background:'#C8891C', display:'inline-block' }} />
                  ID verified
                </span>
              )}
            </div>
          </div>

          {/* ── divider ── */}
          <div className="gpcard-divider" />

          {/* ── 4. Price + Contact ── */}
          <div className="gpcard-action" style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:9, color:'#B0A090', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:1 }}>
                {isFr ? 'Prix / kg' : 'Price / kg'}
              </div>
              <div style={{ fontFamily:'DM Serif Display, serif', fontSize:22, color: price ? '#C8891C' : '#B0A090', lineHeight:1 }}>
                {price || (isFr ? 'À négocier' : 'Negotiable')}
              </div>
            </div>

            {gp.phone_verified ? (
              <button
                onMouseEnter={() => setBtnHover(true)}
                onMouseLeave={() => setBtnHover(false)}
                onClick={handleContact}
                style={{
                  background: btnHover ? '#C8891C' : '#1A1710',
                  color:'#fff', border:'none', borderRadius:10,
                  padding:'10px 18px', fontSize:13, fontWeight:600,
                  cursor:'pointer', fontFamily:'DM Sans, sans-serif',
                  display:'flex', alignItems:'center', gap:7,
                  transition:'background .15s', whiteSpace:'nowrap',
                }}
              >
                {isFr ? 'Contacter' : 'Contact'}
              </button>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                <div style={{
                  background:'#F5F3F0', border:'1px solid rgba(0,0,0,.08)',
                  borderRadius:10, padding:'9px 14px',
                  display:'flex', alignItems:'center', gap:6,
                  whiteSpace:'nowrap', cursor:'default',
                }}>
                  <LockIcon size={13} color="#B0A090" />
                  <span style={{ fontSize:12, fontWeight:600, color:'#B0A090' }}>
                    {isFr ? 'Non vérifié' : 'Unverified'}
                  </span>
                </div>
                <span style={{ fontSize:10, color:'#C0B8B0', textAlign:'center', maxWidth:90, lineHeight:1.3 }}>
                  {isFr ? 'Contact indisponible' : 'Contact unavailable'}
                </span>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}
