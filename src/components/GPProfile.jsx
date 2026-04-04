import { translations } from '../utils/translations'

function Stars({ rating, size = 14 }) {
  return (
    <span>
      {[1,2,3,4,5].map((i) => (
        <span key={i} style={{ color: i <= Math.round(rating) ? '#C8810A' : '#e0e0e0', fontSize: size }}>★</span>
      ))}
    </span>
  )
}

export default function GPProfile({ gp, lang, user, onLoginRequired, onBack }) {
  const t = translations[lang]
  const isFr = lang === 'fr'
  const route = gp.from === 'Paris' ? `Paris → ${gp.to}` : `${gp.from} → ${gp.to}`

  const handleContact = () => {
    if (!user) { onLoginRequired(); return }
    const message = encodeURIComponent(
      `Hi ${gp.name}, I found you on Yobbu and I'd like to send a package to ${gp.to}. Can we discuss the details?`
    )
    const phone = gp.phone?.replace(/\D/g, '')
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
  }

  return (
    <div style={{ fontFamily:"'Inter',sans-serif", background:'#fff', minHeight:'100vh' }}>
      {/* Nav */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'18px 32px', borderBottom:'1px solid #f0f0f0', position:'sticky', top:0,
        background:'#fff', zIndex:50 }}>
        <div style={{ display:'flex', alignItems:'center', gap:20 }}>
          <div style={{ fontFamily:"'Fraunces',serif", fontSize:20, fontWeight:700, color:'#1a1a1a' }}>
            Yob<span style={{ color:'#C8810A' }}>bu</span>
          </div>
          <button onClick={onBack}
            style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, fontWeight:500,
              color:'#666', cursor:'pointer', background:'none', border:'none',
              fontFamily:"'Inter',sans-serif" }}>
            ← {isFr ? 'Tous les voyageurs' : 'All travelers'}
          </button>
        </div>
        {!user && (
          <button onClick={onLoginRequired}
            style={{ fontSize:13, fontWeight:600, padding:'8px 18px', borderRadius:6,
              border:'1.5px solid #1a1a1a', background:'#fff', cursor:'pointer',
              fontFamily:"'Inter',sans-serif", transition:'all .15s' }}>
            {isFr ? 'Se connecter' : 'Log in'}
          </button>
        )}
      </div>

      <div style={{ maxWidth:680, margin:'0 auto', paddingBottom:60 }}>

        {/* Profile hero */}
        <div style={{ padding:'32px 32px 24px', borderBottom:'1px solid #f0f0f0' }}>
          <div style={{ display:'flex', alignItems:'flex-start', gap:20 }}>
            <div style={{ position:'relative', flexShrink:0 }}>
              <div style={{ width:80, height:80, borderRadius:'50%', background:'#C8810A',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:26, fontWeight:800, color:'#fff' }}>
                {gp.initials}
              </div>
              {gp.verified.id && (
                <div style={{ position:'absolute', bottom:2, right:2, width:20, height:20,
                  borderRadius:'50%', background:'#1A5C38', border:'2px solid #fff',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:9, color:'#fff' }}>✓</div>
              )}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:26, fontWeight:800, color:'#1a1a1a', letterSpacing:'-.5px', marginBottom:3 }}>
                {gp.name}
              </div>
              <div style={{ fontSize:13, color:'#999', marginBottom:10 }}>
                {t.memberSince} {gp.memberSince}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12 }}>
                <Stars rating={gp.rating} />
                <span style={{ fontSize:14, fontWeight:700, color:'#1a1a1a' }}>{gp.rating.toFixed(1)}</span>
                <span style={{ fontSize:13, color:'#999' }}>· {gp.trips} {t.tripsLabel}</span>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                {gp.verified.phone && (
                  <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:11,
                    fontWeight:600, borderRadius:4, padding:'3px 8px', background:'#f5f5f5', color:'#444' }}>
                    <span style={{ width:6, height:6, borderRadius:'50%', background:'#1A5C38', display:'inline-block' }}></span>
                    {t.badgePhone}
                  </span>
                )}
                {gp.verified.id && (
                  <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:11,
                    fontWeight:600, borderRadius:4, padding:'3px 8px', background:'#f5f5f5', color:'#444' }}>
                    <span style={{ width:6, height:6, borderRadius:'50%', background:'#C8810A', display:'inline-block' }}></span>
                    {t.badgeId}
                  </span>
                )}
                {gp.verified.community && (
                  <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:11,
                    fontWeight:600, borderRadius:4, padding:'3px 8px', background:'#f5f5f5', color:'#444' }}>
                    <span style={{ width:6, height:6, borderRadius:'50%', background:'#7A3B1E', display:'inline-block' }}></span>
                    {t.badgeCommunity}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', borderBottom:'1px solid #f0f0f0' }}>
          {[
            { n: gp.trips, l: isFr ? 'Voyages' : 'Trips done' },
            { n: `${gp.delivered} kg`, l: isFr ? 'Livrés' : 'Delivered' },
            { n: '100%', l: isFr ? 'Réussite' : 'Success rate' },
          ].map(({ n, l }, i) => (
            <div key={l} style={{ padding:'20px 24px',
              borderRight: i < 2 ? '1px solid #f0f0f0' : 'none' }}>
              <div style={{ fontSize:24, fontWeight:800, color:'#1a1a1a', letterSpacing:'-.5px' }}>{n}</div>
              <div style={{ fontSize:12, color:'#999', marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Trip details */}
        <div style={{ padding:'24px 32px', borderBottom:'1px solid #f0f0f0' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#999', textTransform:'uppercase',
            letterSpacing:'.1em', marginBottom:16 }}>
            {isFr ? 'Voyage actuel' : 'Current trip'}
          </div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8,
            background:'#fff8ee', border:'1px solid #fde8b8', borderRadius:8,
            padding:'10px 16px', marginBottom:16 }}>
            <span style={{ fontSize:16 }}>✈️</span>
            <span style={{ fontSize:14, fontWeight:600, color:'#C8810A' }}>{route} &nbsp;·&nbsp; {gp.date}</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[
              { label: isFr ? 'Espace disponible' : 'Space available', value: `~${gp.space} kg`, color:'#1a1a1a' },
              { label: isFr ? 'Prix par kg' : 'Price per kg', value: gp.price, color:'#C8810A' },
              { label: isFr ? 'Temps de réponse' : 'Response time', value: gp.responseTime, color:'#1A5C38' },
              { label: isFr ? 'Statut' : 'Status', value: isFr ? 'Disponible' : 'Available', color:'#1A5C38' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background:'#fafafa', borderRadius:10, padding:14 }}>
                <div style={{ fontSize:11, color:'#999', fontWeight:500, marginBottom:4 }}>{label}</div>
                <div style={{ fontSize:15, fontWeight:700, color }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div style={{ padding:'24px 32px', borderBottom:'1px solid #f0f0f0' }}>
          <div style={{ fontSize:20, fontWeight:800, color:'#1a1a1a', letterSpacing:'-.3px', marginBottom:4 }}>
            {isFr ? `Contacter ${gp.name.split(' ')[0]}` : `Contact ${gp.name.split(' ')[0]}`}
          </div>
          <div style={{ fontSize:13, color:'#999', marginBottom:16 }}>
            {isFr ? 'Connectez-vous pour contacter via WhatsApp' : 'Log in to message directly on WhatsApp'}
          </div>
          {!user && (
            <div style={{ display:'flex', alignItems:'center', gap:8, background:'#fff8ee',
              borderRadius:8, padding:'10px 14px', marginBottom:14, border:'1px solid #fde8b8' }}>
              <span>🔒</span>
              <span style={{ fontSize:12, color:'#C8810A', fontWeight:500 }}>
                {isFr ? 'Créez un compte gratuit pour voir les coordonnées' : 'Create a free account to see contact details'}
              </span>
            </div>
          )}
          <button onClick={handleContact}
            style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              width:'100%', padding:14, borderRadius:10, border:'none', background:'#25D366',
              color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer',
              fontFamily:"'Inter',sans-serif", marginBottom:10 }}>
            <span style={{ fontSize:18 }}>💬</span>
            {isFr ? 'Message sur WhatsApp' : 'Message on WhatsApp'}
          </button>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
            border:'1px solid #eee', borderRadius:10, padding:'12px 16px' }}>
            <span style={{ fontSize:14, fontWeight:500, color: user ? '#1a1a1a' : '#999' }}>
              {user ? (gp.phone || '+1 (212) 555-0100') : '+1 (212) 555-••••'}
            </span>
            <button onClick={user ? () => navigator.clipboard.writeText(gp.phone || '') : onLoginRequired}
              style={{ fontSize:12, fontWeight:600, color:'#C8810A', background:'none',
                border:'none', cursor:'pointer', fontFamily:"'Inter',sans-serif" }}>
              {user ? (isFr ? 'Copier' : 'Copy') : (isFr ? 'Se connecter →' : 'Log in →')}
            </button>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:12 }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:'#25D366' }}></div>
            <span style={{ fontSize:12, color:'#999' }}>
              {isFr ? 'Répond généralement' : 'Usually responds'}
            </span>
            <span style={{ fontSize:12, fontWeight:600, color:'#1a1a1a' }}>
              {isFr ? 'en' : 'within'} {gp.responseTime}
            </span>
          </div>
        </div>

        {/* Reviews */}
        <div style={{ padding:'24px 32px' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#999', textTransform:'uppercase',
            letterSpacing:'.1em', marginBottom:16 }}>
            {isFr ? `Avis (${gp.review?.text ? 1 : 0})` : `Reviews (${gp.review?.text ? 1 : 0})`}
          </div>
          {gp.review?.text ? (
            <div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:30, height:30, borderRadius:'50%', background:'#f0f0f0',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:11, fontWeight:700, color:'#666' }}>
                    {gp.review.author?.split(' ').map(w=>w[0]).join('').slice(0,2)}
                  </div>
                  <span style={{ fontSize:13, fontWeight:600, color:'#1a1a1a' }}>{gp.review.author}</span>
                </div>
                <Stars rating={5} size={12} />
              </div>
              <div style={{ fontSize:14, color:'#444', lineHeight:1.6 }}>"{gp.review.text}"</div>
            </div>
          ) : (
            <div style={{ fontSize:13, color:'#999' }}>
              {isFr ? 'Pas encore d\'avis.' : 'No reviews yet.'}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}