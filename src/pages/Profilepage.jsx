import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function Avatar({ name, size = 64 }) {
  const initials = name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'YB'
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: '#FDF3E3', color: '#C8810A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.3, fontWeight: 700, flexShrink: 0, border: '3px solid #F0C878' }}>
      {initials}
    </div>
  )
}

export default function ProfilePage({ user, lang, onSignOut, setView }) {
  const [trips, setTrips]     = useState([])
  const [loading, setLoading] = useState(true)
  const isFr = lang === 'fr'

  const meta      = user?.user_metadata || {}
  const fullName  = meta.full_name || `${meta.first_name || ''} ${meta.last_name || ''}`.trim() || (isFr ? 'Mon profil' : 'My Profile')
  const contact   = user?.email || user?.phone || '—'
  const joinDate  = new Date(user?.created_at).toLocaleDateString(isFr ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' })

  useEffect(() => {
    async function fetchMyTrips() {
      setLoading(true)
      const { data } = await supabase
        .from('trips')
        .select('*')
        .eq('phone', user?.phone || '')
        .order('created_at', { ascending: false })
      setTrips(data || [])
      setLoading(false)
    }
    if (user) fetchMyTrips()
  }, [user])

  const s = {
    page:    { minHeight: '100vh', background: '#FDFAF6', fontFamily: 'Outfit, sans-serif' },
    nav:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderBottom: '1px solid #E8E0D4', background: '#FDFAF6', position: 'sticky', top: 0, zIndex: 50 },
    logo:    { fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700, color: '#1C1A17', cursor: 'pointer' },
    body:    { maxWidth: 700, margin: '0 auto', padding: '40px 24px' },
    card:    { background: '#fff', border: '1px solid #E8E0D4', borderRadius: 20, padding: '24px', marginBottom: 16 },
    label:   { fontSize: 11, fontWeight: 700, color: '#A09890', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12, display: 'block' },
    tripCard:{ background: '#FDFAF6', border: '1px solid #E8E0D4', borderRadius: 14, padding: '14px 16px', marginBottom: 10 },
    pill:    (bg, color) => ({ fontSize: 11, fontWeight: 500, borderRadius: 20, padding: '3px 10px', background: bg, color, display: 'inline-block', marginRight: 5, marginTop: 6 }),
    btn:     (primary) => ({ fontSize: 13, fontWeight: 600, padding: '8px 20px', borderRadius: 20, border: primary ? 'none' : '1px solid #E8E0D4', background: primary ? '#C8810A' : 'transparent', color: primary ? '#fff' : '#6B6560', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }),
  }

  return (
    <div style={s.page}>
      {/* Nav */}
      <nav style={s.nav}>
        <div style={s.logo} onClick={() => setView('home')}>
          Yob<span style={{ color: '#C8810A' }}>bu</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={s.btn(false)} onClick={() => setView('browse')}>
            {isFr ? 'Voir les GPs' : 'Browse GPs'}
          </button>
          <button style={s.btn(true)} onClick={() => setView('post')}>
            {isFr ? '+ Poster un voyage' : '+ Post a trip'}
          </button>
        </div>
      </nav>

      <div style={s.body}>

        {/* Profile header */}
        <div style={{ ...s.card, display: 'flex', alignItems: 'center', gap: 20 }}>
          <Avatar name={fullName} size={72} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 700, color: '#1C1A17', marginBottom: 4 }}>
              {fullName}
            </div>
            <div style={{ fontSize: 13, color: '#A09890', marginBottom: 10 }}>{contact}</div>
            <div style={{ fontSize: 12, color: '#A09890' }}>
              {isFr ? `Membre depuis ${joinDate}` : `Member since ${joinDate}`}
            </div>
          </div>
          <button style={s.btn(false)} onClick={onSignOut}>
            {isFr ? 'Déconnexion' : 'Sign out'}
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
          {[
            { n: trips.length, l: isFr ? 'Voyages postés' : 'Trips posted' },
            { n: trips.filter(t => t.approved).length, l: isFr ? 'Approuvés' : 'Approved' },
            { n: trips.reduce((s, t) => s + (Number(t.delivered) || 0), 0) + ' kg', l: isFr ? 'Livrés' : 'Delivered' },
          ].map(({ n, l }) => (
            <div key={l} style={{ background: '#fff', border: '1px solid #E8E0D4', borderRadius: 14, padding: '16px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 700, color: '#C8810A' }}>{n}</div>
              <div style={{ fontSize: 11, color: '#A09890', marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* My trips */}
        <div style={s.card}>
          <span style={s.label}>{isFr ? 'Mes voyages' : 'My trips'}</span>

          {loading && (
            <div style={{ textAlign: 'center', padding: '24px', color: '#A09890', fontSize: 13 }}>
              {isFr ? 'Chargement...' : 'Loading...'}
            </div>
          )}

          {!loading && trips.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <div style={{ fontSize: 13, color: '#A09890', marginBottom: 14 }}>
                {isFr ? "Vous n'avez pas encore posté de voyage." : "You haven't posted any trips yet."}
              </div>
              <button style={s.btn(true)} onClick={() => setView('post')}>
                {isFr ? '+ Poster un voyage' : '+ Post a trip'}
              </button>
            </div>
          )}

          {!loading && trips.map(trip => (
            <div key={trip.id} style={s.tripCard}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1C1A17' }}>
                  {trip.from_city} → {trip.to_city}
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '2px 8px', background: trip.suspended ? '#FEF2F2' : trip.approved ? '#E8F4ED' : '#FFF3CD', color: trip.suspended ? '#DC2626' : trip.approved ? '#1A5C38' : '#856404' }}>
                  {trip.suspended ? (isFr ? 'Suspendu' : 'Suspended') : trip.approved ? (isFr ? 'Actif' : 'Active') : (isFr ? 'En attente' : 'Pending')}
                </span>
              </div>
              <div>
                <span style={s.pill('#E8F4ED', '#1A5C38')}>{trip.date}</span>
                <span style={s.pill('#FDF3E3', '#8A5800')}>~{trip.space} kg</span>
                <span style={s.pill('#F5F0E8', '#6B6560')}>{trip.price}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}