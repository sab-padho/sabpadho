import { cn } from '../lib/utils'
import { useLang } from '../lib/lang'
import { useCopy, weekdayShort } from '../lib/ui-copy'

export function WeeklyActivityChart({
  data,
  className,
}: {
  data: Array<{ label: string; date?: string; questions: number }>
  className?: string
}) {
  const { lang } = useLang()
  const copy = useCopy()
  const max = Math.max(...data.map((d) => d.questions), 1)
  const ceiling = Math.max(10, Math.ceil((max * 1.2) / 10) * 10)
  const activeIndex = data.reduce(
    (best, item, index) => (item.questions > data[best].questions ? index : best),
    0,
  )

  return (
    <div className={cn('flex gap-3', className)}>
      <div className="flex h-[152px] flex-col justify-between pb-6 text-[10.5px] text-muted">
        <span className="num">{ceiling}</span>
        <span className="num">{Math.round(ceiling / 2)}</span>
        <span className="num">0</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="relative h-[152px]">
          {[0, 0.5, 1].map((at) => (
            <div
              key={at}
              className="absolute inset-x-0 border-t border-dashed border-line"
              style={{ top: `${at * 100}%` }}
              aria-hidden
            />
          ))}
          <div className="absolute inset-0 flex items-end gap-1.5 sm:gap-2.5">
            {data.map((item, index) => {
              const height = Math.max(3, (item.questions / ceiling) * 100)
              const active = index === activeIndex && item.questions > 0
              return (
                <div key={item.label} className="group relative flex h-full flex-1 items-end">
                  {item.questions > 0 ? (
                    <div
                      className={cn(
                        'chart-bar relative w-full rounded-t-[4px] rounded-b-[3px] transition-colors',
                        active ? 'bg-brand' : 'bar-hatch group-hover:bg-brand-soft',
                      )}
                      style={{ height: `${height}%`, animationDelay: `${index * 45}ms` }}
                    >
                      <span
                        className={cn(
                          'pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-1.5 py-1 text-[10px] font-medium text-canvas opacity-0 shadow-md transition-opacity',
                          active ? 'opacity-100' : 'group-hover:opacity-100',
                        )}
                      >
                        {copy.practice.questions(item.questions)}
                      </span>
                    </div>
                  ) : (
                    <div className="w-full rounded-[3px] bg-surface-3" style={{ height: 3 }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
        <div className="mt-2 flex gap-1.5 sm:gap-2.5">
          {data.map((item, index) => (
            <div
              key={item.label}
              className={cn(
                'flex-1 text-center text-[10.5px] leading-tight',
                index === activeIndex ? 'font-semibold text-ink' : 'text-muted',
              )}
            >
              {weekdayShort(lang, item.label)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function AccuracyRing({
  value,
  label = 'accuracy',
  size = 148,
  tone = 'brand',
}: {
  value: number
  label?: string
  size?: number
  tone?: 'brand' | 'positive'
}) {
  const stroke = size >= 120 ? 10 : 8
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--surface-3)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={tone === 'positive' ? 'var(--positive)' : 'var(--brand)'}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            'num font-display font-semibold leading-none text-ink',
            size < 80 ? 'text-[13px]' : 'text-[28px]',
          )}
        >
          {value}%
        </span>
        {label && size >= 80 ? <span className="mt-1 text-[11px] text-muted">{label}</span> : null}
      </div>
      <span className="sr-only">
        {value} percent {label}
      </span>
    </div>
  )
}

export function TrendChart({ data }: { data: Array<{ label: string; value: number }> }) {
  const width = 100
  const height = 40
  const min = Math.min(...data.map((d) => d.value)) - 6
  const max = Math.max(...data.map((d) => d.value)) + 4
  const points = data.map((d, i) => {
    const x = (i / Math.max(1, data.length - 1)) * width
    const y = height - ((d.value - min) / (max - min)) * height
    return { x, y, ...d }
  })
  const line = points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')
  const area = `0,${height} ${line} ${width},${height}`
  const last = points[points.length - 1]
  const id = 'trend-grad'

  return (
    <div>
      <div className="relative h-[120px] w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="h-full w-full overflow-visible"
          aria-hidden
        >
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.24" />
              <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((fraction) => (
            <line
              key={fraction}
              x1="0"
              x2={width}
              y1={height * fraction}
              y2={height * fraction}
              stroke="var(--line)"
              strokeDasharray="2 2"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <polygon points={area} fill={`url(#${id})`} />
          <polyline
            points={line}
            fill="none"
            stroke="var(--brand)"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <line
            x1={last.x}
            x2={last.x}
            y1={last.y}
            y2={height}
            stroke="var(--brand)"
            strokeOpacity="0.35"
            strokeDasharray="2 2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <span
          className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-brand"
          style={{ left: `${last.x}%`, top: `${(last.y / height) * 100}%` }}
          aria-hidden
        />
      </div>
      <div className="mt-2 flex justify-between text-[10.5px] text-muted">
        {data.map((d, i) => (
          <span key={d.label} className={i === data.length - 1 ? 'font-semibold text-ink' : undefined}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export function SectionScoreBars({
  sections,
}: {
  sections: Array<{ name: string; correct: number; total: number }>
}) {
  return (
    <ul className="space-y-3.5">
      {sections.map((section) => {
        const value = Math.round((section.correct / section.total) * 100)
        return (
          <li key={section.name}>
            <div className="flex items-baseline justify-between gap-3 text-[13px]">
              <span className="truncate text-ink-soft">{section.name}</span>
              <span className="num shrink-0 font-medium text-ink">
                {section.correct}
                <span className="text-muted"> / {section.total}</span>
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
              <div
                className="h-full rounded-full bg-brand transition-[width] duration-700"
                style={{ width: `${value}%` }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export function ScoreSplitBar({
  correct,
  wrong,
  unattempted,
}: {
  correct: number
  wrong: number
  unattempted: number
}) {
  const copy = useCopy()
  const total = Math.max(1, correct + wrong + unattempted)
  return (
    <div>
      <div className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full">
        <div className="bg-positive" style={{ width: `${(correct / total) * 100}%` }} />
        <div className="bg-negative/70" style={{ width: `${(wrong / total) * 100}%` }} />
        <div className="bg-surface-3" style={{ width: `${(unattempted / total) * 100}%` }} />
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[11.5px] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <i className="h-2 w-2 rounded-[2px] bg-positive" /> {correct} {copy.result.correct.toLowerCase()}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="h-2 w-2 rounded-[2px] bg-negative/70" /> {wrong} {copy.result.wrong.toLowerCase()}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="h-2 w-2 rounded-[2px] bg-surface-3 ring-1 ring-inset ring-line-strong" />{' '}
          {unattempted} {copy.result.unattempted.toLowerCase()}
        </span>
      </div>
    </div>
  )
}
