import { useState } from 'react'
import ContactModal from './ContactModal'
import { ShieldCheckIcon, LockIcon, PlaneIcon, MapPinIcon, PhoneIcon, PackageIcon, CalendarIcon, DollarIcon } from './Icons'

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

function WhatsAppIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a13 13 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
    </svg>
  )
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

export default function GPProfile({ gp, lang, user, onLoginRequired, onBack }) {
  const [showModal, setShowModal] = useState(false)
  const isFr = lang === 'fr'

  const fromCity    = gp.from_city || gp.from || ''
  const toCity      = gp.to_city   || gp.to   || ''
  const price       = formatPrice(gp.price)
  const initials    = gp.initials || gp.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'GP'
  const accent      = gp.color || '#C8891C'
  const isGroupage  = gp.service_type === 'groupage'
  const sendWhatsApp = (message) => {
    const phone = gp.phone?.replace(/\D/g, '')
    if (phone) window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
    setShowModal(false)
  }

  const handleContact = () => {
    if (!user) { onLoginRequired(); return }
    setShowModal(true)
  }

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', background: '#F7F5F1', minHeight: '100vh' }}>
      <style>{`
        @media (max-width: 640px) {
          .gpp-nav { padding: 14px 16px !important; }
          .gpp-body { padding: 16px !important; }
          .gpp-grid { grid-template-columns: 1fr 1fr !important; }
          .gpp-addr { flex-direction: column !important; }
        }
      `}</style>

      {showModal && (
        <ContactModal gp={{ ...gp, price }} lang={lang} onClose={() => setShowModal(false)} onSend={sendWhatsApp} />
      )}

      {/* Nav */}
      <div className="gpp-nav" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', background: '#fff', borderBottom: '1px solid #EDEAE4', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 22, color: '#1A1710', letterSpacing: '-.5px' }}>
            Yob<span style={{ color: '#C8891C' }}>bu</span>
          </div>
          <button onClick={onBack} style={{ fontSize: 13, color: '#8A8070', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 4 }}>
            ← {isFr ? 'Retour' : 'Back'}
          </button>
        </div>
        {!user && (
          <button onClick={onLoginRequired} style={{ fontSize: 13, fontWeight: 600, padding: '8px 18px', borderRadius: 20, border: '1px solid rgba(0,0,0,.12)', background: 'transparent', color: '#3D3829', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            {isFr ? 'Se connecter' : 'Sign in'}
          </button>
        )}
      </div>

      <div className="gpp-body" style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px 80px' }}>

        {/* Profile card */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #EDEAE4', overflow: 'hidden', marginBottom: 16 }}>

          {/* Header strip */}
          <div style={{ background: `linear-gradient(135deg, ${accent}18 0%, #fff 100%)`, padding: '28px 28px 20px', borderBottom: '1px solid #F0EDE8' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
              {/* Avatar */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: gp.bg || '#FFF8EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Serif Display, serif', fontSize: 26, fontWeight: 700, color: accent, border: `2px solid ${accent}33`, overflow: 'hidden' }}>
                  {gp.avatar_url
                    ? <img src={gp.avatar_url} alt={gp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : initials}
                </div>
                {gp.phone_verified && (
                  <div style={{ position: 'absolute', bottom: 1, right: 1, width: 20, height: 20, borderRadius: '50%', background: '#fff', border: '2px solid #F0C878', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheckIcon size={11} color="#C8891C" />
                  </div>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 24, color: '#1A1710', letterSpacing: '-.4px', marginBottom: 6 }}>
                  {gp.name || 'Traveler'}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {gp.phone_verified && (
                    <Pill bg="#F0FAF4" color="#1A5C38" border="#B8DCC8">
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#2D8B4E', display: 'inline-block' }} />
                      {isFr ? 'Téléphone vérifié' : 'Phone verified'}
                    </Pill>
                  )}
                  {gp.id_verified && (
                    <Pill bg="#FFF8EB" color="#7A5200" border="#EABD6A">
                      <ShieldCheckIcon size={10} color="#C8891C" />
                      ID verified
                    </Pill>
                  )}
                  {gp.trips_count > 0 && (
                    <Pill bg="#F5F3EF" color="#5A5248" border="#E5E1DB">
                      {gp.trips_count} {isFr ? 'voyages' : 'trips'}
                    </Pill>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Route + service type */}
          <div style={{ padding: '20px 28px', borderBottom: '1px solid #F0EDE8' }}>
            {/* Service type */}
            <div style={{ marginBottom: 16 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 20, background: '#FFF8EB', color: '#C8891C', border: '1px solid #F0C878' }}>
                <PlaneIcon size={13} color="#C8891C" />
                {isFr ? 'Transport en avion — bagage cabine' : 'Air transport — carry-on luggage'}
              </span>
            </div>

            {/* Route display */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#1A1710', lineHeight: 1, fontFamily: 'DM Serif Display, serif' }}>{fromCity}</div>
                <div style={{ fontSize: 11, color: '#A09080', marginTop: 3, textTransform: 'uppercase', letterSpacing: '.06em' }}>{isFr ? 'Départ' : 'Origin'}</div>
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ flex: 1, height: 1, background: '#E5E1DB' }} />
                {isGroupage
                  ? <ShipIcon size={18} color="#A09080" />
                  : <PlaneIcon size={18} color="#A09080" />
                }
                <div style={{ flex: 1, height: 1, background: '#E5E1DB' }} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: accent, lineHeight: 1, fontFamily: 'DM Serif Display, serif' }}>{toCity}</div>
                <div style={{ fontSize: 11, color: '#A09080', marginTop: 3, textTransform: 'uppercase', letterSpacing: '.06em' }}>{isFr ? 'Arrivée' : 'Destination'}</div>
              </div>
            </div>
          </div>

          {/* Key info grid */}
          <div className="gpp-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid #F0EDE8' }}>
            {[
              {
                Icon: CalendarIcon,
                label: isGroupage ? (isFr ? 'Date de chargement' : 'Loading date') : (isFr ? 'Date de départ' : 'Departure date'),
                value: formatDate(gp.date) || '—',
                color: '#1A1710',
              },
              {
                Icon: PackageIcon,
                label: isFr ? 'Capacité dispo' : 'Space available',
                value: gp.space ? `${gp.space} kg` : '—',
                color: '#1A1710',
              },
              {
                Icon: DollarIcon,
                label: isFr ? 'Prix / kg' : 'Price per kg',
                value: price || (isFr ? 'À négocier' : 'Negotiable'),
                color: '#C8891C',
              },
            ].map(({ Icon, label, value, color }, i) => (
              <div key={label} style={{ padding: '18px 16px', borderRight: i < 2 ? '1px solid #F0EDE8' : 'none', textAlign: 'center' }}>
                <Icon size={16} color="#A09080" />
                <div style={{ fontSize: 11, color: '#A09080', marginTop: 6, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Addresses */}
          {(gp.pickup_area || gp.dropoff_area) && (
            <div className="gpp-addr" style={{ display: 'flex', gap: 0, borderBottom: '1px solid #F0EDE8' }}>
              {gp.pickup_area && (
                <div style={{ flex: 1, padding: '16px 24px', borderRight: gp.dropoff_area ? '1px solid #F0EDE8' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <MapPinIcon size={13} color="#C8891C" />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#A09080', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                      {isGroupage ? (isFr ? 'Adresse dépôt' : 'Drop-off address') : (isFr ? 'Récupère à' : 'Picks up in')}
                    </span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1710' }}>{gp.pickup_area}</div>
                </div>
              )}
              {gp.dropoff_area && (
                <div style={{ flex: 1, padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <MapPinIcon size={13} color="#C8891C" />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#A09080', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                      {isGroupage ? (isFr ? 'Adresse retrait' : 'Pickup address') : (isFr ? 'Livre à' : 'Drops off in')}
                    </span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1710' }}>{gp.dropoff_area}</div>
                </div>
              )}
            </div>
          )}

          {/* Note */}
          {gp.note && (
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #F0EDE8', background: '#FDFBF7' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#A09080', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>
                {isFr ? 'Note du voyageur' : "Note"}
              </div>
              <div style={{ fontSize: 14, color: '#3D3829', lineHeight: 1.7, fontStyle: 'italic' }}>"{gp.note}"</div>
            </div>
          )}

          {/* Contact */}
          <div style={{ padding: '20px 24px' }}>
            {!gp.phone_verified ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><LockIcon size={28} color="#C0B8B0" /></div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1710', marginBottom: 4 }}>
                  {isFr ? 'Contact indisponible' : 'Contact unavailable'}
                </div>
                <p style={{ fontSize: 13, color: '#8A8070', lineHeight: 1.6, margin: 0 }}>
                  {isFr
                    ? `${gp.name?.split(' ')[0]} n'a pas encore vérifié son WhatsApp.`
                    : `${gp.name?.split(' ')[0]} hasn't verified their WhatsApp yet.`}
                </p>
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
                }}>
                  <WhatsAppIcon size={20} />
                  {isFr ? 'Contacter sur WhatsApp' : 'Message on WhatsApp'}
                </button>
                {gp.response_time && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#25D366' }} />
                    <span style={{ fontSize: 12, color: '#8A8070' }}>
                      {isFr ? `Répond en ${gp.response_time}` : `Responds within ${gp.response_time}`}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #EDEAE4', padding: '20px 24px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#A09080', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 14 }}>
            {isFr ? `Avis` : `Reviews`}
          </div>
          {gp.review_text ? (
            <div style={{ background: '#FDFBF7', border: '1px solid #F0EDE8', borderRadius: 12, padding: '14px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FFF8EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#C8891C' }}>
                  {gp.review_author?.split(' ').map(w => w[0]).join('').slice(0, 2) || 'R'}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1710' }}>{gp.review_author}</div>
                  <div style={{ display: 'flex', gap: 1 }}>
                    {[1,2,3,4,5].map(i => <span key={i} style={{ color: '#C8891C', fontSize: 11 }}>★</span>)}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 14, color: '#3D3829', lineHeight: 1.7 }}>"{gp.review_text}"</div>
            </div>
          ) : (
            <div style={{ fontSize: 13, color: '#B0A090', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
              {isFr ? "Pas encore d'avis." : 'No reviews yet.'}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
