import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import GPCard from './GPCard'
import RequestCard from './RequestCard'
import { ShieldCheckIcon } from './Icons'
import { supabase } from '../lib/supabase'

const DESTINATION_GROUPS = [
  {
    label: { en: 'USA Origins', fr: 'Origines USA' },
    options: [
      { value: 'New York',      en: 'New York City (NYC)', fr: 'New York (NYC)' },
      { value: 'Washington DC', en: 'Washington, D.C. (IAD)', fr: 'Washington D.C. (IAD)' },
      { value: 'Atlanta',       en: 'Atlanta (ATL)',       fr: 'Atlanta (ATL)' },
    ],
  },
  {
    label: { en: 'Europe Origins', fr: 'Origines Europe' },
    options: [
      { value: 'Paris',  en: 'Paris (CDG)',  fr: 'Paris (CDG)' },
      { value: 'London', en: 'London (LHR)', fr: 'Londres (LHR)' },
    ],
  },
  {
    label: { en: 'Africa Destinations', fr: 'Destinations Afrique' },
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

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#A09080', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>
        {label}
      </div>
      {children}
    </div>
  )
}

function Select({ value, onChange, children }) {
  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={onChange}
        style={{
          width: '100%',
          padding: '10px 32px 10px 12px',
          border: '1.5px solid #E8E4DE',
          borderRadius: 10,
          fontSize: 13,
          fontFamily: 'DM Sans, sans-serif',
          color: '#1A1710',
          background: '#fff',
          outline: 'none',
          appearance: 'none',
          cursor: 'pointer',
          boxSizing: 'border-box',
          transition: 'border-color .15s',
        }}
        onFocus={e => e.target.style.borderColor = '#C8891C'}
        onBlur={e => e.target.style.borderColor = '#E8E4DE'}
      >
        {children}
      </select>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#A09080" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </div>
  )
}

function SidebarContent({ lang, fromFilter, setFromFilter, toFilter, setToFilter, availOption, setAvailOption, priceFilter, setPriceFilter, verifyFilter, setVerifyFilter, serviceFilter, setServiceFilter, onFilter, onClose }) {
  const isFr = lang === 'fr'

  const allCities = DESTINATION_GROUPS.flatMap(g => g.options)

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#1A1710', marginBottom: 2 }}>
          {isFr ? 'Filtres' : 'Filters'}
        </div>
        <div style={{ fontSize: 12, color: '#A09080' }}>
          {isFr ? 'Affinez votre recherche' : 'Narrow down your search'}
        </div>
      </div>

      {/* From + To on same row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#A09080', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>
            {isFr ? 'De' : 'From'}
          </div>
          <Select value={fromFilter} onChange={e => setFromFilter(e.target.value)}>
            <option value="">{isFr ? 'Toutes' : 'Any'}</option>
            {allCities.map(o => (
              <option key={o.value} value={o.value}>{o[lang] || o.en}</option>
            ))}
          </Select>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#A09080', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>
            {isFr ? 'À' : 'To'}
          </div>
          <Select value={toFilter} onChange={e => setToFilter(e.target.value)}>
            <option value="">{isFr ? 'Toutes' : 'Any'}</option>
            {allCities.map(o => (
              <option key={o.value} value={o.value}>{o[lang] || o.en}</option>
            ))}
          </Select>
        </div>
      </div>

      {/* Availability */}
      <Field label={isFr ? 'Disponibilité' : 'Availability'}>
        <Select value={availOption} onChange={e => setAvailOption(e.target.value)}>
          <option value="">{isFr ? 'Toute période' : 'Any time'}</option>
          {AVAIL_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt[lang] || opt.en}</option>
          ))}
        </Select>
      </Field>


      {/* Verification */}
      <Field label={isFr ? 'Voyageurs' : 'Travelers'}>
        <div style={{ display: 'flex', gap: 8 }}>
          {VERIFY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setVerifyFilter(opt.value)}
              style={{
                flex: 1,
                padding: '9px 0',
                borderRadius: 10,
                border: `1.5px solid ${verifyFilter === opt.value ? '#C8891C' : '#E8E4DE'}`,
                background: verifyFilter === opt.value ? '#FFF7ED' : '#fff',
                color: verifyFilter === opt.value ? '#C8891C' : '#6B6860',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
                transition: 'all .15s',
              }}
            >
              {opt[lang] || opt.en}
            </button>
          ))}
        </div>
      </Field>


      {/* Divider */}
      <div style={{ height: 1, background: '#F0EDE8', margin: '4px 0 20px' }} />

      {/* Apply */}
      <button
        onClick={() => { onFilter(); onClose?.() }}
        style={{
          width: '100%',
          padding: '13px',
          background: '#C8891C',
          color: '#fff',
          border: 'none',
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: 'DM Sans, sans-serif',
          letterSpacing: '.01em',
          transition: 'background .15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#A8710C'}
        onMouseLeave={e => e.currentTarget.style.background = '#C8891C'}
      >
        {isFr ? 'Appliquer' : 'Apply filters'}
      </button>
    </div>
  )
}

const POPULAR_ROUTES = [
  { from: 'New York',      to: 'Dakar',   count: 12 },
  { from: 'Paris',         to: 'Dakar',   count: 9  },
  { from: 'Washington DC', to: 'Conakry', count: 7  },
  { from: 'Atlanta',       to: 'Abidjan', count: 5  },
  { from: 'London',        to: 'Lagos',   count: 4  },
]

function RightSidebar({ lang, trips }) {
  const isFr = lang === 'fr'

  // Compute route counts from real trip data, fall back to static
  const routeCounts = useMemo(() => {
    if (!trips || trips.length === 0) return POPULAR_ROUTES
    const map = {}
    trips.forEach(t => {
      const from = t.from_city || t.from || ''
      const to   = t.to_city   || t.to   || ''
      if (!from || !to) return
      const key = `${from}||${to}`
      map[key] = (map[key] || 0) + 1
    })
    const result = Object.entries(map)
      .map(([key, count]) => { const [from, to] = key.split('||'); return { from, to, count } })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
    return result.length ? result : POPULAR_ROUTES
  }, [trips])

  const maxCount = Math.max(...routeCounts.map(r => r.count), 1)

  const tips = isFr
    ? [
        'Vérifiez toujours que le voyageur est vérifié avant de payer.',
        'Convenez du prix avant de remettre le colis.',
        'Prenez une photo du colis avant l\'envoi.',
      ]
    : [
        'Always check the traveler is verified before sending payment.',
        'Agree on the price before handing over the package.',
        'Take a photo of your package before drop-off.',
      ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Popular routes */}
      <div style={{ background: '#fff', border: '1.5px solid #EDEAE4', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid #F0EDE8' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#1A1710', letterSpacing: '-.1px' }}>
            {isFr ? 'Routes populaires' : 'Popular routes'}
          </div>
          <div style={{ fontSize: 11, color: '#A09080', marginTop: 2 }}>
            {isFr ? 'Basé sur les voyages actifs' : 'Based on active trips'}
          </div>
        </div>
        <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {routeCounts.map((r, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1A1710', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {r.from}
                  </span>
                  <span style={{ color: '#C8C0B4', fontSize: 10, flexShrink: 0 }}>→</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1A1710', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {r.to}
                  </span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#C8891C', flexShrink: 0, marginLeft: 8 }}>
                  {r.count} {isFr ? (r.count > 1 ? 'voyages' : 'voyage') : (r.count > 1 ? 'trips' : 'trip')}
                </span>
              </div>
              <div style={{ height: 4, background: '#F0EDE8', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.round((r.count / maxCount) * 100)}%`,
                  background: i === 0 ? 'linear-gradient(90deg, #C8891C, #E6A832)' : '#D4C4A8',
                  borderRadius: 4,
                  transition: 'width .4s ease',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Safety tips */}
      <div style={{ background: 'linear-gradient(145deg, #1A1710 0%, #2A2318 100%)', borderRadius: 16, padding: '18px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <ShieldCheckIcon size={15} color="#C8891C" />
          <span style={{ fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: '-.1px' }}>
            {isFr ? 'Conseils de sécurité' : 'Safety tips'}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tips.map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#C8891C22', border: '1px solid #C8891C55', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <span style={{ fontSize: 9, fontWeight: 900, color: '#C8891C' }}>{i + 1}</span>
              </div>
              <span style={{ fontSize: 11.5, color: '#C8B898', lineHeight: 1.55 }}>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trust badge */}
      <div style={{ background: '#F0FAF4', border: '1.5px solid #C8E6D4', borderRadius: 16, padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <ShieldCheckIcon size={20} color="#1A5C38" style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#1A4028', marginBottom: 3 }}>
            {isFr ? '100% vérifiés par téléphone' : '100% phone-verified'}
          </div>
          <div style={{ fontSize: 11, color: '#2D6B46', lineHeight: 1.5 }}>
            {isFr
              ? 'Chaque voyageur a confirmé son numéro WhatsApp avant d\'être publié.'
              : 'Every traveler has confirmed their WhatsApp number before being listed.'}
          </div>
        </div>
      </div>

    </div>
  )
}

export default function BrowsePage({ lang, trips, loading, error, user, onLoginRequired, searchFilter, onViewProfile }) {
  const [searchText, setSearchText]   = useState('')
  const [fromFilter, setFromFilter]   = useState('')
  const [toFilter, setToFilter]       = useState('')
  const [availOption, setAvailOption] = useState('')
  const [priceFilter, setPriceFilter] = useState('')
  const [verifyFilter, setVerifyFilter]   = useState('all')
  const [serviceFilter, setServiceFilter] = useState('all')
  const [sortBy, setSortBy]               = useState('date')
  const [applied, setApplied]             = useState({ from:'', to:'', dateFrom:'', dateTo:'', price:'', verify:'all', service:'all' })
  const [drawerOpen, setDrawerOpen]   = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [requests, setRequests]       = useState([])
  const [requestsLoading, setRequestsLoading] = useState(true)
  const [recentSearches, setRecentSearches]  = useState(() => {
    try { return JSON.parse(localStorage.getItem('yobbu_recent_searches') || '[]') } catch { return [] }
  })
  const searchRef = useRef(null)
  const suggestionsRef = useRef(null)
  const isFr = lang === 'fr'

  // ── Save a recent search ──────────────────────────────────────────
  const saveRecentSearch = useCallback((term) => {
    if (!term.trim()) return
    const updated = [term, ...recentSearches.filter(s => s.toLowerCase() !== term.toLowerCase())].slice(0, 5)
    setRecentSearches(updated)
    try { localStorage.setItem('yobbu_recent_searches', JSON.stringify(updated)) } catch {}
  }, [recentSearches])

  const clearRecentSearches = () => {
    setRecentSearches([])
    try { localStorage.removeItem('yobbu_recent_searches') } catch {}
  }

  // ── Build autocomplete suggestions from trip data ─────────────────
  const suggestions = useMemo(() => {
    const q = searchText.toLowerCase().trim()
    if (!q || q.length < 2) return []

    const citySet = new Set()
    const nameSet = new Set()
    const routeSet = new Set()

    trips.forEach(t => {
      const from = t.from_city || t.from || ''
      const to   = t.to_city   || t.to   || ''
      const name = t.name || ''
      if (from) citySet.add(from)
      if (to)   citySet.add(to)
      if (name) nameSet.add(name)
      if (from && to) routeSet.add(`${from} → ${to}`)
    })

    const results = []

    // Match cities
    ;[...citySet].filter(c => c.toLowerCase().includes(q)).slice(0, 3).forEach(c => {
      results.push({ type: 'city', label: c, icon: 'pin' })
    })

    // Match routes
    ;[...routeSet].filter(r => r.toLowerCase().includes(q)).slice(0, 3).forEach(r => {
      results.push({ type: 'route', label: r, icon: 'route' })
    })

    // Match traveler names
    ;[...nameSet].filter(n => n.toLowerCase().includes(q)).slice(0, 3).forEach(n => {
      results.push({ type: 'traveler', label: n, icon: 'user' })
    })

    return results.slice(0, 8)
  }, [searchText, trips])

  // ── Close suggestions on outside click ────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target) &&
          searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (!searchFilter) return
    if (searchFilter.dest) setToFilter(searchFilter.dest)
    if (searchFilter.from) setFromFilter(searchFilter.from)
  }, [searchFilter])

  // Memoize route extraction
  const routes = useMemo(() => {
    if (!trips || trips.length === 0) return []
    const routeSet = new Set()
    trips.forEach(t => {
      const from = t.from_city || t.from || ''
      const to = t.to_city || t.to || ''
      if (from && to) routeSet.add(`${from}||${to}`)
    })
    return Array.from(routeSet).map(r => r.split('||'))
  }, [trips])

  // Fetch package requests matching traveler's routes
  useEffect(() => {
    if (!user || routes.length === 0) {
      setRequestsLoading(false)
      return
    }

    setRequestsLoading(true)

    const loadRequests = async () => {
      try {
        const { data, error: err } = await supabase
          .from('package_requests')
          .select('*')
          .eq('status', 'open')

        if (err) throw err

        const today = new Date().toISOString().slice(0, 10)
        const matchingRequests = data.filter(req => {
          const routeMatch = routes.some(([from, to]) => req.from_city === from && req.to_city === to)
          const deadlineValid = !req.deadline || req.deadline >= today
          return routeMatch && deadlineValid
        })
        setRequests(matchingRequests)
      } catch (err) {
        setRequests([])
      } finally {
        setRequestsLoading(false)
      }
    }

    loadRequests()
  }, [user, routes])

  // Close drawer on Escape
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') setDrawerOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleFilter = () => {
    const { from, to } = availOption ? getDateRange(availOption) : { from:'', to:'' }
    setApplied({ from: fromFilter, to: toFilter, dateFrom: from, dateTo: to, price: priceFilter, verify: verifyFilter, service: serviceFilter })
  }

  const sorted = useMemo(() => {
    const maxPrice = applied.price ? parseFloat(applied.price) : null

    const filtered = trips.filter(g => {
      const toCity   = g.to_city   || g.to   || ''
      const fromCity = g.from_city || g.from || ''
      const q = searchText.toLowerCase().trim()
      const matchSearch = !q || [g.name, fromCity, toCity, g.pickup_area, g.dropoff_area, g.flight_number].filter(Boolean).some(s => s.toLowerCase().includes(q))
      const matchFrom   = !applied.from || fromCity === applied.from
      const matchDest   = !applied.to   || toCity   === applied.to
      const d = g.date && g.date.match(/^\d{4}-\d{2}-\d{2}$/) ? g.date : null
      const matchDate   = (!applied.dateFrom && !applied.dateTo) || !d ||
        ((!applied.dateFrom || d >= applied.dateFrom) && (!applied.dateTo || d <= applied.dateTo))
      const matchVerify = applied.verify === 'all' ||
        (applied.verify === 'verified' && (g.verified?.phone || g.phone_verified || g.verified?.id || g.id_verified || g.whatsapp_verified))
      const matchPrice   = !maxPrice || (parseFloat(String(g.price)) || Infinity) <= maxPrice
      const matchService = applied.service === 'all' || g.service_type === applied.service
      return matchSearch && matchFrom && matchDest && matchDate && matchVerify && matchPrice && matchService
    })

    const avOrder = { open: 0, full: 1, unavailable: 2 }
    return [...filtered].sort((a, b) => {
      const avDiff = (avOrder[a.availability_status] ?? 0) - (avOrder[b.availability_status] ?? 0)
      if (avDiff !== 0) return avDiff
      if (sortBy === 'rating') return (Number(b.rating)||0) - (Number(a.rating)||0)
      if (sortBy === 'price')  return (parseFloat(String(a.price))||0) - (parseFloat(String(b.price))||0)
      return 0
    })
  }, [trips, applied, sortBy, searchText])

  const activeFilterCount = [
    !!applied.from,
    !!applied.to,
    !!applied.dateFrom,
    !!applied.price,
    applied.verify !== 'all',
  ].filter(Boolean).length

  return (
    <div style={{ minHeight:'100vh', background:'#FDFBF7', fontFamily:'DM Sans, sans-serif' }}>
      <style>{`
        @media (max-width: 768px) {
          .browse-sidebar-col  { display: none !important; }
          .browse-main-grid    { grid-template-columns: 1fr !important; padding: 12px 12px 80px !important; }
          .mobile-filter-btn   { display: flex !important; }
          .browse-cards-grid   { grid-template-columns: 1fr !important; }
          .browse-trust-bar    { padding: 10px 16px !important; }
          .browse-search-bar   { position: sticky; top: 0; z-index: 10; background: #FDFBF7; padding-bottom: 8px; }
          .browse-desktop-sort { display: none !important; }
        }
        @media (min-width: 769px) and (max-width: 1100px) {
          .browse-cards-grid { grid-template-columns: 1fr !important; }
          .browse-right-col  { display: none !important; }
          .browse-main-grid  { grid-template-columns: 260px 1fr !important; }
        }
        @media (min-width: 769px) {
          .mobile-filter-btn { display: none !important; }
          .drawer-overlay    { display: none !important; }
        }
        @media (max-width: 1100px) {
          .browse-right-col  { display: none !important; }
        }
      `}</style>

      {/* Trust bar */}
      <div className="browse-trust-bar" style={{ background:'#F0FAF4', borderBottom:'1px solid #C8E6D4', padding:'10px 48px', display:'flex', alignItems:'center', gap:8 }}>
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
            <option value="date">{'Date'}</option>
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
          lang={lang} fromFilter={fromFilter} setFromFilter={setFromFilter} toFilter={toFilter} setToFilter={setToFilter}
          availOption={availOption} setAvailOption={setAvailOption}
          priceFilter={priceFilter} setPriceFilter={setPriceFilter}
          verifyFilter={verifyFilter} setVerifyFilter={setVerifyFilter}
          serviceFilter={serviceFilter} setServiceFilter={setServiceFilter}
          onFilter={handleFilter} onClose={() => setDrawerOpen(false)}
        />
      </div>

      {/* Main grid */}
      <div className="browse-main-grid" style={{ maxWidth:1380, margin:'0 auto', padding:'32px 32px', display:'grid', gridTemplateColumns:'260px 1fr 290px', gap:28, alignItems:'start' }}>

        {/* Desktop sidebar */}
        <div className="browse-sidebar-col">
          <SidebarContent
            lang={lang} fromFilter={fromFilter} setFromFilter={setFromFilter} toFilter={toFilter} setToFilter={setToFilter}
            availOption={availOption} setAvailOption={setAvailOption}
            priceFilter={priceFilter} setPriceFilter={setPriceFilter}
            verifyFilter={verifyFilter} setVerifyFilter={setVerifyFilter}
            serviceFilter={serviceFilter} setServiceFilter={setServiceFilter}
            onFilter={handleFilter}
          />
        </div>

        {/* Results */}
        <div>
          {/* Search bar */}
          <div className="browse-search-bar" ref={searchRef} style={{ marginBottom: 16, position: 'relative' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A09080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={searchText}
              onChange={e => { setSearchText(e.target.value); setShowSuggestions(true) }}
              onFocus={e => { e.target.style.borderColor = '#C8891C'; setShowSuggestions(true) }}
              onBlur={e => { e.target.style.borderColor = '#E8E4DE' }}
              onKeyDown={e => {
                if (e.key === 'Enter') { saveRecentSearch(searchText); setShowSuggestions(false) }
                if (e.key === 'Escape') setShowSuggestions(false)
              }}
              placeholder={isFr ? 'Rechercher un voyageur, une ville...' : 'Search traveler, city, route...'}
              style={{
                width: '100%',
                padding: '12px 14px 12px 42px',
                border: '1.5px solid #E8E4DE',
                borderRadius: 12,
                fontSize: 14,
                fontFamily: 'DM Sans, sans-serif',
                color: '#1A1710',
                background: '#fff',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color .15s',
              }}
            />

            {/* Autocomplete suggestions dropdown */}
            {showSuggestions && (suggestions.length > 0 || (recentSearches.length > 0 && !searchText.trim())) && (
              <div ref={suggestionsRef} style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                background: '#fff', border: '1.5px solid #E8E4DE', borderTop: 'none',
                borderRadius: '0 0 12px 12px', boxShadow: '0 8px 24px rgba(0,0,0,.08)',
                maxHeight: 320, overflowY: 'auto',
              }}>
                {/* Recent searches (shown when input is empty) */}
                {!searchText.trim() && recentSearches.length > 0 && (
                  <div style={{ padding: '10px 14px 6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#A09080', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                        {isFr ? 'Recherches récentes' : 'Recent searches'}
                      </span>
                      <button
                        onClick={clearRecentSearches}
                        style={{ background: 'none', border: 'none', fontSize: 10, color: '#C8891C', cursor: 'pointer', fontWeight: 600, fontFamily: 'DM Sans, sans-serif', padding: 0 }}
                      >
                        {isFr ? 'Effacer' : 'Clear'}
                      </button>
                    </div>
                    {recentSearches.map((term, i) => (
                      <button
                        key={i}
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => { setSearchText(term); setShowSuggestions(false) }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                          padding: '8px 6px', background: 'none', border: 'none', cursor: 'pointer',
                          fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#1A1710',
                          borderRadius: 6, transition: 'background .1s', textAlign: 'left',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F8F6F2'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8C0B4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                          <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                        </svg>
                        {term}
                      </button>
                    ))}
                  </div>
                )}

                {/* Live suggestions (shown when typing) */}
                {searchText.trim() && suggestions.length > 0 && (
                  <div style={{ padding: '6px 8px' }}>
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => { setSearchText(s.label); saveRecentSearch(s.label); setShowSuggestions(false) }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                          padding: '9px 8px', background: 'none', border: 'none', cursor: 'pointer',
                          fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#1A1710',
                          borderRadius: 8, transition: 'background .1s', textAlign: 'left',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F8F6F2'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        {s.icon === 'pin' && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8891C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                          </svg>
                        )}
                        {s.icon === 'route' && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B8AE0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                            <circle cx="6" cy="19" r="3"/><circle cx="18" cy="5" r="3"/><path d="M8.59 13.51l6.83-3.02"/>
                          </svg>
                        )}
                        {s.icon === 'user' && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8A8070" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                          </svg>
                        )}
                        <div>
                          <div style={{ fontWeight: 600, lineHeight: 1.3 }}>{s.label}</div>
                          <div style={{ fontSize: 10, color: '#A09080', marginTop: 1 }}>
                            {s.type === 'city' ? (isFr ? 'Ville' : 'City') :
                             s.type === 'route' ? (isFr ? 'Itinéraire' : 'Route') :
                             (isFr ? 'Voyageur' : 'Traveler')}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Header + desktop sort */}
          <div className="browse-desktop-sort" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
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
                  <option value="date">{'Date'}</option>
                  <option value="rating">{isFr?'Note':'Rating'}</option>
                  <option value="price">{isFr?'Prix':'Price'}</option>
                </select>
                <span style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:'#8A8070', fontSize:10 }}>▾</span>
              </div>
            </div>
          </div>

          {/* Loading — shimmer skeletons */}
          {loading && (
            <>
              <style>{`
                @keyframes shimmer {
                  0% { background-position: -400px 0; }
                  100% { background-position: 400px 0; }
                }
                .skeleton-pulse {
                  background: linear-gradient(90deg, #F0EDE8 25%, #E8E4DE 50%, #F0EDE8 75%);
                  background-size: 800px 100%;
                  animation: shimmer 1.4s infinite linear;
                }
              `}</style>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{ background:'#fff', border:'1px solid rgba(0,0,0,.06)', borderRadius:12, padding:'20px 24px', display:'flex', gap:20, alignItems:'center' }}>
                    <div className="skeleton-pulse" style={{ width:64, height:64, borderRadius:'50%', flexShrink:0 }}/>
                    <div style={{ flex:1 }}>
                      <div className="skeleton-pulse" style={{ height:18, borderRadius:6, width:'40%', marginBottom:10 }}/>
                      <div className="skeleton-pulse" style={{ height:12, borderRadius:6, width:'60%', marginBottom:8 }}/>
                      <div className="skeleton-pulse" style={{ height:12, borderRadius:6, width:'50%' }}/>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8 }}>
                      <div className="skeleton-pulse" style={{ height:24, width:56, borderRadius:6 }}/>
                      <div className="skeleton-pulse" style={{ height:32, width:88, borderRadius:8 }}/>
                    </div>
                  </div>
                ))}
              </div>
            </>
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
                onClick={() => { setFromFilter(''); setToFilter(''); setAvailOption(''); setPriceFilter(''); setVerifyFilter('all'); setServiceFilter('all'); setSearchText(''); setApplied({ from:'', to:'', dateFrom:'', dateTo:'', price:'', verify:'all', service:'all' }) }}
                style={{ background:'#C8891C', color:'#fff', border:'none', padding:'12px 28px', borderRadius:20, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}
              >
                {isFr ? 'Voir tous les voyageurs' : 'View all travelers'}
              </button>
            </div>
          )}

          {/* Cards */}
          {!loading && !error && sorted.length > 0 && (
            <div style={{ display:'flex', flexDirection:'column', gap:10, maxWidth:600 }}>
              {sorted.map(gp => (
                <GPCard key={gp.id} gp={gp} lang={lang} user={user} onContactClick={onLoginRequired} onViewProfile={onViewProfile} />
              ))}
            </div>
          )}

          {/* Package Requests Section */}
          {!loading && requests.length > 0 && (
            <div style={{ marginTop: 40, maxWidth: 600 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1710', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 16, paddingBottom: 12, borderBottom: '1.5px solid #E5E1DB' }}>
                {isFr ? 'Demandes de colis' : 'Package requests'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {requests.map(req => (
                  <RequestCard key={req.id} req={req} lang={lang} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="browse-right-col" style={{ position: 'sticky', top: 24 }}>
          <RightSidebar lang={lang} trips={trips} />
        </div>

      </div>
    </div>
  )
}
