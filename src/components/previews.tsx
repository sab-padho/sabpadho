import { ArrowRight, Bookmark, Check, Flag, RotateCcw, Timer, TrendingUp } from 'lucide-react'
import { LogoMark } from './brand'
import { cn } from '../lib/utils'

export function HeroPreview() {
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
            <span className="font-display text-[12.5px] font-semibold">Study desk</span>
          </div>
          <span className="text-[10.5px] text-muted">Thu, 19 Nov</span>
        </div>

        <div className="space-y-3 p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] text-muted">Good evening, Aarav</p>
              <p className="mt-0.5 font-display text-[15px] font-semibold">SSC CGL 2027 · Tier I</p>
            </div>
            <span className="rounded-full bg-positive-soft px-2 py-0.5 text-[10px] font-medium text-positive">
              9-day streak
            </span>
          </div>

          <div className="rounded-xl border border-brand/15 bg-brand-soft px-3 py-2.5">
            <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-brand-ink/70">
              Continue where you left off
            </p>
            <div className="mt-1 flex items-center justify-between gap-3">
              <p className="text-[12.5px] font-medium text-brand-ink">Percentages · 7 of 10</p>
              <span className="text-[10.5px] text-brand-ink/70">5 min left</span>
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
              { value: '72%', label: 'Accuracy this week', icon: TrendingUp },
              { value: '6', label: 'Questions due today', icon: RotateCcw },
              { value: '2', label: 'Mocks taken', icon: Timer },
              { value: '8', label: 'Saved questions', icon: Bookmark },
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
              <p className="text-[10.5px] font-medium text-ink-soft">Today’s revision</p>
              <span className="text-[9.5px] text-muted">6 due</span>
            </div>
            <ul className="mt-1.5 space-y-1">
              {[
                { title: 'Profit & loss', subject: 'Maths', when: 'Due' },
                { title: 'Syllogisms', subject: 'Reasoning', when: 'Due' },
                { title: 'Indian polity', subject: 'GK', when: 'Tomorrow' },
              ].map((item) => (
                <li
                  key={item.title}
                  className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-1.5"
                >
                  <span
                    className={cn(
                      'h-1.5 w-1.5 shrink-0 rounded-full',
                      item.when === 'Due' ? 'bg-brand' : 'bg-line-strong',
                    )}
                  />
                  <span className="flex-1 truncate text-[11px] text-ink-soft">{item.title}</span>
                  <span className="text-[9.5px] text-muted">{item.subject}</span>
                  <span className="text-[9.5px] font-medium text-ink-soft">{item.when}</span>
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
  return (
    <div className="card overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="label">Percentages · 4 of 10</span>
          <span className="inline-flex items-center gap-1 text-[10.5px] text-positive">
            <Check size={11} /> Saved
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="rounded-md border border-line px-1.5 py-0.5 text-[10px] text-ink-soft">EN</span>
          <span className="rounded-md px-1.5 py-0.5 text-[10px] text-muted">हिं</span>
        </div>
      </div>

      <div className="p-4">
        <p className="text-[13px] leading-relaxed text-ink">
          A shopkeeper marks an article 20% above its cost price and then allows a 10% discount. What
          is his profit percentage?
        </p>

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
                <span className="ml-auto text-[9.5px] font-medium text-brand-ink">Your answer</span>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-3 rounded-lg border border-positive/20 bg-positive-soft/70 p-2.5">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-positive">
            <Check size={12} /> Correct — the answer is 8%
          </p>
          <p className="mt-1 text-[10.5px] leading-relaxed text-ink-soft">
            Take cost price as 100 → marked price 120 → after 10% discount 108. Profit = 8.
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[10.5px] text-muted">
            <span className="inline-flex items-center gap-1">
              <Bookmark size={12} /> Save
            </span>
            <span className="inline-flex items-center gap-1">
              <Flag size={12} /> Review
            </span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-md bg-brand px-2 py-1 text-[10.5px] font-medium text-white">
            Next <ArrowRight size={11} />
          </span>
        </div>
      </div>
    </div>
  )
}

export function PalettePreview() {
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
          <p className="text-[12px] font-medium">Reasoning · questions 1–25</p>
        </div>
        <div className="text-right">
          <p className="num rounded-md border border-line px-2 py-1 text-[15px] font-semibold leading-none">
            41:12
          </p>
          <p className="mt-1 text-[9px] text-muted">server clock</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 px-4 pt-3">
        {['Reasoning', 'Quant', 'English', 'GA'].map((tab, index) => (
          <span
            key={tab}
            className={cn(
              'rounded-md px-2 py-1 text-[10px]',
              index === 0 ? 'bg-brand-soft font-medium text-brand-ink' : 'text-muted',
            )}
          >
            {tab}
          </span>
        ))}
        <span className="ml-auto inline-flex items-center gap-1 text-[9.5px] text-positive">
          <Check size={10} /> All saved
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
          <i className="h-2.5 w-2.5 rounded-[3px] border border-brand/30 bg-brand-soft" /> Answered
        </span>
        <span className="inline-flex items-center gap-1">
          <i className="h-2.5 w-2.5 rounded-[3px] border border-gold/40 bg-gold-soft" /> Marked
        </span>
        <span className="inline-flex items-center gap-1">
          <i className="h-2.5 w-2.5 rounded-[3px] border border-line bg-surface" /> Not answered
        </span>
        <span className="inline-flex items-center gap-1">
          <i className="h-2.5 w-2.5 rounded-[3px] bg-brand" /> Current
        </span>
      </div>
    </div>
  )
}

export function DuePreview() {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-semibold">Due today</p>
        <span className="chip py-0.5! text-[10.5px]">6 questions</span>
      </div>
      <ul className="mt-3 divide-y divide-line">
        {[
          { chapter: 'Profit & loss', subject: 'Maths', seen: 'last seen 3 days ago', due: 'Due' },
          { chapter: 'Syllogisms', subject: 'Reasoning', seen: 'last seen 2 days ago', due: 'Due' },
          { chapter: 'Synonyms', subject: 'English', seen: 'last seen 5 days ago', due: 'Due' },
          { chapter: 'Indian polity', subject: 'GK', seen: 'last seen yesterday', due: 'Due' },
        ].map((item) => (
          <li key={item.chapter} className="flex items-center gap-3 py-2.5">
            <span className="grid h-2 w-2 shrink-0 place-items-center rounded-full bg-brand" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] text-ink">{item.chapter}</p>
              <p className="text-[10px] text-muted">
                {item.subject} · {item.seen}
              </p>
            </div>
            <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[9.5px] font-medium text-brand-ink">
              {item.due}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
        <p className="text-[10.5px] text-muted">Correct retry → later · missed → sooner</p>
        <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-brand-ink">
          Start <ArrowRight size={11} />
        </span>
      </div>
    </div>
  )
}
