import { Link, useParams } from 'react-router-dom'
import { ArrowRight, BookOpen, Check, ChevronRight, Clock, Languages, ListChecks } from 'lucide-react'
import { Badge, ButtonLink, SectionLabel } from '../components/ui'
import { findChapter, subjects } from '../data/subjects'
import { questionsForChapter } from '../data/questions'
import { tintTile } from '../components/subject-tint'
import { cn } from '../lib/utils'
import { usePageTitle } from '../lib/hooks'
import { useLang } from '../lib/lang'
import { NotFound } from './NotFound'
import { subjectShortByLabel, useCopy } from '../lib/ui-copy'

export function ChapterPrimer() {
  const copy = useCopy()
  const { subjectSlug = '', chapterSlug = '' } = useParams()
  const found = findChapter(subjectSlug, chapterSlug)
  const { lang } = useLang()
  usePageTitle(found ? (lang === 'hi' ? found.chapter.title.hi : found.chapter.title.en) : copy.primerPage.fallback)

  if (!found) return <NotFound />
  const { subject, chapter } = found
  const bank = questionsForChapter(chapter.id)
  const example = bank[0]
  const others = subject.chapters.filter((item) => item.id !== chapter.id)

  return (
    <div className="container-page pb-16 pt-8 md:pt-12">
      <nav className="flex flex-wrap items-center gap-1.5 text-[12px] text-muted" aria-label={copy.a11y.breadcrumb}>
        <Link to="/" className="hover:text-ink">
          {copy.primerPage.home}
        </Link>
        <ChevronRight size={12} />
        <Link to="/subjects" className="hover:text-ink">
          {copy.primerPage.crumbSubjects}
        </Link>
        <ChevronRight size={12} />
        <Link to={`/subjects/${subject.slug}`} className="hover:text-ink">
          {subjectShortByLabel(lang, subject.short)}
        </Link>
        <ChevronRight size={12} />
        <span className="text-ink-soft">{lang === 'hi' ? chapter.title.hi : chapter.title.en}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.55fr_0.85fr] lg:gap-14">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="brand">
              <BookOpen size={11} /> {copy.primerPage.badge}
            </Badge>
            <span className="inline-flex items-center gap-1.5 text-[11.5px] text-muted">
              <Clock size={12} /> {copy.primerPage.minRead(chapter.minutes)}
            </span>
          </div>

          <h1 className="mt-4 text-[32px] font-semibold leading-[1.08] sm:text-[42px]">
            {lang === 'hi' ? chapter.title.hi : chapter.title.en}
          </h1>
          <p className="mt-1.5 text-[14px] text-muted">
            {lang === 'hi' ? chapter.title.en : chapter.title.hi} ·{' '}
            {lang === 'hi' ? subject.name.hi : subject.name.en}
          </p>
          <p className="mt-4 max-w-[600px] text-[14.5px] leading-relaxed text-muted">
            {chapter.blurb} {copy.primerPage.blurbLead}
          </p>

          <div className="mt-6 flex flex-wrap gap-2 text-[11.5px]">
            <span className="chip">{copy.primerPage.questionsIn(bank.length)}</span>
            <span className="chip">
              <Languages size={11} /> English &amp; हिंदी
            </span>
            <span className="chip">{copy.primerPage.marking}</span>
          </div>

          <section className="mt-10">
            <SectionLabel>{copy.primerPage.covers}</SectionLabel>
            <ol className="mt-4 space-y-3">
              {chapter.outline.map((item, index) => (
                <li key={item} className="flex gap-3.5">
                  <span className="num mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line bg-surface text-[11px] font-semibold text-muted">
                    {index + 1}
                  </span>
                  <p className="text-[13.5px] leading-relaxed text-ink-soft">{item}</p>
                </li>
              ))}
            </ol>
          </section>

          {example ? (
            <section className="mt-10">
              <div className="flex items-center justify-between gap-3">
                <SectionLabel>{copy.primerPage.workedExample}</SectionLabel>
                <span className="text-[11px] text-muted">
                  {copy.primerPage.difficulty(example.difficulty ?? 'Medium')} ·{' '}
                  {copy.primerPage.optionsN(example.options.en.length)}
                </span>
              </div>
              <div className="card mt-4 overflow-hidden">
                <div className="border-b border-line px-4 py-3 sm:px-5">
                  <p className="text-[14px] leading-relaxed text-ink">{example.prompt[lang]}</p>
                </div>
                <div className="grid gap-1.5 px-4 py-4 sm:grid-cols-2 sm:px-5">
                  {example.options[lang].map((option, index) => (
                    <div
                      key={option}
                      className={cn(
                        'flex items-center gap-2.5 rounded-lg border px-3 py-2 text-[13px]',
                        index === example.correct
                          ? 'border-positive/25 bg-positive-soft text-ink'
                          : 'border-line bg-surface text-muted',
                      )}
                    >
                      <span
                        className={cn(
                          'grid h-5 w-5 place-items-center rounded-full border text-[10px] font-semibold',
                          index === example.correct
                            ? 'border-positive bg-positive text-white'
                            : 'border-line text-muted',
                        )}
                      >
                        {'ABCD'[index]}
                      </span>
                      {option}
                      {index === example.correct ? (
                        <Check size={13} className="ml-auto text-positive" />
                      ) : null}
                    </div>
                  ))}
                </div>
                <div className="border-t border-line bg-surface-2/60 px-4 py-4 sm:px-5">
                  <p className="label">{copy.primerPage.reasoning}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
                    {example.explanation[lang]}
                  </p>
                </div>
              </div>
            </section>
          ) : null}

          <section className="mt-10">
            <SectionLabel>{copy.primerPage.beforeBegin}</SectionLabel>
            <ul className="mt-3 space-y-2 text-[13px] text-ink-soft">
              {copy.primerPage.beforeLines.map((line) => (
                <li key={line} className="flex gap-2.5">
                  <Check size={14} className="mt-0.5 shrink-0 text-brand" />
                  {line}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  'grid h-9 w-9 place-items-center rounded-lg font-display text-[11px] font-bold',
                  tintTile[subject.tint],
                )}
              >
                {subject.code}
              </span>
              <div>
                <p className="text-[12px] font-medium">{lang === 'hi' ? subject.name.hi : subject.name.en}</p>
                <p className="text-[11px] text-muted">{lang === 'hi' ? chapter.title.hi : chapter.title.en} · {copy.primerPage.practiceSet}</p>
              </div>
            </div>

            <h2 className="mt-4 font-display text-[19px] font-semibold leading-snug">
              {copy.primerPage.readyTitle}
            </h2>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
              {copy.primerPage.readyBody}
            </p>

            <div className="mt-3 space-y-1.5 text-[12px] text-ink-soft">
              <p className="flex items-center justify-between gap-2">
                <span className="text-muted">{copy.primerPage.questions}</span>
                <span>{copy.primerPage.of5(bank.length)}</span>
              </p>
              <p className="flex items-center justify-between gap-2">
                <span className="text-muted">{copy.primerPage.estTime}</span>
                <span>{copy.primerPage.minutesN(chapter.minutes)}</span>
              </p>
              <p className="flex items-center justify-between gap-2">
                <span className="text-muted">{copy.primerPage.explanation}</span>
                <span>{copy.primerPage.afterCheck}</span>
              </p>
            </div>

            <ButtonLink to={`/app/practice/${chapter.slug}`} className="mt-4 w-full">
              {copy.primerPage.startSprint} <ArrowRight size={15} />
            </ButtonLink>
            <Link
              to="/signin"
              className="mt-2 block text-center text-[11.5px] text-muted hover:text-ink"
            >
              {copy.primerPage.signinKeep}
            </Link>

            <p className="mt-4 border-t border-line pt-3 text-[10.5px] leading-relaxed text-muted">
              {copy.primerPage.primersNote}
            </p>
          </div>

          <div className="card mt-3 p-4">
            <p className="label">{copy.primerPage.moreIn(subjectShortByLabel(lang, subject.short))}</p>
            <ul className="mt-2.5 space-y-1">
              {others.slice(0, 4).map((item) => (
                <li key={item.id}>
                  <Link
                    to={`/subjects/${subject.slug}/${item.slug}`}
                    className="group flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-[12.5px] text-ink-soft transition hover:bg-surface-2"
                  >
                    {lang === 'hi' ? item.title.hi : item.title.en}
                    <ChevronRight size={13} className="text-muted group-hover:text-ink" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-3 rounded-xl border border-line bg-surface-2/50 p-4">
            <p className="flex items-center gap-2 text-[11.5px] font-medium text-ink-soft">
              <ListChecks size={13} className="text-brand" /> {copy.primerPage.otherSubjects}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {subjects
                .filter((item) => item.id !== subject.id)
                .map((item) => (
                  <Link
                    key={item.id}
                    to={`/subjects/${item.slug}`}
                    className="rounded-md border border-line bg-surface px-2 py-1 text-[11px] text-muted transition hover:text-ink"
                  >
                    {subjectShortByLabel(lang, item.short)}
                  </Link>
                ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
