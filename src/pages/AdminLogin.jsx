import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL

export default function AdminLogin({ onLogin }) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  // Handle the OAuth redirect back to /?admin=true
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        if (session.user.email === ADMIN_EMAIL) {
          onLogin(session.user)
        } else {
          setError('Access denied. Sign in with the admin Google account.')
          supabase.auth.signOut()
        }
      }
    })
  }, [])

  const handleGoogleLogin = async () => {
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/?admin=true`,
      },
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#0f0f0f', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Inter, sans-serif' }}>
      <div style={{ background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:20, padding:'40px 36px', width:'100%', maxWidth:380, textAlign:'center' }}>

        <div style={{ fontFamily:'DM Serif Display, serif', fontSize:32, color:'#fff', marginBottom:8 }}>
          Yob<span style={{ color:'#C8891C' }}>bu</span>
        </div>
        <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'2px', color:'#444', marginBottom:32 }}>
          Admin Panel
        </div>

        <button onClick={handleGoogleLogin} disabled={loading} style={{
          width:'100%', padding:'13px 16px', borderRadius:12, border:'1px solid #2a2a2a',
          background:'#fff', color:'#1a1a1a', fontSize:14, fontWeight:600,
          cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'Inter, sans-serif',
          opacity: loading ? .6 : 1, display:'flex', alignItems:'center', justifyContent:'center', gap:10,
        }}>
          {/* Google logo */}
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8 20-20 0-1.3-.1-2.7-.4-4z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.6 26.8 36 24 36c-5.2 0-9.5-2.9-11.3-7.1l-6.5 5C9.6 39.6 16.3 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.4 4.3-4.4 5.7l6.2 5.2C40.9 35.4 44 30.1 44 24c0-1.3-.1-2.7-.4-4z"/>
          </svg>
          {loading ? 'Redirecting...' : 'Sign in with Google'}
        </button>

        {error && (
          <div style={{ background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.2)', borderRadius:10, padding:'10px 14px', marginTop:16, fontSize:12, color:'#f87171' }}>
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
