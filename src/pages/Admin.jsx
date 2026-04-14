import { useState } from 'react'
import AdminLogin from './AdminLogin'
import AdminPanel from './AdminPanel'

export default function Admin() {
  const [authed, setAuthed] = useState(false)

  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />

  return <AdminPanel onSignOut={() => setAuthed(false)} />
}
