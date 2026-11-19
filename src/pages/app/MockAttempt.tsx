import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  Clock,
  Flag,
  Grid2x2,
  Send,
} from 'lucide-react'
import { Button, ButtonLink, Dialog } from '../../components/ui'
import { LangToggle, ThemeToggle } from '../../components/brand'
import { getMock, type MockPaper } from '../../data/mocks'
import { questionById } from '../../data/questions'
import { clearAttempt, loadAttempt, saveAttempt, saveResult } from '../../lib/attempt'
import { cn, formatClock } from '../../lib/utils'
import { usePageTitle } from '../../lib/hooks'
import { useLang } from '../../lib/lang'
import { useCopy, localDate, sectionName, sectionShort } from '../../lib/ui-copy'
import { useToast } from '../../lib/toast'

export function MockAttempt() {
  const { mockId = '' } = useParams()
  const paper = getMock(mockId)
  const { lang } = useLang()
  const copy = useCopy()
  usePageTitle(paper ? copy.attempt.title(paper.title) : copy.attempt.fallback)

  if (!paper) {
    return (
      <div className="card mx-auto max-w-md p-6 text-center">
        <p className="text-[15px] font-semibold">{copy.attempt.notAvailableTitle}</p>
        <p className="mt-1.5 text-[12.5px] text-muted">{copy.attempt.notAvailableBody}</p>
        <ButtonLink to="/app/mocks" className="mt-4">
          Back to mocks
        </ButtonLink>
      </div>
    )
  }

  if (paper.status === 'scheduled') {
    return (
      <div className="card mx-auto max-w-md p-6 text-center">
        <p className="text-[15px] font-semibold">{copy.attempt.notOpenTitle}</p>
        <p className="mt-1.5 text-[12.5px] text-muted">{paper.opensOn ? copy.attempt.opensBody(localDate(lang, paper.opensOn)) : null}</p>
        <ButtonLink to="/app/mocks" className="mt-4">
          Back to mocks
        </ButtonLink>
      </div>
    )
  }

  if (!paper.sections.some((section) => section.questionIds.length > 0)) {
    return (
      <div className="card mx-auto max-w-md p-6 text-center">
        <p className="text-[15px] font-semibold">{copy.attempt.alreadyTitle}</p>
        <p className="mt-1.5 text-[12.5px] text-muted">
          {copy.attempt.alreadyBody}
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <ButtonLink to={`/app/mocks/${paper.id}/result`}>{copy.attempt.viewResult}</ButtonLink>
          <ButtonLink to="/app/mocks" variant="secondary">
            {copy.attempt.backToMocks}
          </ButtonLink>
        </div>
      </div>
    )
  }

  return <AttemptRunner paper={paper} />
}

function AttemptRunner({ paper }: { paper: MockPaper }) {
  const navigate = useNavigate()
  const { lang } = useLang()
  const copy = useCopy()
  const { notify } = useToast()

  const [boot] = useState(() => loadAttempt(paper.id))
  const entries = useMemo(
    () =>
      paper.sections.flatMap((section) =>
        section.questionIds.map((questionId) => ({
          questionId,
          sectionId: section.id,
          sectionName: section.name,
        })),
      ),
    [paper],
  )

  const durationSeconds = paper.durationMinutes * 60
  const [answers, setAnswers] = useState<Record<string, number>>(boot?.answers ?? {})
  const [marked, setMarked] = useState<string[]>(boot?.marked ?? [])
  const [index, setIndex] = useState(() => {
    if (!boot) return 0
    return Math.min(boot.index ?? 0, entries.length - 1)
  })
  const [startedAt] = useState(boot?.startedAt ?? Date.now())
  const [now, setNow] = useState(() => Date.now())
  const [saving, setSaving] = useState(false)
  const [confirmSubmit, setConfirmSubmit] = useState(false)
  const [confirmExit, setConfirmExit] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const saveTimer = useRef<number | undefined>(undefined)
  const submitted = useRef(false)

  const remaining = Math.max(0, durationSeconds - Math.floor((now - startedAt) / 1000))
  const warning = remaining <= 120
  const currentEntry = entries[index]
  const question = questionById(currentEntry.questionId)
  const currentSectionIndex = Math.max(
    0,
    paper.sections.findIndex((section) => section.id === currentEntry.sectionId),
  )
  const answeredCount = Object.keys(answers).length
  const markedCount = marked.length

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    saveAttempt({
      paperId: paper.id,
      answers,
      marked,
      startedAt,
      durationSeconds,
      sectionIndex: currentSectionIndex,
      index,
    })
  }, [answers, marked, startedAt, durationSeconds, currentSectionIndex, index, paper.id])

  useEffect(() => {
    if (remaining > 0 || submitted.current) return
    finish(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining])

  function touchSaved() {
    setSaving(true)
    window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => setSaving(false), 500)
  }

  function finish(auto = false) {
    if (submitted.current) return
    submitted.current = true
    saveResult({
      paperId: paper.id,
      answers,
      marked,
      timeUsedSeconds: durationSeconds - remaining,
      submittedAt: new Date().toISOString(),
    })
    clearAttempt(paper.id)
    if (auto) notify(copy.attempt.timeUp)
    navigate(`/app/mocks/${paper.id}/result`, { replace: true })
  }

  function choose(optionIndex: number) {
    setAnswers((current) => ({ ...current, [currentEntry.questionId]: optionIndex }))
    touchSaved()
  }

  function clearResponse() {
    setAnswers((current) => {
      const next = { ...current }
      delete next[currentEntry.questionId]
      return next
    })
    touchSaved()
  }

  function toggleMark() {
    setMarked((current) =>
      current.includes(currentEntry.questionId)
        ? current.filter((id) => id !== currentEntry.questionId)
        : [...current, currentEntry.questionId],
    )
  }

  function go(offset: number) {
    const next = index + offset
    if (next < 0 || next >= entries.length) return
    setIndex(next)
  }

  function sectionStart(sectionId: string) {
    const found = entries.findIndex((entry) => entry.sectionId === sectionId)
    if (found >= 0) setIndex(found)
  }

  function statusOf(questionId: string) {
    const answered = answers[questionId] !== undefined
    const isMarked = marked.includes(questionId)
    if (isMarked) return answered ? 'answered-marked' : 'marked'
    return answered ? 'answered' : 'blank'
  }

  if (!question) return null

  const palette = (
    <div>
      {paper.sections.map((section, sectionIndex) => (
        <div key={section.id} className={sectionIndex > 0 ? 'mt-4' : ''}>
          <div className="flex items-center justify-between">
            <p className="text-[10.5px] font-medium text-ink-soft">{sectionName(lang, section.name)}</p>
            <span className="text-[9.5px] text-muted">
              {section.questionIds.filter((id) => answers[id] !== undefined).length}/
              {section.questionIds.length}
            </span>
          </div>
          <div className="mt-1.5 grid grid-cols-6 gap-1 sm:grid-cols-8 lg:grid-cols-5">
            {entries.map((entry, entryIndex) => {
              if (entry.sectionId !== section.id) return null
              const status = statusOf(entry.questionId)
              const current = entryIndex === index
              return (
                <button
                  key={entry.questionId}
                  type="button"
                  onClick={() => {
                    setIndex(entryIndex)
                    setPaletteOpen(false)
                  }}
                  aria-label={copy.attempt.ariaQuestion(entryIndex + 1, status.replace('-', lang === 'hi' ? ' और ' : ' and '))}
                  aria-current={current}
                  className={cn(
                    'relative grid h-7 place-items-center rounded-[5px] border text-[10.5px] font-medium transition',
                    status === 'blank' && 'border-line bg-surface text-muted hover:border-line-strong',
                    status === 'answered' && 'border-brand/25 bg-brand-soft text-brand-ink',
                    status === 'marked' && 'border-gold/40 bg-gold-soft text-gold',
                    status === 'answered-marked' && 'border-gold/40 bg-gold-soft text-gold',
                    current && 'ring-2 ring-brand ring-offset-1 ring-offset-surface',
                  )}
                >
                  {entryIndex + 1}
                  {status === 'answered-marked' ? (
                    <span className="absolute right-0 h-1 w-1 rounded-full bg-brand" />
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-line pt-3 text-[9.5px] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <i className="h-2.5 w-2.5 rounded-[3px] border border-brand/30 bg-brand-soft" /> {copy.attempt.answered}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="h-2.5 w-2.5 rounded-[3px] border border-gold/40 bg-gold-soft" /> {copy.attempt.marked}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="h-2.5 w-2.5 rounded-[3px] border border-line bg-surface" /> {copy.attempt.notAnswered}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="h-2.5 w-2.5 rounded-[3px] ring-2 ring-brand" /> {copy.attempt.current}
        </span>
      </div>
      <p className="mt-2 text-[9.5px] leading-relaxed text-muted">
        {copy.attempt.paletteNote}
      </p>
    </div>
  )

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setConfirmExit(true)}
            className="inline-flex items-center gap-1 rounded-md text-[11.5px] text-muted transition hover:text-ink"
          >
            <ArrowLeft size={14} /> {copy.attempt.exit}
          </button>
          <span className="h-3 w-px bg-line" />
          <div className="min-w-0">
            <p className="truncate text-[12px] font-medium">{paper.title}</p>
            <p className="text-[10px] text-muted">
              {copy.attempt.meta(paper.sections.length, entries.length)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LangToggle />
          <ThemeToggle className="hidden sm:inline-flex" />
          <div
            className={cn(
              'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5',
              warning ? 'border-negative/30 bg-negative-soft text-negative' : 'border-line bg-surface',
            )}
          >
            <Clock size={14} className={warning ? 'text-negative' : 'text-muted'} />
            <span className="num text-[15px] font-semibold leading-none">{formatClock(remaining)}</span>
            <span className="hidden text-[9.5px] text-muted sm:inline">{copy.attempt.left}</span>
          </div>
          <Button size="sm" onClick={() => setConfirmSubmit(true)}>
            <Send size={13} /> {copy.attempt.submit}
          </Button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1 overflow-x-auto border-b border-line pb-2">
        {paper.sections.map((section, sectionIndex) => {
          const active = sectionIndex === currentSectionIndex
          const sectionAnswered = section.questionIds.filter((id) => answers[id] !== undefined).length
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => sectionStart(section.id)}
              aria-pressed={active}
              className={cn(
                'whitespace-nowrap rounded-md px-2.5 py-1.5 text-[11.5px] transition',
                active
                  ? 'bg-brand-soft font-medium text-brand-ink'
                  : 'text-muted hover:bg-surface-2 hover:text-ink',
              )}
            >
              {sectionShort(lang, section.name)}
              <span className="ml-1.5 text-[9.5px] opacity-70">
                {sectionAnswered}/{section.questionIds.length}
              </span>
            </button>
          )
        })}
        <span className="ml-auto hidden items-center gap-1.5 pl-3 text-[10px] text-positive sm:inline-flex">
          <Check size={11} /> {copy.attempt.allSaved}
        </span>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_272px] lg:items-start">
        <div className="card flex min-h-[calc(100dvh-320px)] flex-col overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-medium text-ink-soft">
                {copy.attempt.questionOf(index + 1, entries.length)}
              </p>
              <span className="h-1 w-1 rounded-full bg-line-strong" />
              <p className="text-[10.5px] text-muted">{sectionName(lang, currentEntry.sectionName)}</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted">
              <span
                className={cn(
                  'inline-flex items-center gap-1 transition',
                  saving ? 'text-muted' : 'text-positive',
                )}
              >
                {saving ? (
                  <>
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted" /> {copy.attempt.saving}
                  </>
                ) : (
                  <>
                    <Check size={11} /> {copy.attempt.saved}
                  </>
                )}
              </span>
              <span>+2 / −0.5</span>
            </div>
          </div>

          <div className="flex-1 px-4 py-5 sm:px-5">
            <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink">
              {question.prompt[lang]}
            </p>

            <div className="mt-5 space-y-2">
              {question.options[lang].map((option, optionIndex) => {
                const selected = answers[question.id] === optionIndex
                return (
                  <button
                    key={`${question.id}-${optionIndex}`}
                    type="button"
                    onClick={() => choose(optionIndex)}
                    aria-pressed={selected}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-[13.5px] transition',
                      selected
                        ? 'border-brand bg-brand-soft text-brand-ink'
                        : 'border-line bg-surface text-ink-soft hover:border-line-strong hover:bg-surface-2/60',
                    )}
                  >
                    <span
                      className={cn(
                        'grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[10.5px] font-semibold',
                        selected
                          ? 'border-brand bg-brand text-white'
                          : 'border-line text-muted',
                      )}
                    >
                      {'ABCD'[optionIndex]}
                    </span>
                    <span className="flex-1">{option}</span>
                    {selected ? (
                      <Check size={14} className="text-brand" />
                    ) : null}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-3">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearResponse}
                disabled={answers[question.id] === undefined}
              >
                {copy.attempt.clear}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMark}
                className={marked.includes(question.id) ? 'text-gold' : undefined}
              >
                <Flag size={13} />
                {marked.includes(question.id) ? copy.attempt.markedShort : copy.attempt.markReview}
              </Button>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => go(-1)}
                disabled={index === 0}
              >
                <ChevronLeft size={14} /> {copy.attempt.previous}
              </Button>
              {index === entries.length - 1 ? (
                <Button size="sm" onClick={() => setConfirmSubmit(true)}>
                  {copy.attempt.reviewSubmit} <ArrowRight size={14} />
                </Button>
              ) : (
                <Button size="sm" onClick={() => go(1)}>
                  {copy.attempt.saveNext} <ArrowRight size={14} />
                </Button>
              )}
            </div>
          </div>
        </div>

        <aside className="hidden lg:block lg:sticky lg:top-24">
          <div className="card p-3.5">
            <div className="flex items-center justify-between">
              <p className="text-[11.5px] font-semibold">{copy.attempt.paletteTitle}</p>
              <span className="text-[9.5px] text-muted">
                {answeredCount}/{entries.length}
              </span>
            </div>
            <div className="mt-3">{palette}</div>
          </div>

        </aside>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted">
        <span>{copy.attempt.summary(answeredCount, markedCount, entries.length - answeredCount)}</span>
        <span className="lg:hidden">
          <Button variant="secondary" size="sm" onClick={() => setPaletteOpen(true)}>
            <Grid2x2 size={13} /> {copy.attempt.openPalette}
          </Button>
        </span>
      </div>

      <Dialog
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        title={copy.attempt.paletteTitle}
        description={copy.attempt.paletteDesc}
        width="max-w-md"
      >
        {palette}
      </Dialog>

      <Dialog
        open={confirmSubmit}
        onClose={() => setConfirmSubmit(false)}
        title={copy.attempt.submitTitle}
        description={copy.attempt.submitDesc}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmSubmit(false)}>
              {copy.attempt.keepAttempting}
            </Button>
            <Button onClick={() => finish(false)}>
              {copy.attempt.submitPaper} <Send size={14} />
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: copy.attempt.answered, value: answeredCount, tone: 'text-positive' },
            { label: copy.attempt.marked, value: markedCount, tone: 'text-gold' },
            { label: copy.attempt.notAnswered, value: entries.length - answeredCount, tone: 'text-muted' },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-line bg-surface-2/60 px-2.5 py-2">
              <p className="text-[10px] text-muted">{item.label}</p>
              <p className={cn('num mt-0.5 text-[18px] font-semibold', item.tone)}>{item.value}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-warning-soft px-3 py-2 text-[11px] leading-relaxed text-warning">
          <AlertTriangle size={13} className="mt-0.5 shrink-0" />
          {entries.length - answeredCount > 0
            ? copy.attempt.unansweredWarn(entries.length - answeredCount)
            : copy.attempt.allAnswered}
        </p>
      </Dialog>

      <Dialog
        open={confirmExit}
        onClose={() => setConfirmExit(false)}
        title={copy.attempt.exitTitle}
        description={copy.attempt.exitDesc}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmExit(false)}>
              {copy.attempt.stay}
            </Button>
            <Link to="/app/mocks" className="btn btn-secondary">
              {copy.attempt.leave}
            </Link>
          </>
        }
      >
        <div className="flex items-start gap-2 rounded-lg border border-line bg-surface-2/60 px-3 py-2.5 text-[11.5px] leading-relaxed text-muted">
          <Clock size={14} className="mt-0.5 shrink-0" />
          {copy.attempt.remainingBody(formatClock(remaining))}
        </div>
      </Dialog>

      <p className="mt-6 hidden text-[9.5px] text-muted sm:block">{copy.attempt.sampleNote}</p>

      <div className="sr-only" aria-live="polite">
        {saving ? copy.attempt.ariaSaving : copy.attempt.ariaSaved} · {copy.attempt.ariaOf(answeredCount, entries.length)}
      </div>
    </div>
  )
}
