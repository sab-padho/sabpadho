import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Check, Lock, Mail } from 'lucide-react'
import { Button, SectionLabel } from '../components/ui'
import { learner } from '../data/learner'
import { useToast } from '../lib/toast'
import { usePageTitle } from '../lib/hooks'
import { PREVIEW_EMAIL, useAuth } from '../lib/auth'
import { useCopy } from '../lib/ui-copy'

export function SignIn() {
  const copy = useCopy()
  usePageTitle(copy.auth.signInTitle)
  const navigate = useNavigate()
  const location = useLocation()
  const { notify } = useToast()
  const { email: sessionEmail, signIn } = useAuth()
  const [email, setEmail] = useState<string>(PREVIEW_EMAIL)
  const [password, setPassword] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const from =
    (location.state as { from?: string } | null)?.from &&
    (location.state as { from?: string }).from!.startsWith('/app')
      ? (location.state as { from?: string }).from!
      : '/app'

  if (sessionEmail) return <Navigate to={from} replace />

  function submit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    window.setTimeout(() => {
      setBusy(false)
      if (signIn(email, password)) {
        notify(copy.auth.signedIn(learner.firstName), 'success')
        navigate(from, { replace: true })
      } else {
        setError(copy.auth.wrongCreds)
      }
    }, 420)
  }

  return (
    <div className="container-page py-10 md:py-16">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-14">
        <div className="order-2 lg:order-1">
          <div className="card p-5 sm:p-7">
            <SectionLabel>{copy.auth.welcome}</SectionLabel>
            <h1 className="mt-3 text-[27px] font-semibold leading-tight sm:text-[32px]">
              {copy.auth.title}
            </h1>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">{copy.auth.intro}</p>

            <form onSubmit={submit} className="mt-6 space-y-3.5">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-[12px] font-medium text-ink-soft">
                  {copy.auth.email}
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value)
                      setError(null)
                    }}
                    className="field pl-9"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="password" className="text-[12px] font-medium text-ink-soft">
                    {copy.auth.password}
                  </label>
                  <button
                    type="button"
                    onClick={() => notify(copy.auth.resetDisabled)}
                    className="text-[11px] text-muted hover:text-ink"
                  >
                    {copy.auth.forgot}
                  </button>
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value)
                      setError(null)
                    }}
                    className="field pl-9"
                    required
                  />
                </div>
              </div>

              {error ? (
                <p role="alert" className="rounded-lg border border-negative/25 bg-negative-soft px-3 py-2 text-[12px] leading-relaxed text-negative">
                  {error}
                </p>
              ) : null}

              <Button type="submit" className="w-full" size="lg" disabled={busy}>
                {busy ? copy.auth.signingIn : copy.auth.signInContinue}
                {busy ? null : <ArrowRight size={16} />}
              </Button>
            </form>

            <p className="mt-4 rounded-lg border border-line bg-surface-2/60 px-3 py-2 text-[11px] leading-relaxed text-muted">
              {copy.auth.previewNote}
            </p>

            <p className="mt-5 text-[12px] text-muted">
              {copy.auth.newHere}{' '}
              <Link to="/subjects/maths/percentages" className="link-underline text-ink-soft">
                {copy.auth.readPrimer}
              </Link>
              .
            </p>
          </div>
        </div>

        <aside className="order-1 lg:order-2">
          <div className="w-fit overflow-hidden rounded-2xl border border-line bg-[#0b0f1a] shadow-[var(--shadow-pop)]">
            <img
              src="/brand/sabpadho-lockup.webp"
              alt="SabPadho: Sab padho, sab badho."
              width={640}
              height={685}
              className="block w-[236px]"
            />
          </div>

          <h2 className="mt-6 max-w-[380px] font-display text-[23px] font-semibold leading-snug">
            {copy.auth.carryOn}
          </h2>
          <p className="mt-2 max-w-[380px] text-[13px] leading-relaxed text-muted">
            {copy.auth.carryOnBody}
          </p>

          <ul className="mt-5 space-y-3">
            {copy.auth.perks.map((item) => (
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
            <p className="label">{copy.auth.demoProfile}</p>
            <p className="mt-2 text-[13px] font-medium">{learner.name}</p>
            <p className="text-[11.5px] text-muted">
              {learner.target} · {copy.auth.daysToGo(learner.daysToExam)}
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
