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
      
      const text = await res.text()
      let data
      try {
        data = JSON.parse(text)
      } catch (e) {
        console.error('Non-JSON response:', text.substring(0, 200))
        throw new Error(isFr ? 'Erreur serveur. Réessayez.' : 'Server error. Please try again.')
      }
      
      if (!res.ok) {
        throw new Error(data.error || (isFr ? 'Erreur lors de l\'envoi' : 'Failed to send code'))
      }
      
      // DEBUG: Store code for display (remove in production)
      if (data.debugCode) {
        setDebugCode(data.debugCode)
      }
      
      setCountdown(60)
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
    <div style={{ 
      textAlign: 'center', 
      padding: '60px 32px 40px',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    }}>
      {/* Logo/Icon */}
      <div style={{ 
        width: 100, 
        height: 100, 
        background: 'linear-gradient(135deg, #C8891C 0%, #A07015 100%)',
        borderRadius: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 32px',
        boxShadow: '0 8px 30px rgba(200, 137, 28, 0.3)',
      }}>
        <span style={{ fontSize: 48 }}>📦</span>
      </div>
      
      <h1 style={{ 
        fontSize: 32, 
        fontWeight: 800, 
        color: '#1A1710', 
        marginBottom: 16,
        letterSpacing: '-0.5px',
      }}>
        Yobbu
      </h1>
      
      <p style={{ 
        fontSize: 17, 
        color: '#6B6860', 
        marginBottom: 48, 
        lineHeight: 1.6,
        maxWidth: 320,
        margin: '0 auto 48px',
      }}>
        {isFr 
          ? 'Envoyez des colis avec des voyageurs qui vont dans votre direction'
          : 'Send packages with travelers going your way. Fast, secure, and affordable.'}
      </p>
      
      {/* Primary CTA */}
      <button
        onClick={() => setStep(STEPS.PHONE)}
        style={{
          width: '100%',
          padding: '18px 24px',
          background: '#C8891C',
          color: '#fff',
          border: 'none',
          borderRadius: 16,
          fontSize: 17,
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: 16,
          boxShadow: '0 4px 20px rgba(200, 137, 28, 0.3)',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
      >
        {isFr ? 'Continuer avec le téléphone' : 'Continue with Phone'}
      </button>
      
      {/* Secondary CTA */}
      <button
        onClick={() => onComplete?.(null, 'browse')}
        style={{
          width: '100%',
          padding: '16px 24px',
          background: 'transparent',
          color: '#6B6860',
          border: '2px solid #E8DDD0',
          borderRadius: 16,
          fontSize: 16,
          fontWeight: 500,
          cursor: 'pointer',
          marginBottom: 32,
        }}
      >
        {isFr ? 'Parcourir d\'abord' : 'Browse First'}
      </button>
      
      {/* Footer */}
      <div style={{ marginTop: 'auto', paddingTop: 24 }}>
        <p style={{ fontSize: 14, color: '#8A8070' }}>
          {isFr ? 'Déjà un compte ? ' : 'Already have an account? '}
          <button 
            onClick={() => setStep(STEPS.PHONE)}
            style={{ 
              color: '#C8891C', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {isFr ? 'Se connecter' : 'Log In'}
          </button>
        </p>
        
        <p style={{ marginTop: 16, fontSize: 12, color: '#A8A095', maxWidth: 280, margin: '16px auto 0' }}>
          {isFr 
            ? 'En continuant, vous acceptez nos Conditions et notre Politique de confidentialité'
            : 'By continuing, you agree to our Terms and Privacy Policy'}
        </p>
      </div>
    </div>
  )

  const renderPhone = () => (
    <div style={{ 
      padding: '40px 32px',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header with back button */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
        <button 
          onClick={() => setStep(STEPS.WELCOME)}
          style={{ 
            background: 'none', 
            border: 'none', 
            fontSize: 20, 
            cursor: 'pointer',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 12,
            color: '#1A1710',
            transition: 'background 0.2s',
          }}
        >
          ←
        </button>
      </div>
      
      {/* Title */}
      <h2 style={{ 
        fontSize: 28, 
        fontWeight: 700, 
        color: '#1A1710', 
        marginBottom: 12,
      }}>
        {isFr ? 'Quel est votre numéro ?' : 'What\'s your number?'}
      </h2>
      <p style={{ 
        fontSize: 15, 
        color: '#6B6860', 
        marginBottom: 40,
        lineHeight: 1.5,
      }}>
        {isFr ? 'Nous vous enverrons un code de vérification par SMS.' : 'We\'ll send you a verification code via SMS.'}
      </p>
      
      {/* Phone Input */}
      <div style={{ marginBottom: 24 }}>
        <PhoneInput
          value={phone}
          onChange={setPhone}
          onValid={setPhoneValid}
          lang={lang}
        />
      </div>
      
      {error && (
        <div style={{ 
          marginBottom: 16, 
          padding: 14, 
          background: '#FEF2F2', 
          borderRadius: 12,
          border: '1px solid #FECACA',
          color: '#DC2626',
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span>⚠️</span>
          {error}
        </div>
      )}
      
      {/* Continue Button - Fixed at bottom */}
      <div style={{ marginTop: 'auto', paddingTop: 24 }}>
        <button
          onClick={handlePhoneSubmit}
          disabled={!phoneValid || loading}
          style={{
            width: '100%',
            padding: '18px 24px',
            background: phoneValid && !loading ? '#C8891C' : '#E8DDD0',
            color: phoneValid && !loading ? '#fff' : '#8A8070',
            border: 'none',
            borderRadius: 16,
            fontSize: 17,
            fontWeight: 600,
            cursor: phoneValid && !loading ? 'pointer' : 'not-allowed',
            boxShadow: phoneValid && !loading ? '0 4px 20px rgba(200, 137, 28, 0.3)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          {loading 
            ? (isFr ? 'Envoi en cours...' : 'Sending...')
            : (isFr ? 'Continuer' : 'Continue')
          }
        </button>
        
        <p style={{ marginTop: 20, fontSize: 12, color: '#A8A095', textAlign: 'center' }}>
          {isFr 
            ? 'En continuant, vous acceptez nos Conditions'
            : 'By continuing, you agree to our Terms'}
        </p>
      </div>
    </div>
  )

  const renderOtp = () => (
    <div style={{ 
      padding: '40px 32px',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
        <button 
          onClick={() => setStep(STEPS.PHONE)}
          style={{ 
            background: 'none', 
            border: 'none', 
            fontSize: 20, 
            cursor: 'pointer',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 12,
            color: '#1A1710',
          }}
        >
          ←
        </button>
      </div>
      
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ 
          width: 64, 
          height: 64, 
          background: 'linear-gradient(135deg, #C8891C20 0%, #C8891C10 100%)',
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <span style={{ fontSize: 32 }}>📱</span>
        </div>
        
        <h2 style={{ 
          fontSize: 26, 
          fontWeight: 700, 
          color: '#1A1710', 
          marginBottom: 12,
        }}>
          {isFr ? 'Entrez le code' : 'Enter the code'}
        </h2>
        <p style={{ fontSize: 15, color: '#6B6860', marginBottom: 8 }}>
          {isFr 
            ? `Code envoyé à ${phone}` 
            : `Code sent to ${phone}`}
        </p>
      </div>
      
      {/* OTP Input */}
      <div style={{ marginBottom: 32 }}>
        <OTPInput
          length={6}
          onComplete={handleOtpComplete}
          onChange={setOtpCode}
          lang={lang}
        />
      </div>
      
      {/* DEBUG: Show code for testing (remove in production) */}
      {debugCode && (
        <div style={{ 
          marginBottom: 24, 
          padding: 16, 
          background: 'linear-gradient(135deg, #F0F7FF 0%, #E8F4FD 100%)', 
          border: '2px dashed #185FA5',
          borderRadius: 12,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, marginBottom: 8, color: '#5A7A95', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
            {isFr ? 'Code de débogage (test)' : 'Debug Code (Testing)'}
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#185FA5', fontFamily: 'monospace', letterSpacing: 4 }}>{debugCode}</div>
        </div>
      )}
      
      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ 
            width: 24, 
            height: 24, 
            border: '3px solid #E8DDD0', 
            borderTopColor: '#C8891C',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 12px',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#6B6860', fontSize: 14 }}>
            {isFr ? 'Vérification en cours...' : 'Verifying...'}
          </p>
        </div>
      )}
      
      {/* Resend / Change Number */}
      <div style={{ marginTop: 'auto', textAlign: 'center', paddingTop: 24 }}>
        {countdown > 0 ? (
          <p style={{ color: '#8A8070', fontSize: 14 }}>
            {isFr ? 'Renvoyer dans' : 'Resend in'} <span style={{ fontWeight: 600, color: '#C8891C' }}>{countdown}s</span>
          </p>
        ) : (
          <button
            onClick={handlePhoneSubmit}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#C8891C', 
              fontWeight: 600,
              fontSize: 15,
              cursor: 'pointer',
              padding: '8px 16px',
            }}
          >
            {isFr ? 'Renvoyer le code' : 'Resend code'}
          </button>
        )}
        
        <div style={{ marginTop: 16 }}>
          <button
            onClick={() => setStep(STEPS.PHONE)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#8A8070', 
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            {isFr ? 'Changer de numéro' : 'Change number'}
          </button>
        </div>
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

  // Responsive styles
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
  
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #C8891C 0%, #1A1710 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: isMobile ? 0 : '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 480,
        background: '#fff',
        minHeight: isMobile ? '100vh' : 'auto',
        maxHeight: isMobile ? '100vh' : '90vh',
        borderRadius: isMobile ? 0 : 24,
        boxShadow: isMobile ? 'none' : '0 25px 80px rgba(0,0,0,0.3)',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}>
        {/* Progress bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: '#E8DDD0',
          zIndex: 10,
        }}>
          <div style={{
            height: '100%',
            background: '#C8891C',
            width: step === STEPS.WELCOME ? '15%' : 
                   step === STEPS.PHONE ? '30%' :
                   step === STEPS.OTP ? '45%' :
                   step === STEPS.PIN_CREATE ? '60%' :
                   step === STEPS.PIN_CONFIRM ? '75%' :
                   step === STEPS.PROFILE ? '85%' : '100%',
            transition: 'width 0.3s ease',
          }} />
        </div>
        
        {renderStep()}
      </div>
    </div>
  )
}
