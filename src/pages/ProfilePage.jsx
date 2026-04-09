import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { PlaneIcon, SettingsIcon, BellIcon, HelpIcon, EditIcon, TrashIcon, CheckCircleIcon, WarningIcon, ShieldCheckIcon } from '../components/Icons'
import WhatsAppVerificationReminder from '../components/WhatsAppVerificationReminder'
import WhatsAppInboundVerification from '../components/WhatsAppInboundVerification'
import TrustBadges from '../components/TrustBadges'
import IDVerificationUpload from '../components/IDVerificationUpload'
import SocialProfileLinks from '../components/SocialProfileLinks'
import ProfitCalculator from '../components/ProfitCalculator'

const FLIGHTS = [
  { route: 'New York → Dakar',   detail: { en: 'Air Senegal · 7h direct',    fr: 'Air Sénégal · 7h direct' },    time: { en: '2h ago',  fr: 'il y a 2h' } },
  { route: 'Paris → Dakar',      detail: { en: 'Air France · 5h direct',     fr: 'Air France · 5h direct' },     time: { en: '5h ago',  fr: 'il y a 5h' } },
  { route: 'New York → Conakry', detail: { en: 'Brussels Airlines · 9h',     fr: 'Brussels Airlines · 9h' },     time: { en: '11h ago', fr: 'il y a 11h' } },
  { route: 'Atlanta → Dakar',    detail: { en: 'Delta · Connecting',         fr: 'Delta · Correspondance' },     time: { en: '18h ago', fr: 'il y a 18h' } },
]

const T = {
  en: {
    langLabel: 'Language', menuTrips: 'My trips', menuSettings: 'Settings',
    menuNotif: 'Notifications', menuHelp: 'Help',
    tripsTitle: 'My trips', settingsTitle: 'Settings', notifTitle: 'Notifications', helpTitle: 'Help',
    st1: 'Trips posted', st2: 'Approved', st3: 'Suspended',
    active: 'Active', pending: 'Pending review', suspended: 'Suspended',
    edit: 'Edit', delete: 'Delete', postNew: '+ Post a new trip',
    accInfo: 'Account info', fullName: 'Full name', contact: 'Contact', since: 'Member since',
    danger: 'Danger zone', signout: 'Sign out of my account',
    notifEmpty: 'No notifications yet. You\'ll be notified when your listing is approved or if any action is taken.',
    helpText: 'Need help? Contact us at hello@yobbu.co or visit our FAQ page.',
    ftTitle: 'Flights · last 24h', ftLive: 'Live',
    ft24h: '8 flights in the last 24 hours', ftRefresh: 'Refreshes every 24 hours',
    noTrips: "You haven't posted any trips yet.",
  },
  fr: {
    langLabel: 'Langue', menuTrips: 'Mes voyages', menuSettings: 'Paramètres',
    menuNotif: 'Notifications', menuHelp: 'Aide',
    tripsTitle: 'Mes voyages', settingsTitle: 'Paramètres', notifTitle: 'Notifications', helpTitle: 'Aide',
    st1: 'Voyages postés', st2: 'Approuvés', st3: 'Suspendus',
    active: 'Actif', pending: 'En attente', suspended: 'Suspendu',
    edit: 'Modifier', delete: 'Supprimer', postNew: '+ Poster un nouveau voyage',
    accInfo: 'Informations du compte', fullName: 'Nom complet', contact: 'Contact', since: 'Membre depuis',
    danger: 'Zone de danger', signout: 'Se déconnecter',
    notifEmpty: "Aucune notification pour l'instant. Vous serez notifié lorsque votre annonce sera approuvée ou si une action est prise.",
    helpText: "Besoin d'aide ? Contactez-nous à hello@yobbu.co ou consultez notre FAQ.",
    ftTitle: 'Vols · dernières 24h', ftLive: 'En direct',
    ft24h: '8 vols dans les dernières 24 heures', ftRefresh: 'Actualise toutes les 24 heures',
    noTrips: "Vous n'avez pas encore posté de voyage.",
  }
}

function FlightTracker({ lang }) {
  const t = T[lang]
  return (
    <div style={{ position:'sticky', top:80, background:'#fff', border:'1px solid rgba(0,0,0,.06)', borderRadius:20, overflow:'hidden' }}>
      {/* Header */}
      <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(0,0,0,.06)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontSize:13, fontWeight:600, color:'#1A1710' }}>{t.ftTitle}</div>
        <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:10, fontWeight:700, color:'#2D8B4E' }}>
          <div style={{ width:5, height:5, borderRadius:'50%', background:'#2D8B4E', animation:'pulse 2s infinite' }} />
          {t.ftLive}
        </div>
      </div>

      {/* Map */}
      <div style={{ background:'#F7F5F0', height:160, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(0,0,0,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.04) 1px,transparent 1px)', backgroundSize:'28px 28px' }} />
        <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} viewBox="0 0 260 160">
          <style>{`
            @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.3;}}
            @keyframes p1{0%{transform:translate(20px,120px);}100%{transform:translate(240px,35px);}}
            @keyframes p2{0%{transform:translate(240px,35px);}100%{transform:translate(20px,120px);}}
            @keyframes p3{0%{transform:translate(15px,125px);}100%{transform:translate(238px,58px);}}
            @keyframes p4{0%{transform:translate(238px,58px);}100%{transform:translate(15px,125px);}}
            .ap1{animation:p1 9s linear infinite;}
            .ap2{animation:p2 13s linear infinite 2s;}
            .ap3{animation:p3 11s linear infinite 5s;}
            .ap4{animation:p4 16s linear infinite 1s;}
          `}</style>
          <path d="M20 122 Q130 20 240 35" stroke="#C8891C" strokeWidth="1" strokeDasharray="4 3" fill="none" opacity="0.5"/>
          <path d="M20 128 Q120 40 240 60" stroke="#2D8B4E" strokeWidth="1" strokeDasharray="4 3" fill="none" opacity="0.4"/>
          <circle cx="20" cy="124" r="5" fill="#C8891C" opacity="0.8"/>
          <text x="26" y="128" fontSize="8" fill="#3D3829" fontFamily="DM Sans,sans-serif" fontWeight="600">NYC</text>
          <circle cx="240" cy="35" r="4" fill="#C8891C" opacity="0.8"/>
          <text x="210" y="31" fontSize="8" fill="#3D3829" fontFamily="DM Sans,sans-serif" fontWeight="600">DSS</text>
          <circle cx="240" cy="60" r="4" fill="#2D8B4E" opacity="0.8"/>
          <text x="210" y="70" fontSize="8" fill="#3D3829" fontFamily="DM Sans,sans-serif" fontWeight="600">CKY</text>
          <g className="ap1"><circle r="5" cx="0" cy="0" fill="#C8891C" opacity="0.9"/><text x="-4" y="4" fontSize="7" fill="white" fontFamily="DM Sans,sans-serif">✈</text></g>
          <g className="ap2"><circle r="4" cx="0" cy="0" fill="#185FA5" opacity="0.9"/><text x="-4" y="4" fontSize="7" fill="white" fontFamily="DM Sans,sans-serif">✈</text></g>
          <g className="ap3"><circle r="4" cx="0" cy="0" fill="#2D8B4E" opacity="0.9"/><text x="-4" y="4" fontSize="7" fill="white" fontFamily="DM Sans,sans-serif">✈</text></g>
          <g className="ap4"><circle r="3.5" cx="0" cy="0" fill="#C8891C" opacity="0.7"/><text x="-4" y="4" fontSize="6" fill="white" fontFamily="DM Sans,sans-serif">✈</text></g>
        </svg>
      </div>

      {/* 24h badge */}
      <div style={{ padding:'8px 16px', background:'#FFF8EB', borderBottom:'1px solid rgba(0,0,0,.06)', display:'flex', alignItems:'center', gap:6 }}>
        <PlaneIcon size={13} color="#C8891C" />
        <span style={{ fontSize:11, color:'#8A8070' }}><span style={{ color:'#C8891C', fontWeight:600 }}>8 {lang === 'fr' ? 'vols' : 'flights'}</span> {lang === 'fr' ? 'dans les dernières 24h' : 'in the last 24 hours'}</span>
      </div>

      {/* List */}
      <div style={{ padding:'8px 12px' }}>
        {FLIGHTS.map((f, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom: i < FLIGHTS.length - 1 ? '1px solid rgba(0,0,0,.04)' : 'none' }}>
            <div style={{ width:26, height:26, borderRadius:7, background:'#F7F3ED', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><PlaneIcon size={13} color="#C8891C" /></div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:11, fontWeight:600, color:'#1A1710' }}>{f.route}</div>
              <div style={{ fontSize:10, color:'#8A8070', marginTop:1 }}>{f.detail[lang]}</div>
            </div>
            <div style={{ fontSize:10, fontWeight:600, color:'#C8891C', whiteSpace:'nowrap' }}>{f.time[lang]}</div>
          </div>
        ))}
      </div>
      <div style={{ textAlign:'center', padding:'10px', fontSize:10, color:'#8A8070', borderTop:'1px solid rgba(0,0,0,.04)' }}>
        {t.ftRefresh}
      </div>
    </div>
  )
}

export default function ProfilePage({ user, lang: initialLang, onSignOut, setView }) {
  const [lang, setLang]           = useState(initialLang || 'en')
  const [section, setSection]     = useState('trips')
  const [trips, setTrips]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [editingTrip, setEditingTrip] = useState(null)
  const [saving, setSaving]       = useState(false)
  const [showWaVerification, setShowWaVerification] = useState(false)

  const t        = T[lang]
  const meta     = user?.user_metadata || {}
  const fullName = meta.full_name || meta.name || `${meta.first_name || ''} ${meta.last_name || ''}`.trim() || 'My Profile'
  const contact  = user?.email || user?.phone || '—'
  const initials = fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'YB'
  const joinDate = user?.created_at ? new Date(user.created_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' }) : '—'

  useEffect(() => { fetchTrips() }, [user])

  async function fetchTrips() {
    setLoading(true)
    const { data } = await supabase.from('trips').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setTrips(data || [])
    setLoading(false)
  }

  async function deleteTrip(id) {
    if (!window.confirm(lang === 'fr' ? 'Supprimer cette annonce?' : 'Delete this listing?')) return
    const { error } = await supabase.from('trips').delete().eq('id', id).eq('user_id', user.id)
    if (!error) setTrips(prev => prev.filter(tr => tr.id !== id))
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

  const s = {
    page:    { minHeight:'100vh', background:'#FDFBF7', fontFamily:'DM Sans, sans-serif' },
    nav:     { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 32px', borderBottom:'1px solid rgba(0,0,0,.06)', background:'#FDFBF7', position:'sticky', top:0, zIndex:50 },
    layout:  { display:'grid', gridTemplateColumns:'220px 1fr 260px', gap:16, maxWidth:1200, margin:'0 auto', padding:'24px' },
    sidebar: { position:'sticky', top:80, height:'fit-content' },
    card:    { background:'#fff', border:'1px solid rgba(0,0,0,.06)', borderRadius:16, overflow:'hidden', marginBottom:12 },
    section: { background:'#fff', border:'1px solid rgba(0,0,0,.06)', borderRadius:20, padding:22 },
    inp:     { width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid rgba(0,0,0,.1)', background:'#FDFBF7', color:'#1A1710', fontSize:13, fontFamily:'DM Sans, sans-serif', outline:'none', boxSizing:'border-box', marginBottom:10 },
    lbl:     { fontSize:10, fontWeight:700, color:'#8A8070', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'.06em' },
  }

  const notifications = trips.flatMap(tr => {
    const items = []
    if (tr.approved && !tr.suspended)
      items.push({ type: 'approved', trip: tr, id: `approved-${tr.id}` })
    if (tr.suspended)
      items.push({ type: 'suspended', trip: tr, id: `suspended-${tr.id}` })
    return items
  })

  const isFr = lang === 'fr'
  const menuItems = [
    { key:'trips',         Icon: PlaneIcon,       label: t.menuTrips },
    { key:'flights',       Icon: PlaneIcon,       label: isFr ? 'Vols' : 'Book Flights' },
    { key:'verification',  Icon: ShieldCheckIcon, label: isFr ? 'Vérification' : 'Trust & Verification' },
    { key:'settings',      Icon: SettingsIcon,    label: t.menuSettings },
    { key:'notifications', Icon: BellIcon,        label: t.menuNotif, badge: notifications.length },
    { key:'help',          Icon: HelpIcon,        label: t.menuHelp },
  ]

  return (
    <div style={s.page}>
      <style>{`
        @media (max-width: 768px) {
          .profile-nav { padding: 12px 16px !important; }
          .profile-layout { grid-template-columns: 1fr !important; padding: 12px 16px !important; gap: 12px !important; }
          .profile-sidebar { display: none !important; }
          .profile-flight { display: none !important; }
          .profile-mobile-tabs { display: flex !important; }
          .profile-nav-btns button { padding: 6px 10px !important; font-size: 11px !important; }
        }
        @media (min-width: 769px) {
          .profile-mobile-tabs { display: none !important; }
        }
      `}</style>
      {/* Edit modal */}
      {editingTrip && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999, padding:16 }}>
          <div style={{ background:'#FDFBF7', borderRadius:20, padding:28, width:'100%', maxWidth:480, boxShadow:'0 20px 60px rgba(0,0,0,.2)' }}>
            <div style={{ fontFamily:'DM Serif Display, serif', fontSize:22, color:'#1A1710', marginBottom:20 }}>
              {lang === 'fr' ? "Modifier l'annonce" : 'Edit listing'}
            </div>
            {[
              { label: lang === 'fr' ? 'Depuis' : 'From', key:'from_city' },
              { label: lang === 'fr' ? 'Vers' : 'To', key:'to_city' },
              { label: 'Date', key:'date' },
              { label: lang === 'fr' ? 'Espace (kg)' : 'Space (kg)', key:'space' },
              { label: lang === 'fr' ? 'Prix' : 'Price', key:'price' },
              { label: 'WhatsApp', key:'phone' },
              { label: lang === 'fr' ? 'Note' : 'Note', key:'note' },
            ].map(({ label, key }) => (
              <div key={key}>
                <label style={s.lbl}>{label}</label>
                <input style={s.inp} value={editingTrip[key] || ''} onChange={e => setEditingTrip(p => ({ ...p, [key]: e.target.value }))} />
              </div>
            ))}
            <div style={{ display:'flex', gap:10, marginTop:8 }}>
              <button onClick={saveEdit} disabled={saving}
                style={{ flex:1, padding:'12px', borderRadius:10, border:'none', background:'#C8891C', color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'DM Sans, sans-serif', opacity: saving ? .6 : 1 }}>
                {saving ? '...' : lang === 'fr' ? 'Sauvegarder' : 'Save changes'}
              </button>
              <button onClick={() => setEditingTrip(null)}
                style={{ padding:'12px 20px', borderRadius:10, border:'1px solid rgba(0,0,0,.1)', background:'transparent', color:'#8A8070', fontSize:14, cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>
                {lang === 'fr' ? 'Annuler' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="profile-nav" style={s.nav}>
        <div onClick={() => setView('home')} style={{ fontFamily:'DM Serif Display, serif', fontSize:22, color:'#1A1710', cursor:'pointer', letterSpacing:'-.5px' }}>
          Yob<span style={{ color:'#C8891C' }}>bu</span>
        </div>
        <div className="profile-nav-btns" style={{ display:'flex', gap:8 }}>
          <button onClick={() => setView('browse')} style={{ fontSize:12, fontWeight:500, padding:'7px 14px', borderRadius:20, border:'1px solid rgba(0,0,0,.1)', background:'transparent', color:'#3D3829', cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>
            {t.menuTrips === 'My trips' ? 'Browse GPs' : 'Voir les GPs'}
          </button>
          <button onClick={() => setView('post')} style={{ fontSize:12, fontWeight:600, padding:'7px 14px', borderRadius:20, border:'none', background:'#C8891C', color:'#fff', cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>
            + {lang === 'fr' ? 'Poster' : 'Post a trip'}
          </button>
          <button onClick={onSignOut} style={{ fontSize:12, fontWeight:500, padding:'7px 14px', borderRadius:20, border:'1px solid #FECACA', background:'#FEF2F2', color:'#DC2626', cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>
            {t.signout.split(' ')[0]}
          </button>
        </div>
      </nav>

      {/* Mobile tab bar */}
      <div className="profile-mobile-tabs" style={{ overflowX:'auto', borderBottom:'1px solid rgba(0,0,0,.06)', background:'#fff', padding:'0 16px', gap:0 }}>
        {menuItems.map(({ key, Icon, label, badge }) => (
          <button key={key} onClick={() => setSection(key)}
            style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'10px 16px', border:'none', background:'none', cursor:'pointer', fontFamily:'DM Sans, sans-serif', fontSize:11, fontWeight:600, color: section === key ? '#C8891C' : '#8A8070', borderBottom: section === key ? '2px solid #C8891C' : '2px solid transparent', whiteSpace:'nowrap', flexShrink:0, position:'relative' }}>
            <span style={{ position:'relative', display:'flex' }}>
              <Icon size={16} color={section === key ? '#C8891C' : '#8A8070'} />
              {badge > 0 && (
                <span style={{ position:'absolute', top:-4, right:-6, fontSize:8, fontWeight:700, background:'#C8891C', color:'#fff', borderRadius:20, padding:'1px 4px', minWidth:14, textAlign:'center', lineHeight:'14px' }}>
                  {badge}
                </span>
              )}
            </span>
            {label}
          </button>
        ))}
      </div>

      <div className="profile-layout" style={s.layout}>

        {/* SIDEBAR */}
        <div className="profile-sidebar" style={s.sidebar}>
          {/* User card */}
          <div style={{ ...s.card, padding:20, textAlign:'center', borderRadius:16 }}>
            <div style={{ width:60, height:60, borderRadius:'50%', background:'#FFF8EB', border:'2px solid #F0C878', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'DM Serif Display, serif', fontSize:22, color:'#C8891C', margin:'0 auto 12px' }}>
              {initials}
            </div>
            <div style={{ fontFamily:'DM Serif Display, serif', fontSize:16, color:'#1A1710', marginBottom:2 }}>{fullName}</div>
            <div style={{ fontSize:11, color:'#8A8070' }}>{contact}</div>
          </div>

          {/* Lang toggle */}
          <div style={{ ...s.card, padding:14, borderRadius:16 }}>
            <div style={{ fontSize:10, fontWeight:700, color:'#8A8070', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8 }}>{t.langLabel}</div>
            <div style={{ display:'flex', background:'#F7F3ED', borderRadius:8, padding:2 }}>
              {['en','fr'].map(l => (
                <button key={l} onClick={() => setLang(l)}
                  style={{ flex:1, padding:'5px', borderRadius:6, border:'none', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'DM Sans, sans-serif', background: lang === l ? '#C8891C' : 'transparent', color: lang === l ? '#fff' : '#8A8070', transition:'all .15s' }}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Menu */}
          <div style={s.card}>
            {menuItems.map(({ key, Icon, label, badge }) => (
              <div key={key} onClick={() => setSection(key)}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'13px 16px', cursor:'pointer', borderBottom:'1px solid rgba(0,0,0,.04)', fontSize:13, fontWeight:500, transition:'background .15s',
                  background: section === key ? '#FFF8EB' : 'transparent',
                  color: section === key ? '#C8891C' : '#3D3829',
                  borderRight: section === key ? '3px solid #C8891C' : '3px solid transparent' }}>
                <div style={{ width:28, height:28, borderRadius:8, background: section === key ? '#FFF8EB' : '#F7F3ED', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon size={14} color={section === key ? '#C8891C' : '#3D3829'} />
                </div>
                <span style={{ flex:1 }}>{label}</span>
                {badge > 0 && (
                  <span style={{ fontSize:10, fontWeight:700, background:'#C8891C', color:'#fff', borderRadius:20, padding:'1px 7px', minWidth:18, textAlign:'center' }}>
                    {badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div>
          {/* WhatsApp Verification Reminder */}
          <WhatsAppVerificationReminder 
            user={user} 
            lang={lang} 
            onVerifyClick={() => setShowWaVerification(true)} 
          />

          {/* TRIPS */}
          {section === 'trips' && (
            <div style={s.section}>
              <div style={{ fontFamily:'DM Serif Display, serif', fontSize:20, color:'#1A1710', marginBottom:16 }}>{t.tripsTitle}</div>

              {/* Stats */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:20 }}>
                {[
                  { n: trips.length, l: t.st1 },
                  { n: trips.filter(tr => tr.approved).length, l: t.st2 },
                  { n: trips.filter(tr => tr.suspended).length, l: t.st3 },
                ].map(({ n, l }) => (
                  <div key={l} style={{ background:'#FDFBF7', border:'1px solid rgba(0,0,0,.06)', borderRadius:12, padding:14, textAlign:'center' }}>
                    <div style={{ fontFamily:'DM Serif Display, serif', fontSize:24, color:'#C8891C', lineHeight:1 }}>{n}</div>
                    <div style={{ fontSize:11, color:'#8A8070', marginTop:3 }}>{l}</div>
                  </div>
                ))}
              </div>

              {loading && <div style={{ textAlign:'center', padding:24, color:'#8A8070', fontSize:13 }}>Loading...</div>}

              {!loading && trips.length === 0 && (
                <div style={{ textAlign:'center', padding:'32px 16px' }}>
                  <div style={{ display:'flex', justifyContent:'center', marginBottom:12 }}><PlaneIcon size={40} color="#E8DDD0" /></div>
                  <div style={{ fontSize:14, color:'#8A8070', marginBottom:16 }}>{t.noTrips}</div>
                  <button onClick={() => setView('post')}
                    style={{ background:'#C8891C', color:'#fff', border:'none', padding:'12px 24px', borderRadius:12, fontFamily:'DM Sans, sans-serif', fontSize:14, fontWeight:600, cursor:'pointer' }}>
                    {t.postNew}
                  </button>
                </div>
              )}

              {!loading && trips.map(trip => (
                <div key={trip.id} style={{ background:'#FDFBF7', border:'1px solid rgba(0,0,0,.06)', borderRadius:12, padding:'14px 16px', marginBottom:10 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:'#1A1710' }}>{trip.from_city} → {trip.to_city}</div>
                    <span style={{ fontSize:10, fontWeight:700, borderRadius:20, padding:'3px 10px', background: trip.suspended ? '#FEF2F2' : trip.approved ? '#F0FAF4' : '#FFF8EB', color: trip.suspended ? '#DC2626' : trip.approved ? '#2D8B4E' : '#C8891C' }}>
                      {trip.suspended ? t.suspended : trip.approved ? t.active : t.pending}
                    </span>
                  </div>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
                    {[trip.date, `~${trip.space} kg`, trip.price].filter(Boolean).map(v => (
                      <span key={v} style={{ fontSize:11, background:'#fff', border:'1px solid rgba(0,0,0,.08)', borderRadius:6, padding:'2px 8px', color:'#3D3829' }}>{v}</span>
                    ))}
                  </div>
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={() => setEditingTrip(trip)} style={{ fontSize:11, fontWeight:600, padding:'4px 12px', borderRadius:7, border:'1px solid rgba(0,0,0,.1)', background:'#fff', color:'#3D3829', cursor:'pointer', fontFamily:'DM Sans, sans-serif', display:'flex', alignItems:'center', gap:5 }}>
                      <EditIcon size={11} color="#3D3829" /> {t.edit}
                    </button>
                    <button onClick={() => deleteTrip(trip.id)} style={{ fontSize:11, fontWeight:600, padding:'4px 12px', borderRadius:7, border:'1px solid #FECACA', background:'#FEF2F2', color:'#DC2626', cursor:'pointer', fontFamily:'DM Sans, sans-serif', display:'flex', alignItems:'center', gap:5 }}>
                      <TrashIcon size={11} color="#DC2626" /> {t.delete}
                    </button>
                  </div>
                </div>
              ))}

              {!loading && trips.length > 0 && (
                <button onClick={() => setView('post')} style={{ width:'100%', padding:'11px', borderRadius:12, border:'2px dashed rgba(0,0,0,.1)', background:'transparent', color:'#8A8070', fontSize:13, cursor:'pointer', fontFamily:'DM Sans, sans-serif', marginTop:4 }}>
                  {t.postNew}
                </button>
              )}
            </div>
          )}

          {/* FLIGHTS */}
          {section === 'flights' && (
            <div style={s.section}>
              <div style={{ fontFamily:'DM Serif Display, serif', fontSize:20, color:'#1A1710', marginBottom:16 }}>
                {lang === 'fr' ? 'Réserver un vol' : 'Book a Flight'}
              </div>
              
              <div style={{ background:'#F0F7FF', border:'1px solid #B8D4E8', borderRadius:12, padding:16, marginBottom:20 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#185FA5"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
                  <span style={{ fontSize:13, fontWeight:600, color:'#185FA5' }}>
                    {lang === 'fr' ? 'Rechercher des vols' : 'Search for flights'}
                  </span>
                </div>
                
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
                  <div>
                    <label style={{...s.lbl, color:'#5A7A95'}}>{lang === 'fr' ? 'Départ' : 'From'}</label>
                    <select style={{...s.inp, marginBottom:0, borderColor:'#B8D4E8'}}>
                      <option>New York (JFK)</option>
                      <option>Atlanta (ATL)</option>
                      <option>Paris (CDG)</option>
                      <option>London (LHR)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{...s.lbl, color:'#5A7A95'}}>{lang === 'fr' ? 'Arrivée' : 'To'}</label>
                    <select style={{...s.inp, marginBottom:0, borderColor:'#B8D4E8'}}>
                      <option>Dakar (DSS)</option>
                      <option>Conakry (CKY)</option>
                      <option>Abidjan (ABJ)</option>
                      <option>Accra (ACC)</option>
                    </select>
                  </div>
                </div>
                
                <div style={{ marginBottom:12 }}>
                  <label style={{...s.lbl, color:'#5A7A95'}}>{lang === 'fr' ? 'Date' : 'Date'}</label>
                  <input type="date" style={{...s.inp, marginBottom:0, borderColor:'#B8D4E8'}} />
                </div>
                
                <a 
                  href="https://www.google.com/travel/flights"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ 
                    display:'inline-flex', 
                    alignItems:'center', 
                    gap:6, 
                    padding:'10px 16px', 
                    background:'#185FA5', 
                    color:'#fff', 
                    borderRadius:8, 
                    fontSize:13, 
                    fontWeight:600, 
                    textDecoration:'none'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>
                  {lang === 'fr' ? 'Chercher sur Google Flights' : 'Search on Google Flights'}
                </a>
              </div>

              {/* Profit Calculator */}
              <ProfitCalculator lang={lang} />
              
              {/* Popular Routes */}
              <div style={{ fontSize:12, fontWeight:600, color:'#8A8070', marginBottom:12, textTransform:'uppercase', letterSpacing:'.06em' }}>
                {lang === 'fr' ? 'Routes populaires' : 'Popular routes'}
              </div>
              
              {[
                { from: 'New York', to: 'Dakar', price: '$850 - $1,400', duration: '8-10h' },
                { from: 'Paris', to: 'Dakar', price: '$400 - $900', duration: '5-6h' },
                { from: 'Atlanta', to: 'Dakar', price: '$950 - $1,600', duration: '9-11h' },
              ].map((route, i) => (
                <a
                  key={i}
                  href={`https://www.google.com/travel/flights?q=Flights%20from%20${route.from}%20to%20${route.to}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ 
                    display:'flex', 
                    alignItems:'center', 
                    justifyContent:'space-between',
                    padding:'12px 14px', 
                    background:'#FDFBF7', 
                    border:'1px solid rgba(0,0,0,.06)', 
                    borderRadius:10, 
                    marginBottom:8,
                    textDecoration:'none',
                    cursor:'pointer'
                  }}
                >
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:32, height:32, borderRadius:8, background:'#FFF8EB', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <PlaneIcon size={14} color="#C8891C" />
                    </div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:'#1A1710' }}>{route.from} → {route.to}</div>
                      <div style={{ fontSize:11, color:'#8A8070' }}>{route.duration}</div>
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'#C8891C' }}>{route.price}</div>
                    <div style={{ fontSize:10, color:'#8A8070' }}>{lang === 'fr' ? 'Voir les vols' : 'View flights'}</div>
                  </div>
                </a>
              ))}
            </div>
          )}

          {/* VERIFICATION & TRUST */}
          {section === 'verification' && (
            <div style={s.section}>
              <div style={{ fontFamily:'DM Serif Display, serif', fontSize:20, color:'#1A1710', marginBottom:16 }}>
                {lang === 'fr' ? 'Vérification et Confiance' : 'Trust & Verification'}
              </div>
              
              {/* Current Badges Display */}
              <div style={{ background:'#FDFBF7', border:'1px solid rgba(0,0,0,.06)', borderRadius:12, padding:16, marginBottom:20 }}>
                <div style={{ fontSize:12, fontWeight:600, color:'#8A8070', marginBottom:12, textTransform:'uppercase', letterSpacing:'.06em' }}>
                  {lang === 'fr' ? 'Vos badges actuels' : 'Your current badges'}
                </div>
                <TrustBadges profile={user} lang={lang} size="md" />
              </div>
              
              {/* Stats */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
                <div style={{ background:'#F0FAF4', border:'1px solid #25D366', borderRadius:12, padding:14, textAlign:'center' }}>
                  <div style={{ fontFamily:'DM Serif Display, serif', fontSize:24, color:'#2D8B4E', lineHeight:1 }}>
                    {trips.filter(tr => tr.approved).length}
                  </div>
                  <div style={{ fontSize:11, color:'#2D8B4E', marginTop:3 }}>
                    {lang === 'fr' ? 'Voyages complétés' : 'Completed trips'}
                  </div>
                </div>
                <div style={{ background:'#FFF8EB', border:'1px solid #F0C878', borderRadius:12, padding:14, textAlign:'center' }}>
                  <div style={{ fontFamily:'DM Serif Display, serif', fontSize:24, color:'#C8891C', lineHeight:1 }}>
                    {trips.filter(tr => tr.approved).length >= 5 ? '⭐' : `${trips.filter(tr => tr.approved).length}/5`}
                  </div>
                  <div style={{ fontSize:11, color:'#C8891C', marginTop:3 }}>
                    {lang === 'fr' ? 'Vers Super Voyageur' : 'To Super Traveler'}
                  </div>
                </div>
              </div>
              
              {/* ID Verification */}
              <div style={{ marginBottom:16 }}>
                <IDVerificationUpload user={user} lang={lang} />
              </div>
              
              {/* Social Profiles */}
              <div style={{ marginBottom:16 }}>
                <SocialProfileLinks profile={user} lang={lang} />
              </div>
              
              {/* Trust Info */}
              <div style={{ background:'#F0F4F8', borderRadius:12, padding:16 }}>
                <div style={{ fontSize:13, fontWeight:600, color:'#1A1710', marginBottom:8 }}>
                  {lang === 'fr' ? 'Pourquoi la vérification est importante' : 'Why verification matters'}
                </div>
                <div style={{ fontSize:12, color:'#5A6578', lineHeight:1.7 }}>
                  {lang === 'fr' 
                    ? '• Les expéditeurs font plus confiance aux voyageurs vérifiés\n• Plus de chances d\'être contacté pour des livraisons\n• Badges spéciaux après 5+ voyages réussis'
                    : '• Senders trust verified travelers more\n• Higher chance of getting delivery requests\n• Special badges after 5+ successful trips'}
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {section === 'settings' && (
            <div style={s.section}>
              <div style={{ fontFamily:'DM Serif Display, serif', fontSize:20, color:'#1A1710', marginBottom:16 }}>{t.settingsTitle}</div>
              <div style={{ fontSize:12, fontWeight:600, color:'#1A1710', marginBottom:10 }}>{t.accInfo}</div>
              {[
                { label: t.fullName, value: fullName },
                { label: t.contact, value: contact },
                { label: t.since, value: joinDate },
              ].map(({ label, value }) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 14px', background:'#FDFBF7', borderRadius:10, border:'1px solid rgba(0,0,0,.05)', marginBottom:8 }}>
                  <span style={{ fontSize:13, color:'#8A8070' }}>{label}</span>
                  <span style={{ fontSize:13, fontWeight:500, color:'#1A1710' }}>{value}</span>
                </div>
              ))}
              <div style={{ borderTop:'1px solid rgba(0,0,0,.06)', margin:'20px 0' }} />
              <div style={{ fontSize:12, fontWeight:600, color:'#DC2626', marginBottom:10 }}>{t.danger}</div>
              <button onClick={onSignOut} style={{ width:'100%', padding:'12px', borderRadius:10, border:'1px solid #FECACA', background:'#FEF2F2', color:'#DC2626', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'DM Sans, sans-serif' }}>
                {t.signout}
              </button>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {section === 'notifications' && (
            <div style={s.section}>
              <div style={{ fontFamily:'DM Serif Display, serif', fontSize:20, color:'#1A1710', marginBottom:16 }}>{t.notifTitle}</div>

              {loading && <div style={{ textAlign:'center', padding:24, color:'#8A8070', fontSize:13 }}>Loading...</div>}

              {!loading && notifications.length === 0 && (
                <div style={{ textAlign:'center', padding:'40px 16px' }}>
                  <div style={{ display:'flex', justifyContent:'center', marginBottom:12 }}><BellIcon size={40} color="#E8DDD0" /></div>
                  <div style={{ fontSize:14, color:'#8A8070', lineHeight:1.7 }}>{t.notifEmpty}</div>
                </div>
              )}

              {!loading && notifications.map(({ type, trip, id }) => (
                <div key={id} style={{
                  display:'flex', alignItems:'flex-start', gap:14,
                  background: type === 'approved' ? '#F0FAF4' : '#FEF2F2',
                  border: `1px solid ${type === 'approved' ? '#C8E6D4' : '#FECACA'}`,
                  borderRadius:14, padding:'16px 18px', marginBottom:10
                }}>
                  <div style={{ flexShrink:0 }}>
                    {type === 'approved'
                      ? <CheckCircleIcon size={24} color="#2D8B4E" />
                      : <WarningIcon size={24} color="#DC2626" />}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:'#1A1710', marginBottom:3 }}>
                      {type === 'approved'
                        ? (lang === 'fr' ? 'Annonce approuvée !' : 'Listing approved!')
                        : (lang === 'fr' ? 'Annonce suspendue' : 'Listing suspended')}
                    </div>
                    <div style={{ fontSize:13, color: type === 'approved' ? '#1A5C38' : '#DC2626', marginBottom:6 }}>
                      {trip.from_city} → {trip.to_city} · {trip.date}
                    </div>
                    <div style={{ fontSize:12, color:'#8A8070', lineHeight:1.6 }}>
                      {type === 'approved'
                        ? (lang === 'fr' ? 'Votre annonce est maintenant visible par les expéditeurs.' : 'Your listing is now visible to senders.')
                        : (lang === 'fr' ? "Votre annonce a été suspendue. Contactez-nous si vous pensez qu'il s'agit d'une erreur." : 'Your listing has been suspended. Contact us if you think this is a mistake.')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* HELP */}
          {section === 'help' && (
            <div style={s.section}>
              <div style={{ fontFamily:'DM Serif Display, serif', fontSize:20, color:'#1A1710', marginBottom:16 }}>{t.helpTitle}</div>
              <div style={{ fontSize:14, color:'#8A8070', lineHeight:1.75 }}>
                {lang === 'fr'
                  ? <>Besoin d'aide ? Contactez-nous à <span style={{ color:'#C8891C', fontWeight:600 }}>hello@yobbu.co</span> ou consultez notre FAQ.</>
                  : <>Need help? Contact us at <span style={{ color:'#C8891C', fontWeight:600 }}>hello@yobbu.co</span> or visit our FAQ page.</>}
              </div>
            </div>
          )}

        </div>

        {/* FLIGHT TRACKER */}
        <div className="profile-flight">
          <FlightTracker lang={lang} />
        </div>

      </div>

      {/* WhatsApp Verification Modal */}
      {showWaVerification && (
        <WhatsAppInboundVerification
          user={user}
          lang={lang}
          onClose={() => setShowWaVerification(false)}
          onVerified={() => setShowWaVerification(false)}
        />
      )}
    </div>
  )
}