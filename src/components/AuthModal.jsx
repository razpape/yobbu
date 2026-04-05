import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthModal({ onClose, onSuccess, lang }) {
  const [mode, setMode]         = useState('login')   // 'login' | 'signup'
  const [tab, setTab]           = useState('email')   // 'email' | 'phone'
  const [step, setStep]         = useState('entry')   // 'entry' | 'otp'
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName]   = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [phone, setPhone]         = useState('')
  const [otp, setOtp]             = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)
  const [message, setMessage]     = useState(null)

  const isFr = lang === 'fr'

  const handleEmailAuth = async () => {
    setError(null)
    if (!email || !password) { setError(isFr ? 'Remplissez tous les champs.' : 'Please fill in all fields.'); return }
    if (mode === 'signup' && (!firstName || !lastName)) { setError(isFr ? 'Entrez votre nom complet.' : 'Please enter your full name.'); return }
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        onSuccess()
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { first_name: firstName, last_name: lastName, full_name: `${firstName} ${lastName}` } }
        })
        if (error) throw error
        setMessage(isFr ? 'Vérifiez votre email pour confirmer votre compte.' : 'Check your email to confirm your account.')
        setStep('otp')
      }
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handlePhoneSend = async () => {
    setError(null)
    if (!phone) { setError(isFr ? 'Entrez votre numéro.' : 'Enter your phone number.'); return }
    if (mode === 'signup' && (!firstName || !lastName)) { setError(isFr ? 'Entrez votre nom complet.' : 'Please enter your full name.'); return }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone })
      if (error) throw error
      setMessage(isFr ? 'Code envoyé par SMS.' : 'Code sent by SMS. Enter it below.')
      setStep('otp')
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handleOtpVerify = async () => {
    setError(null)
    if (!otp) { setError(isFr ? 'Entrez le code.' : 'Enter the code.'); return }
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' })
      if (error) throw error
      if (mode === 'signup' && data?.user) {
        await supabase.auth.updateUser({ data: { first_name: firstName, last_name: lastName, full_name: `${firstName} ${lastName}` } })
      }
      onSuccess()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const inp = { width:'100%', padding:'11px 14px', borderRadius:10, border:'1px solid #E8E0D4', background:'#fff', color:'#1C1A17', fontSize:13, fontFamily:'Outfit,sans-serif', outline:'none', boxSizing:'border-box', marginBottom:12 }
  const lbl = { fontSize:11, fontWeight:700, color:'#A09890', display:'block', marginBottom:5 }
  const btn = (primary) => ({ width:'100%', padding:'12px', borderRadius:10, border: primary ? 'none' : '1px solid #E8E0D4', background: primary ? '#C8810A' : 'transparent', color: primary ? '#fff' : '#6B6560', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'Outfit,sans-serif', opacity: loading ? .6 : 1, marginTop: primary ? 4 : 8 })

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999, padding:16, fontFamily:'Outfit,sans-serif' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'#FDFAF6', borderRadius:20, padding:'28px 24px', width:'100%', maxWidth:400, border:'1px solid #E8E0D4', boxShadow:'0 8px 40px rgba(0,0,0,.12)', maxHeight:'90vh', overflowY:'auto' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <div style={{ fontFamily:'Fraunces,serif', fontSize:22, fontWeight:700, color:'#1C1A17' }}>
              {mode === 'login' ? (isFr ? 'Connexion' : 'Welcome back') : (isFr ? 'Créer un compte' : 'Create account')}
            </div>
            <div style={{ fontSize:12, color:'#A09890', marginTop:2 }}>
              {mode === 'login' ? (isFr ? 'Connectez-vous à Yobbu' : 'Log in to your Yobbu account') : (isFr ? 'Rejoignez la communauté Yobbu' : 'Join the Yobbu community')}
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'#A09890' }}>✕</button>
        </div>

        {step === 'entry' && (
          <>
            {/* Tabs */}
            <div style={{ display:'flex', background:'#F5F0E8', borderRadius:12, padding:3, marginBottom:20 }}>
              {['email','phone'].map(t => (
                <button key={t} onClick={() => { setTab(t); setError(null) }}
                  style={{ flex:1, padding:'8px', borderRadius:10, border:'none', cursor:'pointer', fontSize:13, fontWeight:600, fontFamily:'Outfit,sans-serif', background: tab===t ? '#C8810A' : 'transparent', color: tab===t ? '#fff' : '#6B6560', transition:'all .15s' }}>
                  {t === 'email' ? (isFr ? 'Email' : 'Email') : (isFr ? 'Téléphone' : 'Phone number')}
                </button>
              ))}
            </div>

            {/* Name fields — signup only */}
            {mode === 'signup' && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div>
                  <label style={lbl}>{isFr ? 'Prénom' : 'First name'}</label>
                  <input style={inp} placeholder={isFr ? 'Aminata' : 'Aminata'} value={firstName} onChange={e => setFirstName(e.target.value)} />
                </div>
                <div>
                  <label style={lbl}>{isFr ? 'Nom' : 'Last name'}</label>
                  <input style={inp} placeholder={isFr ? 'Mbaye' : 'Mbaye'} value={lastName} onChange={e => setLastName(e.target.value)} />
                </div>
              </div>
            )}

            {/* Email form */}
            {tab === 'email' && (
              <>
                <label style={lbl}>{isFr ? 'Adresse email' : 'Email address'}</label>
                <input style={inp} type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                <label style={lbl}>{isFr ? 'Mot de passe' : 'Password'}</label>
                <input style={inp} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleEmailAuth()} />
                <button style={btn(true)} onClick={handleEmailAuth} disabled={loading}>
                  {loading ? '...' : mode === 'login' ? (isFr ? 'Se connecter' : 'Log in') : (isFr ? 'Créer mon compte' : 'Create account')}
                </button>
              </>
            )}

            {/* Phone form */}
            {tab === 'phone' && (
              <>
                <label style={lbl}>{isFr ? 'Numéro de téléphone' : 'Phone number'}</label>
                <input style={inp} type="tel" placeholder="+1 (212) 555-0100" value={phone} onChange={e => setPhone(e.target.value)} onKeyDown={e => e.key === 'Enter' && handlePhoneSend()} />
                {mode === 'signup' && (
                  <>
                    <label style={lbl}>{isFr ? 'Mot de passe' : 'Password'}</label>
                    <input style={inp} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                  </>
                )}
                <button style={btn(true)} onClick={handlePhoneSend} disabled={loading}>
                  {loading ? '...' : isFr ? 'Envoyer le code' : 'Send verification code'}
                </button>
              </>
            )}

            {/* Toggle login/signup */}
            <div style={{ textAlign:'center', marginTop:14, fontSize:12, color:'#6B6560' }}>
              {mode === 'login' ? (isFr ? "Pas encore de compte ? " : "Don't have an account? ") : (isFr ? 'Déjà un compte ? ' : 'Already have an account? ')}
              <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null) }}
                style={{ background:'none', border:'none', color:'#C8810A', fontWeight:700, cursor:'pointer', fontSize:12, fontFamily:'Outfit,sans-serif' }}>
                {mode === 'login' ? (isFr ? "S'inscrire" : 'Sign up') : (isFr ? 'Se connecter' : 'Log in')}
              </button>
            </div>
          </>
        )}

        {/* OTP step */}
        {step === 'otp' && (
          <>
            {message && (
              <div style={{ background:'#E8F4ED', border:'1px solid #9FD4B8', borderRadius:10, padding:'10px 14px', marginBottom:14, fontSize:13, color:'#1A5C38' }}>
                {message}
              </div>
            )}
            <label style={lbl}>{isFr ? 'Code de vérification' : 'Verification code'}</label>
            <input style={{ ...inp, letterSpacing:'0.3em', textAlign:'center', fontSize:20, fontWeight:700 }}
              type="text" placeholder="123456" value={otp} onChange={e => setOtp(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleOtpVerify()} />
            <button style={btn(true)} onClick={handleOtpVerify} disabled={loading}>
              {loading ? '...' : isFr ? 'Vérifier' : 'Verify'}
            </button>
            <button style={btn(false)} onClick={() => { setStep('entry'); setOtp(''); setError(null) }}>
              {isFr ? 'Retour' : 'Back'}
            </button>
          </>
        )}

        {/* Error */}
        {error && (
          <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:10, padding:'10px 14px', marginTop:12, fontSize:12, color:'#DC2626' }}>
            {error}
          </div>
        )}

        {/* Security note */}
        <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:16, padding:'8px 12px', background:'#F5F0E8', borderRadius:8 }}>
          <span style={{ fontSize:12 }}>🔒</span>
          <span style={{ fontSize:11, color:'#A09890' }}>{isFr ? 'Vos données sont sécurisées et chiffrées.' : 'Your data is secured and encrypted.'}</span>
        </div>

      </div>
    </div>
  )
}