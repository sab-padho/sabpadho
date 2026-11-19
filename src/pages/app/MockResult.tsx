import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Flag,
  RotateCcw,
  Target,
  Trophy,
  X,
} from 'lucide-react'
import { Badge, ButtonLink, SectionLabel } from '../../components/ui'
import { AccuracyRing, SectionScoreBars, ScoreSplitBar } from '../../components/charts'
import { completedMockResult, getMock, paperQuestionCount } from '../../data/mocks'
import { loadResult, computeResult } from '../../lib/attempt'
import { questionById } from '../../data/questions'
import { allChapters, chapterById, subjectById } from '../../data/subjects'
import { formatClock } from '../../lib/utils'
import { usePageTitle } from '../../lib/hooks'
import { useLang } from '../../lib/lang'

function formatScore(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

export function MockResult() {
  const { mockId = '' } = useParams()
  const paper = getMock(mockId)
  const stored = loadResult(mockId)
  const { lang } = useLang()
  const isDemoFullMock = mockId === 'mock-03'
  usePageTitle(paper ? `${paper.title} · Result` : 'Result')

  if (!paper) {
    return (
      <div className="card mx-auto max-w-md p-6 text-center">
        <p className="text-[15px] font-semibold">This result is not available</p>
        <ButtonLink to="/app/mocks" className="mt-4">
          Back to mocks
        </ButtonLink>
      </div>
    )
  }

  if (!stored && !isDemoFullMock) {
    return (
      <div className="card mx-auto max-w-md p-6 text-center">
        <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-muted">
          <Trophy size={18} />
        </span>
        <p className="mt-3 text-[15px] font-semibold">No submission yet</p>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
          Submit {paper.title} to see a section score, the time you used and the questions to
          revise.
        </p>
        <ButtonLink to={`/app/mocks/${paper.id}/instructions`} className="mt-4">
          Open the paper <ArrowRight size={14} />
        </ButtonLink>
      </div>
    )
  }

  const computed = stored ? computeResult(paper, stored.answers) : null
  const score = computed ? computed.score : completedMockResult.score
  const maxScore = computed ? computed.maxScore : completedMockResult.maxScore
  const correct = computed ? computed.correct : completedMockResult.correct
  const wrong = computed ? computed.wrong : completedMockResult.wrong
  const unattempted = computed ? computed.unattempted : completedMockResult.unattempted
  const accuracy = computed ? computed.accuracy : completedMockResult.accuracy
  const timeUsed = stored
    ? formatClock(stored.timeUsedSeconds)
    : completedMockResult.timeUsed
  const sections = computed
    ? computed.sections
    : completedMockResult.sections.map((section) => ({
        name: section.name,
        correct: section.correct,
        total: section.total,
      }))
  const submittedOn = stored
    ? new Date(stored.submittedAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : completedMockResult.submittedOn

  const reviewItems = stored
    ? paper.sections
        .flatMap((section) => section.questionIds)
        .map((questionId) => ({ questionId, picked: stored.answers[questionId], status: 'Wrong' as const }))
        .filter((item) => {
          const question = questionById(item.questionId)
          return item.picked !== undefined && question && item.picked !== question.correct
        })
    : completedMockResult.review

  const wrongChapterIds = Array.from(
    new Set(
      reviewItems
        .map((item) => questionById(item.questionId)?.chapterId)
        .filter((id): id is string => Boolean(id)),
    ),
  )

  const pulse = isDemoFullMock
    ? completedMockResult.pulse
    : allChapters
        .filter((chapter) => wrongChapterIds.includes(chapter.id))
        .slice(0, 4)
        .map((chapter) => ({
          chapter: chapter.title.en,
          attempts: chapter.attempts ?? 1,
          accuracy: chapter.accuracy,
          status: 'Practise next',
        }))

  const firstWeakChapter = wrongChapterIds.length
    ? chapterById(wrongChapterIds[0])?.title.en
    : undefined

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          to="/app/mocks"
          className="inline-flex items-center gap-1.5 text-[12px] text-muted transition hover:text-ink"
        >
          <ArrowLeft size={14} /> Mock tests
        </Link>
        <Badge tone="positive">
          <Check size={11} /> Finalised result
        </Badge>
      </div>

      <section className="card relative overflow-hidden p-0">
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            backgroundImage: 'radial-gradient(circle at 88% 0%, var(--brand-soft), transparent 58%)',
          }}
          aria-hidden
        />
        <div className="relative p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <SectionLabel>
                {paper.exam} · Tier I · submitted {submittedOn}
              </SectionLabel>
              <h1 className="mt-2 text-[24px] font-semibold leading-tight sm:text-[28px]">
                {paper.title}
              </h1>
              <p className="mt-1.5 max-w-md text-[12px] leading-relaxed text-muted">
                Scored from the paper version pinned when you started. A repeat submit returns this
                same result.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge tone={accuracy >= 70 ? 'positive' : accuracy >= 50 ? 'warning' : 'negative'}>
                  {accuracy}% accuracy
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="num font-display text-[34px] font-semibold leading-none sm:text-[40px]">
                  {formatScore(score)}
                  <span className="text-[16px] font-normal text-muted"> / {maxScore}</span>
                </p>
                <p className="mt-1 text-[10.5px] text-muted">marks</p>
              </div>
              <AccuracyRing value={accuracy} size={76} label="" />
            </div>
          </div>

          <div className="mt-5 border-t border-line pt-4">
            <ScoreSplitBar correct={correct} wrong={wrong} unattempted={unattempted} />
            <p className="mt-2.5 text-[11.5px] leading-relaxed text-muted">
              {correct} correct, {wrong} wrong, {unattempted} left blank. A wrong answer costs 0.5
              marks, so {wrong * 0.5} {wrong === 1 ? 'mark was' : 'marks were'} lost to negatives.
            </p>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: 'Correct', value: correct, tone: 'text-positive' },
              { label: 'Wrong', value: wrong, tone: 'text-negative' },
              { label: 'Unattempted', value: unattempted, tone: 'text-muted' },
              { label: 'Time used', value: timeUsed, tone: 'text-ink' },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-line bg-surface/70 px-2.5 py-2">
                <dt className="text-[10px] text-muted">{item.label}</dt>
                <dd className={`num mt-0.5 font-display text-[17px] font-semibold leading-none ${item.tone}`}>
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <div className="space-y-4">
          <section className="card p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <p className="label">By section</p>
              <span className="text-[10px] text-muted">correct / questions</span>
            </div>
            <div className="mt-4">
              <SectionScoreBars sections={sections} />
            </div>
            <p className="mt-4 border-t border-line pt-3 text-[11px] leading-relaxed text-muted">
              Section scores are additive: 2 marks per correct answer and 0.5 deducted per wrong
              answer within that section.
            </p>
          </section>

          <section className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-5">
              <div>
                <p className="text-[14px] font-semibold">Review incorrect answers</p>
                <p className="mt-0.5 text-[11px] text-muted">
                  The solution is shown only after a submitted attempt
                </p>
              </div>
              <Badge tone="neutral">{reviewItems.length} to review</Badge>
            </div>

            {reviewItems.length ? (
              <ul className="divide-y divide-line">
                {reviewItems.map((item) => {
                  const question = questionById(item.questionId)
                  if (!question) return null
                  const chapter = chapterById(question.chapterId)
                  const subject = chapter ? subjectById[chapter.subjectId] : undefined
                  return (
                    <li key={`${item.questionId}-${item.picked}`} className="px-4 py-3.5 sm:px-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="negative">
                          <X size={10} /> Wrong
                        </Badge>
                        <span className="text-[10.5px] text-muted">
                          {subject?.short} · {chapter?.title.en}
                        </span>
                      </div>
                      <p className="mt-2 text-[12.5px] leading-relaxed text-ink">
                        {question.prompt[lang]}
                      </p>
                      <div className="mt-1.5 grid gap-1 text-[11.5px] sm:grid-cols-2">
                        <p className="text-negative">
                          Your answer:{' '}
                          <span className="text-ink-soft">
                            {item.picked !== undefined ? question.options[lang][item.picked] : '—'}
                          </span>
                        </p>
                        <p className="text-positive">
                          Correct:{' '}
                          <span className="text-ink-soft">
                            {question.options[lang][question.correct]}
                          </span>
                        </p>
                      </div>
                      <details className="group mt-2">
                        <summary className="cursor-pointer text-[11px] font-medium text-brand-ink marker:hidden [&::-webkit-details-marker]:hidden">
                          Show reasoning
                        </summary>
                        <p className="mt-1.5 rounded-lg bg-surface-2/70 px-2.5 py-2 text-[11.5px] leading-relaxed text-muted">
                          {question.explanation[lang]}
                        </p>
                      </details>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="px-5 py-6 text-center">
                <p className="text-[12.5px] font-medium text-positive">No incorrect answers to review</p>
                <p className="mt-1 text-[11.5px] text-muted">
                  Every attempted question was correct. Try a longer paper next.
                </p>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-3">
          <section className="card p-4">
            <p className="label">Chapter pulse</p>
            <p className="mt-1 text-[10.5px] leading-relaxed text-muted">
              Accuracy shown with the attempts behind it
            </p>
            <ul className="mt-3 space-y-2.5">
              {pulse.map((item) => (
                <li key={item.chapter} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[12px] text-ink-soft">{item.chapter}</p>
                    <p className="text-[10px] text-muted">
                      {item.attempts} {item.attempts === 1 ? 'attempt' : 'attempts'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="num text-[12px] font-medium">
                      {item.accuracy === null ? '—' : `${item.accuracy}%`}
                    </p>
                    <p className="text-[9.5px] text-muted">{item.status}</p>
                  </div>
                </li>
              ))}
              {!isDemoFullMock && wrongChapterIds.length === 0 ? (
                <li className="text-[11.5px] text-muted">No chapter needs another look.</li>
              ) : null}
            </ul>
            <Link
              to="/app/progress"
              className="mt-3 inline-flex items-center gap-1 text-[11.5px] font-medium text-brand-ink hover:underline"
            >
              All chapter detail <ArrowRight size={12} />
            </Link>
          </section>

          <section className="card p-4">
            <p className="flex items-center gap-2 text-[12px] font-medium">
              <Flag size={13} className="text-brand" /> What to do next
            </p>
            <ul className="mt-2 space-y-2 text-[11px] leading-relaxed text-muted">
              <li className="flex gap-2">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-brand" />
                Spend ten minutes on {firstWeakChapter ?? 'Percentages'} before the next paper.
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-brand" />
                Re-attempt missed questions from the revision queue tomorrow.
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-brand" />
                Try a sectional paper to hold the section you scored lowest in.
              </li>
            </ul>
            <ButtonLink to="/app/practice" variant="secondary" size="sm" className="mt-3 w-full">
              <RotateCcw size={13} /> Practise weak chapters
            </ButtonLink>
          </section>

          <section className="rounded-xl border border-line bg-surface-2/50 p-4">
            <p className="flex items-center gap-2 text-[11.5px] font-medium">
              <Clock size={13} className="text-muted" /> Time check
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
              You used {timeUsed} of {paper.durationMinutes} minutes
              {paper.kind === 'Full length' ? ' — about 32 seconds a question.' : '.'}
            </p>
          </section>

          <div className="flex flex-col gap-2">
            <ButtonLink to="/app/mocks" size="sm">
              <Target size={13} /> Back to the mock series
            </ButtonLink>
            <ButtonLink to="/app" variant="ghost" size="sm">
              Study desk
            </ButtonLink>
          </div>
        </aside>
      </div>

      <p className="px-1 text-[10px] text-muted">
        {paperQuestionCount(paper)} questions · {paper.sections.length} sections · sample marking
        scheme (+2 / −0.5). Result stays on this device in the preview.
      </p>
    </div>
  )
}
