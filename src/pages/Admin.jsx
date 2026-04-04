import { useState, useEffect } from 'react'
import AdminLogin from './AdminLogin'
import AdminPanel from './AdminPanel'
import { supabase } from '../lib/supabase'

const ADMIN_EMAIL = 'papamamadous@outlook.com'

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email?.toLowerCase() === ADMIN_EMAIL) {
        setAuthed(true)
      }
      setChecking(false)
    })
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setAuthed(false)
  }

  if (checking) return (
    <div style={{ minHeight:'100vh', background:'#0f0f0f', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ color:'#555', fontFamily:"'Inter',sans-serif", fontSize:13 }}>Loading...</div>
    </div>
  )

  if (!authed) return <AdminLogin onSuccess={() => setAuthed(true)} />
  return <AdminPanel onSignOut={handleSignOut} />
}