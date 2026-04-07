import { useState, useEffect, useMemo } from 'react'
import GPCard from './GPCard'
import { ShieldCheckIcon } from './Icons'

const DESTINATION_GROUPS = [
  {
    label: { en: '🇺🇸 USA Origins', fr: '🇺🇸 Origines USA' },
    options: [
      { value: 'New York',      en: 'New York City (NYC)', fr: 'New York (NYC)' },
      { value: 'Washington DC', en: 'Washington, D.C. (IAD)', fr: 'Washington D.C. (IAD)' },
      { value: 'Atlanta',       en: 'Atlanta (ATL)',       fr: 'Atlanta (ATL)' },
    ],
  },
  {
    label: { en: '🇪🇺 Europe Origins', fr: '🇪🇺 Origines Europe' },
    options: [
      { value: 'Paris',  en: 'Paris (CDG)',  fr: 'Paris (CDG)' },
      { value: 'London', en: 'London (LHR)', fr: 'Londres (LHR)' },
    ],
  },
  {
    label: { en: '🌍 Africa Destinations', fr: '🌍 Destinations Afrique' },
    options: [
      { value: 'Dakar',   en: 'Dakar, Senegal',          fr: 'Dakar, Sénégal' },
      { value: 'Lagos',   en: 'Lagos, Nigeria',           fr: 'Lagos, Nigéria' },
      { value: 'Accra',   en: 'Accra, Ghana',             fr: 'Accra, Ghana' },
      { value: 'Abidjan', en: "Abidjan, Côte d'Ivoire",  fr: "Abidjan, Côte d'Ivoire" },
      { value: 'Bamako',  en: 'Bamako, Mali',             fr: 'Bamako, Mali' },
      { value: 'Conakry', en: 'Conakry, Guinea',          fr: 'Conakry, Guinée' },
      { value: 'Lomé',    en: 'Lomé, Togo',               fr: 'Lomé, Togo' },
    ],
  },
]

const AVAIL_OPTIONS = [
  { value: 'same_day',   en: 'Same day',       fr: 'Jour même' },
  { value: 'one_day',    en: 'One day notice', fr: '1 jour de préavis' },
  { value: 'this_week',  en: 'This week',      fr: 'Cette semaine' },
  { value: 'this_month', en: 'This month',     fr: 'Ce mois-ci' },
]

function toYMD(d) { return d.toISOString().slice(0, 10) }

function getDateRange(option) {
  const today = new Date(); today.setHours(0,0,0,0)
  const todayStr = toYMD(today)
  if (option === 'same_day') return { from: todayStr, to: todayStr }
  if (option === 'one_day') { const t = new Date(today); t.setDate(t.getDate()+1); return { from: todayStr, to: toYMD(t) } }
  if (option === 'this_week') { const t = new Date(today); t.setDate(t.getDate()+(6-t.getDay())); return { from: todayStr, to: toYMD(t) } }
  if (option === 'this_month') { return { from: todayStr, to: toYMD(new Date(today.getFullYear(), today.getMonth()+1, 0)) } }
  return { from: '', to: '' }
}

const VERIFY_OPTIONS = [
  { value: 'all',      en: 'All travelers', fr: 'Tous les voyageurs' },
  { value: 'verified', en: 'Verified',      fr: 'Vérifiés' },
]

const labelStyle = { display:'block', fontSize:11, fontWeight:700, color:'#8A8070', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8 }
const selectStyle = { width:'100%', padding:'10px 32px 10px 12px', border:'1px solid rgba(0,0,0,.12)', borderRadius:8, fontSize:13, fontFamily:'DM Sans, sans-serif', color:'#1A1710', outline:'none', boxSizing:'border-box', background:'#fff', appearance:'none', cursor:'pointer' }

function SidebarContent({ lang, dest, setDest, availOption, setAvailOption, priceFilter, setPriceFilter, verifyFilter, setVerifyFilter, onFilter, onClose }) {
  const isFr = lang === 'fr'

  return (
    <div style={{ display:'flex', flexDirection:'column' }}>

      {/* Availability */}
      <div style={{ marginBottom:22 }}>
        <label style={labelStyle}>{isFr ? 'Disponibilité' : 'Availability'}</label>
        <div style={{ position:'relative' }}>
          <select value={availOption} onChange={e=>setAvailOption(e.target.value)} style={selectStyle}>
            <option value="">{isFr ? 'Toute période' : 'Any time'}</option>
            {AVAIL_OPTIONS.map(opt => {
              const { from, to } = getDateRange(opt.value)
              const hint = from === to ? from : `${from} → ${to}`
              return <option key={opt.value} value={opt.value}>{opt[lang]||opt.en} ({hint})</option>
            })}
          </select>
          <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:'#8A8070', fontSize:11 }}>▾</span>
        </div>
      </div>

      {/* Price */}
      <div style={{ marginBottom:22 }}>
        <label style={labelStyle}>{isFr ? 'Prix' : 'Price'}</label>
        <input
          value={priceFilter} onChange={e=>setPriceFilter(e.target.value)}
          placeholder={isFr ? 'ex: 10' : 'e.g. $10/kg'}
          style={{ width:'100%', padding:'10px 12px', border:'1px solid rgba(0,0,0,.12)', borderRadius:8, fontSize:13, fontFamily:'DM Sans, sans-serif', color:'#1A1710', outline:'none', boxSizing:'border-box', background:'#fff' }}
        />
      </div>

      {/* Destination */}
      <div style={{ marginBottom:22 }}>
        <label style={labelStyle}>{isFr ? 'Ville / Route' : 'Location Service'}</label>
        <div style={{ position:'relative' }}>
          <select value={dest} onChange={e=>setDest(e.target.value)} style={selectStyle}>
            <option value="all">{isFr ? 'Toutes les routes' : 'All routes'}</option>
            {DESTINATION_GROUPS.map(group => (
              <optgroup key={group.label.en} label={group.label[lang] || group.label.en}>
                {group.options.map(o => (
                  <option key={o.value} value={o.value}>{o[lang] || o.en}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:'#8A8070', fontSize:11 }}>▾</span>
        </div>
      </div>

      {/* Verification */}
      <div style={{ marginBottom:24 }}>
        <label style={labelStyle}>{isFr ? 'Vérification' : 'Verification'}</label>
        <div style={{ position:'relative' }}>
          <select value={verifyFilter} onChange={e => setVerifyFilter(e.target.value)} style={selectStyle}>
            {VERIFY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt[lang] || opt.en}</option>
            ))}
          </select>
          <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:'#8A8070', fontSize:11 }}>▾</span>
        </div>
      </div>

      {/* Filter button */}
      <button
        onClick={() => { onFilter(); onClose && onClose() }}
        style={{ width:'100%', padding:'13px', background:'#1A1710', color:'#fff', border:'none', borderRadius:8, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}
      >
        {isFr ? 'Filtrer' : 'Filter'}
      </button>
    </div>
  )
}

export default function BrowsePage({ lang, trips, loading, error, user, onLoginRequired, searchFilter, onViewProfile }) {
  const [dest, setDest]               = useState('all')
  const [availOption, setAvailOption] = useState('')
  const [priceFilter, setPriceFilter] = useState('')
  const [verifyFilter, setVerifyFilter] = useState('all')
  const [sortBy, setSortBy]           = useState('date')
  const [applied, setApplied]         = useState({ dest:'all', dateFrom:'', dateTo:'', price:'', verify:'all' })
  const [drawerOpen, setDrawerOpen]   = useState(false)
  const isFr = lang === 'fr'

  useEffect(() => {
    if (searchFilter?.dest) { setDest(searchFilter.dest); setApplied(a => ({ ...a, dest: searchFilter.dest })) }
  }, [searchFilter])

  // Close drawer on Escape
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') setDrawerOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleFilter = () => {
    const { from, to } = availOption ? getDateRange(availOption) : { from:'', to:'' }
    setApplied({ dest, dateFrom: from, dateTo: to, price: priceFilter, verify: verifyFilter })
  }

  const sorted = useMemo(() => {
    const maxPrice = applied.price ? parseFloat(applied.price) : null

    const filtered = trips.filter(g => {
      const toCity = g.to_city || g.to || ''
      const fromCity = g.from_city || g.from || ''
      const matchDest = applied.dest === 'all' || toCity === applied.dest || fromCity === applied.dest
      const d = g.date && g.date.match(/^\d{4}-\d{2}-\d{2}$/) ? g.date : null
      const matchDate = (!applied.dateFrom && !applied.dateTo) || !d ||
        ((!applied.dateFrom || d >= applied.dateFrom) && (!applied.dateTo || d <= applied.dateTo))
      const matchVerify =
        applied.verify === 'all' ||
        (applied.verify === 'verified' && (g.verified?.phone || g.phone_verified || g.verified?.id || g.id_verified || g.whatsapp_verified))
      const matchPrice = !maxPrice || (parseFloat(String(g.price)) || Infinity) <= maxPrice
      return matchDest && matchDate && matchVerify && matchPrice
    })

    return [...filtered].sort((a, b) => {
      if (sortBy === 'rating') return (Number(b.rating)||0) - (Number(a.rating)||0)
      if (sortBy === 'price')  return (parseFloat(String(a.price))||0) - (parseFloat(String(b.price))||0)
      return 0
    })
  }, [trips, applied, sortBy])

  const activeFilterCount = [
    applied.dest !== 'all',
    !!applied.dateFrom,
    !!applied.price,
    applied.verify !== 'all',
  ].filter(Boolean).length

  return (
    <div style={{ minHeight:'100vh', background:'#FDFBF7', fontFamily:'DM Sans, sans-serif' }}>
      <style>{`
        @media (max-width: 768px) {
          .browse-sidebar-col { display: none !important; }
          .browse-main-grid   { grid-template-columns: 1fr !important; padding: 16px !important; }
          .mobile-filter-btn  { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-filter-btn { display: none !important; }
          .drawer-overlay    { display: none !important; }
        }
      `}</style>

      {/* Trust bar */}
      <div style={{ background:'#F0FAF4', borderBottom:'1px solid #C8E6D4', padding:'10px 48px', display:'flex', alignItems:'center', gap:8 }}>
        <ShieldCheckIcon size={15} color="#1A5C38" />
        <span style={{ fontSize:12, fontWeight:500, color:'#1A5C38' }}>
          {isFr ? "Chaque voyageur est vérifié par téléphone avant d'apparaître sur Yobbu." : 'Every traveler is phone-verified before appearing on Yobbu.'}
        </span>
      </div>

      {/* Mobile filter button */}
      <div className="mobile-filter-btn" style={{ display:'none', padding:'12px 16px', background:'#fff', borderBottom:'1px solid rgba(0,0,0,.07)', gap:10 }}>
        <button
          onClick={() => setDrawerOpen(true)}
          style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'11px', background:'#1A1710', color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
          </svg>
          {isFr ? 'Filtres' : 'Filters'}
          {activeFilterCount > 0 && (
            <span style={{ background:'#C8891C', color:'#fff', borderRadius:'50%', width:18, height:18, fontSize:11, fontWeight:700, display:'inline-flex', alignItems:'center', justifyContent:'center' }}>
              {activeFilterCount}
            </span>
          )}
        </button>
        <div style={{ position:'relative' }}>
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
            style={{ padding:'11px 28px 11px 12px', border:'1px solid rgba(0,0,0,.12)', borderRadius:10, fontSize:13, fontFamily:'DM Sans, sans-serif', color:'#1A1710', outline:'none', appearance:'none', background:'#fff', cursor:'pointer' }}>
            <option value="date">{isFr?'Date':'Date'}</option>
            <option value="rating">{isFr?'Note':'Rating'}</option>
            <option value="price">{isFr?'Prix':'Price'}</option>
          </select>
          <span style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:'#8A8070', fontSize:10 }}>▾</span>
        </div>
      </div>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div
          className="drawer-overlay"
          onClick={() => setDrawerOpen(false)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', zIndex:200 }}
        />
      )}

      {/* Mobile drawer */}
      <div style={{
        position:'fixed', top:0, left:0, bottom:0, width:'85%', maxWidth:320,
        background:'#fff', zIndex:201, overflowY:'auto',
        padding:'24px 20px',
        transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition:'transform .3s cubic-bezier(.4,0,.2,1)',
        boxShadow: drawerOpen ? '4px 0 32px rgba(0,0,0,.18)' : 'none',
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <span style={{ fontFamily:'DM Serif Display, serif', fontSize:20, color:'#1A1710' }}>
            {isFr ? 'Filtres' : 'Filters'}
          </span>
          <button onClick={() => setDrawerOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#8A8070', fontSize:20, lineHeight:1, padding:4 }}>✕</button>
        </div>
        <SidebarContent
          lang={lang} dest={dest} setDest={setDest}
          availOption={availOption} setAvailOption={setAvailOption}
          priceFilter={priceFilter} setPriceFilter={setPriceFilter}
          verifyFilter={verifyFilter} setVerifyFilter={setVerifyFilter}
          onFilter={handleFilter} onClose={() => setDrawerOpen(false)}
        />
      </div>

      {/* Main grid */}
      <div className="browse-main-grid" style={{ maxWidth:1200, margin:'0 auto', padding:'32px 32px', display:'grid', gridTemplateColumns:'260px 1fr', gap:32, alignItems:'start' }}>

        {/* Desktop sidebar */}
        <div className="browse-sidebar-col">
          <SidebarContent
            lang={lang} dest={dest} setDest={setDest}
            availOption={availOption} setAvailOption={setAvailOption}
            priceFilter={priceFilter} setPriceFilter={setPriceFilter}
            verifyFilter={verifyFilter} setVerifyFilter={setVerifyFilter}
            onFilter={handleFilter}
          />
        </div>

        {/* Results */}
        <div>
          {/* Header */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
            <span style={{ fontSize:11, fontWeight:700, color:'#8A8070', textTransform:'uppercase', letterSpacing:'.08em' }}>
              {loading ? '...' : isFr
                ? `Affichage 1–${sorted.length} sur ${sorted.length} résultats`
                : `Showing 1–${sorted.length} of ${sorted.length} results`}
            </span>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:11, fontWeight:700, color:'#8A8070', textTransform:'uppercase', letterSpacing:'.08em' }}>
                {isFr ? 'Trier par' : 'Sort by'}
              </span>
              <div style={{ position:'relative' }}>
                <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
                  style={{ padding:'6px 28px 6px 10px', border:'1px solid rgba(0,0,0,.15)', borderRadius:6, fontSize:12, fontFamily:'DM Sans, sans-serif', color:'#1A1710', outline:'none', cursor:'pointer', appearance:'none', background:'#fff', fontWeight:600 }}>
                  <option value="date">{isFr?'Date':'Date'}</option>
                  <option value="rating">{isFr?'Note':'Rating'}</option>
                  <option value="price">{isFr?'Prix':'Price'}</option>
                </select>
                <span style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:'#8A8070', fontSize:10 }}>▾</span>
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ background:'#fff', border:'1px solid rgba(0,0,0,.06)', borderRadius:12, padding:'20px 24px', display:'flex', gap:20, alignItems:'center' }}>
                  <div style={{ width:64, height:64, borderRadius:'50%', background:'#F0EDE8', flexShrink:0 }}/>
                  <div style={{ flex:1 }}>
                    <div style={{ height:18, background:'#F0EDE8', borderRadius:6, width:'40%', marginBottom:10 }}/>
                    <div style={{ height:12, background:'#F0EDE8', borderRadius:6, width:'60%', marginBottom:8 }}/>
                    <div style={{ height:12, background:'#F0EDE8', borderRadius:6, width:'50%' }}/>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:12, padding:20, fontSize:13, color:'#DC2626' }}>
              {isFr ? 'Impossible de charger les voyageurs.' : 'Could not load travelers.'} {error}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && sorted.length === 0 && (
            <div style={{ textAlign:'center', padding:'80px 24px' }}>
              <div style={{ fontFamily:'DM Serif Display, serif', fontSize:26, color:'#1A1710', marginBottom:8 }}>
                {isFr ? 'Aucun voyageur trouvé' : 'No travelers found'}
              </div>
              <p style={{ fontSize:14, color:'#8A8070', lineHeight:1.7, maxWidth:320, margin:'0 auto 24px' }}>
                {isFr ? 'Essayez une autre destination ou revenez bientôt.' : 'Try a different destination or check back soon.'}
              </p>
              <button
                onClick={() => { setDest('all'); setVerifyFilter('all'); setApplied({ dest:'all', dateFrom:'', dateTo:'', price:'', verify:'all' }) }}
                style={{ background:'#C8891C', color:'#fff', border:'none', padding:'12px 28px', borderRadius:20, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}
              >
                {isFr ? 'Voir tous les voyageurs' : 'View all travelers'}
              </button>
            </div>
          )}

          {/* Cards */}
          {!loading && !error && sorted.length > 0 && sorted.map(gp => (
            <GPCard key={gp.id} gp={gp} lang={lang} user={user} onContactClick={onLoginRequired} onViewProfile={onViewProfile} />
          ))}
        </div>
      </div>
    </div>
  )
}
