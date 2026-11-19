import { Link, useParams } from 'react-router-dom'
import { ArrowRight, ChevronRight, Clock, ListChecks } from 'lucide-react'
import { Badge, ButtonLink, SectionLabel } from '../components/ui'
import { findSubject } from '../data/subjects'
import { questionsForSubject } from '../data/questions'
import { tintTile } from '../components/subject-tint'
import { cn } from '../lib/utils'
import { usePageTitle } from '../lib/hooks'
import { NotFound } from './NotFound'

export function SubjectPage() {
  const { subjectSlug = '' } = useParams()
  const subject = findSubject(subjectSlug)

  usePageTitle(subject?.name.en ?? 'Subject')

  if (!subject) return <NotFound />

  const questions = questionsForSubject(subject.id)

  return (
    <div className="container-page pb-16 pt-8 md:pt-12">
      <nav className="flex items-center gap-1.5 text-[12px] text-muted" aria-label="Breadcrumb">
        <Link to="/subjects" className="hover:text-ink">
          Subjects
        </Link>
        <ChevronRight size={12} />
        <span className="text-ink-soft">{subject.short}</span>
      </nav>

      <header className="mt-6 flex flex-col gap-5 border-b border-line pb-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <span
            className={cn(
              'grid h-14 w-14 shrink-0 place-items-center rounded-2xl font-display text-[15px] font-bold',
              tintTile[subject.tint],
            )}
          >
            {subject.code}
          </span>
          <div>
            <SectionLabel>Tier I section</SectionLabel>
            <h1 className="mt-1.5 text-[30px] font-semibold leading-tight sm:text-[38px]">
              {subject.name.en}
            </h1>
            <p className="mt-0.5 text-[14px] text-muted">{subject.name.hi}</p>
            <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-muted">
              {subject.description}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <div className="flex gap-2">
            <Badge tone="neutral">
              <ListChecks size={11} /> {subject.chapters.length} chapters
            </Badge>
            <Badge tone="neutral">{questions.length} questions</Badge>
          </div>
          <div className="flex gap-2">
            <ButtonLink to="/app/practice" size="sm">
              Practise this subject
            </ButtonLink>
          </div>
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_0.8fr] lg:gap-12">
        <div>
          <div className="flex items-baseline justify-between">
            <h2 className="text-[19px] font-semibold">Chapters</h2>
            <span className="text-[11.5px] text-muted">Attempts are from your demo profile</span>
          </div>

          <ul className="mt-4 divide-y divide-line border-y border-line">
            {subject.chapters.map((chapter) => {
              const attempted = chapter.attempts
              return (
                <li key={chapter.id} className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Link
                        to={`/subjects/${subject.slug}/${chapter.slug}`}
                        className="text-[14.5px] font-medium text-ink hover:text-brand-ink"
                      >
                        {chapter.title.en}
                        <span className="ml-2 text-[12px] font-normal text-muted">
                          {chapter.title.hi}
                        </span>
                      </Link>
                      <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{chapter.blurb}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
                        <span className="inline-flex items-center gap-1">
                          <Clock size={11} /> {chapter.minutes} min
                        </span>
                        <span className="h-1 w-1 rounded-full bg-line-strong" />
                        {attempted && attempted >= 3 ? (
                          <span>
                            {attempted} attempts · {chapter.accuracy}% correct
                          </span>
                        ) : attempted ? (
                          <span>{attempted} attempt · too early to tell</span>
                        ) : (
                          <span>Not started</span>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <Link
                        to={`/subjects/${subject.slug}/${chapter.slug}`}
                        className="inline-flex items-center gap-1 text-[12px] font-medium text-brand-ink hover:underline"
                      >
                        Primer <ArrowRight size={13} />
                      </Link>
                      <Link
                        to={`/app/practice/${chapter.slug}`}
                        className="text-[11.5px] text-muted hover:text-ink"
                      >
                        Practise
                      </Link>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        <aside className="space-y-3">
          <div className="card p-4">
            <p className="label">How this subject is scored</p>
            <ul className="mt-3 space-y-2 text-[12.5px] text-ink-soft">
              <li className="flex justify-between gap-3">
                <span className="text-muted">Section</span>
                <span className="text-right">{subject.paperSection}</span>
              </li>
              <li className="flex justify-between gap-3">
                <span className="text-muted">Questions in Tier I</span>
                <span>25 of 100</span>
              </li>
              <li className="flex justify-between gap-3">
                <span className="text-muted">Marks</span>
                <span>50 (+2 / −0.5)</span>
              </li>
            </ul>
          </div>

          <div className="card p-4">
            <p className="label">Your accuracy</p>
            <p className="num mt-2 font-display text-[30px] font-semibold leading-none">
              {subject.accuracy}%
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
              <div className="h-full rounded-full bg-brand" style={{ width: `${subject.accuracy}%` }} />
            </div>
            <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
              Across {subject.chapters.reduce((sum, chapter) => sum + (chapter.attempts ?? 0), 0)}{' '}
              chapter attempts. Chapters with one attempt are not labelled yet.
            </p>
          </div>

          <div className="card border-dashed p-4">
            <p className="text-[12.5px] font-medium">Chapter primers stay open</p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-muted">
              Read the outline and a worked example without signing in. Sign in only when you want
              your answers and revision dates kept.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
