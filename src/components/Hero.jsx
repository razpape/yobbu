import { useState } from 'react'

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

export default function Hero({ lang, setView, onSearch }) {
  const isFr = lang === 'fr'
  const [dest, setDest] = useState('')
  const [from, setFrom] = useState('')

  const handleSearch = () => {
    onSearch({ dest, from })
    setView('browse')
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600&display=swap');
        .hero-section { font-family: 'DM Sans', sans-serif; }
        .hero-section h1 { font-family: 'DM Serif Display', serif; }
        .hero-section .route-card-title { font-family: 'DM Serif Display', serif; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
        @keyframes fly { 0% { left:0; } 100% { left:calc(100% - 14px); } }
        .anim-1 { animation: fadeUp 0.6s ease-out both; }
        .anim-2 { animation: fadeUp 0.6s 0.1s ease-out both; }
        .anim-3 { animation: fadeUp 0.6s 0.2s ease-out both; }
        .anim-4 { animation: fadeUp 0.6s 0.3s ease-out both; }
        .anim-5 { animation: fadeUp 0.6s 0.4s ease-out both; }
        .anim-6 { animation: fadeUp 0.8s 0.3s ease-out both; }
        .pulse-dot { animation: pulse 2s infinite; }
        .fly-plane::after { content:'✈'; position:absolute; top:-10px; font-size:14px; animation:fly 3s ease-in-out infinite; color:#C8891C; }
        .btn-find:hover .arrow-circle { transform: translateX(3px); }
        .btn-find:hover { background: #E5A630 !important; }
        .send-btn:hover { background: #3D3829 !important; transform: translateY(-1px); }
        .btn-login:hover { background: #E5A630 !important; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(200,137,28,0.3); }
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .hero-visual { display: none !important; }
          .search-bar { flex-direction: column !important; }
          .search-field-divider { display: none !important; }
          .btn-find { border-radius: 0 0 14px 14px !important; justify-content: center; padding: 18px 24px !important; }
          .stats-bar { flex-wrap: wrap; gap: 20px !important; }
          .stat-item { min-width: 40%; border-right: none !important; }
        }
      `}</style>

      <div className="hero-section" style={{ background: '#FDFBF7', color: '#1A1710' }}>

        {/* Hero */}
        <section style={{ padding: '0 48px', overflow: 'hidden', position: 'relative' }}>
          {/* Glow bg */}
          <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 900px 700px at 75% 45%, rgba(200,137,28,.10) 0%, transparent 70%), radial-gradient(ellipse 400px 400px at 20% 80%, rgba(200,137,28,.04) 0%, transparent 70%)', pointerEvents:'none' }} />

          <div className="hero-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center', maxWidth:1280, margin:'0 auto', width:'100%', position:'relative', zIndex:2, padding:'48px 0 64px' }}>

            {/* Left */}
            <div>
              {/* Trust pill */}
              <div className="anim-1" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#fff', border:'1px solid rgba(200,137,28,.2)', padding:'8px 18px', borderRadius:100, fontSize:13, fontWeight:500, color:'#3D3829', marginBottom:32 }}>
                <span className="pulse-dot" style={{ width:8, height:8, background:'#2D8B4E', borderRadius:'50%', display:'inline-block' }} />
                {isFr ? 'Approuvé par la diaspora ouest-africaine' : 'Trusted by the West African diaspora'}
              </div>

              {/* Title */}
              <h1 className="anim-2" style={{ fontSize:'clamp(40px,4.5vw,64px)', lineHeight:1.08, letterSpacing:'-1.5px', color:'#1A1710', marginBottom:24 }}>
                {isFr
                  ? <>{`Envoyez vos colis `}<em style={{ fontStyle:'italic', color:'#C8891C' }}>chez vous,</em><br />{`avec des personnes`}<br />{`de confiance.`}</>
                  : <>Send packages <em style={{ fontStyle:'italic', color:'#C8891C' }}>home,</em><br />through people<br />you trust.</>}
              </h1>

              {/* Subtitle */}
              <p className="anim-3" style={{ fontSize:17, lineHeight:1.65, color:'#8A8070', maxWidth:440, marginBottom:40 }}>
                {isFr
                  ? "Trouvez des voyageurs vérifiés allant à Dakar, Conakry et ailleurs. Votre colis voyage avec une vraie personne de votre communauté."
                  : "Find verified travelers heading to Dakar, Conakry, and beyond. Your package travels with a real person — not a faceless courier."}
              </p>

              {/* Search bar */}
              <div className="search-bar anim-4" style={{ display:'flex', alignItems:'stretch', background:'#fff', borderRadius:16, boxShadow:'0 2px 8px rgba(0,0,0,.04), 0 12px 40px rgba(0,0,0,.06)', overflow:'hidden', marginBottom:20, border:'1px solid rgba(0,0,0,.04)' }}>
                <div className="search-field" style={{ flex:1, padding:'20px 24px', position:'relative', borderRight:'1px solid rgba(0,0,0,.06)' }}>
                  <label style={{ display:'block', fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'1.2px', color:'#8A8070', marginBottom:6 }}>
                    {isFr ? 'Où?' : 'Where to?'}
                  </label>
                  <select value={dest} onChange={e => setDest(e.target.value)}
                    style={{ width:'100%', border:'none', fontFamily:'DM Sans, sans-serif', fontSize:15, fontWeight:500, color:'#1A1710', background:'transparent', cursor:'pointer', appearance:'none', outline:'none' }}>
                    {DESTINATIONS.map(d => <option key={d.value} value={d.value}>{d[lang] || d.en}</option>)}
                  </select>
                  <span style={{ position:'absolute', right:20, bottom:22, color:'#8A8070', fontSize:12, pointerEvents:'none' }}>▾</span>
                </div>
                <div className="search-field" style={{ flex:1, padding:'20px 24px', position:'relative' }}>
                  <label style={{ display:'block', fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'1.2px', color:'#8A8070', marginBottom:6 }}>
                    {isFr ? 'Depuis' : 'Departing from'}
                  </label>
                  <select value={from} onChange={e => setFrom(e.target.value)}
                    style={{ width:'100%', border:'none', fontFamily:'DM Sans, sans-serif', fontSize:15, fontWeight:500, color:'#1A1710', background:'transparent', cursor:'pointer', appearance:'none', outline:'none' }}>
                    {FROM_CITIES.map(c => <option key={c.value} value={c.value}>{c[lang] || c.en}</option>)}
                  </select>
                  <span style={{ position:'absolute', right:20, bottom:22, color:'#8A8070', fontSize:12, pointerEvents:'none' }}>▾</span>
                </div>
                <button className="btn-find" onClick={handleSearch}
                  style={{ display:'flex', alignItems:'center', gap:10, background:'#C8891C', color:'#fff', border:'none', padding:'0 32px', fontFamily:'DM Sans, sans-serif', fontSize:15, fontWeight:600, cursor:'pointer', transition:'all .25s', whiteSpace:'nowrap' }}>
                  {isFr ? 'Trouver' : 'Find travelers'}
                  <span className="arrow-circle" style={{ display:'flex', alignItems:'center', justifyContent:'center', width:28, height:28, background:'rgba(255,255,255,.25)', borderRadius:'50%', transition:'transform .2s' }}>→</span>
                </button>
              </div>

              {/* Verified note */}
              <div className="anim-5" style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#8A8070' }}>
                <span style={{ color:'#2D8B4E' }}>🛡</span>
                {isFr
                  ? <span>Chaque voyageur est <strong style={{ color:'#2D8B4E', fontWeight:600 }}>vérifié par téléphone</strong> — les GPs vérifiés portent un badge bouclier.</span>
                  : <span>Every traveler is <strong style={{ color:'#2D8B4E', fontWeight:600 }}>phone verified</strong> — ID-verified GPs carry a shield badge.</span>}
              </div>
            </div>

            {/* Right — route card */}
            <div className="hero-visual anim-6" style={{ display:'flex', justifyContent:'center', alignItems:'center', position:'relative' }}>
              <div style={{ background:'#fff', borderRadius:20, padding:32, boxShadow:'0 4px 12px rgba(0,0,0,.04), 0 20px 60px rgba(0,0,0,.07)', width:380, position:'relative' }}>
                <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'1.5px', color:'#8A8070', marginBottom:20 }}>
                  {isFr ? 'Route active' : 'Active Route'}
                </div>

                {/* Route path */}
                <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:28 }}>
                  <div style={{ textAlign:'center' }}>
                    <div className="route-card-title" style={{ fontFamily:'DM Serif Display, serif', fontSize:32, color:'#1A1710', letterSpacing:'-.5px' }}>JFK</div>
                    <div style={{ fontSize:12, color:'#8A8070', marginTop:2 }}>New York</div>
                  </div>
                  <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                    <div className="fly-plane" style={{ width:'100%', height:2, background:'linear-gradient(90deg, #C8891C 0%, #E5A630 50%, #C8891C 100%)', position:'relative' }} />
                    <div style={{ fontSize:11, color:'#8A8070' }}>~7h direct</div>
                  </div>
                  <div style={{ textAlign:'center' }}>
                    <div className="route-card-title" style={{ fontFamily:'DM Serif Display, serif', fontSize:32, color:'#1A1710', letterSpacing:'-.5px' }}>DSS</div>
                    <div style={{ fontSize:12, color:'#8A8070', marginTop:2 }}>Dakar</div>
                  </div>
                </div>

                {/* Traveler preview */}
                <div style={{ display:'flex', alignItems:'center', gap:14, padding:16, background:'#FFF8EB', borderRadius:14, marginBottom:20 }}>
                  <div style={{ width:48, height:48, borderRadius:'50%', background:'linear-gradient(135deg, #C8891C, #E5A630)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, color:'#fff', fontWeight:600, flexShrink:0 }}>A</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:15, color:'#1A1710', display:'flex', alignItems:'center', gap:6 }}>
                      Aminata D. <span style={{ color:'#2D8B4E' }}>🛡</span>
                    </div>
                    <div style={{ fontSize:13, color:'#8A8070', marginTop:2 }}>12 {isFr ? 'livraisons' : 'deliveries'} · 5.0 ★</div>
                  </div>
                  <div style={{ fontSize:13, fontWeight:600, color:'#C8891C', whiteSpace:'nowrap' }}>Apr 18</div>
                </div>

                <button className="send-btn" onClick={() => setView('browse')}
                  style={{ width:'100%', padding:14, background:'#1A1710', color:'#fff', border:'none', borderRadius:12, fontFamily:'DM Sans, sans-serif', fontSize:14, fontWeight:600, cursor:'pointer', transition:'all .2s' }}>
                  {isFr ? 'Envoyer un colis →' : 'Send a package →'}
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* Stats */}
        <div className="stats-bar" style={{ display:'flex', justifyContent:'center', gap:0, padding:'32px 48px', maxWidth:800, margin:'0 auto', borderTop:'1px solid rgba(0,0,0,.06)' }}>
          {[
            { n:'500+', l: isFr ? 'familles servies'     : 'families served' },
            { n:'98%',  l: isFr ? 'taux de réussite'     : 'success rate' },
            { n:'247',  l: isFr ? 'colis livrés'         : 'packages delivered' },
            { n:'4',    l: isFr ? 'routes actives'       : 'active routes' },
          ].map(({ n, l }, i) => (
            <div className="stat-item" key={l} style={{ flex:1, textAlign:'center', padding:'0 32px', borderRight: i < 3 ? '1px solid rgba(0,0,0,.06)' : 'none' }}>
              <div style={{ fontFamily:'DM Serif Display, serif', fontSize:32, color:'#C8891C', letterSpacing:'-.5px' }}>{n}</div>
              <div style={{ fontSize:13, color:'#8A8070', marginTop:4 }}>{l}</div>
            </div>
          ))}
        </div>

      </div>
    </>
  )
}