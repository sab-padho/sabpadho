import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Check, Crown, GraduationCap, LogOut, Trash2 } from 'lucide-react'
import { Avatar, Badge, Button, SectionLabel, Segmented, Switch } from '../../components/ui'
import { learner } from '../../data/learner'
import { EXAM_OPTIONS, getExamConfig } from '../../data/exams'
import { useTheme } from '../../lib/theme'
import { useLang } from '../../lib/lang'
import { localDate, planLabel, useCopy } from '../../lib/ui-copy'
import { useAuth } from '../../lib/auth'
import { useLocalStorage, usePageTitle } from '../../lib/hooks'
import { useToast } from '../../lib/toast'
import { cn } from '../../lib/utils'

export function SettingsPage() {
  const { lang, setLang } = useLang()
  const copy = useCopy()
  usePageTitle(copy.nav.settings)
  const navigate = useNavigate()
  const { resolved, setMode } = useTheme()
  const { notify } = useToast()
  const { user, preferredExam, setPreferredExam, signOut } = useAuth()
  const examInfo = getExamConfig(preferredExam)
  const [defaultLength, setDefaultLength] = useLocalStorage('sabpadho-default-length', 5)
  const [showExplanation, setShowExplanation] = useLocalStorage('sabpadho-auto-explain', true)
  const [reminders, setReminders] = useLocalStorage('sabpadho-reminders', true)
  const [mockAlerts, setMockAlerts] = useLocalStorage('sabpadho-mock-alerts', true)
  const [reducedMotion, setReducedMotion] = useLocalStorage('sabpadho-reduced-motion', false)

  function resetData() {
    const keys: string[] = []
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index)
      if (
        key &&
        key.startsWith('sabpadho-') &&
        key !== 'sabpadho-theme' &&
        key !== 'sabpadho-lang' &&
        key !== 'sabpadho-auth-v2' &&
        key !== 'sabpadho-accounts-v1'
      ) {
        keys.push(key)
      }
    }
    keys.forEach((key) => localStorage.removeItem(key))
    notify(copy.settings.cleared, 'success')
  }

  return (
    <div className="space-y-5">
      <header>
        <SectionLabel>{copy.settings.label}</SectionLabel>
        <h1 className="mt-1.5 text-[26px] font-semibold leading-tight sm:text-[30px]">
          {copy.settings.title}
        </h1>
        <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-muted">
          {copy.settings.intro}
        </p>
      </header>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr] xl:items-start">
        <div className="space-y-4">
          <section className="card p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-[14.5px] font-semibold">
                  <GraduationCap size={16} className="text-brand" />
                  {lang === 'hi' ? 'पसंदीदा परीक्षा (Exam Preference)' : 'Preferred exam track'}
                </h2>
                <p className="mt-0.5 text-[11.5px] text-muted">
                  {lang === 'hi'
                    ? 'केवल चुनी हुई परीक्षा के विषय और मॉक मुख्य डेस्क पर दिखेंगे; बाकी Others में ज़िप रहेंगे।'
                    : 'Only content for your selected exam appears on your main desk; other exams stay zipped under Others.'}
                </p>
              </div>
              <Badge tone="brand">{preferredExam}</Badge>
            </div>

            <div className="mt-3 grid gap-2 border-t border-line pt-3 sm:grid-cols-2">
              {EXAM_OPTIONS.map((exam) => {
                const active = exam.id === preferredExam
                return (
                  <button
                    key={exam.id}
                    type="button"
                    onClick={async () => {
                      await setPreferredExam(exam.id)
                      notify(`Preferred exam updated to ${exam.shortLabel}`, 'success')
                    }}
                    aria-pressed={active}
                    className={cn(
                      'flex items-start gap-2.5 rounded-xl border p-2.5 text-left transition',
                      active
                        ? 'border-brand bg-brand-soft/60'
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
                        {exam.shortLabel}
                      </span>
                      <span className="mt-0.5 block text-[10.5px] leading-snug text-muted">
                        {lang === 'hi' ? exam.taglineHi : exam.tagline}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          <section className="card p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[14.5px] font-semibold">{copy.settings.appearance}</h2>
                <p className="mt-0.5 text-[11.5px] text-muted">
                  {copy.settings.appearanceBody}
                </p>
              </div>
              <Badge tone="outline">{resolved === 'dark' ? copy.settings.dark : copy.settings.light}</Badge>
            </div>

            <div className="mt-3 border-t border-line pt-1">
              <Switch
                checked={resolved === 'dark'}
                onChange={(next) => setMode(next ? 'dark' : 'light')}
                label={copy.settings.darkTheme}
                description={copy.settings.darkDesc}
              />
            </div>
          </section>

          <section className="card p-4 sm:p-5">
            <h2 className="text-[14.5px] font-semibold">{copy.settings.questionLang}</h2>
            <p className="mt-0.5 text-[11.5px] text-muted">
              {copy.settings.questionLangBody}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Segmented
                ariaLabel={copy.settings.questionLang}
                value={lang}
                onChange={setLang}
                options={[
                  { value: 'en', label: copy.practice.english },
                  { value: 'hi', label: copy.practice.hindi },
                ]}
              />
              <span className="text-[11px] text-muted">
                {lang === 'en' ? copy.settings.langSavedEn : copy.settings.langSavedHi}
              </span>
            </div>
          </section>

          <section className="card p-4 sm:p-5">
            <h2 className="text-[14.5px] font-semibold">{copy.settings.studyDefaults}</h2>
            <p className="mt-0.5 text-[11.5px] text-muted">
              {copy.settings.studyDefaultsBody}
            </p>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
              <div>
                <p className="text-[12.5px] font-medium">{copy.settings.defaultLength}</p>
                <p className="mt-0.5 text-[11px] text-muted">
                  {copy.settings.defaultLengthBody}
                </p>
              </div>
              <Segmented
                ariaLabel={copy.settings.defaultLength}
                size="sm"
                value={defaultLength}
                onChange={setDefaultLength}
                options={[
                  { value: 5, label: '5' },
                  { value: 10, label: '10' },
                  { value: 15, label: '15' },
                ]}
              />
            </div>

            <div className="mt-1 border-t border-line">
              <Switch
                checked={showExplanation}
                onChange={setShowExplanation}
                label={copy.settings.showReasoning}
                description={copy.settings.showReasoningBody}
              />
            </div>
            <div className="border-t border-line">
              <Switch
                checked={reducedMotion}
                onChange={(value) => {
                  setReducedMotion(value)
                  document.documentElement.classList.toggle('reduce-motion', value)
                  notify(value ? copy.settings.motionOn : copy.settings.motionOff)
                }}
                label={copy.settings.reduceMotion}
                description={copy.settings.reduceMotionBody}
              />
            </div>
          </section>

          <section className="card p-4 sm:p-5">
            <h2 className="text-[14.5px] font-semibold">{copy.settings.reminders}</h2>
            <p className="mt-0.5 text-[11.5px] text-muted">
              {copy.settings.remindersBody}
            </p>
            <div className="mt-1">
              <Switch
                checked={reminders}
                onChange={setReminders}
                label={copy.settings.revisionReminder}
                description={copy.settings.revisionReminderBody}
              />
            </div>
            <div className="border-t border-line">
              <Switch
                checked={mockAlerts}
                onChange={setMockAlerts}
                label={copy.settings.sundayReminder}
                description={copy.settings.sundayReminderBody}
              />
            </div>
          </section>

          <section className="card p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[14.5px] font-semibold">{copy.settings.previewData}</h2>
                <p className="mt-0.5 max-w-md text-[11.5px] leading-relaxed text-muted">
                  {copy.settings.previewDataBody}
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={resetData}>
                <Trash2 size={13} /> {copy.settings.clearData}
              </Button>
            </div>
            <p className="mt-3 rounded-lg bg-surface-2/70 px-3 py-2 text-[10.5px] leading-relaxed text-muted">
              {copy.settings.noPassword}
            </p>
          </section>
        </div>

        <aside className="space-y-3">
          <section className="card p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="label">{copy.settings.planCard}</p>
              <Badge tone="brand">{planLabel(lang, learner.plan)}</Badge>
            </div>

            <div className="mt-3 flex items-baseline justify-between gap-2">
              <p className="text-[13.5px] font-semibold">{copy.settings.planFree}</p>
              <p className="text-[11.5px] text-muted">₹0</p>
            </div>
            <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{copy.settings.planFreeBody}</p>

            <div className="mt-3 rounded-xl border border-brand/25 bg-brand-soft/35 p-3">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[13.5px] font-semibold">{copy.settings.planPro}</p>
                <p className="text-[17px] font-semibold tracking-tight">
                  {copy.settings.planPrice(51)}
                  <span className="text-[10.5px] font-normal text-muted">{copy.settings.planPerYear}</span>
                </p>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-muted">{copy.settings.planProBody}</p>
              <ul className="mt-2 space-y-1">
                {copy.settings.planProFeatures.map((feature) => (
                  <li key={feature} className="flex gap-1.5 text-[11px] leading-relaxed text-ink-soft">
                    <Check size={12} className="mt-0.5 shrink-0 text-positive" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="mt-3 w-full" size="sm" onClick={() => notify(copy.settings.planUpgraded)}>
                <Crown size={13} /> {copy.settings.planUpgrade}
              </Button>
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-muted">{copy.settings.planNote}</p>
          </section>

          <div className="card p-4">
            <p className="label">{copy.settings.profile}</p>
            <div className="mt-3 flex items-center gap-3">
              <Avatar initials={user?.initials ?? learner.initials} size={44} />
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold">{user?.name ?? learner.name}</p>
                <p className="truncate text-[11.5px] text-muted">{user?.email ?? learner.email}</p>
              </div>
            </div>
            <dl className="mt-3 space-y-2 border-t border-line pt-3 text-[11.5px]">
              {[
                [copy.settings.target, examInfo.targetDisplay],
                [copy.settings.examDate, `${localDate(lang, examInfo.targetDate)} · ${copy.settings.daysN(examInfo.daysToExam)}`],
                [copy.settings.joined, localDate(lang, user?.joined ?? learner.joined)],
                [copy.settings.plan, planLabel(lang, user?.plan ?? learner.plan)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-3">
                  <dt className="text-muted">{label}</dt>
                  <dd className="text-right text-ink-soft">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="card p-4">
            <p className="text-[12px] font-medium">{copy.settings.needHand}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted">
              {copy.settings.writeTo}{' '}
              <a href="mailto:hello@sabpadho.in" className="link-underline text-ink-soft">
                hello@sabpadho.in
              </a>{' '}
              {copy.settings.withPaper}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                signOut()
                notify(copy.auth.signedOut)
                navigate('/signin')
              }}
            >
              <LogOut size={13} /> {copy.settings.signOut}
            </Button>
            <Link
              to="/how-it-works"
              className="inline-flex items-center justify-center gap-1 text-[11px] text-muted hover:text-ink"
            >
              {copy.settings.howWorks} <ArrowRight size={12} />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
