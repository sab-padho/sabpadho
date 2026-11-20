import { useState, type FormEvent } from 'react'
import { createRoot } from 'react-dom/client'
import { createClient } from '@supabase/supabase-js'
import { ArrowRight, BookOpen, ClipboardList, Eye, EyeOff, LayoutDashboard, LockKeyhole, LogOut, Users } from 'lucide-react'
import logo from '../../public/brand/sabpadho-mark.png'
import '../../src/index.css'
import './style.css'
import { sections, type Section } from './data'

const { VITE_SUPABASE_URL: url, VITE_SUPABASE_PUBLISHABLE_KEY: key } = import.meta.env
const supabase = url && key ? createClient(url, key) : null

/**
 * Username/password sign-in. `admin_login` compares the credentials against
 * `public.admin_users` server-side, so no password (or hash) ever reaches the browser.
 * The signed-in state itself is only a browser flag — see admin/README.md.
 */
const SESSION_KEY = 'sabpadho-admin'

type Admin = { username: string; permissionid: number }
type LoginIssue = { message: string; detail?: string }

const navigation = { Overview: LayoutDashboard, Learners: Users, Subjects: BookOpen, 'Mock tests': ClipboardList }
type Page = keyof typeof navigation

function readSession(): Admin | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<Admin>
    return typeof parsed.username === 'string' && typeof parsed.permissionid === 'number'
      ? { username: parsed.username, permissionid: parsed.permissionid }
      : null
  } catch {
    return null
  }
}

/** Errors from the RPC itself: configuration or connectivity, never bad credentials. */
function describeLoginFailure(failure: { message: string; code?: string }): string {
  const code = failure.code ?? ''
  const message = failure.message.toLowerCase()

  if (code === 'PGRST202' || message.includes('could not find the function')) {
    return 'The admin sign-in function is missing from this project. Run database/migrations/20261120_003_admin_login_with_username.sql.'
  }
  if (code === '42501' || message.includes('permission denied')) {
    return 'The portal is not allowed to run the admin sign-in function. Re-run the migration to restore its execute grants.'
  }
  if (code === '42P01' || message.includes('does not exist')) {
    return 'The admin_users table is missing. Run the migrations in database/migrations/ against this project.'
  }
  if (message.includes('failed to fetch') || message.includes('network')) {
    return 'Could not reach Supabase. Check the project URL in admin/.env.local and your connection, then try again.'
  }
  return 'Could not sign in right now. Please try again.'
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
  const [admin, setAdmin] = useState<Admin | null>(readSession)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [issue, setIssue] = useState<LoginIssue | null>(null)
  const [page, setPage] = useState<Page>('Overview')
  const [query, setQuery] = useState('')

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase) return
    setBusy(true)
    setIssue(null)
    try {
      const { data, error } = await supabase.rpc('admin_login', {
        p_username: username.trim(),
        // Passed exactly as typed; trimming one would break a valid password.
        p_password: password,
      })
      if (error) {
        setIssue({ message: describeLoginFailure(error), detail: error.code ?? undefined })
        return
      }
      const row = (Array.isArray(data) ? data[0] : data) as { username?: string; permissionid?: number } | null
      if (!row?.username) {
        setIssue({ message: 'That username and password did not match an admin account.' })
        return
      }
      const next: Admin = { username: row.username, permissionid: row.permissionid ?? 1 }
      try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(next))
      } catch {
        /* ignore storage errors */
      }
      setAdmin(next)
      setPassword('')
      setPage('Overview')
    } catch {
      setIssue({ message: 'Could not reach Supabase. Check the project URL in admin/.env.local and your connection, then try again.' })
    } finally {
      setBusy(false)
    }
  }

  function signOut() {
    try {
      sessionStorage.removeItem(SESSION_KEY)
    } catch {
      /* ignore */
    }
    setAdmin(null)
    setUsername('')
    setPassword('')
    setIssue(null)
    setPage('Overview')
    setQuery('')
  }

  function navigate(next: Page) {
    setPage(next)
    setQuery('')
  }

  if (!admin) return <main className="login-layout">
    <section className="login-intro"><Brand /><div><span className="eyebrow">SABPADHO WORKSPACE</span><h1>Manage the learning experience.</h1><p>One place to review learners, subjects, and mock tests.</p></div><small>Restricted to authorized staff</small></section>
    <section className="login-main"><div className="panel login-card"><div className="icon-tile"><LockKeyhole size={22} /></div><h2>Admin sign in</h2><p>Use your staff username and password to continue.</p>
      <form onSubmit={signIn}>
        <div className="field-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="admin"
            value={username}
            onChange={event => setUsername(event.target.value)}
            required
          />
          <small className="field-note">Usernames are not case-sensitive.</small>
        </div>
        <PasswordField value={password} onChange={setPassword} />
        {!supabase && <p className="notice" role="status">Sign-in is not configured. Add the Supabase URL and publishable key to enable it.</p>}
        {issue && <div className="notice" role="alert">
          <p>{issue.message}</p>
          {issue.detail && <small>Supabase error code: {issue.detail}</small>}
        </div>}
        <button className="primary" disabled={!supabase || busy}>{busy ? 'Signing in…' : 'Sign in'} <ArrowRight size={17} /></button>
      </form>
    </div></section>
  </main>

  const section = page === 'Overview' ? null : sections[page]
  const rows = section?.rows.filter(row => row.some(value => value.toLowerCase().includes(query.trim().toLowerCase())))
  return <div className="workspace">
    <aside className="rail"><Brand /><nav aria-label="Admin navigation">{(Object.keys(navigation) as Page[]).map(item => {
      const Icon = navigation[item]
      return <button key={item} aria-current={page === item ? 'page' : undefined} onClick={() => navigate(item)}><Icon size={19} />{item}</button>
    })}</nav><button className="logout" onClick={signOut} disabled={busy}><LogOut size={18} />Sign out</button></aside>
    <div className="workspace-body"><header className="topbar"><strong>Admin workspace</strong><span>{admin.username} · permission {admin.permissionid}</span></header>
      <main className="content"><div className="page-heading"><div><span className="eyebrow">ADMIN PORTAL</span><h1>{page}</h1><p>{section?.description ?? 'A snapshot of your SabPadho workspace.'}</p></div><span className="badge">Sample data</span></div>
      {issue && <p className="notice" role="alert">{issue.message}</p>}
      {section ? <section className="panel table-panel"><label className="search">Filter {page.toLowerCase()}<input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search records" /></label><div className="table-scroll"><table aria-label={page}><thead><tr>{section.columns.map(col => <th key={col} scope="col">{col}</th>)}</tr></thead><tbody>{rows?.length ? rows.map(row => <tr key={row[0]}>{row.map((cell, i) => <td key={i}>{i === 2 ? <span className="badge status">{cell}</span> : cell}</td>)}</tr>) : <tr><td colSpan={section.columns.length}>No matching records.</td></tr>}</tbody></table></div></section> : <>
        <div className="stat-grid">{(Object.keys(sections) as Section[]).map(item => { const Icon = navigation[item]; return <button className="panel stat" key={item} onClick={() => navigate(item)}><span className="icon-tile"><Icon size={21} /></span><strong>{sections[item].rows.length}</strong><span>{item}</span><ArrowRight className="stat-arrow" size={18} /></button> })}</div>
        <section className="panel info"><h2>About this workspace</h2><p>Sign-in is checked against <code>public.admin_users</code> by the <code>admin_login</code> function, so passwords never reach the browser. Learners, subjects, and mock tests are read-only examples and do not represent live site activity.</p></section>
      </>}
      </main></div>
  </div>
}

createRoot(document.getElementById('root')!).render(<App />)
