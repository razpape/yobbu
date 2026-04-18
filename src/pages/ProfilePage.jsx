import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import LoadingSpinner from '../components/LoadingSpinner'
import {
  PlaneIcon, SettingsIcon, BellIcon, HelpIcon, EditIcon, TrashIcon,
  CheckCircleIcon, WarningIcon, ShieldCheckIcon,
  CalendarIcon, PackageIcon, DollarIcon, MapPinIcon,
  UserIcon, GlobeIcon, LogOutIcon, PlusIcon, MailIcon, MessageIcon,
} from '../components/Icons'
import TrustBadges from '../components/TrustBadges'
import IDVerificationUpload from '../components/IDVerificationUpload'
import SocialProfileLinks from '../components/SocialProfileLinks'
import AvatarUpload from '../components/AvatarUpload'

const T = {
  en: {
    langLabel: 'Language', menuTrips: 'My Trips', menuRequests: 'My Requests', menuSettings: 'Settings',
    menuNotif: 'Notifications', menuHelp: 'Help',
    tripsTitle: 'My Trips', requestsTitle: 'My Requests', settingsTitle: 'Settings', notifTitle: 'Notifications', helpTitle: 'Help',
    st1: 'Total', st2: 'Live', st3: 'Paused',
    active: 'Live', pending: 'Under review', suspended: 'Paused',
    edit: 'Edit', delete: 'Delete', postNew: 'Post a New Trip',
    accInfo: 'Account info', fullName: 'Full name', contact: 'Contact', since: 'Member since', baseCountry: 'Ships from',
    signout: 'Sign out',
    notifEmpty: "No notifications yet. We'll notify you when your listing is approved.",
    noTrips: "You haven't posted any trips yet.",
    noRequests: "You haven't posted any package requests yet.",
    liveDesc: 'People can see and contact you',
    pendingDesc: 'We\'re reviewing your listing',
    suspendedDesc: 'Contact us if you think this is a mistake',
    reqOpen: 'Open', reqMatched: 'Matched', reqClosed: 'Closed',
    postRequest: 'Post a Request',
  },
  fr: {
    langLabel: 'Langue', menuTrips: 'Mes voyages', menuRequests: 'Mes demandes', menuSettings: 'Paramètres',
    menuNotif: 'Notifications', menuHelp: 'Aide',
    tripsTitle: 'Mes voyages', requestsTitle: 'Mes demandes', settingsTitle: 'Paramètres', notifTitle: 'Notifications', helpTitle: 'Aide',
    st1: 'Total', st2: 'En ligne', st3: 'Pausé',
    active: 'En ligne', pending: 'En révision', suspended: 'Pausé',
    edit: 'Modifier', delete: 'Supprimer', postNew: 'Poster un voyage',
    accInfo: 'Informations du compte', fullName: 'Nom complet', contact: 'Contact', since: 'Membre depuis', baseCountry: 'Expédie depuis',
    signout: 'Se déconnecter',
    notifEmpty: "Aucune notification. Vous serez notifié lorsque votre annonce sera approuvée.",
    noTrips: "Vous n'avez pas encore posté de voyage.",
    noRequests: "Vous n'avez pas encore posté de demande d'envoi.",
    liveDesc: 'Les gens peuvent vous voir et vous contacter',
    pendingDesc: 'Nous examinons votre annonce',
    suspendedDesc: "Contactez-nous si vous pensez que c'est une erreur",
    reqOpen: 'Ouverte', reqMatched: 'Contacté', reqClosed: 'Fermée',
    postRequest: 'Poster une demande',
  }
}

export default function ProfilePage({ user, lang: initialLang, onSignOut, setView }) {
  const [lang, setLang]               = useState(initialLang || 'en')
  const isSender = user?.role === 'sender' || user?.role === 'both'
  const [section, setSection]         = useState(isSender ? 'requests' : 'trips')
  const [avatarUrl, setAvatarUrl]     = useState(null)
  const [profileName,    setProfileName]    = useState('')
  const [photoVerified,  setPhotoVerified]  = useState(false)
  const [baseCountry, setBaseCountry] = useState('')
  const [trips, setTrips]             = useState([])
  const [loading, setLoading]         = useState(true)
  const [editingTrip, setEditingTrip]   = useState(null)
  const [saving, setSaving]             = useState(false)
  const [requests, setRequests]         = useState([])
  const [loadingReqs, setLoadingReqs]   = useState(true)
  const [editingReq, setEditingReq]     = useState(null)
  const [savingReq, setSavingReq]       = useState(false)
  const [notifSeen, setNotifSeen]       = useState(false)
  const [profileData, setProfileData]   = useState(null)
  const [showAvatarUpload, setShowAvatarUpload] = useState(false)
  const [photoPending, setPhotoPending] = useState(false)
  const t        = T[lang]
  const isFr     = lang === 'fr'
  const meta     = user?.user_metadata || {}
  const fullName = profileName
    || (user?.first_name ? `${user.first_name} ${user?.last_name || ''}`.trim() : null)
    || meta.full_name || meta.name || ''
  const contact  = user?.email?.endsWith('@phone.yobbu.app') ? (user?.phone || '—') : (user?.email || user?.phone || '—')
  const initials = fullName ? fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'GP'
  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(isFr ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' })
    : '—'

  function fetchProfile() {
    if (!user?.id) return
    supabase.from('profiles').select('avatar_url, full_name, country_of_origin, photo_verified, photo_pending, id_verified').eq('id', user.id).maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          console.error('[ProfilePage] Error fetching profile:', error)
          return
        }
        if (!data) return
        setProfileData(data)
        if (data.avatar_url) {
          setAvatarUrl(data.avatar_url)
        }
        if (data.full_name)        setProfileName(data.full_name)
        if (data.country_of_origin) setBaseCountry(data.country_of_origin)
        setPhotoVerified(!!data.photo_verified)
        setPhotoPending(!!data.photo_pending)
      })
      .catch(err => console.error('[ProfilePage] Unexpected error fetching profile:', err))
  }

  useEffect(() => {
    fetchTrips()
    fetchRequests()
    fetchProfile()

    if (!user?.id) return
    const subscription = supabase
      .channel(`profile:${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, ({ new: row }) => {
        fetchProfile()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  async function fetchTrips() {
    if (!user?.id) return
    setLoading(true)
    const { data } = await supabase.from('trips').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setTrips(data || [])
    setLoading(false)
  }

  async function fetchRequests() {
    if (!user?.id) return
    setLoadingReqs(true)
    const { data } = await supabase.from('package_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setRequests(data || [])
    setLoadingReqs(false)
  }

  async function deleteItem(table, id, stateUpdater, itemLabel) {
    const msg = isFr ? `Supprimer ce${itemLabel === 'trip' ? 't' : 'tte'} ${itemLabel}?` : `Delete this ${itemLabel}?`
    if (!window.confirm(msg)) return
    const { error } = await supabase.from(table).delete().eq('id', id).eq('user_id', user.id)
    if (!error) stateUpdater(prev => prev.filter(item => item.id !== id))
  }

  async function deleteRequest(id) {
    await deleteItem('package_requests', id, setRequests, 'request')
  }

  async function saveEditReq() {
    if (!editingReq) return
    setSavingReq(true)
    const { error } = await supabase.from('package_requests').update({
      from_city:   editingReq.from_city,
      to_city:     editingReq.to_city,
      weight:      editingReq.weight,
      description: editingReq.description,
      deadline:    editingReq.deadline || null,
      phone:       editingReq.phone,
      budget:      editingReq.budget || null,
    }).eq('id', editingReq.id).eq('user_id', user.id)
    if (!error) {
      setRequests(prev => prev.map(r => r.id === editingReq.id ? { ...r, ...editingReq } : r))
      setEditingReq(null)
    }
    setSavingReq(false)
  }

  async function deleteTrip(id) {
    await deleteItem('trips', id, setTrips, 'listing')
  }

  async function updateAvailability(id, status) {
    const { error } = await supabase.from('trips').update({ availability_status: status }).eq('id', id).eq('user_id', user.id)
    if (!error) setTrips(prev => prev.map(tr => tr.id === id ? { ...tr, availability_status: status } : tr))
  }

  async function saveEdit() {
    if (!editingTrip) return
    setSaving(true)
    const { error } = await supabase.from('trips').update({
      from_city: editingTrip.from_city, to_city: editingTrip.to_city,
      date: editingTrip.date, space: editingTrip.space, price: editingTrip.price,
      phone: editingTrip.phone, note: editingTrip.note,
    }).eq('id', editingTrip.id).eq('user_id', user.id)
    if (!error) {
      setTrips(prev => prev.map(tr => tr.id === editingTrip.id ? { ...tr, ...editingTrip } : tr))
      setEditingTrip(null)
    }
    setSaving(false)
  }

  const notifications = [
    ...(photoVerified  ? [{ type: 'photo_approved', id: 'photo_approved' }] : []),
    ...(photoPending && !photoVerified ? [{ type: 'photo_pending', id: 'photo_pending' }] : []),
    ...trips.flatMap(tr => {
      const items = []
      if (tr.suspended)       items.push({ type: 'suspended', trip: tr, id: `suspended-${tr.id}` })
      else if (tr.approved)   items.push({ type: 'approved',  trip: tr, id: `approved-${tr.id}` })
      else                    items.push({ type: 'pending',   trip: tr, id: `pending-${tr.id}` })
      return items
    }),
  ]
  const notifBadge = section === 'notifications' ? 0 : notifications.length
  const [dismissedNotifs, setDismissedNotifs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('yobbu_dismissed_notifs') || '[]')
    } catch {
      return []
    }
  })

  const visibleNotifications = notifications.filter(n => !dismissedNotifs.includes(n.id))

  const dismissNotification = (id) => {
    setDismissedNotifs(prev => {
      const updated = [...prev, id]
      try {
        localStorage.setItem('yobbu_dismissed_notifs', JSON.stringify(updated))
      } catch {}
      return updated
    })
  }

  function handleSetSection(key) {
    setSection(key)
    // Refetch profile when switching sections
    if (key === 'trips' || key === 'verification') {
      fetchProfile()
    }
  }

  function handleAvatarUpload(url) {
    setAvatarUrl(url)
    // Refetch profile to update photo_verified status
    setTimeout(() => fetchProfile(), 500)
  }

  const menuItems = [
    ...(isSender ? [] : [{ key: 'trips', Icon: PlaneIcon, label: t.menuTrips }]),
    ...(isSender ? [{ key: 'requests', Icon: PackageIcon, label: t.menuRequests }] : []),
    { key: 'verification',  Icon: ShieldCheckIcon, label: isFr ? 'Vérification' : 'Verification' },
    { key: 'notifications', Icon: BellIcon,        label: t.menuNotif, badge: notifBadge },
    { key: 'settings',      Icon: SettingsIcon,    label: t.menuSettings },
  ]

  const tripStatus = (trip) => {
    if (trip.suspended) return { label: t.suspended,  desc: t.suspendedDesc, bg: '#FEF2F2', color: '#DC2626', dot: '#DC2626' }
    if (trip.approved)  return { label: t.active,     desc: t.liveDesc,      bg: '#F0FAF4', color: '#2D8B4E', dot: '#22c55e' }
    return                     { label: t.pending,    desc: t.pendingDesc,   bg: '#D1F4E7', color: '#10B981', dot: '#f59e0b' }
  }

  const inp = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,.1)', background: '#FDFBF7', color: '#1F2937', fontSize: 13, fontFamily: 'DM Sans, sans-serif', outline: 'none', boxSizing: 'border-box', marginBottom: 10 }
  const lbl = { fontSize: 10, fontWeight: 700, color: '#6B7280', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em' }

  // ─── Shared section content (used by both desktop and mobile) ────────────

  const tripsContent = (
    <div>
      {loading && <div style={{ textAlign: 'center', padding: 24, color: '#6B7280', fontSize: 13 }}>Loading...</div>}


      {!loading && trips.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <PlaneIcon size={40} color="#E8DDD0" />
          </div>
          <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 16 }}>{isSender ? (isFr ? 'Parcourez les voyageurs disponibles' : 'Browse available travelers') : t.noTrips}</div>
          {!isSender && (
            <button onClick={() => setView('post')}
              style={{ background: '#10B981', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 12, fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              {t.postNew}
            </button>
          )}
          {isSender && (
            <button onClick={() => setView('browse')}
              style={{ background: '#10B981', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 12, fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              {isFr ? 'Parcourir' : 'Browse'}
            </button>
          )}
        </div>
      )}

      {!loading && trips.map(trip => {
        const st = tripStatus(trip)
        return (
          <div key={trip.id} style={{ background: '#FDFBF7', border: '1px solid rgba(0,0,0,.06)', borderRadius: 14, padding: '16px', marginBottom: 10 }}>
            {/* Route + status */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1F2937' }}>
                {trip.from_city} → {trip.to_city}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: st.bg, borderRadius: 20, padding: '4px 10px' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.dot, display: 'inline-block', animation: trip.approved && !trip.suspended ? 'pf-pulse 2s infinite' : 'none' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: st.color }}>{st.label}</span>
              </div>
            </div>
            {/* Status description */}
            <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 10 }}>{st.desc}</div>
            {/* Details */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {[
                { Icon: CalendarIcon, val: trip.date },
                { Icon: PackageIcon,  val: trip.space ? `${trip.space} kg` : null },
                { Icon: DollarIcon,   val: trip.price },
                { Icon: MapPinIcon,   val: trip.pickup_area ? `Pickup: ${trip.pickup_area}` : null },
                { Icon: MapPinIcon,   val: trip.dropoff_area ? `Dropoff: ${trip.dropoff_area}` : null },
              ].filter(x => x.val).map(({ Icon: Ic, val }) => (
                <span key={val} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, background: '#fff', border: '1px solid rgba(0,0,0,.08)', borderRadius: 20, padding: '5px 10px', color: '#1F2937' }}>
                  <Ic size={11} color="#6B7280" /> {val}
                </span>
              ))}
            </div>
            {/* Availability toggle */}
            {trip.approved && !trip.suspended && (() => {
              const av = trip.availability_status || 'open'
              const opts = [
                { key: 'open',        label: isFr ? 'Disponible' : 'Open',        dot: '#22c55e', bg: '#F0FAF4', border: '#C8E6D4', color: '#059669' },
                { key: 'full',        label: isFr ? 'Complet' : 'Full',           dot: '#f59e0b', bg: '#D1F4E7', border: '#D4A574', color: '#7C4E0A' },
                { key: 'unavailable', label: isFr ? 'Indisponible' : 'Unavailable', dot: '#DC2626', bg: '#FEF2F2', border: '#FECACA', color: '#991B1B' },
              ]
              return (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>
                    {isFr ? 'Statut de disponibilité' : 'Availability status'}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {opts.map(o => (
                      <button key={o.key} onClick={() => updateAvailability(trip.id, o.key)}
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                          padding: '7px 6px', borderRadius: 8, cursor: 'pointer',
                          fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700,
                          background: av === o.key ? o.bg : '#F5F3EF',
                          border: `1.5px solid ${av === o.key ? o.border : '#E5E1DB'}`,
                          color: av === o.key ? o.color : '#6B7280',
                          transition: 'all .15s',
                        }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: av === o.key ? o.dot : '#C0B8B0', flexShrink: 0 }} />
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })()}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setEditingTrip(trip)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', borderRadius: 9, border: '1px solid rgba(0,0,0,.1)', background: '#fff', color: '#1F2937', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                <EditIcon size={12} color="#1F2937" /> {t.edit}
              </button>
              <button onClick={() => deleteTrip(trip.id)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 14px', borderRadius: 9, border: '1px solid #FECACA', background: '#FEF2F2', color: '#DC2626', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                <TrashIcon size={12} color="#DC2626" />
              </button>
            </div>
          </div>
        )
      })}

      {!isSender && !loading && trips.length > 0 && (
        <button onClick={() => setView('post')}
          style={{ width: '100%', padding: '11px', borderRadius: 12, border: '2px dashed rgba(0,0,0,.1)', background: 'transparent', color: '#6B7280', fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
          <PlusIcon size={13} color="#6B7280" /> {t.postNew}
        </button>
      )}
    </div>
  )

  const reqStatus = (req) => {
    const s = req.status || 'open'
    if (s === 'matched') return { label: t.reqMatched, bg: '#F0FAF4', color: '#2D8B4E', dot: '#22c55e' }
    if (s === 'closed')  return { label: t.reqClosed,  bg: '#F5F3EF', color: '#6B7280', dot: '#C0B8B0' }
    return                     { label: t.reqOpen,     bg: '#D1F4E7', color: '#10B981', dot: '#f59e0b' }
  }

  const requestsContent = (
    <div>
      {loadingReqs && <div style={{ textAlign: 'center', padding: 24, color: '#6B7280', fontSize: 13 }}>Loading...</div>}

      {!loadingReqs && requests.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <PackageIcon size={40} color="#E8DDD0" />
          </div>
          <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 16 }}>{t.noRequests}</div>
          <button onClick={() => setView('send')}
            style={{ background: '#10B981', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 12, fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            {t.postRequest}
          </button>
        </div>
      )}

      {!loadingReqs && requests.map(req => {
        const st = reqStatus(req)
        return (
          <div key={req.id} style={{ background: '#FDFBF7', border: '1px solid rgba(0,0,0,.06)', borderRadius: 14, padding: '16px', marginBottom: 10 }}>
            {/* Route + status */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1F2937' }}>
                {req.from_city} → {req.to_city}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: st.bg, borderRadius: 20, padding: '4px 10px' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.dot, display: 'inline-block' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: st.color }}>{st.label}</span>
              </div>
            </div>

            {/* Details */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {[
                { Icon: PackageIcon,  val: req.weight ? `${req.weight} kg` : null },
                { Icon: DollarIcon,   val: req.budget ? `Max ${req.budget}$/kg` : null },
                { Icon: CalendarIcon, val: req.deadline ? `${isFr ? 'Avant' : 'By'} ${req.deadline}` : null },
              ].filter(x => x.val).map(({ Icon: Ic, val }) => (
                <span key={val} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, background: '#fff', border: '1px solid rgba(0,0,0,.08)', borderRadius: 20, padding: '5px 10px', color: '#1F2937' }}>
                  <Ic size={11} color="#6B7280" /> {val}
                </span>
              ))}
            </div>

            {/* Description */}
            {req.description && (
              <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5, marginBottom: 12, padding: '8px 10px', background: '#fff', borderRadius: 8, border: '1px solid rgba(0,0,0,.06)' }}>
                {req.description}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setEditingReq(req)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', borderRadius: 9, border: '1px solid rgba(0,0,0,.1)', background: '#fff', color: '#1F2937', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                <EditIcon size={12} color="#1F2937" /> {t.edit}
              </button>
              <button onClick={() => deleteRequest(req.id)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 14px', borderRadius: 9, border: '1px solid #FECACA', background: '#FEF2F2', color: '#DC2626', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                <TrashIcon size={12} color="#DC2626" />
              </button>
            </div>
          </div>
        )
      })}

      {!loadingReqs && requests.length > 0 && (
        <button onClick={() => setView('send')}
          style={{ width: '100%', padding: '11px', borderRadius: 12, border: '2px dashed rgba(0,0,0,.1)', background: 'transparent', color: '#6B7280', fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
          <PlusIcon size={13} color="#6B7280" /> {t.postRequest}
        </button>
      )}
    </div>
  )

  const verificationContent = (
    <div>
      {/* Verification Steps */}
      <div style={{ background: '#FDFBF7', border: '1px solid rgba(0,0,0,.06)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>
          {isFr ? 'Étapes de vérification' : 'Verification Steps'}
        </div>
        {/* Progress bar */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ flex: 1, height: 8, background: '#E5E1DB', borderRadius: 20, overflow: 'hidden' }}>
              {isSender ? (
                <div style={{ height: '100%', background: '#22c55e', width: '50%', transition: 'width .3s' }} />
              ) : (
                <div style={{ height: '100%', background: '#22c55e', width: `${((true ? 1 : 0) + (profileData?.photo_verified || photoVerified ? 1 : 0) + (profileData?.id_verified ? 1 : 0)) / 3 * 100}%`, transition: 'width .3s' }} />
              )}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', minWidth: 40 }}>
              {isSender ? '1/2' : `${((true ? 1 : 0) + (profileData?.photo_verified || photoVerified ? 1 : 0) + (profileData?.id_verified ? 1 : 0))}/3`}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(isSender ? [
            { step: 1, label: isFr ? 'Vérification téléphone' : 'Phone verification', desc: isFr ? 'Fait lors de l\'inscription' : 'Done at signup', completed: true, action: null },
            { step: 2, label: isFr ? 'Vérification Facebook' : 'Facebook verification', desc: isFr ? 'Partagez votre profil Facebook pour la confiance' : 'Share your Facebook profile for trust', completed: profileData?.facebook_verified, status: profileData?.facebook_verified ? (isFr ? 'Approuvée' : 'Approved') : (isFr ? 'En attente' : 'Pending'), action: profileData?.facebook_verified ? null : (isFr ? 'Ajouter Facebook' : 'Add Facebook') },
          ] : [
            { step: 1, label: isFr ? 'Vérification téléphone' : 'Phone verification', desc: isFr ? 'Fait lors de l\'inscription' : 'Done at signup', completed: true, action: null },
            {
              step: 2,
              label: isFr ? 'Photo de profil' : 'Profile picture',
              desc: isFr ? 'Téléchargez une photo claire de vous' : 'Upload a clear photo of yourself',
              completed: profileData?.photo_verified,
              status: profileData?.photo_verified ? (isFr ? 'Approuvée' : 'Approved') : profileData?.photo_pending ? (isFr ? 'En attente d\'approbation admin' : 'Pending admin approval') : (isFr ? 'En attente' : 'Pending'),
              action: (profileData?.photo_verified || profileData?.photo_pending) ? null : (isFr ? 'Télécharger une photo' : 'Upload photo')
            },
            { step: 3, label: isFr ? 'Vérification ID' : 'ID verification', desc: isFr ? 'Téléchargez une copie de votre pièce d\'identité' : 'Upload a copy of your ID', completed: profileData?.id_verified, status: profileData?.id_verified ? (isFr ? 'Approuvée' : 'Approved') : (isFr ? 'En attente' : 'Pending'), badge: true, action: profileData?.id_verified ? null : (isFr ? 'Télécharger une pièce d\'identité' : 'Upload ID') },
          ]).map(({ step, label, desc, completed, status, badge, action }) => (
            <div key={step} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, background: '#fff', borderRadius: 10, border: `1px solid ${completed ? '#C8E6D4' : '#E5E1DB'}` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: completed ? '#F0FAF4' : '#F5F3EF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14, fontWeight: 700, color: completed ? '#22c55e' : '#6B7280' }}>
                  {completed ? '✓' : step}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1F2937', marginBottom: 2 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 4 }}>
                    {desc}
                  </div>
                  {status && (
                    <div style={{ fontSize: 10, fontWeight: 700, color: completed ? '#22c55e' : '#10B981', display: 'inline-block', padding: '2px 8px', background: completed ? '#F0FAF4' : '#D1F4E7', borderRadius: 12 }}>
                      {status}
                    </div>
                  )}
                  {badge && !completed && (
                    <div style={{ fontSize: 10, color: '#3B82F6', marginTop: 4 }}>
                      {isFr ? 'Déverrouille le badge Vérifié' : 'Unlocks Verified badge'}
                    </div>
                  )}
                </div>
              </div>
              {action && (
                <button onClick={() => (isSender && step === 2) ? null : (step === 2 ? setShowAvatarUpload(true) : null)}
                  style={{ alignSelf: 'flex-start', padding: '6px 14px', borderRadius: 8, border: 'none', background: '#10B981', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                  {action}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Your Badges */}
      <div style={{ background: '#FDFBF7', border: '1px solid rgba(0,0,0,.06)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.06em' }}>
          {isFr ? 'Vos badges' : 'Your badges'}
        </div>
        <TrustBadges profile={user} lang={lang} size="md" />
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <div style={{ flex: 1, background: '#F0FAF4', border: '1px solid #C8E6D4', borderRadius: 12, padding: 14, textAlign: 'center' }}>
          <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 24, color: '#2D8B4E', lineHeight: 1 }}>
            {trips.filter(tr => tr.approved).length}
          </div>
          <div style={{ fontSize: 11, color: '#2D8B4E', marginTop: 3 }}>
            {isFr ? 'Voyages approuvés' : 'Approved trips'}
          </div>
        </div>
      </div>
      {!isSender && (
        <div style={{ marginBottom: 16 }}>
          <IDVerificationUpload user={user} profile={profileData} lang={lang} />
        </div>
      )}
      {!isSender && (
        <SocialProfileLinks profile={user} lang={lang} />
      )}
    </div>
  )

  const notificationsContent = (
    <div>
      {loading && <div style={{ textAlign: 'center', padding: 24, color: '#6B7280', fontSize: 13 }}>Loading...</div>}
      {!loading && visibleNotifications.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <BellIcon size={40} color="#E8DDD0" />
          </div>
          <div style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7 }}>{t.notifEmpty}</div>
        </div>
      )}
      {!loading && visibleNotifications.map(({ type, trip, id }) => {
        const styles = {
          approved:      { bg: '#F0FAF4', border: '#C8E6D4', color: '#059669' },
          suspended:     { bg: '#FEF2F2', border: '#FECACA', color: '#DC2626' },
          pending:       { bg: '#D1F4E7', border: '#D4A574', color: '#92650A' },
          photo_approved:{ bg: '#F0FAF4', border: '#C8E6D4', color: '#059669' },
          photo_pending: { bg: '#D1F4E7', border: '#D4A574', color: '#92650A' },
        }[type] || {}
        return (
          <div key={id} style={{
            display: 'flex', alignItems: 'flex-start', gap: 14,
            background: styles.bg, border: `1px solid ${styles.border}`,
            borderRadius: 14, padding: '16px 18px', marginBottom: 10, position: 'relative',
          }}>
            <div style={{ flexShrink: 0 }}>
              {type === 'approved'       && <CheckCircleIcon size={24} color="#2D8B4E" />}
              {type === 'suspended'      && <WarningIcon     size={24} color="#DC2626" />}
              {type === 'pending'        && <span style={{ fontSize: 22 }}>⏳</span>}
              {type === 'photo_approved' && <span style={{ fontSize: 22 }}>🪪</span>}
              {type === 'photo_pending'  && <span style={{ fontSize: 22 }}>⏳</span>}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1F2937', marginBottom: 3 }}>
                {type === 'approved'       && (isFr ? 'Annonce approuvée !' : 'Listing approved!')}
                {type === 'suspended'      && (isFr ? 'Annonce suspendue' : 'Listing suspended')}
                {type === 'pending'        && (isFr ? 'Annonce en cours de révision' : 'Listing under review')}
                {type === 'photo_approved' && (isFr ? 'Photo de profil approuvée !' : 'Profile photo approved!')}
                {type === 'photo_pending'  && (isFr ? 'Photo en cours de vérification' : 'Photo under review')}
              </div>
              {trip && (
                <div style={{ fontSize: 13, color: styles.color, marginBottom: 6 }}>
                  {trip.from_city || trip.from} → {trip.to_city || trip.to} · {trip.date}
                </div>
              )}
              <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.6 }}>
                {type === 'approved'       && (isFr ? 'Votre annonce est maintenant visible par les expéditeurs.' : 'Your listing is now visible to senders.')}
                {type === 'suspended'      && (isFr ? "Contactez-nous si vous pensez qu'il s'agit d'une erreur." : 'Contact us at hello@yobbu.co if you think this is a mistake.')}
                {type === 'pending'        && (isFr ? 'Nous révisons votre annonce. Cela prend généralement moins de 24h.' : 'We\'re reviewing your listing. This usually takes less than 24h.')}
                {type === 'photo_approved' && (isFr ? 'Votre badge photo vérifié est maintenant actif sur votre profil.' : 'Your verified photo badge is now active on your profile.')}
                {type === 'photo_pending'  && (isFr ? 'Nous vérifions votre photo. Cela prend généralement moins de 24h.' : 'We\'re reviewing your photo. This usually takes less than 24h.')}
              </div>
            </div>
            <button
              onClick={() => dismissNotification(id)}
              style={{
                position: 'absolute', top: 12, right: 12,
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 18, color: styles.color, opacity: 0.6, padding: 4,
                transition: 'opacity .2s', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
            >
              ✕
            </button>
          </div>
        )
      })}
    </div>
  )

  const settingsContent = (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#1F2937', marginBottom: 10 }}>{t.accInfo}</div>
      {[
        { Icon: UserIcon,     label: t.fullName,    value: fullName || '—' },
        { Icon: CalendarIcon, label: t.since,       value: joinDate },
        ...(baseCountry ? [{ Icon: GlobeIcon, label: t.baseCountry, value: baseCountry }] : []),
      ].map(({ Icon: Ic, label, value }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#FDFBF7', borderRadius: 10, border: '1px solid rgba(0,0,0,.05)', marginBottom: 8 }}>
          <Ic size={15} color="#6B7280" />
          <span style={{ fontSize: 13, color: '#6B7280', minWidth: 90 }}>{label}</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#1F2937' }}>{value}</span>
        </div>
      ))}
      {/* Language */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#FDFBF7', borderRadius: 10, border: '1px solid rgba(0,0,0,.05)', marginBottom: 8 }}>
        <GlobeIcon size={15} color="#6B7280" />
        <span style={{ fontSize: 13, color: '#6B7280', minWidth: 90 }}>{t.langLabel}</span>
        <div style={{ display: 'flex', background: '#F0EDE8', borderRadius: 8, padding: 2 }}>
          {['en', 'fr'].map(l => (
            <button key={l} onClick={() => setLang(l)}
              style={{ padding: '4px 12px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', background: lang === l ? '#10B981' : 'transparent', color: lang === l ? '#fff' : '#6B7280' }}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <div style={{ borderTop: '1px solid rgba(0,0,0,.06)', margin: '20px 0' }} />
      <button onClick={onSignOut}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 10, border: '1px solid #FECACA', background: '#FEF2F2', color: '#DC2626', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
        <LogOutIcon size={14} color="#DC2626" /> {t.signout}
      </button>
    </div>
  )

  const helpContent = (
    <div>
      {[
        {
          Icon: MailIcon,
          title: isFr ? 'Email' : 'Email us',
          desc: isFr ? 'Répondons dans les 24 heures.' : "We reply within 24 hours.",
          href: 'mailto:hello@yobbu.co', linkLabel: 'hello@yobbu.co',
        },
        {
          Icon: MessageIcon,
          title: 'WhatsApp',
          desc: isFr ? 'Discussion rapide avec notre équipe.' : 'Quick chat with our team.',
          href: 'https://wa.me/message/yobbu', linkLabel: isFr ? 'Ouvrir WhatsApp' : 'Open WhatsApp',
        },
        {
          Icon: HelpIcon,
          title: 'FAQ',
          desc: isFr ? 'Réponses aux questions fréquentes.' : 'Answers to common questions.',
          href: '#', linkLabel: isFr ? 'Voir la FAQ' : 'View FAQ',
        },
      ].map(({ Icon: Ic, title, desc, href, linkLabel }) => (
        <div key={title} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px', background: '#FDFBF7', borderRadius: 12, border: '1px solid rgba(0,0,0,.06)', marginBottom: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#D1F4E7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Ic size={16} color="#10B981" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1F2937', marginBottom: 3 }}>{title}</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 6, lineHeight: 1.5 }}>{desc}</div>
            <a href={href} style={{ fontSize: 13, fontWeight: 700, color: '#10B981', textDecoration: 'none' }}>{linkLabel} →</a>
          </div>
        </div>
      ))}
    </div>
  )

  const sectionContent = {
    trips: tripsContent,
    requests: requestsContent,
    verification: verificationContent,
    notifications: notificationsContent,
    settings: settingsContent,
    help: helpContent,
  }

  const sectionTitle = {
    trips: t.tripsTitle, requests: t.requestsTitle,
    verification: isFr ? 'Vérification' : 'Trust & Verification',
    notifications: t.notifTitle, settings: t.settingsTitle, help: t.helpTitle,
  }

  if (loading && !profileData) return <LoadingSpinner lang={lang} />

  return (
    <div style={{ minHeight: '100vh', background: '#FDFBF7', fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`
        @keyframes pf-pulse { 0%,100%{opacity:1} 50%{opacity:.35} }

        /* ── Desktop layout ── */
        .pf-layout  { display: grid; grid-template-columns: 220px 1fr; gap: 16px; max-width: 1000px; margin: 0 auto; padding: 24px; }
        .pf-sidebar { position: sticky; top: 80px; height: fit-content; }
        .pf-section { background: #fff; border: 1px solid rgba(0,0,0,.06); border-radius: 20px; padding: 22px; }
        .pf-mobile-tabs { display: none !important; }
        .pf-bottom-bar  { display: none !important; }
        .pf-hero        { display: none !important; }
        .pf-desktop-header { display: block; }

        /* ── Mobile layout ── */
        @media (max-width: 640px) {
          .pf-layout  { display: block !important; padding: 0 16px 24px; }
          .pf-sidebar { display: none !important; }
          .pf-section { border-radius: 16px; padding: 18px; }
          .pf-mobile-tabs { display: flex !important; }
          .pf-bottom-bar  { display: none !important; }
          .pf-hero        { display: block !important; }
          .pf-desktop-header { display: none !important; }
        }
      `}</style>

      {/* Edit modal — slides up from bottom on mobile, centered on desktop */}
      {editingTrip && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 999, padding: 0 }}>
          <div style={{ background: '#FDFBF7', borderRadius: '20px 20px 0 0', padding: '28px 24px 40px', width: '100%', maxWidth: 520, boxShadow: '0 -8px 40px rgba(0,0,0,.15)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ width: 40, height: 4, background: '#E0D8CE', borderRadius: 2, margin: '0 auto 24px' }} />
            <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20, color: '#1F2937', marginBottom: 20 }}>
              {isFr ? "Modifier l'annonce" : 'Edit listing'}
            </div>
            {[
              { label: isFr ? 'Depuis' : 'From',       key: 'from_city' },
              { label: isFr ? 'Vers' : 'To',           key: 'to_city' },
              { label: 'Date',                          key: 'date',  type: 'date' },
              { label: isFr ? 'Espace (kg)' : 'Space (kg)', key: 'space', type: 'number' },
              { label: isFr ? 'Prix' : 'Price',        key: 'price' },
              { label: 'WhatsApp',                     key: 'phone', type: 'tel' },
              { label: isFr ? 'Note' : 'Note',         key: 'note' },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label style={lbl}>{label}</label>
                <input style={inp} type={type || 'text'} value={editingTrip[key] || ''} onChange={e => setEditingTrip(p => ({ ...p, [key]: e.target.value }))} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button onClick={saveEdit} disabled={saving}
                style={{ flex: 1, padding: '13px', borderRadius: 10, border: 'none', background: '#10B981', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', opacity: saving ? .6 : 1 }}>
                {saving ? '...' : isFr ? 'Sauvegarder' : 'Save changes'}
              </button>
              <button onClick={() => setEditingTrip(null)}
                style={{ padding: '13px 20px', borderRadius: 10, border: '1px solid rgba(0,0,0,.1)', background: 'transparent', color: '#6B7280', fontSize: 14, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                {isFr ? 'Annuler' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit request modal */}
      {editingReq && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 999, padding: 0 }}>
          <div style={{ background: '#FDFBF7', borderRadius: '20px 20px 0 0', padding: '28px 24px 40px', width: '100%', maxWidth: 520, boxShadow: '0 -8px 40px rgba(0,0,0,.15)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ width: 40, height: 4, background: '#E0D8CE', borderRadius: 2, margin: '0 auto 24px' }} />
            <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20, color: '#1F2937', marginBottom: 20 }}>
              {isFr ? 'Modifier la demande' : 'Edit request'}
            </div>
            {[
              { label: isFr ? 'Depuis'        : 'From',             key: 'from_city' },
              { label: isFr ? 'Vers'          : 'To',               key: 'to_city' },
              { label: isFr ? 'Poids (kg)'   : 'Weight (kg)',       key: 'weight',      type: 'number' },
              { label: isFr ? 'Budget max ($/kg)' : 'Max budget ($/kg)', key: 'budget', type: 'number' },
              { label: isFr ? 'Avant le'     : 'Needed by',         key: 'deadline',    type: 'date' },
              { label: 'WhatsApp',                                   key: 'phone',       type: 'tel' },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label style={lbl}>{label}</label>
                <input style={inp} type={type || 'text'} value={editingReq[key] || ''} onChange={e => setEditingReq(p => ({ ...p, [key]: e.target.value }))} />
              </div>
            ))}
            <div>
              <label style={lbl}>{isFr ? 'Description' : 'Description'}</label>
              <textarea style={{ ...inp, resize: 'vertical', lineHeight: 1.5 }} rows={3} value={editingReq.description || ''} onChange={e => setEditingReq(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button onClick={saveEditReq} disabled={savingReq}
                style={{ flex: 1, padding: '13px', borderRadius: 10, border: 'none', background: '#10B981', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', opacity: savingReq ? .6 : 1 }}>
                {savingReq ? '...' : isFr ? 'Sauvegarder' : 'Save changes'}
              </button>
              <button onClick={() => setEditingReq(null)}
                style={{ padding: '13px 20px', borderRadius: 10, border: '1px solid rgba(0,0,0,.1)', background: 'transparent', color: '#6B7280', fontSize: 14, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                {isFr ? 'Annuler' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile hero / profile header */}
      <div className="pf-hero" style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,.06)', padding: '28px 24px 20px', textAlign: 'center', display: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <AvatarUpload user={user} avatarUrl={avatarUrl} initials={initials} size={96} onUpload={handleAvatarUpload} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1F2937', marginBottom: 8, fontFamily: 'DM Serif Display, serif' }}>{fullName}</div>
        {user?.role && (
          <div style={{ display: 'inline-block', padding: '4px 12px', background: '#D1F4E7', color: '#10B981', fontSize: 11, fontWeight: 700, borderRadius: 12, marginBottom: 16 }}>
            {user.role === 'traveler' ? (isFr ? 'Voyageur' : 'Traveler') : user.role === 'sender' ? (isFr ? 'Expéditeur' : 'Sender') : (isFr ? 'Les deux' : 'Both')}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#F7F4EF', borderRadius: 20, padding: '6px 12px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span style={{ fontSize: 12, color: '#5A5248', fontWeight: 600 }}>{isFr ? `Membre depuis ${joinDate}` : `Member since ${joinDate}`}</span>
          </div>
          {photoVerified && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#F0FAF4', borderRadius: 20, padding: '6px 12px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2D8B4E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span style={{ fontSize: 12, color: '#2D8B4E', fontWeight: 700 }}>{isFr ? 'Vérifié' : 'Verified'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Mobile tab bar (horizontal scroll, below hero) */}
      <div className="pf-mobile-tabs" style={{ overflowX: 'auto', borderBottom: '1px solid rgba(0,0,0,.06)', background: '#fff', padding: '0 16px', gap: 0, display: 'none' }}>
        {menuItems.map(({ key, Icon, label, badge }) => (
          <button key={key} onClick={() => handleSetSection(key)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 600, color: section === key ? '#10B981' : '#6B7280', borderBottom: section === key ? '2px solid #10B981' : '2px solid transparent', whiteSpace: 'nowrap', flexShrink: 0, position: 'relative' }}>
            <span style={{ position: 'relative', display: 'flex' }}>
              <Icon size={16} color={section === key ? '#10B981' : '#6B7280'} />
              {badge > 0 && (
                <span style={{ position: 'absolute', top: -4, right: -6, fontSize: 8, fontWeight: 700, background: '#DC2626', color: '#fff', borderRadius: 20, padding: '1px 4px', minWidth: 14, textAlign: 'center', lineHeight: '14px' }}>{badge}</span>
              )}
            </span>
            {label}
          </button>
        ))}
      </div>

      {/* Layout */}
      <div className="pf-layout">

        {/* ── DESKTOP SIDEBAR ── */}
        <div className="pf-sidebar">
          {/* User card */}
          <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.06)', borderRadius: 16, padding: 20, textAlign: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <AvatarUpload user={user} avatarUrl={avatarUrl} initials={initials} size={60} onUpload={handleAvatarUpload} />
            </div>
            <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 16, color: '#1F2937', marginBottom: 6 }}>{fullName}</div>
            {user?.role && (
              <div style={{ display: 'inline-block', padding: '3px 10px', background: '#D1F4E7', color: '#10B981', fontSize: 9, fontWeight: 700, borderRadius: 10, marginBottom: 8 }}>
                {user.role === 'traveler' ? (isFr ? 'Voyageur' : 'Traveler') : user.role === 'sender' ? (isFr ? 'Expéditeur' : 'Sender') : (isFr ? 'Les deux' : 'Both')}
              </div>
            )}
            <div style={{ fontSize: 11, color: '#6B7280' }}>{baseCountry || contact}</div>
          </div>

          {/* Language toggle */}
          <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.06)', borderRadius: 16, padding: 14, marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>{t.langLabel}</div>
            <div style={{ display: 'flex', background: '#F7F3ED', borderRadius: 8, padding: 2 }}>
              {['en', 'fr'].map(l => (
                <button key={l} onClick={() => setLang(l)}
                  style={{ flex: 1, padding: '5px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', background: lang === l ? '#10B981' : 'transparent', color: lang === l ? '#fff' : '#6B7280', transition: 'all .15s' }}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Menu */}
          <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.06)', borderRadius: 16, overflow: 'hidden' }}>
            {menuItems.map(({ key, Icon, label, badge }) => (
              <div key={key} onClick={() => handleSetSection(key)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', cursor: 'pointer', borderBottom: '1px solid rgba(0,0,0,.04)', fontSize: 13, fontWeight: 500, transition: 'background .15s', background: section === key ? '#D1F4E7' : 'transparent', color: section === key ? '#10B981' : '#1F2937', borderRight: section === key ? '3px solid #10B981' : '3px solid transparent' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: section === key ? '#D1F4E7' : '#F7F3ED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={14} color={section === key ? '#10B981' : '#1F2937'} />
                </div>
                <span style={{ flex: 1 }}>{label}</span>
                {badge > 0 && (
                  <span style={{ fontSize: 10, fontWeight: 700, background: '#DC2626', color: '#fff', borderRadius: 20, padding: '1px 7px', minWidth: 18, textAlign: 'center' }}>{badge}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div>
          {/* Stats row — desktop only (mobile has it in hero) */}
          <div className="pf-desktop-header" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, margin: '12px 0' }}>
            {(isSender ? [
              { n: requests.length,                           l: isFr ? 'Total' : 'Total' },
              { n: requests.filter(r => r.status === 'open').length, l: isFr ? 'Ouvertes' : 'Open', color: '#10B981' },
              { n: requests.filter(r => r.status === 'closed').length, l: isFr ? 'Fermées' : 'Closed', color: '#6B7280' },
            ] : [
              { n: trips.length,                             l: t.st1 },
              { n: trips.filter(tr => tr.approved).length,  l: t.st2, color: '#2D8B4E' },
              { n: trips.filter(tr => tr.suspended).length, l: t.st3, color: '#DC2626' },
            ]).map(({ n, l, color }) => (
              <div key={l} style={{ background: '#fff', border: '1px solid rgba(0,0,0,.06)', borderRadius: 14, padding: '14px 18px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 26, color: color || '#10B981', lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>

          <div className="pf-section">
            {/* Desktop section title */}
            <div className="pf-desktop-header">
              <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20, color: '#1F2937', marginBottom: 16 }}>
                {sectionTitle[section]}
              </div>
            </div>
            {sectionContent[section]}
          </div>
        </div>

      </div>

      {/* Mobile bottom tab bar */}
      <div className="pf-bottom-bar" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#fff', borderTop: '1px solid rgba(0,0,0,.08)',
        display: 'none', padding: '8px 0 20px',
        boxShadow: '0 -4px 20px rgba(0,0,0,.08)', zIndex: 40,
      }}>
        {menuItems.map(({ key, Icon, label, badge }) => (
          <button key={key} onClick={() => handleSetSection(key)}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 4px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 10, fontWeight: 700, color: section === key ? '#10B981' : '#6B7280' }}>
            <div style={{ position: 'relative' }}>
              <Icon size={22} color={section === key ? '#10B981' : '#6B7280'} />
              {badge > 0 && (
                <span style={{ position: 'absolute', top: -4, right: -6, fontSize: 8, fontWeight: 700, background: '#DC2626', color: '#fff', borderRadius: 20, padding: '1px 4px', minWidth: 14, textAlign: 'center', lineHeight: '14px' }}>{badge}</span>
              )}
            </div>
            {label}
          </button>
        ))}
        <button onClick={() => setView('post')}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 4px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 10, fontWeight: 700, color: '#1F2937' }}>
          <div style={{ width: 24, height: 24, borderRadius: 7, background: '#1F2937', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PlusIcon size={14} color="#fff" />
          </div>
          {isFr ? 'Poster' : 'Post'}
        </button>
        <button onClick={() => setView('send')}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 4px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 10, fontWeight: 700, color: '#10B981' }}>
          <div style={{ width: 24, height: 24, borderRadius: 7, background: '#D1F4E7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PackageIcon size={14} color="#10B981" />
          </div>
          {isFr ? 'Envoyer' : 'Send'}
        </button>
      </div>

      {/* Avatar upload modal */}
      {showAvatarUpload && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 400, width: '90%' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1F2937', marginBottom: 20 }}>
              {isFr ? 'Ajouter une photo de profil' : 'Add a profile photo'}
            </div>
            <div style={{ marginBottom: 24 }}>
              <AvatarUpload
                user={user}
                avatarUrl={avatarUrl}
                initials={profileName?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'GP'}
                size={120}
                onUpload={(url) => {
                  setAvatarUrl(url)
                  setShowAvatarUpload(false)
                  setTimeout(() => {
                    fetchProfile()
                  }, 1000)
                }}
              />
            </div>
            <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 16, textAlign: 'center' }}>
              {isFr ? 'Une photo claire de vous-même. Sera examinée par nos modérateurs.' : 'A clear photo of yourself. Will be reviewed by our team.'}
            </div>
            <button onClick={() => setShowAvatarUpload(false)}
              style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid rgba(0,0,0,.1)', background: 'transparent', color: '#6B7280', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              {isFr ? 'Fermer' : 'Close'}
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
