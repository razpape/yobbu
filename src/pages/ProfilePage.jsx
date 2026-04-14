import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
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
  const [section, setSection]         = useState('trips')
  const [avatarUrl, setAvatarUrl]     = useState(null)
  const [profileName, setProfileName] = useState('')
  const [baseCountry, setBaseCountry] = useState('')
  const [trips, setTrips]             = useState([])
  const [loading, setLoading]         = useState(true)
  const [editingTrip, setEditingTrip]   = useState(null)
  const [saving, setSaving]             = useState(false)
  const [requests, setRequests]         = useState([])
  const [loadingReqs, setLoadingReqs]   = useState(true)
  const [editingReq, setEditingReq]     = useState(null)
  const [savingReq, setSavingReq]       = useState(false)
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

  useEffect(() => {
    fetchTrips()
    fetchRequests()
    if (user?.id) {
      supabase.from('profiles').select('avatar_url, full_name, country_of_origin').eq('id', user.id).single()
        .then(({ data }) => {
          if (data?.avatar_url) setAvatarUrl(data.avatar_url)
          if (data?.full_name)  setProfileName(data.full_name)
          if (data?.country_of_origin) setBaseCountry(data.country_of_origin)
        })
    }
  }, [user])

  async function fetchTrips() {
    setLoading(true)
    const { data } = await supabase.from('trips').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setTrips(data || [])
    setLoading(false)
  }

  async function fetchRequests() {
    setLoadingReqs(true)
    const { data } = await supabase.from('package_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setRequests(data || [])
    setLoadingReqs(false)
  }

  async function deleteRequest(id) {
    if (!window.confirm(isFr ? 'Supprimer cette demande?' : 'Delete this request?')) return
    const { error } = await supabase.from('package_requests').delete().eq('id', id).eq('user_id', user.id)
    if (!error) setRequests(prev => prev.filter(r => r.id !== id))
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
    if (!window.confirm(isFr ? 'Supprimer cette annonce?' : 'Delete this listing?')) return
    const { error } = await supabase.from('trips').delete().eq('id', id).eq('user_id', user.id)
    if (!error) setTrips(prev => prev.filter(tr => tr.id !== id))
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

  const notifications = trips.flatMap(tr => {
    const items = []
    if (tr.approved && !tr.suspended) items.push({ type: 'approved', trip: tr, id: `approved-${tr.id}` })
    if (tr.suspended)                 items.push({ type: 'suspended', trip: tr, id: `suspended-${tr.id}` })
    return items
  })

  const menuItems = [
    { key: 'trips',         Icon: PlaneIcon,       label: t.menuTrips },
    { key: 'requests',      Icon: PackageIcon,     label: t.menuRequests },
    { key: 'verification',  Icon: ShieldCheckIcon, label: isFr ? 'Vérification' : 'Verification' },
    { key: 'notifications', Icon: BellIcon,        label: t.menuNotif, badge: notifications.length },
    { key: 'settings',      Icon: SettingsIcon,    label: t.menuSettings },
    { key: 'help',          Icon: HelpIcon,        label: t.menuHelp },
  ]

  const tripStatus = (trip) => {
    if (trip.suspended) return { label: t.suspended,  desc: t.suspendedDesc, bg: '#FEF2F2', color: '#DC2626', dot: '#DC2626' }
    if (trip.approved)  return { label: t.active,     desc: t.liveDesc,      bg: '#F0FAF4', color: '#2D8B4E', dot: '#22c55e' }
    return                     { label: t.pending,    desc: t.pendingDesc,   bg: '#FFF8EB', color: '#C8891C', dot: '#f59e0b' }
  }

  const inp = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,.1)', background: '#FDFBF7', color: '#1A1710', fontSize: 13, fontFamily: 'DM Sans, sans-serif', outline: 'none', boxSizing: 'border-box', marginBottom: 10 }
  const lbl = { fontSize: 10, fontWeight: 700, color: '#8A8070', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em' }

  // ─── Shared section content (used by both desktop and mobile) ────────────

  const tripsContent = (
    <div>
      {loading && <div style={{ textAlign: 'center', padding: 24, color: '#8A8070', fontSize: 13 }}>Loading...</div>}

      {!loading && trips.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <PlaneIcon size={40} color="#E8DDD0" />
          </div>
          <div style={{ fontSize: 14, color: '#8A8070', marginBottom: 16 }}>{t.noTrips}</div>
          <button onClick={() => setView('post')}
            style={{ background: '#C8891C', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 12, fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            {t.postNew}
          </button>
        </div>
      )}

      {!loading && trips.map(trip => {
        const st = tripStatus(trip)
        return (
          <div key={trip.id} style={{ background: '#FDFBF7', border: '1px solid rgba(0,0,0,.06)', borderRadius: 14, padding: '16px', marginBottom: 10 }}>
            {/* Route + status */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1710' }}>
                {trip.from_city} → {trip.to_city}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: st.bg, borderRadius: 20, padding: '4px 10px' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.dot, display: 'inline-block', animation: trip.approved && !trip.suspended ? 'pf-pulse 2s infinite' : 'none' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: st.color }}>{st.label}</span>
              </div>
            </div>
            {/* Status description */}
            <div style={{ fontSize: 12, color: '#8A8070', marginBottom: 10 }}>{st.desc}</div>
            {/* Details */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {[
                { Icon: CalendarIcon, val: trip.date },
                { Icon: PackageIcon,  val: trip.space ? `${trip.space} kg` : null },
                { Icon: DollarIcon,   val: trip.price },
                { Icon: MapPinIcon,   val: trip.pickup_area ? `Pickup: ${trip.pickup_area}` : null },
                { Icon: MapPinIcon,   val: trip.dropoff_area ? `Dropoff: ${trip.dropoff_area}` : null },
              ].filter(x => x.val).map(({ Icon: Ic, val }) => (
                <span key={val} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, background: '#fff', border: '1px solid rgba(0,0,0,.08)', borderRadius: 20, padding: '5px 10px', color: '#3D3829' }}>
                  <Ic size={11} color="#8A8070" /> {val}
                </span>
              ))}
            </div>
            {/* Availability toggle */}
            {trip.approved && !trip.suspended && (() => {
              const av = trip.availability_status || 'open'
              const opts = [
                { key: 'open',        label: isFr ? 'Disponible' : 'Open',        dot: '#22c55e', bg: '#F0FAF4', border: '#C8E6D4', color: '#1A5C38' },
                { key: 'full',        label: isFr ? 'Complet' : 'Full',           dot: '#f59e0b', bg: '#FFF8EB', border: '#F0C878', color: '#7C4E0A' },
                { key: 'unavailable', label: isFr ? 'Indisponible' : 'Unavailable', dot: '#DC2626', bg: '#FEF2F2', border: '#FECACA', color: '#991B1B' },
              ]
              return (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#8A8070', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>
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
                          color: av === o.key ? o.color : '#8A8070',
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
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', borderRadius: 9, border: '1px solid rgba(0,0,0,.1)', background: '#fff', color: '#1A1710', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                <EditIcon size={12} color="#1A1710" /> {t.edit}
              </button>
              <button onClick={() => deleteTrip(trip.id)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 14px', borderRadius: 9, border: '1px solid #FECACA', background: '#FEF2F2', color: '#DC2626', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                <TrashIcon size={12} color="#DC2626" />
              </button>
            </div>
          </div>
        )
      })}

      {!loading && trips.length > 0 && (
        <button onClick={() => setView('post')}
          style={{ width: '100%', padding: '11px', borderRadius: 12, border: '2px dashed rgba(0,0,0,.1)', background: 'transparent', color: '#8A8070', fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
          <PlusIcon size={13} color="#8A8070" /> {t.postNew}
        </button>
      )}
    </div>
  )

  const reqStatus = (req) => {
    const s = req.status || 'open'
    if (s === 'matched') return { label: t.reqMatched, bg: '#F0FAF4', color: '#2D8B4E', dot: '#22c55e' }
    if (s === 'closed')  return { label: t.reqClosed,  bg: '#F5F3EF', color: '#8A8070', dot: '#C0B8B0' }
    return                     { label: t.reqOpen,     bg: '#FFF8EB', color: '#C8891C', dot: '#f59e0b' }
  }

  const requestsContent = (
    <div>
      {loadingReqs && <div style={{ textAlign: 'center', padding: 24, color: '#8A8070', fontSize: 13 }}>Loading...</div>}

      {!loadingReqs && requests.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <PackageIcon size={40} color="#E8DDD0" />
          </div>
          <div style={{ fontSize: 14, color: '#8A8070', marginBottom: 16 }}>{t.noRequests}</div>
          <button onClick={() => setView('send')}
            style={{ background: '#C8891C', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 12, fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
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
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1710' }}>
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
                <span key={val} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, background: '#fff', border: '1px solid rgba(0,0,0,.08)', borderRadius: 20, padding: '5px 10px', color: '#3D3829' }}>
                  <Ic size={11} color="#8A8070" /> {val}
                </span>
              ))}
            </div>

            {/* Description */}
            {req.description && (
              <div style={{ fontSize: 12, color: '#8A8070', lineHeight: 1.5, marginBottom: 12, padding: '8px 10px', background: '#fff', borderRadius: 8, border: '1px solid rgba(0,0,0,.06)' }}>
                {req.description}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setEditingReq(req)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', borderRadius: 9, border: '1px solid rgba(0,0,0,.1)', background: '#fff', color: '#1A1710', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                <EditIcon size={12} color="#1A1710" /> {t.edit}
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
          style={{ width: '100%', padding: '11px', borderRadius: 12, border: '2px dashed rgba(0,0,0,.1)', background: 'transparent', color: '#8A8070', fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
          <PlusIcon size={13} color="#8A8070" /> {t.postRequest}
        </button>
      )}
    </div>
  )

  const verificationContent = (
    <div>
      <div style={{ background: '#FDFBF7', border: '1px solid rgba(0,0,0,.06)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#8A8070', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.06em' }}>
          {isFr ? 'Vos badges' : 'Your badges'}
        </div>
        <TrustBadges profile={user} lang={lang} size="md" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <div style={{ background: '#F0FAF4', border: '1px solid #C8E6D4', borderRadius: 12, padding: 14, textAlign: 'center' }}>
          <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 24, color: '#2D8B4E', lineHeight: 1 }}>
            {trips.filter(tr => tr.approved).length}
          </div>
          <div style={{ fontSize: 11, color: '#2D8B4E', marginTop: 3 }}>
            {isFr ? 'Voyages approuvés' : 'Approved trips'}
          </div>
        </div>
        <div style={{ background: '#FFF8EB', border: '1px solid #F0C878', borderRadius: 12, padding: 14, textAlign: 'center' }}>
          <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 24, color: '#C8891C', lineHeight: 1 }}>
            {trips.filter(tr => tr.approved).length >= 5 ? '5/5' : `${trips.filter(tr => tr.approved).length}/5`}
          </div>
          <div style={{ fontSize: 11, color: '#C8891C', marginTop: 3 }}>
            {isFr ? 'Vers Super Voyageur' : 'To Super Traveler'}
          </div>
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <IDVerificationUpload user={user} lang={lang} />
      </div>
      <SocialProfileLinks profile={user} lang={lang} />
    </div>
  )

  const notificationsContent = (
    <div>
      {loading && <div style={{ textAlign: 'center', padding: 24, color: '#8A8070', fontSize: 13 }}>Loading...</div>}
      {!loading && notifications.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <BellIcon size={40} color="#E8DDD0" />
          </div>
          <div style={{ fontSize: 14, color: '#8A8070', lineHeight: 1.7 }}>{t.notifEmpty}</div>
        </div>
      )}
      {!loading && notifications.map(({ type, trip, id }) => (
        <div key={id} style={{
          display: 'flex', alignItems: 'flex-start', gap: 14,
          background: type === 'approved' ? '#F0FAF4' : '#FEF2F2',
          border: `1px solid ${type === 'approved' ? '#C8E6D4' : '#FECACA'}`,
          borderRadius: 14, padding: '16px 18px', marginBottom: 10,
        }}>
          <div style={{ flexShrink: 0 }}>
            {type === 'approved'
              ? <CheckCircleIcon size={24} color="#2D8B4E" />
              : <WarningIcon size={24} color="#DC2626" />}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1710', marginBottom: 3 }}>
              {type === 'approved'
                ? (isFr ? 'Annonce approuvée !' : 'Listing approved!')
                : (isFr ? 'Annonce suspendue' : 'Listing suspended')}
            </div>
            <div style={{ fontSize: 13, color: type === 'approved' ? '#1A5C38' : '#DC2626', marginBottom: 6 }}>
              {trip.from_city} → {trip.to_city} · {trip.date}
            </div>
            <div style={{ fontSize: 12, color: '#8A8070', lineHeight: 1.6 }}>
              {type === 'approved'
                ? (isFr ? 'Votre annonce est maintenant visible par les expéditeurs.' : 'Your listing is now visible to senders.')
                : (isFr ? "Contactez-nous si vous pensez qu'il s'agit d'une erreur." : 'Contact us at hello@yobbu.co if you think this is a mistake.')}
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const settingsContent = (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#1A1710', marginBottom: 10 }}>{t.accInfo}</div>
      {[
        { Icon: UserIcon,     label: t.fullName,    value: fullName || '—' },
        { Icon: CalendarIcon, label: t.since,       value: joinDate },
        ...(baseCountry ? [{ Icon: GlobeIcon, label: t.baseCountry, value: baseCountry }] : []),
      ].map(({ Icon: Ic, label, value }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#FDFBF7', borderRadius: 10, border: '1px solid rgba(0,0,0,.05)', marginBottom: 8 }}>
          <Ic size={15} color="#8A8070" />
          <span style={{ fontSize: 13, color: '#8A8070', minWidth: 90 }}>{label}</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#1A1710' }}>{value}</span>
        </div>
      ))}
      {/* Language */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#FDFBF7', borderRadius: 10, border: '1px solid rgba(0,0,0,.05)', marginBottom: 8 }}>
        <GlobeIcon size={15} color="#8A8070" />
        <span style={{ fontSize: 13, color: '#8A8070', minWidth: 90 }}>{t.langLabel}</span>
        <div style={{ display: 'flex', background: '#F0EDE8', borderRadius: 8, padding: 2 }}>
          {['en', 'fr'].map(l => (
            <button key={l} onClick={() => setLang(l)}
              style={{ padding: '4px 12px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', background: lang === l ? '#C8891C' : 'transparent', color: lang === l ? '#fff' : '#8A8070' }}>
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
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FFF8EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Ic size={16} color="#C8891C" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1710', marginBottom: 3 }}>{title}</div>
            <div style={{ fontSize: 12, color: '#8A8070', marginBottom: 6, lineHeight: 1.5 }}>{desc}</div>
            <a href={href} style={{ fontSize: 13, fontWeight: 700, color: '#C8891C', textDecoration: 'none' }}>{linkLabel} →</a>
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
          .pf-nav { padding: 12px 16px !important; }
          .pf-layout  { display: block !important; padding: 0 16px 100px; }
          .pf-sidebar { display: none !important; }
          .pf-section { border-radius: 16px; padding: 18px; }
          .pf-mobile-tabs { display: flex !important; }
          .pf-bottom-bar  { display: flex !important; }
          .pf-hero        { display: block !important; }
          .pf-desktop-header { display: none !important; }
          .pf-nav-post { display: none !important; }
        }
      `}</style>

      {/* Edit modal — slides up from bottom on mobile, centered on desktop */}
      {editingTrip && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 999, padding: 0 }}>
          <div style={{ background: '#FDFBF7', borderRadius: '20px 20px 0 0', padding: '28px 24px 40px', width: '100%', maxWidth: 520, boxShadow: '0 -8px 40px rgba(0,0,0,.15)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ width: 40, height: 4, background: '#E0D8CE', borderRadius: 2, margin: '0 auto 24px' }} />
            <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20, color: '#1A1710', marginBottom: 20 }}>
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
                style={{ flex: 1, padding: '13px', borderRadius: 10, border: 'none', background: '#C8891C', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', opacity: saving ? .6 : 1 }}>
                {saving ? '...' : isFr ? 'Sauvegarder' : 'Save changes'}
              </button>
              <button onClick={() => setEditingTrip(null)}
                style={{ padding: '13px 20px', borderRadius: 10, border: '1px solid rgba(0,0,0,.1)', background: 'transparent', color: '#8A8070', fontSize: 14, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
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
            <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20, color: '#1A1710', marginBottom: 20 }}>
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
                style={{ flex: 1, padding: '13px', borderRadius: 10, border: 'none', background: '#C8891C', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', opacity: savingReq ? .6 : 1 }}>
                {savingReq ? '...' : isFr ? 'Sauvegarder' : 'Save changes'}
              </button>
              <button onClick={() => setEditingReq(null)}
                style={{ padding: '13px 20px', borderRadius: 10, border: '1px solid rgba(0,0,0,.1)', background: 'transparent', color: '#8A8070', fontSize: 14, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                {isFr ? 'Annuler' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="pf-nav" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 32px', borderBottom: '1px solid rgba(0,0,0,.06)', background: '#FDFBF7', position: 'sticky', top: 0, zIndex: 50 }}>
        <div onClick={() => setView('home')} style={{ fontFamily: 'DM Serif Display, serif', fontSize: 22, color: '#1A1710', cursor: 'pointer', letterSpacing: '-.5px' }}>
          Yob<span style={{ color: '#C8891C' }}>bu</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="pf-nav-post" onClick={() => setView('browse')}
            style={{ fontSize: 12, fontWeight: 500, padding: '7px 14px', borderRadius: 20, border: '1px solid rgba(0,0,0,.1)', background: 'transparent', color: '#3D3829', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            {isFr ? 'Voir les GPs' : 'Browse GPs'}
          </button>
          <button className="pf-nav-post" onClick={() => setView('post')}
            style={{ fontSize: 12, fontWeight: 600, padding: '7px 14px', borderRadius: 20, border: 'none', background: '#C8891C', color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            + {isFr ? 'Poster' : 'Post a trip'}
          </button>
          <button className="pf-nav-post" onClick={onSignOut}
            style={{ fontSize: 12, fontWeight: 500, padding: '7px 14px', borderRadius: 20, border: '1px solid #FECACA', background: '#FEF2F2', color: '#DC2626', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            {isFr ? 'Déconnexion' : 'Sign out'}
          </button>
        </div>
      </nav>

      {/* Mobile hero / profile header */}
      <div className="pf-hero" style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,.06)', padding: '28px 24px 20px', textAlign: 'center', display: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <AvatarUpload user={user} avatarUrl={avatarUrl} initials={initials} size={68} onUpload={setAvatarUrl} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1A1710', marginBottom: 2, fontFamily: 'DM Serif Display, serif' }}>{fullName}</div>
        <div style={{ fontSize: 13, color: '#8A8070', marginBottom: 16 }}>{contact}</div>
        <div style={{ display: 'flex', gap: 0, background: '#F7F4EF', borderRadius: 14, overflow: 'hidden', maxWidth: 300, margin: '0 auto' }}>
          {[
            { n: trips.length,                           l: t.st1 },
            { n: trips.filter(tr => tr.approved).length, l: t.st2,  color: '#2D8B4E' },
            { n: trips.filter(tr => tr.suspended).length,l: t.st3,  color: '#DC2626' },
          ].map(({ n, l, color }, i) => (
            <div key={l} style={{ flex: 1, padding: '10px 6px', textAlign: 'center', borderRight: i < 2 ? '1px solid rgba(0,0,0,.06)' : 'none' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: color || '#1A1710', lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: 10, color: '#8A8070', marginTop: 3, fontWeight: 600 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile tab bar (horizontal scroll, below hero) */}
      <div className="pf-mobile-tabs" style={{ overflowX: 'auto', borderBottom: '1px solid rgba(0,0,0,.06)', background: '#fff', padding: '0 16px', gap: 0, display: 'none' }}>
        {menuItems.map(({ key, Icon, label, badge }) => (
          <button key={key} onClick={() => setSection(key)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 600, color: section === key ? '#C8891C' : '#8A8070', borderBottom: section === key ? '2px solid #C8891C' : '2px solid transparent', whiteSpace: 'nowrap', flexShrink: 0, position: 'relative' }}>
            <span style={{ position: 'relative', display: 'flex' }}>
              <Icon size={16} color={section === key ? '#C8891C' : '#8A8070'} />
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
              <AvatarUpload user={user} avatarUrl={avatarUrl} initials={initials} size={60} onUpload={setAvatarUrl} />
            </div>
            <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 16, color: '#1A1710', marginBottom: 2 }}>{fullName}</div>
            <div style={{ fontSize: 11, color: '#8A8070' }}>{contact}</div>
          </div>

          {/* Language toggle */}
          <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.06)', borderRadius: 16, padding: 14, marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#8A8070', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>{t.langLabel}</div>
            <div style={{ display: 'flex', background: '#F7F3ED', borderRadius: 8, padding: 2 }}>
              {['en', 'fr'].map(l => (
                <button key={l} onClick={() => setLang(l)}
                  style={{ flex: 1, padding: '5px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', background: lang === l ? '#C8891C' : 'transparent', color: lang === l ? '#fff' : '#8A8070', transition: 'all .15s' }}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Menu */}
          <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.06)', borderRadius: 16, overflow: 'hidden' }}>
            {menuItems.map(({ key, Icon, label, badge }) => (
              <div key={key} onClick={() => setSection(key)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', cursor: 'pointer', borderBottom: '1px solid rgba(0,0,0,.04)', fontSize: 13, fontWeight: 500, transition: 'background .15s', background: section === key ? '#FFF8EB' : 'transparent', color: section === key ? '#C8891C' : '#3D3829', borderRight: section === key ? '3px solid #C8891C' : '3px solid transparent' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: section === key ? '#FFF8EB' : '#F7F3ED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={14} color={section === key ? '#C8891C' : '#3D3829'} />
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
            {[
              { n: trips.length,                             l: t.st1 },
              { n: trips.filter(tr => tr.approved).length,  l: t.st2, color: '#2D8B4E' },
              { n: trips.filter(tr => tr.suspended).length, l: t.st3, color: '#DC2626' },
            ].map(({ n, l, color }) => (
              <div key={l} style={{ background: '#fff', border: '1px solid rgba(0,0,0,.06)', borderRadius: 14, padding: '14px 18px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 26, color: color || '#C8891C', lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: 11, color: '#8A8070', marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>

          <div className="pf-section">
            {/* Desktop section title */}
            <div className="pf-desktop-header">
              <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20, color: '#1A1710', marginBottom: 16 }}>
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
          <button key={key} onClick={() => setSection(key)}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 4px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 10, fontWeight: 700, color: section === key ? '#C8891C' : '#8A8070' }}>
            <div style={{ position: 'relative' }}>
              <Icon size={22} color={section === key ? '#C8891C' : '#8A8070'} />
              {badge > 0 && (
                <span style={{ position: 'absolute', top: -4, right: -6, fontSize: 8, fontWeight: 700, background: '#DC2626', color: '#fff', borderRadius: 20, padding: '1px 4px', minWidth: 14, textAlign: 'center', lineHeight: '14px' }}>{badge}</span>
              )}
            </div>
            {label}
          </button>
        ))}
        <button onClick={() => setView('post')}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 4px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 10, fontWeight: 700, color: '#1A1710' }}>
          <div style={{ width: 24, height: 24, borderRadius: 7, background: '#1A1710', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PlusIcon size={14} color="#fff" />
          </div>
          {isFr ? 'Poster' : 'Post'}
        </button>
        <button onClick={() => setView('send')}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 4px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 10, fontWeight: 700, color: '#C8891C' }}>
          <div style={{ width: 24, height: 24, borderRadius: 7, background: '#FFF8EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PackageIcon size={14} color="#C8891C" />
          </div>
          {isFr ? 'Envoyer' : 'Send'}
        </button>
      </div>

    </div>
  )
}
