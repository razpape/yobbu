import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  async function loadProfile(authUser) {
    if (!authUser) {
      setUser(null)
      return
    }

    try {
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle()

      if (fetchError) throw fetchError
      setUser(profile ? { ...authUser, ...profile } : authUser)
      setError(null)
    } catch (err) {
      console.error('Failed to load profile:', err)
      setUser(authUser)
      setError(err.message)
    }
  }

  useEffect(() => {
    let isMounted = true

    supabase.auth.getSession()
      .then(async ({ data: { session }, error: sessionError }) => {
        if (sessionError) {
          console.error('Session check failed:', sessionError)
          if (isMounted) setError(sessionError.message)
          if (isMounted) setLoading(false)
          return
        }
        if (isMounted) await loadProfile(session?.user ?? null)
        if (isMounted) setLoading(false)
      })
      .catch(err => {
        console.error('Unexpected error in getSession:', err)
        if (isMounted) {
          setError(err.message)
          setLoading(false)
        }
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) loadProfile(session?.user ?? null)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    try {
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError
      setUser(null)
      setError(null)
    } catch (err) {
      console.error('Sign out failed:', err)
      setError(err.message)
    }
  }

  return { user, loading, error, signOut }
}
