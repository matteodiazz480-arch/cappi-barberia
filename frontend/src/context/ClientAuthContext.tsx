import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  registerClient,
  loginClient,
  logoutClient,
  getClientProfile,
} from '@/services/clientAuth.service'
import type { ClientProfile } from '@/types'

const STORAGE_KEY = 'cappi_client_token'

interface ClientAuthContextValue {
  profile: ClientProfile | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  register: (input: { firstName: string; lastName: string; phone: string; password: string }) => Promise<void>
  login: (input: { phone: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  setProfile: (profile: ClientProfile) => void
}

const ClientAuthContext = createContext<ClientAuthContextValue | undefined>(undefined)

export function ClientAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY))
  const [profile, setProfileState] = useState<ClientProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function restoreSession() {
      const storedToken = localStorage.getItem(STORAGE_KEY)
      if (!storedToken) {
        setIsLoading(false)
        return
      }
      try {
        const restored = await getClientProfile(storedToken)
        if (cancelled) return
        if (restored) {
          setToken(storedToken)
          setProfileState(restored)
        } else {
          localStorage.removeItem(STORAGE_KEY)
          setToken(null)
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY)
        setToken(null)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    restoreSession()
    return () => {
      cancelled = true
    }
  }, [])

  const persistSession = (newToken: string, newProfile: ClientProfile) => {
    localStorage.setItem(STORAGE_KEY, newToken)
    setToken(newToken)
    setProfileState(newProfile)
  }

  const value: ClientAuthContextValue = {
    profile,
    token,
    isLoading,
    isAuthenticated: !!token && !!profile,
    register: async (input) => {
      const { token: newToken, profile: newProfile } = await registerClient(input)
      persistSession(newToken, newProfile)
    },
    login: async (input) => {
      const { token: newToken, profile: newProfile } = await loginClient(input)
      persistSession(newToken, newProfile)
    },
    logout: async () => {
      if (token) {
        try {
          await logoutClient(token)
        } catch {
          // el token puede haber vencido igual lo limpiamos localmente
        }
      }
      localStorage.removeItem(STORAGE_KEY)
      setToken(null)
      setProfileState(null)
    },
    setProfile: (newProfile) => setProfileState(newProfile),
  }

  return <ClientAuthContext.Provider value={value}>{children}</ClientAuthContext.Provider>
}

export function useClientAuth() {
  const ctx = useContext(ClientAuthContext)
  if (!ctx) throw new Error('useClientAuth debe usarse dentro de <ClientAuthProvider>')
  return ctx
}
