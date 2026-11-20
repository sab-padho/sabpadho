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
import { communitySize } from '../data/learner'
import { allChapters } from '../data/subjects'
import { LogoMark } from '../components/brand'
import { questionsForSubject, questionById } from '../data/questions'
import { subjects } from '../data/subjects'
import { mockPapers, paperQuestionCount } from '../data/mocks'
import { tintTile } from '../components/subject-tint'
import { cn } from '../lib/utils'
import { useLang } from '../lib/lang'
import { useCopy } from '../lib/ui-copy'
import { subjectShortHindi, subjectTagline } from '../lib/ui-copy'
import { usePageTitle } from '../lib/hooks'

export function Home() {
  usePageTitle()
  const copy = useCopy()
  const stripIcons = [Target, Languages, Clock, RotateCcw]
  const availableMocks = mockPapers.filter((paper) => paper.status !== 'completed').slice(0, 3)

  return (
    <>
      <Hero />

      <ProofBand />

      <section className="border-y border-line bg-surface/50">
        <div className="container-page grid gap-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
          {copy.home.strip.map((item, index) => {
            const Icon = stripIcons[index] ?? Target
            return (
            <div key={item.title} className="flex items-start gap-3">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line bg-surface text-brand">
                <Icon size={15} strokeWidth={1.9} />
              </span>
              <div>
                <p className="text-[13px] font-medium text-ink">{item.title}</p>
                <p className="mt-0.5 text-[12px] leading-snug text-muted">{item.body}</p>
              </div>
            </div>
            )
          })}
        </div>
      </section>

      <HowItWorks />

      <FeatureRow
        eyebrow={copy.home.featureSprint.eyebrow}
        title={copy.home.featureSprint.title}
        body={copy.home.featureSprint.body}
        bullets={copy.home.featureSprint.bullets}
        cta={{ to: '/app/practice', label: copy.home.featureSprint.cta }}
        visual={<PracticePreview />}
        background="plain"
      />

      <FeatureRow
        eyebrow={copy.home.featureMock.eyebrow}
        title={copy.home.featureMock.title}
        body={copy.home.featureMock.body}
        bullets={copy.home.featureMock.bullets}
        cta={{ to: '/app/mocks', label: copy.home.featureMock.cta }}
        visual={<PalettePreview />}
        background="surface"
        reverse
      />

      <FeatureRow
        eyebrow={copy.home.featureRevision.eyebrow}
        title={copy.home.featureRevision.title}
        body={copy.home.featureRevision.body}
        bullets={copy.home.featureRevision.bullets}
        cta={{ to: '/app/revision', label: copy.home.featureRevision.cta }}
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
  const copy = useCopy()
  const { lang } = useLang()
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
              {copy.home.badge}
            </Badge>
            <Badge tone="outline">{copy.home.beta}</Badge>
          </div>

          <h1 className="mt-5 max-w-[600px] text-[38px] font-semibold leading-[1.05] tracking-[-0.035em] text-ink sm:text-[46px] lg:text-[56px]">
            {copy.home.headlineBefore}
            <span className="text-brand">{copy.home.headlineAccent}</span>
            {copy.home.headlineAfter}
          </h1>

          <p className="mt-5 max-w-[490px] text-[15px] leading-relaxed text-muted sm:text-[16.5px]">
            {copy.home.body}
          </p>

          <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
            <ButtonLink to="/app/practice" size="lg">
              {copy.home.start}
              <ArrowRight size={16} />
            </ButtonLink>
            <ButtonLink to="/subjects/maths/percentages" size="lg" variant="secondary">
              {copy.home.read}
            </ButtonLink>
          </div>

          <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Check size={13} className="text-positive" /> {copy.home.noAccount}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check size={13} className="text-positive" /> {copy.home.coverage}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check size={13} className="text-positive" /> {copy.home.phone}
            </span>
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-2 border-t border-line pt-5">
            <span className="text-[11px] uppercase tracking-[0.1em] text-muted">
              {copy.home.startWith}
            </span>
            {subjects.map((subject) => (
              <Link
                key={subject.id}
                to={`/subjects/${subject.slug}`}
                className="rounded-full border border-line bg-surface px-2.5 py-1 text-[12px] text-ink-soft transition hover:border-line-strong hover:text-ink"
              >
                {lang === 'hi' ? subjectShortHindi(subject.id) : subject.short}
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

function ProofBand() {
  const copy = useCopy()
  const stats = [
    { value: allChapters.length, label: copy.home.proof.chapters },
    { value: 2, label: copy.home.proof.languages },
    { value: 10, label: copy.home.proof.sprint },
  ]

  return (
    <section className="border-t border-line bg-surface/70">
      <div className="container-page grid gap-7 py-8 md:grid-cols-[1.15fr_1fr] md:items-center md:gap-12">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2.5" aria-hidden>
            {['A', 'M', 'R', 'K', 'S'].map((initial) => (
              <span
                key={initial}
                className="grid h-10 w-10 place-items-center rounded-full border-2 border-surface bg-brand-soft text-[12px] font-semibold text-brand-ink"
              >
                {initial}
              </span>
            ))}
            <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-surface bg-brand text-[11px] font-semibold text-white">
              +{communitySize - 5}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-display text-[24px] font-semibold leading-none tracking-[-0.02em] text-ink sm:text-[27px]">
              {communitySize}{' '}
              <span className="text-[14px] font-medium leading-snug text-muted sm:text-[15px]">
                {copy.home.proof.learners}
              </span>
            </p>
            <p className="mt-1.5 max-w-[440px] text-[12px] leading-relaxed text-muted">
              {copy.home.proof.body}
            </p>
          </div>
        </div>

        <dl className="grid grid-cols-3 gap-4 md:gap-6">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dd className="font-display text-[22px] font-semibold leading-none tracking-tight text-brand">{stat.value}</dd>
              <dt className="mt-1.5 text-[11px] leading-snug text-muted">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

function HowItWorks() {
  const copy = useCopy()
  const stepIcons = [GraduationCap, ListChecks, RotateCcw]
  return (
    <section className="container-page py-16 md:py-24" id="how">
      <div className="max-w-2xl">
        <SectionLabel>{copy.home.howEyebrow}</SectionLabel>
        <h2 className="mt-3 text-[28px] font-semibold leading-tight sm:text-[36px]">
          {copy.home.howTitle}
        </h2>
        <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
          {copy.home.howBody}
        </p>
      </div>

      <ol className="mt-10 grid gap-4 md:grid-cols-3">
        {copy.home.howSteps.map((item, index) => {
          const Icon = stepIcons[index] ?? GraduationCap
          return (
          <li key={item.step} className="card relative overflow-hidden p-5">
            <div className="flex items-center justify-between">
              <span className="num text-[11px] font-semibold tracking-[0.12em] text-muted">
                {item.step}
              </span>
              <Icon size={17} className="text-brand" strokeWidth={1.8} />
            </div>
            <h3 className="mt-4 text-[16px] font-semibold">{item.title}</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{item.body}</p>
          </li>
          )
        })}
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
  const copy = useCopy()
  const [lang, setLang] = useState<'en' | 'hi'>('en')
  const question = questionById('qa-pl-2')!

  return (
    <section className="container-page py-16 md:py-24" id="bilingual">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
        <div>
          <SectionLabel>{copy.home.biEyebrow}</SectionLabel>
          <h2 className="mt-3 max-w-[420px] text-[28px] font-semibold leading-tight sm:text-[36px]">
            {copy.home.biTitle}
          </h2>
          <p className="mt-3 max-w-[440px] text-[14.5px] leading-relaxed text-muted">
            {copy.home.biBody}
          </p>
          <p className="mt-5 inline-flex items-start gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-[12px] text-muted">
            <Languages size={14} className="mt-0.5 shrink-0 text-brand" />
            {copy.home.biNote}
          </p>
        </div>

        <div className="card overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <span className="label">{copy.home.biPreview}</span>
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
              {copy.home.biFootnote}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function SubjectsBand() {
  const { lang } = useLang()
  const copy = useCopy()
  return (
    <section className="border-y border-line bg-surface/50">
      <div className="container-page py-16 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <SectionLabel>{copy.home.subjectsEyebrow}</SectionLabel>
            <h2 className="mt-3 text-[28px] font-semibold leading-tight sm:text-[34px]">
              {copy.home.subjectsTitle}
            </h2>
          </div>
          <Link
            to="/subjects"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand-ink hover:underline"
          >
            {copy.home.allChapters} <ArrowRight size={14} />
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
                  <p className="mt-1 text-[12px] leading-relaxed text-muted">{subjectTagline(lang, subject.id, subject.tagline)}</p>
                </div>
                <div className="mt-auto flex items-center gap-3 border-t border-line pt-3 text-[11px] text-muted">
                  <span>{copy.home.chaptersN(subject.chapters.length)}</span>
                  <span className="h-1 w-1 rounded-full bg-line-strong" />
                  <span>{copy.home.questionsN(count)}</span>
                </div>
              </Link>
            )
          })}

          <div className="card flex flex-col justify-between gap-4 border-dashed bg-surface-2/40 p-4">
            <div>
              <Badge tone="gold">
                <Sparkles size={11} /> {copy.home.nextRelease}
              </Badge>
              <h3 className="mt-3 text-[14px] font-semibold">{copy.home.focusTitle}</h3>
              <p className="mt-1 text-[12px] leading-relaxed text-muted">
                {copy.home.focusBody}
              </p>
            </div>
            <p className="text-[11px] text-muted">{copy.home.inReview}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function MockBand({ papers }: { papers: typeof mockPapers }) {
  const copy = useCopy()
  return (
    <section className="container-page py-16 md:py-24" id="marking">
      <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-start lg:gap-16">
        <div>
          <SectionLabel>{copy.home.mockEyebrow}</SectionLabel>
          <h2 className="mt-3 max-w-[430px] text-[28px] font-semibold leading-tight sm:text-[36px]">
            {copy.home.mockTitle}
          </h2>
          <p className="mt-3 max-w-[460px] text-[14.5px] leading-relaxed text-muted">
            {copy.home.mockBody}
          </p>

          <div className="mt-6 grid max-w-[420px] grid-cols-3 gap-2">
            {copy.home.mockStats.map((item) => (
              <div key={item.label} className="rounded-xl border border-line bg-surface px-3 py-2.5">
                <p className="num font-display text-[19px] font-semibold leading-none">{item.value}</p>
                <p className="mt-1.5 text-[10.5px] leading-tight text-muted">{item.label}</p>
              </div>
            ))}
          </div>

          <ul className="mt-6 space-y-2 text-[13px] text-ink-soft">
            {copy.home.mockRules.map(
              (line) => (
                <li key={line} className="flex items-start gap-2.5">
                  <ShieldCheck size={15} className="mt-0.5 shrink-0 text-positive" />
                  {line}
                </li>
              ),
            )}
          </ul>

          <ButtonLink to="/mocks" className="mt-6" variant="secondary">
            {copy.home.browseMocks} <ArrowRight size={15} />
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
                  {copy.home.paperMeta(paperQuestionCount(paper), paper.durationMinutes, paper.sections.length)}
                </p>
              </div>
              {paper.status === 'scheduled' ? (
                <Badge tone="gold">{copy.home.opensBadge}</Badge>
              ) : (
                <Badge tone="positive">{copy.home.availableBadge}</Badge>
              )}
            </div>
          ))}
          <p className="px-1 text-[11px] leading-relaxed text-muted">
            {copy.home.sundayNote}
          </p>
        </div>
      </div>
    </section>
  )
}

function Testimonials() {
  const copy = useCopy()
  const quotes = copy.home.quotes

  return (
    <section className="border-y border-line bg-surface/50">
      <div className="container-page py-16 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <SectionLabel>{copy.home.betaEyebrow}</SectionLabel>
            <h2 className="mt-3 max-w-[540px] text-[26px] font-semibold leading-tight sm:text-[32px]">
              {copy.home.betaTitle}
            </h2>
          </div>
          <p className="text-[11.5px] text-muted">{copy.home.betaCollected}</p>
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
  const copy = useCopy()
  const items = copy.home.faq

  return (
    <section className="container-page py-16 md:py-24" id="faq">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <SectionLabel>{copy.home.faqEyebrow}</SectionLabel>
          <h2 className="mt-3 text-[28px] font-semibold leading-tight sm:text-[34px]">
            {copy.home.faqTitle}
          </h2>
          <p className="mt-3 max-w-xs text-[13.5px] leading-relaxed text-muted">
            {copy.home.faqUnsureBefore}{' '}
            <a href="mailto:hello@sabpadho.in" className="link-underline text-ink-soft">
              hello@sabpadho.in
            </a>{' '}
            {copy.home.faqUnsureAfter}
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
  const copy = useCopy()
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
                {copy.home.finalTitle}
              </h2>
              <p className="mt-2 max-w-[440px] text-[13.5px] leading-relaxed text-muted">
                {copy.home.finalBody}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            <ButtonLink to="/app" size="lg">
              {copy.marketing.openDesk} <ArrowRight size={16} />
            </ButtonLink>
            <Link to="/signin" className="text-center text-[12px] text-muted hover:text-ink">
              {copy.home.finalSignin}
            </Link>
          </div>
        </div>
        <div className="relative mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-5 text-[11.5px] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Flag size={13} /> {copy.home.finalFree}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Languages size={13} /> {copy.home.finalLang}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={13} /> {copy.home.finalNoCard}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-positive" /> {copy.home.finalSample}
          </span>
        </div>
      </div>
    </section>
  )
}
