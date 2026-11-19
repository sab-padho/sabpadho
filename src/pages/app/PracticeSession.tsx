import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Check,
  ChevronLeft,
  Flag,
  Lightbulb,
  RotateCcw,
  X,
} from 'lucide-react'
import { Badge, Button, ButtonLink, ProgressBar } from '../../components/ui'
import { AccuracyRing } from '../../components/charts'
import { allChapters, subjectById } from '../../data/subjects'
import { questionsForChapter } from '../../data/questions'
import { tintTile } from '../../components/subject-tint'
import { cn, clamp } from '../../lib/utils'
import { useLocalStorage, usePageTitle } from '../../lib/hooks'
import { useLang } from '../../lib/lang'
import { useCopy, subjectShortHindi } from '../../lib/ui-copy'
import { useShelf, useExtraRevision, formatSavedOn } from '../../lib/shelf'
import { useToast } from '../../lib/toast'
import { LangToggle } from '../../components/brand'

export function PracticeSession() {
  const { chapterSlug = '' } = useParams()
  const [searchParams] = useSearchParams()
  const { lang } = useLang()
  const copy = useCopy()
  const { notify } = useToast()
  const shelf = useShelf()
  const extraRevision = useExtraRevision()

  const chapter = allChapters.find(
    (item) => item.slug === chapterSlug && questionsForChapter(item.id).length > 0,
  )
  const subject = chapter ? subjectById[chapter.subjectId] : undefined
  usePageTitle(chapter ? `${chapter.title[lang]} · ${copy.practice.backPractice}` : copy.practice.backPractice)

  const pool = useMemo(() => (chapter ? questionsForChapter(chapter.id) : []), [chapter])
  const requested = Number(searchParams.get('len')) || 5
  const session = useMemo(
    () => pool.slice(0, clamp(requested, 1, pool.length || 1)),
    [pool, requested],
  )

  const [index, setIndex] = useState(0)
  const [autoExplain] = useLocalStorage('sabpadho-auto-explain', true)
  const [revealReasoning, setRevealReasoning] = useState(false)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [marked, setMarked] = useState<string[]>([])
  const [finished, setFinished] = useState(false)
  const [showReview, setShowReview] = useState(false)

  const question = session[index]
  const selected = question ? answers[question.id] : undefined
  const isChecked = question ? Boolean(checked[question.id]) : false
  const isCorrect = question && selected === question.correct
  const answeredCount = Object.keys(answers).length
  const lastQuestion = index === session.length - 1

  useEffect(() => {
    setRevealReasoning(false)
  }, [question?.id])

  const results = session.map((item) => {
    const pick = answers[item.id]
    return {
      question: item,
      pick,
      correct: pick === item.correct,
      attempted: pick !== undefined,
    }
  })
  const correctCount = results.filter((item) => item.correct).length
  const accuracy = session.length ? Math.round((correctCount / session.length) * 100) : 0
  const missed = results.filter((item) => item.attempted && !item.correct).map((item) => item.question.id)

  useEffect(() => {
    if (!finished || missed.length === 0) return
    extraRevision.addMany(missed)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (finished) return
      if (!question) return
      if (event.key >= '1' && event.key <= '4') {
        const optionIndex = Number(event.key) - 1
        if (optionIndex < question.options.en.length && !isChecked) {
          setAnswers((current) => ({ ...current, [question.id]: optionIndex }))
        }
      }
      if (event.key === 'Enter') {
        if (!isChecked && selected !== undefined) {
          setChecked((current) => ({ ...current, [question.id]: true }))
        } else if (isChecked && !lastQuestion) {
          setIndex((current) => current + 1)
    setRevealReasoning(false)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [finished, question, isChecked, selected, lastQuestion])

  if (!chapter || !subject || !question) {
    return (
      <div className="card mx-auto max-w-md p-6 text-center">
        <p className="text-[15px] font-semibold">{copy.practice.notAvailableTitle}</p>
        <p className="mt-1.5 text-[12.5px] text-muted">
          {copy.practice.notAvailableBody}
        </p>
        <ButtonLink to="/app/practice" className="mt-4">
          {copy.practice.chooseChapter}
        </ButtonLink>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/app/practice"
            className="inline-flex items-center gap-1.5 text-[12px] text-muted hover:text-ink"
          >
            <ArrowLeft size={14} /> {copy.practice.backSetup}
          </Link>
          <LangToggle />
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
            <div>
              <p className="label">{copy.practice.sprintComplete}</p>
              <p className="mt-1 text-[13px] font-medium">
                {chapter.title[lang]} · {lang === 'hi' ? subjectShortHindi(subject.id) : subject.short}
              </p>
            </div>
            <Badge tone={accuracy >= 70 ? 'positive' : accuracy >= 40 ? 'warning' : 'negative'}>
              {accuracy >= 70 ? copy.practice.holdingUp : accuracy >= 40 ? copy.practice.needsLook : copy.practice.roughStart}
            </Badge>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="flex justify-center">
              <AccuracyRing
                value={accuracy}
                label={copy.practice.thisSprint}
                size={132}
                tone={accuracy >= 70 ? 'positive' : 'brand'}
              />
            </div>
            <div>
              <dl className="grid grid-cols-3 gap-2">
                {[
                  { label: copy.practice.correctLabel, value: correctCount, tone: 'text-positive' },
                  { label: copy.practice.wrong, value: missed.length, tone: 'text-negative' },
                  {
                    label: copy.practice.unattempted,
                    value: session.length - answeredCount,
                    tone: 'text-muted',
                  },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg border border-line bg-surface-2/60 px-2.5 py-2">
                    <dt className="text-[10px] text-muted">{item.label}</dt>
                    <dd className={cn('num mt-0.5 text-[17px] font-semibold', item.tone)}>
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 flex items-start gap-2 text-[11.5px] leading-relaxed text-muted">
                <RotateCcw size={13} className="mt-0.5 shrink-0 text-brand" />
                {missed.length
                  ? copy.practice.missedReturn(missed.length)
                  : copy.practice.nothingRevisit}
                {accuracy < 40 ? (
                  <Link to={`/subjects/${subject.slug}/${chapter.slug}`} className="link-underline shrink-0 text-brand-ink">
                    {copy.practice.readPrimerLink}
                  </Link>
                ) : null}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Button size="sm" onClick={() => setShowReview((value) => !value)}>
                  {showReview ? copy.practice.hideAnswers : copy.practice.reviewAnswers}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setIndex(0)
                    setAnswers({})
                    setChecked({})
                    setMarked([])
                    setFinished(false)
                    setShowReview(false)
                  }}
                >
                  {copy.practice.tryAgain}
                </Button>
                <ButtonLink to="/app/revision" variant="secondary" size="sm">
                  {copy.practice.queue}
                </ButtonLink>
              </div>
            </div>
          </div>

          {showReview ? (
            <ul className="divide-y divide-line border-t border-line">
              {results.map((item) => (
                <li key={item.question.id} className="px-5 py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[12.5px] leading-relaxed text-ink">
                      {item.question.prompt[lang]}
                    </p>
                    <Badge tone={item.correct ? 'positive' : item.attempted ? 'negative' : 'neutral'}>
                      {item.correct ? copy.practice.correct : item.attempted ? copy.practice.wrong : copy.practice.leftBlank}
                    </Badge>
                  </div>
                  <p className="mt-2 text-[11.5px] text-muted">
                    {copy.practice.correctAnswer}:{' '}
                    <span className="font-medium text-ink-soft">
                      {item.question.options[lang][item.question.correct]}
                    </span>
                    {item.attempted && !item.correct ? (
                      <>{copy.practice.youPicked(item.question.options[lang][item.pick as number])}</>
                    ) : null}
                  </p>
                  <p className="mt-1.5 rounded-lg bg-surface-2/70 px-2.5 py-2 text-[11.5px] leading-relaxed text-muted">
                    {item.question.explanation[lang]}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <ButtonLink to="/app" variant="ghost" size="sm">
            <ChevronLeft size={14} /> {copy.practice.studyDesk}
          </ButtonLink>
          <ButtonLink to="/app/practice" size="sm">
            {copy.practice.anotherSprint} <ArrowRight size={14} />
          </ButtonLink>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
        <Link
          to="/app/practice"
          className="inline-flex items-center gap-1.5 text-muted transition hover:text-ink"
        >
          <ArrowLeft size={14} /> {copy.practice.backPractice}
        </Link>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-positive">
            <Check size={12} /> {answeredCount > 0 ? copy.practice.answerSaved : copy.practice.answersSave}
          </span>
          <LangToggle />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2.5">
        <span
          className={cn(
            'grid h-8 w-8 place-items-center rounded-lg font-display text-[10px] font-bold',
            tintTile[subject.tint],
          )}
        >
          {subject.code}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-medium">{chapter.title[lang]} · {copy.practice.sprintWord}</p>
          <p className="text-[11px] text-muted">
            {copy.practice.questionOf(index + 1, session.length, subject.name[lang])}
          </p>
        </div>
        <Link
          to={`/subjects/${subject.slug}/${chapter.slug}`}
          className="hidden text-[11px] text-muted hover:text-ink sm:inline"
        >
          {copy.practice.examPrimer}
        </Link>
      </div>

      <div className="mt-2.5">
        <ProgressBar value={(answeredCount / session.length) * 100} height={4} label={copy.practice.sprintProgress} />
      </div>

      <div className="card mt-4 overflow-hidden">
        <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
          <p className="label">
            {copy.practice.question(index + 1, session.length)} · {chapter.title[lang]}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted">{question.difficulty}</span>
          </div>
        </div>

        <div className="px-4 py-4 sm:px-5">
          <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink">
            {question.prompt[lang]}
          </p>

          <div className="mt-4 space-y-2">
            {question.options[lang].map((option, optionIndex) => {
              const isSelected = selected === optionIndex
              const showCorrect = isChecked && optionIndex === question.correct
              const showWrong = isChecked && isSelected && optionIndex !== question.correct
              return (
                <button
                  key={`${question.id}-${optionIndex}`}
                  type="button"
                  disabled={selected !== undefined && isChecked}
                  onClick={() =>
                    setAnswers((current) => ({ ...current, [question.id]: optionIndex }))
                  }
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-[13.5px] transition',
                    showCorrect
                      ? 'border-positive/35 bg-positive-soft text-ink'
                      : showWrong
                        ? 'border-negative/35 bg-negative-soft text-ink'
                        : isSelected
                          ? 'border-brand bg-brand-soft text-brand-ink'
                          : 'border-line bg-surface text-ink-soft hover:border-line-strong hover:bg-surface-2/60',
                  )}
                >
                  <span
                    className={cn(
                      'grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[10.5px] font-semibold',
                      showCorrect
                        ? 'border-positive bg-positive text-white'
                        : showWrong
                          ? 'border-negative bg-negative text-white'
                          : isSelected
                            ? 'border-brand bg-brand text-white'
                            : 'border-line text-muted',
                    )}
                  >
                    {showCorrect ? <Check size={12} /> : showWrong ? <X size={12} /> : 'ABCD'[optionIndex]}
                  </span>
                  <span className="flex-1">{option}</span>
                  {isSelected && !isChecked ? (
                    <span className="text-[10px] font-medium text-brand-ink">{copy.practice.yourAnswer}</span>
                  ) : null}
                </button>
              )
            })}
          </div>

          {isChecked ? (
            <div
              className={cn(
                'mt-4 rounded-xl border p-3.5',
                isCorrect
                  ? 'border-positive/25 bg-positive-soft/70'
                  : 'border-negative/20 bg-negative-soft/60',
              )}
            >
              <p
                className={cn(
                  'flex items-center gap-1.5 text-[12px] font-semibold',
                  isCorrect ? 'text-positive' : 'text-negative',
                )}
              >
                {isCorrect ? <Check size={13} /> : <X size={13} />}
                {isCorrect
                  ? copy.practice.correct
                  : selected === undefined
                    ? copy.practice.attempted
                    : copy.practice.notQuiteAnswer('ABCD'[question.correct])}
                <span className="font-normal text-ink-soft">
                  · {question.options[lang][question.correct]}
                </span>
              </p>
              {autoExplain || revealReasoning ? (
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">
                  {question.explanation[lang]}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => setRevealReasoning(true)}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-1 text-[11px] font-medium text-ink-soft transition hover:border-line-strong"
                >
                  <Lightbulb size={12} /> {copy.practice.showReasoning}
                </button>
              )}
              {!isCorrect && selected !== undefined ? (
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-surface/70 px-2 py-1 text-[10.5px] text-muted">
                  <RotateCcw size={11} /> {copy.practice.addedRevision}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3.5">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  shelf.toggle(question.id)
                  notify(
                    shelf.has(question.id)
                      ? copy.practice.removedShelf
                      : copy.practice.savedOn(formatSavedOn()),
                    shelf.has(question.id) ? 'default' : 'success',
                  )
                }}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[11.5px] transition',
                  shelf.has(question.id) ? 'text-brand-ink' : 'text-muted hover:text-ink',
                )}
              >
                {shelf.has(question.id) ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
                {shelf.has(question.id) ? copy.practice.savedShelf : copy.practice.saveShelf}
              </button>
              <span className="hidden text-[10px] text-muted sm:inline">·</span>
              <button
                type="button"
                onClick={() => {
                  setMarked((current) =>
                    current.includes(question.id)
                      ? current.filter((id) => id !== question.id)
                      : [...current, question.id],
                  )
                }}
                className={cn(
                  'hidden items-center gap-1.5 rounded-md px-1.5 py-1 text-[11.5px] transition sm:inline-flex',
                  marked.includes(question.id) ? 'text-gold' : 'text-muted hover:text-ink',
                )}
              >
                <Flag size={13} />
                {marked.includes(question.id) ? copy.practice.marked : copy.practice.markReview}
              </button>
            </div>

            <div className="flex items-center gap-2">
              {index > 0 ? (
                <Button variant="ghost" size="sm" onClick={() => setIndex((current) => current - 1)}>
                  <ChevronLeft size={14} /> {copy.practice.back}
                </Button>
              ) : null}

              {!isChecked ? (
                <Button
                  size="sm"
                  disabled={selected === undefined}
                  onClick={() =>
                    setChecked((current) => ({ ...current, [question.id]: true }))
                  }
                >
                  {copy.practice.check} <Lightbulb size={14} />
                </Button>
              ) : lastQuestion ? (
                <Button
                  size="sm"
                  onClick={() => {
                    setFinished(true)
                  }}
                >
                  {copy.practice.finish} <Check size={14} />
                </Button>
              ) : (
                <Button size="sm" onClick={() => setIndex((current) => current + 1)}>
                  {copy.practice.next} <ArrowRight size={14} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          {session.map((item, sessionIndex) => {
            const state = checked[item.id]
              ? answers[item.id] === item.correct
                ? 'correct'
                : 'wrong'
              : answers[item.id] !== undefined
                ? 'answered'
                : 'blank'
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setIndex(sessionIndex)}
                aria-label={copy.practice.goTo(sessionIndex + 1)}
                aria-current={sessionIndex === index}
                className={cn(
                  'grid h-6 w-6 place-items-center rounded-[5px] border text-[10px] font-medium transition',
                  state === 'correct' && 'border-positive/30 bg-positive-soft text-positive',
                  state === 'wrong' && 'border-negative/30 bg-negative-soft text-negative',
                  state === 'answered' && 'border-brand/30 bg-brand-soft text-brand-ink',
                  state === 'blank' && 'border-line bg-surface text-muted',
                  sessionIndex === index && 'ring-2 ring-brand/40 ring-offset-1 ring-offset-canvas',
                )}
              >
                {sessionIndex + 1}
              </button>
            )
          })}
        </div>
        <p className="text-[10.5px] text-muted">{copy.practice.tip}</p>
      </div>

      <p className="mt-5 text-[10.5px] leading-relaxed text-muted">{copy.practice.previewNote}</p>
    </div>
  )
}
