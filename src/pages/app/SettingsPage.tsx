import { Link } from 'react-router-dom'
import { ArrowRight, LogOut, Trash2 } from 'lucide-react'
import { Avatar, Badge, Button, ButtonLink, SectionLabel, Segmented, Switch } from '../../components/ui'
import { learner } from '../../data/learner'
import { useTheme } from '../../lib/theme'
import { useLang } from '../../lib/lang'
import { useLocalStorage, usePageTitle } from '../../lib/hooks'
import { useToast } from '../../lib/toast'

export function SettingsPage() {
  usePageTitle('Preferences')
  const { resolved, setMode } = useTheme()
  const { lang, setLang } = useLang()
  const { notify } = useToast()
  const [defaultLength, setDefaultLength] = useLocalStorage('sabpadho-default-length', 5)
  const [showExplanation, setShowExplanation] = useLocalStorage('sabpadho-auto-explain', true)
  const [reminders, setReminders] = useLocalStorage('sabpadho-reminders', true)
  const [mockAlerts, setMockAlerts] = useLocalStorage('sabpadho-mock-alerts', true)
  const [reducedMotion, setReducedMotion] = useLocalStorage('sabpadho-reduced-motion', false)

  function resetData() {
    const keys: string[] = []
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index)
      if (key && key.startsWith('sabpadho-') && key !== 'sabpadho-theme' && key !== 'sabpadho-lang') {
        keys.push(key)
      }
    }
    keys.forEach((key) => localStorage.removeItem(key))
    notify('Preview data cleared. Reload to start fresh.', 'success')
  }

  return (
    <div className="space-y-5">
      <header>
        <SectionLabel>Preferences</SectionLabel>
        <h1 className="mt-1.5 text-[26px] font-semibold leading-tight sm:text-[30px]">
          Make the desk yours
        </h1>
        <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-muted">
          Appearance, language and the defaults used when you start a sprint. These settings stay in
          this browser.
        </p>
      </header>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr] xl:items-start">
        <div className="space-y-4">
          <section className="card p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[14.5px] font-semibold">Appearance</h2>
                <p className="mt-0.5 text-[11.5px] text-muted">
                  Light is the default. Dark is one switch, and it sticks to this browser.
                </p>
              </div>
              <Badge tone="outline">{resolved === 'dark' ? 'Dark' : 'Light'}</Badge>
            </div>

            <div className="mt-3 border-t border-line pt-1">
              <Switch
                checked={resolved === 'dark'}
                onChange={(next) => setMode(next ? 'dark' : 'light')}
                label="Dark theme"
                description="Warm-white canvas by day, low-glare ink at night."
              />
            </div>
          </section>

          <section className="card p-4 sm:p-5">
            <h2 className="text-[14.5px] font-semibold">Question language</h2>
            <p className="mt-0.5 text-[11.5px] text-muted">
              Used for prompts, options and explanations. Option order stays the same.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Segmented
                ariaLabel="Preferred question language"
                value={lang}
                onChange={setLang}
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'hi', label: 'हिंदी' },
                ]}
              />
              <span className="text-[11px] text-muted">
                {lang === 'en' ? 'English is saved as your default.' : 'हिंदी आपकी डिफ़ॉल्ट भाषा है।'}
              </span>
            </div>
          </section>

          <section className="card p-4 sm:p-5">
            <h2 className="text-[14.5px] font-semibold">Study defaults</h2>
            <p className="mt-0.5 text-[11.5px] text-muted">
              Applied when you open practice setup, still changeable per session.
            </p>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
              <div>
                <p className="text-[12.5px] font-medium">Default sprint length</p>
                <p className="mt-0.5 text-[11px] text-muted">
                  Sets the preselected length for a new sprint.
                </p>
              </div>
              <Segmented
                ariaLabel="Default sprint length"
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
                label="Show the reasoning after every check"
                description="Turn off if you prefer to review the solution at the end of a set."
              />
            </div>
            <div className="border-t border-line">
              <Switch
                checked={reducedMotion}
                onChange={(value) => {
                  setReducedMotion(value)
                  document.documentElement.classList.toggle('reduce-motion', value)
                  notify(value ? 'Reduced motion on' : 'Reduced motion off')
                }}
                label="Reduce motion"
                description="Limits chart and page animations. Your device setting is still respected."
              />
            </div>
          </section>

          <section className="card p-4 sm:p-5">
            <h2 className="text-[14.5px] font-semibold">Reminders</h2>
            <p className="mt-0.5 text-[11.5px] text-muted">
              Illustrative in this preview; no messages are sent.
            </p>
            <div className="mt-1">
              <Switch
                checked={reminders}
                onChange={setReminders}
                label="Revision due reminder"
                description="A single daily note when questions are due, around 7 pm."
              />
            </div>
            <div className="border-t border-line">
              <Switch
                checked={mockAlerts}
                onChange={setMockAlerts}
                label="Sunday mock reminder"
                description="One message before the weekly full-length paper opens."
              />
            </div>
          </section>

          <section className="card p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[14.5px] font-semibold">Preview data</h2>
                <p className="mt-0.5 max-w-md text-[11.5px] leading-relaxed text-muted">
                  Bookmarks, revision history and mock submissions on this device. There is no
                  server copy in this phase.
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={resetData}>
                <Trash2 size={13} /> Clear data
              </Button>
            </div>
            <p className="mt-3 rounded-lg bg-surface-2/70 px-3 py-2 text-[10.5px] leading-relaxed text-muted">
              No password, payment or personal data is collected. Signing in on the other screen uses
              a fixed demo profile.
            </p>
          </section>
        </div>

        <aside className="space-y-3">
          <div className="card p-4">
            <p className="label">Your profile</p>
            <div className="mt-3 flex items-center gap-3">
              <Avatar initials={learner.initials} size={44} />
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold">{learner.name}</p>
                <p className="truncate text-[11.5px] text-muted">{learner.email}</p>
              </div>
            </div>
            <dl className="mt-3 space-y-2 border-t border-line pt-3 text-[11.5px]">
              {[
                ['Target', learner.target],
                ['Exam date', `${learner.targetDate} · ${learner.daysToExam} days`],
                ['Joined', learner.joined],
                ['Plan', learner.plan],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-3">
                  <dt className="text-muted">{label}</dt>
                  <dd className="text-right text-ink-soft">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 rounded-md bg-brand-soft/60 px-2 py-1.5 text-[9.5px] leading-relaxed text-brand-ink">
              Demo profile. No real student data is shown anywhere in this preview.
            </p>
          </div>

          <div className="card p-4">
            <p className="text-[12px] font-medium">Need a hand?</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted">
              Write to{' '}
              <a href="mailto:hello@sabpadho.in" className="link-underline text-ink-soft">
                hello@sabpadho.in
              </a>{' '}
              with the paper name and what you saw. A person replies, usually the same day.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <ButtonLink to="/signin" variant="secondary" size="sm">
              <LogOut size={13} /> Sign out of demo
            </ButtonLink>
            <Link
              to="/how-it-works"
              className="inline-flex items-center justify-center gap-1 text-[11px] text-muted hover:text-ink"
            >
              How SabPadho works <ArrowRight size={12} />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
