import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Check, Flame, Target, Timer, TrendingUp } from 'lucide-react'
import { Badge, ButtonLink, SectionLabel, Segmented } from '../../components/ui'
import { TrendChart, WeeklyActivityChart } from '../../components/charts'
import { tintDot, tintTile } from '../../components/subject-tint'
import {
  accuracyTrend,
  chapterPulse,
  learner,
  recentAttempts,
  weeklyActivity,
} from '../../data/learner'
import { subjects } from '../../data/subjects'
import { cn } from '../../lib/utils'
import { usePageTitle } from '../../lib/hooks'

export function Progress() {
  usePageTitle('Progress')
  const [range, setRange] = useState<'week' | 'month'>('week')
  const weekQuestions = weeklyActivity.reduce((sum, day) => sum + day.questions, 0)

  return (
    <div className="space-y-5">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <SectionLabel>Progress</SectionLabel>
          <h1 className="mt-1.5 text-[26px] font-semibold leading-tight sm:text-[30px]">
            What the numbers actually say
          </h1>
          <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-muted">
            Every figure shows the attempts behind it. A chapter with one attempt is labelled “too
            early to tell”, not weak.
          </p>
        </div>
        <Segmented
          ariaLabel="Reporting range"
          value={range}
          onChange={setRange}
          options={[
            { value: 'week', label: 'Last 7 days' },
            { value: 'month', label: 'Last 6 weeks' },
          ]}
        />
      </header>

      <section className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {[
          { label: 'Accuracy', value: `${accuracyTrend[accuracyTrend.length - 1].value}%`, note: '+3 pts vs last week', icon: Target },
          { label: 'Questions checked', value: String(weekQuestions), note: `${learner.streak}-day streak`, icon: Check },
          {
            label: 'Study time',
            value: `${Math.floor(learner.minutesThisWeek / 60)}h ${learner.minutesThisWeek % 60}m`,
            note: 'About 36 min a day',
            icon: Timer,
          },
          { label: 'Weekly goal', value: `${Math.round((learner.questionsThisWeek / learner.weeklyGoal) * 100)}%`, note: `${learner.questionsThisWeek} of ${learner.weeklyGoal} questions`, icon: Flame },
        ].map((item) => (
          <div key={item.label} className="card p-3.5">
            <div className="flex items-start justify-between">
              <p className="text-[11px] text-muted">{item.label}</p>
              <item.icon size={13} className="text-muted" />
            </div>
            <p className="num mt-2 font-display text-[23px] font-semibold leading-none">{item.value}</p>
            <p className="mt-1.5 text-[10px] text-muted">{item.note}</p>
            {item.label === 'Weekly goal' ? (
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-surface-3">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${Math.min(100, (learner.questionsThisWeek / learner.weeklyGoal) * 100)}%` }}
                />
              </div>
            ) : null}
          </div>
        ))}
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr] xl:items-start">
        <div className="space-y-4">
          <section className="card p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-[15px] font-semibold">
                  {range === 'week' ? 'Questions per day' : 'Accuracy over six weeks'}
                </h2>
                <p className="mt-0.5 text-[11px] text-muted">
                  {range === 'week'
                    ? 'Wednesday was a light day — 12 questions before the paper'
                    : 'Each point is built from at least 40 checked answers'}
                </p>
              </div>
              <Badge tone="neutral">
                <TrendingUp size={11} /> {range === 'week' ? `${weekQuestions} questions` : '+14 pts in 6 weeks'}
              </Badge>
            </div>
            <div className="mt-5">
              {range === 'week' ? (
                <WeeklyActivityChart data={weeklyActivity} />
              ) : (
                <TrendChart data={accuracyTrend} />
              )}
            </div>
          </section>

          <section className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-4 py-3.5 sm:px-5">
              <div>
                <h2 className="text-[15px] font-semibold">Chapter pulse</h2>
                <p className="mt-0.5 text-[11px] text-muted">Accuracy with the attempts behind it</p>
              </div>
              <span className="text-[10px] text-muted">8 chapters</span>
            </div>

            <div className="hidden grid-cols-[1.5fr_0.7fr_0.6fr_0.8fr_auto] gap-3 border-b border-line px-5 py-2 text-[10px] font-medium uppercase tracking-[0.08em] text-muted sm:grid">
              <span>Chapter</span>
              <span>Subject</span>
              <span>Attempts</span>
              <span>Accuracy</span>
              <span className="sr-only">Action</span>
            </div>
            <ul className="divide-y divide-line">
              {chapterPulse.map((item) => (
                <li
                  key={item.chapter}
                  className="grid grid-cols-[1.4fr_auto] items-center gap-2 px-4 py-2.5 sm:grid-cols-[1.5fr_0.7fr_0.6fr_0.8fr_auto] sm:gap-3 sm:px-5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[12px] text-ink">{item.chapter}</p>
                    <p className="text-[10px] text-muted sm:hidden">
                      {item.subject} · {item.attempts} attempts
                    </p>
                  </div>
                  <span className="hidden text-[11px] text-muted sm:block">{item.subject}</span>
                  <span className="num hidden text-[11px] text-ink-soft sm:block">{item.attempts}</span>
                  <div className="flex items-center justify-end gap-2 sm:justify-start">
                    <span className="num text-[11px] font-medium">
                      {item.accuracy === null ? '—' : `${item.accuracy}%`}
                    </span>
                    <span
                      className={cn(
                        'hidden rounded-full px-1.5 py-0.5 text-[8.5px] font-medium sm:inline',
                        item.status === 'Practise next'
                          ? 'bg-warning-soft text-warning'
                          : item.status === 'Steady'
                            ? 'bg-positive-soft text-positive'
                            : 'bg-surface-3 text-muted',
                      )}
                    >
                      {item.status}
                    </span>
                  </div>
                  <Link
                    to="/app/practice"
                    className="hidden text-[10.5px] text-brand-ink hover:underline sm:block"
                  >
                    Practise
                  </Link>
                </li>
              ))}
            </ul>
            <div className="border-t border-line bg-surface-2/40 px-4 py-2.5 text-[10px] text-muted sm:px-5">
              Chapters with fewer than three attempts stay unlabelled until there is enough evidence.
            </div>
          </section>

          <section className="card p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold">Mock history</h2>
              <Link to="/app/mocks" className="text-[11px] text-muted hover:text-ink">
                All mocks
              </Link>
            </div>
            <ul className="mt-3 divide-y divide-line">
              {recentAttempts.map((attempt) => (
                <li key={attempt.id}>
                  <Link
                    to={attempt.href}
                    className="group flex items-center justify-between gap-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[12.5px] text-ink">{attempt.paper}</p>
                      <p className="text-[10.5px] text-muted">
                        {attempt.date} · {attempt.subjectLabel}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2.5">
                      <span className="num text-[12px] font-medium">{attempt.score}</span>
                      <span className="h-1 w-12 overflow-hidden rounded-full bg-surface-3">
                        <span
                          className="block h-full rounded-full bg-brand"
                          style={{ width: `${attempt.accuracy}%` }}
                        />
                      </span>
                      <ArrowUpRight
                        size={13}
                        className="text-muted transition group-hover:text-ink"
                      />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-3">
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <p className="label">Subject accuracy</p>
              <span className="text-[10px] text-muted">this month</span>
            </div>
            <ul className="mt-3 space-y-3">
              {subjects.map((subject) => (
                <li key={subject.id}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          'grid h-5 w-5 place-items-center rounded font-display text-[8px] font-bold',
                          tintTile[subject.tint],
                        )}
                      >
                        {subject.code}
                      </span>
                      <span className="text-[11.5px] text-ink-soft">{subject.short}</span>
                    </span>
                    <span className="num text-[11.5px] font-medium">{subject.accuracy}%</span>
                  </div>
                  <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-surface-3">
                    <div
                      className={cn('h-full rounded-full', tintDot[subject.tint])}
                      style={{ width: `${subject.accuracy}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-3 border-t border-line pt-2.5 text-[10px] leading-relaxed text-muted">
              Reasoning is your lowest section this month. Two short syllogism sets would move it
              faster than another full paper.
            </p>
          </div>

          <div className="card p-4">
            <p className="label">Where time goes</p>
            <ul className="mt-2.5 space-y-2 text-[11.5px]">
              {[
                ['Practice sprints', '58%'],
                ['Mock papers', '27%'],
                ['Answers reviewed', '15%'],
              ].map(([label, value]) => (
                <li key={label} className="flex items-center justify-between gap-2">
                  <span className="text-muted">{label}</span>
                  <span className="num font-medium text-ink-soft">{value}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2.5 text-[10px] leading-relaxed text-muted">
              Based on {learner.minutesThisWeek} minutes of activity this week.
            </p>
          </div>

          <div className="rounded-xl border border-line bg-surface-2/50 p-4">
            <p className="text-[11.5px] font-medium">Next check-in</p>
            <p className="mt-1 text-[10.5px] leading-relaxed text-muted">
              Sunday’s full mock will refresh the section chart. Until then, keep the chapter pulse
              honest with short sets.
            </p>
            <ButtonLink to="/app/mocks" variant="secondary" size="sm" className="mt-2.5">
              View mock series <ArrowRight size={12} />
            </ButtonLink>
          </div>
        </aside>
      </div>

      <p className="px-1 text-[10px] text-muted">
        Sample analytics for the demo profile. In the live product these figures come from
        finalised attempts only.
      </p>
    </div>
  )
}
