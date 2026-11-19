import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  CalendarDays,
  ClipboardList,
  Clock,
  RotateCcw,
  Timer,
  TrendingUp,
} from 'lucide-react'
import { Badge, ButtonLink, SectionLabel } from '../../components/ui'
import type { LucideIcon } from 'lucide-react'
import { WeeklyActivityChart, AccuracyRing } from '../../components/charts'
import {
  accuracyTrend,
  learner,
  recentAttempts,
  resumeSprint,
  revisionQueue,
  weeklyActivity,
} from '../../data/learner'
import { subjects, allChapters } from '../../data/subjects'
import { questionById, questionsForChapter } from '../../data/questions'
import { mockPapers } from '../../data/mocks'
import { tintDot, tintTile } from '../../components/subject-tint'
import { cn } from '../../lib/utils'
import { usePageTitle } from '../../lib/hooks'

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function Dashboard() {
  usePageTitle('Study desk')
  const nextPaper = mockPapers.find((paper) => paper.status === 'scheduled')
  const availablePaper = mockPapers.find((paper) => paper.id === 'mini-06')
  const weekAccuracy = accuracyTrend[accuracyTrend.length - 1].value
  const resumeQuestions = questionsForChapter('maths-percentages').length

  return (
    <div className="space-y-5">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <SectionLabel>{greeting()}, {learner.firstName}</SectionLabel>
            <Badge tone="outline">Preview data</Badge>
          </div>
          <h1 className="mt-1.5 text-[26px] font-semibold leading-tight sm:text-[30px]">
            Your study desk
          </h1>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12.5px] text-muted">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={13} /> Thursday, 19 November
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-line-strong sm:block" />
            <span>{learner.target}</span>
            <span className="hidden h-1 w-1 rounded-full bg-line-strong sm:block" />
            <span className="font-medium text-ink-soft">{learner.daysToExam} days to go</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink to="/app/practice" size="sm">
            <span className="hidden sm:inline">Start a sprint</span>
            <span className="sm:hidden">Sprint</span>
            <ArrowRight size={14} />
          </ButtonLink>
          <ButtonLink to="/app/mocks" variant="secondary" size="sm">
            <ClipboardList size={14} /> Mocks
          </ButtonLink>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
        <StatCard
          icon={RotateCcw}
          label="Questions due today"
          value={String(revisionQueue.length)}
          foot={
            <Link to="/app/revision" className="inline-flex items-center gap-1 text-brand-ink hover:underline">
              Open revision <ArrowRight size={11} />
            </Link>
          }
          hint="Includes 2 from yesterday"
        />
        <StatCard
          icon={TrendingUp}
          label="Accuracy this week"
          value={`${weekAccuracy}%`}
          foot={
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-positive">
              <TrendingUp size={11} /> +3 pts vs last week
            </span>
          }
          hint="Across 54 checked answers"
        />
        <StatCard
          icon={Timer}
          label="Mocks taken"
          value="2"
          foot={
            <span className="text-[11px] text-muted">
              Best <span className="font-medium text-ink-soft">133.5 / 200</span>
            </span>
          }
          hint="One full, one sectional"
        />
        <StatCard
          icon={Bookmark}
          label="Saved questions"
          value="8"
          foot={
            <Link to="/app/shelf" className="inline-flex items-center gap-1 text-brand-ink hover:underline">
              Open shelf <ArrowRight size={11} />
            </Link>
          }
          hint="Filtered by 4 subjects"
        />
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <div className="space-y-4">
          <section className="card p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-[15px] font-semibold">Practice activity</h2>
                <p className="mt-0.5 text-[11.5px] text-muted">
                  Questions checked in the last seven days
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="neutral">
                  <span className="h-1.5 w-1.5 rounded-full bg-positive" /> {learner.streak}-day streak
                </Badge>
                <Badge tone="brand">{learner.questionsThisWeek} this week</Badge>
              </div>
            </div>

            <div className="mt-5">
              <WeeklyActivityChart data={weeklyActivity} />
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <div className="flex items-center gap-2.5">
                <AccuracyRing value={weekAccuracy} size={60} label="" />
                <div>
                  <p className="text-[12px] font-medium">Weekly accuracy</p>
                  <p className="text-[11px] text-muted">
                    Highest on Reasoning · lowest on Percentages
                  </p>
                </div>
              </div>
              <Link
                to="/app/progress"
                className="inline-flex items-center gap-1 text-[12px] font-medium text-brand-ink hover:underline"
              >
                Full progress <ArrowRight size={13} />
              </Link>
            </div>
          </section>

          <section className="card overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5">
              <div>
                <h2 className="text-[15px] font-semibold">Recent attempts</h2>
                <p className="mt-0.5 text-[11.5px] text-muted">
                  Scores are stored against the paper version you attempted
                </p>
              </div>
              <Link
                to="/app/mocks"
                className="hidden items-center gap-1 text-[12px] font-medium text-brand-ink hover:underline sm:inline-flex"
              >
                All mocks <ArrowRight size={13} />
              </Link>
            </div>

            <div className="hidden grid-cols-[1.6fr_1fr_0.8fr_1fr_auto] gap-3 border-b border-line px-5 py-2 text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted sm:grid">
              <span>Paper</span>
              <span>Section</span>
              <span>Date</span>
              <span>Score</span>
              <span className="sr-only">Open</span>
            </div>
            <ul className="divide-y divide-line">
              {recentAttempts.map((attempt) => (
                <li key={attempt.id}>
                  <Link
                    to={attempt.href}
                    className="group grid gap-2 px-4 py-3 transition hover:bg-surface-2/60 sm:grid-cols-[1.6fr_1fr_0.8fr_1fr_auto] sm:items-center sm:gap-3 sm:px-5"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[12.5px] font-medium text-ink">
                        {attempt.paper}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-muted sm:hidden">
                        {attempt.date} · {attempt.score}
                      </span>
                    </span>
                    <span className="hidden truncate text-[11.5px] text-muted sm:block">
                      {attempt.subjectLabel}
                    </span>
                    <span className="hidden text-[11.5px] text-muted sm:block">{attempt.date}</span>
                    <span className="hidden items-center gap-2 sm:flex">
                      <span className="num text-[12px] font-medium">{attempt.score}</span>
                      <span className="hidden h-1 w-10 overflow-hidden rounded-full bg-surface-3 lg:block">
                        <span
                          className="block h-full rounded-full bg-brand"
                          style={{ width: `${attempt.accuracy}%` }}
                        />
                      </span>
                    </span>
                    <ArrowUpRight
                      size={14}
                      className="hidden text-muted transition group-hover:text-ink sm:block"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="space-y-4">
          <section className="card border-brand/20 bg-brand-soft p-4">
            <div className="flex items-center justify-between">
              <p className="text-[9.5px] font-semibold uppercase tracking-[0.13em] text-brand-ink/75">
                Continue where you left off
              </p>
              <span className="rounded-full bg-white/60 px-1.5 py-0.5 text-[9.5px] font-medium text-brand-ink dark:bg-black/25">
                Sprint
              </span>
            </div>
            <h2 className="mt-2 font-display text-[17px] font-semibold text-brand-ink">
              {resumeSprint.chapterTitle} · question {resumeSprint.answered} of {resumeSprint.total}
            </h2>
            <p className="mt-1 text-[11.5px] text-brand-ink/75">
              {resumeSprint.subjectTitle} · about {resumeSprint.minutesLeft} minutes left ·{' '}
              {resumeQuestions} in this chapter
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/60 dark:bg-black/25">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${Math.round((resumeSprint.answered / resumeSprint.total) * 100)}%` }}
                />
              </div>
              <span className="num text-[10.5px] font-medium text-brand-ink">
                {Math.round((resumeSprint.answered / resumeSprint.total) * 100)}%
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Link to="/app/practice/percentages" className="btn btn-sm btn-primary">
                Resume sprint <ArrowRight size={13} />
              </Link>
              <Link
                to="/app/practice"
                className="btn btn-sm border border-brand/20 bg-white/50 text-brand-ink hover:bg-white/80 dark:bg-black/20 dark:hover:bg-black/30"
              >
                New sprint
              </Link>
            </div>
          </section>

          <section className="card p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[14.5px] font-semibold">Your subjects</h2>
              <Link to="/app/practice" className="text-[11px] text-muted hover:text-ink">
                Practise
              </Link>
            </div>
            <ul className="mt-3 space-y-2.5">
              {subjects.map((subject) => (
                <li key={subject.id}>
                  <Link
                    to={`/subjects/${subject.slug}`}
                    className="group flex items-center gap-2.5"
                  >
                    <span
                      className={cn(
                        'grid h-7 w-7 shrink-0 place-items-center rounded-md font-display text-[9.5px] font-bold',
                        tintTile[subject.tint],
                      )}
                    >
                      {subject.code}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-[12px] text-ink-soft">{subject.short}</span>
                        <span className="num text-[11px] font-medium text-ink">
                          {subject.accuracy}%
                        </span>
                      </span>
                      <span className="mt-1 flex items-center gap-1.5">
                        <span className="h-1 flex-1 overflow-hidden rounded-full bg-surface-3">
                          <span
                            className={cn('block h-full rounded-full', tintDot[subject.tint])}
                            style={{ width: `${subject.accuracy}%` }}
                          />
                        </span>
                        <span className="text-[9.5px] text-muted">
                          {subject.chapters.length} ch
                        </span>
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="card p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[14.5px] font-semibold">Today’s revision</h2>
              <span className="num text-[11px] text-muted">{revisionQueue.length} due</span>
            </div>
            <ul className="mt-2.5 divide-y divide-line">
              {revisionQueue.slice(0, 3).map((item) => {
                const question = questionById(item.questionId)
                return (
                  <li key={item.questionId} className="flex items-center gap-2.5 py-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] text-ink-soft">
                        {question ? truncate(item.chapter, 34) : item.chapter}
                      </span>
                      <span className="text-[10.5px] text-muted">
                        {item.subject} · {item.lastSeen}
                      </span>
                    </span>
                    <span className="rounded-full bg-brand-soft px-1.5 py-0.5 text-[9px] font-medium text-brand-ink">
                      Due
                    </span>
                  </li>
                )
              })}
            </ul>
            <ButtonLink to="/app/revision" variant="secondary" size="sm" className="mt-2 w-full">
              <RotateCcw size={13} /> Open revision queue
            </ButtonLink>
          </section>

          {availablePaper ? (
            <section className="card p-4">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-surface-3 text-ink-soft">
                  <ClipboardList size={15} />
                </span>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-medium">Ready when you are</p>
                  <p className="truncate text-[11px] text-muted">{availablePaper.title}</p>
                </div>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-muted">
                {availablePaper.sections.length} sections ·{' '}
                {availablePaper.sections.reduce((sum, section) => sum + section.questionIds.length, 0)}{' '}
                questions · {availablePaper.durationMinutes} min
              </p>
              <Link
                to={`/app/mocks/${availablePaper.id}/instructions`}
                className="mt-2.5 inline-flex items-center gap-1 text-[12px] font-medium text-brand-ink hover:underline"
              >
                Start mini mock <ArrowRight size={12} />
              </Link>
            </section>
          ) : null}
        </div>
      </div>

      {nextPaper ? (
        <section className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gold-soft text-gold">
              <Clock size={16} />
            </span>
            <div>
              <p className="text-[13px] font-medium">Next full rehearsal: {nextPaper.title}</p>
              <p className="mt-0.5 text-[11.5px] text-muted">
                Opens {nextPaper.opensOn} · 100 questions · 60 minutes
              </p>
            </div>
          </div>
          <ButtonLink to="/app/mocks" variant="secondary" size="sm">
            View series <ArrowRight size={13} />
          </ButtonLink>
        </section>
      ) : null}

      <p className="px-1 text-[10.5px] leading-relaxed text-muted">
        Preview profile with sample data · {allChapters.length} chapters across {subjects.length}{' '}
        subjects. Answers and bookmarks stay in this browser.
      </p>
    </div>
  )
}

function truncate(value: string, max: number) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  foot,
}: {
  icon: LucideIcon
  label: string
  value: string
  hint: string
  foot: React.ReactNode
}) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11.5px] text-muted">{label}</p>
        <span className="grid h-7 w-7 place-items-center rounded-md border border-line bg-surface-2 text-ink-soft">
          <Icon size={14} strokeWidth={1.9} />
        </span>
      </div>
      <p className="num mt-2 font-display text-[27px] font-semibold leading-none">{value}</p>
      <div className="mt-1 flex items-center justify-between gap-2">{foot}</div>
      <p className="mt-2 border-t border-line pt-2 text-[10.5px] text-muted">{hint}</p>
    </div>
  )
}
