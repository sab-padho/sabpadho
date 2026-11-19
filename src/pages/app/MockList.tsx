import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  Clock,
  ClipboardList,
  Info,
  Lock,
  Timer,
  Trophy,
} from 'lucide-react'
import { Badge, Button, ButtonLink, SectionLabel } from '../../components/ui'
import { mockPapers, paperMarks, paperQuestionCount, type MockKind } from '../../data/mocks'
import { loadResult } from '../../lib/attempt'
import { useToast } from '../../lib/toast'
import { usePageTitle } from '../../lib/hooks'
import { cn } from '../../lib/utils'

const filters: Array<'All' | MockKind> = ['All', 'Full length', 'Mini', 'Sectional']

export function MockList() {
  usePageTitle('Mock tests')
  const [filter, setFilter] = useState<'All' | MockKind>('All')
  const { notify } = useToast()

  const papers = mockPapers
  const visible = filter === 'All' ? papers : papers.filter((paper) => paper.kind === filter)
  const completed = papers.filter((paper) => paper.status === 'completed').length
  const liveResults = papers.filter((paper) => loadResult(paper.id)).length

  return (
    <div className="space-y-5">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <SectionLabel>Mock tests</SectionLabel>
          <h1 className="mt-1.5 text-[26px] font-semibold leading-tight sm:text-[30px]">
            Rehearse the paper
          </h1>
          <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-muted">
            Full-length papers and short sectional sets in the Tier-I pattern. The clock starts when
            you begin and the scoring rules are fixed for that paper.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral">
            <Clock size={11} /> {completed + liveResults} full paper submitted
          </Badge>
          <Badge tone="brand">
            <Trophy size={11} /> Best 133.5 / 200
          </Badge>
        </div>
      </header>

      <div className="flex flex-wrap gap-1.5">
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            aria-pressed={filter === item}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-[12px] font-medium transition',
              filter === item
                ? 'border-brand/30 bg-brand-soft text-brand-ink'
                : 'border-line bg-surface text-muted hover:text-ink',
            )}
          >
            {item}
            <span className="ml-1.5 text-[10px] opacity-70">
              {item === 'All' ? papers.length : papers.filter((paper) => paper.kind === item).length}
            </span>
          </button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr] xl:items-start">
        <ul className="space-y-3">
          {visible.map((paper) => {
            const result = loadResult(paper.id)
            const count = paperQuestionCount(paper)
            const isCompleted = paper.status === 'completed'
            const isScheduled = paper.status === 'scheduled'
            return (
              <li key={paper.id} className="card p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={paper.kind === 'Full length' ? 'brand' : 'neutral'}>
                        {paper.kind}
                      </Badge>
                      {isCompleted ? (
                        <Badge tone="positive">
                          <Check size={10} /> Submitted
                        </Badge>
                      ) : result ? (
                        <Badge tone="positive">
                          <Check size={10} /> Attempted
                        </Badge>
                      ) : isScheduled ? (
                        <Badge tone="gold">Scheduled</Badge>
                      ) : (
                        <Badge tone="outline">Not attempted</Badge>
                      )}
                    </div>
                    <h2 className="mt-2 text-[16.5px] font-semibold leading-snug">{paper.title}</h2>
                    <p className="mt-1.5 max-w-lg text-[12px] leading-relaxed text-muted">
                      {paper.description}
                    </p>
                  </div>

                  {isScheduled ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => notify(`Reminder set for ${paper.opensOn?.split('·')[0] ?? 'this paper'}`)}
                    >
                      <Bell size={13} /> Remind me
                    </Button>
                  ) : result || isCompleted ? (
                    <ButtonLink to={`/app/mocks/${paper.id}/result`} size="sm" variant="secondary">
                      View result <ArrowRight size={13} />
                    </ButtonLink>
                  ) : (
                    <ButtonLink to={`/app/mocks/${paper.id}/instructions`} size="sm">
                      Start paper <ArrowRight size={13} />
                    </ButtonLink>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-3 text-[11px] text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <ClipboardList size={12} /> {count} questions
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Timer size={12} /> {paper.durationMinutes} minutes
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Trophy size={12} /> {paperMarks(paper)} marks
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={12} />
                    {paper.opensOn
                      ? `Opens ${paper.opensOn}`
                      : paper.submittedOn
                        ? `Submitted ${paper.submittedOn}`
                        : 'Open now'}
                  </span>
                  {paper.kind === 'Full length' ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Lock size={11} /> 4 sections
                    </span>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>

        <aside className="space-y-3">
          <div className="card p-4">
            <p className="label">Your rehearsal record</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                { label: 'Papers attempted', value: '2' },
                { label: 'Best score', value: '133.5' },
                { label: 'Avg. accuracy', value: '73%' },
                { label: 'Time / paper', value: '54 min' },
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
              Full progress <ArrowRight size={12} />
            </Link>
          </div>

          <div className="card p-4">
            <p className="label">Marking scheme</p>
            <dl className="mt-2.5 space-y-1.5 text-[12px]">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Correct</dt>
                <dd className="font-medium text-positive">+2 marks</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Wrong</dt>
                <dd className="font-medium text-negative">−0.5 marks</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Unattempted</dt>
                <dd className="font-medium">0 marks</dd>
              </div>
            </dl>
          </div>

          <div className="card p-4">
            <p className="flex items-center gap-2 text-[12px] font-medium">
              <Info size={13} className="text-brand" /> In the exam hall
            </p>
            <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-muted">
              <li>Answers save as you select them; the palette shows what is saved.</li>
              <li>Marked-for-review is kept separate from answered, with text labels.</li>
              <li>Submit once. A repeat submit would return the same result.</li>
            </ul>
            <p className="mt-2.5 rounded-md bg-surface-2 px-2 py-1.5 text-[10px] leading-relaxed text-muted">
              This preview keeps your attempt in the browser tab, not on a server.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
