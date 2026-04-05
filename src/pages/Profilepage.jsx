import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function ProfilePage({ user, lang, onSignOut, setView }) {
  const [trips, setTrips]     = useState([])
  const [loading, setLoading] = useState(true)
  const isFr = lang === 'fr'

  const meta     = user?.user_metadata || {}
  const fullName = meta.full_name || meta.first_name || user?.phone || (isFr ? 'Mon profil' : 'My Profile')
  const contact  = user?.email || user?.phone || '—'
  const initials = fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const joinDate = user?.created_at ? new Date(user.created_at).toLocaleDateString(isFr ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' }) : '—'

  useEffect(() => {
    async function fetchTrips() {
      setLoading(true)
      const { data } = await supabase.from('trips').select('*').order('created_at', { ascending: false })
      setTrips(data || [])
      setLoading(false)
    }
    fetchTrips()
  }, [])

  const s = {
    page:  { minHeight: '100vh', background: '#FDFBF7', fontFamily: 'DM Sans, sans-serif' },
    nav:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 48px', borderBottom: '1px solid rgba(0,0,0,.06)', background: '#FDFBF7', position: 'sticky', top: 0, zIndex: 50, maxWidth: '100%' },
    body:  { maxWidth: 760, margin: '0 auto', padding: '40px 24px' },
    card:  { background: '#fff', border: '1px solid rgba(0,0,0,.06)', borderRadius: 20, padding: '24px', marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,.04)' },
  }

  return (
    <div style={s.page}>
      {/* Nav */}
      <nav style={s.nav}>
        <div onClick={() => setView('home')}
          style={{ fontFamily: 'DM Serif Display, serif', fontSize: 24, color: '#1A1710', cursor: 'pointer', letterSpacing: '-.5px' }}>
          Yob<span style={{ color: '#C8891C' }}>bu</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setView('browse')}
            style={{ background: 'transparent', border: '1px solid rgba(0,0,0,.1)', color: '#3D3829', padding: '8px 18px', borderRadius: 20, fontFamily: 'DM Sans, sans-serif', fontSize: 13, cursor: 'pointer' }}>
            {isFr ? 'Voir les GPs' : 'Browse GPs'}
          </button>
          <button onClick={() => setView('post')}
            style={{ background: '#C8891C', border: 'none', color: '#fff', padding: '8px 18px', borderRadius: 20, fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {isFr ? '+ Poster' : '+ Post a trip'}
          </button>
          <button onClick={onSignOut}
            style={{ background: 'transparent', border: '1px solid rgba(0,0,0,.1)', color: '#8A8070', padding: '8px 18px', borderRadius: 20, fontFamily: 'DM Sans, sans-serif', fontSize: 13, cursor: 'pointer' }}>
            {isFr ? 'Déconnexion' : 'Sign out'}
          </button>
        </div>
      </nav>

      <div style={s.body}>
        {/* Profile header */}
        <div style={{ ...s.card, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#FFF8EB', border: '2px solid #F0C878', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#C8891C', flexShrink: 0, fontFamily: 'DM Serif Display, serif' }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 26, color: '#1A1710', marginBottom: 4 }}>{fullName}</div>
            <div style={{ fontSize: 13, color: '#8A8070', marginBottom: 6 }}>{contact}</div>
            <div style={{ fontSize: 12, color: '#8A8070' }}>{isFr ? `Membre depuis ${joinDate}` : `Member since ${joinDate}`}</div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
          {[
            { n: trips.length, l: isFr ? 'Voyages postés' : 'Trips posted' },
            { n: trips.filter(t => t.approved).length, l: isFr ? 'Approuvés' : 'Approved' },
            { n: '—', l: isFr ? 'Livrés' : 'Delivered' },
          ].map(({ n, l }) => (
            <div key={l} style={{ background: '#fff', border: '1px solid rgba(0,0,0,.06)', borderRadius: 16, padding: '20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,.03)' }}>
              <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 28, color: '#C8891C', lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: 12, color: '#8A8070', marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* My trips */}
        <div style={s.card}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#8A8070', marginBottom: 16 }}>
            {isFr ? 'Mes voyages' : 'My trips'}
          </div>

          {loading && <div style={{ textAlign: 'center', padding: '24px', color: '#8A8070', fontSize: 13 }}>{isFr ? 'Chargement...' : 'Loading...'}</div>}

          {!loading && trips.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <div style={{ fontSize: 14, color: '#8A8070', marginBottom: 16 }}>
                {isFr ? "Vous n'avez pas encore posté de voyage." : "You haven't posted any trips yet."}
              </div>
              <button onClick={() => setView('post')}
                style={{ background: '#C8891C', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 12, fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                {isFr ? '+ Poster un voyage' : '+ Post a trip'}
              </button>
            </div>
          )}

          {!loading && trips.map(trip => (
            <div key={trip.id} style={{ background: '#FDFBF7', border: '1px solid rgba(0,0,0,.06)', borderRadius: 14, padding: '14px 16px', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1710' }}>{trip.from_city} → {trip.to_city}</div>
                <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '3px 10px', background: trip.suspended ? '#FEF2F2' : trip.approved ? '#F0FAF4' : '#FFF8EB', color: trip.suspended ? '#DC2626' : trip.approved ? '#2D8B4E' : '#C8891C' }}>
                  {trip.suspended ? (isFr ? 'Suspendu' : 'Suspended') : trip.approved ? (isFr ? 'Actif' : 'Active') : (isFr ? 'En attente' : 'Pending')}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[trip.date, `~${trip.space} kg`, trip.price].map(v => v && (
                  <span key={v} style={{ fontSize: 12, background: '#fff', border: '1px solid rgba(0,0,0,.08)', borderRadius: 6, padding: '3px 10px', color: '#3D3829' }}>{v}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}