import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { Package, Smartphone, ArrowLeft, CheckCircle, Plane, Users } from 'lucide-react'
import PhoneInput from '../components/auth/PhoneInput'
import OTPInput from '../components/auth/OTPInput'

const inputStyle = {
  width: '100%', padding: '13px 14px',
  border: '2px solid #E0DAD0', borderRadius: 12,
  fontSize: 15, outline: 'none', boxSizing: 'border-box',
  fontFamily: "'DM Sans', sans-serif",
  transition: 'border-color .2s', background: '#fff',
}

function ProfileStep({ isFr, phone, onComplete }) {
  const [sub, setSub]           = useState(1) // 1=name/role, 2=whatsapp, 3=terms
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName]   = useState('')
  const [role, setRole]           = useState('')
  const [whatsapp, setWhatsapp]   = useState(phone || '')
  const [termsAccepted, setTerms] = useState(false)

  const roles = [
    {
      id: 'traveler',
      icon: <Plane size={20} color={role === 'traveler' ? '#52B5D9' : '#8A8070'} />,
      title: isFr ? 'Je voyage avec de la place' : 'I travel with space to spare',
      desc: isFr ? 'Je transporte des colis quand je voyage.' : 'I carry packages when I travel.',
    },
    {
      id: 'both',
      icon: <Users size={20} color={role === 'both' ? '#52B5D9' : '#8A8070'} />,
      title: isFr ? 'Les deux' : 'Both',
      desc: isFr ? 'J\'envoie et je transporte selon les occasions.' : 'I do both depending on the situation.',
    },
  ]

  const label = (text) => (
    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#3D3829', marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>
      {text}
    </label>
  )

  const continueBtn = (onClick, disabled, text) => (
    <button onClick={onClick} disabled={disabled} style={{
      width: '100%', padding: '15px 24px',
      background: !disabled ? '#52B5D9' : '#E0DAD0',
      color: !disabled ? '#fff' : '#A09080',
      border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 600,
      cursor: !disabled ? 'pointer' : 'not-allowed',
      fontFamily: "'DM Sans', sans-serif", transition: 'all .2s',
    }}>
      {text}
    </button>
  )

  const subBack = () => setSub(s => s - 1)

  // Sub-step progress dots
  const dots = (
    <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
      {[1,2,3].map(n => (
        <div key={n} style={{
          height: 4, flex: 1, borderRadius: 2,
          background: n <= sub ? '#52B5D9' : '#E0DAD0',
          transition: 'background .2s',
        }} />
      ))}
    </div>
  )

  // ── Sub-step 1: Name + Role ──
  if (sub === 1) return (
    <div style={{ padding: '32px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
      {dots}
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1A1710', marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>
        {isFr ? 'Bienvenue ! Présentez-vous.' : 'Welcome! Tell us about yourself.'}
      </h2>
      <p style={{ fontSize: 14, color: '#8A8070', marginBottom: 24, fontFamily: "'DM Sans', sans-serif" }}>
        {isFr ? 'Étape 1 sur 3' : 'Step 1 of 3'}
      </p>

      <div style={{ marginBottom: 14 }}>
        {label(isFr ? 'Prénom *' : 'First name *')}
        <input
          type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
          placeholder={isFr ? 'Ex: Aminata' : 'e.g. Aminata'}
          style={inputStyle}
          onFocus={e => e.target.style.borderColor = '#52B5D9'}
          onBlur={e => e.target.style.borderColor = '#E0DAD0'}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        {label(isFr ? 'Nom (optionnel)' : 'Last name (optional)')}
        <input
          type="text" value={lastName} onChange={e => setLastName(e.target.value)}
          placeholder={isFr ? 'Ex: Diallo' : 'e.g. Diallo'}
          style={inputStyle}
          onFocus={e => e.target.style.borderColor = '#52B5D9'}
          onBlur={e => e.target.style.borderColor = '#E0DAD0'}
        />
      </div>

      <p style={{ fontSize: 13, fontWeight: 700, color: '#3D3829', marginBottom: 10, fontFamily: "'DM Sans', sans-serif" }}>
        {isFr ? 'Je souhaite :' : 'I am here to:'}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {roles.map(opt => (
          <button key={opt.id} onClick={() => setRole(opt.id)} style={{
            display: 'flex', alignItems: 'flex-start', gap: 14,
            padding: '14px 16px', textAlign: 'left',
            border: `2px solid ${role === opt.id ? '#52B5D9' : '#E0DAD0'}`,
            borderRadius: 14,
            background: role === opt.id ? '#FDF6ED' : '#fff',
            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            transition: 'all .15s',
          }}>
            <div style={{ marginTop: 2, flexShrink: 0 }}>{opt.icon}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1710', marginBottom: 2 }}>{opt.title}</div>
              <div style={{ fontSize: 12, color: '#8A8070', lineHeight: 1.4 }}>{opt.desc}</div>
            </div>
            {role === opt.id && (
              <div style={{ marginLeft: 'auto', marginTop: 2, flexShrink: 0 }}>
                <CheckCircle size={18} color="#52B5D9" />
              </div>
            )}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 'auto' }}>
        {continueBtn(() => setSub(2), !firstName.trim() || !role, isFr ? 'Continuer →' : 'Continue →')}
      </div>
    </div>
  )

  // ── Sub-step 2: WhatsApp number ──
  if (sub === 2) return (
    <div style={{ padding: '32px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
      {dots}
      <button onClick={subBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6, color: '#8A8070', fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
        <ArrowLeft size={16} /> {isFr ? 'Retour' : 'Back'}
      </button>

      <div style={{ width: 52, height: 52, background: '#F0FDF4', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1A1710', marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>
        {isFr ? 'Votre numéro WhatsApp' : 'Your WhatsApp number'}
      </h2>
      <p style={{ fontSize: 14, color: '#8A8070', marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>
        {isFr ? 'Étape 2 sur 3' : 'Step 2 of 3'}
      </p>
      <p style={{ fontSize: 13, color: '#8A8070', marginBottom: 24, lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>
        {isFr
          ? 'Les expéditeurs et GPs vous contacteront via WhatsApp. Pré-rempli avec votre numéro de connexion — changez-le si nécessaire.'
          : 'Senders and GPs will contact you via WhatsApp. Pre-filled with your sign-in number — change it if needed.'}
      </p>

      <div style={{ marginBottom: 24 }}>
        {label(isFr ? 'Numéro WhatsApp' : 'WhatsApp number')}
        <input
          type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
          placeholder="+1 555 000 0000"
          style={inputStyle}
          onFocus={e => e.target.style.borderColor = '#25D366'}
          onBlur={e => e.target.style.borderColor = '#E0DAD0'}
        />
        <p style={{ fontSize: 12, color: '#8A8070', marginTop: 6, fontFamily: "'DM Sans', sans-serif" }}>
          {isFr ? 'Format international : +33 6 12 34 56 78' : 'International format: +1 555 000 0000'}
        </p>
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {continueBtn(() => setSub(3), !whatsapp.trim(), isFr ? 'Continuer →' : 'Continue →')}
        <button onClick={() => { setWhatsapp(''); setSub(3) }} style={{
          background: 'none', border: 'none', color: '#8A8070', fontSize: 13,
          cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", padding: '8px',
        }}>
          {isFr ? "Je n'ai pas WhatsApp — passer" : "I don't use WhatsApp — skip"}
        </button>
      </div>
    </div>
  )

  // ── Sub-step 3: Terms ──
  return (
    <div style={{ padding: '32px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
      {dots}
      <button onClick={subBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6, color: '#8A8070', fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
        <ArrowLeft size={16} /> {isFr ? 'Retour' : 'Back'}
      </button>

      <div style={{ width: 52, height: 52, background: '#D4E8F4', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#52B5D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1A1710', marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>
        {isFr ? 'Presque prêt !' : 'Almost done!'}
      </h2>
      <p style={{ fontSize: 14, color: '#8A8070', marginBottom: 24, fontFamily: "'DM Sans', sans-serif" }}>
        {isFr ? 'Étape 3 sur 3' : 'Step 3 of 3'}
      </p>

      {/* Summary card */}
      <div style={{ background: '#F9F7F3', borderRadius: 14, padding: '16px 18px', marginBottom: 24, border: '1px solid #E8E0D4' }}>
        <div style={{ fontSize: 13, color: '#8A8070', marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>
          {isFr ? 'Résumé de votre compte' : 'Your account summary'}
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1710', fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>
          {firstName} {lastName}
        </div>
        <div style={{ fontSize: 13, color: '#8A8070', fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>
          {roles.find(r => r.id === role)?.title}
        </div>
        {whatsapp && (
          <div style={{ fontSize: 13, color: '#25D366', fontFamily: "'DM Sans', sans-serif" }}>
            WhatsApp: {whatsapp}
          </div>
        )}
      </div>

      {/* Terms checkbox */}
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', marginBottom: 24, padding: '14px 16px', border: `2px solid ${termsAccepted ? '#52B5D9' : '#E0DAD0'}`, borderRadius: 14, background: termsAccepted ? '#FDF6ED' : '#fff', transition: 'all .15s' }}>
        <input
          type="checkbox" checked={termsAccepted} onChange={e => setTerms(e.target.checked)}
          style={{ width: 18, height: 18, accentColor: '#52B5D9', flexShrink: 0, marginTop: 2 }}
        />
        <span style={{ fontSize: 13, color: '#3D3829', lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>
          {isFr
            ? <>J'ai lu et j'accepte les <strong style={{ color: '#52B5D9' }}>Conditions d'utilisation</strong> et la <strong style={{ color: '#52B5D9' }}>Politique de confidentialité</strong> de Yobbu.</>
            : <>I have read and agree to Yobbu's <strong style={{ color: '#52B5D9' }}>Terms of Service</strong> and <strong style={{ color: '#52B5D9' }}>Privacy Policy</strong>.</>}
        </span>
      </label>

      <div style={{ background: '#F0FDF4', borderRadius: 12, padding: '12px 14px', marginBottom: 24, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span style={{ fontSize: 12, color: '#16a34a', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>
          {isFr
            ? 'Votre numéro de téléphone est vérifié. Yobbu ne partage jamais vos données sans votre consentement.'
            : 'Your phone number is verified. Yobbu never shares your data without your consent.'}
        </span>
      </div>

      <div style={{ marginTop: 'auto' }}>
        {continueBtn(
          () => onComplete({ firstName: firstName.trim(), lastName: lastName.trim(), role, whatsapp: whatsapp.trim(), termsAcceptedAt: new Date().toISOString() }),
          !termsAccepted,
          isFr ? 'Créer mon compte' : 'Create my account'
        )}
      </div>
    </div>
  )
}

const STEPS = {
  WELCOME:  'welcome',
  PHONE:    'phone',
  OTP:      'otp',
  PROFILE:  'profile',
  COMPLETE: 'complete',
}

const STEP_ORDER = [STEPS.WELCOME, STEPS.PHONE, STEPS.OTP, STEPS.PROFILE, STEPS.COMPLETE]

export default function PhoneAuth({ lang = 'en', onComplete }) {
  const isFr = lang === 'fr'
  const [step, setStep] = useState(STEPS.WELCOME)
  const [phone, setPhone] = useState('')
  const [phoneValid, setPhoneValid] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [user, setUser] = useState(null)
  const [otpKey, setOtpKey] = useState(0)
  const otpSubmitting = useRef(false)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const progressPct = () => {
    const idx = STEP_ORDER.indexOf(step)
    return Math.round(((idx + 1) / STEP_ORDER.length) * 100)
  }

  const handlePhoneSubmit = async () => {
    if (!phoneValid) return
    setLoading(true)
    setError('')
    setOtpCode('')
    setOtpKey(k => k + 1)

    try {
      const res = await fetch('/api/send-phone-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })

      const text = await res.text()
      let data
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error(isFr ? 'Erreur serveur. Reessayez.' : 'Server error. Please try again.')
      }

      if (!res.ok) {
        throw new Error(data.error || (isFr ? "Erreur lors de l'envoi" : 'Failed to send code'))
      }

      setCountdown(60)
      setStep(STEPS.OTP)
    } catch (err) {
      setError(err.message || (isFr ? "Erreur lors de l'envoi" : 'Error sending code'))
    } finally {
      setLoading(false)
    }
  }

  const handleOtpComplete = async (code) => {
    if (otpSubmitting.current) return   // prevent double-fire
    otpSubmitting.current = true
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/verify-phone-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      })

      const text = await res.text()
      let data
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error(isFr ? 'Erreur serveur. Reessayez.' : 'Server error. Please try again.')
      }

      if (!res.ok) {
        throw new Error(data.error || (isFr ? 'Code incorrect' : 'Invalid code'))
      }

      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        })
      }

      setUser(data.user)
      setStep(STEPS.COMPLETE)
      setTimeout(() => onComplete?.(data.user), 800)
    } catch (err) {
      setError(err.message || (isFr ? 'Code incorrect' : 'Invalid code'))
      setOtpCode('')
      setOtpKey(k => k + 1)
    } finally {
      setLoading(false)
      otpSubmitting.current = false
    }
  }

  const handleProfileComplete = async (profileData) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert([{
          id: user.id,
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          role: profileData.role,
          whatsapp_number: profileData.whatsapp || null,
          terms_accepted_at: profileData.termsAcceptedAt || null,
        }])

      if (error) throw error

      // Refresh session so useAuth re-fetches the updated profile
      await supabase.auth.refreshSession()

      setStep(STEPS.COMPLETE)
      setTimeout(() => onComplete?.(user), 1200)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // --- Render helpers ---

  const backButton = (target) => (
    <button
      onClick={() => { setStep(target); setError('') }}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 10, color: '#3D3829', transition: 'background .15s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = '#F5F1EC'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <ArrowLeft size={20} />
    </button>
  )

  const errorBox = () => error && (
    <div style={{
      marginBottom: 16, padding: '11px 14px',
      background: '#FEF2F2', borderRadius: 10,
      border: '1px solid #FECACA', color: '#DC2626',
      fontSize: 13, fontWeight: 500,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {error}
    </div>
  )

  const renderWelcome = () => (
    <div style={{
      textAlign: 'center', padding: '48px 28px 32px',
      flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
    }}>
      <div style={{
        width: 80, height: 80,
        background: 'linear-gradient(135deg, #52B5D9 0%, #A07015 100%)',
        borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 28px',
        boxShadow: '0 6px 24px rgba(200, 137, 28, 0.25)',
      }}>
        <Package size={38} color="#fff" strokeWidth={1.5} />
      </div>

      <h1 style={{
        fontSize: 30, fontWeight: 800, color: '#1A1710', marginBottom: 12,
        fontFamily: "'DM Serif Display', serif", letterSpacing: '-0.3px',
      }}>
        Yobbu
      </h1>

      <p style={{
        fontSize: 15, color: '#6B6860', lineHeight: 1.6,
        maxWidth: 300, margin: '0 auto 40px',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {isFr
          ? 'Envoyez des colis avec des voyageurs qui vont dans votre direction'
          : 'Send packages with travelers going your way'}
      </p>

      <button
        onClick={() => setStep(STEPS.PHONE)}
        style={{
          width: '100%', padding: '16px 24px',
          background: '#52B5D9', color: '#fff',
          border: 'none', borderRadius: 14,
          fontSize: 16, fontWeight: 600, cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif",
          boxShadow: '0 4px 16px rgba(200, 137, 28, 0.25)',
          transition: 'transform .15s, box-shadow .15s',
          marginBottom: 12,
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(200, 137, 28, 0.3)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(200, 137, 28, 0.25)' }}
      >
        {isFr ? 'Continuer avec mon numero' : 'Continue with my number'}
      </button>

      <button
        onClick={() => onComplete?.(null, 'browse')}
        style={{
          width: '100%', padding: '14px 24px',
          background: 'transparent', color: '#6B6860',
          border: '1.5px solid #E0DAD0', borderRadius: 14,
          fontSize: 15, fontWeight: 500, cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif",
          marginBottom: 28,
          transition: 'border-color .15s',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#52B5D980'}
        onMouseLeave={e => e.currentTarget.style.borderColor = '#E0DAD0'}
      >
        {isFr ? "Parcourir d'abord" : 'Browse First'}
      </button>

      <div style={{ marginTop: 'auto' }}>
        <p style={{ fontSize: 13, color: '#8A8070', fontFamily: "'DM Sans', sans-serif" }}>
          {isFr ? 'Deja un compte ? ' : 'Already have an account? '}
          <button
            onClick={() => setStep(STEPS.PHONE)}
            style={{
              color: '#52B5D9', background: 'none', border: 'none',
              cursor: 'pointer', fontWeight: 600, fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {isFr ? 'Se connecter' : 'Log In'}
          </button>
        </p>
        <p style={{
          marginTop: 12, fontSize: 11, color: '#B0A898',
          maxWidth: 260, margin: '12px auto 0',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {isFr
            ? 'En continuant, vous acceptez nos Conditions et notre Politique de confidentialite'
            : 'By continuing, you agree to our Terms and Privacy Policy'}
        </p>
      </div>
    </div>
  )

  const renderPhone = () => (
    <div style={{
      padding: '32px 28px', flex: 1,
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ marginBottom: 28 }}>{backButton(STEPS.WELCOME)}</div>

      <h2 style={{
        fontSize: 24, fontWeight: 700, color: '#1A1710', marginBottom: 8,
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {isFr ? 'Quel est votre numero ?' : "What's your number?"}
      </h2>
      <p style={{
        fontSize: 14, color: '#6B6860', marginBottom: 32, lineHeight: 1.5,
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {isFr ? 'Nous vous enverrons un code de verification par SMS.' : "We'll send you a verification code via SMS."}
      </p>

      <div style={{ marginBottom: 24 }}>
        <PhoneInput value={phone} onChange={setPhone} onValid={setPhoneValid} lang={lang} />
      </div>

      {errorBox()}

      <div style={{ marginTop: 'auto', paddingTop: 20 }}>
        <button
          onClick={handlePhoneSubmit}
          disabled={!phoneValid || loading}
          style={{
            width: '100%', padding: '16px 24px',
            background: phoneValid && !loading ? '#52B5D9' : '#E0DAD0',
            color: phoneValid && !loading ? '#fff' : '#A09080',
            border: 'none', borderRadius: 14,
            fontSize: 16, fontWeight: 600,
            cursor: phoneValid && !loading ? 'pointer' : 'not-allowed',
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: phoneValid && !loading ? '0 4px 16px rgba(82, 181, 217, 0.25)' : 'none',
            transition: 'all .2s',
          }}
        >
          {loading
            ? (isFr ? 'Envoi en cours...' : 'Sending...')
            : (isFr ? 'Continuer' : 'Continue')
          }
        </button>

        <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: '1px', background: '#E0DAD0' }} />
          <span style={{ fontSize: 13, color: '#A09080', fontFamily: "'DM Sans', sans-serif" }}>
            {isFr ? 'ou' : 'or'}
          </span>
          <div style={{ flex: 1, height: '1px', background: '#E0DAD0' }} />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            style={{
              flex: 1, padding: '12px 16px',
              background: '#fff', border: '1.5px solid #E0DAD0',
              borderRadius: 12, fontSize: 14, fontWeight: 500,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              color: '#1A1710', transition: 'all .2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F9F7F5'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            title="Google Sign In"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <g clipPath="url(#clip0)">
                <path d="M23.745 12.27c0-.79-.1-1.54-.257-2.27H12v4.51h6.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 24c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 24 12 24z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 4.47 2.18 9.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </g>
            </svg>
            Google
          </button>
          <button
            style={{
              flex: 1, padding: '12px 16px',
              background: '#fff', border: '1.5px solid #E0DAD0',
              borderRadius: 12, fontSize: 14, fontWeight: 500,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              color: '#1A1710', transition: 'all .2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F9F7F5'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            title="Apple Sign In"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 13.5c-.91 2.18-2.15 4.06-4.11 4.06-2.13 0-2.8-1.28-5.21-1.28-2.48 0-3.32 1.28-5.22 1.28-1.97 0-3.31-1.97-4.36-4.06C1.07 10.13 1 8.9 1 7.62 1 3.55 4.55 0 8.65 0c1.55 0 2.93.75 3.82 1.64.59.55 1.13 1.18 1.53 1.71.4-.53.94-1.16 1.53-1.71C14.42.75 15.8 0 17.35 0 21.45 0 25 3.55 25 7.62c0 1.28-.07 2.51-.95 5.88z"/>
            </svg>
            Apple
          </button>
        </div>
      </div>
    </div>
  )

  const renderOtp = () => (
    <div style={{
      padding: '32px 28px', flex: 1,
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ marginBottom: 28 }}>{backButton(STEPS.PHONE)}</div>

      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{
          width: 56, height: 56,
          background: '#FDF6ED', borderRadius: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <Smartphone size={28} color="#52B5D9" />
        </div>

        <h2 style={{
          fontSize: 22, fontWeight: 700, color: '#1A1710', marginBottom: 8,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {isFr ? 'Entrez le code' : 'Enter the code'}
        </h2>
        <p style={{ fontSize: 14, color: '#6B6860', fontFamily: "'DM Sans', sans-serif" }}>
          {isFr ? `Code envoye a ${phone}` : `Code sent to ${phone}`}
        </p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <OTPInput
          key={otpKey}
          length={6}
          onComplete={handleOtpComplete}
          onChange={setOtpCode}
          lang={lang}
        />
      </div>

      {errorBox()}

      {loading && (
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            width: 22, height: 22,
            border: '3px solid #E0DAD0', borderTopColor: '#52B5D9',
            borderRadius: '50%', animation: 'auth-spin 1s linear infinite',
            margin: '0 auto 8px',
          }} />
          <p style={{ color: '#6B6860', fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
            {isFr ? 'Verification en cours...' : 'Verifying...'}
          </p>
        </div>
      )}

      <div style={{ marginTop: 'auto', textAlign: 'center', paddingTop: 20 }}>
        {countdown > 0 ? (
          <p style={{ color: '#8A8070', fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
            {isFr ? 'Renvoyer dans' : 'Resend in'}{' '}
            <span style={{ fontWeight: 700, color: '#52B5D9' }}>{countdown}s</span>
          </p>
        ) : (
          <button
            onClick={handlePhoneSubmit}
            style={{
              background: 'none', border: 'none', color: '#52B5D9',
              fontWeight: 600, fontSize: 14, cursor: 'pointer',
              padding: '6px 14px', fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {isFr ? 'Renvoyer le code' : 'Resend code'}
          </button>
        )}
        <div style={{ marginTop: 12 }}>
          <button
            onClick={() => setStep(STEPS.PHONE)}
            style={{
              background: 'none', border: 'none', color: '#8A8070',
              fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {isFr ? 'Changer de numero' : 'Change number'}
          </button>
        </div>
      </div>
    </div>
  )

  const renderProfile = () => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {error && (
        <div style={{ margin: '12px 28px 0', padding: '11px 14px', background: '#FEF2F2', borderRadius: 10, border: '1px solid #FECACA', color: '#DC2626', fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>
          {error}
        </div>
      )}
      <ProfileStep isFr={isFr} phone={phone} onComplete={handleProfileComplete} />
    </div>
  )

  const renderComplete = () => (
    <div style={{
      padding: '60px 28px', textAlign: 'center',
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 64, height: 64, background: '#F0FDF4',
        borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 24px',
      }}>
        <CheckCircle size={32} color="#16a34a" />
      </div>
      <h2 style={{
        fontSize: 24, fontWeight: 700, color: '#1A1710', marginBottom: 8,
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {isFr ? 'Bienvenue !' : 'Welcome!'}
      </h2>
      <p style={{ fontSize: 15, color: '#6B6860', fontFamily: "'DM Sans', sans-serif" }}>
        {isFr
          ? 'Votre compte est pret.'
          : 'Your account is ready.'}
      </p>
      <div style={{
        width: 28, height: 28, marginTop: 28,
        border: '3px solid #E0DAD0', borderTopColor: '#52B5D9',
        borderRadius: '50%', animation: 'auth-spin 1s linear infinite',
      }} />
    </div>
  )

  const renderStep = () => {
    switch (step) {
      case STEPS.WELCOME:     return renderWelcome()
      case STEPS.PHONE:       return renderPhone()
      case STEPS.OTP:         return renderOtp()
      case STEPS.PROFILE:     return renderProfile()
      case STEPS.COMPLETE:    return renderComplete()
      default:                return renderWelcome()
    }
  }

  return (
    <>
      <style>{`
        @keyframes auth-spin { to { transform: rotate(360deg); } }
        .auth-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #52B5D9 0%, #A07015 25%, #7C3AED 50%, #E5A630 75%, #2563EB 100%);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 24px 16px;
          font-family: 'DM Sans', sans-serif;
          position: relative;
        }
        .auth-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          pointer-events: none;
        }
        .auth-card {
          width: 100%;
          max-width: 420px;
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          min-height: 540px;
          position: relative;
          z-index: 1;
        }
        @media (max-width: 480px) {
          .auth-container {
            padding: 0;
            align-items: stretch;
          }
          .auth-card {
            max-width: none;
            min-height: 100vh;
            border-radius: 0;
            box-shadow: none;
          }
        }
      `}</style>

      <div className="auth-container">
        <div className="auth-card">
          {/* Progress bar */}
          {step !== STEPS.WELCOME && (
            <div style={{
              height: 3,
              background: '#F0EBE3',
              flexShrink: 0,
            }}>
              <div style={{
                height: '100%',
                background: '#52B5D9',
                width: `${progressPct()}%`,
                transition: 'width 0.3s ease',
                borderRadius: 2,
              }} />
            </div>
          )}

          {renderStep()}
        </div>
      </div>
    </>
  )
}
