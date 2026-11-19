import { Link } from 'react-router-dom'
import { ArrowRight, Clock, ListChecks } from 'lucide-react'
import { SectionLabel, Badge, ButtonLink } from '../components/ui'
import { subjects } from '../data/subjects'
import { questionsForSubject } from '../data/questions'
import { tintTile } from '../components/subject-tint'
import { cn } from '../lib/utils'
import { usePageTitle } from '../lib/hooks'

export function SubjectsPage() {
  usePageTitle('Subjects')
  const totalChapters = subjects.reduce((sum, subject) => sum + subject.chapters.length, 0)

  return (
    <div className="container-page pb-16 pt-10 md:pt-14">
      <div className="max-w-2xl">
        <SectionLabel>Chapter primers</SectionLabel>
        <h1 className="mt-3 text-[32px] font-semibold leading-[1.1] sm:text-[44px]">
          The syllabus, chapter by chapter.
        </h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
          Five subjects, {totalChapters} chapters. Read what a chapter covers and how one worked
          example is solved — no account needed. When you are ready, the practice set is one click
          away.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {subjects.map((subject) => (
          <a
            key={subject.id}
            href={`#${subject.slug}`}
            className="chip transition hover:border-line-strong hover:text-ink"
          >
            {subject.short}
            <span className="text-[10px] text-muted">{questionsForSubject(subject.id).length}</span>
          </a>
        ))}
      </div>

      <div className="mt-10 space-y-12">
        {subjects.map((subject) => (
          <section key={subject.id} id={subject.slug} className="scroll-mt-24">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-4">
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    'grid h-11 w-11 shrink-0 place-items-center rounded-xl font-display text-[13px] font-bold',
                    tintTile[subject.tint],
                  )}
                >
                  {subject.code}
                </span>
                <div>
                  <h2 className="text-[20px] font-semibold leading-tight">{subject.name.en}</h2>
                  <p className="mt-1 max-w-xl text-[12.5px] leading-relaxed text-muted">
                    {subject.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="neutral">
                  <ListChecks size={11} /> {subject.chapters.length} chapters
                </Badge>
                <Link
                  to={`/subjects/${subject.slug}`}
                  className="inline-flex items-center gap-1 text-[12.5px] font-medium text-brand-ink hover:underline"
                >
                  Overview <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {subject.chapters.map((chapter) => (
                <Link
                  key={chapter.id}
                  to={`/subjects/${subject.slug}/${chapter.slug}`}
                  className="group flex items-center gap-3 rounded-xl border border-line bg-surface px-3.5 py-3 transition hover:border-line-strong hover:bg-surface-2/50"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-medium text-ink">
                      {chapter.title.en}
                      <span className="ml-2 text-[11.5px] font-normal text-muted">
                        {chapter.title.hi}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-[11.5px] text-muted">
                      {chapter.blurb}
                    </span>
                  </span>
                  <span className="hidden shrink-0 items-center gap-1 text-[10.5px] text-muted sm:inline-flex">
                    <Clock size={11} /> {chapter.minutes} min
                  </span>
                  <ArrowRight
                    size={14}
                    className="shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-ink"
                  />
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-14 flex flex-col items-start justify-between gap-4 rounded-2xl border border-line bg-surface px-5 py-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-[18px] font-semibold">Already know the chapter?</h2>
          <p className="mt-1 text-[13px] text-muted">
            Skip the primer and take a five-question sprint with your saved language and length.
          </p>
        </div>
        <ButtonLink to="/app/practice">
          Set up a sprint <ArrowRight size={15} />
        </ButtonLink>
      </div>
    </div>
  )
}
