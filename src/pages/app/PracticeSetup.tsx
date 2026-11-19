import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, BookOpen, Check, Clock, Info, Languages, Lock } from 'lucide-react'
import { Badge, Button, SectionLabel, Segmented } from '../../components/ui'
import { subjectById, subjects, type SubjectId } from '../../data/subjects'
import { questionsForChapter } from '../../data/questions'
import { tintTile } from '../../components/subject-tint'
import { cn } from '../../lib/utils'
import { usePageTitle } from '../../lib/hooks'
import { useLang } from '../../lib/lang'

export function PracticeSetup() {
  usePageTitle('Practice')
  const navigate = useNavigate()
  const { lang, setLang } = useLang()
  const [subjectId, setSubjectId] = useState<SubjectId>('maths')
  const subject = subjectById[subjectId]
  const [chapterSlug, setChapterSlug] = useState('percentages')
  const [length, setLength] = useState(5)

  const chapter = subject.chapters.find((item) => item.slug === chapterSlug) ?? subject.chapters[0]
  const pool = questionsForChapter(chapter.id)
  const lengths = Array.from(
    new Set([5, 10, 15, pool.length].filter((value) => value > 0 && value <= pool.length)),
  ).sort((a, b) => a - b)
  const selectedLength = lengths.includes(length) ? length : (lengths[0] ?? 0)
  const canStart = selectedLength > 0

  function chooseSubject(id: SubjectId) {
    setSubjectId(id)
    const first = subjectById[id].chapters.find((item) => questionsForChapter(item.id).length > 0)
    setChapterSlug(first?.slug ?? subjectById[id].chapters[0].slug)
    setLength(5)
  }

  return (
    <div className="space-y-5">
      <header>
        <SectionLabel>Topic sprint</SectionLabel>
        <div className="mt-1.5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[26px] font-semibold leading-tight sm:text-[30px]">
              Set up a short sprint
            </h1>
            <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-muted">
              Choose a subject, a chapter and a length. You will see the first question right after —
              each answer is checked with the reasoning shown.
            </p>
          </div>
          <Badge tone="outline">
            <Clock size={11} /> About {chapter.minutes} minutes
          </Badge>
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <div className="space-y-4">
          <section className="card p-4 sm:p-5">
            <StepHeading n="1" title="Subject" />
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {subjects.map((item) => {
                const active = item.id === subjectId
                const count = item.chapters.reduce(
                  (sum, chapterItem) => sum + questionsForChapter(chapterItem.id).length,
                  0,
                )
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => chooseSubject(item.id)}
                    aria-pressed={active}
                    className={cn(
                      'flex flex-col items-start gap-2 rounded-xl border p-2.5 text-left transition',
                      active
                        ? 'border-brand bg-brand-soft/70 shadow-[0_0_0_1px_var(--brand)]'
                        : 'border-line bg-surface hover:border-line-strong hover:bg-surface-2/60',
                    )}
                  >
                    <span
                      className={cn(
                        'grid h-7 w-7 place-items-center rounded-md font-display text-[9.5px] font-bold',
                        tintTile[item.tint],
                      )}
                    >
                      {item.code}
                    </span>
                    <span>
                      <span className="block text-[12px] font-medium leading-tight text-ink">
                        {item.short}
                      </span>
                      <span className="mt-0.5 block text-[10px] text-muted">{count} questions</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          <section className="card p-4 sm:p-5">
            <StepHeading
              n="2"
              title="Chapter"
              hint={`${subject.chapters.length} in ${subject.short}`}
            />
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {subject.chapters.map((item) => {
                const active = item.id === chapter.id
                const count = questionsForChapter(item.id).length
                const notReady = count === 0
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={notReady}
                    onClick={() => {
                      setChapterSlug(item.slug)
                      setLength(5)
                    }}
                    aria-pressed={active}
                    className={cn(
                      'flex items-start gap-2.5 rounded-xl border p-3 text-left transition',
                      active
                        ? 'border-brand bg-brand-soft/60'
                        : notReady
                          ? 'cursor-not-allowed border-dashed border-line bg-surface/60 opacity-70'
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
                      <span className="flex items-center justify-between gap-2">
                        <span className="block truncate text-[12.5px] font-medium text-ink">
                          {item.title.en}
                        </span>
                        {active && item.attempts && item.attempts >= 3 && (item.accuracy ?? 0) < 72 ? (
                          <span className="shrink-0 rounded-full bg-brand px-1.5 py-0.5 text-[8.5px] font-semibold text-white">
                            Practise next
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-0.5 block text-[10.5px] leading-relaxed text-muted">
                        {notReady
                          ? 'Questions in review · primer ready'
                          : item.attempts && item.attempts >= 3
                            ? `${item.attempts} attempts · ${item.accuracy}% correct · ${count} questions`
                            : item.attempts
                              ? `${item.attempts} attempt · too early to tell · ${count} questions`
                              : `Not started · ${count} questions`}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
            {pool.length === 0 ? (
              <p className="mt-3 flex items-start gap-2 rounded-lg bg-warning-soft px-3 py-2 text-[11.5px] leading-relaxed text-warning">
                <Info size={13} className="mt-0.5 shrink-0" />
                This chapter’s questions are still in review. You can read the primer now and
                practise as soon as the set clears review.
              </p>
            ) : null}
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            <section className="card p-4 sm:p-5">
              <StepHeading n="3" title="Session length" />
              <div className="mt-3 flex flex-wrap gap-1.5">
                {lengths.map((value) => {
                  const active = value === selectedLength
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setLength(value)}
                      aria-pressed={active}
                      className={cn(
                        'min-w-[86px] flex-1 rounded-lg border px-2 py-2 text-[12px] transition',
                        active
                          ? 'border-brand bg-brand-soft text-brand-ink'
                          : 'border-line bg-surface text-ink-soft hover:border-line-strong',
                      )}
                    >
                      {value === pool.length ? `All ${value}` : `${value} questions`}
                    </button>
                  )
                })}
              </div>
              <p className="mt-2.5 text-[11px] leading-relaxed text-muted">
                {pool.length
                  ? `${pool.length} questions in this chapter. Short sets are better for a first attempt.`
                  : 'No questions available yet.'}
              </p>
            </section>

            <section className="card p-4 sm:p-5">
              <StepHeading n="4" title="Language" />
              <Segmented
                ariaLabel="Question language"
                className="mt-3"
                value={lang}
                onChange={setLang}
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'hi', label: 'हिंदी' },
                ]}
              />
              <p className="mt-2.5 flex items-start gap-2 text-[11px] leading-relaxed text-muted">
                <Languages size={12} className="mt-0.5 shrink-0" />
                You can switch language inside the sprint; your selection and progress stay put.
              </p>
            </section>
          </div>
        </div>

        <aside className="xl:sticky xl:top-24 xl:self-start">
          <div className="card overflow-hidden">
            <div className="border-b border-line px-4 py-3">
              <p className="label">Your sprint</p>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    'grid h-9 w-9 place-items-center rounded-lg font-display text-[10.5px] font-bold',
                    tintTile[subject.tint],
                  )}
                >
                  {subject.code}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium">{chapter.title.en}</p>
                  <p className="text-[11px] text-muted">
                    {subject.short} · {selectedLength || 0} questions
                  </p>
                </div>
              </div>

              <dl className="mt-4 space-y-2 border-t border-line pt-3 text-[12px]">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Length</dt>
                  <dd>{selectedLength || 0} questions</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Time</dt>
                  <dd>About {Math.max(3, Math.round((chapter.minutes / Math.max(1, pool.length)) * Math.max(1, selectedLength)))} min</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Language</dt>
                  <dd>{lang === 'en' ? 'English' : 'हिंदी'}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Checking</dt>
                  <dd>After each question</dd>
                </div>
              </dl>

              <Button
                className="mt-4 w-full"
                size="lg"
                disabled={!canStart}
                onClick={() => navigate(`/app/practice/${chapter.slug}?len=${selectedLength}`)}
              >
                Start sprint <ArrowRight size={15} />
              </Button>

              <Link
                to={`/subjects/${subject.slug}/${chapter.slug}`}
                className="mt-2 flex items-center justify-center gap-1.5 text-[11.5px] text-muted hover:text-ink"
              >
                <BookOpen size={12} /> Read the chapter primer first
              </Link>

              <p className="mt-4 flex items-start gap-2 border-t border-line pt-3 text-[10.5px] leading-relaxed text-muted">
                <Lock size={12} className="mt-0.5 shrink-0" />
                Answers are saved as you go. In this preview they stay in your browser.
              </p>
            </div>
          </div>

          <div className="card mt-3 p-4">
            <p className="text-[11.5px] font-medium">How the label works</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted">
              A chapter is called “practise next” only after three attempts. One missed question is
              never enough to label a chapter weak.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

function StepHeading({ n, title, hint }: { n: string; title: string; hint?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="num grid h-5 w-5 place-items-center rounded-full border border-line bg-surface-2 text-[10px] font-semibold text-muted">
          {n}
        </span>
        <h2 className="text-[13px] font-semibold">{title}</h2>
      </div>
      {hint ? <span className="text-[10.5px] text-muted">{hint}</span> : null}
    </div>
  )
}
