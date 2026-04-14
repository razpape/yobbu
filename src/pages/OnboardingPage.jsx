import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// ── Country data ──────────────────────────────────────────────────────────────
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

const RESIDENCE_COUNTRIES = [
  'United States', 'Canada', 'France', 'United Kingdom', 'Belgium',
  'Spain', 'Germany', 'Italy', 'Netherlands', 'Portugal', 'Switzerland',
  'Senegal', 'Guinea', "Côte d'Ivoire", 'Mali', 'Togo', 'Ghana',
  'Nigeria', 'Morocco', 'Cameroon', 'Other',
]

const COMMON_ROUTES = [
  { from: 'New York',      to: 'Dakar'   },
  { from: 'New York',      to: 'Conakry' },
  { from: 'New York',      to: 'Abidjan' },
  { from: 'New York',      to: 'Bamako'  },
  { from: 'Washington DC', to: 'Dakar'   },
  { from: 'Washington DC', to: 'Conakry' },
  { from: 'Atlanta',       to: 'Dakar'   },
  { from: 'Atlanta',       to: 'Abidjan' },
  { from: 'Houston',       to: 'Dakar'   },
  { from: 'Paris',         to: 'Dakar'   },
  { from: 'Paris',         to: 'Conakry' },
  { from: 'Paris',         to: 'Abidjan' },
  { from: 'Paris',         to: 'Bamako'  },
  { from: 'London',        to: 'Lagos'   },
  { from: 'London',        to: 'Accra'   },
  { from: 'Montreal',      to: 'Dakar'   },
  { from: 'Montreal',      to: 'Conakry' },
  { from: 'Brussels',      to: 'Dakar'   },
  { from: 'Brussels',      to: 'Kinshasa'},
]

// Guess country of origin from phone prefix
function guessCountryFromPhone(phone) {
  if (!phone) return ''
  // Try longest prefix first
  const prefixes = [...ORIGIN_COUNTRIES].sort((a, b) => b.prefix.length - a.prefix.length)
  for (const c of prefixes) {
    if (phone.startsWith(c.prefix)) return c.name
  }
  return ''
}

// ── Main component ────────────────────────────────────────────────────────────
export default function OnboardingPage({ user, lang, onComplete }) {
  const isFr = lang === 'fr'
  const [step, setStep]       = useState(1)  // 1 = profile, 2 = id verification
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  // Profile form
  const [form, setForm] = useState({
    fullName:        '',
    email:           '',
    countryOfOrigin: '',
    currentCity:     '',
    currentCountry:  '',
    destinations:    [],   // array of { from, to }
  })

  // ID verification
  const [govId,   setGovId]   = useState(null)
  const [selfie,  setSelfie]  = useState(null)
  const [uploading, setUploading] = useState(false)

  // Pre-fill from existing profile data
  useEffect(() => {
    if (!user?.id) return
    supabase.from('profiles').select('first_name, last_name, full_name, phone').eq('id', user.id).single()
      .then(({ data }) => {
        if (!data) return
        const name = data.full_name || [data.first_name, data.last_name].filter(Boolean).join(' ') || ''
        const guessed = guessCountryFromPhone(data.phone || user.phone || '')
        setForm(f => ({
          ...f,
          fullName: name,
          countryOfOrigin: guessed,
        }))
      })
  }, [user])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const toggleDestination = (route) => {
    const key = `${route.from}→${route.to}`
    setForm(f => {
      const exists = f.destinations.some(d => `${d.from}→${d.to}` === key)
      if (exists) return { ...f, destinations: f.destinations.filter(d => `${d.from}→${d.to}` !== key) }
      if (f.destinations.length >= 3) return f  // max 3
      return { ...f, destinations: [...f.destinations, route] }
    })
  }

  // ── Step 1: save profile ──────────────────────────────────────────────────
  const handleProfileSave = async () => {
    if (!form.fullName.trim()) { setError(isFr ? 'Le nom est requis.' : 'Full name is required.'); return }
    setError(null)
    setLoading(true)
    const { error: err } = await supabase.from('profiles').update({
      full_name:          form.fullName.trim(),
      email:              form.email.trim() || null,
      country_of_origin:  form.countryOfOrigin || null,
      current_city:       form.currentCity.trim() || null,
      current_country:    form.currentCountry,
      destinations:       form.destinations,
    }).eq('id', user.id)
    setLoading(false)
    if (err) { setError(err.message); return }
    setStep(2)
  }

  // ── Step 2: upload ID docs then complete ─────────────────────────────────
  const handleIdUpload = async (skip = false) => {
    setError(null)
    if (!skip && (govId || selfie)) {
      setUploading(true)
      try {
        const updates = {}
        if (govId) {
          const ext = govId.name.split('.').pop()
          const path = `${user.id}/gov-id.${ext}`
          const { error: upErr } = await supabase.storage.from('verifications').upload(path, govId, { upsert: true })
          if (upErr) throw upErr
          updates.gov_id_path = path
        }
        if (selfie) {
          const ext = selfie.name.split('.').pop()
          const path = `${user.id}/selfie.${ext}`
          const { error: upErr } = await supabase.storage.from('verifications').upload(path, selfie, { upsert: true })
          if (upErr) throw upErr
          updates.selfie_path = path
        }
        if (Object.keys(updates).length > 0) {
          updates.verification_pending = true
          await supabase.from('profiles').update(updates).eq('id', user.id)
        }
      } catch (err) {
        setError(err.message)
        setUploading(false)
        return
      }
      setUploading(false)
    }
    await finishOnboarding()
  }

  const finishOnboarding = async () => {
    setLoading(true)
    await supabase.from('profiles').update({ onboarding_complete: true }).eq('id', user.id)
    setLoading(false)
    onComplete()
  }

  // ── Shared styles ─────────────────────────────────────────────────────────
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
  const btn = {
    width: '100%', padding: '16px',
    borderRadius: 14, border: 'none',
    background: '#C8891C', color: '#fff',
    fontSize: 16, fontWeight: 700,
    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
    transition: 'background .15s',
    opacity: loading || uploading ? 0.7 : 1,
  }

  // ── Progress indicator ────────────────────────────────────────────────────
  const Progress = () => (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 32 }}>
      {[1, 2].map(n => (
        <div key={n} style={{
          height: 4, borderRadius: 4,
          width: n === step ? 28 : 16,
          background: n <= step ? '#C8891C' : '#E5E1DB',
          transition: 'all .3s',
        }} />
      ))}
    </div>
  )

  // ── Wrapper ───────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#FDFBF7', fontFamily: "'DM Sans', sans-serif", display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .ob-input:focus { border-color: #C8891C !important; }
        .ob-btn:hover { background: #B8780C !important; }
        .ob-route:hover { border-color: #C8891C !important; }
        .ob-skip:hover { color: #1A1710 !important; }
        @keyframes ob-spin { to { transform: rotate(360deg); } }
        .ob-spinner { width: 20px; height: 20px; border: 2.5px solid rgba(255,255,255,.35); border-top-color: #fff; border-radius: 50%; animation: ob-spin .7s linear infinite; display: inline-block; }
      `}</style>

      {/* Header */}
      <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: '#1A1710' }}>
          Yob<span style={{ color: '#C8891C' }}>bu</span>
        </div>
        <div style={{ fontSize: 12, color: '#B0A090', fontWeight: 500 }}>
          {isFr ? `Étape ${step} sur 2` : `Step ${step} of 2`}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, maxWidth: 480, width: '100%', margin: '0 auto', padding: '32px 24px 40px', boxSizing: 'border-box' }}>
        <Progress />

        {/* ── STEP 1: Profile ── */}
        {step === 1 && (
          <div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: '#1A1710', letterSpacing: '-.5px', lineHeight: 1.2, marginBottom: 8 }}>
              {isFr ? 'Dites-nous qui vous êtes' : "Tell us about yourself"}
            </h1>
            <p style={{ fontSize: 14, color: '#8A8070', lineHeight: 1.65, marginBottom: 28 }}>
              {isFr ? 'Ces informations aident les gens à vous faire confiance.' : "This helps people know who they're working with."}
            </p>

            {/* Full name */}
            <div style={{ marginBottom: 18 }}>
              <label style={lbl}>{isFr ? 'Nom complet *' : 'Full name *'}</label>
              <input
                className="ob-input"
                style={inp}
                placeholder={isFr ? 'ex: Aminata Diallo' : 'e.g. Aminata Diallo'}
                value={form.fullName}
                onChange={e => set('fullName', e.target.value)}
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: 18 }}>
              <label style={lbl}>{isFr ? 'Email (optionnel)' : 'Email (optional)'}</label>
              <input
                className="ob-input"
                style={inp}
                type="email"
                placeholder="you@email.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                autoComplete="email"
              />
            </div>

            {/* Country of origin */}
            <div style={{ marginBottom: 18 }}>
              <label style={lbl}>{isFr ? 'Pays d\'origine' : 'Country of origin'}</label>
              <div style={{ position: 'relative' }}>
                <select
                  className="ob-input"
                  style={{ ...inp, appearance: 'none', paddingRight: 40 }}
                  value={form.countryOfOrigin}
                  onChange={e => set('countryOfOrigin', e.target.value)}
                >
                  <option value="">{isFr ? 'Choisir...' : 'Select...'}</option>
                  {ORIGIN_COUNTRIES.map(c => (
                    <option key={c.code} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#8A8070' }}>▾</span>
              </div>
              {form.countryOfOrigin && (
                <div style={{ fontSize: 12, color: '#2D8B4E', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2D8B4E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  {isFr ? 'Détecté depuis votre numéro' : 'Detected from your phone number'}
                </div>
              )}
            </div>


            {/* Destinations */}
            <div style={{ marginBottom: 28 }}>
              <label style={lbl}>
                {isFr ? 'Routes fréquentes (optionnel, max 3)' : 'Frequent routes (optional, max 3)'}
              </label>
              <p style={{ fontSize: 13, color: '#8A8070', marginBottom: 12, lineHeight: 1.5 }}>
                {isFr ? 'Tapez sur les routes que vous faites souvent.' : 'Tap the routes you travel or ship on often.'}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {COMMON_ROUTES.map(route => {
                  const key = `${route.from}→${route.to}`
                  const selected = form.destinations.some(d => `${d.from}→${d.to}` === key)
                  const disabled = !selected && form.destinations.length >= 3
                  return (
                    <button
                      key={key}
                      className="ob-route"
                      type="button"
                      onClick={() => !disabled && toggleDestination(route)}
                      style={{
                        padding: '7px 12px',
                        borderRadius: 8,
                        border: `1.5px solid ${selected ? '#C8891C' : '#E5E1DB'}`,
                        background: selected ? '#FFF8EB' : '#fff',
                        color: selected ? '#7C4E0A' : disabled ? '#C0B8B0' : '#3D3829',
                        fontSize: 12, fontWeight: selected ? 700 : 500,
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        fontFamily: "'DM Sans', sans-serif",
                        transition: 'all .15s',
                        opacity: disabled ? 0.5 : 1,
                        display: 'flex', alignItems: 'center', gap: 5,
                      }}
                    >
                      {selected && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#C8891C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      )}
                      {route.from} → {route.to}
                    </button>
                  )
                })}
              </div>
              {form.destinations.length > 0 && (
                <div style={{ fontSize: 12, color: '#C8891C', fontWeight: 600, marginTop: 10 }}>
                  {form.destinations.length}/3 {isFr ? 'sélectionnées' : 'selected'}
                </div>
              )}
            </div>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#DC2626', marginBottom: 16 }}>
                {error}
              </div>
            )}

            <button className="ob-btn" style={btn} disabled={loading} onClick={handleProfileSave}>
              {loading
                ? <span className="ob-spinner" />
                : (isFr ? 'Continuer →' : 'Continue →')}
            </button>
          </div>
        )}

        {/* ── STEP 2: ID Verification ── */}
        {step === 2 && (
          <div>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: '#FFF8EB', border: '1.5px solid #F0D898', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#C8891C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <polyline points="9 12 11 14 15 10"/>
              </svg>
            </div>

            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: '#1A1710', letterSpacing: '-.5px', lineHeight: 1.2, marginBottom: 8 }}>
              {isFr ? 'Vérifiez votre identité' : 'Verify your identity'}
            </h1>
            <p style={{ fontSize: 14, color: '#8A8070', lineHeight: 1.65, marginBottom: 24 }}>
              {isFr
                ? 'Les membres vérifiés apparaissent en premier et gagnent la confiance des expéditeurs. Vous pouvez ignorer cela maintenant et le faire plus tard.'
                : 'Verified members rank higher and earn more trust from senders. You can skip this and do it later.'}
            </p>

            {/* Benefits */}
            <div style={{ background: '#F0FAF4', border: '1px solid #C8E6D4', borderRadius: 12, padding: '14px 16px', marginBottom: 24 }}>
              {[
                isFr ? 'Badge "Identité vérifiée" sur votre profil' : '"ID Verified" badge on your profile',
                isFr ? 'Classement plus élevé dans les résultats de recherche' : 'Ranked higher in search results',
                isFr ? 'Plus de confiance de la part des expéditeurs' : 'More trust from senders',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: i < 2 ? 10 : 0 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#D1F0DC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2D8B4E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span style={{ fontSize: 13, color: '#1A5C38', fontWeight: 500 }}>{item}</span>
                </div>
              ))}
            </div>

            {/* Gov ID upload */}
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>{isFr ? 'Pièce d\'identité officielle' : 'Government ID'}</label>
              <label style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 8, padding: '20px',
                border: `2px dashed ${govId ? '#C8891C' : '#E5E1DB'}`,
                borderRadius: 12, cursor: 'pointer',
                background: govId ? '#FFF8EB' : '#FAFAF8',
                transition: 'all .15s',
              }}>
                <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => setGovId(e.target.files[0])} />
                {govId ? (
                  <>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C8891C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#7C4E0A' }}>{govId.name}</span>
                  </>
                ) : (
                  <>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B0A090" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
                    </svg>
                    <span style={{ fontSize: 13, color: '#8A8070' }}>
                      {isFr ? 'Passeport, CNI ou permis de conduire' : 'Passport, national ID or driver\'s license'}
                    </span>
                    <span style={{ fontSize: 12, color: '#B0A090' }}>
                      {isFr ? 'Appuyer pour choisir un fichier' : 'Tap to choose a file'}
                    </span>
                  </>
                )}
              </label>
            </div>

            {/* Selfie upload */}
            <div style={{ marginBottom: 28 }}>
              <label style={lbl}>{isFr ? 'Selfie (photo de vous)' : 'Selfie (photo of you)'}</label>
              <label style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 8, padding: '20px',
                border: `2px dashed ${selfie ? '#C8891C' : '#E5E1DB'}`,
                borderRadius: 12, cursor: 'pointer',
                background: selfie ? '#FFF8EB' : '#FAFAF8',
                transition: 'all .15s',
              }}>
                <input type="file" accept="image/*" capture="user" style={{ display: 'none' }} onChange={e => setSelfie(e.target.files[0])} />
                {selfie ? (
                  <>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C8891C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#7C4E0A' }}>{selfie.name}</span>
                  </>
                ) : (
                  <>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B0A090" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span style={{ fontSize: 13, color: '#8A8070' }}>
                      {isFr ? 'Photo de votre visage clairement visible' : 'Clear photo of your face'}
                    </span>
                    <span style={{ fontSize: 12, color: '#B0A090' }}>
                      {isFr ? 'Appuyer pour prendre ou choisir' : 'Tap to take or choose'}
                    </span>
                  </>
                )}
              </label>
            </div>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#DC2626', marginBottom: 16 }}>
                {error}
              </div>
            )}

            {/* Submit */}
            {(govId || selfie) && (
              <button className="ob-btn" style={{ ...btn, marginBottom: 12 }} disabled={uploading || loading} onClick={() => handleIdUpload(false)}>
                {uploading || loading
                  ? <span className="ob-spinner" />
                  : (isFr ? 'Soumettre pour vérification →' : 'Submit for verification →')}
              </button>
            )}

            {/* Skip */}
            <button
              className="ob-skip"
              onClick={() => handleIdUpload(true)}
              disabled={loading}
              style={{
                width: '100%', padding: '14px',
                borderRadius: 14, border: '1.5px solid #E5E1DB',
                background: 'transparent', color: '#8A8070',
                fontSize: 15, fontWeight: 600,
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                transition: 'color .15s',
              }}
            >
              {loading
                ? <span style={{ ...{}, filter: 'brightness(0)' }}><span className="ob-spinner" style={{ borderColor: 'rgba(0,0,0,.15)', borderTopColor: '#8A8070' }} /></span>
                : (isFr ? 'Ignorer pour l\'instant' : 'Skip for now')}
            </button>

            <p style={{ textAlign: 'center', fontSize: 12, color: '#B0A090', marginTop: 14, lineHeight: 1.6 }}>
              {isFr
                ? 'Vos documents sont stockés de façon sécurisée et ne sont jamais partagés.'
                : 'Your documents are stored securely and never shared publicly.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
