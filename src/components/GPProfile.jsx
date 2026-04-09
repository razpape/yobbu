import { useState, useEffect } from 'react'
import ContactModal from './ContactModal'
import TrustBadges from './TrustBadges'
import { ShieldCheckIcon, LockIcon, PlaneIcon } from './Icons'

const CITY_CODES = {
  'New York':'JFK','Paris':'CDG','Atlanta':'ATL','Houston':'IAH',
  'Washington DC':'DCA','London':'LHR','Montreal':'YUL','Brussels':'BRU',
  'Dakar':'DSS','Conakry':'CKY','Abidjan':'ABJ','Bamako':'BKO',
  'Lomé':'LFW','Accra':'ACC','Cotonou':'COO',
}

function formatPrice(raw) {
  if (!raw) return null
  const str = String(raw).trim()
  if (str.includes('$') || str.includes('€')) return str.replace('/kg/kg','/kg')
  const num = parseFloat(str)
  if (!isNaN(num)) return `$${num}/kg`
  return str
}

function Stars({ rating, size = 14 }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= Math.round(rating) ? '#C8891C' : '#E8DDD0', fontSize: size }}>★</span>
      ))}
    </span>
  )
}

export default function GPProfile({ gp, lang, user, onLoginRequired, onBack }) {
  const [showModal, setShowModal] = useState(false)
  const [flightPrices, setFlightPrices] = useState(null)
  const [priceLoading, setPriceLoading] = useState(false)
  const isFr = lang === 'fr'

  const fromCity = gp.from_city || gp.from || ''
  const toCity   = gp.to_city   || gp.to   || ''
  const fromCode = CITY_CODES[fromCity] || fromCity.slice(0,3).toUpperCase()
  const toCode   = CITY_CODES[toCity]   || toCity.slice(0,3).toUpperCase()
  const rating   = Number(gp.rating) || 5.0
  const initials = gp.initials || gp.name?.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) || 'GP'
  const price    = formatPrice(gp.price)

  // Fetch live flight prices
  useEffect(() => {
    if (!fromCity || !toCity) return
    
    setPriceLoading(true)
    fetch(`/api/flight-prices?from=${encodeURIComponent(fromCity)}&to=${encodeURIComponent(toCity)}`)
      .then(res => res.json())
      .then(data => {
        setFlightPrices(data)
        setPriceLoading(false)
      })
      .catch(err => {
        console.error('Flight price fetch error:', err)
        setPriceLoading(false)
      })
  }, [fromCity, toCity])

  const sendWhatsApp = (message) => {
    const phone = gp.phone?.replace(/\D/g, '')
    if (phone) window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
    setShowModal(false)
  }

  const handleContact = () => {
    if (!user) { onLoginRequired(); return }
    setShowModal(true)
  }

  return (
    <div style={{ fontFamily:'DM Sans, sans-serif', background:'#FDFBF7', minHeight:'100vh' }}>
      <style>{`
        @media (max-width: 640px) {
          .gpp-nav { padding: 14px 16px !important; }
          .gpp-wrap { padding: 0 !important; }
          .gpp-hero { padding: 20px 16px !important; }
          .gpp-section { padding: 20px 16px !important; }
          .gpp-stats > div { padding: 16px 12px !important; }
          .gpp-trip-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {showModal && (
        <ContactModal
          gp={{ ...gp, price }}
          lang={lang}
          onClose={() => setShowModal(false)}
          onSend={sendWhatsApp}
        />
      )}

      {/* Nav */}
      <div className="gpp-nav" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 48px', borderBottom:'1px solid rgba(0,0,0,.06)', position:'sticky', top:0, background:'#FDFBF7', zIndex:50 }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ fontFamily:'DM Serif Display, serif', fontSize:24, color:'#1A1710', letterSpacing:'-.5px' }}>
            Yob<span style={{ color:'#C8891C' }}>bu</span>
          </div>
          <button onClick={onBack}
            style={{ fontSize:13, fontWeight:500, color:'#8A8070', cursor:'pointer', background:'none', border:'none', fontFamily:'DM Sans, sans-serif', display:'flex', alignItems:'center', gap:4 }}>
            ← {isFr ? 'Retour' : 'Back'}
          </button>
        </div>
        {!user && (
          <button onClick={onLoginRequired}
            style={{ fontSize:13, fontWeight:600, padding:'8px 18px', borderRadius:20, border:'1px solid rgba(0,0,0,.12)', background:'transparent', color:'#3D3829', cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>
            {isFr ? 'Se connecter' : 'Sign in'}
          </button>
        )}
      </div>

      <div className="gpp-wrap" style={{ maxWidth:680, margin:'0 auto', paddingBottom:60 }}>

        {/* Hero */}
        <div className="gpp-hero" style={{ padding:'32px 32px 24px', borderBottom:'1px solid rgba(0,0,0,.06)' }}>
          <div style={{ display:'flex', alignItems:'flex-start', gap:20 }}>
            <div style={{ position:'relative', flexShrink:0 }}>
              <div style={{ width:72, height:72, borderRadius:'50%', background:gp.bg||'#FFF8EB', color:gp.color||'#C8891C', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'DM Serif Display, serif', fontSize:24, fontWeight:700, border:'2px solid rgba(200,137,28,.2)' }}>
                {initials}
              </div>
              {gp.id_verified && (
                <div style={{ position:'absolute', bottom:0, right:0, width:22, height:22, borderRadius:'50%', background:'#fff', border:'2px solid #F0C878', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <ShieldCheckIcon size={12} color="#C8891C" />
                </div>
              )}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:'DM Serif Display, serif', fontSize:26, color:'#1A1710', letterSpacing:'-.5px', marginBottom:4 }}>{gp.name}</div>
              {gp.member_since && (
                <div style={{ fontSize:12, color:'#B0A090', marginBottom:8 }}>{isFr ? 'Membre depuis' : 'Member since'} {gp.member_since}</div>
              )}
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12 }}>
                <Stars rating={rating} />
                <span style={{ fontSize:14, fontWeight:700, color:'#1A1710' }}>{rating.toFixed(1)}</span>
                {gp.trips_count > 0 && <span style={{ fontSize:13, color:'#8A8070' }}>· {gp.trips_count} {isFr ? 'voyages' : 'trips'}</span>}
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {gp.phone_verified && (
                  <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:11, fontWeight:600, borderRadius:20, padding:'3px 10px', background:'#F0FAF4', color:'#1A5C38', border:'1px solid #B8DCC8' }}>
                    <span style={{ width:5, height:5, borderRadius:'50%', background:'#2D8B4E', display:'inline-block' }}/>
                    {isFr ? 'Téléphone vérifié' : 'Phone verified'}
                  </span>
                )}
                {gp.id_verified && (
                  <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:11, fontWeight:600, borderRadius:20, padding:'3px 10px', background:'#FFF8EB', color:'#7A5200', border:'1px solid #EABD6A' }}>
                    <span style={{ width:5, height:5, borderRadius:'50%', background:'#C8891C', display:'inline-block' }}/>
                    ID verified
                  </span>
                )}
                {gp.community_verified && (
                  <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:11, fontWeight:600, borderRadius:20, padding:'3px 10px', background:'#F3F2FD', color:'#534AB7', border:'1px solid #C4C2ED' }}>
                    <span style={{ width:5, height:5, borderRadius:'50%', background:'#534AB7', display:'inline-block' }}/>
                    {isFr ? 'Communauté' : 'Community'}
                  </span>
                )}
              </div>
              {/* Trust Badges from new system */}
              <div style={{ marginTop: 10 }}>
                <TrustBadges profile={gp} lang={lang} size="md" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="gpp-stats" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', borderBottom:'1px solid rgba(0,0,0,.06)', background:'#fff' }}>
          {[
            { n: gp.trips_count || 0, l: isFr ? 'Voyages' : 'Trips done' },
            { n: gp.delivered > 0 ? `${gp.delivered} kg` : '—', l: isFr ? 'Livrés' : 'Delivered' },
            { n: `${Math.round((gp.trips_count || 1) / Math.max(gp.trips_count || 1, 1) * 100)}%`, l: isFr ? 'Réussite' : 'Success' },
          ].map(({ n, l }, i) => (
            <div key={l} style={{ padding:'20px 24px', borderRight: i < 2 ? '1px solid rgba(0,0,0,.06)' : 'none', textAlign:'center' }}>
              <div style={{ fontFamily:'DM Serif Display, serif', fontSize:26, color:'#1A1710', letterSpacing:'-.5px' }}>{n}</div>
              <div style={{ fontSize:12, color:'#8A8070', marginTop:3 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Trip details */}
        <div className="gpp-section" style={{ padding:'24px 32px', borderBottom:'1px solid rgba(0,0,0,.06)' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#B0A090', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:16 }}>
            {isFr ? 'Voyage actuel' : 'Current trip'}
          </div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, background:'#FFF8EB', border:'1px solid #F0C878', borderRadius:10, padding:'10px 16px', marginBottom:20 }}>
            <PlaneIcon size={18} color="#C8891C" />
            <span style={{ fontFamily:'DM Serif Display, serif', fontSize:16, color:'#C8891C' }}>
              {fromCity} → {toCity}
              {gp.date && <span style={{ fontWeight:400, color:'#8A8070', fontSize:14 }}> &nbsp;·&nbsp; {gp.date}</span>}
            </span>
          </div>
          <div className="gpp-trip-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
            {[
              { label: isFr ? 'Espace dispo' : 'Space available', value: gp.space ? `~${gp.space} kg` : '—', color:'#1A1710' },
              { label: isFr ? 'Prix / kg' : 'Price per kg', value: price || (isFr ? 'À négocier' : 'Negotiable'), color:'#C8891C' },
              { label: isFr ? 'Temps de réponse' : 'Response time', value: gp.response_time || '—', color:'#2D8B4E' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background:'#FDFBF7', border:'1px solid rgba(0,0,0,.06)', borderRadius:12, padding:14 }}>
                <div style={{ fontSize:11, color:'#B0A090', fontWeight:500, marginBottom:6, textTransform:'uppercase', letterSpacing:'.06em' }}>{label}</div>
                <div style={{ fontFamily:'DM Serif Display, serif', fontSize:18, fontWeight:700, color }}>{value}</div>
              </div>
            ))}
          </div>
          
          {/* Flight Price Info - Live */}
          {fromCity && toCity && (
            <div style={{ marginTop: 20, padding: 16, background: '#F0F7FF', border: '1px solid #B8D4E8', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#185FA5"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#185FA5', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                  {priceLoading ? (isFr ? 'Chargement des prix...' : 'Loading prices...') : 
                   flightPrices?.source === 'live' ? (isFr ? 'Prix du vol (live)' : 'Flight Price (live)') :
                   (isFr ? 'Prix du vol (estimation)' : 'Flight Price (estimate)')}
                </span>
                {flightPrices?.source === 'live' && (
                  <span style={{ fontSize: 10, background: '#185FA5', color: '#fff', padding: '2px 6px', borderRadius: 10, marginLeft: 4 }}>
                    LIVE
                  </span>
                )}
              </div>
              
              {priceLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 16, height: 16, border: '2px solid #B8D4E8', borderTop: '2px solid #185FA5', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  <span style={{ fontSize: 13, color: '#5A7A95' }}>
                    {isFr ? 'Recherche des meilleurs tarifs...' : 'Searching for best fares...'}
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20, color: '#185FA5', fontWeight: 700 }}>
                      {flightPrices?.prices ? 
                        `$${flightPrices.prices.low} – $${flightPrices.prices.high}` :
                        '$850 – $1,400'
                      }
                    </div>
                    <div style={{ fontSize: 12, color: '#5A7A95', marginTop: 2 }}>
                      {fromCode} → {toCode}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: '#5A7A95' }}>
                      {flightPrices?.prices?.duration || '8-10h'}
                    </div>
                    <div style={{ fontSize: 11, color: '#8A8070', marginTop: 4, fontStyle: 'italic' }}>
                      * {isFr ? 'Prix indicatifs, sujets à variation' : 'Indicative prices, subject to change'}
                    </div>
                    {flightPrices?.source === 'live' && (
                      <div style={{ fontSize: 10, color: '#2D8B4E', marginTop: 2 }}>
                        ✓ {isFr ? 'Mis à jour aujourd\'hui' : 'Updated today'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Contact */}
        <div className="gpp-section" style={{ padding:'24px 32px', borderBottom:'1px solid rgba(0,0,0,.06)' }}>
          <div style={{ fontFamily:'DM Serif Display, serif', fontSize:22, color:'#1A1710', marginBottom:4 }}>
            {isFr ? `Contacter ${gp.name?.split(' ')[0]}` : `Contact ${gp.name?.split(' ')[0]}`}
          </div>

          {!gp.whatsapp_verified ? (
            /* ── Unverified: contact locked ── */
            <div style={{ background:'#F9F7F4', border:'1px solid rgba(0,0,0,.08)', borderRadius:14, padding:'20px 20px', marginTop:16, textAlign:'center' }}>
              <div style={{ display:'flex', justifyContent:'center', marginBottom:10 }}><LockIcon size={32} color="#C0B8B0" /></div>
              <div style={{ fontSize:15, fontWeight:700, color:'#1A1710', marginBottom:6 }}>
                {isFr ? 'Contact indisponible' : 'Contact unavailable'}
              </div>
              <p style={{ fontSize:13, color:'#8A8070', lineHeight:1.6, margin:0 }}>
                {isFr
                  ? `${gp.name?.split(' ')[0]} n'a pas encore vérifié son numéro WhatsApp. Les coordonnées seront visibles après vérification.`
                  : `${gp.name?.split(' ')[0]} hasn't verified their WhatsApp yet. Contact details will appear once verified.`}
              </p>
            </div>
          ) : (
            /* ── Verified: show contact button ── */
            <>
              <div style={{ fontSize:13, color:'#8A8070', marginBottom:20, marginTop:4 }}>
                {isFr ? 'Connectez-vous pour contacter via WhatsApp' : 'Sign in to message directly on WhatsApp'}
              </div>
              {!user && (
                <div style={{ display:'flex', alignItems:'center', gap:8, background:'#FFF8EB', borderRadius:10, padding:'12px 16px', marginBottom:16, border:'1px solid #F0C878' }}>
                  <LockIcon size={14} color="#C8891C" />
                  <span style={{ fontSize:13, color:'#C8891C', fontWeight:500 }}>
                    {isFr ? 'Créez un compte gratuit pour voir les coordonnées' : 'Create a free account to see contact details'}
                  </span>
                </div>
              )}
              <button onClick={handleContact}
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, width:'100%', padding:14, borderRadius:12, border:'none', background:'#25D366', color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'DM Sans, sans-serif', marginBottom:10 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a13 13 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                {isFr ? 'Contacter sur WhatsApp' : 'Message on WhatsApp'}
              </button>
              {gp.response_time && (
                <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:8 }}>
                  <div style={{ width:7, height:7, borderRadius:'50%', background:'#25D366' }}/>
                  <span style={{ fontSize:12, color:'#8A8070' }}>
                    {isFr ? `Répond généralement en ${gp.response_time}` : `Usually responds within ${gp.response_time}`}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Note */}
        {gp.note && (
          <div className="gpp-section" style={{ padding:'24px 32px', borderBottom:'1px solid rgba(0,0,0,.06)' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#B0A090', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:12 }}>
              {isFr ? 'Note du voyageur' : "Traveler's note"}
            </div>
            <div style={{ fontSize:15, color:'#3D3829', lineHeight:1.7, fontStyle:'italic' }}>"{gp.note}"</div>
          </div>
        )}

        {/* Review */}
        <div className="gpp-section" style={{ padding:'24px 32px' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#B0A090', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:16 }}>
            {isFr ? `Avis (${gp.review_text ? 1 : 0})` : `Reviews (${gp.review_text ? 1 : 0})`}
          </div>
          {gp.review_text ? (
            <div style={{ background:'#fff', border:'1px solid rgba(0,0,0,.06)', borderRadius:12, padding:'16px 20px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background:'#FFF8EB', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#C8891C' }}>
                  {gp.review_author?.split(' ').map(w=>w[0]).join('').slice(0,2) || 'R'}
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:'#1A1710' }}>{gp.review_author}</div>
                  <div style={{ display:'flex', gap:1 }}>
                    {[1,2,3,4,5].map(i => <span key={i} style={{ color:'#C8891C', fontSize:11 }}>★</span>)}
                  </div>
                </div>
              </div>
              <div style={{ fontSize:14, color:'#3D3829', lineHeight:1.7 }}>"{gp.review_text}"</div>
            </div>
          ) : (
            <div style={{ fontSize:13, color:'#B0A090', fontStyle:'italic' }}>
              {isFr ? "Pas encore d'avis." : 'No reviews yet.'}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
