import { useState, useEffect } from 'react'

const DESTINATIONS = [
  { value: '',        en: 'Select destination',     fr: 'Choisir destination' },
  { value: 'Dakar',   en: 'Dakar, Senegal',         fr: 'Dakar, Sénégal' },
  { value: 'Conakry', en: 'Conakry, Guinea',        fr: 'Conakry, Guinée' },
  { value: 'Abidjan', en: "Abidjan, Côte d'Ivoire", fr: "Abidjan, Côte d'Ivoire" },
  { value: 'Bamako',  en: 'Bamako, Mali',           fr: 'Bamako, Mali' },
]

const FROM_CITIES = [
  { value: '',              en: 'Any city',      fr: 'Toute ville' },
  { value: 'New York',      en: 'New York',      fr: 'New York' },
  { value: 'Paris',         en: 'Paris',         fr: 'Paris' },
  { value: 'Washington DC', en: 'Washington DC', fr: 'Washington DC' },
  { value: 'Atlanta',       en: 'Atlanta',       fr: 'Atlanta' },
  { value: 'Houston',       en: 'Houston',       fr: 'Houston' },
]

const TRAVELERS = [
  { initials: 'AM', name: 'Aminata M.', from: 'JFK', fromCity: 'New York', to: 'DSS', toCity: 'Dakar', date: 'Apr 18', deliveries: 18, rating: 4.9, verified: true, color: '#10B981' },
  { initials: 'OD', name: 'Oumar D.',   from: 'CDG', fromCity: 'Paris',    to: 'DSS', toCity: 'Dakar', date: 'Apr 22', deliveries: 7,  rating: 4.2, verified: false, color: '#2D8B4E' },
  { initials: 'FN', name: 'Fatou N.',   from: 'JFK', fromCity: 'New York', to: 'CKY', toCity: 'Conakry', date: 'May 1', deliveries: 3, rating: 5.0, verified: true, color: '#7A3B1E' },
  { initials: 'IK', name: 'Ibrahima K.', from: 'JFK', fromCity: 'New York', to: 'DSS', toCity: 'Dakar', date: 'May 5', deliveries: 11, rating: 4.7, verified: true, color: '#185FA5' },
]

export default function Hero({ lang, setView, onSearch, onSend }) {
  const isFr = lang === 'fr'
  const [dest, setDest] = useState('')
  const [from, setFrom] = useState('')
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [mobileTab, setMobileTab] = useState('send') // 'send' | 'travel'
  const handleSwap = () => {
    const oldDest = dest
    const oldFrom = from
    setDest(oldFrom)
    setFrom(oldDest)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimating(true)
      setTimeout(() => {
        setCurrent(c => (c + 1) % TRAVELERS.length)
        setAnimating(false)
      }, 300)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleSearch = () => {
    onSearch({ dest, from })
    setView('browse')
  }

  const t = TRAVELERS[current]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600&display=swap');
        .hero-section { font-family: 'DM Sans', sans-serif; }
        .hero-section h1 { font-family: 'DM Serif Display', serif; }
        .route-card-title { font-family: 'DM Serif Display', serif; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes fly { 0% { left:0; } 100% { left:calc(100% - 14px); } }
        @keyframes slideIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideOut { from { opacity:1; transform:translateY(0); } to { opacity:0; transform:translateY(-12px); } }
        .anim-1 { animation: fadeUp 0.6s ease-out both; }
        .anim-2 { animation: fadeUp 0.6s 0.1s ease-out both; }
        .anim-3 { animation: fadeUp 0.6s 0.2s ease-out both; }
        .anim-4 { animation: fadeUp 0.6s 0.3s ease-out both; }
        .anim-5 { animation: fadeUp 0.6s 0.4s ease-out both; }
        .anim-6 { animation: fadeUp 0.8s 0.3s ease-out both; }
        .pulse-dot { animation: pulse 2s infinite; }
        .fly-plane::after { content:'✈'; position:absolute; top:-10px; font-size:14px; animation:fly 3s ease-in-out infinite; color:#10B981; }
        .card-enter { animation: slideIn 0.3s ease-out both; }
        .card-exit { animation: slideOut 0.3s ease-out both; }
        .btn-find:hover .arrow-circle { transform: translateX(3px); }
        .btn-find:hover { background: #E5A630 !important; }
        .send-btn:hover { background: #1F2937 !important; transform: translateY(-1px); }
        .dot-btn { transition: all .2s; }
        .dot-btn.active { width: 20px !important; border-radius: 3px !important; }
        .mobile-search-block { display: none; }
        @media (max-width: 768px) {
          .hero-section { background: #FDFBF7 !important; height: 100dvh; overflow-y: auto; }
          .hero-section > section { height: 100dvh; min-height: 100dvh; display: flex; flex-direction: column; overflow: hidden; }
          .hero-grid { display: none !important; }
          .stats-bar { display: none !important; }
          .mobile-search-block { display: flex; flex-direction: column; justify-content: flex-start; padding-top: 24px; flex: 1; padding: 24px 20px 32px; box-sizing: border-box; }
          .swap-btn { width: 34px; height: 34px; background: #fff; border: 1px solid #E0D8CE; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10; box-shadow: 0 1px 4px rgba(0,0,0,.08); flex-shrink: 0; transition: background .15s; }
          .swap-btn:hover { background: #F7F4F0; }
          .mobile-btn-find { display: flex; align-items: center; justify-content: center; gap: 9px; background: #10B981; color: #fff; border: none; border-radius: 16px; padding: 22px 24px; font-family: 'DM Sans', sans-serif; font-size: 17px; font-weight: 700; cursor: pointer; width: 100%; margin-bottom: 14px; box-shadow: 0 4px 14px rgba(200,137,28,.35); transition: background .2s; }
          .mobile-btn-find:hover { background: #E5A630; }
        }
      `}</style>

      <div className="hero-section" style={{ background: '#FDFBF7', color: '#1F2937' }}>
        <section style={{ overflow: 'hidden', position: 'relative' }}>
          <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 900px 700px at 75% 45%, rgba(200,137,28,.10) 0%, transparent 70%)', pointerEvents:'none' }} />

          {/* ── Mobile layout ── */}
          <div className="mobile-search-block">

            {/* Tab switcher */}
            <div style={{ display:'flex', gap:10, marginBottom:32 }}>
              {[
                { id:'send', label: isFr ? 'Envoyer' : 'Send' },
                { id:'travel', label: isFr ? 'GP' : 'GP' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setMobileTab(tab.id)}
                  style={{
                    flex: 1, padding: '14px 20px', borderRadius: 28, border: 'none',
                    background: mobileTab === tab.id ? '#fff' : 'rgba(245,243,241,.5)',
                    color: mobileTab === tab.id ? '#1F2937' : '#9CA3AF',
                    fontSize: 15, fontWeight: mobileTab === tab.id ? 700 : 500, cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                    boxShadow: mobileTab === tab.id ? '0 2px 8px rgba(0,0,0,.08)' : 'none',
                    transition: 'all .2s',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── SEND tab ── */}
            {mobileTab === 'send' && (
              <>
                <h1 style={{ fontSize:24, fontFamily:'DM Serif Display, serif', fontWeight:700, color:'#1F2937', textAlign:'left', marginBottom:12, lineHeight:1.3 }}>
                  {isFr
                    ? <>Envoyez un colis <span style={{ fontStyle:'italic', color:'#10B981' }}>directement</span> chez votre famille.</>
                    : <>Send a package <span style={{ fontStyle:'italic', color:'#10B981' }}>directly</span> to your family back home.</>}
                </h1>
                <p style={{ fontSize:13, color:'#6B7280', textAlign:'left', marginBottom:24, lineHeight:1.6 }}>
                  {isFr
                    ? 'Trouvez un GP de confiance. Contactez-le sur WhatsApp. Votre famille reçoit le colis en quelques jours.'
                    : 'Find a trusted GP heading your way. Contact them on WhatsApp. Your family gets it in days.'}
                </p>

                {/* Origin / Destination card */}
                <div style={{ background:'#fff', borderRadius:16, overflow:'hidden', border:'1.5px solid #E5E0D8', marginBottom:18 }}>
                  <div style={{ display:'flex', alignItems:'center', padding:'18px 16px', borderBottom:'1.5px solid #E5E0D8', gap:12 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:10, fontWeight:700, color:'#6B7280', marginBottom:4, textTransform:'uppercase', letterSpacing:'.08em' }}>{isFr ? 'Je suis à' : 'I am at'}</div>
                      <select value={from} onChange={e => setFrom(e.target.value)}
                        style={{ width:'100%', border:'none', fontFamily:'DM Sans, sans-serif', fontSize:16, fontWeight:600, color: from ? '#1F2937' : '#999', background:'transparent', cursor:'pointer', appearance:'none', outline:'none' }}>
                        {FROM_CITIES.map(c => <option key={c.value} value={c.value}>{c.value === '' ? (isFr ? 'Votre ville...' : 'Your city...') : (c[lang] || c.en)}</option>)}
                      </select>
                    </div>
                    <button className="swap-btn" onClick={handleSwap} style={{ width:32, height:32, background:'#fff', border:'1px solid #E5E0D8', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, transition:'all .15s' }} aria-label="Swap">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M8 2.5V13.5M8 2.5L5 5.5M8 2.5L11 5.5M8 13.5L5 10.5M8 13.5L11 10.5" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  <div style={{ padding:'16px' }}>
                    <div style={{ fontSize:10, fontWeight:700, color:'#6B7280', marginBottom:4, textTransform:'uppercase', letterSpacing:'.08em' }}>{isFr ? 'Ma famille est à' : 'My family is at'}</div>
                    <select value={dest} onChange={e => setDest(e.target.value)}
                      style={{ width:'100%', border:'none', fontFamily:'DM Sans, sans-serif', fontSize:16, fontWeight:600, color: dest ? '#1F2937' : '#999', background:'transparent', cursor:'pointer', appearance:'none', outline:'none' }}>
                      {DESTINATIONS.map(d => <option key={d.value} value={d.value}>{d.value === '' ? (isFr ? 'Leur ville...' : 'Their city...') : (d[lang] || d.en)}</option>)}
                    </select>
                  </div>
                </div>

                <button className="mobile-btn-find" onClick={handleSearch} style={{ width:'100%', padding:'16px', borderRadius:16, border:'none', background:'#10B981', color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans', sans-serif", marginBottom:16, display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all .2s' }}>
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                    <circle cx="7.5" cy="7.5" r="5.5" stroke="white" strokeWidth="1.8"/>
                    <path d="M11.5 11.5L15.5 15.5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                  {isFr ? 'Voir les GPs disponibles' : 'View available GPs'}
                </button>

                <button
                  onClick={() => setView('send')}
                  style={{
                    width:'100%', padding:'14px', borderRadius:14, border:'1.5px solid #E5E0D8',
                    background:'#fff', color:'#1F2937', fontSize:14, fontWeight:600,
                    cursor:'pointer', fontFamily:"'DM Sans', sans-serif", transition:'all .2s'
                  }}
                >
                  {isFr ? 'Poster une demande' : 'Post a request'}
                </button>

                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginTop:18, fontSize:12, color:'#6B7280' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  {isFr ? 'Tous les GPs sont vérifiés' : 'All GPs verified'}
                </div>
              </>
            )}

            {/* ── TRAVEL tab ── */}
            {mobileTab === 'travel' && (
              <>
                <h1 style={{ fontSize:26, fontFamily:'DM Serif Display, serif', fontWeight:700, color:'#1F2937', textAlign:'center', marginBottom:8, lineHeight:1.2 }}>
                  {isFr
                    ? <>Voyagez et <em style={{ fontStyle:'italic', color:'#10B981' }}>gagnez</em> de l&apos;argent.</>
                    : <>Travel and <em style={{ fontStyle:'italic', color:'#10B981' }}>earn</em> money on the way.</>}
                </h1>
                <p style={{ fontSize:14, color:'#6B6860', textAlign:'center', marginBottom:24, lineHeight:1.5 }}>
                  {isFr
                    ? 'Rentabilisez votre bagage en transportant des colis pour la diaspora. Postez votre voyage, recevez des demandes.'
                    : 'Make money on trips you\'re already taking. Post your route, get package requests from the diaspora.'}
                </p>

                {/* How it works */}
                <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:28 }}>
                  {[
                    { n:'1', text: isFr ? 'Postez votre voyage et votre route' : 'Post your trip and route' },
                    { n:'2', text: isFr ? 'Recevez des demandes de colis' : 'Receive package requests' },
                    { n:'3', text: isFr ? 'Transportez et gagnez de l\'argent' : 'Carry packages and get paid' },
                  ].map(({ n, text }) => (
                    <div key={n} style={{ display:'flex', alignItems:'center', gap:14, background:'#fff', borderRadius:12, padding:'12px 16px', border:'1px solid #F0EDE8' }}>
                      <div style={{ width:28, height:28, borderRadius:'50%', background:'#10B981', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff', flexShrink:0 }}>{n}</div>
                      <span style={{ fontSize:14, color:'#1F2937', fontWeight:500 }}>{text}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setView('phone-auth')}
                  style={{
                    width:'100%', padding:'18px', borderRadius:16, border:'none',
                    background:'#1F2937', color:'#fff', fontSize:16, fontWeight:700,
                    cursor:'pointer', fontFamily:"'DM Sans', sans-serif",
                    marginBottom:12, boxShadow:'0 4px 14px rgba(0,0,0,.25)',
                  }}
                >
                  {isFr ? 'Voyager avec Yobbu \u2192' : 'Travel with Yobbu \u2192'}
                </button>

                <div style={{ display:'flex', gap:8 }}>
                  <button
                    onClick={() => setView('phone-auth')}
                    style={{
                      flex:1, padding:'12px 0', borderRadius:12, border:'1.5px solid #E5E1DB',
                      background:'transparent', color:'#6B7280', fontSize:13, fontWeight:600,
                      cursor:'pointer', fontFamily:"'DM Sans', sans-serif",
                    }}
                  >
                    {isFr ? 'Se connecter' : 'Log in'}
                  </button>
                  <button
                    onClick={() => setView('browse')}
                    style={{
                      flex:1, padding:'12px 0', borderRadius:12, border:'1.5px solid #E5E1DB',
                      background:'transparent', color:'#6B7280', fontSize:13, fontWeight:600,
                      cursor:'pointer', fontFamily:"'DM Sans', sans-serif",
                    }}
                  >
                    {isFr ? 'Voir les annonces' : 'Browse trips'}
                  </button>
                </div>
              </>
            )}

          </div>

          {/* ── Desktop layout (unchanged) ── */}
          <div className="hero-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center', maxWidth:1280, margin:'0 auto', width:'100%', position:'relative', zIndex:2, padding:'64px 48px 80px' }}>

            {/* Left */}
            <div className="hero-left" style={{ display:'flex', flexDirection:'column' }}>
              <div className="anim-1 hero-badge" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#fff', border:'1px solid rgba(200,137,28,.2)', padding:'8px 18px', borderRadius:100, fontSize:13, fontWeight:500, color:'#1F2937', marginBottom:32 }}>
                <span className="pulse-dot" style={{ width:8, height:8, background:'#2D8B4E', borderRadius:'50%', display:'inline-block' }} />
                {isFr ? 'La plateforme de la diaspora ouest-africaine' : 'Package delivery for the West African diaspora'}
              </div>

              <h1 className="anim-2 hero-title" style={{ fontSize:'clamp(40px,4.5vw,64px)', lineHeight:1.08, letterSpacing:'-1.5px', color:'#1F2937', marginBottom:20 }}>
                {isFr
                  ? <>{`Envoyez un colis`}<br /><em style={{ fontStyle:'italic', color:'#10B981' }}>directement</em>{` chez`}<br />{`votre famille.`}</>
                  : <>Send a package<br /><em style={{ fontStyle:'italic', color:'#10B981' }}>directly</em> to your<br />family back home.</>}
              </h1>

              {/* 3-step explainer — answers "what is this?" instantly */}
              <div className="anim-3" style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:32 }}>
                {[
                  { n:'1', text: isFr ? 'Trouvez un GP qui part vers votre pays' : 'Find a GP heading to your country' },
                  { n:'2', text: isFr ? 'Contactez-les sur WhatsApp — négociez le prix' : 'Contact them on WhatsApp — agree on a price' },
                  { n:'3', text: isFr ? 'Votre famille reçoit le colis en quelques jours' : 'Your family receives it in days, not weeks' },
                ].map(({ n, text }) => (
                  <div key={n} style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:26, height:26, borderRadius:'50%', background:'#FDF6ED', border:'1.5px solid rgba(200,137,28,.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#10B981', flexShrink:0 }}>{n}</div>
                    <span style={{ fontSize:15, color:'#5A5348', lineHeight:1.4 }}>{text}</span>
                  </div>
                ))}
              </div>

              {/* Desktop Search bar */}
              <div className="search-bar desktop-search-field anim-4 hero-search" style={{ display:'flex', alignItems:'stretch', background:'#fff', borderRadius:16, boxShadow:'0 2px 8px rgba(0,0,0,.04), 0 12px 40px rgba(0,0,0,.06)', overflow:'hidden', marginBottom:20, border:'1px solid rgba(0,0,0,.04)' }}>
                <div className="search-field" style={{ flex:1, padding:'20px 24px', position:'relative', borderRight:'1px solid rgba(0,0,0,.06)' }}>
                  <label style={{ display:'block', fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'1.2px', color:'#6B7280', marginBottom:6 }}>
                    {isFr ? 'Ma famille est à' : 'My family is in'}
                  </label>
                  <select value={dest} onChange={e => setDest(e.target.value)}
                    style={{ width:'100%', border:'none', fontFamily:'DM Sans, sans-serif', fontSize:15, fontWeight:500, color:'#1F2937', background:'transparent', cursor:'pointer', appearance:'none', outline:'none' }}>
                    {DESTINATIONS.map(d => <option key={d.value} value={d.value}>{d[lang] || d.en}</option>)}
                  </select>
                  <span style={{ position:'absolute', right:20, bottom:22, color:'#6B7280', fontSize:12, pointerEvents:'none' }}>▾</span>
                </div>
                <div style={{ flex:1, padding:'20px 24px', position:'relative' }}>
                  <label style={{ display:'block', fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'1.2px', color:'#6B7280', marginBottom:6 }}>
                    {isFr ? 'Je suis à' : 'I am in'}
                  </label>
                  <select value={from} onChange={e => setFrom(e.target.value)}
                    style={{ width:'100%', border:'none', fontFamily:'DM Sans, sans-serif', fontSize:15, fontWeight:500, color:'#1F2937', background:'transparent', cursor:'pointer', appearance:'none', outline:'none' }}>
                    {FROM_CITIES.map(c => <option key={c.value} value={c.value}>{c[lang] || c.en}</option>)}
                  </select>
                  <span style={{ position:'absolute', right:20, bottom:22, color:'#6B7280', fontSize:12, pointerEvents:'none' }}>▾</span>
                </div>
                <button className="btn-find" onClick={handleSearch}
                  style={{ display:'flex', alignItems:'center', gap:10, background:'#10B981', color:'#fff', border:'none', padding:'0 32px', fontFamily:'DM Sans, sans-serif', fontSize:15, fontWeight:600, cursor:'pointer', transition:'all .25s', whiteSpace:'nowrap' }}>
                  {isFr ? 'Trouver' : 'Find travelers'}
                  <span className="arrow-circle" style={{ display:'flex', alignItems:'center', justifyContent:'center', width:28, height:28, background:'rgba(255,255,255,.25)', borderRadius:'50%', transition:'transform .2s' }}>→</span>
                </button>
              </div>

              {/* Sender CTA */}
              <div className="anim-5" style={{ display:'flex', alignItems:'center', gap:12, marginBottom: 20 }}>
                <span style={{ fontSize:13, color:'#6B7280' }}>{isFr ? 'Vous avez un colis ?' : 'Have a package to send?'}</span>
                <button
                  onClick={() => onSend?.() || setView('send')}
                  style={{ fontSize:13, fontWeight:700, color:'#10B981', background:'none', border:'none', cursor:'pointer', fontFamily:"'DM Sans', sans-serif", textDecoration:'underline', textUnderlineOffset:3 }}
                >
                  {isFr ? 'Poster une demande →' : 'Post a request →'}
                </button>
              </div>

              <div className="anim-5 hero-trust" style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#6B7280' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2D8B4E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                {isFr
                  ? <span>Chaque GP est <strong style={{ color:'#2D8B4E', fontWeight:600 }}>vérifié par téléphone</strong> avant d'apparaître sur Yobbu.</span>
                  : <span>Every GP is <strong style={{ color:'#2D8B4E', fontWeight:600 }}>phone verified</strong> before appearing on Yobbu.</span>}
              </div>
            </div>

            {/* Right — rotating card */}
            <div className="hero-visual anim-6" style={{ display:'flex', justifyContent:'center', alignItems:'center', position:'relative' }}>
              <div style={{ background:'#fff', borderRadius:20, padding:32, boxShadow:'0 4px 12px rgba(0,0,0,.04), 0 20px 60px rgba(0,0,0,.07)', width:380 }}>

                <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'1.5px', color:'#6B7280', marginBottom:20 }}>
                  {isFr ? 'Route active' : 'Active Route'}
                </div>

                {/* Route path — animated */}
                <div className={animating ? 'card-exit' : 'card-enter'} style={{ display:'flex', alignItems:'center', gap:16, marginBottom:28 }}>
                  <div style={{ textAlign:'center' }}>
                    <div className="route-card-title" style={{ fontSize:32, color:'#1F2937', letterSpacing:'-.5px' }}>{t.from}</div>
                    <div style={{ fontSize:12, color:'#6B7280', marginTop:2 }}>{t.fromCity}</div>
                  </div>
                  <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                    <div className="fly-plane" style={{ width:'100%', height:2, background:'linear-gradient(90deg, #10B981 0%, #E5A630 50%, #10B981 100%)', position:'relative' }} />
                    <div style={{ fontSize:11, color:'#6B7280' }}>~7h direct</div>
                  </div>
                  <div style={{ textAlign:'center' }}>
                    <div className="route-card-title" style={{ fontSize:32, color:'#1F2937', letterSpacing:'-.5px' }}>{t.to}</div>
                    <div style={{ fontSize:12, color:'#6B7280', marginTop:2 }}>{t.toCity}</div>
                  </div>
                </div>

                {/* Traveler — animated */}
                <div className={animating ? 'card-exit' : 'card-enter'} style={{ display:'flex', alignItems:'center', gap:14, padding:16, background:'#D1F4E7', borderRadius:14, marginBottom:20 }}>
                  <div style={{ width:48, height:48, borderRadius:'50%', background:t.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, color:'#fff', fontWeight:700, flexShrink:0 }}>
                    {t.initials}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:15, color:'#1F2937', display:'flex', alignItems:'center', gap:6 }}>
                      {t.name} {t.verified && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2D8B4E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
                    </div>
                    <div style={{ fontSize:13, color:'#6B7280', marginTop:2 }}>
                      {t.deliveries} {isFr ? 'livraisons' : 'deliveries'} · {t.rating} ★
                    </div>
                  </div>
                  <div style={{ fontSize:13, fontWeight:600, color:'#10B981', whiteSpace:'nowrap' }}>{t.date}</div>
                </div>

                <button className="send-btn" onClick={() => setView('browse')}
                  style={{ width:'100%', padding:14, background:'#1F2937', color:'#fff', border:'none', borderRadius:12, fontFamily:'DM Sans, sans-serif', fontSize:14, fontWeight:600, cursor:'pointer', transition:'all .2s', marginBottom:20 }}>
                  {isFr ? 'Envoyer un colis →' : 'Send a package →'}
                </button>

                {/* Dots */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                  {TRAVELERS.map((_, i) => (
                    <button key={i} className={`dot-btn ${i === current ? 'active' : ''}`}
                      onClick={() => setCurrent(i)}
                      style={{ width: i === current ? 20 : 6, height:6, borderRadius: i === current ? 3 : '50%', background: i === current ? '#10B981' : '#E8DDD0', border:'none', cursor:'pointer', padding:0 }} />
                  ))}
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* Stats */}
        <div className="stats-bar" style={{ display:'flex', justifyContent:'center', gap:0, padding:'32px 48px', maxWidth:800, margin:'0 auto', borderTop:'1px solid rgba(0,0,0,.06)' }}>
          {[
            { n: '100%',                      l: isFr ? 'GPs vérifiés par téléphone' : 'GPs phone-verified' },
            { n: isFr ? 'Gratuit' : 'Free',   l: isFr ? 'Recherche et contact'       : 'to search & contact' },
            { n: '4',                          l: isFr ? 'routes actives'             : 'active routes' },
            { n: isFr ? 'Direct' : 'Direct',  l: isFr ? 'Contact WhatsApp'           : 'WhatsApp contact' },
          ].map(({ n, l }, i) => (
            <div className="stat-item" key={l} style={{ flex:1, textAlign:'center', padding:'0 32px', borderRight: i < 3 ? '1px solid rgba(0,0,0,.06)' : 'none' }}>
              <div style={{ fontFamily:'DM Serif Display, serif', fontSize:32, color:'#10B981', letterSpacing:'-.5px' }}>{n}</div>
              <div style={{ fontSize:13, color:'#6B7280', marginTop:4 }}>{l}</div>
            </div>
          ))}
        </div>


      </div>
    </>
  )
}