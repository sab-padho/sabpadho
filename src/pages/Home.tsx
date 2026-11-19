import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  Flag,
  GraduationCap,
  Languages,
  ListChecks,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react'
import { HeroPreview, PracticePreview, PalettePreview, DuePreview } from '../components/previews'
import { Badge, ButtonLink, SectionLabel } from '../components/ui'
import { LogoMark } from '../components/brand'
import { questionsForSubject, questionById } from '../data/questions'
import { subjects } from '../data/subjects'
import { mockPapers, paperQuestionCount } from '../data/mocks'
import { tintTile } from '../components/subject-tint'
import { cn } from '../lib/utils'
import { useLang } from '../lib/lang'
import { usePageTitle } from '../lib/hooks'

export function Home() {
  usePageTitle()
  const availableMocks = mockPapers.filter((paper) => paper.status !== 'completed').slice(0, 3)

  return (
    <>
      <Hero />

      <section className="border-y border-line bg-surface/50">
        <div className="container-page grid gap-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Target, title: 'Built for Tier I', body: 'SSC CGL & CHSL pattern, section for section.' },
            { icon: Languages, title: 'English + हिंदी', body: 'The same question, reviewed in both.' },
            { icon: Clock, title: 'Ten-minute sets', body: 'Practice that fits between two lectures.' },
            { icon: RotateCcw, title: 'Mistakes come back', body: 'A due date for every wrong answer.' },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line bg-surface text-brand">
                <item.icon size={15} strokeWidth={1.9} />
              </span>
              <div>
                <p className="text-[13px] font-medium text-ink">{item.title}</p>
                <p className="mt-0.5 text-[12px] leading-snug text-muted">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <HowItWorks />

      <FeatureRow
        eyebrow="Topic sprints"
        title="Ten questions. One chapter. A reason for every answer."
        body="Pick a subject, a chapter and a session length. Every answer is graded on the spot and explained step by step — including why the tempting option is wrong."
        bullets={[
          'Explanations written at the level of the paper',
          'Bookmark a question without leaving the set',
          'Switch language mid-question; your progress stays put',
        ]}
        cta={{ to: '/app/practice', label: 'Set up a sprint' }}
        visual={<PracticePreview />}
        background="plain"
      />

      <FeatureRow
        eyebrow="Exam rehearsal"
        title="Sit the paper the way you will sit it on exam day."
        body="Four sections in the official order, a clock that is not yours to change, and a palette that keeps answered separate from marked. Submit once; the score is calculated from the paper you started."
        bullets={[
          'Section-wise score, time used and unattempted count',
          'Marked-for-review labelled separately, not just coloured',
          'Every incorrect answer opens its worked solution',
        ]}
        cta={{ to: '/app/mocks', label: 'See the mock series' }}
        visual={<PalettePreview />}
        background="surface"
        reverse
      />

      <FeatureRow
        eyebrow="Recall calendar"
        title="Your mistakes come back before you forget them."
        body="A wrong answer is scheduled for another attempt — tomorrow, in three days, next week. The queue tells you what is due and what is coming, with no hints from your last attempt."
        bullets={[
          'Previous choices stay hidden on a retry',
          'A correct retry moves the review further out',
          'An empty queue suggests what to practise next',
        ]}
        cta={{ to: '/app/revision', label: 'Open the revision queue' }}
        visual={<DuePreview />}
        background="plain"
      />

      <BilingualBand />

      <SubjectsBand />

      <MockBand papers={availableMocks} />

      <Testimonials />

      <Faq />

      <FinalCta />
    </>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 hairline-grid opacity-40 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black,transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-40 -top-52 h-[460px] w-[460px] rounded-full bg-brand-soft opacity-70 blur-3xl"
        aria-hidden
      />
      <div className="container-page relative grid gap-12 pb-16 pt-12 md:pb-24 md:pt-20 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-16">
        <div className="animate-rise">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="brand">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              SSC CGL &amp; CHSL · Tier I
            </Badge>
            <Badge tone="outline">Beta · 2026 cohort</Badge>
          </div>

          <h1 className="mt-5 max-w-[600px] text-[38px] font-semibold leading-[1.05] tracking-[-0.035em] text-ink sm:text-[46px] lg:text-[56px]">
            Practice that ends with a <span className="text-brand">next step</span>.
          </h1>

          <p className="mt-5 max-w-[490px] text-[15px] leading-relaxed text-muted sm:text-[16.5px]">
            SabPadho gives you short topic sprints, worked solutions and a revision date for every
            question you miss — in English or हिंदी, on the phone already in your pocket.
          </p>

          <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
            <ButtonLink to="/app/practice" size="lg">
              Start a free sprint
              <ArrowRight size={16} />
            </ButtonLink>
            <ButtonLink to="/subjects/maths/percentages" size="lg" variant="secondary">
              Read a chapter primer
            </ButtonLink>
          </div>

          <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Check size={13} className="text-positive" /> No card needed
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check size={13} className="text-positive" /> 5 subjects, 25 chapters
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check size={13} className="text-positive" /> Works on any phone
            </span>
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-2 border-t border-line pt-5">
            <span className="text-[11px] uppercase tracking-[0.1em] text-muted">Start with</span>
            {subjects.map((subject) => (
              <Link
                key={subject.id}
                to={`/subjects/${subject.slug}`}
                className="rounded-full border border-line bg-surface px-2.5 py-1 text-[12px] text-ink-soft transition hover:border-line-strong hover:text-ink"
              >
                {subject.short}
              </Link>
            ))}
          </div>
        </div>

        <div className="animate-rise lg:pl-2" style={{ animationDelay: '80ms' }}>
          <HeroPreview />
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section className="container-page py-16 md:py-24" id="how">
      <div className="max-w-2xl">
        <SectionLabel>How a session works</SectionLabel>
        <h2 className="mt-3 text-[28px] font-semibold leading-tight sm:text-[36px]">
          One goal, one session, one honest review.
        </h2>
        <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
          No syllabus wall, no twenty-tab study plan. Choose a chapter, answer a small set, and leave
          knowing exactly what to open next.
        </p>
      </div>

      <ol className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          {
            step: '01',
            title: 'Choose a chapter',
            body: 'See what the chapter covers before you commit. Chapter primers stay open without an account.',
            icon: GraduationCap,
          },
          {
            step: '02',
            title: 'Answer a short set',
            body: 'Five, ten or fifteen questions. Each answer is saved as you go and explained once you check it.',
            icon: ListChecks,
          },
          {
            step: '03',
            title: 'Leave with a due date',
            body: 'Whatever you missed joins the revision queue. Whatever you aced moves further down the list.',
            icon: RotateCcw,
          },
        ].map((item) => (
          <li key={item.step} className="card relative overflow-hidden p-5">
            <div className="flex items-center justify-between">
              <span className="num text-[11px] font-semibold tracking-[0.12em] text-muted">
                {item.step}
              </span>
              <item.icon size={17} className="text-brand" strokeWidth={1.8} />
            </div>
            <h3 className="mt-4 text-[16px] font-semibold">{item.title}</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{item.body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function FeatureRow({
  eyebrow,
  title,
  body,
  bullets,
  cta,
  visual,
  background,
  reverse = false,
}: {
  eyebrow: string
  title: string
  body: string
  bullets: string[]
  cta: { to: string; label: string }
  visual: ReactNode
  background: 'plain' | 'surface'
  reverse?: boolean
}) {
  return (
    <section className={cn('border-y border-line/70', background === 'surface' ? 'bg-surface/50' : '')}>
      <div className="container-page grid gap-10 py-14 md:py-20 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className={cn(reverse && 'lg:order-2')}>
          <SectionLabel>{eyebrow}</SectionLabel>
          <h2 className="mt-3 max-w-[480px] text-[26px] font-semibold leading-[1.15] sm:text-[33px]">
            {title}
          </h2>
          <p className="mt-3 max-w-[470px] text-[14px] leading-relaxed text-muted">{body}</p>
          <ul className="mt-5 space-y-2.5">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2.5 text-[13px] text-ink-soft">
                <Check size={15} className="mt-0.5 shrink-0 text-brand" />
                {bullet}
              </li>
            ))}
          </ul>
          <Link
            to={cta.to}
            className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-brand-ink hover:underline"
          >
            {cta.label} <ArrowRight size={14} />
          </Link>
        </div>
        <div className={cn('mx-auto w-full max-w-[460px] lg:max-w-none', reverse && 'lg:order-1')}>
          {visual}
        </div>
      </div>
    </section>
  )
}

function BilingualBand() {
  const [lang, setLang] = useState<'en' | 'hi'>('en')
  const question = questionById('qa-pl-2')!

  return (
    <section className="container-page py-16 md:py-24" id="bilingual">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
        <div>
          <SectionLabel>English · हिंदी</SectionLabel>
          <h2 className="mt-3 max-w-[420px] text-[28px] font-semibold leading-tight sm:text-[36px]">
            Switch the question, not your progress.
          </h2>
          <p className="mt-3 max-w-[440px] text-[14.5px] leading-relaxed text-muted">
            Every prompt, option and explanation is reviewed in both languages. Change language
            mid-question and your selection, timer and review flag stay exactly where they were.
          </p>
          <p className="mt-5 inline-flex items-start gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-[12px] text-muted">
            <Languages size={14} className="mt-0.5 shrink-0 text-brand" />
            Option positions match across languages, so the answer key never drifts.
          </p>
        </div>

        <div className="card overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <span className="label">Profit &amp; loss · preview</span>
            <div className="flex rounded-lg border border-line bg-surface-2 p-0.5">
              {(['en', 'hi'] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLang(code)}
                  aria-pressed={lang === code}
                  className={cn(
                    'rounded-md px-2 py-0.5 text-[11px] font-medium transition',
                    lang === code ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink',
                  )}
                >
                  {code === 'en' ? 'English' : 'हिंदी'}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4 sm:p-5">
            <p className="min-h-[52px] text-[14px] leading-relaxed text-ink">
              {question.prompt[lang]}
            </p>
            <div className="mt-3 grid gap-1.5">
              {question.options[lang].map((option, index) => (
                <div
                  key={option}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-2.5 py-2 text-[12.5px]',
                    index === 0
                      ? 'border-brand bg-brand-soft text-brand-ink'
                      : 'border-line bg-surface text-ink-soft',
                  )}
                >
                  <span
                    className={cn(
                      'grid h-5 w-5 place-items-center rounded-full border text-[10px] font-semibold',
                      index === 0 ? 'border-brand bg-brand text-white' : 'border-line text-muted',
                    )}
                  >
                    {'ABCD'[index]}
                  </span>
                  {option}
                </div>
              ))}
            </div>
            <p className="mt-3 border-t border-line pt-3 text-[11px] text-muted">
              Marked for review and language choice survive the switch. Nothing is lost when you
              change your mind.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function SubjectsBand() {
  const { lang } = useLang()
  return (
    <section className="border-y border-line bg-surface/50">
      <div className="container-page py-16 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <SectionLabel>Subjects</SectionLabel>
            <h2 className="mt-3 text-[28px] font-semibold leading-tight sm:text-[34px]">
              Start with the section that costs you marks.
            </h2>
          </div>
          <Link
            to="/subjects"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand-ink hover:underline"
          >
            All chapters <ArrowRight size={14} />
          </Link>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => {
            const count = questionsForSubject(subject.id).length
            return (
              <Link
                key={subject.id}
                to={`/subjects/${subject.slug}`}
                className="group card flex flex-col gap-3 p-4 transition hover:-translate-y-0.5 hover:border-line-strong"
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={cn(
                      'grid h-9 w-9 place-items-center rounded-lg font-display text-[12px] font-bold',
                      tintTile[subject.tint],
                    )}
                  >
                    {subject.code}
                  </span>
                  <ArrowRight
                    size={15}
                    className="mt-1 text-muted transition group-hover:translate-x-0.5 group-hover:text-ink"
                  />
                </div>
                <div>
                  <h3 className="text-[14.5px] font-semibold leading-snug">
                    {lang === 'hi' ? subject.name.hi : subject.short === 'Maths' ? 'Maths' : subject.name.en}
                  </h3>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted">{subject.tagline}</p>
                </div>
                <div className="mt-auto flex items-center gap-3 border-t border-line pt-3 text-[11px] text-muted">
                  <span>{subject.chapters.length} chapters</span>
                  <span className="h-1 w-1 rounded-full bg-line-strong" />
                  <span>{count} questions</span>
                </div>
              </Link>
            )
          })}

          <div className="card flex flex-col justify-between gap-4 border-dashed bg-surface-2/40 p-4">
            <div>
              <Badge tone="gold">
                <Sparkles size={11} /> Next release
              </Badge>
              <h3 className="mt-3 text-[14px] font-semibold">Weekly focus plan</h3>
              <p className="mt-1 text-[12px] leading-relaxed text-muted">
                A week built from your exam date, available study time and the chapters that need
                another look.
              </p>
            </div>
            <p className="text-[11px] text-muted">In review · not part of this preview</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function MockBand({ papers }: { papers: typeof mockPapers }) {
  return (
    <section className="container-page py-16 md:py-24" id="marking">
      <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-start lg:gap-16">
        <div>
          <SectionLabel>Mock series</SectionLabel>
          <h2 className="mt-3 max-w-[430px] text-[28px] font-semibold leading-tight sm:text-[36px]">
            A rehearsal is only useful if the rules are real.
          </h2>
          <p className="mt-3 max-w-[460px] text-[14.5px] leading-relaxed text-muted">
            The clock belongs to the paper, not the browser tab. Correct answers earn 2 marks, a
            wrong answer costs 0.5, and an unattempted question costs nothing.
          </p>

          <div className="mt-6 grid max-w-[420px] grid-cols-3 gap-2">
            {[
              { value: '2', label: 'marks for correct' },
              { value: '−0.5', label: 'per wrong answer' },
              { value: '60', label: 'minutes, 100 questions' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-line bg-surface px-3 py-2.5">
                <p className="num font-display text-[19px] font-semibold leading-none">{item.value}</p>
                <p className="mt-1.5 text-[10.5px] leading-tight text-muted">{item.label}</p>
              </div>
            ))}
          </div>

          <ul className="mt-6 space-y-2 text-[13px] text-ink-soft">
            {['Section-wise scoring after submission', 'Review flagged questions before you submit', 'Timer expiry grades the answers already saved'].map(
              (line) => (
                <li key={line} className="flex items-start gap-2.5">
                  <ShieldCheck size={15} className="mt-0.5 shrink-0 text-positive" />
                  {line}
                </li>
              ),
            )}
          </ul>

          <ButtonLink to="/mocks" className="mt-6" variant="secondary">
            Browse the mock series <ArrowRight size={15} />
          </ButtonLink>
        </div>

        <div className="space-y-2.5">
          {papers.map((paper) => (
            <div key={paper.id} className="card flex items-center gap-3 p-3.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-line bg-surface-2 font-display text-[11px] font-semibold text-ink-soft">
                {paper.kind === 'Full length' ? '100' : paperQuestionCount(paper)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium">{paper.title}</p>
                <p className="mt-0.5 text-[11.5px] text-muted">
                  {paperQuestionCount(paper)} questions · {paper.durationMinutes} min ·{' '}
                  {paper.sections.length > 1 ? `${paper.sections.length} sections` : 'one section'}
                </p>
              </div>
              {paper.status === 'scheduled' ? (
                <Badge tone="gold">Opens 22 Nov</Badge>
              ) : (
                <Badge tone="positive">Available</Badge>
              )}
            </div>
          ))}
          <p className="px-1 text-[11px] leading-relaxed text-muted">
            Sunday papers open for 24 hours. Sectional papers stay available all week.
          </p>
        </div>
      </div>
    </section>
  )
}

function Testimonials() {
  const quotes = [
    {
      quote:
        'I stopped making fresh notes at midnight. The revision queue decides what I open after dinner, and it is usually right.',
      name: 'Shreya Kulkarni',
      detail: 'Pune · CHSL 2027',
      initials: 'SK',
    },
    {
      quote:
        'The reasoning explanations actually draw the diagram out. Two of my friends switched over just for that.',
      name: 'Imran Sheikh',
      detail: 'Nagpur · CGL 2027',
      initials: 'IS',
    },
    {
      quote:
        'The Hindi switch keeps the same question on screen. That one small thing made me practise far more often.',
      name: 'Pooja Mishra',
      detail: 'Patna · CGL 2027',
      initials: 'PM',
    },
  ]

  return (
    <section className="border-y border-line bg-surface/50">
      <div className="container-page py-16 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <SectionLabel>From the beta cohort</SectionLabel>
            <h2 className="mt-3 max-w-[540px] text-[26px] font-semibold leading-tight sm:text-[32px]">
              Used between lectures and last buses.
            </h2>
          </div>
          <p className="text-[11.5px] text-muted">Feedback collected in October 2026</p>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {quotes.map((item) => (
            <figure key={item.name} className="card flex flex-col justify-between p-5">
              <blockquote className="text-[13.5px] leading-relaxed text-ink-soft">
                “{item.quote}”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-2.5 border-t border-line pt-4">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-surface-3 text-[11px] font-semibold text-ink-soft">
                  {item.initials}
                </span>
                <div>
                  <p className="text-[12.5px] font-medium">{item.name}</p>
                  <p className="text-[11px] text-muted">{item.detail}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

function Faq() {
  const items = [
    {
      q: 'Is SabPadho free?',
      a: 'Chapter primers and the preview sprints are free while the question bank is under review. Paid plans are not live yet, and anything that will be paid is labelled before you start it.',
    },
    {
      q: 'Are the questions really bilingual?',
      a: 'Yes. Prompts, options and explanations are reviewed in English and Hindi. Option positions stay the same across languages, so switching cannot change which answer you picked.',
    },
    {
      q: 'Which exam pattern do the mocks follow?',
      a: 'SSC CGL and CHSL Tier I: four sections, 100 questions, 60 minutes, 2 marks for a correct answer and 0.5 deducted for a wrong one. Sectional and mini papers use the same marking rules.',
    },
    {
      q: 'What happens if my connection drops mid-test?',
      a: 'In the live product each answer is acknowledged as it is saved. In this preview, your attempt stays on your device so you can reload without losing a selection.',
    },
    {
      q: 'Is SabPadho connected to the SSC?',
      a: 'No. SabPadho is an independent study platform. We are not affiliated with the Staff Selection Commission, and exam dates should always be checked on the official notice.',
    },
    {
      q: 'Do I need an app from the Play Store?',
      a: 'No. The portal is built mobile-first. Open it in your phone browser and add it to your home screen for a full-screen experience.',
    },
  ]

  return (
    <section className="container-page py-16 md:py-24" id="faq">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <SectionLabel>Questions</SectionLabel>
          <h2 className="mt-3 text-[28px] font-semibold leading-tight sm:text-[34px]">
            Before you start.
          </h2>
          <p className="mt-3 max-w-xs text-[13.5px] leading-relaxed text-muted">
            Still unsure about something? Write to{' '}
            <a href="mailto:hello@sabpadho.in" className="link-underline text-ink-soft">
              hello@sabpadho.in
            </a>{' '}
            and a person will reply.
          </p>
        </div>

        <div className="divide-y divide-line border-y border-line">
          {items.map((item) => (
            <details key={item.q} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[14px] font-medium text-ink marker:hidden [&::-webkit-details-marker]:hidden">
                {item.q}
                <ChevronDown
                  size={16}
                  className="shrink-0 text-muted transition-transform duration-200 group-open:rotate-180"
                />
              </summary>
              <p className="max-w-[620px] pb-4 pr-8 text-[13px] leading-relaxed text-muted">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function FinalCta() {
  return (
    <section className="container-page pb-20">
      <div className="relative overflow-hidden rounded-2xl border border-line bg-surface px-6 py-10 sm:px-10 sm:py-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_65%)]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 82% 20%, var(--brand-soft), transparent 55%)',
          }}
          aria-hidden
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <LogoMark size={46} className="mt-0.5" />
            <div>
              <h2 className="max-w-[520px] text-[25px] font-semibold leading-tight sm:text-[30px]">
                Ten minutes now beats two hours on Sunday.
              </h2>
              <p className="mt-2 max-w-[440px] text-[13.5px] leading-relaxed text-muted">
                Start with a chapter you already dread. You will leave with one explained answer and
                a date to see it again.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            <ButtonLink to="/app" size="lg">
              Open the study desk <ArrowRight size={16} />
            </ButtonLink>
            <Link to="/signin" className="text-center text-[12px] text-muted hover:text-ink">
              or sign in with the demo learner
            </Link>
          </div>
        </div>
        <div className="relative mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-5 text-[11.5px] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Flag size={13} /> Free while in beta
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Languages size={13} /> English &amp; हिंदी
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={13} /> No card, no lock-in
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-positive" /> Sample data in this preview
          </span>
        </div>
      </div>
    </section>
  )
}
