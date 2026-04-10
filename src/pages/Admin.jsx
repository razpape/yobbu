import { useState, useEffect } from 'react'
import AdminLogin from './AdminLogin'
import AdminPanel from './AdminPanel'
import { supabase } from '../lib/supabase'

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL

export default function Admin() {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email === ADMIN_EMAIL) setUser(session.user)
      setChecking(false)
    })
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (checking) return null

  if (!user) return <AdminLogin onLogin={setUser} />

  return <AdminPanel onSignOut={handleSignOut} />
}