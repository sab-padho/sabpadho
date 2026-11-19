import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ClipboardList,
  Clock,
  RotateCcw,
  TrendingUp,
} from 'lucide-react'
import { Badge, ButtonLink, SectionLabel } from '../../components/ui'
import { WeeklyActivityChart, AccuracyRing } from '../../components/charts'
import {
  accuracyTrend,
  learner,
  recentAttempts,
  resumeSprint,
  revisionQueue,
  weeklyActivity,
} from '../../data/learner'
import { subjects, allChapters, chapterById } from '../../data/subjects'
import { questionById, questionsForChapter } from '../../data/questions'
import { mockPapers } from '../../data/mocks'
import { tintDot, tintTile } from '../../components/subject-tint'
import { cn } from '../../lib/utils'
import { usePageTitle } from '../../lib/hooks'
import { useLang } from '../../lib/lang'
import { useCopy, chapterHindi, localDate, mockKindLabel, subjectLabel } from '../../lib/ui-copy'

function greeting(copy: ReturnType<typeof useCopy>) {
  const hour = new Date().getHours()
  if (hour < 12) return copy.dashboard.morning
  if (hour < 17) return copy.dashboard.afternoon
  return copy.dashboard.evening
}

export function Dashboard() {
  const { lang } = useLang()
  const copy = useCopy()
  usePageTitle(copy.nav.desk)
  const nextPaper = mockPapers.find((paper) => paper.status === 'scheduled')
  const availablePaper = mockPapers.find((paper) => paper.id === 'mini-06')
  const weekAccuracy = accuracyTrend[accuracyTrend.length - 1].value
  const resumeQuestions = questionsForChapter('maths-percentages').length
  const resumeChapter =
    lang === 'hi' ? chapterHindi(resumeSprint.chapterTitle) : resumeSprint.chapterTitle
  const resumeSubject =
    subjects.find((subject) => subject.name.en === resumeSprint.subjectTitle)?.name[lang] ??
    resumeSprint.subjectTitle
  const resumePct = Math.round((resumeSprint.answered / resumeSprint.total) * 100)

  return (
    <div className="space-y-5">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <SectionLabel>
              {greeting(copy)}, {lang === 'hi' ? 'आरव' : learner.firstName}
            </SectionLabel>
            <Badge tone="outline">{copy.dashboard.preview}</Badge>
          </div>
          <h1 className="mt-1.5 text-[26px] font-semibold leading-tight sm:text-[30px]">
            {copy.dashboard.title}
          </h1>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12.5px] text-muted">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={13} /> {copy.dashboard.date}
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-line-strong sm:block" />
            <span>{learner.target}</span>
            <span className="hidden h-1 w-1 rounded-full bg-line-strong sm:block" />
            <span className="font-medium text-ink-soft">
              {copy.dashboard.daysToGo(learner.daysToExam)}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink to="/app/practice" size="sm">
            <span className="hidden sm:inline">{copy.dashboard.startSprint}</span>
            <span className="sm:hidden">{copy.dashboard.sprintShort}</span>
            <ArrowRight size={14} />
          </ButtonLink>
          <ButtonLink to="/app/mocks" variant="secondary" size="sm">
            <ClipboardList size={14} /> {copy.dashboard.mocks}
          </ButtonLink>
        </div>
      </header>

      <section className="card border-brand/20 bg-brand-soft p-4 sm:p-5">
        <div className="grid items-center gap-5 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[9.5px] font-semibold uppercase tracking-[0.13em] text-brand-ink/75">
                {copy.dashboard.continueLabel}
              </p>
              <span className="rounded-full bg-white/60 px-1.5 py-0.5 text-[9.5px] font-medium text-brand-ink dark:bg-black/25">
                {copy.dashboard.sprintBadge}
              </span>
            </div>
            <h2 className="mt-2 font-display text-[19px] font-semibold leading-snug text-brand-ink sm:text-[22px]">
              {copy.dashboard.resumeTitle(resumeChapter, resumeSprint.answered, resumeSprint.total)}
            </h2>
            <p className="mt-1 text-[12px] text-brand-ink/75">
              {copy.dashboard.resumeSub(resumeSubject, resumeSprint.minutesLeft, resumeQuestions)}
            </p>
            <div className="mt-3.5 flex flex-wrap gap-1.5">
              <Link to="/app/practice/percentages" className="btn btn-sm btn-primary">
                {copy.dashboard.resume} <ArrowRight size={13} />
              </Link>
              <Link
                to="/app/practice"
                className="btn btn-sm border border-brand/20 bg-white/50 text-brand-ink hover:bg-white/80 dark:bg-black/20 dark:hover:bg-black/30"
              >
                {copy.dashboard.newSprint}
              </Link>
            </div>
          </div>
          <div className="lg:w-full lg:max-w-[260px] lg:justify-self-end">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-[11px] font-medium text-brand-ink/75">
                {copy.dashboard.sprintProgress}
              </p>
              <p className="num font-display text-[26px] font-semibold leading-none text-brand-ink">
                {resumePct}%
              </p>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/60 dark:bg-black/25">
              <div className="h-full rounded-full bg-brand" style={{ width: `${resumePct}%` }} />
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line xl:grid-cols-4">
        <StatCell
          label={copy.dashboard.dueToday}
          value={String(revisionQueue.length)}
          hint={copy.dashboard.fromYesterday}
          foot={
            <Link
              to="/app/revision"
              className="inline-flex items-center gap-1 font-medium text-brand-ink hover:underline"
            >
              {copy.dashboard.openRevision} <ArrowRight size={11} />
            </Link>
          }
        />
        <StatCell
          label={copy.dashboard.accuracy}
          value={`${weekAccuracy}%`}
          hint={copy.dashboard.acrossAnswers}
          foot={
            <span className="inline-flex items-center gap-1 font-medium text-positive">
              <TrendingUp size={11} /> {copy.dashboard.pts}
            </span>
          }
        />
        <StatCell
          label={copy.dashboard.mocksTaken}
          value="2"
          hint={copy.dashboard.oneFull}
          foot={
            <span className="text-muted">
              {copy.dashboard.best}{' '}
              <span className="font-medium text-ink-soft">133.5 / 200</span>
            </span>
          }
        />
        <StatCell
          label={copy.dashboard.saved}
          value="8"
          hint={copy.dashboard.filtered}
          foot={
            <Link
              to="/app/shelf"
              className="inline-flex items-center gap-1 font-medium text-brand-ink hover:underline"
            >
              {copy.dashboard.openShelf} <ArrowRight size={11} />
            </Link>
          }
        />
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <div className="space-y-4">
          <section className="card p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-[15px] font-semibold">{copy.dashboard.activity}</h2>
                <p className="mt-0.5 text-[11.5px] text-muted">{copy.dashboard.activitySub}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="neutral">
                  <span className="h-1.5 w-1.5 rounded-full bg-positive" />{' '}
                  {copy.shell.streak(learner.streak)}
                </Badge>
                <Badge tone="brand">{copy.dashboard.weekChip(learner.questionsThisWeek)}</Badge>
              </div>
            </div>

            <div className="mt-5">
              <WeeklyActivityChart data={weeklyActivity} />
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <div className="flex items-center gap-2.5">
                <AccuracyRing value={weekAccuracy} size={60} label="" />
                <div>
                  <p className="text-[12px] font-medium">{copy.dashboard.weeklyAccuracy}</p>
                  <p className="text-[11px] text-muted">{copy.dashboard.highestLowest}</p>
                </div>
              </div>
              <Link
                to="/app/progress"
                className="inline-flex items-center gap-1 text-[12px] font-medium text-brand-ink hover:underline"
              >
                {copy.dashboard.fullProgress} <ArrowRight size={13} />
              </Link>
            </div>
          </section>

          <section className="card overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5">
              <div>
                <h2 className="text-[15px] font-semibold">{copy.dashboard.attempts}</h2>
                <p className="mt-0.5 text-[11.5px] text-muted">{copy.dashboard.attemptsSub}</p>
              </div>
              <Link
                to="/app/mocks"
                className="hidden items-center gap-1 text-[12px] font-medium text-brand-ink hover:underline sm:inline-flex"
              >
                {copy.dashboard.allMocks} <ArrowRight size={13} />
              </Link>
            </div>

            <div className="hidden grid-cols-[1.6fr_1fr_0.8fr_1fr_auto] gap-3 border-b border-line px-5 py-2 text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted sm:grid">
              <span>{copy.dashboard.paper}</span>
              <span>{copy.dashboard.section}</span>
              <span>{copy.dashboard.dateLabel}</span>
              <span>{copy.dashboard.score}</span>
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
                        {localDate(lang, attempt.date)} · {attempt.score}
                      </span>
                    </span>
                    <span className="hidden truncate text-[11.5px] text-muted sm:block">
                      {mockKindLabel(lang, attempt.subjectLabel)}
                    </span>
                    <span className="hidden text-[11.5px] text-muted sm:block">
                      {localDate(lang, attempt.date)}
                    </span>
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
          <section className="card p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[14.5px] font-semibold">{copy.dashboard.subjects}</h2>
              <Link to="/app/practice" className="text-[11px] text-muted hover:text-ink">
                {copy.dashboard.practise}
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
                        <span className="truncate text-[12px] text-ink-soft">
                          {subjectLabel(lang, subject)}
                        </span>
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
                          {copy.dashboard.chapterCount(subject.chapters.length)}
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
              <h2 className="text-[14.5px] font-semibold">{copy.dashboard.revision}</h2>
              <span className="num text-[11px] text-muted">
                {copy.dashboard.dueCount(revisionQueue.length)}
              </span>
            </div>
            <ul className="mt-2.5 divide-y divide-line">
              {revisionQueue.slice(0, 3).map((item) => {
                const question = questionById(item.questionId)
                return (
                  <li key={item.questionId} className="flex items-center gap-2.5 py-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] text-ink-soft">
                        {question && lang === 'hi'
                          ? (chapterById(question.chapterId)?.title.hi ?? item.chapter)
                          : truncate(item.chapter, 34)}
                      </span>
                      <span className="text-[10.5px] text-muted">
                        {lang === 'hi' ? subjectHindi(item.subject) : item.subject} ·{' '}
                        {lang === 'hi' ? lastSeenHindi(item.lastSeen) : item.lastSeen}
                      </span>
                    </span>
                    <span className="rounded-full bg-brand-soft px-1.5 py-0.5 text-[9px] font-medium text-brand-ink">
                      {copy.dashboard.due}
                    </span>
                  </li>
                )
              })}
            </ul>
            <ButtonLink to="/app/revision" variant="secondary" size="sm" className="mt-2 w-full">
              <RotateCcw size={13} /> {copy.dashboard.openQueue}
            </ButtonLink>
          </section>

          {availablePaper ? (
            <section className="card p-4">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-surface-3 text-ink-soft">
                  <ClipboardList size={15} />
                </span>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-medium">{copy.dashboard.ready}</p>
                  <p className="truncate text-[11px] text-muted">{availablePaper.title}</p>
                </div>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-muted">
                {copy.dashboard.readySub(
                  availablePaper.sections.length,
                  availablePaper.sections.reduce((sum, section) => sum + section.questionIds.length, 0),
                )}
              </p>
              <Link
                to={`/app/mocks/${availablePaper.id}/instructions`}
                className="mt-2.5 inline-flex items-center gap-1 text-[12px] font-medium text-brand-ink hover:underline"
              >
                {copy.dashboard.openPaper} <ArrowRight size={12} />
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
              <p className="text-[13px] font-medium">{copy.dashboard.nextRehearsal}: {nextPaper.title}</p>
              <p className="mt-0.5 text-[11.5px] text-muted">
                {nextPaper.opensOn ? copy.dashboard.opensLine(localDate(lang, nextPaper.opensOn)) : null}
              </p>
            </div>
          </div>
          <ButtonLink to="/app/mocks" variant="secondary" size="sm">
            {copy.dashboard.viewSeries} <ArrowRight size={13} />
          </ButtonLink>
        </section>
      ) : null}

      <p className="px-1 text-[10.5px] leading-relaxed text-muted">
        {copy.dashboard.preview} · {copy.dashboard.chaptersAcross(allChapters.length, subjects.length)}{' '}
        {copy.dashboard.footerTail}
      </p>
    </div>
  )
}

function truncate(value: string, max: number) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value
}

const subjectHindi = (subject: string) =>
  ({
    Maths: 'गणित',
    Reasoning: 'तर्कशक्ति',
    English: 'अंग्रेज़ी',
    GK: 'सामान्य ज्ञान',
    Hindi: 'हिंदी',
  })[subject] ?? subject

const lastSeenHindi = (value: string) => {
  if (value === 'Yesterday') return 'कल'
  const match = value.match(/^(\d+) days ago$/)
  return match ? `${match[1]} दिन पहले` : value
}

function StatCell({
  label,
  value,
  hint,
  foot,
}: {
  label: string
  value: string
  hint: string
  foot: React.ReactNode
}) {
  return (
    <div className="flex min-h-[138px] flex-col bg-surface p-4">
      <p className="num font-display text-[27px] font-semibold leading-none">{value}</p>
      <p className="mt-1.5 text-[11.5px] leading-snug text-muted">{label}</p>
      <div className="mt-auto pt-2.5">
        <div className="text-[11px]">{foot}</div>
        <p className="mt-1.5 truncate text-[10px] text-muted">{hint}</p>
      </div>
    </div>
  )
}
