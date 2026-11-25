import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Clock, GraduationCap, Languages, Sparkles, Target } from 'lucide-react'
import { Badge, Button, SectionLabel } from '../../components/ui'
import { EXAM_OPTIONS, type ExamId } from '../../data/exams'
import { useAuth } from '../../lib/auth'
import { usePageTitle } from '../../lib/hooks'
import { useLang } from '../../lib/lang'
import { useToast } from '../../lib/toast'
import { cn } from '../../lib/utils'

const ONBOARDING_KEY = 'sabpadho-onboarding-v1'

const STAGE_OPTIONS = [
  {
    id: 'beginner',
    label: 'Just starting out',
    labelHi: 'अभी शुरुआत कर रहे हैं',
    desc: 'Building fundamentals chapter by chapter',
    descHi: 'अध्याय-दर-अध्याय बुनियादी अवधारणाएँ सीख रहे हैं',
  },
  {
    id: 'practicing',
    label: 'Completed basics, practicing',
    labelHi: 'बेसिक्स पूरे, अब अभ्यास',
    desc: 'Solving topic-wise questions for speed',
    descHi: 'गति बढ़ाने के लिए विषयवार प्रश्न हल कर रहे हैं',
  },
  {
    id: 'revision',
    label: 'Revision & mock tests',
    labelHi: 'रिवीजन और मॉक टेस्ट',
    desc: 'Taking full-length mocks & fixing weak areas',
    descHi: 'फुल-लेंथ मॉक देकर कमजोर हिस्से सुधार रहे हैं',
  },
  {
    id: 'reattempt',
    label: 'Re-attempting to boost score',
    labelHi: 'स्कोर बढ़ाने के लिए पुनः प्रयास',
    desc: 'Targeting top percentile & accuracy',
    descHi: 'टॉप पर्सेंटाइल और सटीकता का लक्ष्य',
  },
] as const

const TIME_OPTIONS = [
  { id: '30m', label: '30 mins / day', labelHi: '30 मिनट / दिन', desc: 'Quick daily sprints' },
  { id: '1-2h', label: '1–2 hours / day', labelHi: '1–2 घंटे / दिन', desc: 'Steady balanced prep' },
  { id: '3-4h', label: '3–4 hours / day', labelHi: '3–4 घंटे / दिन', desc: 'Focused exam track' },
  { id: '5h+', label: '5+ hours / day', labelHi: '5+ घंटे / दिन', desc: 'Intensive full-time prep' },
] as const

const LANG_OPTIONS = [
  { id: 'en', label: 'English', desc: 'Questions & explanations in English' },
  { id: 'hi', label: 'हिन्दी (Hindi)', desc: 'प्रश्न और व्याख्या हिन्दी में' },
  { id: 'bilingual', label: 'Bilingual (EN + HI)', desc: 'Switch anytime between English & Hindi' },
] as const

export function Onboarding() {
  const navigate = useNavigate()
  const { notify } = useToast()
  const { user, preferredExam, setPreferredExam } = useAuth()
  const { lang, setLang } = useLang()

  usePageTitle(lang === 'hi' ? 'अपना अध्ययन डेस्क सेटअप करें' : 'Personalize your study desk')

  const [step, setStep] = useState(0)
  const [selectedExam, setSelectedExam] = useState<ExamId>(preferredExam)
  const [stage, setStage] = useState<string>('practicing')
  const [dailyTime, setDailyTime] = useState<string>('1-2h')
  const [studyLang, setStudyLang] = useState<string>(lang === 'hi' ? 'hi' : 'bilingual')
  const [saving, setSaving] = useState(false)

  const totalSteps = 4

  async function finishOnboarding() {
    setSaving(true)
    try {
      await setPreferredExam(selectedExam)
      if (studyLang === 'en' || studyLang === 'hi') {
        setLang(studyLang)
      }
      try {
        localStorage.setItem(
          ONBOARDING_KEY,
          JSON.stringify({
            exam: selectedExam,
            stage,
            dailyTime,
            studyLang,
            completedAt: new Date().toISOString(),
          }),
        )
      } catch {
        /* ignore storage errors */
      }
      notify(
        lang === 'hi'
          ? `आपका ${selectedExam} अध्ययन डेस्क तैयार है!`
          : `Your ${selectedExam} study desk is ready!`,
        'success',
      )
      navigate('/app', { replace: true })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-[680px] px-4 py-8 sm:py-12">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <SectionLabel>
            {lang === 'hi' ? 'ऑनबोर्डिंग' : 'Onboarding'} · {step + 1}/{totalSteps}
          </SectionLabel>
          <h1 className="mt-1 font-display text-[22px] font-semibold tracking-[-0.02em] text-ink sm:text-[26px]">
            {lang === 'hi'
              ? `नमस्ते ${user?.firstName ?? ''}, आइए आपकी तैयारी सेट करें`
              : `Welcome${user?.firstName ? `, ${user.firstName}` : ''}! Let’s personalize your prep`}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => navigate('/app', { replace: true })}
          className="text-[12px] font-medium text-muted underline-offset-4 hover:text-ink hover:underline"
        >
          {lang === 'hi' ? 'अभी छोड़ें' : 'Skip for now'}
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-6 flex gap-1.5" aria-hidden="true">
        {Array.from({ length: totalSteps }).map((_, idx) => (
          <div
            key={idx}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              idx <= step ? 'bg-brand' : 'bg-surface-2',
            )}
          />
        ))}
      </div>

      <div className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)] sm:p-7">
        {step === 0 ? (
          <div>
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[14px] font-semibold text-ink">
                <GraduationCap size={18} className="text-brand" />
                <span>
                  {lang === 'hi'
                    ? '1. आप किस परीक्षा की तैयारी कर रहे हैं?'
                    : '1. Which exam are you preparing for?'}
                </span>
              </div>
              <Badge tone="brand">{selectedExam}</Badge>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2" role="radiogroup" aria-label="Target exam">
              {EXAM_OPTIONS.map((option) => {
                const active = option.id === selectedExam
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setSelectedExam(option.id)}
                    className={cn(
                      'flex items-start gap-2.5 rounded-xl border p-3.5 text-left transition',
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
                      <span className="block text-[13px] font-semibold text-ink">{option.shortLabel}</span>
                      <span className="mt-0.5 block text-[11px] leading-snug text-muted">
                        {lang === 'hi' ? option.taglineHi : option.tagline}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div>
            <div className="mb-4 flex items-center gap-2 text-[14px] font-semibold text-ink">
              <Target size={18} className="text-brand" />
              <span>
                {lang === 'hi'
                  ? '2. आपकी तैयारी का वर्तमान स्तर क्या है?'
                  : '2. What is your current preparation stage?'}
              </span>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2" role="radiogroup" aria-label="Preparation stage">
              {STAGE_OPTIONS.map((opt) => {
                const active = opt.id === stage
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setStage(opt.id)}
                    className={cn(
                      'flex items-start gap-2.5 rounded-xl border p-3.5 text-left transition',
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
                      <span className="block text-[13px] font-semibold text-ink">
                        {lang === 'hi' ? opt.labelHi : opt.label}
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-snug text-muted">
                        {lang === 'hi' ? opt.descHi : opt.desc}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div>
            <div className="mb-4 flex items-center gap-2 text-[14px] font-semibold text-ink">
              <Clock size={18} className="text-brand" />
              <span>
                {lang === 'hi'
                  ? '3. आप प्रतिदिन कितना समय अध्ययन कर सकते हैं?'
                  : '3. How much time can you study daily?'}
              </span>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2" role="radiogroup" aria-label="Daily study time">
              {TIME_OPTIONS.map((opt) => {
                const active = opt.id === dailyTime
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setDailyTime(opt.id)}
                    className={cn(
                      'flex items-start gap-2.5 rounded-xl border p-3.5 text-left transition',
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
                      <span className="block text-[13px] font-semibold text-ink">
                        {lang === 'hi' ? opt.labelHi : opt.label}
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-snug text-muted">{opt.desc}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div>
            <div className="mb-4 flex items-center gap-2 text-[14px] font-semibold text-ink">
              <Languages size={18} className="text-brand" />
              <span>
                {lang === 'hi'
                  ? '4. आपकी पसंदीदा अध्ययन भाषा क्या है?'
                  : '4. What is your preferred study language?'}
              </span>
            </div>
            <div className="grid gap-2.5" role="radiogroup" aria-label="Preferred study language">
              {LANG_OPTIONS.map((opt) => {
                const active = opt.id === studyLang
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setStudyLang(opt.id)}
                    className={cn(
                      'flex items-start gap-2.5 rounded-xl border p-3.5 text-left transition',
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
                      <span className="block text-[13px] font-semibold text-ink">{opt.label}</span>
                      <span className="mt-0.5 block text-[11px] leading-snug text-muted">{opt.desc}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-4">
          <Button
            type="button"
            variant="ghost"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            <ArrowLeft size={15} />
            {lang === 'hi' ? 'पीछे' : 'Back'}
          </Button>

          {step < totalSteps - 1 ? (
            <Button type="button" onClick={() => setStep((s) => Math.min(totalSteps - 1, s + 1))}>
              {lang === 'hi' ? 'आगे बढ़ें' : 'Continue'}
              <ArrowRight size={15} />
            </Button>
          ) : (
            <Button type="button" disabled={saving} onClick={finishOnboarding}>
              <Sparkles size={15} />
              {saving
                ? lang === 'hi'
                  ? 'सहेजा जा रहा है…'
                  : 'Setting up…'
                : lang === 'hi'
                  ? 'अध्ययन शुरू करें'
                  : 'Launch my study desk'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
