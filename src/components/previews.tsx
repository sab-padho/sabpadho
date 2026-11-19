import { ArrowRight, Bookmark, Check, Flag, RotateCcw, Timer, TrendingUp } from 'lucide-react'
import { LogoMark } from './brand'
import { cn } from '../lib/utils'
import { useLang } from '../lib/lang'
import {
  chapterHindi,
  lastSeenLabel,
  sectionShort,
  subjectShortByLabel,
  useCopy,
} from '../lib/ui-copy'

export function HeroPreview() {
  const { lang } = useLang()
  const copy = useCopy()
  const revisionItems = [
    { title: 'Profit & loss', subject: 'Maths', soon: false },
    { title: 'Syllogisms', subject: 'Reasoning', soon: false },
    { title: 'Indian polity', subject: 'GK', soon: true },
  ]
  return (
    <div className="relative">
      <div
        className="absolute -inset-x-4 -bottom-4 top-8 rounded-[26px] border border-line bg-brand-soft/60"
        aria-hidden
      />
      <div className="card relative overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <div className="flex items-center gap-2">
            <LogoMark size={22} />
            <span className="font-display text-[12.5px] font-semibold">{copy.nav.desk}</span>
          </div>
          <span className="text-[10.5px] text-muted">{copy.preview.date}</span>
        </div>

        <div className="space-y-3 p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] text-muted">{copy.preview.evening}</p>
              <p className="mt-0.5 font-display text-[15px] font-semibold">SSC CGL 2027 · Tier I</p>
            </div>
            <span className="rounded-full bg-positive-soft px-2 py-0.5 text-[10px] font-medium text-positive">
              {copy.shell.streak(9)}
            </span>
          </div>

          <div className="rounded-xl border border-brand/15 bg-brand-soft px-3 py-2.5">
            <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-brand-ink/70">
              {copy.dashboard.continueLabel}
            </p>
            <div className="mt-1 flex items-center justify-between gap-3">
              <p className="text-[12.5px] font-medium text-brand-ink">{lang === 'hi' ? chapterHindi('Percentages') : 'Percentages'} · {copy.preview.of(7, 10)}</p>
              <span className="text-[10.5px] text-brand-ink/70">{copy.preview.minLeft(5)}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/60 dark:bg-black/20">
                <div className="h-full w-[70%] rounded-full bg-brand" />
              </div>
              <span className="num text-[10px] font-medium text-brand-ink">70%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { value: '72%', label: copy.dashboard.accuracy, icon: TrendingUp },
              { value: '6', label: copy.dashboard.dueToday, icon: RotateCcw },
              { value: '2', label: copy.dashboard.mocksTaken, icon: Timer },
              { value: '8', label: copy.dashboard.saved, icon: Bookmark },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg border border-line bg-surface-2/60 px-2.5 py-2">
                <div className="flex items-center justify-between">
                  <span className="num font-display text-[15px] font-semibold leading-none">
                    {stat.value}
                  </span>
                  <stat.icon size={12} className="text-muted" />
                </div>
                <p className="mt-1 text-[10px] leading-tight text-muted">{stat.label}</p>
              </div>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <p className="text-[10.5px] font-medium text-ink-soft">{copy.dashboard.revision}</p>
              <span className="text-[9.5px] text-muted">{copy.dashboard.dueCount(6)}</span>
            </div>
            <ul className="mt-1.5 space-y-1">
              {revisionItems.map((item) => (
                <li
                  key={item.title}
                  className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-1.5"
                >
                  <span
                    className={cn(
                      'h-1.5 w-1.5 shrink-0 rounded-full',
                      item.soon ? 'bg-line-strong' : 'bg-brand',
                    )}
                  />
                  <span className="flex-1 truncate text-[11px] text-ink-soft">
                    {lang === 'hi' ? chapterHindi(item.title) : item.title}
                  </span>
                  <span className="text-[9.5px] text-muted">
                    {subjectShortByLabel(lang, item.subject)}
                  </span>
                  <span className="text-[9.5px] font-medium text-ink-soft">
                    {item.soon ? copy.preview.tomorrow : copy.dashboard.due}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export function PracticePreview() {
  const { lang } = useLang()
  const copy = useCopy()
  return (
    <div className="card overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="label">{lang === 'hi' ? chapterHindi('Percentages') : 'Percentages'} · {copy.preview.of(4, 10)}</span>
          <span className="inline-flex items-center gap-1 text-[10.5px] text-positive">
            <Check size={11} /> {copy.attempt.saved}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="rounded-md border border-line px-1.5 py-0.5 text-[10px] text-ink-soft">EN</span>
          <span className="rounded-md px-1.5 py-0.5 text-[10px] text-muted">हिं</span>
        </div>
      </div>

      <div className="p-4">
        <p className="text-[13px] leading-relaxed text-ink">{copy.preview.prompt}</p>

        <div className="mt-3 space-y-1.5">
          {[
            { key: 'A', text: '8%', selected: true },
            { key: 'B', text: '10%', selected: false },
            { key: 'C', text: '12%', selected: false },
            { key: 'D', text: '15%', selected: false },
          ].map((option) => (
            <div
              key={option.key}
              className={cn(
                'flex items-center gap-2.5 rounded-lg border px-2.5 py-1.5 text-[12px]',
                option.selected
                  ? 'border-brand bg-brand-soft text-brand-ink'
                  : 'border-line bg-surface text-ink-soft',
              )}
            >
              <span
                className={cn(
                  'grid h-5 w-5 place-items-center rounded-full border text-[10px] font-semibold',
                  option.selected ? 'border-brand bg-brand text-white' : 'border-line text-muted',
                )}
              >
                {option.key}
              </span>
              {option.text}
              {option.selected ? (
                <span className="ml-auto text-[9.5px] font-medium text-brand-ink">{copy.practice.yourAnswer}</span>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-3 rounded-lg border border-positive/20 bg-positive-soft/70 p-2.5">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-positive">
            <Check size={12} /> {copy.preview.verdict}
          </p>
          <p className="mt-1 text-[10.5px] leading-relaxed text-ink-soft">
            {copy.preview.working}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[10.5px] text-muted">
            <span className="inline-flex items-center gap-1">
              <Bookmark size={12} /> {copy.preview.save}
            </span>
            <span className="inline-flex items-center gap-1">
              <Flag size={12} /> {copy.preview.review}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-md bg-brand px-2 py-1 text-[10.5px] font-medium text-white">
            {copy.preview.next} <ArrowRight size={11} />
          </span>
        </div>
      </div>
    </div>
  )
}

export function PalettePreview() {
  const { lang } = useLang()
  const copy = useCopy()
  const states = [
    'answered', 'answered', 'marked', 'answered', 'blank',
    'answered', 'answered', 'answered', 'marked', 'current',
    'answered', 'blank', 'answered', 'answered', 'answered',
    'marked', 'answered', 'answered', 'blank', 'answered',
    'answered', 'answered', 'marked', 'answered', 'answered',
  ]
  return (
    <div className="card overflow-hidden p-0">
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2.5">
        <div>
          <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-muted">
            SSC CGL · Mock 03
          </p>
          <p className="text-[12px] font-medium">{sectionShort(lang, 'General Intelligence & Reasoning')} · {copy.preview.qRange}</p>
        </div>
        <div className="text-right">
          <p className="num rounded-md border border-line px-2 py-1 text-[15px] font-semibold leading-none">
            41:12
          </p>
          <p className="mt-1 text-[9px] text-muted">{copy.preview.serverClock}</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 px-4 pt-3">
        {['General Intelligence & Reasoning', 'Quantitative Aptitude', 'English Comprehension', 'General Awareness'].map((tab, index) => (
          <span
            key={tab}
            className={cn(
              'rounded-md px-2 py-1 text-[10px]',
              index === 0 ? 'bg-brand-soft font-medium text-brand-ink' : 'text-muted',
            )}
          >
            {sectionShort(lang, tab)}
          </span>
        ))}
        <span className="ml-auto inline-flex items-center gap-1 text-[9.5px] text-positive">
          <Check size={10} /> {copy.attempt.allSaved}
        </span>
      </div>
      <div className="grid grid-cols-5 gap-1.5 p-4">
        {states.map((state, index) => (
          <span
            key={index}
            className={cn(
              'relative grid h-8 place-items-center rounded-md border text-[11px] font-medium',
              state === 'answered' && 'border-brand/25 bg-brand-soft text-brand-ink',
              state === 'marked' && 'border-gold/40 bg-gold-soft text-gold',
              state === 'blank' && 'border-line bg-surface text-muted',
              state === 'current' && 'border-brand bg-brand text-white',
            )}
          >
            {index + 1}
            {state === 'marked' ? (
              <span className="absolute right-0.5 top-0.5 h-1 w-1 rounded-full bg-gold" />
            ) : null}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line px-4 py-2.5 text-[9.5px] text-muted">
        <span className="inline-flex items-center gap-1">
          <i className="h-2.5 w-2.5 rounded-[3px] border border-brand/30 bg-brand-soft" /> {copy.attempt.answered}
        </span>
        <span className="inline-flex items-center gap-1">
          <i className="h-2.5 w-2.5 rounded-[3px] border border-gold/40 bg-gold-soft" /> {copy.attempt.marked}
        </span>
        <span className="inline-flex items-center gap-1">
          <i className="h-2.5 w-2.5 rounded-[3px] border border-line bg-surface" /> {copy.attempt.notAnswered}
        </span>
        <span className="inline-flex items-center gap-1">
          <i className="h-2.5 w-2.5 rounded-[3px] bg-brand" /> {copy.attempt.current}
        </span>
      </div>
    </div>
  )
}

export function DuePreview() {
  const { lang } = useLang()
  const copy = useCopy()
  const dueItems = [
    { chapter: 'Profit & loss', subject: 'Maths', seen: '3 days ago' },
    { chapter: 'Syllogisms', subject: 'Reasoning', seen: '2 days ago' },
    { chapter: 'Synonyms', subject: 'English', seen: '5 days ago' },
    { chapter: 'Indian polity', subject: 'GK', seen: 'Yesterday' },
  ]
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-semibold">{copy.revision.dueToday}</p>
        <span className="chip py-0.5! text-[10.5px]">{copy.revision.questionsN(6)}</span>
      </div>
      <ul className="mt-3 divide-y divide-line">
        {dueItems.map((item) => (
          <li key={item.chapter} className="flex items-center gap-3 py-2.5">
            <span className="grid h-2 w-2 shrink-0 place-items-center rounded-full bg-brand" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] text-ink">
                {lang === 'hi' ? chapterHindi(item.chapter) : item.chapter}
              </p>
              <p className="text-[10px] text-muted">
                {subjectShortByLabel(lang, item.subject)} ·{' '}
                {copy.preview.lastSeen(lastSeenLabel(lang, item.seen))}
              </p>
            </div>
            <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[9.5px] font-medium text-brand-ink">
              {copy.dashboard.due}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
        <p className="text-[10.5px] text-muted">{copy.preview.rule}</p>
        <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-brand-ink">
          {copy.preview.start} <ArrowRight size={11} />
        </span>
      </div>
    </div>
  )
}
