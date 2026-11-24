import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Check, GraduationCap, Lock, Mail, Sparkles, User } from 'lucide-react'
import { Badge, Button, SectionLabel } from '../components/ui'
import { EXAM_OPTIONS, getExamConfig, isValidExam, type ExamId } from '../data/exams'
import { useToast } from '../lib/toast'
import { usePageTitle } from '../lib/hooks'
import { PREVIEW_EMAIL, useAuth } from '../lib/auth'
import { useLang } from '../lib/lang'
import { useCopy } from '../lib/ui-copy'
import { cn } from '../lib/utils'

export function SignIn({ initialMode }: { initialMode?: 'signin' | 'signup' }) {
  const copy = useCopy()
  const { lang } = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { notify } = useToast()
  const { email: sessionEmail, signIn, signUp } = useAuth()

  const modeFromQuery = searchParams.get('mode')
  const defaultMode: 'signin' | 'signup' =
    initialMode ??
    (modeFromQuery === 'signup' || location.pathname === '/signup' ? 'signup' : 'signin')

  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode)
  usePageTitle(mode === 'signup' ? 'Sign up & choose your exam' : copy.auth.signInTitle)

  useEffect(() => {
    if (location.pathname === '/signup') setMode('signup')
    else if (modeFromQuery === 'signup') setMode('signup')
    else if (location.pathname === '/signin' && !modeFromQuery) setMode('signin')
  }, [location.pathname, modeFromQuery])

  const preselectedExam = searchParams.get('exam')
  const [name, setName] = useState('')
  const [email, setEmail] = useState<string>(defaultMode === 'signin' ? PREVIEW_EMAIL : '')
  const [password, setPassword] = useState<string>('')
  const [preferredExam, setPreferredExam] = useState<ExamId>(
    isValidExam(preselectedExam) ? preselectedExam : 'SSC CGL',
  )
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const stateFrom = (location.state as { from?: string; reason?: string } | null)?.from
  const reason = (location.state as { reason?: string } | null)?.reason
  const from = stateFrom && (stateFrom.startsWith('/app') || stateFrom.startsWith('/subjects')) ? stateFrom : '/app'

  if (sessionEmail) return <Navigate to={from} replace />

  function switchMode(next: 'signin' | 'signup') {
    setMode(next)
    setError(null)
    if (next === 'signup' && email === PREVIEW_EMAIL) {
      setEmail('')
      setPassword('')
    } else if (next === 'signin' && !email) {
      setEmail(PREVIEW_EMAIL)
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      if (mode === 'signup') {
        const res = await signUp({ name, email, password, preferredExam })
        if (res.ok && res.profile) {
          notify(
            lang === 'hi'
              ? `स्वागत है ${res.profile.firstName}! आपका ${preferredExam} अध्ययन डेस्क तैयार है।`
              : `Welcome, ${res.profile.firstName}! Your ${preferredExam} workspace is ready.`,
            'success',
          )
          navigate(from, { replace: true })
        } else {
          setError(res.error ?? 'Could not create your account.')
        }
      } else {
        const res = await signIn(email, password)
        if (res.ok && res.profile) {
          notify(copy.auth.signedIn(res.profile.firstName), 'success')
          navigate(from, { replace: true })
        } else {
          setError(res.error ?? copy.auth.wrongCreds)
        }
      }
    } finally {
      setBusy(false)
    }
  }

  const selectedExamInfo = getExamConfig(preferredExam)

  return (
    <div className="container-page py-10 md:py-16">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start lg:gap-14">
        <div className="order-2 lg:order-1">
          <div className="card p-5 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <SectionLabel>
                {mode === 'signup'
                  ? lang === 'hi'
                    ? 'निःशुल्क खाता बनाएँ'
                    : 'Free account · Unlock full syllabus'
                  : copy.auth.welcome}
              </SectionLabel>
              <div className="inline-flex rounded-lg border border-line bg-surface-2 p-0.5 text-[12px]">
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className={cn(
                    'rounded-md px-2.5 py-1 font-medium transition',
                    mode === 'signup' ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink',
                  )}
                >
                  {lang === 'hi' ? 'साइन अप' : 'Sign up'}
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className={cn(
                    'rounded-md px-2.5 py-1 font-medium transition',
                    mode === 'signin' ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink',
                  )}
                >
                  {lang === 'hi' ? 'साइन इन' : 'Sign in'}
                </button>
              </div>
            </div>

            {reason ? (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-brand/25 bg-brand-soft/60 px-3.5 py-2.5 text-[12px] leading-relaxed text-brand-ink">
                <Sparkles size={14} className="mt-0.5 shrink-0" />
                <span>{reason}</span>
              </div>
            ) : null}

            <h1 className="mt-3 text-[26px] font-semibold leading-tight sm:text-[31px]">
              {mode === 'signup'
                ? lang === 'hi'
                  ? 'अपनी परीक्षा चुनें और सभी अध्याय व मॉक अनलॉक करें।'
                  : 'Create your account & pick your target exam.'
                : copy.auth.title}
            </h1>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              {mode === 'signup'
                ? lang === 'hi'
                  ? 'साइन अप के बाद आपको केवल आपकी चुनी हुई परीक्षा के विषय और मॉक मुख्य रूप से दिखेंगे — बाकी परीक्षाएँ "अन्य परीक्षाएँ" (Others) में व्यवस्थित रहेंगी।'
                  : 'Once signed up, your study desk focuses strictly on your preferred exam — while keeping other exams neatly tucked inside the “Others” section whenever you want to switch.'
                : copy.auth.intro}
            </p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              {mode === 'signup' ? (
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-[12px] font-medium text-ink-soft">
                    {lang === 'hi' ? 'पूरा नाम' : 'Full name'}
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      id="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Aarav Deshmukh"
                      value={name}
                      onChange={(event) => {
                        setName(event.target.value)
                        setError(null)
                      }}
                      className="field pl-9"
                      required
                    />
                  </div>
                </div>
              ) : null}

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
                    placeholder="you@example.com"
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
                  {mode === 'signin' ? (
                    <button
                      type="button"
                      onClick={() => notify(copy.auth.resetDisabled)}
                      className="text-[11px] text-muted hover:text-ink"
                    >
                      {copy.auth.forgot}
                    </button>
                  ) : (
                    <span className="text-[11px] text-muted">
                      {lang === 'hi' ? 'कम से कम 6 अक्षर' : 'Min 6 characters'}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    id="password"
                    type="password"
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    placeholder={mode === 'signin' ? 'test@123' : '••••••••'}
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

              {mode === 'signup' ? (
                <div className="pt-1">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <label className="flex items-center gap-1.5 text-[12px] font-medium text-ink-soft">
                      <GraduationCap size={14} className="text-brand" />
                      {lang === 'hi'
                        ? 'आप किस परीक्षा की तैयारी कर रहे हैं?'
                        : 'Which exam are you preparing for?'}
                    </label>
                    <Badge tone="brand">{preferredExam}</Badge>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Preferred exam">
                    {EXAM_OPTIONS.map((option) => {
                      const active = option.id === preferredExam
                      return (
                        <button
                          key={option.id}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => setPreferredExam(option.id)}
                          className={cn(
                            'flex items-start gap-2.5 rounded-xl border p-3 text-left transition',
                            active
                              ? 'border-brand bg-brand-soft/70 shadow-[0_0_0_1px_var(--brand)]'
                              : 'border-line bg-surface hover:border-line-strong hover:bg-surface-2/50',
                          )}
                        >
                          <span
                            className={cn(
                              'mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border',
                              active ? 'border-brand bg-brand text-white' : 'border-line-strong bg-surface',
                            )}
                          >
                            {active ? <Check size={10} /> : null}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[12.5px] font-semibold text-ink">
                              {option.shortLabel}
                            </span>
                            <span className="mt-0.5 block text-[10.5px] leading-snug text-muted">
                              {lang === 'hi' ? option.taglineHi : option.tagline}
                            </span>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : null}

              {error ? (
                <p
                  role="alert"
                  className="rounded-lg border border-negative/25 bg-negative-soft px-3 py-2 text-[12px] leading-relaxed text-negative"
                >
                  {error}
                </p>
              ) : null}

              <Button type="submit" className="w-full" size="lg" disabled={busy}>
                {busy
                  ? mode === 'signup'
                    ? lang === 'hi'
                      ? 'खाता बन रहा है…'
                      : 'Creating your workspace…'
                    : copy.auth.signingIn
                  : mode === 'signup'
                    ? lang === 'hi'
                      ? `${preferredExam} के साथ शुरू करें`
                      : `Create account for ${preferredExam}`
                    : copy.auth.signInContinue}
                {busy ? null : <ArrowRight size={16} />}
              </Button>
            </form>

            {mode === 'signin' ? (
              <p className="mt-4 rounded-lg border border-line bg-surface-2/60 px-3 py-2 text-[11px] leading-relaxed text-muted">
                Demo login: <strong className="text-ink-soft">test@gmail.com</strong> /{' '}
                <strong className="text-ink-soft">test@123</strong> — or switch to{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="font-medium text-brand-ink underline underline-offset-2"
                >
                  Sign up
                </button>{' '}
                to create your own profile and choose your exam.
              </p>
            ) : (
              <p className="mt-4 rounded-lg border border-line bg-surface-2/60 px-3 py-2 text-[11px] leading-relaxed text-muted">
                {lang === 'hi'
                  ? 'आप बाद में कभी भी हेडर या साइडबार के "अन्य परीक्षाएँ" (Others) विकल्प से अपनी परीक्षा बदल सकते हैं।'
                  : 'You can switch to any other exam anytime from the “Others” exam switcher in your study desk.'}
              </p>
            )}

            <p className="mt-5 text-[12px] text-muted">
              {mode === 'signup' ? (
                <>
                  {lang === 'hi' ? 'पहले से खाता है?' : 'Already have an account?'}{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('signin')}
                    className="link-underline font-medium text-ink-soft"
                  >
                    {lang === 'hi' ? 'साइन इन करें' : 'Sign in'}
                  </button>
                  {' · '}
                </>
              ) : (
                <>
                  {copy.auth.newHere}{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    className="link-underline font-medium text-ink-soft"
                  >
                    {lang === 'hi' ? 'नया खाता बनाएँ' : 'Create a free account'}
                  </button>
                  {' · '}
                </>
              )}
              <Link to="/subjects/maths/percentages" className="link-underline text-ink-soft">
                {copy.auth.readPrimer}
              </Link>
            </p>
          </div>
        </div>

        <aside className="order-1 lg:order-2 lg:sticky lg:top-24">
          <div className="w-fit overflow-hidden rounded-2xl border border-line bg-[#0b0f1a] shadow-[var(--shadow-pop)]">
            <img
              src="/brand/sabpadho-lockup.webp"
              alt="SabPadho: Sab padho, sab badho."
              width={640}
              height={685}
              className="block w-[220px]"
            />
          </div>

          <h2 className="mt-6 max-w-[390px] font-display text-[23px] font-semibold leading-snug">
            {mode === 'signup'
              ? lang === 'hi'
                ? 'आपकी चुनी हुई परीक्षा पर पूरा फोकस।'
                : 'Focused on your exam. Zero clutter.'
              : copy.auth.carryOn}
          </h2>
          <p className="mt-2 max-w-[390px] text-[13px] leading-relaxed text-muted">
            {mode === 'signup'
              ? lang === 'hi'
                ? 'मेहमान उपयोगकर्ता केवल चुनिंदा निःशुल्क अध्याय नोट्स पढ़ सकते हैं। साइन अप करने पर प्रैक्टिस स्प्रिंट, टाइम्ड मॉक टेस्ट, रिवीज़न क्यू और आपकी परीक्षा के सभी अध्याय खुल जाते हैं।'
                : 'Visitors get free sample chapter primers to try SabPadho. Signing up unlocks all chapters, topic sprints, timed mock papers, your revision queue, and personalised exam filtering.'
              : copy.auth.carryOnBody}
          </p>

          <ul className="mt-5 space-y-3">
            {[
              {
                title:
                  lang === 'hi'
                    ? 'आपकी परीक्षा का समर्पित पाठ्यक्रम'
                    : 'Dedicated track for your preferred exam',
                body:
                  lang === 'hi'
                    ? 'SSC CGL, CHSL, GD, Railways या Banking — केवल ज़रूरी विषय सामने दिखते हैं।'
                    : 'Only subjects, chapters, and mocks for your chosen exam take front stage.',
              },
              {
                title:
                  lang === 'hi'
                    ? 'अन्य परीक्षाएँ "Others" में सुरक्षित'
                    : 'Other exams zipped neatly in “Others”',
                body:
                  lang === 'hi'
                    ? 'एक क्लिक में कभी भी दूसरी परीक्षा देखें या अपनी मुख्य परीक्षा बदलें।'
                    : 'Other exam syllabi stay collapsed in an “Others” drawer — switch tracks in one click.',
              },
              {
                title:
                  lang === 'hi'
                    ? 'प्रैक्टिस स्प्रिंट, मॉक टेस्ट और रिवीज़न'
                    : 'Full sprints, mocks & spaced revision',
                body:
                  lang === 'hi'
                    ? 'हर प्रश्न के बाद विस्तृत हल और गलत उत्तरों की स्वचालित दोहराव सूची।'
                    : 'Step-by-step bilingual reasoning and automatic return dates for missed questions.',
              },
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
            <p className="label">
              {mode === 'signup'
                ? lang === 'hi'
                  ? 'चयनित परीक्षा ट्रैक'
                  : 'Selected exam track'
                : copy.auth.demoProfile}
            </p>
            <p className="mt-2 text-[13.5px] font-semibold text-ink">{selectedExamInfo.label}</p>
            <p className="mt-0.5 text-[11.5px] text-muted">
              {selectedExamInfo.sectionsCount} sections · {selectedExamInfo.questionsCount} questions ·{' '}
              {selectedExamInfo.durationMinutes} min · {copy.auth.daysToGo(selectedExamInfo.daysToExam)}
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
