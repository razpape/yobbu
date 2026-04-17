import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import FacebookGPPosts from '../components/FacebookGPPosts'
import FacebookGPExtractor from '../components/FacebookGPExtractor'

const BAD_WORDS = ['scam', 'fraud', 'fake', 'spam', 'sex', 'porn', 'nude', 'drugs', 'weapon', 'hack', 'cheat', 'steal', 'robbery', 'violence']

function flagged(trip) {
  const text = `${trip.name} ${trip.note || ''}`.toLowerCase()
  return BAD_WORDS.some(w => text.includes(w))
}

function StatCard({ n, label, color = '#C8810A' }) {
  return (
    <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: '16px 20px' }}>
      <div style={{ fontSize: 28, fontWeight: 800, color, letterSpacing: '-.5px' }}>{n}</div>
      <div style={{ fontSize: 12, color: '#666', marginTop: 3 }}>{label}</div>
    </div>
  )
}

const btn = {
  base: { fontSize: 11, fontWeight: 700, padding: '6px 13px', borderRadius: 7, cursor: 'pointer', fontFamily: "'Inter',sans-serif", border: '2px solid transparent', letterSpacing: '.01em' },
  edit: { background: '#404040', color: '#fff', borderColor: '#555' },
  approve: { background: '#22c55e', color: '#fff', borderColor: '#16a34a' },
  feature: { background: '#f59e0b', color: '#fff', borderColor: '#d97706' },
  unfeature: { background: '#6b7280', color: '#fff', borderColor: '#4b5563' },
  suspend: { background: '#f97316', color: '#fff', borderColor: '#ea580c' },
  ban: { background: '#ef4444', color: '#fff', borderColor: '#dc2626' },
  restore: { background: '#22c55e', color: '#fff', borderColor: '#16a34a' },
  reject: { background: '#ef4444', color: '#fff', borderColor: '#dc2626' },
}

function Btn({ type, children, onClick, disabled }) {
  return (
    <button style={{ ...btn.base, ...btn[type], opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }} onClick={onClick} disabled={disabled}>{children}</button>
  )
}

export default function AdminPanel({ onSignOut }) {
  const [userEmail, setUserEmail] = useState(null)
  const [trips, setTrips] = useState([])
  const [users, setUsers] = useState([])
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [usersLoading, setUsersLoading] = useState(false)
  const [quickStats, setQuickStats] = useState({ totalUsers: 0, newUsersWeek: 0, newTripsWeek: 0 })
  const [search, setSearch] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [userFilter, setUserFilter] = useState('all')
  const [toast, setToast] = useState(null)
  const [editingTrip, setEditingTrip] = useState(null)
  const [verifyModal, setVerifyModal] = useState(null)
  const [verifyNotes, setVerifyNotes] = useState('')
  const [revokeReason, setRevokeReason] = useState('')
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState(new Set())
  const [photoPending, setPhotoPending] = useState([])
  const [photosLoading, setPhotosLoading] = useState(false)
  const [operationInProgress, setOperationInProgress] = useState({})
  const [blogPosts, setBlogPosts] = useState([])
  const [blogLoading, setBlogLoading] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [newPost, setNewPost] = useState({ title_en: '', title_fr: '', excerpt_en: '', excerpt_fr: '', author_en: '', author_fr: '', image_color: '#52B5D9', featured: false })

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  // Get auth token for API calls
  const getAuthToken = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserEmail(user.email)
    })
  }, [])

  useEffect(() => { fetchAll() }, [])
  useEffect(() => { if (tab === 'users') fetchUsers() }, [tab])
  useEffect(() => { if (tab === 'photos') fetchPhotoPending() }, [tab])
  useEffect(() => { if (tab === 'blog') fetchBlogPosts() }, [tab])

  useEffect(() => {
    let timeoutId = null
    const subscription = supabase
      .channel('photos-pending')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, payload => {
        if (payload.new?.avatar_url) {
          showToast(`📸 New photo from ${payload.new.full_name || 'User'} - awaiting verification`)
          if (timeoutId) clearTimeout(timeoutId)
          timeoutId = setTimeout(() => fetchPhotoPending(), 500)
        }
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  async function fetchAll() {
    setLoading(true)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const [{ data: tripsData }, { count: totalUsers }, { count: newUsersWeek }, { count: newTripsWeek }] = await Promise.all([
      supabase.from('trips').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo),
      supabase.from('trips').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo),
    ])

    setTrips(tripsData || [])
    setQuickStats({ totalUsers: totalUsers || 0, newUsersWeek: newUsersWeek || 0, newTripsWeek: newTripsWeek || 0 })
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

  async function fetchPhotoPending() {
    setPhotosLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, phone, avatar_url, photo_pending, photo_verified, created_at')
      .eq('photo_pending', true)
      .order('created_at', { ascending: false })
    setPhotoPending(data || [])
    setPhotosLoading(false)
  }

  async function fetchBlogPosts() {
    setBlogLoading(true)
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })
    setBlogPosts(data || [])
    setBlogLoading(false)
  }

  async function saveBlogPost() {
    if (!newPost.title_en || !newPost.excerpt_en) {
      showToast('Title and excerpt required')
      return
    }
    setOperationInProgress(prev => ({ ...prev, blog: true }))
    try {
      if (editingPost?.id) {
        const { error } = await supabase
          .from('blog_posts')
          .update(newPost)
          .eq('id', editingPost.id)
        if (error) throw error
        setBlogPosts(prev => prev.map(p => p.id === editingPost.id ? { ...p, ...newPost } : p))
        showToast('Post updated!')
      } else {
        const { data, error } = await supabase
          .from('blog_posts')
          .insert([newPost])
          .select()
        if (error) throw error
        setBlogPosts(prev => [data[0], ...prev])
        showToast('Post created!')
      }
      setEditingPost(null)
      setNewPost({ title_en: '', title_fr: '', excerpt_en: '', excerpt_fr: '', author_en: '', author_fr: '', image_color: '#52B5D9', featured: false })
    } catch (err) {
      showToast(`⚠️ Error: ${err.message}`)
    } finally {
      setOperationInProgress(prev => ({ ...prev, blog: false }))
    }
  }

  async function deleteBlogPost(id) {
    if (!window.confirm('Delete this post?')) return
    setOperationInProgress(prev => ({ ...prev, [id]: true }))
    try {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id)
      if (error) throw error
      setBlogPosts(prev => prev.filter(p => p.id !== id))
      showToast('Post deleted')
    } catch (err) {
      showToast(`⚠️ Error: ${err.message}`)
    } finally {
      setOperationInProgress(prev => ({ ...prev, [id]: false }))
    }
  }

  // Helper to call admin API with auth
  async function callAdminApi(endpoint, body) {
    try {
      const token = await getAuthToken()
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Request failed' }))
        throw new Error(data.error || 'Request failed')
      }

      return await response.json()
    } catch (err) {
      console.error(`[Admin] API error:`, err.message)
      throw err
    }
  }

  async function approvePhoto(userId) {
    setOperationInProgress(prev => ({ ...prev, [userId]: true }))
    try {
      await callAdminApi('/api/admin-verify-user', {
        user_id: userId,
        action: 'approve_photo',
      })
      setPhotoPending(prev => prev.filter(u => u.id !== userId))
      showToast('Photo badge approved!')
    } catch (err) {
      showToast(`⚠️ Error: ${err.message}`)
    } finally {
      setOperationInProgress(prev => ({ ...prev, [userId]: false }))
    }
  }

  async function rejectPhoto(userId) {
    setOperationInProgress(prev => ({ ...prev, [userId]: true }))
    try {
      await callAdminApi('/api/admin-verify-user', {
        user_id: userId,
        action: 'reject_photo',
      })
      setPhotoPending(prev => prev.filter(u => u.id !== userId))
      showToast('Photo rejected and removed.')
    } catch (err) {
      showToast(`⚠️ Error: ${err.message}`)
    } finally {
      setOperationInProgress(prev => ({ ...prev, [userId]: false }))
    }
  }

  async function adminVerifyUser() {
    if (!verifyModal) return
    setVerifyLoading(true)
    const { user } = verifyModal
    const now = new Date().toISOString()

    try {
      await callAdminApi('/api/admin-verify-user', {
        user_id: user.id,
        action: 'verify',
        notes: verifyNotes,
      })

      setUsers(prev => prev.map(u => u.id === user.id
        ? { ...u, whatsapp_verified: true, whatsapp_verified_by_admin: true, whatsapp_verified_at: now, verification_revoked_at: null }
        : u))
      showToast(`✓ ${user.email} marked as verified`)
    } catch (err) {
      showToast(`⚠️ Error: ${err.message}`)
    } finally {
      setVerifyModal(null)
      setVerifyNotes('')
      setVerifyLoading(false)
    }
  }

  async function adminRevokeUser() {
    if (!verifyModal || !revokeReason.trim()) return
    setVerifyLoading(true)
    const { user } = verifyModal
    const now = new Date().toISOString()

    try {
      await callAdminApi('/api/admin-verify-user', {
        user_id: user.id,
        action: 'revoke',
        reason: revokeReason,
      })

      setUsers(prev => prev.map(u => u.id === user.id
        ? { ...u, whatsapp_verified: false, whatsapp_verified_at: null, verification_revoked_at: now }
        : u))
      showToast(`Verification revoked for ${user.email}`)
    } catch (err) {
      showToast(`⚠️ Error: ${err.message}`)
    } finally {
      setVerifyModal(null)
      setRevokeReason('')
      setVerifyLoading(false)
    }
  }

  async function bulkVerify() {
    if (selectedUsers.size === 0) return
    if (!window.confirm(`Verify ${selectedUsers.size} selected users?`)) return
    const now = new Date().toISOString()
    const ids = [...selectedUsers]

    try {
      for (const id of ids) {
        await callAdminApi('/api/admin-verify-user', {
          user_id: id,
          action: 'verify',
          notes: 'Bulk verified',
        })
      }

      setUsers(prev => prev.map(u => ids.includes(u.id) ? { ...u, whatsapp_verified: true, whatsapp_verified_by_admin: true, whatsapp_verified_at: now } : u))
      setSelectedUsers(new Set())
      showToast(`✓ ${ids.length} users verified`)
    } catch (err) {
      showToast(`⚠️ Error: ${err.message}`)
    }
  }

  async function toggleVerify(id, field, current) {
    setOperationInProgress(prev => ({ ...prev, [id]: true }))
    try {
      await callAdminApi('/api/admin-update-trip', {
        trip_id: id,
        field,
        value: !current,
      })
      setTrips(prev => prev.map(t => t.id === id ? { ...t, [field]: !current } : t))
      showToast(`Updated ${field.replace('_verified', '').replace('_', ' ')} verification`)
    } catch (err) {
      showToast(`⚠️ Error: ${err.message}`)
    } finally {
      setOperationInProgress(prev => ({ ...prev, [id]: false }))
    }
  }

  async function deleteTrip(id) {
    if (!window.confirm('Delete this listing permanently?')) return
    setOperationInProgress(prev => ({ ...prev, [id]: true }))
    try {
      const { error } = await supabase.from('trips').delete().eq('id', id)
      if (error) throw error
      setTrips(prev => prev.filter(t => t.id !== id))
      showToast('Listing deleted')
    } catch (err) {
      showToast(`⚠️ Error: ${err.message}`)
    } finally {
      setOperationInProgress(prev => ({ ...prev, [id]: false }))
    }
  }

  async function toggleSuspend(id, suspended) {
    setOperationInProgress(prev => ({ ...prev, [id]: true }))
    try {
      await callAdminApi('/api/admin-update-trip', {
        trip_id: id,
        field: 'suspended',
        value: !suspended,
      })

      if (!suspended) {
        const trip = trips.find(t => t.id === id)
        const token = await getAuthToken()
        if (trip?.user_email) {
          fetch('/api/send-rejection-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
              to: trip.user_email,
              name: trip.name,
              route: `${trip.from_city} → ${trip.to_city}`,
              date: trip.date,
            }),
          }).catch(err => console.error('[Admin] Email error:', err.message))
        }
      }

      setTrips(prev => prev.map(t => t.id === id ? { ...t, suspended: !suspended } : t))
      showToast(suspended ? 'Listing restored' : 'Listing suspended')
    } catch (err) {
      showToast(`⚠️ Error: ${err.message}`)
    } finally {
      setOperationInProgress(prev => ({ ...prev, [id]: false }))
    }
  }

  async function toggleApproved(id, approved) {
    setOperationInProgress(prev => ({ ...prev, [id]: true }))
    try {
      await callAdminApi('/api/admin-update-trip', {
        trip_id: id,
        field: 'approved',
        value: !approved,
      })

      if (!approved) {
        const trip = trips.find(t => t.id === id)
        const token = await getAuthToken()
        if (trip?.user_email) {
          fetch('/api/send-approval-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
              to: trip.user_email,
              name: trip.name,
              route: `${trip.from_city} → ${trip.to_city}`,
              date: trip.date,
            }),
          }).catch(err => console.error('[Admin] Email error:', err.message))
        }
      }

      setTrips(prev => prev.map(t => t.id === id ? { ...t, approved: !approved } : t))
      showToast(approved ? 'Listing unapproved' : 'Listing approved — now live!')
    } catch (err) {
      showToast(`⚠️ Error: ${err.message}`)
    } finally {
      setOperationInProgress(prev => ({ ...prev, [id]: false }))
    }
  }

  async function toggleFeatured(id, featured) {
    setOperationInProgress(prev => ({ ...prev, [id]: true }))
    try {
      await callAdminApi('/api/admin-update-trip', {
        trip_id: id,
        field: 'featured',
        value: !featured,
      })
      setTrips(prev => prev.map(t => t.id === id ? { ...t, featured: !featured } : t))
      showToast(featured ? 'Removed from featured' : 'Marked as featured!')
    } catch (err) {
      showToast(`⚠️ Error: ${err.message}`)
    } finally {
      setOperationInProgress(prev => ({ ...prev, [id]: false }))
    }
  }

  async function saveEdit() {
    if (!editingTrip) return
    setOperationInProgress(prev => ({ ...prev, edit: true }))
    try {
      const { error } = await supabase.from('trips').update({
        name: editingTrip.name,
        from_city: editingTrip.from_city,
        to_city: editingTrip.to_city,
        date: editingTrip.date,
        space: editingTrip.space,
        price: editingTrip.price,
      }).eq('id', editingTrip.id)

      if (error) throw error

      setTrips(prev => prev.map(t => t.id === editingTrip.id ? { ...t, ...editingTrip } : t))
      setEditingTrip(null)
      showToast('Listing updated')
    } catch (err) {
      showToast(`⚠️ Error: ${err.message}`)
    } finally {
      setOperationInProgress(prev => ({ ...prev, edit: false }))
    }
  }

  const pending = useMemo(() => trips.filter(t => t.approved !== true && !t.suspended), [trips])
  const active = useMemo(() => trips.filter(t => t.approved && !t.suspended), [trips])
  const filtered = useMemo(() => trips.filter(t => {
    const q = search.toLowerCase()
    return !q || t.name?.toLowerCase().includes(q) || t.from_city?.toLowerCase().includes(q) || t.to_city?.toLowerCase().includes(q)
  }), [trips, search])

  const filteredUsers = useMemo(() => users.filter(u => {
    const q = userSearch.toLowerCase()
    const matchSearch = !q || u.email?.toLowerCase().includes(q) || u.full_name?.toLowerCase().includes(q)
    const matchFilter =
      userFilter === 'all' ? true :
        userFilter === 'verified' ? u.whatsapp_verified :
          userFilter === 'unverified' ? !u.whatsapp_verified :
            userFilter === 'admin' ? u.whatsapp_verified_by_admin :
              userFilter === 'whatsapp' ? (u.whatsapp_verified && !u.whatsapp_verified_by_admin) :
                true
    return matchSearch && matchFilter
  }), [users, userSearch, userFilter])

  const s = {
    page: { minHeight: '100vh', background: '#0f0f0f', fontFamily: "'Inter',sans-serif", color: '#fff' },
    topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderBottom: '1px solid #1a1a1a', background: '#0a0a0a', position: 'sticky', top: 0, zIndex: 50 },
    body: { maxWidth: 1200, margin: '0 auto', padding: '28px 32px' },
    tabs: { display: 'flex', gap: 4, background: '#1a1a1a', borderRadius: 10, padding: 3, marginBottom: 20, width: 'fit-content' },
    tab: (a) => ({ fontSize: 12, fontWeight: 600, padding: '7px 16px', borderRadius: 7, border: 'none', cursor: 'pointer', fontFamily: "'Inter',sans-serif", background: a ? '#C8810A' : 'transparent', color: a ? '#fff' : '#555', transition: 'all .15s' }),
    search: { padding: '9px 14px', borderRadius: 10, border: '1px solid #2a2a2a', background: '#1a1a1a', color: '#fff', fontSize: 13, fontFamily: "'Inter',sans-serif", outline: 'none', width: 280 },
    input: { padding: '6px 10px', borderRadius: 6, border: '1px solid #333', background: '#111', color: '#fff', fontSize: 12, fontFamily: "'Inter',sans-serif", outline: 'none', width: '100%' },
  }

  return (
    <div style={s.page}>
      <div style={s.topbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 20, fontWeight: 800 }}>
            Yob<span style={{ color: '#C8810A' }}>bu</span>
          </div>
          <span style={{ fontSize: 10, background: '#C8810A', color: '#fff', borderRadius: 20, padding: '2px 8px', fontWeight: 700 }}>ADMIN</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 11, color: '#444' }}>{userEmail}</span>
          <button style={{ ...btn.base, ...btn.edit, fontSize: 12 }} onClick={onSignOut}>Sign out</button>
        </div>
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#C8810A', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 999 }}>
          {toast}
        </div>
      )}

      <div style={s.body}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 24 }}>
          <StatCard n={quickStats.totalUsers} label="Total users" />
          <StatCard n={quickStats.newUsersWeek} label="New this week" color="#818cf8" />
          <StatCard n={pending.length} label="Pending approval" color="#fbbf24" />
          <StatCard n={active.length} label="Active listings" color="#4ade80" />
          <StatCard n={users.filter(u => u.whatsapp_verified).length} label="Verified users" color="#22c55e" />
        </div>

        {loading ? (
          <div style={{ color: '#555', padding: '40px 0', textAlign: 'center' }}>Loading...</div>
        ) : (
          <>
            <div style={s.tabs}>
              {[
                { key: 'overview', label: 'Overview' },
                { key: 'travelers', label: `Travelers (${trips.length})` },
                { key: 'pending', label: `Pending (${pending.length})` },
                { key: 'photos', label: `Photos ${photoPending.length > 0 ? `(${photoPending.length})` : ''}` },
                { key: 'users', label: `Users (${users.length})` },
                { key: 'blog', label: `Blog (${blogPosts.length})` },
              ].map(({ key, label }) => (
                <button key={key} style={s.tab(tab === key)} onClick={() => setTab(key)}>{label}</button>
              ))}
            </div>

            {tab === 'overview' && (
              <div style={{ color: '#666', fontSize: 14 }}>Dashboard overview. More detailed views in other tabs.</div>
            )}

            {tab === 'travelers' && (
              <div>
                <input style={s.search} placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
                <p style={{ color: '#666', fontSize: 12, marginTop: 12 }}>{filtered.length} listings</p>
              </div>
            )}

            {tab === 'pending' && (
              <div>
                <p style={{ color: '#666', fontSize: 12, marginBottom: 12 }}>
                  {pending.length} listing{pending.length === 1 ? '' : 's'} awaiting approval
                </p>
              </div>
            )}

            {tab === 'photos' && (
              <div>
                <p style={{ color: '#666', fontSize: 12 }}>Photos pending verification</p>
                {photosLoading ? (
                  <div style={{ color: '#555', padding: '20px 0' }}>Loading...</div>
                ) : photoPending.length === 0 ? (
                  <div style={{ color: '#555', padding: '20px 0' }}>No photos to review</div>
                ) : (
                  photoPending.map(u => (
                    <div key={u.id} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: '16px', marginTop: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div>
                        {u.avatar_url ? <img src={u.avatar_url} alt={u.full_name} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }} /> : <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#2a2a2a' }} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{u.full_name || 'User'}</div>
                        <div style={{ fontSize: 11, color: '#666' }}>{u.phone}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Btn type="approve" onClick={() => approvePhoto(u.id)} disabled={operationInProgress[u.id]}>Approve</Btn>
                        <Btn type="reject" onClick={() => rejectPhoto(u.id)} disabled={operationInProgress[u.id]}>Reject</Btn>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'users' && (
              <div>
                <input style={s.search} placeholder="Search users..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
                <p style={{ color: '#666', fontSize: 12, marginTop: 12 }}>{filteredUsers.length} users</p>
              </div>
            )}

            {tab === 'blog' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <p style={{ color: '#666', fontSize: 12 }}>{blogPosts.length} posts</p>
                  <Btn type="approve" onClick={() => { setEditingPost(null); setNewPost({ title_en: '', title_fr: '', excerpt_en: '', excerpt_fr: '', author_en: '', author_fr: '', image_color: '#52B5D9', featured: false }) }}>
                    {editingPost ? 'Cancel' : 'New Post'}
                  </Btn>
                </div>

                {editingPost || newPost.title_en || editingPost === null ? (
                  <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 20, marginBottom: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#C8810A', marginBottom: 16 }}>
                      {editingPost ? 'EDIT POST' : 'NEW POST'}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <input
                        type="text"
                        placeholder="English Title"
                        value={newPost.title_en}
                        onChange={e => setNewPost({ ...newPost, title_en: e.target.value })}
                        style={s.input}
                      />
                      <input
                        type="text"
                        placeholder="French Title"
                        value={newPost.title_fr}
                        onChange={e => setNewPost({ ...newPost, title_fr: e.target.value })}
                        style={s.input}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <input
                        type="text"
                        placeholder="English Excerpt"
                        value={newPost.excerpt_en}
                        onChange={e => setNewPost({ ...newPost, excerpt_en: e.target.value })}
                        style={s.input}
                      />
                      <input
                        type="text"
                        placeholder="French Excerpt"
                        value={newPost.excerpt_fr}
                        onChange={e => setNewPost({ ...newPost, excerpt_fr: e.target.value })}
                        style={s.input}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <input
                        type="text"
                        placeholder="English Author"
                        value={newPost.author_en}
                        onChange={e => setNewPost({ ...newPost, author_en: e.target.value })}
                        style={s.input}
                      />
                      <input
                        type="text"
                        placeholder="French Author"
                        value={newPost.author_fr}
                        onChange={e => setNewPost({ ...newPost, author_fr: e.target.value })}
                        style={s.input}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <input
                        type="text"
                        placeholder="Image Color (hex)"
                        value={newPost.image_color}
                        onChange={e => setNewPost({ ...newPost, image_color: e.target.value })}
                        style={s.input}
                      />
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#666', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={newPost.featured}
                          onChange={e => setNewPost({ ...newPost, featured: e.target.checked })}
                          style={{ cursor: 'pointer' }}
                        />
                        Featured Post
                      </label>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                      <Btn type="approve" onClick={saveBlogPost} disabled={operationInProgress.blog}>Save Post</Btn>
                      <Btn type="edit" onClick={() => { setEditingPost(null); setNewPost({ title_en: '', title_fr: '', excerpt_en: '', excerpt_fr: '', author_en: '', author_fr: '', image_color: '#52B5D9', featured: false }) }}>Cancel</Btn>
                    </div>
                  </div>
                ) : null}

                {blogLoading ? (
                  <div style={{ color: '#555', padding: '20px 0' }}>Loading...</div>
                ) : blogPosts.length === 0 ? (
                  <div style={{ color: '#555', padding: '20px 0' }}>No posts yet</div>
                ) : (
                  blogPosts.map(post => (
                    <div key={post.id} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 16, marginBottom: 12, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                      <div style={{ width: 60, height: 60, borderRadius: 8, background: post.image_color, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: '#fff', marginBottom: 4 }}>{post.title_en}</div>
                        <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>{post.excerpt_en}</div>
                        <div style={{ fontSize: 11, color: '#444' }}>
                          {post.author_en} • {new Date(post.created_at).toLocaleDateString()}
                          {post.featured && <span style={{ marginLeft: 8, color: '#fbbf24' }}>★ Featured</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Btn type="edit" onClick={() => { setEditingPost(post); setNewPost(post) }} disabled={operationInProgress[post.id]}>Edit</Btn>
                        <Btn type="ban" onClick={() => deleteBlogPost(post.id)} disabled={operationInProgress[post.id]}>Delete</Btn>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
