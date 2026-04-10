import { useState } from 'react'
import { supabase } from '../lib/supabase'

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  const handleLogin = async () => {
    setError(null)
    if (!password) { setError('Enter your password.'); return }
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password,
      })
      if (error) throw error
      if (data.user?.email === ADMIN_EMAIL) {
        onLogin(data.user)
      } else {
        setError('Access denied.')
        await supabase.auth.signOut()
      }
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
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

        <div style={{ textAlign:'left', marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#555', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6 }}>Email</div>
          <div style={{ padding:'12px 14px', borderRadius:10, border:'1px solid #2a2a2a', background:'#111', color:'#444', fontSize:14, marginBottom:16 }}>
            {ADMIN_EMAIL}
          </div>
          <div style={{ fontSize:11, fontWeight:700, color:'#555', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6 }}>Password</div>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:'1px solid #2a2a2a', background:'#111', color:'#fff', fontSize:14, fontFamily:'Inter, sans-serif', outline:'none', boxSizing:'border-box' }}
          />
        </div>

        <button onClick={handleLogin} disabled={loading}
          style={{ width:'100%', padding:'13px', borderRadius:12, border:'none', background:'#C8891C', color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'Inter, sans-serif', opacity: loading ? .6 : 1, marginTop:8 }}>
          {loading ? 'Signing in...' : 'Sign in'}
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