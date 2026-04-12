import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { Package, Smartphone, ArrowLeft, CheckCircle } from 'lucide-react'
import PhoneInput from '../components/auth/PhoneInput'
import OTPInput from '../components/auth/OTPInput'

function ProfileStep({ isFr, onComplete }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState('')

  const canContinue = firstName.trim() && role

  return (
    <div style={{ padding: '40px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1A1710', marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>
        {isFr ? 'Completez votre profil' : 'Complete your profile'}
      </h2>
      <p style={{ fontSize: 14, color: '#8A8070', marginBottom: 28, fontFamily: "'DM Sans', sans-serif" }}>
        {isFr ? 'Comment devrions-nous vous appeler ?' : 'What should we call you?'}
      </p>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#3D3829', marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>
          {isFr ? 'Prenom' : 'First Name'}
        </label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder={isFr ? 'Votre prenom' : 'Your first name'}
          style={{
            width: '100%', padding: '13px 14px',
            border: '2px solid #E0DAD0', borderRadius: 12,
            fontSize: 15, outline: 'none', boxSizing: 'border-box',
            fontFamily: "'DM Sans', sans-serif",
            transition: 'border-color .2s',
          }}
          onFocus={e => e.target.style.borderColor = '#C8891C'}
          onBlur={e => e.target.style.borderColor = '#E0DAD0'}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#3D3829', marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>
          {isFr ? 'Nom (optionnel)' : 'Last Name (optional)'}
        </label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder={isFr ? 'Votre nom' : 'Your last name'}
          style={{
            width: '100%', padding: '13px 14px',
            border: '2px solid #E0DAD0', borderRadius: 12,
            fontSize: 15, outline: 'none', boxSizing: 'border-box',
            fontFamily: "'DM Sans', sans-serif",
            transition: 'border-color .2s',
          }}
          onFocus={e => e.target.style.borderColor = '#C8891C'}
          onBlur={e => e.target.style.borderColor = '#E0DAD0'}
        />
      </div>

      <p style={{ fontSize: 13, fontWeight: 600, color: '#3D3829', marginBottom: 10, fontFamily: "'DM Sans', sans-serif" }}>
        {isFr ? 'Je veux :' : 'I want to:'}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
        {[
          { id: 'sender',   label: isFr ? 'Envoyer des colis'      : 'Send packages' },
          { id: 'traveler', label: isFr ? 'Voyager avec des colis'  : 'Travel with packages' },
          { id: 'both',     label: isFr ? 'Les deux'                : 'Both' },
        ].map((option) => (
          <label
            key={option.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 14px',
              border: `2px solid ${role === option.id ? '#C8891C' : '#E0DAD0'}`,
              borderRadius: 12,
              background: role === option.id ? '#FDF6ED' : '#fff',
              cursor: 'pointer',
              transition: 'all .15s',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <input
              type="radio" name="role" value={option.id}
              checked={role === option.id}
              onChange={() => setRole(option.id)}
              style={{ width: 18, height: 18, accentColor: '#C8891C' }}
            />
            <span style={{ fontSize: 14, color: '#1A1710', fontWeight: 500 }}>{option.label}</span>
          </label>
        ))}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 16 }}>
        <button
          onClick={() => onComplete({ firstName: firstName.trim(), lastName: lastName.trim(), role })}
          disabled={!canContinue}
          style={{
            width: '100%', padding: '15px 24px',
            background: canContinue ? '#C8891C' : '#E0DAD0',
            color: canContinue ? '#fff' : '#A09080',
            border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 600,
            cursor: canContinue ? 'pointer' : 'not-allowed',
            fontFamily: "'DM Sans', sans-serif",
            transition: 'all .2s',
          }}
        >
          {isFr ? 'Continuer' : 'Continue'}
        </button>

        <button
          onClick={() => onComplete({ firstName: firstName.trim() || 'User', lastName: '', role: 'both' })}
          style={{
            width: '100%', marginTop: 10, padding: '10px',
            background: 'transparent', color: '#8A8070', border: 'none',
            fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {isFr ? "Passer pour l'instant" : 'Skip for now'}
        </button>
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
      if (data.isNewUser) {
        setStep(STEPS.PROFILE)
      } else {
        setStep(STEPS.COMPLETE)
        setTimeout(() => onComplete?.(data.user), 800)
      }
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
        .update({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          role: profileData.role,
        })
        .eq('id', user.id)

      if (error) throw error

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
        background: 'linear-gradient(135deg, #C8891C 0%, #A07015 100%)',
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
          background: '#C8891C', color: '#fff',
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
        {isFr ? 'Continuer avec le telephone' : 'Continue with Phone'}
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
        onMouseEnter={e => e.currentTarget.style.borderColor = '#C8891C80'}
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
              color: '#C8891C', background: 'none', border: 'none',
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

      <div style={{ marginBottom: 20 }}>
        <PhoneInput value={phone} onChange={setPhone} onValid={setPhoneValid} lang={lang} />
      </div>

      {errorBox()}

      <div style={{ marginTop: 'auto', paddingTop: 20 }}>
        <button
          onClick={handlePhoneSubmit}
          disabled={!phoneValid || loading}
          style={{
            width: '100%', padding: '16px 24px',
            background: phoneValid && !loading ? '#C8891C' : '#E0DAD0',
            color: phoneValid && !loading ? '#fff' : '#A09080',
            border: 'none', borderRadius: 14,
            fontSize: 16, fontWeight: 600,
            cursor: phoneValid && !loading ? 'pointer' : 'not-allowed',
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: phoneValid && !loading ? '0 4px 16px rgba(200, 137, 28, 0.25)' : 'none',
            transition: 'all .2s',
          }}
        >
          {loading
            ? (isFr ? 'Envoi en cours...' : 'Sending...')
            : (isFr ? 'Continuer' : 'Continue')
          }
        </button>
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
          <Smartphone size={28} color="#C8891C" />
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
            border: '3px solid #E0DAD0', borderTopColor: '#C8891C',
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
            <span style={{ fontWeight: 700, color: '#C8891C' }}>{countdown}s</span>
          </p>
        ) : (
          <button
            onClick={handlePhoneSubmit}
            style={{
              background: 'none', border: 'none', color: '#C8891C',
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
    <ProfileStep isFr={isFr} onComplete={handleProfileComplete} />
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
        border: '3px solid #E0DAD0', borderTopColor: '#C8891C',
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
          background: linear-gradient(160deg, #F5F1EC 0%, #E8E0D4 50%, #D8CFC0 100%);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 24px 16px;
          font-family: 'DM Sans', sans-serif;
        }
        .auth-card {
          width: 100%;
          max-width: 420px;
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 12px 48px rgba(0,0,0,0.08);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          min-height: 540px;
          position: relative;
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
                background: '#C8891C',
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
