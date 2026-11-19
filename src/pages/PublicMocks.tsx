import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Bell, CalendarDays, Clock, Lock, Trophy } from 'lucide-react'
import { Badge, Button, ButtonLink, SectionLabel } from '../components/ui'
import { mockPapers, paperQuestionCount, type MockKind } from '../data/mocks'
import { useToast } from '../lib/toast'
import { usePageTitle } from '../lib/hooks'
import { cn } from '../lib/utils'

const filters: Array<'All' | MockKind> = ['All', 'Full length', 'Mini', 'Sectional']

export function PublicMocks() {
  usePageTitle('Mock tests')
  const [filter, setFilter] = useState<'All' | MockKind>('All')
  const { notify } = useToast()

  const papers = mockPapers
    .filter((paper) => paper.status !== 'completed')
    .sort((a, b) => Number(a.status === 'scheduled') - Number(b.status === 'scheduled'))
  const visible = filter === 'All' ? papers : papers.filter((paper) => paper.kind === filter)

  return (
    <div className="container-page pb-16 pt-10 md:pt-14">
      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
        <div>
          <SectionLabel>Mock series</SectionLabel>
          <h1 className="mt-3 text-[32px] font-semibold leading-[1.08] sm:text-[44px]">
            Rehearse the paper, not the syllabus.
          </h1>
          <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-muted">
            Full-length papers, sectional sets and fifteen-minute mini mocks, all in the Tier-I
            pattern. Every attempt ends with a section score, a time check and the questions you
            should revise.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: '100', label: 'questions', sub: 'full length' },
            { value: '60', label: 'minutes', sub: 'Tier I clock' },
            { value: '4', label: 'sections', sub: 'official order' },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-line bg-surface px-3 py-3">
              <p className="num font-display text-[21px] font-semibold leading-none">{item.value}</p>
              <p className="mt-1 text-[11px] text-ink-soft">{item.label}</p>
              <p className="text-[10px] text-muted">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-1.5 border-b border-line pb-3">
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            aria-pressed={filter === item}
            className={cn(
              'rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition',
              filter === item ? 'bg-brand-soft text-brand-ink' : 'text-muted hover:text-ink',
            )}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[1.6fr_0.8fr] lg:items-start">
        <ul className="space-y-2.5">
          {visible.map((paper) => {
            const count = paper.kind === 'Full length' ? 100 : paperQuestionCount(paper)
            return (
              <li key={paper.id} className="card p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={paper.kind === 'Full length' ? 'brand' : 'neutral'}>
                        {paper.kind}
                      </Badge>
                      <span className="text-[11px] text-muted">{paper.exam} · Tier I</span>
                    </div>
                    <h2 className="mt-2 text-[17px] font-semibold leading-snug">{paper.title}</h2>
                    <p className="mt-1.5 max-w-lg text-[12.5px] leading-relaxed text-muted">
                      {paper.description}
                    </p>
                  </div>
                  {paper.status === 'scheduled' ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => notify(`Reminder set for ${paper.opensOn?.split('·')[0] ?? 'this paper'}`)}
                    >
                      <Bell size={14} /> Remind me
                    </Button>
                  ) : (
                    <ButtonLink to={`/app/mocks/${paper.id}/instructions`} size="sm">
                      Start now <ArrowRight size={14} />
                    </ButtonLink>
                  )}
                </div>

                <dl className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-3 text-[11.5px] text-muted">
                  <div className="inline-flex items-center gap-1.5">
                    <ListIcon /> {count} questions
                  </div>
                  <div className="inline-flex items-center gap-1.5">
                    <Clock size={12} /> {paper.durationMinutes} minutes
                  </div>
                  <div className="inline-flex items-center gap-1.5">
                    <Trophy size={12} /> {count * 2} marks
                  </div>
                  <div className="inline-flex items-center gap-1.5">
                    <CalendarDays size={12} />
                    {paper.status === 'scheduled' ? `Opens ${paper.opensOn}` : 'Available now'}
                  </div>
                </dl>
              </li>
            )
          })}
        </ul>

        <aside className="space-y-3">
          <div className="card p-4" id="marking">
            <p className="label">Marking, exactly as scored</p>
            <dl className="mt-3 space-y-2 text-[12.5px]">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Correct answer</dt>
                <dd className="font-medium text-positive">+2</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Wrong answer</dt>
                <dd className="font-medium text-negative">−0.5</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Unattempted</dt>
                <dd className="font-medium">0</dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-line pt-2">
                <dt className="text-muted">Full paper</dt>
                <dd className="font-medium">200 marks</dd>
              </div>
            </dl>
            <Link
              to="/how-it-works#marking"
              className="mt-3 inline-flex items-center gap-1 text-[11.5px] font-medium text-brand-ink hover:underline"
            >
              How scoring works <ArrowRight size={12} />
            </Link>
          </div>

          <div className="card border-dashed p-4">
            <p className="flex items-center gap-2 text-[12.5px] font-medium">
              <Lock size={13} className="text-muted" /> Full mocks open on Sunday
            </p>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted">
              A paper opens for 24 hours so that everyone attempts the same version. Sectional sets
              stay available all week.
            </p>
          </div>

          <div className="rounded-xl border border-line bg-surface-2/60 p-4">
            <p className="text-[12.5px] font-medium">This is a preview build</p>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted">
              Startable papers run on the sample bank so you can feel the exam flow. A full-length
              paper is marked as scheduled rather than filled with placeholder questions.
            </p>
          </div>
        </aside>
      </div>

      <p className="mt-8 text-[11px] text-muted">
        SabPadho is an independent platform. The Tier-I pattern shown here follows the publicly
        published SSC scheme; always confirm details on the official notice.
      </p>
    </div>
  )
}

function ListIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M1.5 3h9M1.5 6h9M1.5 9h5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  )
}
