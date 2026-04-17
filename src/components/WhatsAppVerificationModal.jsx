import { useState, useEffect, useRef } from 'react'
import VerifiedBadge from './VerifiedBadge'
import { PhoneIcon } from './Icons'
import { COUNTRY_CODES } from '../utils/constants'

export default function WhatsAppVerificationModal({ user, lang, onClose, onVerified }) {
  const isFr = lang === 'fr'

  const [step, setStep]             = useState('phone')   // 'phone' | 'otp' | 'success'
  const [countryCode, setCountryCode] = useState('+1')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp]               = useState(['', '', '', '', '', ''])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [cooldown, setCooldown]     = useState(0)   // seconds remaining
  const [expiresAt, setExpiresAt]   = useState(null)
  const [timeLeft, setTimeLeft]     = useState(300) // OTP expiry countdown (seconds)

  const otpRefs  = useRef([])
  const timerRef = useRef(null)

  // Cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return
    const id = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(id)
  }, [cooldown])

  // OTP expiry countdown
  useEffect(() => {
    if (step !== 'otp' || !expiresAt) return
    timerRef.current = setInterval(() => {
      const secs = Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 1000))
      setTimeLeft(secs)
      if (secs === 0) clearInterval(timerRef.current)
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [step, expiresAt])

  const fullPhone = `${countryCode}${phoneNumber.replace(/\D/g, '')}`

  async function sendOtp() {
    setError('')
    if (!phoneNumber.trim()) {
      setError(isFr ? 'Entrez votre numéro WhatsApp' : 'Enter your WhatsApp number')
      return
    }
    setLoading(true)
    try {
      const res  = await fetch('/api/send-whatsapp-otp', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ userId: user.id, phone: fullPhone }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.retryAfter) setCooldown(data.retryAfter)
        setError(data.error || 'Something went wrong')
        return
      }
      setExpiresAt(data.expiresAt)
      setTimeLeft(300)
      setStep('otp')
    } catch {
      setError(isFr ? 'Erreur réseau. Réessayez.' : 'Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function verifyOtp() {
    const code = otp.join('')
    if (code.length < 6) {
      setError(isFr ? 'Entrez les 6 chiffres' : 'Enter all 6 digits')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res  = await fetch('/api/verify-whatsapp-otp', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ userId: user.id, otp: code }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Invalid code')
        if (data.expired) setStep('phone')
        return
      }
      setStep('success')
      setTimeout(() => { onVerified?.(); onClose() }, 2200)
    } catch {
      setError(isFr ? 'Erreur réseau. Réessayez.' : 'Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleOtpInput(index, value) {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next  = [...otp]
    next[index] = digit
    setOtp(next)
    if (digit && index < 5) otpRefs.current[index + 1]?.focus()
  }

  function handleOtpKeyDown(index, e) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  function handleOtpPaste(e) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      otpRefs.current[5]?.focus()
    }
    e.preventDefault()
  }

  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <>
      <style>{`
        @keyframes wa-fade-in { from { opacity:0; transform:scale(.97); } to { opacity:1; transform:scale(1); } }
        .wa-modal-box { animation: wa-fade-in .22s ease-out both; }
        .wa-otp-input { width:44px; height:54px; text-align:center; font-size:22px; font-weight:700;
          font-family:'DM Sans',sans-serif; color:#1A1710; background:#F7F5F0;
          border:2px solid #E8DDD0; border-radius:12px; outline:none; transition:border-color .15s;
          -moz-appearance:textfield; }
        .wa-otp-input::-webkit-outer-spin-button,
        .wa-otp-input::-webkit-inner-spin-button { -webkit-appearance:none; }
        .wa-otp-input:focus { border-color:#2D8B4E; background:#fff; }
        .wa-otp-input.filled { border-color:#2D8B4E; background:#F0FAF4; }
        @media (max-width: 480px) {
          .wa-modal-box { margin: 0 !important; border-radius: 20px 20px 0 0 !important; width: 100% !important; }
          .wa-modal-overlay { align-items: flex-end !important; }
          .wa-otp-input { width: 40px; height: 50px; }
        }
      `}</style>

      {/* Overlay */}
      <div
        className="wa-modal-overlay"
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(26,23,16,.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 900, backdropFilter: 'blur(3px)',
        }}
      >
        <div
          className="wa-modal-box"
          onClick={e => e.stopPropagation()}
          style={{
            background: '#fff', borderRadius: 20, width: 440, maxWidth: '92vw',
            padding: '32px 32px 28px', boxShadow: '0 24px 80px rgba(0,0,0,.18)',
            position: 'relative', fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {/* Close */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 16, right: 16, width: 30, height: 30,
              border: 'none', background: '#F0EBE3', borderRadius: '50%',
              cursor: 'pointer', fontSize: 14, color: '#8A8070', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            ✕
          </button>

          {/* ── STEP: PHONE ── */}
          {step === 'phone' && (
            <>
              {/* WhatsApp icon + title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: '#25D366',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.09-1.35C8.5 21.52 10.21 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm4.93 13.66c-.2.56-1.18 1.08-1.62 1.13-.44.06-.86.2-2.9-.6-2.46-.96-4.04-3.47-4.16-3.63-.12-.17-.97-1.29-.97-2.46 0-1.18.62-1.75.84-2 .2-.23.44-.29.59-.29h.42c.14 0 .32-.01.49.37.18.4.62 1.52.67 1.63.06.1.09.23.02.37-.07.14-.1.22-.2.34-.1.12-.21.27-.3.36-.1.1-.2.21-.09.41.12.2.52.85 1.12 1.38.77.69 1.42.9 1.62 1 .2.1.32.08.44-.05.12-.13.5-.58.64-.78.13-.2.26-.16.44-.1.18.07 1.16.55 1.36.65.2.1.33.15.38.23.06.08.06.46-.14 1.02z"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#1A1710', letterSpacing: '-.3px' }}>
                    {isFr ? 'Vérification WhatsApp' : 'WhatsApp Verification'}
                  </div>
                  <div style={{ fontSize: 12, color: '#8A8070', marginTop: 1 }}>
                    {isFr ? 'Un numéro = un compte' : 'One number = one account'}
                  </div>
                </div>
              </div>

              <p style={{ fontSize: 13, color: '#6B6860', lineHeight: 1.6, marginBottom: 22, marginTop: 14 }}>
                {isFr
                  ? "Entrez votre numéro WhatsApp. Nous vous enverrons un code à 6 chiffres pour confirmer votre identité."
                  : "Enter your WhatsApp number. We'll send you a 6-digit code to confirm your identity."}
              </p>

              {/* Phone input */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8A8070', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.08em' }}>
                  {isFr ? 'Numéro WhatsApp' : 'WhatsApp Number'}
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select
                    value={countryCode}
                    onChange={e => setCountryCode(e.target.value)}
                    style={{
                      flexShrink: 0, padding: '12px 10px', border: '1.5px solid #E8DDD0',
                      borderRadius: 12, background: '#F7F5F0', fontSize: 13, fontWeight: 500,
                      fontFamily: "'DM Sans',sans-serif", color: '#1A1710', cursor: 'pointer',
                      outline: 'none', appearance: 'none', minWidth: 100,
                    }}
                  >
                    {COUNTRY_CODES.map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !loading && sendOtp()}
                    placeholder={isFr ? '77 123 45 67' : '555 123 4567'}
                    autoFocus
                    style={{
                      flex: 1, padding: '12px 16px', border: '1.5px solid #E8DDD0',
                      borderRadius: 12, fontSize: 15, fontWeight: 500,
                      fontFamily: "'DM Sans',sans-serif", color: '#1A1710',
                      outline: 'none', background: '#fff',
                    }}
                  />
                </div>
              </div>

              {error && (
                <div style={{ fontSize: 13, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '9px 12px', marginBottom: 12 }}>
                  {error}
                </div>
              )}

              <button
                onClick={sendOtp}
                disabled={loading || cooldown > 0}
                style={{
                  width: '100%', padding: '14px', background: loading || cooldown > 0 ? '#E8DDD0' : '#52B5D9',
                  color: '#fff', border: 'none', borderRadius: 12,
                  fontFamily: "'DM Sans',sans-serif", fontSize: 15, fontWeight: 600,
                  cursor: loading || cooldown > 0 ? 'not-allowed' : 'pointer',
                  transition: 'background .2s',
                }}
              >
                {loading
                  ? (isFr ? 'Envoi en cours...' : 'Sending...')
                  : cooldown > 0
                  ? (isFr ? `Réessayer dans ${cooldown}s` : `Retry in ${cooldown}s`)
                  : (isFr ? 'Envoyer le code →' : 'Send code →')}
              </button>

              <button
                onClick={onClose}
                style={{
                  width: '100%', marginTop: 10, padding: '11px', borderRadius: 12,
                  border: '1px solid rgba(0,0,0,.1)', background: 'transparent',
                  color: '#8A8070', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                  fontFamily: "'DM Sans',sans-serif", textAlign: 'center',
                }}
              >
                {isFr ? "Passer pour l'instant" : 'Skip for now'}
              </button>

              <p style={{ fontSize: 11, color: '#AAA098', textAlign: 'center', marginTop: 12, lineHeight: 1.5 }}>
                {isFr
                  ? "En vérifiant, vous confirmez que ce numéro vous appartient et acceptez d'être contacté via WhatsApp."
                  : "By verifying, you confirm this number is yours and agree to be reached via WhatsApp."}
              </p>
            </>
          )}

          {/* ── STEP: OTP ── */}
          {step === 'otp' && (
            <>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ display:'flex', justifyContent:'center', marginBottom: 8 }}><PhoneIcon size={36} color="#25D366" /></div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#1A1710', letterSpacing: '-.3px', marginBottom: 6 }}>
                  {isFr ? 'Code envoyé !' : 'Code sent!'}
                </div>
                <p style={{ fontSize: 13, color: '#6B6860', lineHeight: 1.6, margin: 0 }}>
                  {isFr
                    ? <>Vérifiez WhatsApp sur <strong style={{ color: '#1A1710' }}>{fullPhone}</strong><br />et entrez le code à 6 chiffres ci-dessous.</>
                    : <>Check WhatsApp on <strong style={{ color: '#1A1710' }}>{fullPhone}</strong><br />and enter the 6-digit code below.</>}
                </p>
              </div>

              {/* OTP input grid */}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 18 }} onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => otpRefs.current[i] = el}
                    className={`wa-otp-input${digit ? ' filled' : ''}`}
                    type="number"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    autoFocus={i === 0}
                    onChange={e => handleOtpInput(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                  />
                ))}
              </div>

              {/* Expiry timer */}
              <div style={{ textAlign: 'center', marginBottom: 14 }}>
                {timeLeft > 0
                  ? <span style={{ fontSize: 12, color: timeLeft < 60 ? '#DC2626' : '#8A8070' }}>
                      {isFr ? `Code valide encore ${fmtTime(timeLeft)}` : `Code expires in ${fmtTime(timeLeft)}`}
                    </span>
                  : <span style={{ fontSize: 12, color: '#DC2626', fontWeight: 600 }}>
                      {isFr ? 'Code expiré' : 'Code expired'}
                    </span>}
              </div>

              {error && (
                <div style={{ fontSize: 13, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '9px 12px', marginBottom: 12 }}>
                  {error}
                </div>
              )}

              <button
                onClick={verifyOtp}
                disabled={loading || otp.join('').length < 6}
                style={{
                  width: '100%', padding: '14px',
                  background: loading || otp.join('').length < 6 ? '#E8DDD0' : '#2D8B4E',
                  color: '#fff', border: 'none', borderRadius: 12,
                  fontFamily: "'DM Sans',sans-serif", fontSize: 15, fontWeight: 600,
                  cursor: loading || otp.join('').length < 6 ? 'not-allowed' : 'pointer',
                  transition: 'background .2s', marginBottom: 12,
                }}
              >
                {loading ? (isFr ? 'Vérification...' : 'Verifying...') : (isFr ? 'Confirmer →' : 'Confirm →')}
              </button>

              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={() => { setStep('phone'); setOtp(['','','','','','']); setError('') }}
                  style={{ fontSize: 13, color: '#52B5D9', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontWeight: 500 }}
                >
                  {isFr ? '← Changer de numéro' : '← Change number'}
                </button>
                {cooldown === 0 && (
                  <>
                    <span style={{ fontSize: 13, color: '#D0C8C0', margin: '0 8px' }}>·</span>
                    <button
                      onClick={() => { setOtp(['','','','','','']); setError(''); sendOtp() }}
                      disabled={loading}
                      style={{ fontSize: 13, color: '#8A8070', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}
                    >
                      {isFr ? 'Renvoyer le code' : 'Resend code'}
                    </button>
                  </>
                )}
              </div>
            </>
          )}

          {/* ── STEP: SUCCESS ── */}
          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <VerifiedBadge size="lg" showLabel />
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#1A1710', marginBottom: 8, letterSpacing: '-.4px' }}>
                {isFr ? 'Compte vérifié !' : 'Account verified!'}
              </div>
              <p style={{ fontSize: 14, color: '#6B6860', lineHeight: 1.6, margin: 0 }}>
                {isFr
                  ? "Votre badge de vérification est maintenant visible sur votre profil et vos annonces."
                  : "Your verification badge is now visible on your profile and listings."}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
