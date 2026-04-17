import { useState, useEffect } from 'react'
import ContactModal from './ContactModal'
import TrustBadges from './TrustBadges'
import { supabase } from '../lib/supabase'
import { ShieldCheckIcon, LockIcon, PlaneIcon, MapPinIcon, PackageIcon, CalendarIcon, DollarIcon, ShipIcon } from './Icons'

function WhatsAppIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a13 13 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
    </svg>
  )
}

function formatPrice(raw) {
  if (!raw) return null
  const str = String(raw).trim()
  if (str.includes('$') || str.includes('€')) return str.replace('/kg/kg', '/kg')
  const num = parseFloat(str)
  if (!isNaN(num)) return `$${num}/kg`
  return str
}

function formatDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function Pill({ bg, color, border, children }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
      background: bg, color, border: `1px solid ${border}`,
    }}>
      {children}
    </span>
  )
}

// ── Single trip detail card ───────────────────────────────────────────────────
function TripDetailCard({ trip, lang, user, onLoginRequired, accent }) {
  const [showModal, setShowModal] = useState(false)
  const isFr       = lang === 'fr'
  const price      = formatPrice(trip.price)
  const isGroupage = trip.service_type === 'groupage'

  // Normalise field names — rows from Supabase have from_city/to_city;
  // rows already through rowToTrip have from/to.
  const fromCity = trip.from_city || trip.from || '—'
  const toCity   = trip.to_city   || trip.to   || '—'
  const phone    = trip.phone?.replace(/\D/g, '') || ''

  const handleContact = () => {
    if (!user) { onLoginRequired?.(); return }
    setShowModal(true)
  }

  const sendWhatsApp = (msg) => {
    if (phone) window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank')
    setShowModal(false)
  }

  return (
    <>
      {showModal && (
        <ContactModal
          gp={{ ...trip, from_city: fromCity, to_city: toCity, price }}
          lang={lang}
          onClose={() => setShowModal(false)}
          onSend={sendWhatsApp}
        />
      )}

      <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #EDEAE4', overflow: 'hidden', marginBottom: 14 }}>

        {/* Service type tag */}
        <div style={{ padding: '18px 24px 0' }}>
          {isGroupage ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 20, background: '#EFF6FF', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
              <ShipIcon size={13} color="#1d4ed8" />
              {isFr ? 'Bateau — groupage' : 'Boat — groupage'}
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 20, background: '#FFF8EB', color: '#C8891C', border: '1px solid #F0C878' }}>
              <PlaneIcon size={13} color="#C8891C" />
              {isFr ? 'Transport avion — bagage cabine' : 'Air transport — carry-on luggage'}
            </span>
          )}
        </div>

        {/* Route */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #F0EDE8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div>
              <div style={{ fontSize: 30, fontWeight: 900, color: '#1A1710', lineHeight: 1, fontFamily: 'DM Serif Display, serif' }}>
                {fromCity}
              </div>
              <div style={{ fontSize: 11, color: '#A09080', marginTop: 3, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                {isFr ? 'Départ' : 'Origin'}
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ flex: 1, height: 1, background: '#E5E1DB' }} />
              {isGroupage ? <ShipIcon size={18} color="#A09080" /> : <PlaneIcon size={18} color="#A09080" />}
              <div style={{ flex: 1, height: 1, background: '#E5E1DB' }} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 30, fontWeight: 900, color: accent, lineHeight: 1, fontFamily: 'DM Serif Display, serif' }}>
                {toCity}
              </div>
              <div style={{ fontSize: 11, color: '#A09080', marginTop: 3, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                {isFr ? 'Arrivée' : 'Destination'}
              </div>
            </div>
          </div>
        </div>

        {/* Key info grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #F0EDE8' }}>
          {[
            { Icon: CalendarIcon, label: isFr ? 'Date de départ' : 'Departure date', value: formatDate(trip.date) || '—',  color: '#1A1710' },
            { Icon: DollarIcon,   label: isFr ? 'Prix / kg'       : 'Price per kg',    value: price || (isFr ? 'À négocier' : 'Negotiable'), color: '#C8891C' },
          ].map(({ Icon, label, value, color }, i) => (
            <div key={label} style={{ padding: '16px 12px', borderRight: i < 1 ? '1px solid #F0EDE8' : 'none', textAlign: 'center' }}>
              <Icon size={16} color="#A09080" />
              <div style={{ fontSize: 11, color: '#A09080', marginTop: 5, marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Pickup / dropoff */}
        {(trip.pickup_area || trip.dropoff_area) && (
          <div style={{ display: 'flex', borderBottom: '1px solid #F0EDE8' }}>
            {trip.pickup_area && (
              <div style={{ flex: 1, padding: '14px 20px', borderRight: trip.dropoff_area ? '1px solid #F0EDE8' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <MapPinIcon size={13} color="#C8891C" />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#A09080', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                    {isFr ? 'Récupère à' : 'Picks up in'}
                  </span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1710' }}>{trip.pickup_area}</div>
              </div>
            )}
            {trip.dropoff_area && (
              <div style={{ flex: 1, padding: '14px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <MapPinIcon size={13} color="#C8891C" />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#A09080', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                    {isFr ? 'Livre à' : 'Drops off in'}
                  </span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1710' }}>{trip.dropoff_area}</div>
              </div>
            )}
          </div>
        )}

        {/* Flight number */}
        {trip.flight_number && (
          <div style={{ padding: '12px 24px', borderBottom: '1px solid #F0EDE8', background: '#FDFBF7' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#A09080', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              {isFr ? 'Numéro de vol' : 'Flight number'}
            </span>
            <span style={{ marginLeft: 10, fontSize: 13, fontWeight: 700, color: '#1A1710', fontFamily: 'monospace' }}>
              {trip.flight_number}
            </span>
          </div>
        )}

        {/* Note */}
        {trip.note && (
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #F0EDE8', background: '#FDFBF7' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#A09080', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>
              {isFr ? 'Note du voyageur' : 'Note'}
            </div>
            <div style={{ fontSize: 14, color: '#3D3829', lineHeight: 1.7, fontStyle: 'italic' }}>"{trip.note}"</div>
          </div>
        )}

        {/* Contact */}
        <div style={{ padding: '20px 24px' }}>
          {!phone ? (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><LockIcon size={24} color="#C0B8B0" /></div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1710', marginBottom: 3 }}>
                {isFr ? 'Contact non disponible' : 'Contact unavailable'}
              </div>
            </div>
          ) : (
            <>
              {!user && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FFF8EB', borderRadius: 10, padding: '10px 14px', marginBottom: 12, border: '1px solid #F0C878' }}>
                  <LockIcon size={13} color="#C8891C" />
                  <span style={{ fontSize: 13, color: '#C8891C', fontWeight: 500 }}>
                    {isFr ? 'Connectez-vous pour voir les coordonnées' : 'Sign in to see contact details'}
                  </span>
                </div>
              )}
              <button onClick={handleContact} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                width: '100%', padding: '15px', borderRadius: 14, border: 'none',
                background: '#25D366', color: '#fff', fontSize: 16, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                boxShadow: '0 4px 16px rgba(37,211,102,.25)',
              }}>
                <WhatsAppIcon size={20} />
                {isFr ? 'Contacter sur WhatsApp' : 'Message on WhatsApp'}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}

// ── Main GPProfile ────────────────────────────────────────────────────────────
export default function GPProfile({ gp, lang, user, onLoginRequired, onBack }) {
  const isFr   = lang === 'fr'
  const accent = gp.color || '#C8891C'

  const [profile,   setProfile]   = useState(null)
  const [allTrips,  setAllTrips]  = useState(null)   // null = still loading
  const [avatarErr, setAvatarErr] = useState(false)

  useEffect(() => {
    if (!gp?.user_id) {
      // No auth user attached — show just this one listing
      setAllTrips([gp])
      return
    }

    let cancelled = false

    // Fetch full profile — use maybeSingle so missing rows don't throw
    supabase
      .from('profiles')
      .select('full_name, avatar_url, created_at, whatsapp_verified, id_verified, photo_verified, country_of_origin, facebook_url, instagram_url, twitter_url, linkedin_url')
      .eq('id', gp.user_id)
      .maybeSingle()
      .then(({ data }) => { if (!cancelled) setProfile(data || null) })

    // Fetch all active trips for this traveler
    supabase
      .from('trips')
      .select('*')
      .eq('user_id', gp.user_id)
      .eq('approved', true)
      .neq('availability_status', 'unavailable')
      .order('date', { ascending: true })
      .then(({ data }) => {
        if (cancelled) return
        // Fall back to the gp prop so the page is never blank
        setAllTrips(data?.length ? data : [gp])
      })

    return () => { cancelled = true }
  }, [gp?.user_id])

  const displayName   = profile?.full_name  || gp.name    || 'Traveler'
  const displayAvatar = profile?.avatar_url || gp.avatar_url
  const initials      = displayName.split(' ').map(w => w[0]).filter(Boolean).join('').toUpperCase().slice(0, 2) || 'GP'
  const joinDate      = (profile?.created_at || gp.created_at)
    ? new Date(profile?.created_at || gp.created_at).toLocaleDateString(isFr ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' })
    : null

  // Merge profile data with gp for TrustBadges
  const mergedProfile = {
    ...gp,
    ...profile,
    full_name:      displayName,
    avatar_url:     displayAvatar,
    // profile stores `whatsapp_verified`; TrustBadges reads `phone_verified`
    phone_verified: profile?.whatsapp_verified ?? gp.phone_verified ?? false,
  }

  const loading = allTrips === null

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', background: '#F7F5F1', minHeight: '100vh' }}>
      <style>{`
        @media (max-width: 640px) {
          .gpp-nav  { padding: 12px 16px !important; }
          .gpp-body { padding: 16px 16px 80px !important; }
        }
      `}</style>

      {/* Nav */}
      <div className="gpp-nav" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 32px', background: '#fff', borderBottom: '1px solid #EDEAE4',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 22, color: '#1A1710', letterSpacing: '-.5px' }}>
            Yob<span style={{ color: '#C8891C' }}>bu</span>
          </div>
          <button onClick={onBack} style={{
            fontSize: 13, color: '#8A8070', cursor: 'pointer',
            background: 'none', border: 'none', fontFamily: 'DM Sans, sans-serif',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            ← {isFr ? 'Retour' : 'Back'}
          </button>
        </div>
        {!user && (
          <button onClick={onLoginRequired} style={{
            fontSize: 13, fontWeight: 600, padding: '8px 18px', borderRadius: 20,
            border: '1px solid rgba(0,0,0,.12)', background: 'transparent',
            color: '#3D3829', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
          }}>
            {isFr ? 'Se connecter' : 'Sign in'}
          </button>
        )}
      </div>

      <div className="gpp-body" style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px 80px' }}>

        {/* ── Profile identity card ── */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #EDEAE4', overflow: 'hidden', marginBottom: 20 }}>

          <div style={{ background: `linear-gradient(135deg, ${accent}18 0%, #fff 100%)`, padding: '28px 28px 20px', borderBottom: '1px solid #F0EDE8' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>

              {/* Avatar */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: gp.bg || '#FFF8EB',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'DM Serif Display, serif', fontSize: 28, fontWeight: 700, color: accent,
                  border: `2px solid ${accent}33`, overflow: 'hidden',
                }}>
                  {displayAvatar && !avatarErr
                    ? <img src={displayAvatar} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setAvatarErr(true)} />
                    : initials}
                </div>
                {mergedProfile.phone_verified && (
                  <div style={{
                    position: 'absolute', bottom: 2, right: 2,
                    width: 22, height: 22, borderRadius: '50%',
                    background: '#fff', border: '2px solid #25D366',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <ShieldCheckIcon size={12} color="#25D366" />
                  </div>
                )}
              </div>

              {/* Name + member since + badges */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 24, color: '#1A1710', letterSpacing: '-.4px', marginBottom: 4 }}>
                  {displayName}
                </div>
                {joinDate && (
                  <div style={{ fontSize: 12, color: '#8A8070', marginBottom: 10 }}>
                    {isFr ? `Membre depuis ${joinDate}` : `Member since ${joinDate}`}
                  </div>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {mergedProfile.phone_verified && (
                    <Pill bg="#F0FAF4" color="#1A5C38" border="#B8DCC8">
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#2D8B4E', display: 'inline-block' }} />
                      {isFr ? 'Téléphone vérifié' : 'Phone verified'}
                    </Pill>
                  )}
                  {mergedProfile.id_verified && (
                    <Pill bg="#FFF8EB" color="#7A5200" border="#EABD6A">
                      <ShieldCheckIcon size={10} color="#C8891C" />
                      {isFr ? 'ID vérifié' : 'ID verified'}
                    </Pill>
                  )}
                  {mergedProfile.photo_verified && (
                    <Pill bg="#FFF8EB" color="#7A5200" border="#EABD6A">
                      {isFr ? 'Photo vérifiée' : 'Photo verified'}
                    </Pill>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div style={{ padding: '16px 24px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#A09080', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>
              {isFr ? 'Badges de confiance' : 'Trust badges'}
            </div>
            <TrustBadges profile={mergedProfile} lang={lang} size="md" />
          </div>
        </div>

        {/* ── Trips label ── */}
        {!loading && allTrips.length > 0 && (
          <div style={{ fontSize: 11, fontWeight: 700, color: '#A09080', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>
            {allTrips.length === 1
              ? (isFr ? '1 voyage disponible' : '1 available trip')
              : (isFr ? `${allTrips.length} voyages disponibles` : `${allTrips.length} available trips`)}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: 40, color: '#8A8070', fontSize: 13 }}>
            {isFr ? 'Chargement...' : 'Loading...'}
          </div>
        )}

        {/* No trips */}
        {!loading && allTrips.length === 0 && (
          <div style={{ textAlign: 'center', padding: 32, color: '#8A8070', fontSize: 13, background: '#fff', borderRadius: 16, border: '1px solid #EDEAE4' }}>
            {isFr ? 'Aucun voyage disponible pour le moment.' : 'No trips available right now.'}
          </div>
        )}

        {/* Trip detail cards */}
        {!loading && allTrips.map(trip => (
          <TripDetailCard
            key={trip.id}
            trip={trip}
            lang={lang}
            user={user}
            onLoginRequired={onLoginRequired}
            accent={accent}
          />
        ))}

      </div>
    </div>
  )
}
