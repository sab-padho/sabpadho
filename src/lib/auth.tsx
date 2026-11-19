import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

const AUTH_KEY = 'sabpadho-auth'

export const PREVIEW_EMAIL = 'test@gmail.com'
const PREVIEW_PASSWORD = 'test@123'

type AuthValue = {
  email: string | null
  signIn: (email: string, password: string) => boolean
  signOut: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

function readStored(): string | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    return raw === PREVIEW_EMAIL ? raw : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(readStored)

  const signIn = useCallback((inputEmail: string, password: string) => {
    const ok =
      inputEmail.trim().toLowerCase() === PREVIEW_EMAIL && password === PREVIEW_PASSWORD
    if (ok) {
      try {
        localStorage.setItem(AUTH_KEY, PREVIEW_EMAIL)
      } catch {
        /* ignore quota errors */
      }
      setEmail(PREVIEW_EMAIL)
    }
    return ok
  }, [])

  const signOut = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_KEY)
    } catch {
      /* ignore */
    }
    setEmail(null)
  }, [])

  return <AuthContext.Provider value={{ email, signIn, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}
