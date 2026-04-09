import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import PhoneInput from '../components/auth/PhoneInput'
import OTPInput from '../components/auth/OTPInput'
import PINInput from '../components/auth/PINInput'

const STEPS = {
  WELCOME: 'welcome',
  PHONE: 'phone',
  OTP: 'otp',
  PIN_CREATE: 'pin_create',
  PIN_CONFIRM: 'pin_confirm',
  PROFILE: 'profile',
  BIOMETRIC: 'biometric',
  COMPLETE: 'complete',
}

export default function PhoneAuth({ lang = 'en', onComplete }) {
  const isFr = lang === 'fr'
  const [step, setStep] = useState(STEPS.WELCOME)
  const [phone, setPhone] = useState('')
  const [phoneValid, setPhoneValid] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [user, setUser] = useState(null)
  const [debugCode, setDebugCode] = useState('') // DEBUG: Remove in production

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handlePhoneSubmit = async () => {
    if (!phoneValid) return
    
    setLoading(true)
    setError('')
    
    try {
      // Send OTP via API
      const res = await fetch('/api/send-phone-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send code')
      }
      
      // DEBUG: Store code for display (remove in production)
      if (data.debugCode) {
        setDebugCode(data.debugCode)
      }
      
      setCountdown(30)
      setStep(STEPS.OTP)
    } catch (err) {
      setError(err.message || (isFr ? 'Erreur lors de l\'envoi' : 'Error sending code'))
    } finally {
      setLoading(false)
    }
  }

  const handleOtpComplete = async (code) => {
    setLoading(true)
    setError('')
    
    try {
      // Verify OTP
      const res = await fetch('/api/verify-phone-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Invalid code')
      }
      
      // Check if new or existing user
      if (data.isNewUser) {
        setUser(data.user)
        setStep(STEPS.PIN_CREATE)
      } else {
        // Existing user - check if they have PIN
        if (data.hasPin) {
          setUser(data.user)
          onComplete?.(data.user)
        } else {
          setUser(data.user)
          setStep(STEPS.PIN_CREATE)
        }
      }
    } catch (err) {
      setError(err.message || (isFr ? 'Code incorrect' : 'Invalid code'))
      // Clear OTP on error
      setOtpCode('')
    } finally {
      setLoading(false)
    }
  }

  const handlePinCreateComplete = (createdPin) => {
    setPin(createdPin)
    setStep(STEPS.PIN_CONFIRM)
  }

  const handlePinConfirmComplete = async (confirmedPin) => {
    if (confirmedPin !== pin) {
      setPinError(isFr ? 'Les codes ne correspondent pas' : "PINs don't match")
      return
    }
    
    setLoading(true)
    
    try {
      // Save PIN
      const res = await fetch('/api/set-user-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id, 
          pin: confirmedPin 
        }),
      })
      
      if (!res.ok) {
        throw new Error('Failed to save PIN')
      }
      
      setStep(STEPS.PROFILE)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
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
      
      setStep(STEPS.BIOMETRIC)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBiometricSkip = () => {
    setStep(STEPS.COMPLETE)
    setTimeout(() => onComplete?.(user), 500)
  }

  const handleBiometricEnable = () => {
    // Enable biometrics
    setStep(STEPS.COMPLETE)
    setTimeout(() => onComplete?.(user), 500)
  }

  // Render steps
  const renderWelcome = () => (
    <div style={{ textAlign: 'center', padding: '40px 24px' }}>
      <div style={{ fontSize: 64, marginBottom: 24 }}>📦✈️</div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1A1710', marginBottom: 12 }}>
        {isFr ? 'Yobbu' : 'Yobbu'}
      </h1>
      <p style={{ fontSize: 16, color: '#6B6860', marginBottom: 40, lineHeight: 1.6 }}>
        {isFr 
          ? 'Envoyez des colis avec des voyageurs qui vont dans votre direction'
          : 'Send packages with travelers going your way'}
      </p>
      
      <button
        onClick={() => setStep(STEPS.PHONE)}
        style={{
          width: '100%',
          padding: '16px 24px',
          background: '#C8891C',
          color: '#fff',
          border: 'none',
          borderRadius: 14,
          fontSize: 17,
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: 12,
        }}
      >
        {isFr ? 'Continuer avec le téléphone' : 'Continue with Phone'}
      </button>
      
      <button
        onClick={() => onComplete?.(null, 'browse')}
        style={{
          width: '100%',
          padding: '14px 24px',
          background: 'transparent',
          color: '#8A8070',
          border: '2px solid #E8DDD0',
          borderRadius: 14,
          fontSize: 15,
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        {isFr ? 'Parcourir d\'abord' : 'Browse First'}
      </button>
      
      <p style={{ marginTop: 24, fontSize: 13, color: '#8A8070' }}>
        {isFr ? 'Déjà un compte ? ' : 'Already have an account? '}
        <button 
          onClick={() => setStep(STEPS.PHONE)}
          style={{ color: '#C8891C', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          {isFr ? 'Se connecter' : 'Log In'}
        </button>
      </p>
    </div>
  )

  const renderPhone = () => (
    <div style={{ padding: '24px' }}>
      <button 
        onClick={() => setStep(STEPS.WELCOME)}
        style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', marginBottom: 24 }}
      >
        ←
      </button>
      
      <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1A1710', marginBottom: 8 }}>
        {isFr ? 'Quel est votre numéro ?' : 'What\'s your number?'}
      </h2>
      <p style={{ fontSize: 14, color: '#8A8070', marginBottom: 32 }}>
        {isFr ? 'Nous vous enverrons un code de vérification.' : 'We\'ll send you a verification code.'}
      </p>
      
      <PhoneInput
        value={phone}
        onChange={setPhone}
        onValid={setPhoneValid}
        lang={lang}
      />
      
      {error && (
        <div style={{ 
          marginTop: 16, 
          padding: 12, 
          background: '#FEF2F2', 
          borderRadius: 8,
          color: '#DC2626',
          fontSize: 14,
        }}>
          {error}
        </div>
      )}
      
      <button
        onClick={handlePhoneSubmit}
        disabled={!phoneValid || loading}
        style={{
          width: '100%',
          marginTop: 24,
          padding: '16px 24px',
          background: phoneValid && !loading ? '#C8891C' : '#E8DDD0',
          color: phoneValid && !loading ? '#fff' : '#8A8070',
          border: 'none',
          borderRadius: 14,
          fontSize: 17,
          fontWeight: 600,
          cursor: phoneValid && !loading ? 'pointer' : 'not-allowed',
        }}
      >
        {loading 
          ? (isFr ? 'Envoi...' : 'Sending...')
          : (isFr ? 'Continuer' : 'Continue')
        }
      </button>
      
      <p style={{ marginTop: 24, fontSize: 12, color: '#8A8070', textAlign: 'center' }}>
        {isFr 
          ? 'En continuant, vous acceptez nos Conditions et notre Politique de confidentialité'
          : 'By continuing, you agree to our Terms and Privacy Policy'}
      </p>
    </div>
  )

  const renderOtp = () => (
    <div style={{ padding: '24px' }}>
      <button 
        onClick={() => setStep(STEPS.PHONE)}
        style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', marginBottom: 24 }}
      >
        ←
      </button>
      
      <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1A1710', marginBottom: 8 }}>
        {isFr ? 'Entrez le code' : 'Enter the code'}
      </h2>
      <p style={{ fontSize: 14, color: '#8A8070', marginBottom: 32 }}>
        {isFr 
          ? `Envoyé à ${phone}` 
          : `Sent to ${phone}`}
      </p>
      
      <OTPInput
        length={6}
        onComplete={handleOtpComplete}
        onChange={setOtpCode}
        lang={lang}
      />
      
      {/* DEBUG: Show code for testing (remove in production) */}
      {debugCode && (
        <div style={{ 
          marginTop: 16, 
          padding: 12, 
          background: '#F0F7FF', 
          border: '1px dashed #185FA5',
          borderRadius: 8,
          color: '#185FA5',
          fontSize: 14,
          textAlign: 'center',
          fontFamily: 'monospace',
        }}>
          <div style={{ fontSize: 11, marginBottom: 4, color: '#5A7A95' }}>
            {isFr ? 'CODE DE DÉBOGAGE (TEST)' : 'DEBUG CODE (TESTING)'}
          </div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{debugCode}</div>
        </div>
      )}
      
      {error && (
        <div style={{ 
          marginTop: 16, 
          padding: 12, 
          background: '#FEF2F2', 
          borderRadius: 8,
          color: '#DC2626',
          fontSize: 14,
          textAlign: 'center',
        }}>
          {error}
        </div>
      )}
      
      {loading && (
        <div style={{ marginTop: 24, textAlign: 'center', color: '#8A8070' }}>
          {isFr ? 'Vérification...' : 'Verifying...'}
        </div>
      )}
      
      <div style={{ marginTop: 32, textAlign: 'center' }}>
        {countdown > 0 ? (
          <span style={{ color: '#8A8070', fontSize: 14 }}>
            {isFr ? 'Renvoyer dans' : 'Resend in'} {countdown}s
          </span>
        ) : (
          <button
            onClick={handlePhoneSubmit}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#C8891C', 
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            {isFr ? 'Renvoyer le code' : 'Resend code'}
          </button>
        )}
        <br />
        <button
          onClick={() => setStep(STEPS.PHONE)}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#8A8070', 
            fontSize: 13,
            cursor: 'pointer',
            marginTop: 12,
          }}
        >
          {isFr ? 'Changer de numéro' : 'Change number'}
        </button>
      </div>
    </div>
  )

  const renderPinCreate = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1A1710', marginBottom: 8, textAlign: 'center' }}>
        {isFr ? 'Créer un code PIN' : 'Create a PIN'}
      </h2>
      <p style={{ fontSize: 14, color: '#8A8070', marginBottom: 40, textAlign: 'center' }}>
        {isFr 
          ? '4 chiffres pour sécuriser votre compte sur cet appareil'
          : '4 digits to secure your account on this device'}
      </p>
      
      <PINInput
        length={4}
        onComplete={handlePinCreateComplete}
        onChange={setPin}
        lang={lang}
      />
    </div>
  )

  const renderPinConfirm = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1A1710', marginBottom: 8, textAlign: 'center' }}>
        {isFr ? 'Confirmer le code' : 'Confirm your PIN'}
      </h2>
      <p style={{ fontSize: 14, color: '#8A8070', marginBottom: 40, textAlign: 'center' }}>
        {isFr ? 'Entrez à nouveau pour confirmer' : 'Enter again to confirm'}
      </p>
      
      <PINInput
        length={4}
        verifyMode={true}
        compareTo={pin}
        onComplete={handlePinConfirmComplete}
        onChange={setConfirmPin}
        error={pinError}
        lang={lang}
      />
    </div>
  )

  const renderProfile = () => {
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [role, setRole] = useState('')
    
    return (
      <div style={{ padding: '24px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1A1710', marginBottom: 8 }}>
          {isFr ? 'Complétez votre profil' : 'Complete your profile'}
        </h2>
        <p style={{ fontSize: 14, color: '#8A8070', marginBottom: 32 }}>
          {isFr ? 'Comment devrions-nous vous appeler ?' : 'What should we call you?'}
        </p>
        
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1A1710', marginBottom: 8 }}>
            {isFr ? 'Prénom' : 'First Name'}
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder={isFr ? 'Votre prénom' : 'Your first name'}
            style={{
              width: '100%',
              padding: '14px 16px',
              border: '2px solid #E8DDD0',
              borderRadius: 12,
              fontSize: 16,
              outline: 'none',
            }}
          />
        </div>
        
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1A1710', marginBottom: 8 }}>
            {isFr ? 'Nom (optionnel)' : 'Last Name (optional)'}
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder={isFr ? 'Votre nom' : 'Your last name'}
            style={{
              width: '100%',
              padding: '14px 16px',
              border: '2px solid #E8DDD0',
              borderRadius: 12,
              fontSize: 16,
              outline: 'none',
            }}
          />
        </div>
        
        <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1710', marginBottom: 12 }}>
          {isFr ? 'Je veux :' : 'I want to:'}
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
          {[
            { id: 'sender', label: isFr ? 'Envoyer des colis' : 'Send packages' },
            { id: 'traveler', label: isFr ? 'Voyager avec des colis' : 'Travel with packages' },
            { id: 'both', label: isFr ? 'Les deux' : 'Both' },
          ].map((option) => (
            <label
              key={option.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 16px',
                border: `2px solid ${role === option.id ? '#C8891C' : '#E8DDD0'}`,
                borderRadius: 12,
                background: role === option.id ? '#FDF0E8' : '#fff',
                cursor: 'pointer',
              }}
            >
              <input
                type="radio"
                name="role"
                value={option.id}
                checked={role === option.id}
                onChange={() => setRole(option.id)}
                style={{ width: 20, height: 20, accentColor: '#C8891C' }}
              />
              <span style={{ fontSize: 15, color: '#1A1710' }}>{option.label}</span>
            </label>
          ))}
        </div>
        
        <button
          onClick={() => handleProfileComplete({ firstName, lastName, role })}
          disabled={!firstName || !role}
          style={{
            width: '100%',
            padding: '16px 24px',
            background: firstName && role ? '#C8891C' : '#E8DDD0',
            color: firstName && role ? '#fff' : '#8A8070',
            border: 'none',
            borderRadius: 14,
            fontSize: 17,
            fontWeight: 600,
            cursor: firstName && role ? 'pointer' : 'not-allowed',
          }}
        >
          {isFr ? 'Continuer' : 'Continue'}
        </button>
        
        <button
          onClick={() => handleProfileComplete({ firstName, lastName, role: 'both' })}
          style={{
            width: '100%',
            marginTop: 12,
            padding: '12px',
            background: 'transparent',
            color: '#8A8070',
            border: 'none',
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          {isFr ? 'Passer pour l\'instant' : 'Skip for now'}
        </button>
      </div>
    )
  }

  const renderBiometric = () => (
    <div style={{ padding: '40px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 64, marginBottom: 24 }}>👆</div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1A1710', marginBottom: 12 }}>
        {isFr ? 'Utiliser Face ID ?' : 'Use Face ID?'}
      </h2>
      <p style={{ fontSize: 15, color: '#6B6860', marginBottom: 40, lineHeight: 1.6 }}>
        {isFr 
          ? 'Plus rapide et plus sûr que de taper votre code PIN'
          : 'Faster and more secure than typing your PIN'}
      </p>
      
      <button
        onClick={handleBiometricEnable}
        style={{
          width: '100%',
          padding: '16px 24px',
          background: '#C8891C',
          color: '#fff',
          border: 'none',
          borderRadius: 14,
          fontSize: 17,
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: 12,
        }}
      >
        {isFr ? 'Activer Face ID' : 'Enable Face ID'}
      </button>
      
      <button
        onClick={handleBiometricSkip}
        style={{
          width: '100%',
          padding: '14px 24px',
          background: 'transparent',
          color: '#8A8070',
          border: 'none',
          fontSize: 15,
          cursor: 'pointer',
        }}
      >
        {isFr ? 'Plus tard' : 'Maybe Later'}
      </button>
    </div>
  )

  const renderComplete = () => (
    <div style={{ padding: '60px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 80, marginBottom: 24 }}>🎉</div>
      <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1A1710', marginBottom: 12 }}>
        {isFr ? 'Bienvenue !' : 'Welcome!'}
      </h2>
      <p style={{ fontSize: 16, color: '#6B6860', marginBottom: 40 }}>
        {isFr 
          ? 'Votre compte est prêt. Commencez à explorer !'
          : 'Your account is ready. Start exploring!'}
      </p>
      
      <div style={{ 
        width: 40, 
        height: 40, 
        border: '4px solid #E8DDD0', 
        borderTopColor: '#C8891C',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  // Main render
  const renderStep = () => {
    switch (step) {
      case STEPS.WELCOME: return renderWelcome()
      case STEPS.PHONE: return renderPhone()
      case STEPS.OTP: return renderOtp()
      case STEPS.PIN_CREATE: return renderPinCreate()
      case STEPS.PIN_CONFIRM: return renderPinConfirm()
      case STEPS.PROFILE: return renderProfile()
      case STEPS.BIOMETRIC: return renderBiometric()
      case STEPS.COMPLETE: return renderComplete()
      default: return renderWelcome()
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F7F5F0',
      display: 'flex',
      justifyContent: 'center',
      alignItems: step === STEPS.WELCOME ? 'center' : 'flex-start',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: '#fff',
        minHeight: step === STEPS.WELCOME ? 'auto' : '100vh',
        borderRadius: step === STEPS.WELCOME ? 20 : 0,
        boxShadow: step === STEPS.WELCOME ? '0 20px 60px rgba(0,0,0,0.15)' : 'none',
        overflow: 'hidden',
      }}>
        {renderStep()}
      </div>
    </div>
  )
}
