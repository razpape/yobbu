import { useState, useEffect } from 'react'
import GPCard from './GPCard'
import { ShieldCheckIcon, ClockIcon, SearchIcon, PlaneIcon } from './Icons'

const DESTINATIONS = [
  { value: 'all',     en: 'All routes',              fr: 'Toutes les routes' },
  { value: 'Dakar',   en: 'Dakar, Senegal',          fr: 'Dakar, Sénégal' },
  { value: 'Conakry', en: 'Conakry, Guinea',         fr: 'Conakry, Guinée' },
  { value: 'Abidjan', en: "Abidjan, Côte d'Ivoire",  fr: "Abidjan, Côte d'Ivoire" },
  { value: 'Bamako',  en: 'Bamako, Mali',            fr: 'Bamako, Mali' },
  { value: 'Lomé',    en: 'Lomé, Togo',              fr: 'Lomé, Togo' },
]

const FLIGHTS = [
  { route: 'New York → Dakar',   en: 'Air Senegal · 7h direct',   fr: 'Air Sénégal · 7h direct',  ago: { en:'2h ago',  fr:'il y a 2h'  } },
  { route: 'Paris → Dakar',      en: 'Air France · 5h direct',    fr: 'Air France · 5h direct',   ago: { en:'5h ago',  fr:'il y a 5h'  } },
  { route: 'New York → Conakry', en: 'Brussels Airlines · 9h',    fr: 'Brussels Airlines · 9h',   ago: { en:'11h ago', fr:'il y a 11h' } },
  { route: 'Atlanta → Dakar',    en: 'Delta · Connecting',        fr: 'Delta · Correspondance',   ago: { en:'18h ago', fr:'il y a 18h' } },
]

function FlightPanel({ lang, setView }) {
  const isFr = lang === 'fr'
  return (
    <div style={{ fontFamily:'DM Sans, sans-serif' }}>
      {/* Flight tracker */}
      <div style={{ background:'#fff', border:'1px solid rgba(0,0,0,.06)', borderRadius:20, overflow:'hidden', marginBottom:14, position:'sticky', top:80 }}>
        <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(0,0,0,.06)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontFamily:'DM Serif Display, serif', fontSize:15, color:'#1A1710' }}>
            {isFr ? 'Vols récents' : 'Recent flights'}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, fontWeight:700, color:'#2D8B4E' }}>
            <div style={{ width:5, height:5, borderRadius:'50%', background:'#2D8B4E', animation:'pulse 2s infinite' }} />
            {isFr ? '24h' : 'Last 24h'}
          </div>
        </div>
        <style>{`
          @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.3;}}
          @keyframes fp1{0%{transform:translate(22px,110px);}100%{transform:translate(232px,28px);}}
          @keyframes fp2{0%{transform:translate(232px,28px);}100%{transform:translate(22px,110px);}}
          @keyframes fp3{0%{transform:translate(18px,118px);}100%{transform:translate(236px,50px);}}
          @keyframes fp4{0%{transform:translate(236px,50px);}100%{transform:translate(18px,118px);}}
          .fp1{animation:fp1 9s linear infinite;}
          .fp2{animation:fp2 13s linear infinite 2s;}
          .fp3{animation:fp3 11s linear infinite 5s;}
          .fp4{animation:fp4 16s linear infinite 1s;}
        `}</style>

        {/* Map */}
        <div style={{ background:'#F7F5F0', height:155, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(0,0,0,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.03) 1px,transparent 1px)', backgroundSize:'26px 26px' }} />
          <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} viewBox="0 0 260 155">
            <path d="M22 112 Q130 15 236 30" stroke="#C8891C" strokeWidth="1.5" strokeDasharray="5 3" fill="none" opacity="0.45"/>
            <path d="M22 118 Q122 35 236 52" stroke="#2D8B4E" strokeWidth="1.5" strokeDasharray="5 3" fill="none" opacity="0.35"/>
            <path d="M22 115 Q126 25 236 41" stroke="#185FA5" strokeWidth="1" strokeDasharray="5 3" fill="none" opacity="0.25"/>
            <circle cx="22" cy="114" r="6" fill="#C8891C" opacity="0.2"/>
            <circle cx="22" cy="114" r="3.5" fill="#C8891C"/>
            <text x="30" y="118" fontSize="9" fill="#3D3829" fontFamily="DM Sans,sans-serif" fontWeight="600">NYC</text>
            <circle cx="236" cy="30" r="5" fill="#C8891C" opacity="0.2"/>
            <circle cx="236" cy="30" r="3" fill="#C8891C"/>
            <text x="204" y="26" fontSize="9" fill="#3D3829" fontFamily="DM Sans,sans-serif" fontWeight="600">DSS</text>
            <circle cx="236" cy="52" r="5" fill="#2D8B4E" opacity="0.2"/>
            <circle cx="236" cy="52" r="3" fill="#2D8B4E"/>
            <text x="204" y="62" fontSize="9" fill="#3D3829" fontFamily="DM Sans,sans-serif" fontWeight="600">CKY</text>
            <g className="fp1"><circle r="5" cx="0" cy="0" fill="#C8891C"/><text x="-4" y="4" fontSize="7" fill="white" fontFamily="DM Sans,sans-serif">✈</text></g>
            <g className="fp2"><circle r="4" cx="0" cy="0" fill="#185FA5"/><text x="-4" y="4" fontSize="7" fill="white" fontFamily="DM Sans,sans-serif">✈</text></g>
            <g className="fp3"><circle r="4" cx="0" cy="0" fill="#2D8B4E"/><text x="-4" y="4" fontSize="7" fill="white" fontFamily="DM Sans,sans-serif">✈</text></g>
            <g className="fp4"><circle r="3" cx="0" cy="0" fill="#C8891C" opacity="0.7"/><text x="-4" y="4" fontSize="6" fill="white" fontFamily="DM Sans,sans-serif">✈</text></g>
          </svg>
        </div>

        {/* 24h count */}
        <div style={{ padding:'8px 16px', background:'#FFF8EB', borderBottom:'1px solid rgba(0,0,0,.05)', display:'flex', alignItems:'center', gap:6 }}>
          <ClockIcon size={14} color="#C8891C" />
          <span style={{ fontSize:11, color:'#8A8070' }}>
            <strong style={{ color:'#C8891C' }}>8 {isFr ? 'vols' : 'flights'}</strong> {isFr ? 'dans les 24 dernières heures' : 'in the last 24 hours'}
          </span>
        </div>

        {/* List */}
        <div style={{ padding:'4px 12px 8px' }}>
          {FLIGHTS.map((f, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom: i < FLIGHTS.length-1 ? '1px solid rgba(0,0,0,.04)' : 'none' }}>
              <div style={{ width:28, height:28, borderRadius:8, background:'#F7F3ED', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><PlaneIcon size={14} color="#C8891C" /></div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, fontWeight:600, color:'#1A1710' }}>{f.route}</div>
                <div style={{ fontSize:10, color:'#8A8070', marginTop:1 }}>{f[lang] || f.en}</div>
              </div>
              <div style={{ fontSize:10, fontWeight:600, color:'#C8891C', whiteSpace:'nowrap' }}>{f.ago[lang]}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign:'center', padding:'8px', fontSize:10, color:'#B0A090', borderTop:'1px solid rgba(0,0,0,.04)' }}>
          {isFr ? 'Actualise toutes les 24 heures' : 'Refreshes every 24 hours'}
        </div>
      </div>

      {/* Post a trip CTA */}
      <div style={{ background:'#1A1710', borderRadius:20, padding:'20px', textAlign:'center' }}>
        <div style={{ fontFamily:'DM Serif Display, serif', fontSize:18, color:'#fff', marginBottom:6 }}>
          {isFr ? 'Vous voyagez bientôt ?' : 'Traveling soon?'}
        </div>
        <p style={{ fontSize:12, color:'rgba(255,255,255,.5)', marginBottom:14, lineHeight:1.65 }}>
          {isFr ? 'Postez votre voyage et gagnez de l\'argent en portant des colis.' : 'Post your trip and earn money carrying packages.'}
        </p>
        <button onClick={() => setView('post')}
          style={{ width:'100%', padding:'11px', background:'#C8891C', color:'#fff', border:'none', borderRadius:12, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>
          + {isFr ? 'Poster un voyage' : 'Post a trip'}
        </button>
      </div>
    </div>
  )
}

export default function BrowsePage({ lang, setView, trips, loading, error, user, onLoginRequired, searchFilter, onViewProfile }) {
  const [dest, setDest]         = useState('all')
  const [search, setSearch]     = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const isFr = lang === 'fr'

  useEffect(() => {
    if (searchFilter?.dest) setDest(searchFilter.dest)
  }, [searchFilter])

  const filtered = trips.filter(g => {
    const toCity = g.to_city || g.to || ''
    const matchDest = dest === 'all' || toCity === dest
    const q = search.toLowerCase()
    const matchSearch = !q || g.name?.toLowerCase().includes(q) || (g.from_city||g.from||'').toLowerCase().includes(q) || toCity.toLowerCase().includes(q)
    const matchDate = !dateFilter || !g.date || (g.date.match(/^\d{4}-\d{2}-\d{2}$/) ? g.date >= dateFilter : true)
    return matchDest && matchSearch && matchDate
  })

  return (
    <div style={{ minHeight:'100vh', background:'#FDFBF7', fontFamily:'DM Sans, sans-serif' }}>
      <style>{`
        @media (max-width: 768px) {
          .browse-trust { padding: 10px 16px !important; }
          .browse-wrap { padding: 20px 16px !important; }
          .browse-grid { grid-template-columns: 1fr !important; }
          .browse-panel { display: none !important; }
        }
      `}</style>

      {/* Trust bar */}
      <div className="browse-trust" style={{ background:'#F0FAF4', borderBottom:'1px solid #C8E6D4', padding:'10px 48px', display:'flex', alignItems:'center', gap:8 }}>
        <ShieldCheckIcon size={15} color="#1A5C38" />
        <span style={{ fontSize:12, fontWeight:500, color:'#1A5C38' }}>
          {isFr ? 'Chaque voyageur est vérifié par téléphone avant d\'apparaître sur Yobbu.' : 'Every traveler is phone-verified before appearing on Yobbu.'}
        </span>
      </div>

      <div className="browse-wrap" style={{ maxWidth:1200, margin:'0 auto', padding:'40px 32px' }}>
        <div className="browse-grid" style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:24, alignItems:'start' }}>

          {/* LEFT */}
          <div>
            {/* Page header */}
            <div style={{ marginBottom:28 }}>
              <h1 style={{ fontFamily:'DM Serif Display, serif', fontSize:36, color:'#1A1710', letterSpacing:'-.8px', marginBottom:6, lineHeight:1.1 }}>
                {isFr
                  ? <>Trouvez un <em style={{ fontStyle:'italic', color:'#C8891C' }}>voyageur de confiance</em></>
                  : <>Find a <em style={{ fontStyle:'italic', color:'#C8891C' }}>trusted traveler</em></>}
              </h1>
              <p style={{ fontSize:14, color:'#8A8070' }}>
                {loading ? '...' : `${filtered.length} ${isFr ? filtered.length === 1 ? 'voyageur disponible' : 'voyageurs disponibles' : filtered.length === 1 ? 'traveler available' : 'travelers available'}`}
              </p>
            </div>

            {/* Search + filter row */}
            <div style={{ display:'flex', gap:10, marginBottom:24, flexWrap:'wrap' }}>
              <div style={{ flex:1, minWidth:200, position:'relative' }}>
                <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#B0A090', display:'flex' }}><SearchIcon size={14} /></span>
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder={isFr ? 'Rechercher par nom ou ville...' : 'Search by name or city...'}
                  style={{ width:'100%', padding:'11px 14px 11px 36px', borderRadius:12, border:'1px solid rgba(0,0,0,.1)', background:'#fff', color:'#1A1710', fontSize:13, fontFamily:'DM Sans, sans-serif', outline:'none', boxSizing:'border-box' }}
                />
              </div>
              <div style={{ position:'relative' }}>
                <select value={dest} onChange={e => setDest(e.target.value)}
                  style={{ padding:'11px 36px 11px 14px', borderRadius:12, border:'1px solid rgba(0,0,0,.1)', background:'#fff', color:'#1A1710', fontSize:13, fontFamily:'DM Sans, sans-serif', outline:'none', cursor:'pointer', appearance:'none' }}>
                  {DESTINATIONS.map(d => <option key={d.value} value={d.value}>{d[lang]||d.en}</option>)}
                </select>
                <span style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:'#8A8070', fontSize:11 }}>▾</span>
              </div>
              <input
                type="date"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                style={{ padding:'11px 14px', borderRadius:12, border:'1px solid rgba(0,0,0,.1)', background:'#fff', color: dateFilter ? '#1A1710' : '#B0A090', fontSize:13, fontFamily:'DM Sans, sans-serif', outline:'none', cursor:'pointer' }}
              />
            </div>

            {/* Loading */}
            {loading && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:14 }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{ background:'#fff', border:'1px solid rgba(0,0,0,.06)', borderRadius:20, overflow:'hidden' }}>
                    <div style={{ height:5, background:'linear-gradient(90deg,#F0E0C0,#E8D4A8)' }} />
                    <div style={{ padding:20 }}>
                      <div style={{ display:'flex', gap:12, marginBottom:16 }}>
                        <div style={{ width:50, height:50, borderRadius:'50%', background:'#F0EDE8' }} />
                        <div style={{ flex:1 }}>
                          <div style={{ height:14, background:'#F0EDE8', borderRadius:6, marginBottom:8, width:'55%' }} />
                          <div style={{ height:10, background:'#F0EDE8', borderRadius:6, width:'40%' }} />
                        </div>
                      </div>
                      <div style={{ height:70, background:'#F7F5F0', borderRadius:12, marginBottom:14 }} />
                      <div style={{ height:36, background:'#F0EDE8', borderRadius:10 }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:14, padding:20, fontSize:13, color:'#DC2626' }}>
                {isFr ? 'Impossible de charger les voyageurs.' : 'Could not load travelers.'} {error}
              </div>
            )}

            {/* Empty */}
            {!loading && !error && filtered.length === 0 && (
              <div style={{ textAlign:'center', padding:'80px 24px' }}>
                <div style={{ marginBottom:16, display:'flex', justifyContent:'center' }}><PlaneIcon size={48} color="#E8DDD0" /></div>
                <div style={{ fontFamily:'DM Serif Display, serif', fontSize:26, color:'#1A1710', marginBottom:8 }}>
                  {isFr ? 'Aucun voyageur trouvé' : 'No travelers found'}
                </div>
                <p style={{ fontSize:14, color:'#8A8070', marginBottom:24, lineHeight:1.7, maxWidth:320, margin:'0 auto 24px' }}>
                  {isFr ? 'Essayez une autre destination ou revenez bientôt — de nouveaux GPs s\'inscrivent chaque jour.' : 'Try a different destination or check back soon — new GPs join every day.'}
                </p>
                <button onClick={() => { setDest('all'); setSearch('') }}
                  style={{ background:'#C8891C', color:'#fff', border:'none', padding:'12px 28px', borderRadius:20, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>
                  {isFr ? 'Voir tous les voyageurs' : 'View all travelers'}
                </button>
              </div>
            )}

            {/* GP Grid */}
            {!loading && !error && filtered.length > 0 && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:14 }}>
                {filtered.map(gp => (
                  <GPCard key={gp.id} gp={gp} lang={lang} user={user} onContactClick={onLoginRequired} onViewProfile={onViewProfile} />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="browse-panel">
            <FlightPanel lang={lang} setView={setView} />
          </div>

        </div>
      </div>
    </div>
  )
}