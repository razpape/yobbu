import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthModal({ onClose, onSuccess, lang }) {
  const [mode, setMode]         = useState('login')   // 'login' | 'signup'
  const [step, setStep]         = useState('entry')   // 'entry' | 'otp'
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName]   = useState('')
  const [phone, setPhone]         = useState('')
  const [otp, setOtp]             = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)
  const isFr = lang === 'fr'

  const handlePhoneSend = async () => {
    setError(null)
    if (!phone) { setError(isFr ? 'Entrez votre numéro.' : 'Enter your phone number.'); return }
    if (mode === 'signup' && (!firstName || !lastName)) { setError(isFr ? 'Entrez votre nom complet.' : 'Enter your full name.'); return }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone })
      if (error) throw error
      setStep('otp')
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handleOtpVerify = async () => {
    setError(null)
    if (!otp) { setError(isFr ? 'Entrez le code.' : 'Enter the code.'); return }
    setLoading(true)
    try {
      const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' })
      if (error) throw error
      if (mode === 'signup') {
        await supabase.auth.updateUser({ data: { first_name: firstName, last_name: lastName, full_name: `${firstName} ${lastName}` } })
      }
      onSuccess()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const s = {
    overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999, padding:16, fontFamily:'DM Sans, sans-serif' },
    modal:   { background:'#FDFBF7', borderRadius:20, padding:'32px 28px', width:'100%', maxWidth:420, border:'1px solid rgba(0,0,0,.06)', boxShadow:'0 20px 60px rgba(0,0,0,.15)', maxHeight:'90vh', overflowY:'auto' },
    title:   { fontFamily:'DM Serif Display, serif', fontSize:24, fontWeight:700, color:'#1A1710', marginBottom:4 },
    sub:     { fontSize:13, color:'#8A8070', marginBottom:24 },
    social:  { width:'100%', padding:'12px', borderRadius:12, border:'1px solid rgba(0,0,0,.1)', background:'#fff', fontSize:14, fontWeight:500, cursor:'pointer', fontFamily:'DM Sans, sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:10, color:'#1A1710', marginBottom:10, transition:'all .2s' },
    divider: { display:'flex', alignItems:'center', gap:12, margin:'16px 0' },
    line:    { flex:1, height:1, background:'rgba(0,0,0,.08)' },
    lbl:     { fontSize:11, fontWeight:700, color:'#8A8070', display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'.06em' },
    inp:     { width:'100%', padding:'12px 14px', borderRadius:10, border:'1px solid rgba(0,0,0,.1)', background:'#fff', color:'#1A1710', fontSize:14, fontFamily:'DM Sans, sans-serif', outline:'none', boxSizing:'border-box', marginBottom:14 },
    btn:     { width:'100%', padding:'13px', borderRadius:12, border:'none', background:'#C8891C', color:'#fff', fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:'DM Sans, sans-serif', transition:'all .2s', opacity: loading ? .6 : 1 },
    toggle:  { textAlign:'center', marginTop:16, fontSize:13, color:'#8A8070' },
  }

  return (
    <div onClick={onClose} style={s.overlay}>
      <div onClick={e => e.stopPropagation()} style={s.modal}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
          <div>
            <div style={s.title}>{mode === 'login' ? (isFr ? 'Connexion' : 'Welcome back') : (isFr ? 'Créer un compte' : 'Create account')}</div>
            <div style={s.sub}>{mode === 'login' ? (isFr ? 'Connectez-vous à Yobbu' : 'Sign in to your Yobbu account') : (isFr ? 'Rejoignez la communauté Yobbu' : 'Join the Yobbu community')}</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'#8A8070', lineHeight:1, padding:4 }}>✕</button>
        </div>

        {step === 'entry' && (
          <>
            {/* Google — placeholder */}
            <button style={s.social} onClick={() => setError(isFr ? 'Google bientôt disponible.' : 'Google coming soon.')}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              {isFr ? 'Continuer avec Google' : 'Continue with Google'}
            </button>

            {/* Facebook — placeholder */}
            <button style={s.social} onClick={() => setError(isFr ? 'Facebook bientôt disponible.' : 'Facebook coming soon.')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              {isFr ? 'Continuer avec Facebook' : 'Continue with Facebook'}
            </button>

            {/* Divider */}
            <div style={s.divider}>
              <div style={s.line} />
              <span style={{ fontSize:12, color:'#8A8070', fontWeight:500 }}>{isFr ? 'ou avec votre numéro' : 'or with your phone'}</span>
              <div style={s.line} />
            </div>

            {/* Name fields — signup only */}
            {mode === 'signup' && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
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

            {/* Phone */}
            <label style={s.lbl}>{isFr ? 'Numéro de téléphone' : 'Phone number'}</label>
            <input style={s.inp} type="tel" placeholder="+1 (212) 555-0100" value={phone}
              onChange={e => setPhone(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handlePhoneSend()} />

            <button style={s.btn} onClick={handlePhoneSend} disabled={loading}>
              {loading ? '...' : isFr ? 'Envoyer le code SMS' : 'Send SMS code'}
            </button>

            {/* Toggle */}
            <div style={s.toggle}>
              {mode === 'login' ? (isFr ? "Pas de compte ? " : "No account? ") : (isFr ? 'Déjà un compte ? ' : 'Already have one? ')}
              <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null) }}
                style={{ background:'none', border:'none', color:'#C8891C', fontWeight:700, cursor:'pointer', fontSize:13, fontFamily:'DM Sans, sans-serif' }}>
                {mode === 'login' ? (isFr ? "S'inscrire" : 'Sign up') : (isFr ? 'Se connecter' : 'Log in')}
              </button>
            </div>
          </>
        )}

        {/* OTP step */}
        {step === 'otp' && (
          <>
            <div style={{ background:'#F0FAF4', border:'1px solid #9FD4B8', borderRadius:10, padding:'12px 16px', marginBottom:16, fontSize:13, color:'#1A5C38' }}>
              {isFr ? `Code envoyé au ${phone}` : `Code sent to ${phone}`}
            </div>
            <label style={s.lbl}>{isFr ? 'Code de vérification' : 'Verification code'}</label>
            <input style={{ ...s.inp, letterSpacing:'0.4em', textAlign:'center', fontSize:22, fontWeight:700 }}
              type="text" placeholder="123456" value={otp}
              onChange={e => setOtp(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleOtpVerify()} />
            <button style={s.btn} onClick={handleOtpVerify} disabled={loading}>
              {loading ? '...' : isFr ? 'Vérifier' : 'Verify'}
            </button>
            <button onClick={() => { setStep('entry'); setOtp(''); setError(null) }}
              style={{ width:'100%', padding:'11px', borderRadius:12, border:'1px solid rgba(0,0,0,.1)', background:'transparent', color:'#8A8070', fontSize:14, fontWeight:500, cursor:'pointer', fontFamily:'DM Sans, sans-serif', marginTop:10 }}>
              {isFr ? 'Retour' : 'Back'}
            </button>
          </>
        )}

        {/* Error */}
        {error && (
          <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:10, padding:'10px 14px', marginTop:12, fontSize:13, color:'#DC2626' }}>
            {error}
          </div>
        )}

        {/* Lock */}
        <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:16, padding:'8px 12px', background:'#F7F3ED', borderRadius:8 }}>
          <span style={{ fontSize:12 }}>🔒</span>
          <span style={{ fontSize:11, color:'#8A8070' }}>{isFr ? 'Vos données sont sécurisées.' : 'Your data is secured and encrypted.'}</span>
        </div>

      </div>
    </div>
  )
}