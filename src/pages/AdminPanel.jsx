import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
 
const ADMIN_EMAIL = 'papamamadous@outlook.com'
 
const BAD_WORDS = ['scam','fraud','fake','spam','sex','porn','nude','drugs','weapon','hack','cheat','steal','robbery','violence']
 
function flagged(trip) {
  const text = `${trip.name} ${trip.note || ''}`.toLowerCase()
  return BAD_WORDS.some(w => text.includes(w))
}
 
function StatCard({ n, label, color = '#C8810A' }) {
  return (
    <div style={{ background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:12, padding:'16px 20px' }}>
      <div style={{ fontSize:28, fontWeight:800, color, letterSpacing:'-.5px' }}>{n}</div>
      <div style={{ fontSize:12, color:'#666', marginTop:3 }}>{label}</div>
    </div>
  )
}
 
const btn = {
  base: { fontSize:11, fontWeight:700, padding:'6px 13px', borderRadius:7, cursor:'pointer', fontFamily:"'Inter',sans-serif", border:'2px solid transparent', letterSpacing:'.01em' },
  edit:      { background:'#404040', color:'#fff', borderColor:'#555' },
  approve:   { background:'#22c55e', color:'#fff', borderColor:'#16a34a' },
  feature:   { background:'#f59e0b', color:'#fff', borderColor:'#d97706' },
  unfeature: { background:'#6b7280', color:'#fff', borderColor:'#4b5563' },
  suspend:   { background:'#f97316', color:'#fff', borderColor:'#ea580c' },
  ban:       { background:'#ef4444', color:'#fff', borderColor:'#dc2626' },
  restore:   { background:'#22c55e', color:'#fff', borderColor:'#16a34a' },
  reject:    { background:'#ef4444', color:'#fff', borderColor:'#dc2626' },
}
 
function Btn({ type, children, onClick }) {
  return (
    <button style={{ ...btn.base, ...btn[type] }} onClick={onClick}>{children}</button>
  )
}
 
export default function AdminPanel({ onSignOut }) {
  const [trips, setTrips]     = useState([])
  const [users, setUsers]     = useState([])
  const [tab, setTab]         = useState('travelers')
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [toast, setToast]     = useState(null)
  const [editingTrip, setEditingTrip] = useState(null)
 
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500) }
 
  useEffect(() => { fetchAll() }, [])
 
  async function fetchAll() {
    setLoading(true)
    const { data } = await supabase.from('trips').select('*').order('created_at', { ascending: false })
    setTrips(data || [])
    setLoading(false)
  }
 
  async function toggleVerify(id, field, current) {
    const { error } = await supabase.from('trips').update({ [field]: !current }).eq('id', id)
    if (!error) {
      setTrips(prev => prev.map(t => t.id === id ? { ...t, [field]: !current } : t))
      showToast(`Updated ${field.replace('_verified','').replace('_',' ')} verification`)
    }
  }
 
  async function deleteTrip(id) {
    if (!window.confirm('Delete this listing permanently?')) return
    const { error } = await supabase.from('trips').delete().eq('id', id)
    if (!error) { setTrips(prev => prev.filter(t => t.id !== id)); showToast('Listing deleted') }
  }
 
  async function toggleSuspend(id, suspended) {
    const { error } = await supabase.from('trips').update({ suspended: !suspended }).eq('id', id)
    if (!error) {
      setTrips(prev => prev.map(t => t.id === id ? { ...t, suspended: !suspended } : t))
      showToast(suspended ? 'Listing restored' : 'Listing suspended')
    }
  }
 
  async function toggleApproved(id, approved) {
    const { error } = await supabase.from('trips').update({ approved: !approved }).eq('id', id)
    if (!error) {
      setTrips(prev => prev.map(t => t.id === id ? { ...t, approved: !approved } : t))
      showToast(approved ? 'Listing unapproved' : 'Listing approved — now live!')
    }
  }
 
  async function toggleFeatured(id, featured) {
    const { error } = await supabase.from('trips').update({ featured: !featured }).eq('id', id)
    if (!error) {
      setTrips(prev => prev.map(t => t.id === id ? { ...t, featured: !featured } : t))
      showToast(featured ? 'Removed from featured' : 'Marked as featured!')
    }
  }
 
  async function saveEdit() {
    if (!editingTrip) return
    const { error } = await supabase.from('trips').update({
      name: editingTrip.name,
      from_city: editingTrip.from_city,
      to_city: editingTrip.to_city,
      date: editingTrip.date,
      space: editingTrip.space,
      price: editingTrip.price,
    }).eq('id', editingTrip.id)
    if (!error) {
      setTrips(prev => prev.map(t => t.id === editingTrip.id ? { ...t, ...editingTrip } : t))
      setEditingTrip(null)
      showToast('Listing updated')
    }
  }
 
  const pending  = trips.filter(t => !t.approved)
  const active   = trips.filter(t => t.approved && !t.suspended)
  const filtered = trips.filter(t => {
    const q = search.toLowerCase()
    return !q || t.name?.toLowerCase().includes(q) || t.from_city?.toLowerCase().includes(q) || t.to_city?.toLowerCase().includes(q)
  })
 
  const s = {
    page:   { minHeight:'100vh', background:'#0f0f0f', fontFamily:"'Inter',sans-serif", color:'#fff' },
    topbar: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 32px', borderBottom:'1px solid #1a1a1a', background:'#0a0a0a', position:'sticky', top:0, zIndex:50 },
    body:   { maxWidth:1200, margin:'0 auto', padding:'28px 32px' },
    tabs:   { display:'flex', gap:4, background:'#1a1a1a', borderRadius:10, padding:3, marginBottom:20, width:'fit-content' },
    tab:    (a) => ({ fontSize:12, fontWeight:600, padding:'7px 16px', borderRadius:7, border:'none', cursor:'pointer', fontFamily:"'Inter',sans-serif", background: a ? '#C8810A' : 'transparent', color: a ? '#fff' : '#555', transition:'all .15s' }),
    search: { padding:'9px 14px', borderRadius:10, border:'1px solid #2a2a2a', background:'#1a1a1a', color:'#fff', fontSize:13, fontFamily:"'Inter',sans-serif", outline:'none', width:280 },
    table:  { width:'100%', borderCollapse:'collapse', background:'#1a1a1a', borderRadius:14, overflow:'hidden', border:'1px solid #2a2a2a' },
    th:     { fontSize:10, fontWeight:700, color:'#666', textTransform:'uppercase', letterSpacing:'.08em', padding:'12px 16px', textAlign:'left', borderBottom:'1px solid #2a2a2a', background:'#222' },
    td:     { padding:'13px 16px', borderBottom:'1px solid #222', fontSize:13, verticalAlign:'middle' },
    status: (c) => ({ display:'inline-flex', fontSize:11, fontWeight:700, borderRadius:6, padding:'3px 9px', background:c, color:'#fff' }),
    input:  { padding:'6px 10px', borderRadius:6, border:'1px solid #333', background:'#111', color:'#fff', fontSize:12, fontFamily:"'Inter',sans-serif", outline:'none', width:'100%' },
  }
 
  return (
    <div style={s.page}>
      {toast && (
        <div style={{ position:'fixed', bottom:24, right:24, background:'#C8810A', color:'#fff', padding:'10px 18px', borderRadius:10, fontSize:13, fontWeight:600, zIndex:999 }}>
          {toast}
        </div>
      )}
 
      {/* Edit modal */}
      {editingTrip && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:998 }}>
          <div style={{ background:'#1a1a1a', borderRadius:16, padding:28, width:480, border:'1px solid #333' }}>
            <div style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>Edit listing</div>
            {[
              { label:'Name', key:'name' },
              { label:'From', key:'from_city' },
              { label:'To', key:'to_city' },
              { label:'Date', key:'date' },
              { label:'Space (kg)', key:'space' },
              { label:'Price', key:'price' },
            ].map(({ label, key }) => (
              <div key={key} style={{ marginBottom:12 }}>
                <div style={{ fontSize:11, color:'#666', marginBottom:4 }}>{label}</div>
                <input style={s.input} value={editingTrip[key] || ''} onChange={e => setEditingTrip(p => ({ ...p, [key]: e.target.value }))} />
              </div>
            ))}
            <div style={{ display:'flex', gap:8, marginTop:16 }}>
              <button style={{ ...btn.base, ...btn.approve, flex:1 }} onClick={saveEdit}>Save changes</button>
              <button style={{ ...btn.base, ...btn.edit }} onClick={() => setEditingTrip(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
 
      {/* Topbar */}
      <div style={s.topbar}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ fontFamily:"'Inter',sans-serif", fontSize:20, fontWeight:800 }}>
            Yob<span style={{ color:'#C8810A' }}>bu</span>
          </div>
          <span style={{ fontSize:10, background:'#C8810A', color:'#fff', borderRadius:20, padding:'2px 8px', fontWeight:700 }}>ADMIN</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:11, color:'#444' }}>{ADMIN_EMAIL}</span>
          <button style={{ ...btn.base, ...btn.edit, fontSize:12 }} onClick={onSignOut}>Sign out</button>
        </div>
      </div>
 
      <div style={s.body}>
        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10, marginBottom:24 }}>
          <StatCard n={trips.length} label="Total listings" />
          <StatCard n={pending.length} label="Pending approval" color="#fbbf24" />
          <StatCard n={active.length} label="Active listings" color="#4ade80" />
          <StatCard n={trips.filter(t=>t.featured).length} label="Featured GPs" color="#f59e0b" />
          <StatCard n={trips.filter(t=>t.suspended).length} label="Suspended" color="#f87171" />
        </div>
 
        {/* Pending alert */}
        {pending.length > 0 && (
          <div style={{ background:'rgba(251,191,36,.08)', border:'1px solid rgba(251,191,36,.2)', borderRadius:10, padding:'12px 16px', marginBottom:16, display:'flex', alignItems:'center', gap:10 }}>
            <span>⚠️</span>
            <span style={{ fontSize:13, color:'#fbbf24', fontWeight:500 }}>
              {pending.length} listing{pending.length > 1 ? 's' : ''} waiting for approval before going live.
            </span>
            <button onClick={() => setTab('pending')}
              style={{ marginLeft:'auto', fontSize:11, fontWeight:700, color:'#fbbf24', background:'none', border:'none', cursor:'pointer', fontFamily:"'Inter',sans-serif" }}>
              Review →
            </button>
          </div>
        )}
 
        {/* Tabs */}
        <div style={s.tabs}>
          {[
            { key:'travelers', label:`Travelers (${trips.length})` },
            { key:'pending',   label:`Pending (${pending.length})` },
            { key:'users',     label:'Users' },
          ].map(({ key, label }) => (
            <button key={key} style={s.tab(tab === key)} onClick={() => setTab(key)}>{label}</button>
          ))}
        </div>
 
        {/* Search */}
        {tab !== 'users' && (
          <div style={{ marginBottom:14 }}>
            <input style={s.search} placeholder="Search by name, city..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        )}
 
        {/* TRAVELERS TAB */}
        {tab === 'travelers' && (
          loading ? <div style={{ color:'#555', padding:'40px 0', textAlign:'center' }}>Loading...</div> : (
            <table style={s.table}>
              <thead>
                <tr>{['Traveler','Route','Date','Verification','Status','Actions'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.filter(t => t.approved).map(trip => (
                  <tr key={trip.id}>
                    <td style={s.td}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:34, height:34, borderRadius:'50%', background: trip.bg || '#C8810A', color: trip.color || '#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, flexShrink:0 }}>
                          {trip.initials || trip.name?.slice(0,2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight:600, color:'#fff' }}>{trip.name}</div>
                          <div style={{ fontSize:11, color:'#555' }}>{trip.phone || '—'}</div>
                        </div>
                        {flagged(trip) && <span style={{ fontSize:10, background:'rgba(251,191,36,.15)', color:'#fbbf24', borderRadius:4, padding:'1px 6px', fontWeight:700 }}>FLAGGED</span>}
                      </div>
                    </td>
                    <td style={{ ...s.td, color:'#aaa' }}>{trip.from_city} → {trip.to_city}</td>
                    <td style={{ ...s.td, color:'#aaa' }}>{trip.date}</td>
                    <td style={s.td}>
                      <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                        {['phone_verified','id_verified','community_verified'].map((field, i) => {
                          const labels = ['Phone','ID','Community']
                          return (
                            <button key={field} style={{ ...btn.base, ...(trip[field] ? btn.approve : btn.edit), fontSize:10, padding:'3px 8px' }}
                              onClick={() => toggleVerify(trip.id, field, trip[field])}>
                              {trip[field] ? `✓ ${labels[i]}` : `○ ${labels[i]}`}
                            </button>
                          )
                        })}
                      </div>
                    </td>
                    <td style={s.td}>
                      <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                        <span style={s.status(trip.suspended ? '#dc2626' : '#15803d')}>{trip.suspended ? 'Suspended' : 'Active'}</span>
                        {trip.featured && <span style={s.status('#d97706')}>Featured</span>}
                      </div>
                    </td>
                    <td style={s.td}>
                      <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                        <Btn type="edit" onClick={() => setEditingTrip(trip)}>Edit</Btn>
                        <Btn type={trip.featured ? 'unfeature' : 'feature'} onClick={() => toggleFeatured(trip.id, trip.featured)}>
                          {trip.featured ? 'Unfeature' : 'Feature'}
                        </Btn>
                        <Btn type={trip.suspended ? 'restore' : 'suspend'} onClick={() => toggleSuspend(trip.id, trip.suspended)}>
                          {trip.suspended ? 'Restore' : 'Suspend'}
                        </Btn>
                        <Btn type="ban" onClick={() => deleteTrip(trip.id)}>Delete</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
 
        {/* PENDING TAB */}
        {tab === 'pending' && (
          <table style={s.table}>
            <thead>
              <tr>{['Traveler','Route','Date','Space','Price','Actions'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {pending.length === 0 ? (
                <tr><td colSpan={6} style={{ ...s.td, textAlign:'center', color:'#555' }}>No listings pending approval.</td></tr>
              ) : pending.map(trip => (
                <tr key={trip.id}>
                  <td style={s.td}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:34, height:34, borderRadius:'50%', background: trip.bg || '#C8810A', color: trip.color || '#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700 }}>
                        {trip.initials || trip.name?.slice(0,2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight:600, color:'#fff' }}>{trip.name}</div>
                        <div style={{ fontSize:11, color:'#555' }}>Submitted recently</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ ...s.td, color:'#aaa' }}>{trip.from_city} → {trip.to_city}</td>
                  <td style={{ ...s.td, color:'#aaa' }}>{trip.date}</td>
                  <td style={{ ...s.td, color:'#aaa' }}>~{trip.space} kg</td>
                  <td style={{ ...s.td, color:'#C8810A', fontWeight:600 }}>{trip.price}</td>
                  <td style={s.td}>
                    <div style={{ display:'flex', gap:6 }}>
                      <Btn type="approve" onClick={() => toggleApproved(trip.id, false)}>Approve</Btn>
                      <Btn type="reject"  onClick={() => deleteTrip(trip.id)}>Reject</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
 
        {/* USERS TAB */}
        {tab === 'users' && (
          <div style={{ background:'#1a1a1a', borderRadius:14, border:'1px solid #2a2a2a', padding:'40px', textAlign:'center' }}>
            <div style={{ fontSize:13, color:'#555' }}>
              User management requires Supabase service role access.<br/>
              <span style={{ fontSize:12, color:'#444', marginTop:6, display:'block' }}>Coming in the next update.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}