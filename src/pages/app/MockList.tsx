import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  ClipboardList,
  FolderArchive,
  Info,
  Lock,
  Timer,
  Trophy,
} from 'lucide-react'
import { Badge, Button, ButtonLink, SectionLabel } from '../../components/ui'
import { paperMarks, paperQuestionCount, type MockKind, type MockPaper } from '../../data/mocks'
import { EXAM_OPTIONS, type ExamId } from '../../data/exams'
import { useCatalog } from '../../lib/catalog'
import { useAuth } from '../../lib/auth'
import { loadResult } from '../../lib/attempt'
import { useToast } from '../../lib/toast'
import { usePageTitle } from '../../lib/hooks'
import { useLang } from '../../lib/lang'
import { useCopy, localDate, mockKindLabel } from '../../lib/ui-copy'
import { cn } from '../../lib/utils'

export function MockList() {
  const { lang } = useLang()
  const copy = useCopy()
  usePageTitle(copy.mock.label)
  const { partitionMocksByExam } = useCatalog()
  const { preferredExam, setPreferredExam } = useAuth()
  const { notify } = useToast()

  const filterOptions: Array<{ value: 'All' | MockKind; label: string }> = [
    { value: 'All', label: copy.mock.all },
    { value: 'Full length', label: copy.mock.fullLength },
    { value: 'Mini', label: copy.mock.mini },
    { value: 'Sectional', label: copy.mock.sectional },
  ]
  const [filter, setFilter] = useState<'All' | MockKind>('All')
  const [othersOpen, setOthersOpen] = useState(false)

  const { preferred: preferredPapers, others: otherPapers } =
    partitionMocksByExam(preferredExam)

  const visible =
    filter === 'All'
      ? preferredPapers
      : preferredPapers.filter((paper) => paper.kind === filter)

  const completed = preferredPapers.filter((paper) => paper.status === 'completed').length
  const liveResults = preferredPapers.filter((paper) => loadResult(paper.id)).length
  const otherExamOptions = EXAM_OPTIONS.filter((item) => item.id !== preferredExam)

  async function switchExam(next: ExamId) {
    await setPreferredExam(next)
    setOthersOpen(false)
    notify(`Switched active mock series to ${next}`, 'success')
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <SectionLabel>{copy.mock.label}</SectionLabel>
            <Badge tone="brand">{preferredExam}</Badge>
          </div>
          <h1 className="mt-1.5 text-[26px] font-semibold leading-tight sm:text-[30px]">
            {preferredExam} · {copy.mock.title}
          </h1>
          <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-muted">
            {copy.mock.intro}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral">
            <Clock size={11} /> {copy.mock.fullSubmitted(completed + liveResults)}
          </Badge>
          <Badge tone="brand">
            <Trophy size={11} /> {copy.mock.best}
          </Badge>
        </div>
      </header>

      <div className="flex flex-wrap gap-1.5">
        {filterOptions.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            aria-pressed={filter === item.value}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-[12px] font-medium transition',
              filter === item.value
                ? 'border-brand/30 bg-brand-soft text-brand-ink'
                : 'border-line bg-surface text-muted hover:text-ink',
            )}
          >
            {item.label}
            <span className="ml-1.5 text-[10px] opacity-70">
              {item.value === 'All'
                ? preferredPapers.length
                : preferredPapers.filter((paper) => paper.kind === item.value).length}
            </span>
          </button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr] xl:items-start">
        <div className="space-y-4">
          <ul className="space-y-3">
            {visible.map((paper) => (
              <MockCard key={paper.id} paper={paper} notify={notify} />
            ))}
          </ul>

          {visible.length === 0 ? (
            <div className="card p-6 text-center">
              <p className="text-[14px] font-medium text-ink">
                No {filter.toLowerCase()} papers yet for {preferredExam}.
              </p>
              <p className="mt-1 text-[12px] text-muted">
                Try the “All” filter or open Others below to browse papers from other exams.
              </p>
            </div>
          ) : null}

          {/* Zipped Others section for other exams */}
          <section className="overflow-hidden rounded-2xl border border-line bg-surface">
            <button
              type="button"
              onClick={() => setOthersOpen((v) => !v)}
              aria-expanded={othersOpen}
              className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition hover:bg-surface-2/50 sm:px-5"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line bg-surface-2 text-muted">
                  <FolderArchive size={15} />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[13.5px] font-semibold text-ink">
                      {lang === 'hi'
                        ? 'अन्य परीक्षाओं के मॉक टेस्ट (Others)'
                        : 'Others · Zipped mocks for other exams'}
                    </p>
                    <Badge tone="outline">{otherPapers.length} papers</Badge>
                  </div>
                  <p className="mt-0.5 text-[11.5px] text-muted">
                    {otherExamOptions.map((e) => e.shortLabel).join(', ')}
                  </p>
                </div>
              </div>
              <ChevronDown
                size={16}
                className={cn('shrink-0 text-muted transition-transform', othersOpen && 'rotate-180')}
              />
            </button>

            {othersOpen ? (
              <div className="space-y-4 border-t border-line bg-surface-2/30 p-4 sm:p-5">
                <div>
                  <p className="label">
                    {lang === 'hi' ? 'मुख्य परीक्षा बदलें' : 'Switch preferred exam'}
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

                <ul className="space-y-2.5 border-t border-line pt-4">
                  {otherPapers.map((paper) => (
                    <MockCard key={`other-${paper.id}`} paper={paper} notify={notify} showExamBadge />
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        </div>

        <aside className="space-y-3">
          <div className="card p-4">
            <p className="label">{copy.mock.record}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                { label: copy.mock.papersAttempted, value: '2' },
                { label: copy.mock.bestScore, value: '133.5' },
                { label: copy.mock.avgAccuracy, value: '73%' },
                { label: copy.mock.timePaper, value: '54 min' },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-line bg-surface-2/50 px-2.5 py-2">
                  <p className="num font-display text-[16px] font-semibold leading-none">
                    {item.value}
                  </p>
                  <p className="mt-1 text-[10px] leading-tight text-muted">{item.label}</p>
                </div>
              ))}
            </div>
            <Link
              to="/app/progress"
              className="mt-3 inline-flex items-center gap-1 text-[11.5px] font-medium text-brand-ink hover:underline"
            >
              {copy.mock.fullProgress} <ArrowRight size={12} />
            </Link>
          </div>

          <div className="card p-4">
            <p className="label">{copy.mock.marking}</p>
            <dl className="mt-2.5 space-y-1.5 text-[12px]">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">{copy.mock.correct}</dt>
                <dd className="font-medium text-positive">{copy.mock.correctMarks}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">{copy.mock.wrong}</dt>
                <dd className="font-medium text-negative">{copy.mock.wrongMarks}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">{copy.mock.unattempted}</dt>
                <dd className="font-medium">{copy.mock.zeroMarks}</dd>
              </div>
            </dl>
          </div>

          <div className="card p-4">
            <p className="flex items-center gap-2 text-[12px] font-medium">
              <Info size={13} className="text-brand" /> {copy.mock.examHall}
            </p>
            <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-muted">
              <li>{copy.mock.hall1}</li>
              <li>{copy.mock.hall2}</li>
              <li>{copy.mock.hall3}</li>
            </ul>
            <p className="mt-2.5 rounded-md bg-surface-2 px-2 py-1.5 text-[10px] leading-relaxed text-muted">
              {copy.mock.attemptNote}
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

function MockCard({
  paper,
  notify,
  showExamBadge = false,
}: {
  paper: MockPaper
  notify: (msg: string) => void
  showExamBadge?: boolean
}) {
  const { lang } = useLang()
  const copy = useCopy()
  const result = loadResult(paper.id)
  const count = paperQuestionCount(paper)
  const isCompleted = paper.status === 'completed'
  const isScheduled = paper.status === 'scheduled'

  return (
    <li className="card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {showExamBadge ? <Badge tone="brand">{paper.exam}</Badge> : null}
            <Badge tone={paper.kind === 'Full length' ? 'brand' : 'neutral'}>
              {mockKindLabel(lang, paper.kind)}
            </Badge>
            {isCompleted ? (
              <Badge tone="positive">
                <Check size={10} /> {copy.mock.submitted}
              </Badge>
            ) : result ? (
              <Badge tone="positive">
                <Check size={10} /> {copy.mock.attempted}
              </Badge>
            ) : isScheduled ? (
              <Badge tone="gold">{copy.mock.scheduled}</Badge>
            ) : (
              <Badge tone="outline">{copy.mock.notAttempted}</Badge>
            )}
          </div>
          <h2 className="mt-2 text-[16.5px] font-semibold leading-snug">{paper.title}</h2>
          <p className="mt-1.5 max-w-lg text-[12px] leading-relaxed text-muted">
            {lang === 'hi' ? paper.descriptionHi : paper.description}
          </p>
        </div>

        {isScheduled ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              notify(copy.mock.reminderSet(paper.opensOn?.split('·')[0] ?? 'this paper'))
            }
          >
            <Bell size={13} /> {copy.mock.remindMe}
          </Button>
        ) : result || isCompleted ? (
          <ButtonLink to={`/app/mocks/${paper.id}/result`} size="sm" variant="secondary">
            {copy.mock.viewResult} <ArrowRight size={13} />
          </ButtonLink>
        ) : (
          <ButtonLink to={`/app/mocks/${paper.id}/instructions`} size="sm">
            {copy.mock.startPaper} <ArrowRight size={13} />
          </ButtonLink>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-3 text-[11px] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <ClipboardList size={12} /> {copy.mock.questionsN(count)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Timer size={12} /> {copy.mock.minutesN(paper.durationMinutes)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Trophy size={12} /> {copy.mock.marksN(paperMarks(paper))}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays size={12} />
          {paper.opensOn
            ? copy.mock.opens(localDate(lang, paper.opensOn))
            : paper.submittedOn
              ? copy.mock.submittedOn(localDate(lang, paper.submittedOn))
              : copy.mock.openNow}
        </span>
        {paper.kind === 'Full length' ? (
          <span className="inline-flex items-center gap-1.5">
            <Lock size={11} /> {copy.mock.sections4}
          </span>
        ) : null}
      </div>
    </li>
  )
}
