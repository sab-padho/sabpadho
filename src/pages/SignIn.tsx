import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Check, Lock, Mail } from 'lucide-react'
import { Button, ButtonLink, SectionLabel } from '../components/ui'
import { learner } from '../data/learner'
import { useToast } from '../lib/toast'
import { usePageTitle } from '../lib/hooks'

export function SignIn() {
  usePageTitle('Sign in')
  const navigate = useNavigate()
  const { notify } = useToast()
  const [email, setEmail] = useState<string>(learner.email)
  const [password, setPassword] = useState<string>('demo1234')
  const [busy, setBusy] = useState(false)

  function submit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    window.setTimeout(() => {
      notify(`Signed in as ${learner.firstName} (demo learner)`, 'success')
      navigate('/app')
    }, 420)
  }

  return (
    <div className="container-page py-10 md:py-16">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-14">
        <div className="order-2 lg:order-1">
          <div className="card p-5 sm:p-7">
            <SectionLabel>Welcome back</SectionLabel>
            <h1 className="mt-3 text-[27px] font-semibold leading-tight sm:text-[32px]">
              Pick up where you left off.
            </h1>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              Six questions are due for revision and your Percentages sprint is waiting at question
              seven.
            </p>

            <form onSubmit={submit} className="mt-6 space-y-3.5">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-[12px] font-medium text-ink-soft">
                  Email
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="field pl-9"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="password" className="text-[12px] font-medium text-ink-soft">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => notify('Password resets are disabled in this preview')}
                    className="text-[11px] text-muted hover:text-ink"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="field pl-9"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={busy}>
                {busy ? 'Signing in…' : 'Sign in and continue'}
                {busy ? null : <ArrowRight size={16} />}
              </Button>

              <ButtonLink to="/app" variant="secondary" className="w-full" size="lg">
                Continue as demo learner
              </ButtonLink>
            </form>

            <p className="mt-4 rounded-lg border border-line bg-surface-2/60 px-3 py-2 text-[11px] leading-relaxed text-muted">
              This is a preview. No account is created, no password is stored, and everything you do
              stays in this browser.
            </p>

            <p className="mt-5 text-[12px] text-muted">
              New to SabPadho?{' '}
              <Link to="/subjects/maths/percentages" className="link-underline text-ink-soft">
                Read a chapter primer first
              </Link>
              .
            </p>
          </div>
        </div>

        <aside className="order-1 lg:order-2">
          <div className="w-fit overflow-hidden rounded-2xl border border-line bg-[#0b0f1a] shadow-[var(--shadow-pop)]">
            <img
              src="/brand/sabpadho-lockup.webp"
              alt="SabPadho — Sab padho, sab badho."
              width={640}
              height={685}
              className="block w-[236px]"
            />
          </div>

          <h2 className="mt-6 max-w-[380px] font-display text-[23px] font-semibold leading-snug">
            Sign in on your phone, carry on at a desk.
          </h2>
          <p className="mt-2 max-w-[380px] text-[13px] leading-relaxed text-muted">
            Your acknowledgements, bookmarks, language choice and revision dates follow you between
            devices.
          </p>

          <ul className="mt-5 space-y-3">
            {[
              { title: 'Your last six sessions', body: 'Resume a sprint at the exact question you stopped on.' },
              { title: 'One shelf for saved questions', body: 'Filter by subject and chapter, not by test.' },
              { title: 'A revision queue that waits', body: 'Due questions come back on schedule, without hints.' },
            ].map((item) => (
              <li key={item.title} className="flex gap-2.5">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-positive-soft text-positive">
                  <Check size={12} />
                </span>
                <div>
                  <p className="text-[12.5px] font-medium text-ink">{item.title}</p>
                  <p className="text-[11.5px] leading-relaxed text-muted">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-xl border border-line bg-surface-2/50 p-4">
            <p className="label">The demo profile</p>
            <p className="mt-2 text-[13px] font-medium">{learner.name}</p>
            <p className="text-[11.5px] text-muted">
              {learner.target} · {learner.daysToExam} days to go
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
