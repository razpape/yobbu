import { useState } from 'react'
import { supabase } from '../lib/supabase'
 
const TABS = ['email', 'phone']
 
export default function AuthModal({ onClose, onSuccess, lang }) {
  const [tab, setTab]         = useState('email')
  const [step, setStep]       = useState('entry')  // entry | otp
  const [email, setEmail]     = useState('')
  const [phone, setPhone]     = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp]         = useState('')
  const [isLogin, setIsLogin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [message, setMessage] = useState(null)
 
  const isFr = lang === 'fr'
 
  const handleEmailSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        onSuccess()
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage(isFr
          ? 'Vérifiez votre email pour confirmer votre compte.'
          : 'Check your email to confirm your account.')
        setStep('otp')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
 
  const handlePhoneSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone })
      if (error) throw error
      setStep('otp')
      setMessage(isFr
        ? 'Code envoyé par SMS. Entrez-le ci-dessous.'
        : 'Code sent by SMS. Enter it below.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
 
  const handleOtpVerify = async () => {
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms',
      })
      if (error) throw error
      onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
 
  const handleOAuth = async (provider) => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    })
    if (error) setError(error.message)
    setLoading(false)
  }
 
  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)',
        display:'flex', alignItems:'center', justifyContent:'center', zIndex:999, padding:'16px' }}
      onClick={onClose}
    >
      <div
        style={{ background:'var(--tw-bg-sand, #FDFAF6)', borderRadius:16, padding:'28px 24px',
          width:'100%', maxWidth:400, border:'1px solid #E8E0D4' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div style={{ fontFamily:'Fraunces,serif', fontSize:20, fontWeight:700, color:'#1C1A17' }}>
            {isLogin
              ? (isFr ? 'Se connecter' : 'Log in')
              : (isFr ? 'Créer un compte' : 'Create account')}
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:18, cursor:'pointer', color:'#A09890' }}>✕</button>
        </div>
 
        {step === 'entry' && (
          <>
            {/* OAuth buttons */}
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
              <button
                onClick={() => handleOAuth('google')}
                disabled={loading}
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                  padding:'10px', borderRadius:10, border:'1px solid #E8E0D4',
                  background:'#fff', cursor:'pointer', fontSize:13, fontWeight:500, color:'#1C1A17' }}
              >
                <span style={{ fontSize:16 }}>G</span>
                {isFr ? 'Continuer avec Google' : 'Continue with Google'}
              </button>
              <button
                onClick={() => handleOAuth('facebook')}
                disabled={loading}
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                  padding:'10px', borderRadius:10, border:'none',
                  background:'#1877F2', cursor:'pointer', fontSize:13, fontWeight:500, color:'#fff' }}
              >
                <span style={{ fontSize:16 }}>f</span>
                {isFr ? 'Continuer avec Facebook' : 'Continue with Facebook'}
              </button>
            </div>
 
            {/* Divider */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
              <div style={{ flex:1, height:1, background:'#E8E0D4' }} />
              <span style={{ fontSize:11, color:'#A09890', fontWeight:500 }}>
                {isFr ? 'ou' : 'or'}
              </span>
              <div style={{ flex:1, height:1, background:'#E8E0D4' }} />
            </div>
 
            {/* Tabs */}
            <div style={{ display:'flex', background:'#F5F0E8', borderRadius:10, padding:3, marginBottom:16 }}>
              {TABS.map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  style={{ flex:1, padding:'7px', borderRadius:8, border:'none', cursor:'pointer',
                    fontSize:12, fontWeight:600, fontFamily:'Outfit,sans-serif',
                    background: tab === t ? '#C8810A' : 'transparent',
                    color: tab === t ? '#fff' : '#6B6560', transition:'all .15s' }}
                >
                  {t === 'email'
                    ? (isFr ? 'Email' : 'Email')
                    : (isFr ? 'Téléphone' : 'Phone')}
                </button>
              ))}
            </div>
 
            {/* Email form */}
            {tab === 'email' && (
              <div>
                <input
                  type="email" placeholder={isFr ? 'Votre email' : 'Your email'}
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1px solid #D4C8B8',
                    fontSize:13, marginBottom:10, fontFamily:'Outfit,sans-serif',
                    background:'#FDFAF6', color:'#1C1A17', outline:'none', boxSizing:'border-box' }}
                />
                <input
                  type="password" placeholder={isFr ? 'Mot de passe' : 'Password'}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1px solid #D4C8B8',
                    fontSize:13, marginBottom:14, fontFamily:'Outfit,sans-serif',
                    background:'#FDFAF6', color:'#1C1A17', outline:'none', boxSizing:'border-box' }}
                />
                <button onClick={handleEmailSubmit} disabled={loading}
                  style={{ width:'100%', padding:'12px', borderRadius:10, border:'none',
                    background:'#C8810A', color:'#fff', fontSize:14, fontWeight:600,
                    cursor:'pointer', fontFamily:'Outfit,sans-serif', opacity: loading ? 0.6 : 1 }}
                >
                  {loading ? '...' : isLogin
                    ? (isFr ? 'Se connecter' : 'Log in')
                    : (isFr ? 'Créer mon compte' : 'Create account')}
                </button>
              </div>
            )}
 
            {/* Phone form */}
            {tab === 'phone' && (
              <div>
                <input
                  type="tel" placeholder="+1 (212) 555-0100"
                  value={phone} onChange={(e) => setPhone(e.target.value)}
                  style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1px solid #D4C8B8',
                    fontSize:13, marginBottom:14, fontFamily:'Outfit,sans-serif',
                    background:'#FDFAF6', color:'#1C1A17', outline:'none', boxSizing:'border-box' }}
                />
                <button onClick={handlePhoneSubmit} disabled={loading}
                  style={{ width:'100%', padding:'12px', borderRadius:10, border:'none',
                    background:'#C8810A', color:'#fff', fontSize:14, fontWeight:600,
                    cursor:'pointer', fontFamily:'Outfit,sans-serif', opacity: loading ? 0.6 : 1 }}
                >
                  {loading ? '...' : (isFr ? 'Envoyer le code' : 'Send code')}
                </button>
              </div>
            )}
 
            {/* Toggle login/signup */}
            <div style={{ textAlign:'center', marginTop:14, fontSize:12, color:'#6B6560' }}>
              {isLogin
                ? (isFr ? 'Pas encore de compte ? ' : "Don't have an account? ")
                : (isFr ? 'Déjà un compte ? ' : 'Already have an account? ')}
              <button onClick={() => setIsLogin(!isLogin)}
                style={{ background:'none', border:'none', color:'#C8810A', fontWeight:600,
                  cursor:'pointer', fontSize:12, fontFamily:'Outfit,sans-serif' }}
              >
                {isLogin
                  ? (isFr ? 'Créer un compte' : 'Sign up')
                  : (isFr ? 'Se connecter' : 'Log in')}
              </button>
            </div>
          </>
        )}
 
        {/* OTP step */}
        {step === 'otp' && (
          <div>
            {message && (
              <div style={{ background:'#E8F4ED', border:'1px solid #B8D9C5', borderRadius:10,
                padding:'10px 14px', marginBottom:14, fontSize:13, color:'#1A5C38' }}>
                {message}
              </div>
            )}
            <input
              type="text" placeholder={isFr ? 'Code de vérification' : 'Verification code'}
              value={otp} onChange={(e) => setOtp(e.target.value)}
              style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1px solid #D4C8B8',
                fontSize:13, marginBottom:14, fontFamily:'Outfit,sans-serif',
                background:'#FDFAF6', color:'#1C1A17', outline:'none', boxSizing:'border-box',
                letterSpacing:'0.2em', textAlign:'center' }}
            />
            <button onClick={handleOtpVerify} disabled={loading}
              style={{ width:'100%', padding:'12px', borderRadius:10, border:'none',
                background:'#C8810A', color:'#fff', fontSize:14, fontWeight:600,
                cursor:'pointer', fontFamily:'Outfit,sans-serif', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? '...' : (isFr ? 'Vérifier' : 'Verify')}
            </button>
            <button onClick={() => setStep('entry')}
              style={{ width:'100%', padding:'10px', borderRadius:10, border:'1px solid #E8E0D4',
                background:'transparent', color:'#6B6560', fontSize:13, fontWeight:500,
                cursor:'pointer', fontFamily:'Outfit,sans-serif', marginTop:8 }}
            >
              {isFr ? 'Retour' : 'Back'}
            </button>
          </div>
        )}
 
        {/* Error */}
        {error && (
          <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:10,
            padding:'10px 14px', marginTop:12, fontSize:12, color:'#DC2626' }}>
            {error}
          </div>
        )}
 
        {/* Security note */}
        <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:16,
          padding:'8px 12px', background:'#F5F0E8', borderRadius:8 }}>
          <span style={{ fontSize:12 }}>🔒</span>
          <span style={{ fontSize:11, color:'#A09890' }}>
            {isFr
              ? 'Vos données sont sécurisées et chiffrées.'
              : 'Your data is secured and encrypted.'}
          </span>
        </div>
      </div>
    </div>
  )
}
 