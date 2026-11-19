import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Bell, CalendarDays, Clock, Lock, Trophy } from 'lucide-react'
import { Badge, Button, ButtonLink, SectionLabel } from '../components/ui'
import { mockPapers, paperQuestionCount, type MockKind } from '../data/mocks'
import { useToast } from '../lib/toast'
import { usePageTitle } from '../lib/hooks'
import { useLang } from '../lib/lang'
import { localDate, mockKindLabel, useCopy } from '../lib/ui-copy'
import { cn } from '../lib/utils'

const filters: Array<'All' | MockKind> = ['All', 'Full length', 'Mini', 'Sectional']

export function PublicMocks() {
  const copy = useCopy()
  const { lang } = useLang()
  usePageTitle(copy.pmocks.title)
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
          <SectionLabel>{copy.pmocks.eyebrow}</SectionLabel>
          <h1 className="mt-3 text-[32px] font-semibold leading-[1.08] sm:text-[44px]">
            {copy.pmocks.heading}
          </h1>
          <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-muted">
            {copy.pmocks.intro}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {['100', '60', '4'].map((value, index) => (
            <div key={value} className="rounded-xl border border-line bg-surface px-3 py-3">
              <p className="num font-display text-[21px] font-semibold leading-none">{value}</p>
              <p className="mt-1 text-[11px] text-ink-soft">{copy.pmocks.statLabels[index]}</p>
              <p className="text-[10px] text-muted">{copy.pmocks.statSubs[index]}</p>
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
            {item === 'All' ? copy.pmocks.all : mockKindLabel(lang, item)}
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
                        {mockKindLabel(lang, paper.kind)}
                      </Badge>
                      <span className="text-[11px] text-muted">{copy.pmocks.examTier(paper.exam)}</span>
                    </div>
                    <h2 className="mt-2 text-[17px] font-semibold leading-snug">{paper.title}</h2>
                    <p className="mt-1.5 max-w-lg text-[12.5px] leading-relaxed text-muted">
                      {lang === 'hi' ? paper.descriptionHi : paper.description}
                    </p>
                  </div>
                  {paper.status === 'scheduled' ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        notify(
                          copy.pmocks.reminderSet(
                            paper.opensOn
                              ? localDate(lang, paper.opensOn.split('·')[0].trim())
                              : copy.pmocks.thisPaper,
                          ),
                        )
                      }
                    >
                      <Bell size={14} /> {copy.pmocks.remind}
                    </Button>
                  ) : (
                    <ButtonLink to={`/app/mocks/${paper.id}/instructions`} size="sm">
                      {copy.pmocks.startNow} <ArrowRight size={14} />
                    </ButtonLink>
                  )}
                </div>

                <dl className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-3 text-[11.5px] text-muted">
                  <div className="inline-flex items-center gap-1.5">
                    <ListIcon /> {copy.pmocks.questionsN(count)}
                  </div>
                  <div className="inline-flex items-center gap-1.5">
                    <Clock size={12} /> {copy.pmocks.minutesN(paper.durationMinutes)}
                  </div>
                  <div className="inline-flex items-center gap-1.5">
                    <Trophy size={12} /> {copy.pmocks.marksN(count * 2)}
                  </div>
                  <div className="inline-flex items-center gap-1.5">
                    <CalendarDays size={12} />
                    {paper.status === 'scheduled'
                      ? copy.pmocks.opens(localDate(lang, paper.opensOn ?? ''))
                      : copy.pmocks.available}
                  </div>
                </dl>
              </li>
            )
          })}
        </ul>

        <aside className="space-y-3">
          <div className="card p-4" id="marking">
            <p className="label">{copy.pmocks.markingTitle}</p>
            <dl className="mt-3 space-y-2 text-[12.5px]">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">{copy.pmocks.correct}</dt>
                <dd className="font-medium text-positive">+2</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">{copy.pmocks.wrong}</dt>
                <dd className="font-medium text-negative">−0.5</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">{copy.pmocks.unattempted}</dt>
                <dd className="font-medium">0</dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-line pt-2">
                <dt className="text-muted">{copy.pmocks.fullPaper}</dt>
                <dd className="font-medium">{copy.pmocks.marks200}</dd>
              </div>
            </dl>
            <Link
              to="/how-it-works#marking"
              className="mt-3 inline-flex items-center gap-1 text-[11.5px] font-medium text-brand-ink hover:underline"
            >
              {copy.pmocks.howScoring} <ArrowRight size={12} />
            </Link>
          </div>

          <div className="card border-dashed p-4">
            <p className="flex items-center gap-2 text-[12.5px] font-medium">
              <Lock size={13} className="text-muted" /> {copy.pmocks.sundayTitle}
            </p>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted">
              {copy.pmocks.sundayBody}
            </p>
          </div>

          <div className="rounded-xl border border-line bg-surface-2/60 p-4">
            <p className="text-[12.5px] font-medium">{copy.pmocks.previewTitle}</p>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted">
              {copy.pmocks.previewBody}
            </p>
          </div>
        </aside>
      </div>

      <p className="mt-8 text-[11px] text-muted">
        {copy.pmocks.disclaimer}
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
