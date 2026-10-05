import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Profile } from '@/types/database'
import type { User, Session } from '@supabase/supabase-js'

interface AuthStore {
  user: User | null
  profile: Profile | null
  session: Session | null
  setAuth: (user: User | null, profile: Profile | null, session: Session | null) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      session: null,
      setAuth: (user, profile, session) => set({ user, profile, session }),
      clearAuth: () => set({ user: null, profile: null, session: null }),
    }),
    { name: 'iz-auth' }
  )
)