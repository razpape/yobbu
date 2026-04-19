import { useState, useEffect } from 'react'
import ContactModal from './ContactModal'
import ReviewModal from './ReviewModal'
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

// ── Review card ───────────────────────────────────────────────────────
function ReviewCard({ review, lang }) {
  const isFr = lang === 'fr'
  const reviewer = review.profiles
  const date = review.created_at
    ? new Date(review.created_at).toLocaleDateString(isFr ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric' })
    : null

  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #EDEAE4', padding: '16px 20px', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: '#D1F4E7', border: '1px solid #C8E6D4',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, color: '#10B981',
          overflow: 'hidden', flexShrink: 0,
        }}>
          {reviewer?.avatar_url ? (
            <img src={reviewer.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            (reviewer?.full_name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2)
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#1F2937' }}>
            {reviewer?.full_name || (isFr ? 'Utilisateur' : 'User')}
          </div>
          <div style={{ fontSize: 11, color: '#A09080', marginTop: 2 }}>
            {[...Array(review.rating)].map((_, i) => '★').join('')}
            {[...Array(5 - review.rating)].map((_, i) => '☆').join('')}
            {date && <span style={{ marginLeft: 8 }}>{date}</span>}
          </div>
        </div>
      </div>
      {review.comment && (
        <div style={{ fontSize: 13, color: '#1F2937', lineHeight: 1.6, fontStyle: 'italic' }}>
          "{review.comment}"
        </div>
      )}
    </div>
  )
}

// ── Single trip detail card ───────────────────────────────────────────────────
function TripDetailCard({ trip, lang, user, onLoginRequired, accent, gpName, gpAvatar, gpInitials, gpRating, gpTripsCount }) {
  const [showModal, setShowModal] = useState(false)
  const isFr       = lang === 'fr'
  const price      = formatPrice(trip.price)

  // Normalise field names
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

  const days = trip.date ? Math.ceil((new Date(trip.date) - new Date().setHours(0,0,0,0)) / 86400000) : null
  const urgency = (() => {
    if (days === 0) return { label: isFr ? "Aujourd'hui" : 'Today',       c: '#059669' }
    if (days === 1) return { label: isFr ? 'Demain'      : 'Tomorrow',    c: '#10B981' }
    if (days <= 6)  return { label: isFr ? 'Cette sem.'  : 'This week',   c: '#2563EB' }
    if (days <= 30) return { label: isFr ? 'Ce mois'     : 'This month',  c: '#7C3AED' }
    return { label: isFr ? 'Prochain mois' : 'Next month', c: '#6366F1' }
  })()

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

      <div style={{
        background: '#fff',
        border: '1px solid #E8E4DE',
        borderRadius: 12,
        padding: '14px',
        marginBottom: 10,
        transition: 'all .2s',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.05)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
      >
        {/* Header: Avatar + Name + Rating + Tag */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
          {/* Avatar */}
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: `linear-gradient(135deg, ${accent}22, ${accent}08)`,
            border: `1.5px solid ${accent}25`,
            overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'DM Serif Display', serif",
            fontSize: 13, fontWeight: 700, color: accent,
            flexShrink: 0,
          }}>
            {gpAvatar
              ? <img src={gpAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : gpInitials}
          </div>

          {/* Name + Rating */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1F2937', lineHeight: 1.3 }}>
              {gpName || 'GP'}
            </div>
            {gpRating && (
              <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
                ★ {gpRating} • {gpTripsCount || 0} {isFr ? 'voyages' : 'trips'}
              </div>
            )}
          </div>

          {/* Availability tag */}
          {urgency && (
            <div style={{
              background: urgency.c,
              color: '#fff',
              padding: '4px 10px',
              borderRadius: 12,
              fontSize: 10,
              fontWeight: 700,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}>
              {urgency.label}
            </div>
          )}
        </div>

        {/* Route: From → To */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, paddingLeft: 2 }}>
          <div style={{ textAlign: 'center', minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#1F2937', letterSpacing: '-.3px', fontFamily: "'DM Serif Display', serif" }}>
              {fromCity}
            </div>
            {trip.pickup_area && <div style={{ fontSize: 9, color: '#9CA3AF', marginTop: 1 }}>{trip.pickup_area}</div>}
          </div>

          <div style={{ fontSize: 12, color: '#D4C4A8', flexShrink: 0 }}>→</div>

          <div style={{ textAlign: 'center', minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: accent, letterSpacing: '-.3px', fontFamily: "'DM Serif Display', serif" }}>
              {toCity}
            </div>
            {trip.dropoff_area && <div style={{ fontSize: 9, color: '#9CA3AF', marginTop: 1 }}>{trip.dropoff_area}</div>}
          </div>
        </div>

        {/* Info row: Departure + Price */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid #F0EDE8' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#B5AFA8', textTransform: 'uppercase', letterSpacing: '.05em' }}>
              {isFr ? 'Départ' : 'Depart'}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#1F2937', marginTop: 2 }}>
              {formatDate(trip.date) || '—'}
            </div>
          </div>
          {price && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#B5AFA8', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                {isFr ? 'Tarif' : 'Price'}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#10B981', marginTop: 2 }}>
                {price}<span style={{ fontSize: 10, color: '#6B7280' }}>/kg</span>
              </div>
            </div>
          )}
        </div>

        {/* CTA Button */}
        {!phone ? (
          <div style={{ padding: '8px', textAlign: 'center', borderRadius: 10, fontSize: 11, fontWeight: 700, background: '#F3F4F6', color: '#6B7280' }}>
            {isFr ? 'Non disponible' : 'Unavailable'}
          </div>
        ) : !user ? (
          <button onClick={onLoginRequired} style={{
            width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '10px 14px', borderRadius: 10, border: 'none',
            background: '#F59E0B', color: '#fff',
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            transition: 'opacity .15s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <LockIcon size={12} color="#fff" />
            {isFr ? 'Se connecter' : 'Sign in'}
          </button>
        ) : (
          <button onClick={handleContact} style={{
            width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '10px 14px', borderRadius: 10, border: 'none',
            background: '#25D366', color: '#fff',
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            transition: 'opacity .15s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <WhatsAppIcon size={14} />
            {isFr ? 'WhatsApp' : 'WhatsApp'}
          </button>
        )}
      </div>
    </>
  )
}

// ── Main GPProfile ────────────────────────────────────────────────────────────
export default function GPProfile({ gp, lang, user, onLoginRequired, onBack }) {
  const isFr   = lang === 'fr'
  const accent = gp.color || '#10B981'

  const [profile,   setProfile]   = useState(null)
  const [allTrips,  setAllTrips]  = useState(null)   // null = still loading
  const [avatarErr, setAvatarErr] = useState(false)
  const [reviews, setReviews] = useState(null)
  const [showReviewModal, setShowReviewModal] = useState(false)

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
      .then(({ data, error }) => {
        if (error) {
          console.error('[GPProfile] Failed to load profile:', error)
          return
        }
        if (!cancelled) setProfile(data || null)
      })
      .catch(err => console.error('[GPProfile] Unexpected error loading profile:', err))

    // Fetch all active trips for this traveler
    supabase
      .from('trips')
      .select('*')
      .eq('user_id', gp.user_id)
      .eq('approved', true)
      .neq('availability_status', 'unavailable')
      .order('date', { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error('[GPProfile] Failed to load trips:', error)
          if (!cancelled) setAllTrips([gp])
          return
        }
        if (cancelled) return
        // Fall back to the gp prop so the page is never blank
        setAllTrips(data?.length ? data : [gp])
      })
      .catch(err => console.error('[GPProfile] Unexpected error loading trips:', err))

    return () => { cancelled = true }
  }, [gp?.user_id])

  // Fetch reviews for this GP
  useEffect(() => {
    if (!gp?.user_id) return
    let cancelled = false

    supabase
      .from('reviews')
      .select('id, rating, comment, created_at, sender_id, profiles:sender_id(full_name, avatar_url)')
      .eq('gp_id', gp.user_id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('[GPProfile] Failed to load reviews:', error)
          return
        }
        if (!cancelled) setReviews(data || [])
      })
      .catch(err => console.error('[GPProfile] Unexpected error loading reviews:', err))

    return () => { cancelled = true }
  }, [gp?.user_id])

  const displayName   = profile?.full_name  || gp.name    || 'GP'
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
  const avgRating = reviews?.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null
  const isSender = user?.role === 'sender' || user?.role === 'both'
  const canReview = user && isSender && user.id !== gp?.user_id

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', background: '#F7F5F1', minHeight: '100vh' }}>
      {showReviewModal && (
        <ReviewModal
          gpId={gp.user_id}
          gpName={displayName}
          user={user}
          lang={lang}
          onClose={() => setShowReviewModal(false)}
          onSubmitted={(newReview) => {
            setReviews(prev => [newReview, ...(prev || [])])
            setShowReviewModal(false)
          }}
        />
      )}

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
          <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 22, color: '#1F2937', letterSpacing: '-.5px' }}>
            Yob<span style={{ color: '#10B981' }}>bu</span>
          </div>
          <button onClick={onBack} style={{
            fontSize: 13, color: '#6B7280', cursor: 'pointer',
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
            color: '#1F2937', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
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
                  background: gp.bg || '#D1F4E7',
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
                <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 24, color: '#1F2937', letterSpacing: '-.4px', marginBottom: 4 }}>
                  {displayName}
                </div>
                {joinDate && (
                  <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 10 }}>
                    {isFr ? `Membre depuis ${joinDate}` : `Member since ${joinDate}`}
                  </div>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: avgRating || canReview ? 12 : 0 }}>
                  {mergedProfile.phone_verified && (
                    <Pill bg="#F0FAF4" color="#059669" border="#B8DCC8">
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#2D8B4E', display: 'inline-block' }} />
                      {isFr ? 'Téléphone vérifié' : 'Phone verified'}
                    </Pill>
                  )}
                  {mergedProfile.id_verified && (
                    <Pill bg="#D1F4E7" color="#7A5200" border="#EABD6A">
                      <ShieldCheckIcon size={10} color="#10B981" />
                      {isFr ? 'ID vérifié' : 'ID verified'}
                    </Pill>
                  )}
                  {mergedProfile.photo_verified && (
                    <Pill bg="#D1F4E7" color="#7A5200" border="#EABD6A">
                      {isFr ? 'Photo vérifiée' : 'Photo verified'}
                    </Pill>
                  )}
                  {avgRating && (
                    <Pill bg="#FEF3C7" color="#92400E" border="#F59E0B">
                      ★ {avgRating} <span style={{ fontWeight: 400, fontSize: 10 }}>({reviews.length})</span>
                    </Pill>
                  )}
                </div>
                {canReview && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    style={{
                      padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                      background: '#FEF3C7', color: '#92400E', border: '1px solid #F59E0B',
                      cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                    }}
                  >
                    {isFr ? 'Laisser un avis' : 'Leave a Review'}
                  </button>
                )}
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
          <div style={{ textAlign: 'center', padding: 40, color: '#6B7280', fontSize: 13 }}>
            {isFr ? 'Chargement...' : 'Loading...'}
          </div>
        )}

        {/* No trips */}
        {!loading && allTrips.length === 0 && (
          <div style={{ textAlign: 'center', padding: 32, color: '#6B7280', fontSize: 13, background: '#fff', borderRadius: 16, border: '1px solid #EDEAE4' }}>
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
            gpName={displayName}
            gpAvatar={displayAvatar}
            gpInitials={initials}
            gpRating={avgRating}
            gpTripsCount={allTrips.length}
          />
        ))}

        {/* Reviews section */}
        {reviews !== null && reviews.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#A09080', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 16 }}>
              {reviews.length === 1
                ? (isFr ? '1 avis' : '1 review')
                : (isFr ? `${reviews.length} avis` : `${reviews.length} reviews`)}
            </div>
            {reviews.map(review => (
              <ReviewCard key={review.id} review={review} lang={lang} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
