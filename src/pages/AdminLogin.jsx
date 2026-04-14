import { useState } from 'react'

const ADMIN_EMAIL    = import.meta.env.VITE_ADMIN_EMAIL
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD

export default function AdminLogin({ onLogin }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState(null)

  const handleLogin = () => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      onLogin()
    } else {
      setError('Incorrect email or password.')
    }
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
          <input
            type="email"
            placeholder="admin@email.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(null) }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            autoFocus
            style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:`1px solid ${error ? '#ef4444' : '#2a2a2a'}`, background:'#111', color:'#fff', fontSize:14, fontFamily:'Inter, sans-serif', outline:'none', boxSizing:'border-box', marginBottom:12 }}
          />
          <div style={{ fontSize:11, fontWeight:700, color:'#555', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6 }}>Password</div>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(null) }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:`1px solid ${error ? '#ef4444' : '#2a2a2a'}`, background:'#111', color:'#fff', fontSize:14, fontFamily:'Inter, sans-serif', outline:'none', boxSizing:'border-box' }}
          />
        </div>

        <button onClick={handleLogin} style={{
          width:'100%', padding:'13px', borderRadius:12, border:'none',
          background:'#C8891C', color:'#fff', fontSize:14, fontWeight:600,
          cursor:'pointer', fontFamily:'Inter, sans-serif', marginTop:8,
        }}>
          Sign in
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
