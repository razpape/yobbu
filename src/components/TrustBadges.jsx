/**
 * TrustBadges - Display all verification and achievement badges for a traveler
 * 
 * Props:
 *   profile - user profile object with verification fields
 *   lang - 'en' | 'fr'
 *   size - 'sm' | 'md' | 'lg'
 */

export default function TrustBadges({ profile, lang = 'en', size = 'md' }) {
  const isFr = lang === 'fr'
  
  const badges = []
  
  // WhatsApp Verified
  if (profile?.whatsapp_verified || profile?.phone_verified) {
    badges.push({
      key: 'whatsapp',
      icon: '📱',
      label: isFr ? 'WhatsApp vérifié' : 'WhatsApp verified',
      color: '#25D366',
      bg: '#F0FAF4',
      border: '#25D366',
      tooltip: isFr ? 'Numéro de téléphone vérifié via WhatsApp' : 'Phone number verified via WhatsApp'
    })
  }
  
  // Photo Verified (admin approved profile photo)
  if (profile?.photo_verified) {
    badges.push({
      key: 'photo',
      icon: '📸',
      label: isFr ? 'Photo vérifiée' : 'Photo verified',
      color: '#C8891C',
      bg: '#FFF8EB',
      border: '#F0C878',
      tooltip: isFr ? 'Photo de profil approuvée par Yobbu' : 'Profile photo approved by Yobbu',
    })
  }

  // ID Verified
  if (profile?.id_verified) {
    badges.push({
      key: 'id',
      icon: '🛡️',
      label: isFr ? 'ID vérifié' : 'ID verified',
      color: '#C8891C',
      bg: '#FFF8EB',
      border: '#F0C878',
      tooltip: isFr ? 'Pièce d\'identité vérifiée par Yobbu' : 'ID document verified by Yobbu'
    })
  }
  
  // Flight Number Provided
  if (profile?.flight_verified || profile?.has_flight_number) {
    badges.push({
      key: 'flight',
      icon: '✈️',
      label: isFr ? 'Vol confirmé' : 'Flight confirmed',
      color: '#185FA5',
      bg: '#E6F1FB',
      border: '#185FA5',
      tooltip: isFr ? 'Numéro de vol fourni pour plus de confiance' : 'Flight number provided for added trust'
    })
  }
  
  // Super Traveler (5+ completed trips)
  const completedTrips = profile?.completed_trips || profile?.trips_count || 0
  if (completedTrips >= 5) {
    badges.push({
      key: 'super',
      icon: '⭐',
      label: isFr ? 'Super Voyageur' : 'Super Traveler',
      color: '#7A3B1E',
      bg: '#FDF0E8',
      border: '#C8891C',
      tooltip: isFr ? `${completedTrips} voyages complétés - Voyageur de confiance` : `${completedTrips} trips completed - Trusted traveler`
    })
  }
  
  // Social Profiles Linked
  const hasSocial = profile?.facebook_url || profile?.linkedin_url
  if (hasSocial) {
    badges.push({
      key: 'social',
      icon: '👤',
      label: isFr ? 'Profil social' : 'Social profile',
      color: '#534AB7',
      bg: '#F0EBF8',
      border: '#534AB7',
      tooltip: isFr ? 'Profil social lié pour plus de transparence' : 'Social profile linked for transparency'
    })
  }
  
  const fontSize = size === 'sm' ? 10 : size === 'md' ? 11 : 13
  const padding = size === 'sm' ? '2px 6px' : size === 'md' ? '3px 10px' : '4px 12px'
  const iconSize = size === 'sm' ? 12 : size === 'md' ? 14 : 16
  
  if (badges.length === 0) {
    return (
      <span style={{ 
        fontSize, 
        color: '#8A8070',
        fontStyle: 'italic'
      }}>
        {isFr ? 'Aucune vérification' : 'No verifications yet'}
      </span>
    )
  }
  
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {badges.map(badge => (
        <span
          key={badge.key}
          title={badge.tooltip}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize,
            fontWeight: 600,
            borderRadius: 20,
            padding,
            background: badge.bg,
            color: badge.color,
            border: `1px solid ${badge.border}`,
            cursor: 'default',
            userSelect: 'none'
          }}
        >
          <span style={{ fontSize: iconSize }}>{badge.icon}</span>
          {badge.label}
        </span>
      ))}
    </div>
  )
}
