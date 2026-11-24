import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, BookOpen, Check, ChevronDown, Clock, FolderArchive, Info, Languages, Lock } from 'lucide-react'
import { Badge, Button, SectionLabel, Segmented } from '../../components/ui'
import type { SubjectId } from '../../data/subjects'
import { EXAM_OPTIONS, type ExamId } from '../../data/exams'
import { useCatalog } from '../../lib/catalog'
import { useAuth } from '../../lib/auth'
import { useToast } from '../../lib/toast'
import { tintTile } from '../../components/subject-tint'
import { cn } from '../../lib/utils'
import { usePageTitle } from '../../lib/hooks'
import { useLang } from '../../lib/lang'
import { useCopy, subjectShortHindi } from '../../lib/ui-copy'

export function PracticeSetup() {
  const { lang, setLang } = useLang()
  const copy = useCopy()
  usePageTitle(copy.nav.practice)
  const navigate = useNavigate()
  const { preferredExam, setPreferredExam } = useAuth()
  const { notify } = useToast()
  const { subjectById, partitionSubjectsByExam, questionsForChapter } = useCatalog()

  const { preferred: preferredSubjects, others: otherSubjects } =
    partitionSubjectsByExam(preferredExam)

  const [subjectId, setSubjectId] = useState<SubjectId>(
    preferredSubjects[0]?.id ?? 'maths',
  )
  const [othersOpen, setOthersOpen] = useState(false)

  useEffect(() => {
    if (!preferredSubjects.some((s) => s.id === subjectId) && preferredSubjects[0]) {
      setSubjectId(preferredSubjects[0].id)
    }
  }, [preferredExam, preferredSubjects, subjectId])

  const activeSubject =
    preferredSubjects.find((s) => s.id === subjectId) ??
    otherSubjects.find((s) => s.id === subjectId) ??
    subjectById[subjectId]

  const [chapterSlug, setChapterSlug] = useState('percentages')
  const [length, setLength] = useState(5)

  const chapter =
    activeSubject.chapters.find((item) => item.slug === chapterSlug) ??
    activeSubject.chapters[0]
  const pool = chapter ? questionsForChapter(chapter.id) : []
  const lengths = Array.from(
    new Set([5, 10, 15, pool.length].filter((value) => value > 0 && value <= pool.length)),
  ).sort((a, b) => a - b)
  const selectedLength = lengths.includes(length) ? length : (lengths[0] ?? 0)
  const canStart = selectedLength > 0

  function chooseSubject(id: SubjectId) {
    setSubjectId(id)
    const targetSubj =
      preferredSubjects.find((s) => s.id === id) ??
      otherSubjects.find((s) => s.id === id) ??
      subjectById[id]
    const first = targetSubj.chapters.find((item) => questionsForChapter(item.id).length > 0)
    setChapterSlug(first?.slug ?? targetSubj.chapters[0]?.slug ?? 'percentages')
    setLength(5)
  }

  const otherExamOptions = EXAM_OPTIONS.filter((item) => item.id !== preferredExam)

  async function switchExam(next: ExamId) {
    await setPreferredExam(next)
    setOthersOpen(false)
    notify(`Switched exam to ${next}`, 'success')
  }

  return (
    <div className="space-y-5">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <SectionLabel>{copy.practice.label}</SectionLabel>
          <Badge tone="brand">{preferredExam}</Badge>
        </div>
        <div className="mt-1.5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[26px] font-semibold leading-tight sm:text-[30px]">
              {copy.practice.title}
            </h1>
            <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-muted">
              {copy.practice.intro}
            </p>
          </div>
          {chapter ? (
            <Badge tone="outline">
              <Clock size={11} /> {copy.practice.minutes(chapter.minutes)}
            </Badge>
          ) : null}
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <div className="space-y-4">
          <section className="card p-4 sm:p-5">
            <StepHeading
              n="1"
              title={`${copy.practice.subject} (${preferredExam})`}
              hint={`${preferredSubjects.length} in track`}
            />
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {preferredSubjects.map((item) => {
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
                        {lang === 'hi' ? subjectShortHindi(item.id) : item.short}
                      </span>
                      <span className="mt-0.5 block text-[10px] text-muted">{copy.practice.setupCount(count)}</span>
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="mt-3 border-t border-line pt-3">
              <button
                type="button"
                onClick={() => setOthersOpen((v) => !v)}
                aria-expanded={othersOpen}
                className="flex w-full items-center justify-between gap-2 rounded-lg border border-dashed border-line bg-surface-2/40 px-3 py-2 text-left text-[12px] text-muted transition hover:border-line-strong hover:text-ink"
              >
                <span className="flex items-center gap-2 font-medium text-ink-soft">
                  <FolderArchive size={13} className="text-brand" />
                  {lang === 'hi' ? 'अन्य परीक्षाएँ (Others · Zipped)' : 'Others · Other exams & subjects (zipped)'}
                </span>
                <ChevronDown size={14} className={cn('transition-transform', othersOpen && 'rotate-180')} />
              </button>

              {othersOpen ? (
                <div className="mt-2.5 space-y-3 rounded-xl border border-line bg-surface-2/35 p-3">
                  <div>
                    <p className="text-[11px] text-muted">
                      {lang === 'hi'
                        ? 'दूसरी परीक्षा का अभ्यास करने के लिए परीक्षा बदलें:'
                        : 'Switch your exam track to unlock its full subject list:'}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {otherExamOptions.map((exam) => (
                        <Button
                          key={exam.id}
                          variant="secondary"
                          size="sm"
                          onClick={() => switchExam(exam.id)}
                        >
                          Switch to {exam.shortLabel}
                        </Button>
                      ))}
                    </div>
                  </div>
                  {otherSubjects.length > 0 ? (
                    <div className="border-t border-line pt-2.5">
                      <p className="text-[10.5px] font-semibold uppercase tracking-wider text-muted">
                        Subjects outside {preferredExam}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {otherSubjects.map((other) => (
                          <button
                            key={`other-subj-${other.id}`}
                            type="button"
                            onClick={() => chooseSubject(other.id)}
                            className={cn(
                              'rounded-lg border px-2.5 py-1 text-[11.5px] font-medium transition',
                              subjectId === other.id
                                ? 'border-brand bg-brand-soft text-brand-ink'
                                : 'border-line bg-surface text-ink-soft hover:border-line-strong',
                            )}
                          >
                            {lang === 'hi' ? subjectShortHindi(other.id) : other.short} ({other.chapters.length} ch)
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </section>

          <section className="card p-4 sm:p-5">
            <StepHeading
              n="2"
              title={copy.practice.chapter}
              hint={copy.practice.inSubject(
                activeSubject.chapters.length,
                lang === 'hi' ? subjectShortHindi(activeSubject.id) : activeSubject.short,
              )}
            />
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {activeSubject.chapters.map((item) => {
                const active = item.id === chapter?.id
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
                          {item.title[lang]}
                        </span>
                        {active && item.attempts && item.attempts >= 3 && (item.accuracy ?? 0) < 72 ? (
                          <span className="shrink-0 rounded-full bg-brand px-1.5 py-0.5 text-[8.5px] font-semibold text-white">
                            {copy.practice.practiseNext}
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-0.5 block text-[10.5px] leading-relaxed text-muted">
                        {notReady
                          ? copy.practice.inReview
                          : item.attempts && item.attempts >= 3
                            ? copy.practice.attemptsMeta(item.attempts, item.accuracy ?? 0, count)
                            : item.attempts
                              ? copy.practice.attemptMeta(item.attempts, count)
                              : copy.practice.notStartedMeta(count)}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
            {pool.length === 0 ? (
              <p className="mt-3 flex items-start gap-2 rounded-lg bg-warning-soft px-3 py-2 text-[11.5px] leading-relaxed text-warning">
                <Info size={13} className="mt-0.5 shrink-0" />
                {copy.practice.inReviewBody}
              </p>
            ) : null}
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            <section className="card p-4 sm:p-5">
              <StepHeading n="3" title={copy.practice.length} />
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
                      {value === pool.length ? copy.practice.allQuestions(value) : copy.practice.questions(value)}
                    </button>
                  )
                })}
              </div>
              <p className="mt-2.5 text-[11px] leading-relaxed text-muted">
                {pool.length ? copy.practice.poolMeta(pool.length) : copy.practice.noQuestions}
              </p>
            </section>

            <section className="card p-4 sm:p-5">
              <StepHeading n="4" title={copy.practice.language} />
              <Segmented
                ariaLabel={copy.practice.language}
                className="mt-3"
                value={lang}
                onChange={setLang}
                options={[
                  { value: 'en', label: copy.practice.english },
                  { value: 'hi', label: copy.practice.hindi },
                ]}
              />
              <p className="mt-2.5 flex items-start gap-2 text-[11px] leading-relaxed text-muted">
                <Languages size={12} className="mt-0.5 shrink-0" />
                {copy.practice.switchNote}
              </p>
            </section>
          </div>
        </div>

        <aside className="xl:sticky xl:top-24 xl:self-start">
          <div className="card overflow-hidden">
            <div className="border-b border-line px-4 py-3">
              <p className="label">{copy.practice.yourSprint}</p>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    'grid h-9 w-9 place-items-center rounded-lg font-display text-[10.5px] font-bold',
                    tintTile[activeSubject.tint],
                  )}
                >
                  {activeSubject.code}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium">{chapter?.title[lang]}</p>
                  <p className="text-[11px] text-muted">
                    {lang === 'hi' ? subjectShortHindi(activeSubject.id) : activeSubject.short} ·{' '}
                    {copy.practice.questions(selectedLength || 0)}
                  </p>
                </div>
              </div>

              <dl className="mt-4 space-y-2 border-t border-line pt-3 text-[12px]">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">{copy.practice.lengthRow}</dt>
                  <dd>{copy.practice.questions(selectedLength || 0)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">{copy.practice.timeRow}</dt>
                  <dd>
                    {copy.practice.aboutMin(
                      Math.max(
                        3,
                        Math.round(
                          ((chapter?.minutes ?? 10) / Math.max(1, pool.length)) *
                            Math.max(1, selectedLength),
                        ),
                      ),
                    )}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">{copy.practice.languageRow}</dt>
                  <dd>{lang === 'en' ? copy.practice.english : copy.practice.hindi}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">{copy.practice.checkingRow}</dt>
                  <dd>{copy.practice.afterEach}</dd>
                </div>
              </dl>

              <Button
                className="mt-4 w-full"
                size="lg"
                disabled={!canStart || !chapter}
                onClick={() => chapter && navigate(`/app/practice/${chapter.slug}?len=${selectedLength}`)}
              >
                {copy.practice.start} <ArrowRight size={15} />
              </Button>

              {chapter ? (
                <Link
                  to={`/subjects/${activeSubject.slug}/${chapter.slug}`}
                  className="mt-2 flex items-center justify-center gap-1.5 text-[11.5px] text-muted hover:text-ink"
                >
                  <BookOpen size={12} /> {copy.practice.readPrimer}
                </Link>
              ) : null}

              <p className="mt-4 flex items-start gap-2 border-t border-line pt-3 text-[10.5px] leading-relaxed text-muted">
                <Lock size={12} className="mt-0.5 shrink-0" />
                {copy.practice.saved}
              </p>
            </div>
          </div>

          <div className="card mt-3 p-4">
            <p className="text-[11.5px] font-medium">{copy.practice.howLabel}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted">
              {copy.practice.howLabelBody}
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
