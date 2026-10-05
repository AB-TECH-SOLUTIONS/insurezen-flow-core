import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Profile, UserRole } from '@/types/database'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null,
  })

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Erreur chargement profil:', error)
      return null
    }
    return data as Profile
  }, [])

  useEffect(() => {
    // Charger la session initiale
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        setState({ user: session.user, profile, session, loading: false, error: null })
      } else {
        setState(s => ({ ...s, loading: false }))
      }
    })

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id)
          setState({ user: session.user, profile, session, loading: false, error: null })
        } else {
          setState({ user: null, profile: null, session: null, loading: false, error: null })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const signIn = async (email: string, password: string) => {
    setState(s => ({ ...s, loading: true, error: null }))
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setState(s => ({ ...s, loading: false, error: error.message }))
      return { error }
    }
    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setState({ user: null, profile: null, session: null, loading: false, error: null })
  }

  const hasRole = (...roles: UserRole[]) => {
    if (!state.profile) return false
    return roles.includes(state.profile.role)
  }

  const isAdmin = () => hasRole('super_admin', 'admin')

  return {
    ...state,
    signIn,
    signOut,
    hasRole,
    isAdmin,
  }
}