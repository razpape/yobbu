import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { CITIES } from '../utils/constants'
import { PackageIcon, PlaneIcon } from '../components/Icons'

// Force fresh build

export default function SendPackagePage({ lang, setView }) {
  const isFr = lang === 'fr'
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    sender_name: '',
    sender_phone: '',
    from_city: '',
    to_city: '',
    weight: '',
    description: '',
    deadline: '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!form.sender_name || !form.sender_phone || !form.from_city || !form.to_city || !form.weight) {
      setError(isFr ? 'Veuillez remplir tous les champs obligatoires' : 'Please fill all required fields')
      setLoading(false)
      return
    }

    if (form.sender_phone.replace(/\D/g, '').length < 9) {
      setError(isFr ? 'Numéro invalide' : 'Invalid phone number')
      setLoading(false)
      return
    }

    try {
      const { error: err } = await supabase.from('package_requests').insert({
        sender_name:   form.sender_name,
        sender_phone:  form.sender_phone,
        from_city:     form.from_city,
        to_city:       form.to_city,
        weight:        parseFloat(form.weight) || null,
        description:   form.description || null,
        deadline:      form.deadline || null,
        status:        'open',
        created_at:    new Date().toISOString(),
      })
      if (err) throw err
      setStep(2)
    } catch (err) {
      setError(err.message || (isFr ? 'Erreur' : 'Error'))
      console.error('[SendPackage]', err)
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px',
    border: '1.5px solid #E5E1DB', borderRadius: 10,
    fontSize: 14, fontFamily: "'DM Sans', sans-serif",
    color: '#1F2937', outline: 'none', boxSizing: 'border-box',
    background: '#fff', transition: 'border-color .15s',
  }
  const labelStyle = {
    display: 'block', fontSize: 11, fontWeight: 700,
    color: '#6B7280', textTransform: 'uppercase',
    letterSpacing: '.08em', marginBottom: 6,
  }

  if (step === 2) {
    return (
      <div style={{ minHeight: '100vh', background: '#FDFBF7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif", padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#F0FAF4', border: '2px solid #C8E6D4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2D8B4E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: '#1F2937', marginBottom: 10 }}>
            {isFr ? 'Demande envoyée !' : 'Request posted!'}
          </div>
          <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7, marginBottom: 28 }}>
            {isFr
              ? `Votre demande pour ${form.from_city} → ${form.to_city} est en ligne. Les GPs vérifiés vous contacteront bientôt sur WhatsApp.`
              : `Your request for ${form.from_city} → ${form.to_city} is live. Verified GPs will reach out to you on WhatsApp.`}
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button
              onClick={() => { setStep(1); setForm({ sender_name:'', sender_phone:'', from_city:'', to_city:'', weight:'', description:'', deadline:'' }) }}
              style={{ padding: '11px 24px', borderRadius: 10, border: '1.5px solid #E5E1DB', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", color: '#1F2937' }}
            >
              {isFr ? 'Nouvelle demande' : 'Post another'}
            </button>
            <button
              onClick={() => setView('home')}
              style={{ padding: '11px 24px', borderRadius: 10, border: 'none', background: '#10B981', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
            >
              {isFr ? 'Accueil' : 'Home'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 24px 80px' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#D1F4E7', border: '1px solid #F0D898', borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 600, color: '#7C4E0A', marginBottom: 16 }}>
          <PackageIcon size={13} color="#10B981" />
          {isFr ? 'Envoyer un colis' : 'Send a package'}
        </div>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: '#1F2937', letterSpacing: '-.5px', lineHeight: 1.15, marginBottom: 10 }}>
          {isFr ? 'Décrivez votre colis' : 'Describe your package'}
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.65 }}>
          {isFr
            ? 'Postez votre demande et les GPs sur votre route vous contacteront directement sur WhatsApp.'
            : 'Post your request and GPs on your route will contact you directly on WhatsApp.'}
        </p>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: 12, borderRadius: 10, marginBottom: 20, fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ background: '#fff', border: '1.5px solid #EDEAE4', borderRadius: 14, padding: '20px', marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#1F2937', marginBottom: 16 }}>
            {isFr ? 'Vos informations' : 'Your information'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>{isFr ? 'Nom' : 'Name'} *</label>
              <input
                required
                type="text"
                value={form.sender_name}
                onChange={e => set('sender_name', e.target.value)}
                placeholder={isFr ? 'Votre nom' : 'Your name'}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>{isFr ? 'WhatsApp' : 'WhatsApp'} *</label>
              <input
                required
                type="tel"
                value={form.sender_phone}
                onChange={e => set('sender_phone', e.target.value)}
                placeholder="+221 77 123 45 67"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Privacy info box */}
        <div style={{ display: 'flex', gap: 10, background: '#F0FAF4', border: '1px solid #C8E6D4', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2D8B4E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span style={{ fontSize: 12, color: '#2D6B46', lineHeight: 1.55 }}>
            {isFr
              ? 'Votre numéro WhatsApp sera partagé avec les GPs vérifiés intéressés. Jamais publiquement.'
              : 'Your WhatsApp will be shared only with verified GPs who express interest. Never publicly.'}
          </span>
        </div>

        <div style={{ background: '#fff', border: '1.5px solid #EDEAE4', borderRadius: 14, padding: '20px', marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#1F2937', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
            <PlaneIcon size={14} color="#10B981" />
            {isFr ? 'Route' : 'Route'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>{isFr ? 'Départ' : 'From'}</label>
              <div style={{ position: 'relative' }}>
                <select required value={form.from_city} onChange={e => set('from_city', e.target.value)} style={{ ...inputStyle, appearance: 'none', paddingRight: 32 }}>
                  <option value="">{isFr ? 'Choisir...' : 'Select...'}</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#6B7280', fontSize: 11 }}>▾</span>
              </div>
            </div>
            <div>
              <label style={labelStyle}>{isFr ? 'Destination' : 'To'}</label>
              <div style={{ position: 'relative' }}>
                <select required value={form.to_city} onChange={e => set('to_city', e.target.value)} style={{ ...inputStyle, appearance: 'none', paddingRight: 32 }}>
                  <option value="">{isFr ? 'Choisir...' : 'Select...'}</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#6B7280', fontSize: 11 }}>▾</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1.5px solid #EDEAE4', borderRadius: 14, padding: '20px', marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#1F2937', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
            <PackageIcon size={14} color="#10B981" />
            {isFr ? 'Détails du colis' : 'Package details'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={labelStyle}>{isFr ? 'Poids (kg)' : 'Weight (kg)'}</label>
              <input
                required
                type="number"
                min="0.1"
                step="0.1"
                value={form.weight}
                onChange={e => set('weight', e.target.value)}
                placeholder={isFr ? 'ex: 5' : 'e.g. 5'}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>{isFr ? 'Budget max ($/kg)' : 'Max budget ($/kg)'}</label>
              <input
                type="number"
                min="1"
                step="1"
                value={form.budget}
                onChange={e => set('budget', e.target.value)}
                placeholder={isFr ? 'ex: 15' : 'e.g. 15'}
                style={inputStyle}
              />
            </div>
          </div>
          <div>
            <label style={labelStyle}>{isFr ? 'Description du colis (optionnel)' : 'Description (optional)'}</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder={isFr ? 'Ex: vêtements, médicaments, documents, électronique...' : 'e.g. clothing, medicine, documents, electronics...'}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
            />
          </div>
        </div>

        <div style={{ background: '#fff', border: '1.5px solid #EDEAE4', borderRadius: 14, padding: '20px', marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#1F2937', marginBottom: 16 }}>
            {isFr ? 'Avant le (optionnel)' : 'Needed by (optional)'}
          </div>
          <div>
            <label style={labelStyle}>{isFr ? 'Date' : 'Date'}</label>
            <input
              type="date"
              value={form.deadline}
              onChange={e => set('deadline', e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, background: '#F0FAF4', border: '1px solid #C8E6D4', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
          <span style={{ fontSize: 12, color: '#2D6B46', lineHeight: 1.55 }}>
            {isFr
              ? 'Votre numéro WhatsApp sera partagé avec les voyageurs vérifiés intéressés. Jamais publiquement.'
              : 'Your WhatsApp will be shared only with verified travelers who express interest. Never publicly.'}
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: loading ? '#E5D5B0' : '#10B981', color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'background .15s' }}
        >
          {loading ? (isFr ? 'Envoi...' : 'Posting...') : (isFr ? 'Publier ma demande' : 'Post my request')}
        </button>
      </form>
    </div>
  )
}
