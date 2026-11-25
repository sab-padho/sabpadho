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
import { useAuth } from '../lib/auth'
import { usePageTitle } from '../lib/hooks'
import { useCopy } from '../lib/ui-copy'

const journeyIcons = [BookOpen, PenLine, Timer, RotateCcw]

export function HowItWorks() {
  const copy = useCopy()
  const { email } = useAuth()
  usePageTitle(copy.how.title)

  return (
    <div className="pb-16">
      <section className="container-page pt-10 md:pt-16">
        <div className="max-w-2xl">
          <SectionLabel>{copy.how.eyebrow}</SectionLabel>
          <h1 className="mt-3 text-[32px] font-semibold leading-[1.07] sm:text-[46px]">
            {copy.how.heading}
          </h1>
          <p className="mt-4 text-[14.5px] leading-relaxed text-muted">
            {copy.how.intro}
          </p>
        </div>

        <div className="mt-10 grid gap-3 md:grid-cols-3">
          {copy.how.principles.map((item) => (
            <div key={item.n} className="card p-5">
              <span className="num text-[11px] font-semibold tracking-[0.12em] text-muted">{item.n}</span>
              <h2 className="mt-3 text-[16px] font-semibold">{item.title}</h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page mt-14 md:mt-20">
        <SectionLabel>{copy.how.journeysEyebrow}</SectionLabel>
        <h2 className="mt-3 text-[26px] font-semibold leading-tight sm:text-[32px]">
          {copy.how.journeysHeading}
        </h2>

        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {copy.how.journeys.map((journey, index) => {
            const Icon = journeyIcons[index] ?? BookOpen
            return (
            <article key={journey.title} className="card p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-soft text-brand-ink">
                    <Icon size={16} strokeWidth={1.9} />
                  </span>
                  <div>
                    <p className="text-[10.5px] font-medium uppercase tracking-[0.1em] text-muted">
                      {journey.tag}
                    </p>
                    <h3 className="text-[15px] font-semibold leading-tight">{journey.title}</h3>
                  </div>
                </div>
                <Badge tone="outline">{copy.how.stepsN(journey.steps.length)}</Badge>
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
            )
          })}
        </div>
      </section>

      <section className="mt-14 border-y border-line bg-surface/50 py-14 md:mt-20" id="marking">
        <div className="container-page grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-16">
          <div>
            <SectionLabel>{copy.how.markingEyebrow}</SectionLabel>
            <h2 className="mt-3 max-w-[460px] text-[26px] font-semibold leading-tight sm:text-[32px]">
              {copy.how.markingTitle}
            </h2>
            <p className="mt-3 max-w-[480px] text-[14px] leading-relaxed text-muted">
              {copy.how.markingBody}
            </p>
            <ul className="mt-5 space-y-2 text-[13px] text-ink-soft">
              {copy.how.markingLines.map((line) => (
                <li key={line} className="flex gap-2.5">
                  <ShieldCheck size={15} className="mt-0.5 shrink-0 text-positive" />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <div className="card overflow-hidden p-0">
            <div className="border-b border-line px-5 py-3.5">
              <p className="label">{copy.how.schemeTitle}</p>
            </div>
            <dl className="divide-y divide-line px-5">
              {copy.how.schemeRows.map(([term, value]) => (
                <div key={term} className="flex items-start justify-between gap-4 py-2.5 text-[12.5px]">
                  <dt className="text-muted">{term}</dt>
                  <dd className="text-right font-medium text-ink">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="border-t border-line bg-surface-2/60 px-5 py-3 text-[11px] leading-relaxed text-muted">
              {copy.how.schemeNote}
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
              {copy.how.bilingualTitle}
            </h2>
            <p className="mt-3 max-w-[460px] text-[14px] leading-relaxed text-muted">
              {copy.how.bilingualBody}
            </p>
            <ul className="mt-5 space-y-2 text-[13px] text-ink-soft">
              {copy.how.bilingualBullets.map((line) => (
                <li key={line} className="flex gap-2.5">
                  <Check size={14} className="mt-0.5 shrink-0 text-brand" />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <p className="label">{copy.how.sampleTitle}</p>
              <span className="chip py-0.5! text-[10px]">{copy.how.betaChip}</span>
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
              {copy.how.sampleNote}
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
              <h2 className="text-[16px] font-semibold">{copy.how.faqTitle}</h2>
              <p className="mt-1 max-w-lg text-[12.5px] leading-relaxed text-muted">
                {copy.how.faqBody}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <ButtonLink to={email ? '/app' : '/signup'}>
              {email ? copy.how.openDesk : 'Sign up & choose exam'} <ArrowRight size={15} />
            </ButtonLink>
            <Link to="/subjects" className="btn btn-secondary">
              {copy.how.browseChapters}
            </Link>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11.5px] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={13} /> {copy.how.betaCohort}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={13} /> {copy.how.independent}
          </span>
        </div>
      </section>
    </div>
  )
}
