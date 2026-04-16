import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { PhoneIcon, MailIcon, LockIcon, CheckCircleIcon } from './Icons'
import { COUNTRY_CODES } from '../utils/constants'

// steps: 'entry' | 'sms-otp' | 'phone-verify' | 'phone-otp' | 'whatsapp'

export default function AuthModal({ onClose, onSuccess, lang }) {
  const [mode, setMode]     = useState('login')
  const [step, setStep]     = useState('entry')
  const [method, setMethod] = useState('phone')

  // Entry fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName]   = useState('')
  const [phone, setPhone]         = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [smsOtp, setSmsOtp]       = useState('')

  // Phone-verify step (email signup users)
  const [pvCountry, setPvCountry] = useState('+1')
  const [pvPhone, setPvPhone]     = useState('')
  const [pvOtp, setPvOtp]         = useState('')

  // WhatsApp step
  const [waCountry, setWaCountry] = useState('+1')
  const [waPhone, setWaPhone]     = useState('')
  const [userId, setUserId]       = useState(null)

  const [loading, setLoading]           = useState(false)
  const [socialLoading, setSocialLoading] = useState(null)
  const [error, setError]               = useState(null)

  const isFr = lang === 'fr'

  // ── helpers ────────────────────────────────────────────────────────────────
  const markPhoneVerified = (uid) =>
    supabase.from('profiles').upsert({ id: uid, whatsapp_verified: true }, { onConflict: 'id' })

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

  // ── PHONE SIGNUP/LOGIN (SMS OTP) ───────────────────────────────────────────
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
        const uid = data.user?.id
        await markPhoneVerified(uid)
        setUserId(uid)
        // Pre-fill WhatsApp with the same verified phone
        setWaPhone(phone.replace(/^\+\d{1,3}/, ''))
        setStep('whatsapp')
      } else {
        onSuccess()
      }
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  // ── EMAIL SIGNUP/LOGIN ─────────────────────────────────────────────────────
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
          email, password,
          options: { data: { first_name: firstName, last_name: lastName, full_name: `${firstName} ${lastName}` } },
        })
        if (error) throw error
        setUserId(data.user?.id)
        setStep('phone-verify')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        onSuccess()
      }
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  // ── PHONE-VERIFY STEP (email signup users add + verify their phone) ─────────
  const fullPvPhone = `${pvCountry}${pvPhone.replace(/\D/g, '')}`

  const handlePvSend = async () => {
    setError(null)
    if (!pvPhone.trim()) { setError(isFr ? 'Entrez votre numéro.' : 'Enter your phone number.'); return }
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ phone: fullPvPhone })
      if (error) throw error
      setStep('phone-otp')
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handlePvOtp = async () => {
    setError(null)
    if (!pvOtp) { setError(isFr ? 'Entrez le code.' : 'Enter the code.'); return }
    setLoading(true)
    try {
      const { data: { user }, error } = await supabase.auth.verifyOtp({
        phone: fullPvPhone, token: pvOtp, type: 'phone_change',
      })
      if (error) throw error
      const uid = user?.id || userId
      await markPhoneVerified(uid)
      setUserId(uid)
      setWaPhone(pvPhone)
      setWaCountry(pvCountry)
      setStep('whatsapp')
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  // ── WHATSAPP STEP ──────────────────────────────────────────────────────────
  const fullWaPhone = `${waCountry}${waPhone.replace(/\D/g, '')}`
  const [waMethod, setWaMethod] = useState('choice') // 'choice' | 'inbound' | 'outbound'
  const [inboundCode, setInboundCode] = useState('')
  const [waCountdown, setWaCountdown] = useState(600)

  const generateInboundCode = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/generate-inbound-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const data = await res.json()
      if (res.ok) {
        setInboundCode(data.code)
        setWaCountdown(600)
        setWaMethod('inbound')
      } else {
        setError(data.error || 'Failed to generate code')
      }
    } catch (err) {
      console.error('Error generating inbound code:', err)
      setError('Network error. Please try again.')
    }
    finally { setLoading(false) }
  }

  // Poll for verification status when in inbound mode
  useEffect(() => {
    if (waMethod !== 'inbound' || !userId) return

    const timer = setInterval(() => setWaCountdown(c => c > 0 ? c - 1 : 0), 1000)
    const check = setInterval(async () => {
      try {
        const { data, error } = await supabase.from('profiles').select('whatsapp_verified').eq('id', userId).single()
        if (error) {
          console.error('Verification check failed:', error)
          return
        }
        if (data?.whatsapp_verified) {
          clearInterval(timer)
          clearInterval(check)
          onSuccess()
        }
      } catch (err) {
        console.error('Unexpected error checking verification:', err)
      }
    }, 3000)

    return () => {
      clearInterval(timer)
      clearInterval(check)
    }
  }, [waMethod, userId, onSuccess])

  const handleWaSave = async () => {
    setLoading(true)
    try {
      if (waPhone.trim() && userId) {
        const { error } = await supabase.auth.updateUser({ data: { whatsapp_phone: fullWaPhone } })
        if (error) {
          console.warn('WhatsApp number update warning:', error.message)
        }
      }
    } catch (err) {
      console.warn('Failed to save WhatsApp number (non-critical):', err)
    }
    finally { setLoading(false) }
    onSuccess()
  }

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
    phoneRow: { display: 'flex', gap: 8, marginBottom: 14 },
    countrySelect: {
      flexShrink: 0, padding: '12px 10px', border: '1px solid rgba(0,0,0,.1)',
      borderRadius: 10, background: '#fff', fontSize: 13, fontWeight: 500,
      fontFamily: 'DM Sans, sans-serif', color: '#1A1710', cursor: 'pointer',
      outline: 'none', appearance: 'none', minWidth: 80,
    },
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
            {step === 'sms-otp' && (
              <>
                <div style={s.title}>{isFr ? 'Vérification SMS' : 'SMS Verification'}</div>
                <div style={s.sub}>{isFr ? `Code envoyé au ${phone}` : `Code sent to ${phone}`}</div>
              </>
            )}
            {step === 'phone-verify' && (
              <>
                <div style={s.title}>{isFr ? 'Vérification requise' : 'Verification required'}</div>
                <div style={s.sub}>{isFr ? 'WhatsApp est requis pour continuer' : 'WhatsApp is required to continue'}</div>
              </>
            )}
            {step === 'phone-otp' && (
              <>
                <div style={s.title}>{isFr ? 'Code de vérification' : 'Verification code'}</div>
                <div style={s.sub}>{isFr ? `Code envoyé au ${fullPvPhone}` : `Code sent to ${fullPvPhone}`}</div>
              </>
            )}
            {step === 'whatsapp' && (
              <>
                <div style={s.title}>{isFr ? 'Vérification WhatsApp' : 'WhatsApp verification'}</div>
                <div style={s.sub}>{isFr ? 'Étape requise pour activer votre compte' : 'Required step to activate your account'}</div>
              </>
            )}
          </div>
          {step === 'entry' && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#8A8070', lineHeight: 1, padding: 4 }}>✕</button>
          )}
          {step !== 'entry' && (
            <div style={{ width: 28 }} /> // Spacer to maintain layout
          )}
        </div>

        {/* ── ENTRY ─────────────────────────────────────────────────────────── */}
        {step === 'entry' && (
          <>
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

            {method === 'email' && (
              <>
                <label style={s.lbl}>{isFr ? 'Adresse e-mail' : 'Email address'}</label>
                <input style={s.inp} type="email" placeholder="aminata@exemple.com" value={email} onChange={e => setEmail(e.target.value)} />
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

        {/* ── SMS OTP (phone signup/login) ───────────────────────────────────── */}
        {step === 'sms-otp' && (
          <>
            <label style={s.lbl}>{isFr ? 'Code de vérification' : 'Verification code'}</label>
            <input
              style={{ ...s.inp, letterSpacing: '0.4em', textAlign: 'center', fontSize: 22, fontWeight: 700 }}
              type="text" inputMode="numeric" placeholder="123456" maxLength={6}
              value={smsOtp}
              onChange={e => setSmsOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={e => e.key === 'Enter' && handleSmsVerify()}
            />
            <button style={s.btn(null, loading || smsOtp.length < 6)} onClick={handleSmsVerify} disabled={loading || smsOtp.length < 6}>
              {loading ? '...' : isFr ? 'Vérifier' : 'Verify'}
            </button>
            <button onClick={() => { setStep('entry'); setSmsOtp(''); setError(null) }} style={s.skip}>
              {isFr ? 'Retour' : 'Back'}
            </button>
          </>
        )}

        {/* ── PHONE-VERIFY (email signup — enter phone to verify) ────────────── */}
        {step === 'phone-verify' && (
          <>
            {/* Required banner */}
            <div style={{ background: '#FFF8EB', border: '1px solid #F5D0A9', borderRadius: 10, padding: '10px 14px', marginBottom: 18, fontSize: 13, color: '#C8891C', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>⚡</span>
              {isFr ? 'Vérification WhatsApp requise' : 'WhatsApp verification required'}
            </div>

            <label style={s.lbl}>{isFr ? 'Numéro de téléphone' : 'Phone number'}</label>
            <div style={s.phoneRow}>
              <select value={pvCountry} onChange={e => setPvCountry(e.target.value)} style={s.countrySelect}>
                {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
              </select>
              <input
                style={{ ...s.inp, flex: 1, marginBottom: 0 }}
                type="tel" placeholder={isFr ? '77 123 45 67' : '555 123 4567'}
                value={pvPhone} onChange={e => setPvPhone(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handlePvSend()}
              />
            </div>

            <button style={s.btn(null, loading || !pvPhone.trim())} onClick={handlePvSend} disabled={loading || !pvPhone.trim()}>
              {loading ? '...' : isFr ? 'Continuer →' : 'Continue →'}
            </button>
            <p style={{ fontSize: 11, color: '#AAA098', textAlign: 'center', marginTop: 10, lineHeight: 1.5 }}>
              {isFr
                ? 'Requis pour activer votre compte. Vous allez recevoir un code SMS.'
                : 'Required to activate your account. You will receive an SMS code.'}
            </p>
          </>
        )}

        {/* ── PHONE-OTP (email signup — enter code) ─────────────────────────── */}
        {step === 'phone-otp' && (
          <>
            <label style={s.lbl}>{isFr ? 'Code de vérification' : 'Verification code'}</label>
            <input
              style={{ ...s.inp, letterSpacing: '0.4em', textAlign: 'center', fontSize: 22, fontWeight: 700 }}
              type="text" inputMode="numeric" placeholder="123456" maxLength={6}
              value={pvOtp}
              onChange={e => setPvOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={e => e.key === 'Enter' && handlePvOtp()}
            />
            <button style={s.btn(null, loading || pvOtp.length < 6)} onClick={handlePvOtp} disabled={loading || pvOtp.length < 6}>
              {loading ? '...' : isFr ? 'Vérifier' : 'Verify'}
            </button>
            <button onClick={() => { setStep('phone-verify'); setPvOtp(''); setError(null) }} style={s.skip}>
              {isFr ? 'Retour' : 'Back'}
            </button>
          </>
        )}

        {/* ── WHATSAPP (add contact number) ─────────────────────────────────── */}
        {step === 'whatsapp' && waMethod === 'choice' && (
          <>
            {/* Required banner */}
            <div style={{ background: '#FFF8EB', border: '1px solid #F5D0A9', borderRadius: 10, padding: '10px 14px', marginBottom: 18, fontSize: 13, color: '#C8891C', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>⚡</span>
              {isFr ? 'Vérification WhatsApp requise' : 'WhatsApp verification required'}
            </div>

            <p style={{ fontSize: 13, color: '#6B6860', lineHeight: 1.6, marginBottom: 18 }}>
              {isFr
                ? "Votre compte nécessite une vérification WhatsApp. Choisissez une méthode :"
                : "Your account requires WhatsApp verification. Choose a method:"}
            </p>

            {/* Inbound option */}
            <button
              onClick={generateInboundCode}
              disabled={loading}
              style={{
                width: '100%', padding: '16px', borderRadius: 14, border: '2px solid #25D366',
                background: '#F0FAF4', cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: 12, textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1710' }}>
                    {isFr ? '🚀 Envoyer un message' : '🚀 Send us a message'}
                  </div>
                  <div style={{ fontSize: 12, color: '#8A8070' }}>
                    {isFr ? 'Plus rapide • 30 secondes' : 'Faster • 30 seconds'}
                  </div>
                </div>
                <span style={{ fontSize: 20, color: '#25D366' }}>→</span>
              </div>
            </button>

            {/* Outbound option */}
            <button
              onClick={() => setWaMethod('outbound')}
              style={{
                width: '100%', padding: '16px', borderRadius: 14, border: '2px solid #E8DDD0',
                background: '#fff', cursor: 'pointer', textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#C8891C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PhoneIcon size={22} color="white" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1710' }}>
                    {isFr ? 'Recevoir un code SMS' : 'Receive SMS code'}
                  </div>
                  <div style={{ fontSize: 12, color: '#8A8070' }}>
                    {isFr ? 'Nous vous envoyons le code' : 'We send you the code'}
                  </div>
                </div>
              </div>
            </button>
          </>
        )}

        {/* ── WHATSAPP INBOUND VERIFICATION ── */}
        {step === 'whatsapp' && waMethod === 'inbound' && inboundCode && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1710' }}>
                {isFr ? 'Envoyez ce code par WhatsApp' : 'Send this code via WhatsApp'}
              </div>
            </div>

            {/* Code display */}
            <div style={{
              background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
              borderRadius: 16, padding: 24, textAlign: 'center', marginBottom: 20, color: 'white'
            }}>
              <div style={{ fontSize: 11, opacity: 0.9, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {isFr ? 'Votre code' : 'Your code'}
              </div>
              <div>
                {inboundCode.split('').map((digit, i) => (
                  <span key={i} style={{
                    display: 'inline-block', width: 36, height: 48, background: 'rgba(255,255,255,0.2)',
                    borderRadius: 8, margin: '0 3px', fontSize: 24, fontWeight: 700, lineHeight: '48px'
                  }}>{digit}</span>
                ))}
              </div>
            </div>

            <div style={{ background: '#F7F5F0', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#6B6860', lineHeight: 1.8 }}>
                <li>{isFr ? 'Ouvrez WhatsApp' : 'Open WhatsApp'}</li>
                <li>{isFr ? 'Envoyez ce code à notre numéro' : 'Send this code to our number'}</li>
                <li>{isFr ? 'Attendez la confirmation' : 'Wait for confirmation'}</li>
              </ol>
            </div>

            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: waCountdown < 60 ? '#DC2626' : '#8A8070' }}>
                ⏱ {isFr ? `Expire dans ${Math.floor(waCountdown/60)}:${String(waCountdown%60).padStart(2,'0')}` : `Expires in ${Math.floor(waCountdown/60)}:${String(waCountdown%60).padStart(2,'0')}`}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, background: '#F0FAF4', borderRadius: 10, marginBottom: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#25D366', animation: 'pulse 1.5s infinite' }} />
              <span style={{ fontSize: 13, color: '#2D8B4E' }}>
                {isFr ? 'En attente de votre message...' : 'Waiting for your message...'}
              </span>
            </div>

            <button onClick={() => setWaMethod('choice')} style={s.skip}>
              ← {isFr ? 'Changer de méthode' : 'Change method'}
            </button>
            <p style={{ fontSize: 11, color: '#AAA098', textAlign: 'center', marginTop: 10, lineHeight: 1.5 }}>
              {isFr
                ? 'La vérification est requise pour continuer'
                : 'Verification is required to continue'}
            </p>
          </>
        )}

        {/* ── WHATSAPP OUTBOUND (traditional) ── */}
        {step === 'whatsapp' && waMethod === 'outbound' && (
          <>
            {/* Required banner */}
            <div style={{ background: '#FFF8EB', border: '1px solid #F5D0A9', borderRadius: 10, padding: '10px 14px', marginBottom: 18, fontSize: 13, color: '#C8891C', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>⚡</span>
              {isFr ? 'Numéro WhatsApp requis' : 'WhatsApp number required'}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.09-1.35C8.5 21.52 10.21 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm4.93 13.66c-.2.56-1.18 1.08-1.62 1.13-.44.06-.86.2-2.9-.6-2.46-.96-4.04-3.47-4.16-3.63-.12-.17-.97-1.29-.97-2.46 0-1.18.62-1.75.84-2 .2-.23.44-.29.59-.29h.42c.14 0 .32-.01.49.37.18.4.62 1.52.67 1.63.06.1.09.23.02.37-.07.14-.1.22-.2.34-.1.12-.21.27-.3.36-.1.1-.2.21-.09.41.12.2.52.85 1.12 1.38.77.69 1.42.9 1.62 1 .2.1.32.08.44-.05.12-.13.5-.58.64-.78.13-.2.26-.16.44-.1.18.07 1.16.55 1.36.65.2.1.33.15.38.23.06.08.06.46-.14 1.02z"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1710' }}>
                  {isFr ? 'Votre numéro WhatsApp' : 'Your WhatsApp number'}
                </div>
                <div style={{ fontSize: 11, color: '#8A8070', marginTop: 1 }}>
                  {isFr ? 'Les expéditeurs vous contacteront ici' : 'Senders will contact you here'}
                </div>
              </div>
            </div>

            <label style={s.lbl}>{isFr ? 'Numéro WhatsApp' : 'WhatsApp number'}</label>
            <div style={s.phoneRow}>
              <select value={waCountry} onChange={e => setWaCountry(e.target.value)} style={s.countrySelect}>
                {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
              </select>
              <input
                style={{ ...s.inp, flex: 1, marginBottom: 0 }}
                type="tel" placeholder={isFr ? '77 123 45 67' : '555 123 4567'}
                value={waPhone} onChange={e => setWaPhone(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleWaSave()}
              />
            </div>

            <button style={s.btn('#25D366', loading)} onClick={handleWaSave} disabled={loading}>
              {loading ? '...' : isFr ? 'Continuer →' : 'Continue →'}
            </button>
            <button onClick={() => setWaMethod('choice')} style={s.skip}>
              ← {isFr ? 'Changer de méthode' : 'Change method'}
            </button>
            <p style={{ fontSize: 11, color: '#AAA098', textAlign: 'center', marginTop: 10, lineHeight: 1.5 }}>
              {isFr
                ? 'Ce numéro est requis pour activer votre compte'
                : 'This number is required to activate your account'}
            </p>
          </>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', marginTop: 12, fontSize: 13, color: '#DC2626' }}>
            {error}
          </div>
        )}

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
