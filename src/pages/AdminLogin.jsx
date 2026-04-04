import { useState } from 'react'
import { supabase } from '../lib/supabase'

const ADMIN_EMAIL = 'papamamadous@outlook.com'

export default function AdminLogin({ onSuccess }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  const handleLogin = async () => {
    setError(null)
    if (email.toLowerCase() !== ADMIN_EMAIL) {
      setError('Access denied. You are not authorized to access this panel.')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#0f0f0f', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Inter',sans-serif", padding:16 }}>
      <div style={{ width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:28, fontWeight:800, color:'#fff', letterSpacing:'-.5px', marginBottom:6 }}>
            Yob<span style={{ color:'#C8810A' }}>bu</span>
          </div>
          <div style={{ fontSize:13, color:'#666' }}>Admin Panel</div>
        </div>
        <div style={{ background:'#1a1a1a', borderRadius:16, padding:28, border:'1px solid #2a2a2a' }}>
          <div style={{ fontSize:18, fontWeight:700, color:'#fff', marginBottom:4 }}>Sign in</div>
          <div style={{ fontSize:13, color:'#666', marginBottom:24 }}>Restricted access only</div>
          {error && (
            <div style={{ background:'rgba(220,38,38,.1)', border:'1px solid rgba(220,38,38,.3)', borderRadius:10, padding:'10px 14px', marginBottom:16, fontSize:12, color:'#f87171' }}>
              {error}
            </div>
          )}
          <label style={{ fontSize:12, fontWeight:600, color:'#888', display:'block', marginBottom:6 }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
            style={{ width:'100%', padding:'11px 14px', borderRadius:10, border:'1px solid #2a2a2a', background:'#111', color:'#fff', fontSize:13, fontFamily:"'Inter',sans-serif", outline:'none', marginBottom:14, boxSizing:'border-box' }} />
          <label style={{ fontSize:12, fontWeight:600, color:'#888', display:'block', marginBottom:6 }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width:'100%', padding:'11px 14px', borderRadius:10, border:'1px solid #2a2a2a', background:'#111', color:'#fff', fontSize:13, fontFamily:"'Inter',sans-serif", outline:'none', marginBottom:20, boxSizing:'border-box' }} />
          <button onClick={handleLogin} disabled={loading}
            style={{ width:'100%', padding:'12px', borderRadius:10, border:'none', background:'#C8810A', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:"'Inter',sans-serif", opacity: loading ? .6 : 1 }}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
        <div style={{ textAlign:'center', marginTop:16, fontSize:11, color:'#444' }}>
          This page is not publicly accessible.
        </div>
      </div>
    </div>
  )
}