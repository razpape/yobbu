import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser]       = useState(null)   // profile row + auth id
  const [loading, setLoading] = useState(true)   // true until first session check completes

  async function loadProfile(authUser) {
    if (!authUser) {
      setUser(null)
      return
    }

    // Fetch full profile row
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle()

    // Merge auth user fields with profile fields
    setUser(profile ? { ...authUser, ...profile } : authUser)
  }

  useEffect(() => {
    // Check session and mark loading done quickly — profile loads in background
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadProfile(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      loadProfile(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return { user, loading, signOut }
}
