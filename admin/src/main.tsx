import { useEffect, useState, type FormEvent } from 'react'
import { createRoot } from 'react-dom/client'
import { createClient, type Session } from '@supabase/supabase-js'
import { ArrowRight, BookOpen, ClipboardList, LayoutDashboard, LockKeyhole, LogOut, Users } from 'lucide-react'
import logo from '../../public/brand/sabpadho-mark.png'
import '../../src/index.css'
import './style.css'
import { sections, type Section } from './data'

const { VITE_SUPABASE_URL: url, VITE_SUPABASE_PUBLISHABLE_KEY: key } = import.meta.env
const supabase = url && key ? createClient(url, key) : null
const navigation = { Overview: LayoutDashboard, Learners: Users, Subjects: BookOpen, 'Mock tests': ClipboardList }
type Page = keyof typeof navigation

function Brand() {
  return <div className="brand-lockup"><img src={logo} alt="" /><div><strong>SabPadho</strong><small>Admin portal</small></div></div>
}

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [verifiedToken, setVerifiedToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(Boolean(supabase))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState<Page>('Overview')
  const [query, setQuery] = useState('')
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
        setError(error ? 'Could not verify admin access. Please try again.' : 'This account does not have admin access.')
      } catch {
        if (!current) return
        setError('Could not verify admin access. Please try again.')
      }
      await client.auth.signOut({ scope: 'local' })
    })()
    return () => { current = false }
  }, [token, userId])

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase) return
    const fields = new FormData(event.currentTarget)
    setBusy(true)
    setError('')
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: String(fields.get('email')).trim(), password: String(fields.get('password')) })
      if (error) setError('Sign-in failed. Check your credentials and try again.')
    } catch {
      setError('Could not reach the sign-in service. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  async function signOut() {
    setBusy(true)
    setError('')
    try {
      const { error } = await supabase!.auth.signOut({ scope: 'local' })
      if (error) throw error
      setVerifiedToken(null)
      navigate('Overview')
    } catch {
      setError('Could not sign out. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  function navigate(next: Page) {
    setPage(next)
    setQuery('')
  }

  if (!session || verifiedToken !== token) return <main className="login-layout">
    <section className="login-intro"><Brand /><div><span className="eyebrow">SABPADHO WORKSPACE</span><h1>Manage the learning experience.</h1><p>One place to review learners, subjects, and mock tests.</p></div><small>Restricted to authorized staff</small></section>
    <section className="login-main"><div className="panel login-card"><div className="icon-tile"><LockKeyhole size={22} /></div><h2>Admin sign in</h2><p>Use your SabPadho admin account to continue.</p>
      {loading || (session && !error) ? <p role="status">Checking admin access…</p> : <form onSubmit={signIn}>
        <label>Email address<input name="email" type="email" autoComplete="username" placeholder="you@sabpadho.com" required /></label>
        <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
        {!supabase && <p className="notice" role="status">Sign-in is not configured. Add the Supabase URL and publishable key to enable it.</p>}
        {error && <p className="notice" role="alert">{error}</p>}
        {session ? <button className="primary" type="button" disabled={busy} onClick={signOut}>Return to sign in</button> : <button className="primary" disabled={!supabase || busy}>{busy ? 'Signing in…' : 'Sign in'} <ArrowRight size={17} /></button>}
      </form>}
    </div></section>
  </main>

  const section = page === 'Overview' ? null : sections[page]
  const rows = section?.rows.filter(row => row.some(value => value.toLowerCase().includes(query.trim().toLowerCase())))
  return <div className="workspace">
    <aside className="rail"><Brand /><nav aria-label="Admin navigation">{(Object.keys(navigation) as Page[]).map(item => {
      const Icon = navigation[item]
      return <button key={item} aria-current={page === item ? 'page' : undefined} onClick={() => navigate(item)}><Icon size={19} />{item}</button>
    })}</nav><button className="logout" onClick={signOut} disabled={busy}><LogOut size={18} />Sign out</button></aside>
    <div className="workspace-body"><header className="topbar"><strong>Admin workspace</strong><span>{session.user.email}</span></header>
      <main className="content"><div className="page-heading"><div><span className="eyebrow">ADMIN PORTAL</span><h1>{page}</h1><p>{section?.description ?? 'A snapshot of your SabPadho workspace.'}</p></div><span className="badge">Sample data</span></div>
      {error && <p className="notice" role="alert">{error}</p>}
      {section ? <section className="panel table-panel"><label className="search">Filter {page.toLowerCase()}<input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search records" /></label><div className="table-scroll"><table aria-label={page}><thead><tr>{section.columns.map(col => <th key={col} scope="col">{col}</th>)}</tr></thead><tbody>{rows?.length ? rows.map(row => <tr key={row[0]}>{row.map((cell, i) => <td key={i}>{i === 2 ? <span className="badge status">{cell}</span> : cell}</td>)}</tr>) : <tr><td colSpan={section.columns.length}>No matching records.</td></tr>}</tbody></table></div></section> : <>
        <div className="stat-grid">{(Object.keys(sections) as Section[]).map(item => { const Icon = navigation[item]; return <button className="panel stat" key={item} onClick={() => navigate(item)}><span className="icon-tile"><Icon size={21} /></span><strong>{sections[item].rows.length}</strong><span>{item}</span><ArrowRight className="stat-arrow" size={18} /></button> })}</div>
        <section className="panel info"><h2>About this workspace</h2><p>Sign-in and admin access are verified through Supabase. Learners, subjects, and mock tests are read-only examples and do not represent live site activity.</p></section>
      </>}
      </main></div>
  </div>
}

createRoot(document.getElementById('root')!).render(<App />)
