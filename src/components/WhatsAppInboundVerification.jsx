import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import VerifiedBadge from './VerifiedBadge'
import { PhoneIcon } from './Icons'

const COUNTRY_CODES = [
  { code: '+1',   flag: '🇺🇸', name: 'US / Canada' },
  { code: '+33',  flag: '🇫🇷', name: 'France' },
  { code: '+32',  flag: '🇧🇪', name: 'Belgium' },
  { code: '+221', flag: '🇸🇳', name: 'Senegal' },
  { code: '+224', flag: '🇬🇳', name: 'Guinea' },
  { code: '+225', flag: '🇨🇮', name: "Côte d'Ivoire" },
  { code: '+223', flag: '🇲🇱', name: 'Mali' },
  { code: '+229', flag: '🇧🇯', name: 'Benin' },
  { code: '+228', flag: '🇹🇬', name: 'Togo' },
  { code: '+233', flag: '🇬🇭', name: 'Ghana' },
  { code: '+44',  flag: '🇬🇧', name: 'UK' },
  { code: '+1514', flag: '🇨🇦', name: 'Canada (QC)' },
]

export default function WhatsAppInboundVerification({ user, lang, onClose, onVerified }) {
  const isFr = lang === 'fr'

  const [step, setStep]             = useState('method')   // 'method' | 'generate' | 'waiting' | 'success'
  const [method, setMethod]         = useState('inbound')   // 'inbound' | 'outbound'
  const [countryCode, setCountryCode] = useState('+221')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [code, setCode]             = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [countdown, setCountdown]   = useState(600) // 10 minutes
  const [businessNumber, setBusinessNumber] = useState('')

  // Countdown timer for code expiry
  useEffect(() => {
    if (step !== 'waiting' || countdown <= 0) return
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(timer)
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [step, countdown])

  // Polling for verification status
  useEffect(() => {
    if (step !== 'waiting') return
    
    const checkInterval = setInterval(async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('whatsapp_verified')
          .eq('id', user.id)
          .single()
        
        if (profile?.whatsapp_verified) {
          setStep('success')
          setTimeout(() => { onVerified?.(); onClose() }, 2200)
        }
      } catch {
        // Silent fail on polling
      }
    }, 3000) // Check every 3 seconds

    return () => clearInterval(checkInterval)
  }, [step, user.id])

  // Manual verification - call API to verify
  async function checkManualVerification() {
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/manual-verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        const errorMsg = data.details || data.error || 'Verification failed'
        setError(errorMsg)
        return false
      }
      
      if (data.status === 'success' || data.status === 'already_verified') {
        setStep('success')
        setTimeout(() => { onVerified?.(); onClose() }, 2200)
        return true
      }
      
      return false
    } catch (err) {
      console.error('Manual verification error:', err)
      setError(isFr ? 'Erreur de vérification. Réessayez.' : 'Verification error. Try again.')
      return false
    } finally {
      setLoading(false)
    }
  }

  async function generateCode() {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/generate-inbound-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        // Show detailed error message
        const errorMsg = data.details || data.error || 'Failed to generate code'
        setError(errorMsg)
        console.error('API Error:', data)
        return
      }
      setCode(data.code)
      setBusinessNumber(data.businessNumber)
      setCountdown(600)
      setStep('waiting')
    } catch (err) {
      console.error('Network error:', err)
      setError(
        isFr 
          ? 'Erreur de connexion. Vérifiez votre connexion internet ou réessayez.' 
          : 'Connection error. Check your internet connection or try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  const fullPhone = `${countryCode}${phoneNumber.replace(/\D/g, '')}`

  return (
    <>
      <style>{`
        @keyframes wa-fade-in { from { opacity:0; transform:scale(.97); } to { opacity:1; transform:scale(1); } }
        .wa-modal-box { animation: wa-fade-in .22s ease-out both; }
        .wa-code-box { 
          background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          color: white;
        }
        .wa-code-digit {
          display: inline-block;
          width: 36px;
          height: 48px;
          background: rgba(255,255,255,0.2);
          border-radius: 8px;
          margin: 0 4px;
          font-size: 24px;
          font-weight: 700;
          line-height: 48px;
          text-align: center;
        }
        @media (max-width: 480px) {
          .wa-modal-box { margin: 0 !important; border-radius: 20px 20px 0 0 !important; width: 100% !important; }
          .wa-modal-overlay { align-items: flex-end !important; }
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
            background: '#fff', borderRadius: 20, width: 460, maxWidth: '92vw',
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

          {/* ── STEP: METHOD SELECTION ── */}
          {step === 'method' && (
            <>
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
                    {isFr ? 'Choisissez une méthode' : 'Choose a method'}
                  </div>
                </div>
              </div>

              <p style={{ fontSize: 13, color: '#6B6860', lineHeight: 1.6, marginBottom: 22, marginTop: 14 }}>
                {isFr
                  ? "Vérifiez votre compte en envoyant un message à notre numéro WhatsApp, ou recevez un code par SMS."
                  : "Verify your account by sending a message to our WhatsApp number, or receive a code via SMS."}
              </p>

              {/* Method options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Inbound option */}
                <button
                  onClick={() => { setMethod('inbound'); setStep('generate') }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '16px 18px', borderRadius: 14,
                    border: method === 'inbound' ? '2px solid #25D366' : '2px solid #E8DDD0',
                    background: method === 'inbound' ? '#F0FAF4' : '#fff',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all .2s',
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 10, background: '#25D366',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1710' }}>
                      {isFr ? 'Envoyer un message' : 'Send us a message'}
                    </div>
                    <div style={{ fontSize: 12, color: '#8A8070', marginTop: 2 }}>
                      {isFr ? 'Plus rapide • Vous envoyez le code' : 'Faster • You send the code'}
                    </div>
                  </div>
                  <div style={{ fontSize: 20, color: '#25D366' }}>→</div>
                </button>

                {/* Outbound option */}
                <button
                  onClick={() => { setMethod('outbound'); onClose() }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '16px 18px', borderRadius: 14,
                    border: '2px solid #E8DDD0', background: '#fff',
                    cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 10, background: '#52B5D9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <PhoneIcon size={22} color="white" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1710' }}>
                      {isFr ? 'Recevoir par SMS' : 'Receive via SMS'}
                    </div>
                    <div style={{ fontSize: 12, color: '#8A8070', marginTop: 2 }}>
                      {isFr ? 'Nous vous envoyons le code' : 'We send you the code'}
                    </div>
                  </div>
                </button>
              </div>
            </>
          )}

          {/* ── STEP: GENERATE CODE ── */}
          {step === 'generate' && (
            <>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', background: '#25D366',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 12px',
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.09-1.35C8.5 21.52 10.21 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
                  </svg>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#1A1710' }}>
                  {isFr ? 'Générez votre code' : 'Generate your code'}
                </div>
              </div>

              <p style={{ fontSize: 13, color: '#6B6860', lineHeight: 1.6, marginBottom: 20 }}>
                {isFr
                  ? "Cliquez sur le bouton ci-dessous pour obtenir votre code de vérification unique."
                  : "Click the button below to get your unique verification code."}
              </p>

              {error && (
                <div style={{ fontSize: 13, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '9px 12px', marginBottom: 12 }}>
                  {error}
                </div>
              )}

              <button
                onClick={generateCode}
                disabled={loading}
                style={{
                  width: '100%', padding: '16px',
                  background: loading ? '#E8DDD0' : '#25D366',
                  color: '#fff', border: 'none', borderRadius: 14,
                  fontFamily: "'DM Sans',sans-serif", fontSize: 16, fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background .2s',
                }}
              >
                {loading
                  ? (isFr ? 'Génération...' : 'Generating...')
                  : (isFr ? 'Générer mon code →' : 'Generate my code →')}
              </button>

              <button
                onClick={() => setStep('method')}
                style={{
                  width: '100%', marginTop: 10, padding: '11px', borderRadius: 12,
                  border: '1px solid rgba(0,0,0,.1)', background: 'transparent',
                  color: '#8A8070', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                  fontFamily: "'DM Sans',sans-serif", textAlign: 'center',
                }}
              >
                ← {isFr ? 'Retour' : 'Back'}
              </button>
            </>
          )}

          {/* ── STEP: WAITING FOR MESSAGE ── */}
          {step === 'waiting' && (
            <>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1710', marginBottom: 4 }}>
                  {isFr ? 'Envoyez ce code' : 'Send this code'}
                </div>
                <div style={{ fontSize: 13, color: '#8A8070' }}>
                  {isFr
                    ? <>À notre WhatsApp <strong style={{ color: '#25D366' }}>{businessNumber}</strong></>
                    : <>To our WhatsApp <strong style={{ color: '#25D366' }}>{businessNumber}</strong></>}
                </div>
              </div>

              {/* Code display */}
              <div className="wa-code-box" style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {isFr ? 'Votre code' : 'Your code'}
                </div>
                <div>
                  {code.split('').map((digit, i) => (
                    <span key={i} className="wa-code-digit">{digit}</span>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div style={{ 
                background: '#F7F5F0', borderRadius: 12, padding: 16, marginBottom: 16,
                border: '1px solid #E8DDD0'
              }}>
                <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#6B6860', lineHeight: 1.8 }}>
                  <li>{isFr ? 'Ouvrez WhatsApp sur votre téléphone' : 'Open WhatsApp on your phone'}</li>
                  <li>{isFr ? `Envoyez ce code à ${businessNumber}` : `Send this code to ${businessNumber}`}</li>
                  <li>{isFr ? 'Attendez la confirmation automatique' : 'Wait for automatic confirmation'}</li>
                </ol>
              </div>

              {/* Countdown */}
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 12, color: countdown < 60 ? '#DC2626' : '#8A8070' }}>
                  ⏱ {isFr ? `Expire dans ${fmtTime(countdown)}` : `Expires in ${fmtTime(countdown)}`}
                </span>
              </div>

              {/* Waiting indicator */}
              <div style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '12px 16px', background: '#F0FAF4', borderRadius: 10, marginBottom: 16
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', background: '#25D366',
                  animation: 'wa-pulse 1.5s infinite'
                }} />
                <span style={{ fontSize: 13, color: '#2D8B4E' }}>
                  {isFr ? 'En attente de votre message...' : 'Waiting for your message...'}
                </span>
                <style>{`@keyframes wa-pulse { 0%,100%{opacity:1} 50%{opacity:.3} }`}</style>
              </div>

              {/* Manual verification button */}
              <button
                onClick={checkManualVerification}
                disabled={loading}
                style={{
                  width: '100%', padding: '14px', borderRadius: 12,
                  border: '2px solid #25D366', background: loading ? '#F0FAF4' : '#fff',
                  color: '#25D366', fontSize: 14, fontWeight: 600, 
                  cursor: loading ? 'default' : 'pointer',
                  fontFamily: "'DM Sans',sans-serif", textAlign: 'center',
                  marginBottom: 10,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading 
                  ? (isFr ? 'Vérification...' : 'Verifying...')
                  : (isFr ? '✓ J\'ai envoyé le code' : '✓ I sent the code')
                }
              </button>

              <button
                onClick={() => setStep('method')}
                style={{
                  width: '100%', padding: '11px', borderRadius: 12,
                  border: '1px solid rgba(0,0,0,.1)', background: 'transparent',
                  color: '#8A8070', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                  fontFamily: "'DM Sans',sans-serif", textAlign: 'center',
                }}
              >
                ← {isFr ? 'Annuler' : 'Cancel'}
              </button>
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
                  ? "Votre badge de vérification est maintenant visible sur votre profil."
                  : "Your verification badge is now visible on your profile."}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
