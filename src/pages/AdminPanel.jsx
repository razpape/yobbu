import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import FacebookGPPosts from '../components/FacebookGPPosts'
import FacebookGPExtractor from '../components/FacebookGPExtractor'

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL

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
  const [trips, setTrips]         = useState([])
  const [users, setUsers]         = useState([])
  const [tab, setTab]             = useState('travelers')
  const [loading, setLoading]     = useState(true)
  const [usersLoading, setUsersLoading] = useState(false)
  const [search, setSearch]       = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [userFilter, setUserFilter] = useState('all')  // all|verified|unverified|admin|whatsapp
  const [toast, setToast]         = useState(null)
  const [editingTrip, setEditingTrip] = useState(null)

  // Admin verification modal state
  const [verifyModal, setVerifyModal]   = useState(null)  // { user, action: 'verify'|'revoke' }
  const [verifyNotes, setVerifyNotes]   = useState('')
  const [revokeReason, setRevokeReason] = useState('')
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState(new Set())

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  useEffect(() => { fetchAll() }, [])
  useEffect(() => { if (tab === 'users') fetchUsers() }, [tab])

  async function fetchAll() {
    setLoading(true)
    const { data } = await supabase.from('trips').select('*').order('created_at', { ascending: false })
    setTrips(data || [])
    setLoading(false)
  }

  async function fetchUsers() {
    setUsersLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setUsers(data || [])
    setUsersLoading(false)
  }

  async function adminVerifyUser() {
    if (!verifyModal) return
    setVerifyLoading(true)
    const { user } = verifyModal
    const now = new Date().toISOString()

    const { error } = await supabase.from('profiles').update({
      whatsapp_verified:          true,
      whatsapp_verified_at:       now,
      whatsapp_verified_by_admin: true,
      admin_verification_notes:   verifyNotes || null,
      verification_revoked_at:    null,
      verification_revoked_reason: null,
    }).eq('id', user.id)

    if (!error) {
      await supabase.from('admin_audit_log').insert({
        admin_email:       ADMIN_EMAIL,
        action:            'verify',
        target_user_id:    user.id,
        target_user_email: user.email,
        notes:             verifyNotes || null,
      })
      setUsers(prev => prev.map(u => u.id === user.id
        ? { ...u, whatsapp_verified: true, whatsapp_verified_by_admin: true, whatsapp_verified_at: now, verification_revoked_at: null }
        : u))
      showToast(`✓ ${user.email} marked as verified`)
    } else {
      showToast('Error updating user')
    }
    setVerifyModal(null)
    setVerifyNotes('')
    setVerifyLoading(false)
  }

  async function adminRevokeUser() {
    if (!verifyModal || !revokeReason.trim()) return
    setVerifyLoading(true)
    const { user } = verifyModal
    const now = new Date().toISOString()

    const { error } = await supabase.from('profiles').update({
      whatsapp_verified:           false,
      whatsapp_verified_at:        null,
      verification_revoked_at:     now,
      verification_revoked_reason: revokeReason,
    }).eq('id', user.id)

    if (!error) {
      await supabase.from('admin_audit_log').insert({
        admin_email:       ADMIN_EMAIL,
        action:            'revoke',
        target_user_id:    user.id,
        target_user_email: user.email,
        notes:             revokeReason,
      })
      setUsers(prev => prev.map(u => u.id === user.id
        ? { ...u, whatsapp_verified: false, whatsapp_verified_at: null, verification_revoked_at: now }
        : u))
      showToast(`Verification revoked for ${user.email}`)
    } else {
      showToast('Error revoking verification')
    }
    setVerifyModal(null)
    setRevokeReason('')
    setVerifyLoading(false)
  }

  async function bulkVerify() {
    if (selectedUsers.size === 0) return
    if (!window.confirm(`Verify ${selectedUsers.size} selected users?`)) return
    const now = new Date().toISOString()
    const ids  = [...selectedUsers]

    const { error } = await supabase.from('profiles').update({
      whatsapp_verified: true, whatsapp_verified_at: now,
      whatsapp_verified_by_admin: true,
    }).in('id', ids)

    if (!error) {
      await supabase.from('admin_audit_log').insert(
        ids.map(id => ({ admin_email: ADMIN_EMAIL, action: 'bulk_verify', target_user_id: id, notes: 'Bulk verified' }))
      )
      setUsers(prev => prev.map(u => ids.includes(u.id) ? { ...u, whatsapp_verified: true, whatsapp_verified_by_admin: true, whatsapp_verified_at: now } : u))
      setSelectedUsers(new Set())
      showToast(`✓ ${ids.length} users verified`)
    }
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
      if (!suspended) {
        const trip = trips.find(t => t.id === id)
        if (trip?.user_email) {
          fetch('/api/send-rejection-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to:    trip.user_email,
              name:  trip.name,
              route: `${trip.from_city} → ${trip.to_city}`,
              date:  trip.date,
            }),
          })
            .then(r => r.json().then(data => { if (!r.ok) {/* Silent fail */} }))
            .catch(err => {/* Silent fail */})
        }
      }
      setTrips(prev => prev.map(t => t.id === id ? { ...t, suspended: !suspended } : t))
      showToast(suspended ? 'Listing restored' : 'Listing suspended')
    }
  }

  async function toggleApproved(id, approved) {
    const { error } = await supabase.from('trips').update({ approved: !approved }).eq('id', id)
    if (!error) {
      if (!approved) {
        const trip = trips.find(t => t.id === id)
        if (trip?.user_email) {
          fetch('/api/send-approval-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to:    trip.user_email,
              name:  trip.name,
              route: `${trip.from_city} → ${trip.to_city}`,
              date:  trip.date,
            }),
          })
            .then(r => r.json().then(data => { if (!r.ok) {/* Silent fail */} }))
            .catch(err => {/* Silent fail */})
        }
      }
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
  const filteredUsers = users.filter(u => {
    const q = userSearch.toLowerCase()
    const matchSearch = !q || u.email?.toLowerCase().includes(q) || u.full_name?.toLowerCase().includes(q)
    const matchFilter =
      userFilter === 'all'       ? true :
      userFilter === 'verified'  ? u.whatsapp_verified :
      userFilter === 'unverified'? !u.whatsapp_verified :
      userFilter === 'admin'     ? u.whatsapp_verified_by_admin :
      userFilter === 'whatsapp'  ? (u.whatsapp_verified && !u.whatsapp_verified_by_admin) :
      true
    return matchSearch && matchFilter
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
      <style>{`
        @media (max-width: 768px) {
          .admin-topbar { padding: 12px 16px !important; }
          .admin-body { padding: 16px !important; }
          .admin-stats { grid-template-columns: repeat(3, 1fr) !important; }
          .admin-stats > div:nth-child(4),
          .admin-stats > div:nth-child(5) { grid-column: span 1; }
          .admin-table-scroll { overflow-x: auto !important; -webkit-overflow-scrolling: touch; }
          .admin-tabs { flex-wrap: wrap !important; }
        }
        @media (max-width: 480px) {
          .admin-stats { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
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
      <div className="admin-topbar" style={s.topbar}>
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

      <div className="admin-body" style={s.body}>
        {/* Stats */}
        <div className="admin-stats" style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10, marginBottom:24 }}>
          <StatCard n={trips.length} label="Total listings" />
          <StatCard n={pending.length} label="Pending approval" color="#fbbf24" />
          <StatCard n={active.length} label="Active listings" color="#4ade80" />
          <StatCard n={users.filter(u=>u.whatsapp_verified).length} label="WA Verified users" color="#22c55e" />
          <StatCard n={users.filter(u=>!u.whatsapp_verified).length} label="Unverified users" color="#f87171" />
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
        <div className="admin-tabs" style={s.tabs}>
          {[
            { key:'travelers', label:`Travelers (${trips.length})` },
            { key:'pending',   label:`Pending (${pending.length})` },
            { key:'facebook',  label:'📘 Facebook GP Posts' },
            { key:'ai-extract', label:'🤖 AI Extractor' },
            { key:'users',     label:`Users (${users.length})` },
          ].map(({ key, label }) => (
            <button key={key} style={s.tab(tab === key)} onClick={() => setTab(key)}>{label}</button>
          ))}
        </div>

        {/* Search */}
        {tab !== 'users' && tab !== 'facebook' && tab !== 'ai-extract' && (
          <div style={{ marginBottom:14 }}>
            <input style={s.search} placeholder="Search by name, city..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        )}

        {/* TRAVELERS TAB */}
        {tab === 'travelers' && (
          loading ? <div style={{ color:'#555', padding:'40px 0', textAlign:'center' }}>Loading...</div> : (
            <div className="admin-table-scroll">
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
            </div>
          )
        )}

        {/* PENDING TAB */}
        {tab === 'pending' && (
          <div className="admin-table-scroll">
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
          </div>
        )}

        {/* FACEBOOK GP POSTS TAB */}
        {tab === 'facebook' && (
          <FacebookGPPosts showToast={showToast} />
        )}

        {/* AI EXTRACTOR TAB */}
        {tab === 'ai-extract' && (
          <FacebookGPExtractor showToast={showToast} />
        )}

        {/* USERS TAB */}
        {tab === 'users' && (
          <>
            {/* Filter + search bar */}
            <div style={{ display:'flex', gap:10, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
              <input
                style={s.search} placeholder="Search by email..."
                value={userSearch} onChange={e => setUserSearch(e.target.value)}
              />
              <div style={{ display:'flex', gap:4, background:'#1a1a1a', borderRadius:10, padding:3 }}>
                {[
                  { key:'all',       label:'All' },
                  { key:'verified',  label:'✓ Verified' },
                  { key:'unverified',label:'○ Unverified' },
                  { key:'admin',     label:'🛡 Admin-verified' },
                  { key:'whatsapp',  label:'📱 WA-verified' },
                ].map(f => (
                  <button key={f.key} style={s.tab(userFilter === f.key)} onClick={() => setUserFilter(f.key)}>{f.label}</button>
                ))}
              </div>
              {selectedUsers.size > 0 && (
                <button style={{ ...btn.base, ...btn.approve }} onClick={bulkVerify}>
                  ✓ Verify {selectedUsers.size} selected
                </button>
              )}
              <button style={{ ...btn.base, ...btn.edit, marginLeft:'auto' }} onClick={fetchUsers}>↻ Refresh</button>
            </div>

            {usersLoading ? (
              <div style={{ color:'#555', padding:'40px 0', textAlign:'center' }}>Loading users...</div>
            ) : (
              <div className="admin-table-scroll">
                <table style={s.table}>
                  <thead>
                    <tr>
                      <th style={s.th}>
                        <input
                          type="checkbox"
                          onChange={e => {
                            const visible = filteredUsers.filter(u => !u.whatsapp_verified)
                            setSelectedUsers(e.target.checked ? new Set(visible.map(u => u.id)) : new Set())
                          }}
                          checked={selectedUsers.size > 0}
                        />
                      </th>
                      {['User','WhatsApp Status','Phone','Joined','Actions'].map(h => <th key={h} style={s.th}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr><td colSpan={6} style={{ ...s.td, textAlign:'center', color:'#555' }}>No users found.</td></tr>
                    ) : filteredUsers.map(u => (
                      <tr key={u.id}>
                        <td style={s.td}>
                          {!u.whatsapp_verified && (
                            <input
                              type="checkbox"
                              checked={selectedUsers.has(u.id)}
                              onChange={e => {
                                const next = new Set(selectedUsers)
                                e.target.checked ? next.add(u.id) : next.delete(u.id)
                                setSelectedUsers(next)
                              }}
                            />
                          )}
                        </td>

                        {/* User */}
                        <td style={s.td}>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{ width:34, height:34, borderRadius:'50%', background:'#2a2a2a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#888', flexShrink:0 }}>
                              {u.email?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <div style={{ fontWeight:600, color:'#fff', fontSize:13 }}>{u.full_name || '—'}</div>
                              <div style={{ fontSize:11, color:'#555' }}>{u.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Verification status */}
                        <td style={s.td}>
                          {u.whatsapp_verified ? (
                            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                              <span style={s.status('#15803d')}>
                                {u.whatsapp_verified_by_admin ? '🛡 Admin-verified' : '📱 WA-verified'}
                              </span>
                              {u.whatsapp_verified_at && (
                                <span style={{ fontSize:10, color:'#555' }}>
                                  {new Date(u.whatsapp_verified_at).toLocaleDateString()}
                                </span>
                              )}
                              {u.admin_verification_notes && (
                                <span style={{ fontSize:10, color:'#666', fontStyle:'italic' }} title={u.admin_verification_notes}>
                                  📝 {u.admin_verification_notes.slice(0, 30)}{u.admin_verification_notes.length > 30 ? '…' : ''}
                                </span>
                              )}
                            </div>
                          ) : u.verification_revoked_at ? (
                            <div>
                              <span style={s.status('#dc2626')}>Revoked</span>
                              {u.verification_revoked_reason && (
                                <div style={{ fontSize:10, color:'#666', marginTop:3, fontStyle:'italic' }}>
                                  {u.verification_revoked_reason.slice(0, 40)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={s.status('#374151')}>Not verified</span>
                          )}
                        </td>

                        {/* Masked phone */}
                        <td style={{ ...s.td, color:'#777', fontFamily:'monospace', fontSize:12 }}>
                          {u.whatsapp_number || '—'}
                        </td>

                        {/* Joined */}
                        <td style={{ ...s.td, color:'#555', fontSize:12 }}>
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                        </td>

                        {/* Actions */}
                        <td style={s.td}>
                          <div style={{ display:'flex', gap:5 }}>
                            {!u.whatsapp_verified ? (
                              <Btn type="approve" onClick={() => { setVerifyModal({ user: u, action: 'verify' }); setVerifyNotes('') }}>
                                Verify
                              </Btn>
                            ) : (
                              <Btn type="suspend" onClick={() => { setVerifyModal({ user: u, action: 'revoke' }); setRevokeReason('') }}>
                                Revoke
                              </Btn>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* VERIFY MODAL */}
        {verifyModal?.action === 'verify' && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999 }}>
            <div style={{ background:'#1a1a1a', borderRadius:16, padding:28, width:440, border:'1px solid #333' }}>
              <div style={{ fontSize:16, fontWeight:700, marginBottom:6 }}>Mark as verified?</div>
              <div style={{ fontSize:13, color:'#666', marginBottom:18, lineHeight:1.5 }}>
                This will give <strong style={{ color:'#fff' }}>{verifyModal.user.email}</strong> the verified badge. This action is logged.
              </div>
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:11, color:'#666', marginBottom:5 }}>Admin notes (optional)</div>
                <textarea
                  value={verifyNotes}
                  onChange={e => setVerifyNotes(e.target.value)}
                  placeholder="e.g. Verified via community vouching"
                  style={{ ...s.input, height:72, resize:'vertical', paddingTop:8, paddingBottom:8 }}
                />
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button style={{ ...btn.base, ...btn.approve, flex:1 }} onClick={adminVerifyUser} disabled={verifyLoading}>
                  {verifyLoading ? 'Verifying...' : '✓ Confirm Verify'}
                </button>
                <button style={{ ...btn.base, ...btn.edit }} onClick={() => setVerifyModal(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* REVOKE MODAL */}
        {verifyModal?.action === 'revoke' && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999 }}>
            <div style={{ background:'#1a1a1a', borderRadius:16, padding:28, width:440, border:'1px solid #333' }}>
              <div style={{ fontSize:16, fontWeight:700, marginBottom:6, color:'#f87171' }}>Revoke verification?</div>
              <div style={{ fontSize:13, color:'#666', marginBottom:18, lineHeight:1.5 }}>
                This will remove the verified badge from <strong style={{ color:'#fff' }}>{verifyModal.user.email}</strong>.
              </div>
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:11, color:'#666', marginBottom:5 }}>Reason (required)</div>
                <textarea
                  value={revokeReason}
                  onChange={e => setRevokeReason(e.target.value)}
                  placeholder="e.g. Duplicate account, fraudulent activity..."
                  style={{ ...s.input, height:72, resize:'vertical', paddingTop:8, paddingBottom:8 }}
                />
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button
                  style={{ ...btn.base, ...btn.ban, flex:1, opacity: !revokeReason.trim() ? .5 : 1 }}
                  onClick={adminRevokeUser}
                  disabled={verifyLoading || !revokeReason.trim()}
                >
                  {verifyLoading ? 'Revoking...' : 'Revoke verification'}
                </button>
                <button style={{ ...btn.base, ...btn.edit }} onClick={() => setVerifyModal(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}