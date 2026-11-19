import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bookmark,
  BookOpen,
  Check,
  ChevronDown,
  Laptop,
  Smartphone,
  Trash2,
} from 'lucide-react'
import { Badge, Button, ButtonLink, EmptyState, SectionLabel } from '../../components/ui'
import { questionById } from '../../data/questions'
import { chapterById, subjectById } from '../../data/subjects'
import { planFeatures } from '../../data/learner'
import { useShelf } from '../../lib/shelf'
import { useLang } from '../../lib/lang'
import { useToast } from '../../lib/toast'
import { usePageTitle } from '../../lib/hooks'
import { cn } from '../../lib/utils'

export function Shelf() {
  usePageTitle('Question shelf')
  const { entries, remove } = useShelf()
  const { lang } = useLang()
  const { notify } = useToast()
  const [filter, setFilter] = useState('all')

  const items = useMemo(
    () =>
      entries
        .map((entry) => {
          const question = questionById(entry.questionId)
          if (!question) return null
          const chapter = chapterById(question.chapterId)
          const subject = chapter ? subjectById[chapter.subjectId] : undefined
          return { entry, question, chapter, subject }
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [entries],
  )

  const subjectOptions = Array.from(
    new Map(
      items
        .filter((item) => item.subject)
        .map((item) => [item.subject!.id, item.subject!.short]),
    ).entries(),
  )

  const visible = filter === 'all' ? items : items.filter((item) => item.subject?.id === filter)

  return (
    <div className="space-y-5">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <SectionLabel>Personal question shelf</SectionLabel>
          <h1 className="mt-1.5 text-[26px] font-semibold leading-tight sm:text-[30px]">
            Saved questions
          </h1>
          <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-muted">
            Keep the useful ones together without repeating an entire test. Everything you bookmark
            in a sprint or a mock lands here.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="brand">
            <Bookmark size={11} /> {items.length} saved
          </Badge>
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr] xl:items-start">
        <div className="space-y-3">
          <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
            <button
              type="button"
              onClick={() => setFilter('all')}
              aria-pressed={filter === 'all'}
              className={cn(
                'shrink-0 whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-[11.5px] font-medium transition',
                filter === 'all'
                  ? 'border-brand/30 bg-brand-soft text-brand-ink'
                  : 'border-line bg-surface text-muted hover:text-ink',
              )}
            >
              All {items.length}
            </button>
            {subjectOptions.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                aria-pressed={filter === id}
                className={cn(
                  'shrink-0 whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-[11.5px] font-medium transition',
                  filter === id
                    ? 'border-brand/30 bg-brand-soft text-brand-ink'
                    : 'border-line bg-surface text-muted hover:text-ink',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={<Bookmark size={18} />}
                title={items.length ? 'Nothing in this subject yet' : 'Your shelf is empty'}
                body="Save a question while practising or reviewing. The shelf keeps it with the chapter it came from."
                action={
                  <ButtonLink to="/app/practice" size="sm">
                    Start a sprint <ArrowRight size={13} />
                  </ButtonLink>
                }
              />
            </div>
          ) : (
            <ul className="space-y-2.5">
              {visible.map(({ entry, question, chapter, subject }) => (
                <li key={question.id} className="card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge tone="neutral">{subject?.short}</Badge>
                      <span className="text-[10.5px] text-muted">{chapter?.title.en}</span>
                    </div>
                    <span className="text-[10px] text-muted">Saved {entry.savedOn}</span>
                  </div>

                  <p className="mt-2.5 text-[13px] leading-relaxed text-ink">
                    {question.prompt[lang]}
                  </p>

                  {entry.note ? (
                    <p className="mt-2 rounded-md bg-surface-2/70 px-2.5 py-1.5 text-[11px] italic text-muted">
                      “{entry.note}”
                    </p>
                  ) : null}

                  <details className="group mt-2">
                    <summary className="flex cursor-pointer list-none items-center gap-1 text-[11px] font-medium text-brand-ink marker:hidden [&::-webkit-details-marker]:hidden">
                      Show answer and reasoning
                      <ChevronDown
                        size={12}
                        className="transition-transform group-open:rotate-180"
                      />
                    </summary>
                    <div className="mt-2 rounded-lg border border-line bg-surface-2/50 px-2.5 py-2">
                      <p className="flex items-center gap-1.5 text-[11px] font-medium text-positive">
                        <Check size={11} /> {question.options[lang][question.correct]}
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed text-muted">
                        {question.explanation[lang]}
                      </p>
                    </div>
                  </details>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-2.5">
                    {chapter && subject ? (
                      <Link
                        to={`/subjects/${subject.slug}/${chapter.slug}`}
                        className="inline-flex items-center gap-1.5 text-[11.5px] text-muted underline-offset-2 transition hover:text-brand-ink hover:underline"
                      >
                        <BookOpen size={12} /> Chapter primer
                      </Link>
                    ) : (
                      <span />
                    )}
                    <div className="flex items-center gap-1.5">
                      {subject && chapter ? (
                        <ButtonLink to={`/app/practice/${chapter.slug}`} variant="secondary" size="sm">
                          Practise chapter
                        </ButtonLink>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          remove(question.id)
                          notify('Removed from your shelf')
                        }}
                        aria-label="Remove from shelf"
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="space-y-3">
          <div className="card p-4">
            <p className="label">What your plan includes</p>
            <p className="mt-1 text-[10.5px] text-muted">Shown before you start, not after.</p>
            <ul className="mt-3 space-y-2.5">
              {planFeatures.map((feature) => (
                <li key={feature.title} className="flex items-start gap-2">
                  <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-positive-soft text-positive">
                    <Check size={10} />
                  </span>
                  <div>
                    <p className="flex items-center gap-1.5 text-[12px] font-medium text-ink">
                      {feature.title}
                      <span className="rounded-full bg-surface-3 px-1.5 py-0.5 text-[8.5px] font-medium uppercase tracking-wide text-muted">
                        Included
                      </span>
                    </p>
                    <p className="mt-0.5 text-[10.5px] leading-relaxed text-muted">{feature.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-3 border-t border-line pt-2.5 text-[10px] leading-relaxed text-muted">
              The preview plan is illustrative. Anything that becomes paid will be labelled before
              you begin, not inside a set.
            </p>
          </div>

          <div className="card p-4">
            <p className="flex items-center gap-2 text-[12px] font-medium">
              <Laptop size={13} className="text-muted" /> Study on any device
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
              Sign in on your phone or laptop to carry on with your saved questions and acknowledged
              progress.
            </p>
            <p className="mt-2.5 flex items-center gap-1.5 text-[10.5px] text-muted">
              <Smartphone size={12} /> The portal is built mobile-first.
            </p>
          </div>

          <div className="rounded-xl border border-dashed border-line bg-surface-2/40 p-4">
            <p className="text-[11.5px] font-medium">One shelf, no duplicates</p>
            <p className="mt-1 text-[10.5px] leading-relaxed text-muted">
              Saving the same question twice keeps a single entry, filtered by subject and chapter.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
