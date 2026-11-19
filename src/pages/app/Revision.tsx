import { useMemo, useState } from 'react'
import {
  ArrowRight,
  CalendarCheck,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  RotateCcw,
  X,
} from 'lucide-react'
import { Badge, Button, ButtonLink, Dialog, EmptyState, SectionLabel } from '../../components/ui'
import { LangToggle } from '../../components/brand'
import { revisionQueue, revisionWeek } from '../../data/learner'
import { chapterById, subjectById } from '../../data/subjects'
import { questionById } from '../../data/questions'
import { useExtraRevision, useRevisionDone } from '../../lib/shelf'
import { useLang } from '../../lib/lang'
import {
  useCopy,
  chapterHindi,
  lastSeenLabel,
  subjectShortByLabel,
  weekdayShort,
} from '../../lib/ui-copy'
import { useToast } from '../../lib/toast'
import { usePageTitle } from '../../lib/hooks'
import { cn } from '../../lib/utils'

type QueueItem = {
  questionId: string
  chapter: string
  subject: string
  lastSeen: string
  extra?: boolean
}

export function Revision() {
  const { done, markDone } = useRevisionDone()
  const { lang } = useLang()
  const copy = useCopy()
  usePageTitle(copy.nav.revision)
  const extra = useExtraRevision()
  const { notify } = useToast()
  const [selectedDay, setSelectedDay] = useState('19')
  const [retryId, setRetryId] = useState<string | null>(null)

  const queue = useMemo<QueueItem[]>(() => {
    const base: QueueItem[] = revisionQueue.map((item) => ({ ...item, extra: false }))
    const extras: QueueItem[] = extra.ids
      .filter((id) => !revisionQueue.some((item) => item.questionId === id))
      .map((id) => {
        const question = questionById(id)
        const chapter = question ? chapterById(question.chapterId) : undefined
        const subject = chapter ? subjectById[chapter.subjectId] : undefined
        return {
          questionId: id,
          chapter: chapter?.title[lang] ?? copy.revision.practiceWord,
          subject: subject
            ? lang === 'hi'
              ? subjectShortByLabel(lang, subject.short)
              : subject.short
            : copy.revision.mixedWord,
          lastSeen: copy.revision.fromSprint,
          extra: true,
        }
      })
    return [...extras, ...base].filter((item) => !done.includes(item.questionId))
  }, [done, extra.ids, copy.revision.fromSprint, copy.revision.mixedWord, copy.revision.practiceWord, lang])

  const today = revisionWeek.find((day) => day.today)!
  const activeDay = revisionWeek.find((day) => day.date === selectedDay) ?? today
  const isToday = activeDay.date === today.date

  function handleReviewed(questionId: string, correct: boolean) {
    markDone(questionId)
    setRetryId(null)
    notify(correct ? copy.revision.correctToast : copy.revision.missedToast, correct ? 'success' : 'default')
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <SectionLabel>{copy.revision.label}</SectionLabel>
          <h1 className="mt-1.5 text-[26px] font-semibold leading-tight sm:text-[30px]">
            {copy.revision.title}
          </h1>
          <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-muted">
            {copy.revision.intro}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="neutral">
            <Clock size={11} /> {copy.revision.dueBadge(queue.length)}
          </Badge>
          {queue.length ? (
            <Button size="sm" onClick={() => setRetryId(queue[0].questionId)}>
              <RotateCcw size={13} /> {copy.revision.startRevision}
            </Button>
          ) : null}
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr] xl:items-start">
        <div className="space-y-4">
          <section className="card p-3 sm:p-4">
            <div className="flex items-center justify-between px-1">
              <p className="text-[11.5px] font-medium text-ink-soft">{copy.revision.thisWeek}</p>
              <span className="text-[10px] text-muted">{copy.revision.duePerDay}</span>
            </div>
            <div className="mt-2.5 grid grid-cols-6 gap-1.5">
              {revisionWeek.map((day) => {
                const active = day.date === selectedDay
                return (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => setSelectedDay(day.date)}
                    aria-pressed={active}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-lg border px-1 py-2 transition',
                      active
                        ? 'border-brand bg-brand-soft text-brand-ink'
                        : 'border-line bg-surface text-ink-soft hover:border-line-strong',
                    )}
                  >
                    <span
                      className={cn(
                        'text-[9.5px] uppercase tracking-wide',
                        active ? 'text-brand-ink/70' : 'text-muted',
                      )}
                    >
                      {weekdayShort(lang, day.day)}
                    </span>
                    <span className="num text-[15px] font-semibold leading-none">{day.date}</span>
                    <span
                      className={cn(
                        'text-[9px]',
                        day.due === 0 ? 'text-muted' : active ? 'text-brand-ink' : 'text-ink-soft',
                      )}
                    >
                      {day.due === 0 ? copy.revision.clear : copy.revision.dueN(day.due)}
                    </span>
                  </button>
                )
              })}
            </div>
            <p className="mt-2 px-1 text-[10px] text-muted">
              {copy.revision.todayLine}
            </p>
          </section>

          {isToday ? (
            <section className="card overflow-hidden">
              <div className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-5">
                <div>
                  <p className="text-[14px] font-semibold">{copy.revision.dueToday}</p>
                  <p className="mt-0.5 text-[11px] text-muted">
                    {copy.revision.origPrompts}
                  </p>
                </div>
                <Badge tone="brand">{copy.revision.questionsN(queue.length)}</Badge>
              </div>

              {queue.length === 0 ? (
                <EmptyState
                  icon={<CalendarCheck size={18} />}
                  title={copy.revision.caughtUp}
                  body={copy.revision.caughtUpBody}
                  action={
                    <div className="flex flex-wrap justify-center gap-2">
                      <ButtonLink to="/app/practice" size="sm">
                        {copy.revision.startSprint} <ArrowRight size={13} />
                      </ButtonLink>
                      <Button variant="secondary" size="sm" onClick={() => setSelectedDay('20')}>
                        {copy.revision.seeFriday}
                      </Button>
                    </div>
                  }
                />
              ) : (
                <ul className="divide-y divide-line">
                  {queue.map((item) => {
                    const question = questionById(item.questionId)
                    return (
                      <li key={item.questionId} className="flex flex-wrap items-start gap-3 px-4 py-3.5 sm:px-5">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[12.5px] font-medium text-ink">
                              {lang === 'hi' && !item.extra ? chapterHindi(item.chapter) : item.chapter}
                            </p>
                            <span className="text-[10px] text-muted">
                              {item.extra ? item.subject : subjectShortByLabel(lang, item.subject)}
                            </span>
                            {item.extra ? (
                              <Badge tone="brand">{copy.revision.new}</Badge>
                            ) : null}
                          </div>
                          <p className="mt-1 line-clamp-2 text-[11.5px] leading-relaxed text-muted">
                            {question ? question.prompt[lang] : copy.revision.previewMissing}
                          </p>
                          <p className="mt-1 text-[10px] text-muted">
                            {copy.revision.prevHidden(
                              item.extra ? item.lastSeen : lastSeenLabel(lang, item.lastSeen),
                            )}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <Button size="sm" variant="secondary" onClick={() => setRetryId(item.questionId)}>
                            {copy.revision.retry} <ArrowRight size={12} />
                          </Button>
                          <button
                            type="button"
                            onClick={() => {
                              markDone(item.questionId)
                              notify(copy.revision.markedReviewed)
                            }}
                            className="grid h-8 w-8 place-items-center rounded-md text-muted transition hover:bg-surface-2 hover:text-ink"
                            aria-label={copy.revision.markReviewed(item.chapter)}
                          >
                            <Check size={14} />
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}

              {queue.length ? (
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-surface-2/40 px-4 py-3 sm:px-5">
                  <p className="text-[10.5px] text-muted">
                    {copy.revision.gradedNote}
                  </p>
                  <ButtonLink
                    to={`/app/practice/${chapterById(questionById(queue[0].questionId)?.chapterId ?? '')?.slug ?? 'percentages'}`}
                    variant="ghost"
                    size="sm"
                  >
                    {copy.revision.openPractice} <ArrowRight size={12} />
                  </ButtonLink>
                </div>
              ) : null}
            </section>
          ) : (
            <section className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="label">{copy.revision.scheduled(weekdayShort(lang, activeDay.day), activeDay.date)}</p>
                  <p className="mt-2 text-[15px] font-semibold">
                    {activeDay.due === 0
                      ? copy.revision.nothingDue
                      : copy.revision.queuedFor(activeDay.due)}
                  </p>
                  <p className="mt-1.5 max-w-md text-[12.5px] leading-relaxed text-muted">
                    {activeDay.due === 0 ? copy.revision.clearDay : copy.revision.onlyToday}
                  </p>
                </div>
                <CalendarCheck size={20} className="shrink-0 text-muted" />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => setSelectedDay(today.date)}>
                  {copy.revision.backToday}
                </Button>
                <ButtonLink to="/app/practice" size="sm" variant="ghost">
                  Start a sprint <ArrowRight size={13} />
                </ButtonLink>
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-3">
          <div className="card p-4">
            <p className="label">{copy.revision.howScheduled}</p>
            <ul className="mt-3 space-y-2.5 text-[12px] text-ink-soft">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-positive" />
                {copy.revision.correctRetry}
              </li>
              <li className="flex items-start gap-2">
                <RotateCcw size={14} className="mt-0.5 shrink-0 text-negative" />
                {copy.revision.missedRetry}
              </li>
            </ul>
            <div className="mt-3 border-t border-line pt-3">
              <p className="text-[10.5px] text-muted">{copy.revision.typical}</p>
              <div className="mt-2 flex items-center gap-1 text-[10px]">
                {(lang === 'hi' ? ['1 दिन', '3 दिन', '7 दिन', '16 दिन'] : ['1 day', '3 days', '7 days', '16 days']).map((step, index) => (
                  <span key={step} className="flex items-center gap-1">
                    <span className="rounded-md border border-line bg-surface-2 px-1.5 py-0.5 text-ink-soft">
                      {step}
                    </span>
                    {index < 3 ? <ChevronRight size={11} className="text-muted" /> : null}
                  </span>
                ))}
              </div>
            </div>
            <p className="mt-3 text-[10.5px] leading-relaxed text-muted">
              {copy.revision.intervalsGrow}
            </p>
          </div>

          <div className="card p-4">
            <p className="label">{copy.revision.comingUp}</p>
            <ul className="mt-2.5 space-y-2">
              {revisionWeek
                .filter((day) => !day.today && day.due > 0)
                .slice(0, 3)
                .map((day) => (
                  <li key={day.date} className="flex items-center justify-between gap-2">
                    <span className="text-[11.5px] text-ink-soft">
                      {copy.revision.dayDue(weekdayShort(lang, day.day), day.date)}
                    </span>
                    <span className="text-[10.5px] text-muted">{copy.revision.dueN(day.due)}</span>
                  </li>
                ))}
            </ul>
            <p className="mt-3 border-t border-line pt-2.5 text-[10.5px] leading-relaxed text-muted">
              {copy.revision.emptyDay}
            </p>
          </div>

          <div className="rounded-xl border border-dashed border-line bg-surface-2/40 p-4">
            <p className="text-[11.5px] font-medium">{copy.revision.whyHidden}</p>
            <p className="mt-1 text-[10.5px] leading-relaxed text-muted">
              {copy.revision.whyHiddenBody}
            </p>
          </div>
        </aside>
      </div>

      {retryId ? (
        <RetryDialog
          questionId={retryId}
          onClose={() => setRetryId(null)}
          onReviewed={(correct) => handleReviewed(retryId, correct)}
        />
      ) : null}

      <p className="px-1 text-[10px] text-muted">
        {copy.revision.previewQueue(revisionQueue.length)}{' '}
        {done.length ? copy.revision.markedN(done.length) : ''}
      </p>
    </div>
  )
}

function RetryDialog({
  questionId,
  onClose,
  onReviewed,
}: {
  questionId: string
  onClose: () => void
  onReviewed: (correct: boolean) => void
}) {
  const { lang } = useLang()
  const copy = useCopy()
  const question = questionById(questionId)
  const chapter = question ? chapterById(question.chapterId) : undefined
  const [picked, setPicked] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)

  if (!question) return null
  const correct = picked === question.correct

  return (
    <Dialog
      open
      onClose={onClose}
      title={chapter ? copy.revision.retryTitle(chapter.title[lang]) : copy.revision.retryFallback}
      description={copy.revision.retryDesc}
      width="max-w-lg"
    >
      <div className="flex items-center justify-between">
        <Badge tone="outline">{copy.revision.retryBadge}</Badge>
        <LangToggle />
      </div>

      <p className="mt-3 text-[13.5px] leading-relaxed text-ink">{question.prompt[lang]}</p>

      <div className="mt-3 space-y-1.5">
        {question.options[lang].map((option, index) => {
          const isPicked = picked === index
          const showCorrect = checked && index === question.correct
          const showWrong = checked && isPicked && index !== question.correct
          return (
            <button
              key={`${question.id}-${index}`}
              type="button"
              disabled={checked}
              onClick={() => setPicked(index)}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left text-[12.5px] transition',
                showCorrect
                  ? 'border-positive/35 bg-positive-soft text-ink'
                  : showWrong
                    ? 'border-negative/35 bg-negative-soft text-ink'
                    : isPicked
                      ? 'border-brand bg-brand-soft text-brand-ink'
                      : 'border-line bg-surface text-ink-soft hover:border-line-strong',
              )}
            >
              <span
                className={cn(
                  'grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] font-semibold',
                  showCorrect
                    ? 'border-positive bg-positive text-white'
                    : showWrong
                      ? 'border-negative bg-negative text-white'
                      : isPicked
                        ? 'border-brand bg-brand text-white'
                        : 'border-line text-muted',
                )}
              >
                {showCorrect ? <Check size={11} /> : showWrong ? <X size={11} /> : 'ABCD'[index]}
              </span>
              {option}
            </button>
          )
        })}
      </div>

      {checked ? (
        <div
          className={cn(
            'mt-3 rounded-lg border p-3',
            correct ? 'border-positive/25 bg-positive-soft/70' : 'border-negative/20 bg-negative-soft/60',
          )}
        >
          <p className={cn('flex items-center gap-1.5 text-[11.5px] font-semibold', correct ? 'text-positive' : 'text-negative')}>
            {correct ? <Check size={12} /> : <X size={12} />}
            {correct ? copy.revision.correctThisTime : copy.revision.notYet(question.options[lang][question.correct])}
          </p>
          <p className="mt-1 text-[11.5px] leading-relaxed text-ink-soft">
            {question.explanation[lang]}
          </p>
        </div>
      ) : null}

      <div className="mt-4 flex justify-end gap-2">
        {!checked ? (
          <>
            <Button variant="ghost" onClick={onClose}>
              {copy.revision.leaveNow}
            </Button>
            <Button disabled={picked === null} onClick={() => setChecked(true)}>
              {copy.revision.checkAnswer}
            </Button>
          </>
        ) : (
          <Button onClick={() => onReviewed(correct)}>
            {copy.revision.markReviewedBtn} <ArrowRight size={14} />
          </Button>
        )}
      </div>
    </Dialog>
  )
}
