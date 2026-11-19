import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  ClipboardList,
  Languages,
  PenLine,
  RotateCcw,
  ShieldCheck,
  Timer,
} from 'lucide-react'
import { Badge, ButtonLink, SectionLabel } from '../components/ui'
import { usePageTitle } from '../lib/hooks'

const journeys = [
  {
    tag: 'Before you sign in',
    title: 'First study session',
    icon: BookOpen,
    steps: [
      'Open a subject guide — public and readable without an account.',
      'Sign in only when you want your answers kept.',
      'Choose a language, subject and chapter; we remember them on return.',
      'Start a practice set that belongs to you.',
    ],
    note: 'If you cancel sign-in, the guide stays open and your chosen subject is kept.',
  },
  {
    tag: 'Ten minutes',
    title: 'Topic sprint',
    icon: PenLine,
    steps: [
      'Pick a chapter and a length — five, ten or fifteen questions.',
      'Answer one question at a time; no answer key is sent with the prompt.',
      'Check the answer and read the reasoning before moving on.',
      'A wrong answer is scheduled for a recall attempt.',
    ],
    note: 'A save that fails is labelled unsynced — never shown as completed progress.',
  },
  {
    tag: 'Full rehearsal',
    title: 'Exam rehearsal',
    icon: Timer,
    steps: [
      'Read the marking scheme and acknowledge the paper version.',
      'The clock starts on the paper, not in your browser tab.',
      'Selections and review flags save separately as you go.',
      'Submit once; section scores are calculated from the pinned version.',
    ],
    note: 'On expiry, the answers already accepted are graded. A repeat submit returns the same result.',
  },
  {
    tag: 'The next day',
    title: 'Recall session',
    icon: RotateCcw,
    steps: [
      'Open the due queue, ordered by review time and chapter.',
      'Retry the original prompt without seeing your last choice.',
      'Compare your reasoning with the reviewed solution.',
      'A correct retry moves the next review further out.',
    ],
    note: 'An empty queue is a success state: it shows the next due date and a new practice set.',
  },
]

export function HowItWorks() {
  usePageTitle('How it works')

  return (
    <div className="pb-16">
      <section className="container-page pt-10 md:pt-16">
        <div className="max-w-2xl">
          <SectionLabel>How it works</SectionLabel>
          <h1 className="mt-3 text-[32px] font-semibold leading-[1.07] sm:text-[46px]">
            A clearer path from practice to progress.
          </h1>
          <p className="mt-4 text-[14.5px] leading-relaxed text-muted">
            SabPadho is built around three ideas: start with one goal, make the reasoning visible,
            and give every mistake a return date. Everything else — the papers, the clocks, the
            analysis — follows from those three.
          </p>
        </div>

        <div className="mt-10 grid gap-3 md:grid-cols-3">
          {[
            {
              n: '01',
              title: 'Start with one goal',
              body: 'A chapter and a manageable set, not an entire syllabus. Choosing is half the battle on a low-motivation evening.',
            },
            {
              n: '02',
              title: 'Make reasoning visible',
              body: 'Every answer shows the step behind it, in the language you are reading. Option positions match across languages.',
            },
            {
              n: '03',
              title: 'Give mistakes a return date',
              body: 'A difficult question comes back for a fresh attempt, and the result decides when it visits again.',
            },
          ].map((item) => (
            <div key={item.n} className="card p-5">
              <span className="num text-[11px] font-semibold tracking-[0.12em] text-muted">{item.n}</span>
              <h2 className="mt-3 text-[16px] font-semibold">{item.title}</h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page mt-14 md:mt-20">
        <SectionLabel>Four journeys</SectionLabel>
        <h2 className="mt-3 text-[26px] font-semibold leading-tight sm:text-[32px]">
          The whole product, in four ordinary days.
        </h2>

        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {journeys.map((journey) => (
            <article key={journey.title} className="card p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-soft text-brand-ink">
                    <journey.icon size={16} strokeWidth={1.9} />
                  </span>
                  <div>
                    <p className="text-[10.5px] font-medium uppercase tracking-[0.1em] text-muted">
                      {journey.tag}
                    </p>
                    <h3 className="text-[15px] font-semibold leading-tight">{journey.title}</h3>
                  </div>
                </div>
                <Badge tone="outline">{journey.steps.length} steps</Badge>
              </div>

              <ol className="mt-4 space-y-2.5">
                {journey.steps.map((step, index) => (
                  <li key={step} className="flex gap-2.5 text-[12.5px] leading-relaxed text-ink-soft">
                    <span className="num mt-0.5 grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full border border-line text-[9.5px] text-muted">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>

              <p className="mt-3 border-t border-line pt-3 text-[11.5px] leading-relaxed text-muted">
                {journey.note}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-14 border-y border-line bg-surface/50 py-14 md:mt-20" id="marking">
        <div className="container-page grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-16">
          <div>
            <SectionLabel>Marking</SectionLabel>
            <h2 className="mt-3 max-w-[460px] text-[26px] font-semibold leading-tight sm:text-[32px]">
              The score comes from the paper you started.
            </h2>
            <p className="mt-3 max-w-[480px] text-[14px] leading-relaxed text-muted">
              A published paper is versioned. Once a paper opens, its questions and marking rules do
              not change, so a score calculated today matches the one calculated next month.
            </p>
            <ul className="mt-5 space-y-2 text-[13px] text-ink-soft">
              {[
                'Answer keys stay on the server, never inside a running paper.',
                'Section scores are calculated after submission, once.',
                'Timer expiry grades the answers already accepted.',
              ].map((line) => (
                <li key={line} className="flex gap-2.5">
                  <ShieldCheck size={15} className="mt-0.5 shrink-0 text-positive" />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <div className="card overflow-hidden p-0">
            <div className="border-b border-line px-5 py-3.5">
              <p className="label">Tier-I marking scheme</p>
            </div>
            <dl className="divide-y divide-line px-5">
              {[
                ['Sections', '4 · Reasoning, Quant, English, GA'],
                ['Questions', '100, in the fixed section order'],
                ['Duration', '60 minutes'],
                ['Correct answer', '+2 marks'],
                ['Wrong answer', '−0.5 marks'],
                ['Unattempted', '0 marks'],
                ['Maximum score', '200 marks'],
              ].map(([term, value]) => (
                <div key={term} className="flex items-start justify-between gap-4 py-2.5 text-[12.5px]">
                  <dt className="text-muted">{term}</dt>
                  <dd className="text-right font-medium text-ink">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="border-t border-line bg-surface-2/60 px-5 py-3 text-[11px] leading-relaxed text-muted">
              Sample paper data in this preview. Confirm the official scheme on the SSC notice.
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-14 md:py-20" id="bilingual">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <Badge tone="brand">
              <Languages size={11} /> English · हिंदी
            </Badge>
            <h2 className="mt-4 max-w-[430px] text-[26px] font-semibold leading-tight sm:text-[32px]">
              Language is a reading choice, not a restart.
            </h2>
            <p className="mt-3 max-w-[460px] text-[14px] leading-relaxed text-muted">
              Every question carries both versions under one question ID. Switching keeps your
              selected option, timer and review flag in place, and option positions stay aligned so
              the answer key cannot drift.
            </p>
            <ul className="mt-5 space-y-2 text-[13px] text-ink-soft">
              {[
                'Both languages reviewed before publication',
                'Same option order in English and Hindi',
                'Language preference saved to your profile',
              ].map((line) => (
                <li key={line} className="flex gap-2.5">
                  <Check size={14} className="mt-0.5 shrink-0 text-brand" />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <p className="label">Same question, two languages</p>
              <span className="chip py-0.5! text-[10px]">Hindi in beta</span>
            </div>
            <div className="mt-3 space-y-3">
              <div className="rounded-lg border border-line bg-surface-2/50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
                  English
                </p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed">
                  A trader marks an article 40% above cost price and offers a 25% discount. What is
                  the profit percentage?
                </p>
              </div>
              <div className="rounded-lg border border-line bg-surface-2/50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
                  हिंदी
                </p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed">
                  एक व्यापारी वस्तु का मूल्य क्रय मूल्य से 40% अधिक अंकित करता है और 25% छूट देता है।
                  लाभ प्रतिशत क्या है?
                </p>
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted">
              Both lists keep the same four options in the same order, so the correct option never
              moves between languages.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page pb-8" id="faq">
        <div className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand-ink">
              <ClipboardList size={16} />
            </span>
            <div>
              <h2 className="text-[16px] font-semibold">Ready to see it with your own chapters?</h2>
              <p className="mt-1 max-w-lg text-[12.5px] leading-relaxed text-muted">
                The study desk opens with sample progress so you can try the queue, a sprint and a
                mock in one sitting.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <ButtonLink to="/app">Open the study desk <ArrowRight size={15} /></ButtonLink>
            <Link to="/subjects" className="btn btn-secondary">
              Browse chapters
            </Link>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11.5px] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={13} /> Beta cohort · 2026
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={13} /> Independent platform, not affiliated with SSC
          </span>
        </div>
      </section>
    </div>
  )
}
