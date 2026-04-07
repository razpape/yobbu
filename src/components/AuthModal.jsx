import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { PhoneIcon, MailIcon, LockIcon, CheckCircleIcon } from './Icons'

const COUNTRY_CODES = [
  { code: '+1',    flag: '🇺🇸' },
  { code: '+33',   flag: '🇫🇷' },
  { code: '+32',   flag: '🇧🇪' },
  { code: '+221',  flag: '🇸🇳' },
  { code: '+224',  flag: '🇬🇳' },
  { code: '+225',  flag: '🇨🇮' },
  { code: '+223',  flag: '🇲🇱' },
  { code: '+229',  flag: '🇧🇯' },
  { code: '+228',  flag: '🇹🇬' },
  { code: '+233',  flag: '🇬🇭' },
  { code: '+44',   flag: '🇬🇧' },
  { code: '+1514', flag: '🇨🇦' },
]

export default function AuthModal({ onClose, onSuccess, lang }) {
  const [mode, setMode]     = useState('login')   // 'login' | 'signup'
  const [step, setStep]     = useState('entry')   // 'entry' | 'sms-otp' | 'whatsapp' | 'whatsapp-otp'
  const [method, setMethod] = useState('phone')   // 'phone' | 'email'

  // Auth fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName]   = useState('')
  const [phone, setPhone]         = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [smsOtp, setSmsOtp]       = useState('')

  // WhatsApp step
  const [waCountry, setWaCountry]   = useState('+1')
  const [waPhone, setWaPhone]       = useState('')
  const [waOtp, setWaOtp]           = useState('')
  const [waSending, setWaSending]   = useState(false)
  const [waVerifying, setWaVerifying] = useState(false)
  const [waCooldown, setWaCooldown] = useState(0)
  const [waExpiresAt, setWaExpiresAt] = useState(null)
  const [waTimeLeft, setWaTimeLeft] = useState(300)
  const [userId, setUserId]         = useState(null)

  const [loading, setLoading]           = useState(false)
  const [socialLoading, setSocialLoading] = useState(null) // 'google' | 'facebook'
  const [error, setError]               = useState(null)

  const isFr = lang === 'fr'

  // WhatsApp cooldown countdown
  useEffect(() => {
    if (waCooldown <= 0) return
    const id = setTimeout(() => setWaCooldown(c => c - 1), 1000)
    return () => clearTimeout(id)
  }, [waCooldown])

  // WhatsApp OTP expiry
  useEffect(() => {
    if (step !== 'whatsapp-otp' || !waExpiresAt) return
    const id = setInterval(() => {
      const secs = Math.max(0, Math.floor((new Date(waExpiresAt) - Date.now()) / 1000))
      setWaTimeLeft(secs)
      if (secs === 0) clearInterval(id)
    }, 1000)
    return () => clearInterval(id)
  }, [step, waExpiresAt])

  // ── OAUTH ──────────────────────────────────────────────────────────────────
  const handleOAuth = async (provider) => {
    setError(null)
    setSocialLoading(provider)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: provider === 'google' ? { prompt: 'select_account' } : {},
        },
      })
      if (error) throw error
    } catch (err) {
      setError(err.message)
      setSocialLoading(null)
    }
  }

  // ── PHONE (SMS OTP) ────────────────────────────────────────────────────────
  const handlePhoneSend = async () => {
    setError(null)
    if (!phone) { setError(isFr ? 'Entrez votre numéro.' : 'Enter your phone number.'); return }
    if (mode === 'signup' && (!firstName || !lastName)) {
      setError(isFr ? 'Entrez votre nom complet.' : 'Enter your full name.'); return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone })
      if (error) throw error
      setStep('sms-otp')
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handleSmsVerify = async () => {
    setError(null)
    if (!smsOtp) { setError(isFr ? 'Entrez le code.' : 'Enter the code.'); return }
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.verifyOtp({ phone, token: smsOtp, type: 'sms' })
      if (error) throw error
      if (mode === 'signup') {
        await supabase.auth.updateUser({
          data: { first_name: firstName, last_name: lastName, full_name: `${firstName} ${lastName}` },
        })
        setUserId(data.user?.id)
        setStep('whatsapp')
      } else {
        onSuccess()
      }
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  // ── EMAIL ──────────────────────────────────────────────────────────────────
  const handleEmailAuth = async () => {
    setError(null)
    if (!email || !password) {
      setError(isFr ? 'Remplissez tous les champs.' : 'Fill in all fields.'); return
    }
    if (mode === 'signup' && (!firstName || !lastName)) {
      setError(isFr ? 'Entrez votre nom complet.' : 'Enter your full name.'); return
    }
    if (mode === 'signup' && password.length < 8) {
      setError(isFr ? 'Mot de passe : 8 caractères minimum.' : 'Password must be at least 8 characters.'); return
    }
    setLoading(true)
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { first_name: firstName, last_name: lastName, full_name: `${firstName} ${lastName}` },
          },
        })
        if (error) throw error
        setUserId(data.user?.id)
        setStep('whatsapp')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        onSuccess()
      }
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  // ── WHATSAPP ───────────────────────────────────────────────────────────────
  const fullWaPhone = `${waCountry}${waPhone.replace(/\D/g, '')}`

  const sendWaOtp = async () => {
    setError(null)
    if (!waPhone.trim()) {
      setError(isFr ? 'Entrez votre numéro WhatsApp' : 'Enter your WhatsApp number'); return
    }
    if (!userId) { onSuccess(); return }
    setWaSending(true)
    try {
      const res = await fetch('/api/send-whatsapp-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, phone: fullWaPhone }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.retryAfter) setWaCooldown(data.retryAfter)
        setError(data.error || 'Something went wrong')
        return
      }
      setWaExpiresAt(data.expiresAt)
      setWaTimeLeft(300)
      setStep('whatsapp-otp')
    } catch {
      setError(isFr ? 'Erreur réseau.' : 'Network error.')
    } finally { setWaSending(false) }
  }

  const verifyWaOtp = async () => {
    setError(null)
    if (waOtp.length < 6) {
      setError(isFr ? 'Entrez les 6 chiffres' : 'Enter all 6 digits'); return
    }
    setWaVerifying(true)
    try {
      const res = await fetch('/api/verify-whatsapp-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp: waOtp }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Invalid code')
        if (data.expired) setStep('whatsapp')
        return
      }
      onSuccess()
    } catch {
      setError(isFr ? 'Erreur réseau.' : 'Network error.')
    } finally { setWaVerifying(false) }
  }

  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  // ── STYLES ─────────────────────────────────────────────────────────────────
  const s = {
    overlay: {
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 999, padding: 16, fontFamily: 'DM Sans, sans-serif',
    },
    modal: {
      background: '#FDFBF7', borderRadius: 20, padding: '32px 28px',
      width: '100%', maxWidth: 420, border: '1px solid rgba(0,0,0,.06)',
      boxShadow: '0 20px 60px rgba(0,0,0,.15)', maxHeight: '90vh', overflowY: 'auto',
    },
    title: { fontFamily: 'DM Serif Display, serif', fontSize: 24, fontWeight: 700, color: '#1A1710', marginBottom: 4 },
    sub:   { fontSize: 13, color: '#8A8070', marginBottom: 24 },
    social: (disabled) => ({
      width: '100%', padding: '12px', borderRadius: 12, border: '1px solid rgba(0,0,0,.1)',
      background: '#fff', fontSize: 14, fontWeight: 500,
      cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      color: '#1A1710', marginBottom: 10, transition: 'all .2s', opacity: disabled ? .6 : 1,
    }),
    divider: { display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' },
    line:    { flex: 1, height: 1, background: 'rgba(0,0,0,.08)' },
    lbl:     { fontSize: 11, fontWeight: 700, color: '#8A8070', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' },
    inp:     { width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(0,0,0,.1)', background: '#fff', color: '#1A1710', fontSize: 14, fontFamily: 'DM Sans, sans-serif', outline: 'none', boxSizing: 'border-box', marginBottom: 14 },
    btn:     (bg, disabled) => ({
      width: '100%', padding: '13px', borderRadius: 12, border: 'none',
      background: disabled ? '#E8DDD0' : (bg || '#C8891C'),
      color: '#fff', fontSize: 15, fontWeight: 600,
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: 'DM Sans, sans-serif', transition: 'all .2s',
    }),
    tab: (active) => ({
      flex: 1, padding: '9px', borderRadius: 8, border: 'none',
      background: active ? '#1A1710' : 'transparent',
      color: active ? '#fff' : '#8A8070', fontSize: 13, fontWeight: 600,
      cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all .2s',
    }),
    skip: {
      width: '100%', padding: '11px', borderRadius: 12,
      border: '1px solid rgba(0,0,0,.1)', background: 'transparent',
      color: '#8A8070', fontSize: 14, fontWeight: 500, cursor: 'pointer',
      fontFamily: 'DM Sans, sans-serif', marginTop: 10, textAlign: 'center',
    },
    toggle: { textAlign: 'center', marginTop: 16, fontSize: 13, color: '#8A8070' },
  }

  return (
    <div onClick={onClose} style={s.overlay}>
      <div onClick={e => e.stopPropagation()} style={s.modal}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            {step === 'entry' && (
              <>
                <div style={s.title}>{mode === 'login' ? (isFr ? 'Connexion' : 'Welcome back') : (isFr ? 'Créer un compte' : 'Create account')}</div>
                <div style={s.sub}>{mode === 'login' ? (isFr ? 'Connectez-vous à Yobbu' : 'Sign in to Yobbu') : (isFr ? 'Rejoignez la communauté Yobbu' : 'Join the Yobbu community')}</div>
              </>
            )}
            {step === 'sms-otp' && <div style={s.title}>{isFr ? 'Vérification SMS' : 'SMS Verification'}</div>}
            {step === 'whatsapp' && (
              <>
                <div style={s.title}>{isFr ? 'Votre compte est créé !' : 'Account created!'}</div>
                <div style={s.sub}>{isFr ? 'Ajoutez WhatsApp pour vous faire vérifier' : 'Add WhatsApp to get verified'}</div>
              </>
            )}
            {step === 'whatsapp-otp' && <div style={s.title}>{isFr ? 'Code WhatsApp' : 'WhatsApp Code'}</div>}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#8A8070', lineHeight: 1, padding: 4 }}>✕</button>
        </div>

        {/* ── ENTRY ─────────────────────────────────────────────────────────── */}
        {step === 'entry' && (
          <>
            {/* Google */}
            <button style={s.social(!!socialLoading)} onClick={() => handleOAuth('google')} disabled={!!socialLoading}>
              {socialLoading === 'google' ? (
                <span style={{ fontSize: 13 }}>{isFr ? 'Redirection...' : 'Redirecting...'}</span>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {isFr ? 'Continuer avec Google' : 'Continue with Google'}
                </>
              )}
            </button>

            {/* Facebook */}
            <button style={s.social(!!socialLoading)} onClick={() => handleOAuth('facebook')} disabled={!!socialLoading}>
              {socialLoading === 'facebook' ? (
                <span style={{ fontSize: 13 }}>{isFr ? 'Redirection...' : 'Redirecting...'}</span>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  {isFr ? 'Continuer avec Facebook' : 'Continue with Facebook'}
                </>
              )}
            </button>

            {/* Divider */}
            <div style={s.divider}>
              <div style={s.line} />
              <span style={{ fontSize: 12, color: '#8A8070', fontWeight: 500 }}>{isFr ? 'ou' : 'or'}</span>
              <div style={s.line} />
            </div>

            {/* Phone / Email tabs */}
            <div style={{ display: 'flex', gap: 6, background: '#F0EBE3', borderRadius: 10, padding: 5, marginBottom: 18 }}>
              <button style={{ ...s.tab(method === 'phone'), display:'flex', alignItems:'center', justifyContent:'center', gap:6 }} onClick={() => { setMethod('phone'); setError(null) }}>
                <PhoneIcon size={13} color={method === 'phone' ? '#fff' : '#8A8070'} />
                {isFr ? 'Téléphone' : 'Phone'}
              </button>
              <button style={{ ...s.tab(method === 'email'), display:'flex', alignItems:'center', justifyContent:'center', gap:6 }} onClick={() => { setMethod('email'); setError(null) }}>
                <MailIcon size={13} color={method === 'email' ? '#fff' : '#8A8070'} />
                Email
              </button>
            </div>

            {/* Name fields — signup only */}
            {mode === 'signup' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={s.lbl}>{isFr ? 'Prénom' : 'First name'}</label>
                  <input style={s.inp} placeholder="Aminata" value={firstName} onChange={e => setFirstName(e.target.value)} />
                </div>
                <div>
                  <label style={s.lbl}>{isFr ? 'Nom' : 'Last name'}</label>
                  <input style={s.inp} placeholder="Mbaye" value={lastName} onChange={e => setLastName(e.target.value)} />
                </div>
              </div>
            )}

            {/* Phone method */}
            {method === 'phone' && (
              <>
                <label style={s.lbl}>{isFr ? 'Numéro de téléphone' : 'Phone number'}</label>
                <input
                  style={s.inp} type="tel" placeholder="+1 (212) 555-0100"
                  value={phone} onChange={e => setPhone(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handlePhoneSend()}
                />
                <button style={s.btn(null, loading)} onClick={handlePhoneSend} disabled={loading}>
                  {loading ? '...' : isFr ? 'Envoyer le code SMS' : 'Send SMS code'}
                </button>
              </>
            )}

            {/* Email method */}
            {method === 'email' && (
              <>
                <label style={s.lbl}>{isFr ? 'Adresse e-mail' : 'Email address'}</label>
                <input
                  style={s.inp} type="email" placeholder="aminata@exemple.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                />
                <label style={s.lbl}>{isFr ? 'Mot de passe' : 'Password'}</label>
                <input
                  style={s.inp} type="password"
                  placeholder={isFr ? '8 caractères minimum' : 'Min. 8 characters'}
                  value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleEmailAuth()}
                />
                <button style={s.btn(null, loading)} onClick={handleEmailAuth} disabled={loading}>
                  {loading ? '...' : mode === 'signup' ? (isFr ? 'Créer mon compte' : 'Create account') : (isFr ? 'Se connecter' : 'Log in')}
                </button>
              </>
            )}

            {/* Toggle login / signup */}
            <div style={s.toggle}>
              {mode === 'login' ? (isFr ? 'Pas de compte ? ' : 'No account? ') : (isFr ? 'Déjà un compte ? ' : 'Already have one? ')}
              <button
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null) }}
                style={{ background: 'none', border: 'none', color: '#C8891C', fontWeight: 700, cursor: 'pointer', fontSize: 13, fontFamily: 'DM Sans, sans-serif' }}
              >
                {mode === 'login' ? (isFr ? "S'inscrire" : 'Sign up') : (isFr ? 'Se connecter' : 'Log in')}
              </button>
            </div>
          </>
        )}

        {/* ── SMS OTP ───────────────────────────────────────────────────────── */}
        {step === 'sms-otp' && (
          <>
            <div style={{ background: '#F0FAF4', border: '1px solid #9FD4B8', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#2D8B4E' }}>
              {isFr ? `Code envoyé au ${phone}` : `Code sent to ${phone}`}
            </div>
            <label style={s.lbl}>{isFr ? 'Code de vérification' : 'Verification code'}</label>
            <input
              style={{ ...s.inp, letterSpacing: '0.4em', textAlign: 'center', fontSize: 22, fontWeight: 700 }}
              type="text" placeholder="123456" value={smsOtp}
              onChange={e => setSmsOtp(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSmsVerify()}
            />
            <button style={s.btn(null, loading)} onClick={handleSmsVerify} disabled={loading}>
              {loading ? '...' : isFr ? 'Vérifier' : 'Verify'}
            </button>
            <button onClick={() => { setStep('entry'); setSmsOtp(''); setError(null) }} style={s.skip}>
              {isFr ? 'Retour' : 'Back'}
            </button>
          </>
        )}

        {/* ── WHATSAPP PROMPT ───────────────────────────────────────────────── */}
        {step === 'whatsapp' && (
          <>
            {/* Success banner */}
            <div style={{ background: '#F0FAF4', border: '1px solid #9FD4B8', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#2D8B4E', display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircleIcon size={15} color="#2D8B4E" />
              {isFr ? 'Compte créé avec succès !' : 'Account created successfully!'}
            </div>

            {/* WhatsApp icon + description */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.09-1.35C8.5 21.52 10.21 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm4.93 13.66c-.2.56-1.18 1.08-1.62 1.13-.44.06-.86.2-2.9-.6-2.46-.96-4.04-3.47-4.16-3.63-.12-.17-.97-1.29-.97-2.46 0-1.18.62-1.75.84-2 .2-.23.44-.29.59-.29h.42c.14 0 .32-.01.49.37.18.4.62 1.52.67 1.63.06.1.09.23.02.37-.07.14-.1.22-.2.34-.1.12-.21.27-.3.36-.1.1-.2.21-.09.41.12.2.52.85 1.12 1.38.77.69 1.42.9 1.62 1 .2.1.32.08.44-.05.12-.13.5-.58.64-.78.13-.2.26-.16.44-.1.18.07 1.16.55 1.36.65.2.1.33.15.38.23.06.08.06.46-.14 1.02z"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1710' }}>
                  {isFr ? 'Vérifiez votre numéro WhatsApp' : 'Verify your WhatsApp number'}
                </div>
                <div style={{ fontSize: 12, color: '#25D366', fontWeight: 500, marginTop: 2 }}>
                  {isFr ? 'Obtenez le badge vérifié ✓' : 'Get the verified badge ✓'}
                </div>
              </div>
            </div>

            <p style={{ fontSize: 13, color: '#6B6860', lineHeight: 1.6, marginBottom: 18 }}>
              {isFr
                ? 'Ajoutez votre numéro WhatsApp pour obtenir le badge de vérification et inspirer confiance aux voyageurs.'
                : 'Add your WhatsApp number to get a verification badge and build trust with travelers.'}
            </p>

            {/* Phone input */}
            <div style={{ marginBottom: 14 }}>
              <label style={s.lbl}>{isFr ? 'Numéro WhatsApp' : 'WhatsApp Number'}</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <select
                  value={waCountry} onChange={e => setWaCountry(e.target.value)}
                  style={{ flexShrink: 0, padding: '12px 10px', border: '1px solid rgba(0,0,0,.1)', borderRadius: 10, background: '#fff', fontSize: 13, fontWeight: 500, fontFamily: 'DM Sans, sans-serif', color: '#1A1710', cursor: 'pointer', outline: 'none', appearance: 'none', minWidth: 85 }}
                >
                  {COUNTRY_CODES.map(c => (
                    <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                  ))}
                </select>
                <input
                  type="tel" value={waPhone} onChange={e => setWaPhone(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !waSending && sendWaOtp()}
                  placeholder={isFr ? '77 123 45 67' : '555 123 4567'}
                  style={{ flex: 1, padding: '12px 14px', border: '1px solid rgba(0,0,0,.1)', borderRadius: 10, fontSize: 14, fontFamily: 'DM Sans, sans-serif', color: '#1A1710', outline: 'none', background: '#fff' }}
                />
              </div>
            </div>

            <button
              style={s.btn('#25D366', waSending || waCooldown > 0)}
              onClick={sendWaOtp}
              disabled={waSending || waCooldown > 0}
            >
              {waSending
                ? (isFr ? 'Envoi...' : 'Sending...')
                : waCooldown > 0
                ? (isFr ? `Réessayer dans ${waCooldown}s` : `Retry in ${waCooldown}s`)
                : (isFr ? 'Vérifier maintenant →' : 'Verify now →')}
            </button>

            <button onClick={onSuccess} style={s.skip}>
              {isFr ? "Passer pour l'instant" : 'Skip for now'}
            </button>

            <p style={{ fontSize: 11, color: '#AAA098', textAlign: 'center', marginTop: 10, lineHeight: 1.5 }}>
              {isFr
                ? 'Vous pourrez toujours le faire plus tard depuis votre profil.'
                : 'You can always do this later from your profile.'}
            </p>
          </>
        )}

        {/* ── WHATSAPP OTP ──────────────────────────────────────────────────── */}
        {step === 'whatsapp-otp' && (
          <>
            <p style={{ fontSize: 13, color: '#6B6860', lineHeight: 1.6, marginBottom: 18, marginTop: 4 }}>
              {isFr
                ? <> Vérifiez WhatsApp sur <strong style={{ color: '#1A1710' }}>{fullWaPhone}</strong> et entrez le code à 6 chiffres.</>
                : <> Check WhatsApp on <strong style={{ color: '#1A1710' }}>{fullWaPhone}</strong> and enter the 6-digit code.</>}
            </p>

            <label style={s.lbl}>{isFr ? 'Code WhatsApp' : 'WhatsApp Code'}</label>
            <input
              style={{ ...s.inp, letterSpacing: '0.4em', textAlign: 'center', fontSize: 22, fontWeight: 700 }}
              type="text" inputMode="numeric" placeholder="123456" maxLength={6}
              value={waOtp}
              onChange={e => setWaOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={e => e.key === 'Enter' && !waVerifying && verifyWaOtp()}
            />

            {waExpiresAt && (
              <div style={{ textAlign: 'center', fontSize: 12, color: waTimeLeft < 60 ? '#DC2626' : '#8A8070', marginBottom: 14 }}>
                {waTimeLeft > 0
                  ? (isFr ? `Code valide encore ${fmtTime(waTimeLeft)}` : `Code expires in ${fmtTime(waTimeLeft)}`)
                  : (isFr ? 'Code expiré' : 'Code expired')}
              </div>
            )}

            <button
              style={s.btn('#25D366', waVerifying || waOtp.length < 6)}
              onClick={verifyWaOtp}
              disabled={waVerifying || waOtp.length < 6}
            >
              {waVerifying ? (isFr ? 'Vérification...' : 'Verifying...') : (isFr ? 'Confirmer →' : 'Confirm →')}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, alignItems: 'center' }}>
              <button
                onClick={() => { setStep('whatsapp'); setWaOtp(''); setError(null) }}
                style={{ fontSize: 13, color: '#C8891C', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}
              >
                {isFr ? '← Changer de numéro' : '← Change number'}
              </button>
              <button
                onClick={onSuccess}
                style={{ fontSize: 13, color: '#8A8070', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
              >
                {isFr ? 'Passer' : 'Skip'}
              </button>
            </div>
          </>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', marginTop: 12, fontSize: 13, color: '#DC2626' }}>
            {error}
          </div>
        )}

        {/* Security note */}
        {step === 'entry' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 16, padding: '8px 12px', background: '#F7F3ED', borderRadius: 8 }}>
            <LockIcon size={12} color="#8A8070" />
            <span style={{ fontSize: 11, color: '#8A8070' }}>{isFr ? 'Vos données sont sécurisées.' : 'Your data is secured and encrypted.'}</span>
          </div>
        )}

      </div>
    </div>
  )
}
