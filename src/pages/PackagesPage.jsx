import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function WhatsAppIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

function formatDate(str, locale) {
  if (!str) return null
  const d = new Date(str)
  return isNaN(d) ? str : d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })
}

function PackageCard({ pkg, lang, user, onLoginRequired }) {
  const isFr   = lang === 'fr'
  const locale = isFr ? 'fr-FR' : 'en-US'
  const from   = pkg.from_city || '—'
  const to     = pkg.to_city   || '—'

  const handleContact = (e) => {
    e.stopPropagation()
    if (!user) { onLoginRequired(); return }
    const phone = pkg.phone?.replace(/\D/g, '')
    if (phone) window.open(`https://wa.me/${phone}`, '_blank')
  }

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #EBEBEB',
      borderRadius: 20,
      overflow: 'hidden',
      display: 'flex',
      fontFamily: "'DM Sans', sans-serif",
      transition: 'box-shadow .18s, border-color .18s',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,.07)'; e.currentTarget.style.borderColor = '#DDDAD5' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = '#EBEBEB' }}
    >
      {/* Route */}
      <div style={{ padding: '22px 28px', flex: 1, minWidth: 0, borderRight: '1px solid #F2F0ED' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#B5AFA8', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 14 }}>
          {isFr ? 'Itinéraire' : 'Route'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#111', letterSpacing: '-.6px', lineHeight: 1, fontFamily: "'DM Serif Display', serif" }}>{from}</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', minWidth: 40 }}>
            <div style={{ flex: 1, height: '1.5px', background: 'linear-gradient(90deg, #D4C9BA, #10B981)' }} />
            <div style={{ fontSize: 16, margin: '0 4px' }}>📦</div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#10B981', letterSpacing: '-.6px', lineHeight: 1, fontFamily: "'DM Serif Display', serif" }}>{to}</div>
        </div>
        {pkg.deadline && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#B5AFA8', textTransform: 'uppercase', letterSpacing: '.08em' }}>
              {isFr ? 'Avant le' : 'Needed by'}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>
              {formatDate(pkg.deadline, locale)}
            </span>
          </div>
        )}
      </div>

      {/* Package details */}
      <div style={{ padding: '22px 24px', background: '#FDFBF8', borderRight: '1px solid #F2F0ED', minWidth: 200, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
        {pkg.weight && (
          <div style={{ fontSize: 13 }}>
            <span style={{ color: '#B5AFA8', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em' }}>
              {isFr ? 'Poids ' : 'Weight '}
            </span>
            <span style={{ fontWeight: 700, color: '#111' }}>{pkg.weight} kg</span>
          </div>
        )}
        {pkg.description && (
          <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5, maxWidth: 220 }}>
            {pkg.description}
          </div>
        )}
        {pkg.budget && (
          <div style={{ fontSize: 13 }}>
            <span style={{ color: '#B5AFA8', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em' }}>
              {isFr ? 'Budget ' : 'Budget '}
            </span>
            <span style={{ fontWeight: 700, color: '#16A34A' }}>${pkg.budget}/kg</span>
          </div>
        )}
        <div style={{ fontSize: 10, color: '#C8C0B4', marginTop: 2 }}>
          {isFr ? 'Posté le ' : 'Posted '}{formatDate(pkg.created_at, locale)}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '22px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, minWidth: 140 }}>
        <button
          onClick={handleContact}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '10px 16px', borderRadius: 12, border: 'none',
            background: '#25D366', color: '#fff',
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            transition: 'opacity .15s', whiteSpace: 'nowrap',
            width: '100%', justifyContent: 'center',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <WhatsAppIcon size={13} />
          {isFr ? 'Contacter' : 'Contact'}
        </button>
      </div>
    </div>
  )
}

export default function PackagesPage({ lang, user, onLoginRequired, onSendPackage, onBrowseTravelers }) {
  const isFr = lang === 'fr'
  const [packages, setPackages] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [fromFilter, setFromFilter] = useState('')
  const [toFilter, setToFilter]     = useState('')

  useEffect(() => {
    setLoading(true)
    supabase
      .from('package_requests')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (err) {
          console.error('[PackagesPage] Failed to load packages:', err)
          setError(err.message)
        } else {
          setPackages(data || [])
          setError(null)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('[PackagesPage] Unexpected error loading packages:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const filtered = packages.filter(p => {
    const matchFrom = !fromFilter || (p.from_city || '').toLowerCase().includes(fromFilter.toLowerCase())
    const matchTo   = !toFilter   || (p.to_city   || '').toLowerCase().includes(toFilter.toLowerCase())
    return matchFrom && matchTo
  })

  return (
    <div style={{ minHeight: '100vh', background: '#FDFBF7', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Trust bar */}
      <div style={{ background: '#D1F4E7', borderBottom: '1px solid #F0D898', padding: '10px 48px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 15 }}>📦</span>
        <span style={{ fontSize: 12, fontWeight: 500, color: '#7C4E0A' }}>
          {isFr
            ? 'Des personnes cherchent des voyageurs pour envoyer leurs colis. Voyageur ? Contactez-les directement.'
            : 'People are looking for travelers to carry their packages. Traveler? Reach out to them directly.'}
        </span>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Page title + filters */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: '#1F2937', letterSpacing: '-.5px', lineHeight: 1.15, margin: 0 }}>
              {isFr ? 'Colis à envoyer' : 'Packages to deliver'}
            </h1>
            <p style={{ fontSize: 13, color: '#6B7280', marginTop: 6, lineHeight: 1.5 }}>
              {isFr
                ? 'Ces personnes cherchent un voyageur pour transporter leur colis.'
                : 'These people are looking for a traveler to carry their package.'}
            </p>
          </div>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={fromFilter}
              onChange={e => setFromFilter(e.target.value)}
              placeholder={isFr ? 'Depuis...' : 'From...'}
              style={{
                padding: '9px 14px', border: '1.5px solid #E8E4DE', borderRadius: 10,
                fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: '#1F2937',
                background: '#fff', outline: 'none', width: 130,
              }}
              onFocus={e => e.target.style.borderColor = '#10B981'}
              onBlur={e => e.target.style.borderColor = '#E8E4DE'}
            />
            <input
              value={toFilter}
              onChange={e => setToFilter(e.target.value)}
              placeholder={isFr ? 'Vers...' : 'To...'}
              style={{
                padding: '9px 14px', border: '1.5px solid #E8E4DE', borderRadius: 10,
                fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: '#1F2937',
                background: '#fff', outline: 'none', width: 130,
              }}
              onFocus={e => e.target.style.borderColor = '#10B981'}
              onBlur={e => e.target.style.borderColor = '#E8E4DE'}
            />
          </div>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <>
            <style>{`
              @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
              .pkg-skeleton { background: linear-gradient(90deg, #F0EDE8 25%, #E8E4DE 50%, #F0EDE8 75%); background-size: 800px 100%; animation: shimmer 1.4s infinite linear; }
            `}</style>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ background: '#fff', border: '1px solid rgba(0,0,0,.06)', borderRadius: 20, padding: '22px 28px', display: 'flex', gap: 20, alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div className="pkg-skeleton" style={{ height: 28, borderRadius: 6, width: '50%', marginBottom: 12 }} />
                    <div className="pkg-skeleton" style={{ height: 12, borderRadius: 6, width: '30%' }} />
                  </div>
                  <div style={{ width: 200 }}>
                    <div className="pkg-skeleton" style={{ height: 14, borderRadius: 6, width: '60%', marginBottom: 8 }} />
                    <div className="pkg-skeleton" style={{ height: 12, borderRadius: 6, width: '80%' }} />
                  </div>
                  <div className="pkg-skeleton" style={{ height: 36, width: 100, borderRadius: 12 }} />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: 20, fontSize: 13, color: '#DC2626' }}>
            {isFr ? 'Impossible de charger les colis.' : 'Could not load packages.'} {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: '#1F2937', marginBottom: 8 }}>
              {isFr ? 'Aucun colis pour le moment' : 'No packages yet'}
            </div>
            <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7, maxWidth: 320, margin: '0 auto 24px' }}>
              {isFr
                ? 'Soyez le premier à poster votre demande de livraison.'
                : 'Be the first to post a delivery request.'}
            </p>
            <button
              onClick={onSendPackage}
              style={{ padding: '12px 28px', borderRadius: 20, border: 'none', background: '#10B981', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
            >
              {isFr ? 'Poster un colis' : 'Post a package'}
            </button>
          </div>
        )}

        {/* Package cards */}
        {!loading && !error && filtered.length > 0 && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 14 }}>
              {isFr ? `${filtered.length} demande${filtered.length > 1 ? 's' : ''}` : `${filtered.length} request${filtered.length > 1 ? 's' : ''}`}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.map(pkg => (
                <PackageCard key={pkg.id} pkg={pkg} lang={lang} user={user} onLoginRequired={onLoginRequired} />
              ))}
            </div>
          </>
        )}

        {/* CTA for travelers */}
        {!loading && filtered.length > 0 && (
          <div style={{ marginTop: 40, background: '#fff', border: '1.5px solid #EDEAE4', borderRadius: 16, padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: '#1F2937', marginBottom: 4 }}>
                {isFr ? 'Vous êtes voyageur ?' : 'Are you a traveler?'}
              </div>
              <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
                {isFr
                  ? 'Postez votre trajet et ces expéditeurs vous contacteront.'
                  : 'Post your trip and these senders will reach out to you.'}
              </p>
            </div>
            <button
              onClick={onBrowseTravelers}
              style={{ padding: '11px 24px', borderRadius: 10, border: '1.5px solid #1F2937', background: '#1F2937', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' }}
            >
              {isFr ? 'Voir les voyageurs' : 'Browse travelers'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
