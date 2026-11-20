import { useEffect, useState, type FormEvent } from 'react'
import { createRoot } from 'react-dom/client'
import { createClient, type Session } from '@supabase/supabase-js'
import { ArrowRight, BookOpen, ClipboardList, Eye, EyeOff, LayoutDashboard, LockKeyhole, LogOut, Users } from 'lucide-react'
import logo from '../../public/brand/sabpadho-mark.png'
import '../../src/index.css'
import './style.css'
import { sections, type Section } from './data'

const { VITE_SUPABASE_URL: url, VITE_SUPABASE_PUBLISHABLE_KEY: key } = import.meta.env
const supabase = url && key ? createClient(url, key) : null

/** Host of the project the portal is talking to, e.g. `abcdefgh.supabase.co`. */
const projectHost = (() => {
  try {
    return url ? new URL(url).hostname : ''
  } catch {
    return ''
  }
})()

/**
 * Supabase Auth identifies an account by email, so staff usernames are created under an
 * internal, non-routable domain: `aditya` becomes `aditya@sabpadho.local`. Override the
 * domain with VITE_ADMIN_EMAIL_DOMAIN to match the accounts in your project.
 */
const USERNAME_DOMAIN = ((import.meta.env.VITE_ADMIN_EMAIL_DOMAIN as string | undefined) ?? '').trim() || 'sabpadho.local'

/** `aditya`, `aditya@sabpadho.local` or any full email the account was created with. */
function loginEmail(input: string): string {
  const value = input.trim().toLowerCase()
  return value.includes('@') ? value : `${value}@${USERNAME_DOMAIN}`
}

/** Short name for the signed-in account: `aditya@sabpadho.local` → `aditya`. */
function displayName(address: string | undefined): string {
  if (!address) return ''
  const at = address.lastIndexOf('@')
  return at > 0 && address.slice(at + 1) === USERNAME_DOMAIN ? address.slice(0, at) : address
}

const navigation = { Overview: LayoutDashboard, Learners: Users, Subjects: BookOpen, 'Mock tests': ClipboardList }
type Page = keyof typeof navigation

type AuthFailure = { message: string; code?: string; status?: number }
type SignInIssue = { message: string; code?: string; canResend?: boolean }

/**
 * Turns a Supabase Auth error into something an admin can act on. "Invalid login
 * credentials" is deliberately vague on the server (it must not reveal whether an
 * email exists), so the portal spells out the likely causes here.
 */
function describeSignInFailure(failure: AuthFailure): SignInIssue {
  const code = failure.code ?? ''
  const message = failure.message.toLowerCase()
  const issue = (text: string, canResend = false): SignInIssue => ({ message: text, code: code || undefined, canResend })

  if (code === 'email_not_confirmed' || message.includes('email not confirmed')) {
    return issue('This account exists, but it is not confirmed yet. Confirm it in Authentication → Users (⋯ → Confirm email), then sign in again.', true)
  }
  if (code === 'invalid_credentials' || message.includes('invalid login credentials')) {
    return issue('Supabase did not match that username and password. Type just the username (for example aditya), check the password with Show password, and make sure the account exists in this project’s Authentication → Users list.')
  }
  if (code === 'user_banned' || message.includes('banned')) {
    return issue('This account is banned. Unban it in Authentication → Users before signing in again.')
  }
  if (code === 'over_request_rate_limit' || code === 'over_email_send_rate_limit' || failure.status === 429 || message.includes('rate limit')) {
    return issue('Too many sign-in attempts. Wait a minute and try again.')
  }
  if (code === 'email_address_invalid' || code === 'validation_failed' || message.includes('unable to validate email')) {
    return issue('That does not look like a username. Use letters, numbers, dot, dash or underscore, with no spaces.')
  }
  if (code === 'email_provider_disabled' || code === 'provider_disabled') {
    return issue('Email and password sign-in is disabled for this project. Enable the Email provider in Authentication → Providers.')
  }
  if (message.includes('failed to fetch') || message.includes('network')) {
    return issue('Could not reach the sign-in service. Check the Supabase URL in admin/.env.local and your connection, then try again.')
  }
  return issue('Sign-in failed. Check your credentials and try again.')
}

/** Membership-check failures are database/config problems, not credential problems. */
function describeMembershipFailure(failure: AuthFailure | null): string {
  if (!failure) return 'This account does not have admin access.'
  if (failure.code === '42703' || failure.message.includes('column')) {
    return 'The admin_users table has an outdated shape. Run database/migrations/20261120_002_align_admin_users_with_auth.sql, then try again.'
  }
  if (failure.code === '42P01' || failure.message.includes('does not exist')) {
    return 'The admin_users table is missing. Run the migrations in database/migrations/ against this project, then try again.'
  }
  if (failure.code === '42501' || failure.code === 'PGRST301' || failure.message.toLowerCase().includes('permission')) {
    return 'The portal is not allowed to read admin memberships. Re-run the admin_users migration to restore its row-level security policy.'
  }
  return 'Could not verify admin access. Please try again.'
}

function Brand() {
  return <div className="brand-lockup"><img src={logo} alt="" /><div><strong>SabPadho</strong><small>Admin portal</small></div></div>
}

/** Password input with a show/hide toggle so a typo or stray space is visible. */
function PasswordField({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  const [visible, setVisible] = useState(false)
  const [capsLock, setCapsLock] = useState(false)

  return (
    <div className="field-group">
      <label htmlFor="password">Password</label>
      <div className="field">
        <input
          id="password"
          name="password"
          type={visible ? 'text' : 'password'}
          autoComplete="current-password"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          value={value}
          onChange={event => onChange(event.target.value)}
          onKeyUp={event => setCapsLock(event.getModifierState?.('CapsLock') ?? false)}
          onBlur={() => setCapsLock(false)}
          aria-describedby={capsLock ? 'caps-lock-hint' : undefined}
          required
        />
        <button
          type="button"
          className="reveal"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          title={visible ? 'Hide password' : 'Show password'}
          onClick={() => setVisible(current => !current)}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
      {capsLock && <small className="field-hint" id="caps-lock-hint">Caps Lock is on.</small>}
    </div>
  )
}

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [verifiedToken, setVerifiedToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(Boolean(supabase))
  const [busy, setBusy] = useState(false)
  const [issue, setIssue] = useState<SignInIssue | null>(null)
  const [page, setPage] = useState<Page>('Overview')
  const [query, setQuery] = useState('')
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [resend, setResend] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle')
  const token = session?.access_token
  const userId = session?.user.id

  useEffect(() => {
    if (!supabase) return
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      setLoading(false)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!supabase || !token || !userId) return
    const client = supabase
    let current = true
    void (async () => {
      try {
        const { data, error } = await client.from('admin_users').select('user_id').eq('user_id', userId).maybeSingle()
        if (!current) return
        if (!error && data) {
          setVerifiedToken(token)
          return
        }
        setIssue({ message: describeMembershipFailure(error) })
      } catch {
        if (!current) return
        setIssue({ message: describeMembershipFailure(null) })
      }
      await client.auth.signOut({ scope: 'local' })
    })()
    return () => { current = false }
  }, [token, userId])

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase) return
    setBusy(true)
    setIssue(null)
    setResend('idle')
    try {
      const { error } = await supabase.auth.signInWithPassword({
        // `aditya` → `aditya@sabpadho.local`; a full address is passed through untouched.
        email: loginEmail(account),
        // Passwords are sent exactly as typed: trimming one would break valid ones.
        password,
      })
      if (error) setIssue(describeSignInFailure(error))
    } catch {
      setIssue({ message: 'Could not reach the sign-in service. Check the Supabase URL in admin/.env.local and your connection, then try again.' })
    } finally {
      setBusy(false)
    }
  }

  async function resendConfirmation() {
    if (!supabase || !account.trim()) return
    setResend('sending')
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email: loginEmail(account) })
      setResend(error ? 'failed' : 'sent')
    } catch {
      setResend('failed')
    }
  }

  async function signOut() {
    setBusy(true)
    setIssue(null)
    setResend('idle')
    try {
      const { error } = await supabase!.auth.signOut({ scope: 'local' })
      if (error) throw error
      setVerifiedToken(null)
      setPassword('')
      navigate('Overview')
    } catch {
      setIssue({ message: 'Could not sign out. Please try again.' })
    } finally {
      setBusy(false)
    }
  }

  function navigate(next: Page) {
    setPage(next)
    setQuery('')
  }

  if (!session || verifiedToken !== token) {
    const checking = loading || Boolean(session && !issue)
    return <main className="login-layout">
      <section className="login-intro"><Brand /><div><span className="eyebrow">SABPADHO WORKSPACE</span><h1>Manage the learning experience.</h1><p>One place to review learners, subjects, and mock tests.</p></div><small>Restricted to authorized staff</small></section>
      <section className="login-main"><div className="panel login-card"><div className="icon-tile"><LockKeyhole size={22} /></div><h2>Admin sign in</h2><p>Use your staff username and password to continue.</p>
        {checking ? <p role="status">Checking admin access…</p> : <form onSubmit={signIn}>
          <div className="field-group">
            <label htmlFor="account">Username</label>
            <input
              id="account"
              name="username"
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder="aditya"
              value={account}
              onChange={event => { setAccount(event.target.value); setResend('idle') }}
              required
            />
            <small className="field-note">
              Signs in as {account.trim() ? loginEmail(account) : `yourname@${USERNAME_DOMAIN}`}. A full email works too.
            </small>
          </div>
          <PasswordField value={password} onChange={next => { setPassword(next); setResend('idle') }} />
          {!supabase && <p className="notice" role="status">Sign-in is not configured. Add the Supabase URL and publishable key to enable it.</p>}
          {issue && <div className="notice" role="alert">
            <p>{issue.message}</p>
            {issue.canResend && <button type="button" className="resend" disabled={resend === 'sending' || resend === 'sent'} onClick={resendConfirmation}>
              {resend === 'sending' ? 'Sending…' : resend === 'sent' ? 'Confirmation email sent' : resend === 'failed' ? 'Could not send · retry' : 'Resend confirmation email'}
            </button>}
            {issue.code && <small>Supabase error code: {issue.code}</small>}
          </div>}
          {session ? <button className="primary" type="button" disabled={busy} onClick={signOut}>Return to sign in</button> : <button className="primary" disabled={!supabase || busy}>{busy ? 'Signing in…' : 'Sign in'} <ArrowRight size={17} /></button>}
        </form>}
        {projectHost && <small className="project-hint">Connected to {projectHost}. Accounts live in this project’s Authentication → Users; usernames map to @{USERNAME_DOMAIN}.</small>}
      </div></section>
    </main>
  }

  const section = page === 'Overview' ? null : sections[page]
  const rows = section?.rows.filter(row => row.some(value => value.toLowerCase().includes(query.trim().toLowerCase())))
  return <div className="workspace">
    <aside className="rail"><Brand /><nav aria-label="Admin navigation">{(Object.keys(navigation) as Page[]).map(item => {
      const Icon = navigation[item]
      return <button key={item} aria-current={page === item ? 'page' : undefined} onClick={() => navigate(item)}><Icon size={19} />{item}</button>
    })}</nav><button className="logout" onClick={signOut} disabled={busy}><LogOut size={18} />Sign out</button></aside>
    <div className="workspace-body"><header className="topbar"><strong>Admin workspace</strong><span title={session.user.email ?? ''}>{displayName(session.user.email)}</span></header>
      <main className="content"><div className="page-heading"><div><span className="eyebrow">ADMIN PORTAL</span><h1>{page}</h1><p>{section?.description ?? 'A snapshot of your SabPadho workspace.'}</p></div><span className="badge">Sample data</span></div>
      {issue && <p className="notice" role="alert">{issue.message}</p>}
      {section ? <section className="panel table-panel"><label className="search">Filter {page.toLowerCase()}<input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search records" /></label><div className="table-scroll"><table aria-label={page}><thead><tr>{section.columns.map(col => <th key={col} scope="col">{col}</th>)}</tr></thead><tbody>{rows?.length ? rows.map(row => <tr key={row[0]}>{row.map((cell, i) => <td key={i}>{i === 2 ? <span className="badge status">{cell}</span> : cell}</td>)}</tr>) : <tr><td colSpan={section.columns.length}>No matching records.</td></tr>}</tbody></table></div></section> : <>
        <div className="stat-grid">{(Object.keys(sections) as Section[]).map(item => { const Icon = navigation[item]; return <button className="panel stat" key={item} onClick={() => navigate(item)}><span className="icon-tile"><Icon size={21} /></span><strong>{sections[item].rows.length}</strong><span>{item}</span><ArrowRight className="stat-arrow" size={18} /></button> })}</div>
        <section className="panel info"><h2>About this workspace</h2><p>Sign-in and admin access are verified through Supabase. Learners, subjects, and mock tests are read-only examples and do not represent live site activity.</p></section>
      </>}
      </main></div>
  </div>
}

createRoot(document.getElementById('root')!).render(<App />)
