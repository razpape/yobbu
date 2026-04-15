import { useState } from 'react'
import { supabase } from '../lib/supabase'
import AdminLogin from './AdminLogin'
import AdminPanel from './AdminPanel'

export default function Admin() {
  const [authed, setAuthed] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setAuthed(false)
  }

  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />

  return <AdminPanel onSignOut={handleSignOut} />
}
