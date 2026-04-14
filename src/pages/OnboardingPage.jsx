import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

const ORIGIN_COUNTRIES = [
  { code: 'SN', name: 'Senegal',            prefix: '+221' },
  { code: 'GN', name: 'Guinea',             prefix: '+224' },
  { code: 'CI', name: "Côte d'Ivoire",      prefix: '+225' },
  { code: 'ML', name: 'Mali',               prefix: '+223' },
  { code: 'TG', name: 'Togo',               prefix: '+228' },
  { code: 'GH', name: 'Ghana',              prefix: '+233' },
  { code: 'NG', name: 'Nigeria',            prefix: '+234' },
  { code: 'BJ', name: 'Benin',              prefix: '+229' },
  { code: 'CM', name: 'Cameroon',           prefix: '+237' },
  { code: 'MA', name: 'Morocco',            prefix: '+212' },
  { code: 'CD', name: 'DR Congo',           prefix: '+243' },
  { code: 'BF', name: 'Burkina Faso',       prefix: '+226' },
  { code: 'GA', name: 'Gabon',              prefix: '+241' },
  { code: 'MR', name: 'Mauritania',         prefix: '+222' },
  { code: 'GM', name: 'Gambia',             prefix: '+220' },
  { code: 'FR', name: 'France',             prefix: '+33'  },
  { code: 'US', name: 'United States',      prefix: '+1'   },
  { code: 'CA', name: 'Canada',             prefix: '+1'   },
  { code: 'GB', name: 'United Kingdom',     prefix: '+44'  },
  { code: 'BE', name: 'Belgium',            prefix: '+32'  },
  { code: 'ES', name: 'Spain',              prefix: '+34'  },
  { code: 'DE', name: 'Germany',            prefix: '+49'  },
  { code: 'IT', name: 'Italy',              prefix: '+39'  },
  { code: 'NL', name: 'Netherlands',        prefix: '+31'  },
  { code: 'PT', name: 'Portugal',           prefix: '+351' },
  { code: 'CH', name: 'Switzerland',        prefix: '+41'  },
]

function guessCountryFromPhone(phone) {
  if (!phone) return ''
  const prefixes = [...ORIGIN_COUNTRIES].sort((a, b) => b.prefix.length - a.prefix.length)
  for (const c of prefixes) {
    if (phone.startsWith(c.prefix)) return c.name
  }
  return ''
}

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_MB   = 3

export default function OnboardingPage({ user, lang, onComplete }) {
  const isFr = lang === 'fr'

  const [fullName,        setFullName]        = useState('')
  const [email,           setEmail]           = useState('')
  const [countryOfOrigin, setCountryOfOrigin] = useState('')
  const [avatarFile,      setAvatarFile]      = useState(null)
  const [avatarPreview,   setAvatarPreview]   = useState(null)
  const [loading,         setLoading]         = useState(false)
  const [uploading,       setUploading]       = useState(false)
  const [error,           setError]           = useState(null)
  const fileRef = useRef()

  // Pre-fill name + detect country from phone
  useEffect(() => {
    if (!user?.id) return
    supabase.from('profiles').select('first_name, last_name, full_name, phone').eq('id', user.id).single()
      .then(({ data }) => {
        if (!data) return
        const name = data.full_name || [data.first_name, data.last_name].filter(Boolean).join(' ') || ''
        setFullName(name)
        setCountryOfOrigin(guessCountryFromPhone(data.phone || user.phone || ''))
      })
  }, [user])

  function handlePhotoSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!ACCEPTED.includes(file.type)) { setError(isFr ? 'JPG, PNG ou WebP uniquement.' : 'JPG, PNG or WebP only.'); return }
    if (file.size > MAX_MB * 1024 * 1024) { setError(isFr ? `Photo max ${MAX_MB}MB.` : `Photo must be under ${MAX_MB}MB.`); return }
    setError(null)
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleSubmit() {
    if (!fullName.trim()) { setError(isFr ? 'Le nom est requis.' : 'Full name is required.'); return }
    setError(null)
    setLoading(true)

    try {
      const updates = {
        full_name:         fullName.trim(),
        email:             email.trim() || null,
        country_of_origin: countryOfOrigin || null,
      }

      // Upload photo if provided — mark as pending admin approval
      if (avatarFile) {
        setUploading(true)
        const ext  = avatarFile.name.split('.').pop().toLowerCase()
        const path = `${user.id}.${ext}`
        const { error: upErr } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true, contentType: avatarFile.type })
        if (upErr) throw upErr

        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
        updates.avatar_url      = publicUrl
        updates.photo_pending   = true   // waiting for admin approval
        updates.photo_verified  = false
        setUploading(false)
      }

      const { error: err } = await supabase.from('profiles').update(updates).eq('id', user.id)
      if (err) throw err

      await supabase.from('profiles').update({ onboarding_complete: true }).eq('id', user.id)
      onComplete()

    } catch (err) {
      setError(err.message)
      setUploading(false)
    } finally {
      setLoading(false)
    }
  }

  const inp = {
    width: '100%', padding: '14px 16px',
    border: '1.5px solid #E5E1DB', borderRadius: 12,
    fontSize: 15, fontFamily: "'DM Sans', sans-serif",
    color: '#1A1710', outline: 'none', boxSizing: 'border-box',
    background: '#fff', transition: 'border-color .15s',
  }
  const lbl = {
    display: 'block', fontSize: 12, fontWeight: 700,
    color: '#8A8070', textTransform: 'uppercase',
    letterSpacing: '.08em', marginBottom: 7,
  }

  const busy = loading || uploading
  const initials = fullName.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'

  return (
    <div style={{ minHeight: '100vh', background: '#FDFBF7', fontFamily: "'DM Sans', sans-serif", display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .ob-input:focus  { border-color: #C8891C !important; }
        .ob-btn:hover    { background: #B8780C !important; }
        .ob-photo:hover  { border-color: #C8891C !important; }
        @keyframes ob-spin { to { transform: rotate(360deg); } }
        .ob-spinner { width: 20px; height: 20px; border: 2.5px solid rgba(255,255,255,.35); border-top-color: #fff; border-radius: 50%; animation: ob-spin .7s linear infinite; display: inline-block; }
      `}</style>

      {/* Header */}
      <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: '#1A1710' }}>
          Yob<span style={{ color: '#C8891C' }}>bu</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, maxWidth: 480, width: '100%', margin: '0 auto', padding: '32px 24px 48px', boxSizing: 'border-box' }}>

        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: '#1A1710', letterSpacing: '-.5px', lineHeight: 1.2, marginBottom: 8 }}>
          {isFr ? 'Bienvenue sur Yobbu !' : 'Welcome to Yobbu!'}
        </h1>
        <p style={{ fontSize: 14, color: '#8A8070', lineHeight: 1.65, marginBottom: 32 }}>
          {isFr ? 'Quelques infos rapides pour démarrer.' : 'Just a few quick details to get started.'}
        </p>

        {/* Photo upload — centered, prominent */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
          <button
            className="ob-photo"
            type="button"
            onClick={() => fileRef.current?.click()}
            style={{
              width: 88, height: 88, borderRadius: '50%',
              border: `2.5px dashed ${avatarPreview ? '#C8891C' : '#D0C8C0'}`,
              background: avatarPreview ? 'transparent' : '#F7F4EF',
              cursor: 'pointer', overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'border-color .15s', padding: 0, marginBottom: 10,
              position: 'relative',
            }}
          >
            {avatarPreview
              ? <img src={avatarPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : (
                <div style={{ textAlign: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B0A090" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </div>
              )
            }
          </button>

          <div style={{ fontSize: 13, color: avatarPreview ? '#C8891C' : '#8A8070', fontWeight: avatarPreview ? 700 : 400, textAlign: 'center' }}>
            {avatarPreview
              ? (isFr ? 'Photo ajoutée ✓ — appuyer pour changer' : 'Photo added ✓ — tap to change')
              : (isFr ? 'Ajouter une photo (optionnel)' : 'Add a profile photo (optional)')}
          </div>

          {avatarPreview && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6, background: '#FFF8EB', border: '1px solid #F0D898', borderRadius: 20, padding: '4px 12px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C8891C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span style={{ fontSize: 11, color: '#7C4E0A', fontWeight: 600 }}>
                {isFr ? 'En attente d\'approbation admin' : 'Pending admin approval for badge'}
              </span>
            </div>
          )}

          <input ref={fileRef} type="file" accept={ACCEPTED.join(',')} style={{ display: 'none' }} onChange={handlePhotoSelect} />
        </div>

        {/* Full name */}
        <div style={{ marginBottom: 18 }}>
          <label style={lbl}>{isFr ? 'Nom complet *' : 'Full name *'}</label>
          <input
            className="ob-input" style={inp}
            placeholder={isFr ? 'ex: Aminata Diallo' : 'e.g. Aminata Diallo'}
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            autoComplete="name"
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: 18 }}>
          <label style={lbl}>{isFr ? 'Email (optionnel)' : 'Email (optional)'}</label>
          <input
            className="ob-input" style={inp}
            type="email" placeholder="you@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        {/* Country of origin */}
        <div style={{ marginBottom: 28 }}>
          <label style={lbl}>{isFr ? "Pays d'origine" : 'Country of origin'}</label>
          <div style={{ position: 'relative' }}>
            <select
              className="ob-input"
              style={{ ...inp, appearance: 'none', paddingRight: 40 }}
              value={countryOfOrigin}
              onChange={e => setCountryOfOrigin(e.target.value)}
            >
              <option value="">{isFr ? 'Choisir...' : 'Select...'}</option>
              {ORIGIN_COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
            </select>
            <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#8A8070' }}>▾</span>
          </div>
          {countryOfOrigin && (
            <div style={{ fontSize: 12, color: '#2D8B4E', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2D8B4E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              {isFr ? 'Détecté depuis votre numéro' : 'Detected from your phone number'}
            </div>
          )}
        </div>

        {/* Trust badges preview */}
        <div style={{ background: '#F7F4EF', borderRadius: 14, padding: '14px 16px', marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#8A8070', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>
            {isFr ? 'Vos badges' : 'Your badges'}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {/* Phone verified — always earned */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F0FAF4', border: '1px solid #C8E6D4', borderRadius: 20, padding: '5px 12px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2D8B4E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l1.81-1.81a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.01z"/></svg>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#2D8B4E' }}>{isFr ? 'Téléphone vérifié' : 'Phone verified'}</span>
            </div>
            {/* Photo badge — locked until admin approves */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: avatarPreview ? '#FFF8EB' : '#F0EDE8', border: `1px solid ${avatarPreview ? '#F0D898' : '#E0DAD0'}`, borderRadius: 20, padding: '5px 12px', opacity: avatarPreview ? 1 : 0.5 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={avatarPreview ? '#C8891C' : '#B0A090'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
              </svg>
              <span style={{ fontSize: 12, fontWeight: 700, color: avatarPreview ? '#C8891C' : '#B0A090' }}>
                {avatarPreview
                  ? (isFr ? 'Photo · en attente' : 'Photo · pending')
                  : (isFr ? 'Photo vérifiée' : 'Photo verified')}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#DC2626', marginBottom: 16 }}>
            {error}
          </div>
        )}

        <button
          className="ob-btn"
          disabled={busy}
          onClick={handleSubmit}
          style={{ width: '100%', padding: '16px', borderRadius: 14, border: 'none', background: '#C8891C', color: '#fff', fontSize: 16, fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", opacity: busy ? 0.7 : 1, transition: 'background .15s' }}
        >
          {busy ? <span className="ob-spinner" /> : (isFr ? "C'est parti →" : "Let's go →")}
        </button>

      </div>
    </div>
  )
}
