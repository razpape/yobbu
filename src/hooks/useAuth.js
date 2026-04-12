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
    // Await profile load before marking loading done — prevents signed-in users
    // from briefly seeing the signed-out UI while the profile row is fetched.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      await loadProfile(session?.user ?? null)
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
