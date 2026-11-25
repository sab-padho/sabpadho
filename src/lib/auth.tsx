import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { getExamConfig, isValidExam, type ExamId } from '../data/exams'
import { learner as demoLearner } from '../data/learner'
import { supabase } from './supabase'

const AUTH_KEY = 'sabpadho-auth-v2'
const LOCAL_ACCOUNTS_KEY = 'sabpadho-accounts-v1'

export const PREVIEW_EMAIL = 'test@gmail.com'
const PREVIEW_PASSWORD = 'test@123'

export type LearnerProfile = {
  id: string
  name: string
  firstName: string
  initials: string
  email: string
  preferredExam: ExamId
  plan: string
  joined: string
}

type StoredAccount = {
  id: string
  name: string
  email: string
  password: string
  preferredExam: ExamId
  plan: string
  joined: string
}

type AuthResult = {
  ok: boolean
  error?: string
  profile?: LearnerProfile
}

type AuthValue = {
  user: LearnerProfile | null
  email: string | null
  preferredExam: ExamId
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (input: {
    name: string
    email: string
    password: string
    preferredExam: ExamId
  }) => Promise<AuthResult>
  setPreferredExam: (exam: ExamId) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

function deriveNameParts(fullName: string) {
  const clean = fullName.trim() || 'Learner'
  const parts = clean.split(/\s+/).filter(Boolean)
  const firstName = parts[0] ?? 'Learner'
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : firstName.slice(0, 2).toUpperCase()
  return { name: clean, firstName, initials }
}

function buildProfile(data: {
  id?: string
  name: string
  email: string
  preferredExam?: string | null
  plan?: string
  joined?: string
}): LearnerProfile {
  const { name, firstName, initials } = deriveNameParts(data.name)
  return {
    id: data.id || `L-${Date.now().toString().slice(-4)}`,
    name,
    firstName,
    initials,
    email: data.email.trim().toLowerCase(),
    preferredExam: isValidExam(data.preferredExam) ? data.preferredExam : 'SSC CGL',
    plan: data.plan || 'Free plan',
    joined:
      data.joined ||
      new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
  }
}

function readLocalAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(LOCAL_ACCOUNTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as StoredAccount[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeLocalAccounts(accounts: StoredAccount[]) {
  try {
    localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts))
  } catch {
    /* ignore storage quota */
  }
}

function readStoredSession(): LearnerProfile | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<LearnerProfile>
      if (parsed && typeof parsed.email === 'string' && typeof parsed.name === 'string') {
        return buildProfile({
          id: parsed.id,
          name: parsed.name,
          email: parsed.email,
          preferredExam: parsed.preferredExam,
          plan: parsed.plan,
          joined: parsed.joined,
        })
      }
    }
    // Backward compatibility with legacy key
    const legacy = localStorage.getItem('sabpadho-auth')
    if (legacy === PREVIEW_EMAIL) {
      return buildProfile({
        id: 'L-1040',
        name: demoLearner.name,
        email: PREVIEW_EMAIL,
        preferredExam: 'SSC CGL',
        plan: demoLearner.plan,
        joined: demoLearner.joined,
      })
    }
    return null
  } catch {
    return null
  }
}

function persistSession(profile: LearnerProfile | null) {
  try {
    if (profile) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(profile))
    } else {
      localStorage.removeItem(AUTH_KEY)
      localStorage.removeItem('sabpadho-auth')
    }
  } catch {
    /* ignore */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LearnerProfile | null>(readStoredSession)

  const signIn = useCallback(async (inputEmail: string, password: string): Promise<AuthResult> => {
    const normalizedEmail = inputEmail.trim().toLowerCase()

    // 1. Try Supabase RPC + Auth if configured
    if (supabase) {
      try {
        const { data, error } = await supabase.rpc('learner_signin', {
          p_email: normalizedEmail,
          p_password: password,
        })
        if (!error && data) {
          const row = (Array.isArray(data) ? data[0] : data) as {
            id?: string
            name?: string
            email?: string
            preferred_exam?: string
            plan?: string
          } | null
          if (row?.email) {
            const profile = buildProfile({
              id: row.id,
              name: row.name || row.email.split('@')[0],
              email: row.email,
              preferredExam: row.preferred_exam,
              plan: row.plan,
            })
            persistSession(profile)
            setUser(profile)
            return { ok: true, profile }
          }
        }

        // Also check Supabase Auth as secondary path
        const authRes = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        })
        if (!authRes.error && authRes.data.user) {
          const meta = authRes.data.user.user_metadata ?? {}
          const { data: learnerRow } = await supabase
            .from('learners')
            .select('*')
            .ilike('email', normalizedEmail)
            .maybeSingle()

          const profile = buildProfile({
            id: learnerRow?.id ?? authRes.data.user.id,
            name: learnerRow?.name ?? meta.name ?? normalizedEmail.split('@')[0],
            email: normalizedEmail,
            preferredExam: learnerRow?.preferred_exam ?? meta.preferred_exam ?? 'SSC CGL',
            plan: learnerRow?.plan ?? 'Free plan',
          })
          persistSession(profile)
          setUser(profile)
          return { ok: true, profile }
        }
      } catch {
        /* Fall back to local accounts below */
      }
    }

    // 2. Local registered accounts
    const accounts = readLocalAccounts()
    const match = accounts.find(
      (acc) => acc.email.toLowerCase() === normalizedEmail && acc.password === password,
    )
    if (match) {
      const profile = buildProfile(match)
      persistSession(profile)
      setUser(profile)
      return { ok: true, profile }
    }

    // 3. Built-in preview account
    if (normalizedEmail === PREVIEW_EMAIL && password === PREVIEW_PASSWORD) {
      const profile = buildProfile({
        id: 'L-1040',
        name: demoLearner.name,
        email: PREVIEW_EMAIL,
        preferredExam: 'SSC CGL',
        plan: demoLearner.plan,
        joined: demoLearner.joined,
      })
      persistSession(profile)
      setUser(profile)
      return { ok: true, profile }
    }

    return { ok: false, error: 'Incorrect email or password. New here? Create a free account.' }
  }, [])

  const signUp = useCallback(
    async ({
      name,
      email,
      password,
      preferredExam,
    }: {
      name: string
      email: string
      password: string
      preferredExam: ExamId
    }): Promise<AuthResult> => {
      const normalizedEmail = email.trim().toLowerCase()
      const cleanName = name.trim()

      if (!cleanName) {
        return { ok: false, error: 'Please enter your name.' }
      }
      if (!normalizedEmail.includes('@')) {
        return { ok: false, error: 'Please enter a valid email address.' }
      }
      if (password.length < 6) {
        return { ok: false, error: 'Password must be at least 6 characters.' }
      }

      // 1. Register in Supabase if configured
      if (supabase) {
        try {
          const { data, error } = await supabase.rpc('learner_signup', {
            p_name: cleanName,
            p_email: normalizedEmail,
            p_password: password,
            p_preferred_exam: preferredExam,
          })
          if (error) {
            if (error.code === '23505' || error.message.toLowerCase().includes('already exists')) {
              return { ok: false, error: 'An account with this email already exists. Please sign in.' }
            }
          } else if (data) {
            const row = (Array.isArray(data) ? data[0] : data) as {
              id?: string
              name?: string
              email?: string
              preferred_exam?: string
              plan?: string
            } | null
            if (row?.email) {
              const profile = buildProfile({
                id: row.id,
                name: row.name || cleanName,
                email: row.email,
                preferredExam: row.preferred_exam || preferredExam,
                plan: row.plan || 'Free plan',
              })
              // Also keep in local accounts so offline reloads and cross-tab admin work smoothly
              const existing = readLocalAccounts().filter((a) => a.email !== normalizedEmail)
              writeLocalAccounts([
                {
                  id: profile.id,
                  name: profile.name,
                  email: profile.email,
                  password,
                  preferredExam: profile.preferredExam,
                  plan: profile.plan,
                  joined: profile.joined,
                },
                ...existing,
              ])
              persistSession(profile)
              setUser(profile)
              return { ok: true, profile }
            }
          }
        } catch {
          /* Fall through to local signup if RPC isn't migrated yet */
        }
      }

      // 2. Local registration fallback
      const accounts = readLocalAccounts()
      if (
        normalizedEmail === PREVIEW_EMAIL ||
        accounts.some((acc) => acc.email.toLowerCase() === normalizedEmail)
      ) {
        return { ok: false, error: 'An account with this email already exists. Please sign in.' }
      }

      const joined = new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
      const newAccount: StoredAccount = {
        id: `L-${Math.floor(1000 + Math.random() * 9000)}`,
        name: cleanName,
        email: normalizedEmail,
        password,
        preferredExam,
        plan: 'Free plan',
        joined,
      }
      writeLocalAccounts([newAccount, ...accounts])
      const profile = buildProfile(newAccount)
      persistSession(profile)
      setUser(profile)
      return { ok: true, profile }
    },
    [],
  )

  const setPreferredExam = useCallback(
    async (exam: ExamId) => {
      setUser((current) => {
        if (!current) return current
        const updated: LearnerProfile = { ...current, preferredExam: exam }
        persistSession(updated)

        // Sync local stored account
        const accounts = readLocalAccounts()
        const idx = accounts.findIndex((a) => a.email === current.email)
        if (idx >= 0) {
          accounts[idx] = { ...accounts[idx], preferredExam: exam }
          writeLocalAccounts(accounts)
        }
        return updated
      })

      if (supabase && user?.email) {
        try {
          await supabase.rpc('update_learner_exam', {
            p_email: user.email,
            p_preferred_exam: exam,
          })
        } catch {
          /* ignore network/RPC issues */
        }
      }
    },
    [user?.email],
  )

  const signOut = useCallback(() => {
    persistSession(null)
    setUser(null)
    if (supabase) {
      void supabase.auth.signOut()
    }
  }, [])

  const preferredExam: ExamId = user?.preferredExam ?? 'SSC CGL'

  return (
    <AuthContext.Provider
      value={{
        user,
        email: user?.email ?? null,
        preferredExam,
        signIn,
        signUp,
        setPreferredExam,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}

export function useActiveExamConfig() {
  const { preferredExam } = useAuth()
  return getExamConfig(preferredExam)
}
