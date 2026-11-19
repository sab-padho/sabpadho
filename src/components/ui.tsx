import { useEffect, useId, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { cn } from '../lib/utils'
import { useCopy } from '../lib/ui-copy'

type Variant = 'primary' | 'secondary' | 'ghost' | 'dark'
type Size = 'sm' | 'md' | 'lg'

const variantClass: Record<Variant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  dark: 'btn-dark',
}

const sizeClass: Record<Size, string> = { sm: 'btn-sm', md: '', lg: 'btn-lg' }

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', extra?: string) {
  return cn('btn', variantClass[variant], sizeClass[size], extra)
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button type="button" className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </button>
  )
}

export function ButtonLink({
  to,
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}: {
  to: string
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
} & Omit<React.ComponentProps<typeof Link>, 'to' | 'className' | 'children'>) {
  return (
    <Link to={to} className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </Link>
  )
}

const toneClass = {
  brand: 'border-transparent bg-brand-soft text-brand-ink',
  neutral: 'border-line bg-surface-2 text-ink-soft',
  positive: 'border-transparent bg-positive-soft text-positive',
  negative: 'border-transparent bg-negative-soft text-negative',
  warning: 'border-transparent bg-warning-soft text-warning',
  gold: 'border-transparent bg-gold-soft text-gold',
  outline: 'border-line bg-transparent text-muted',
} as const

export type Tone = keyof typeof toneClass

export function Badge({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: Tone
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-5',
        toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('label', className)}>{children}</p>
}

export function ProgressBar({
  value,
  tone = 'brand',
  height = 6,
  label,
  className,
}: {
  value: number
  tone?: 'brand' | 'positive' | 'gold'
  height?: number
  label?: string
  className?: string
}) {
  const bar =
    tone === 'positive' ? 'bg-positive' : tone === 'gold' ? 'bg-gold' : 'bg-brand'
  return (
    <div
      className={cn('w-full overflow-hidden rounded-full bg-surface-3', className)}
      style={{ height }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? 'Progress'}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-500', bar)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  ariaLabel,
  size = 'md',
  className,
}: {
  options: Array<{ value: T; label: ReactNode; hint?: string }>
  value: T
  onChange: (value: T) => void
  ariaLabel: string
  size?: 'sm' | 'md'
  className?: string
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center gap-0.5 rounded-[10px] border border-line bg-surface-2 p-0.5',
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={String(option.value)}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-[8px] font-medium transition',
              size === 'sm' ? 'px-2 py-1 text-[12px]' : 'px-2.5 py-1.5 text-[13px]',
              active
                ? 'bg-surface text-ink shadow-[0_1px_2px_rgba(23,19,31,0.08)]'
                : 'text-muted hover:text-ink',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export function Avatar({
  initials,
  size = 34,
  className,
}: {
  initials: string
  size?: number
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-grid shrink-0 place-items-center rounded-full bg-brand-soft font-display font-semibold text-brand-ink ring-1 ring-inset ring-brand/15',
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden
    >
      {initials}
    </span>
  )
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = 'max-w-md',
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
  width?: string
}) {
  const titleId = useId()
  const copy = useCopy()

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-[#0b0814]/55 backdrop-blur-[2px] animate-fade"
        aria-label={copy.a11y.closeDialog}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'animate-pop relative w-full rounded-t-2xl border border-line bg-surface p-5 shadow-[var(--shadow-pop)] sm:rounded-2xl sm:p-6',
          width,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
            {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 -mt-1 rounded-lg p-1.5 text-muted transition hover:bg-surface-3 hover:text-ink"
            aria-label={copy.a11y.close}
          >
            <X size={16} />
          </button>
        </div>
        {children ? <div className="mt-4">{children}</div> : null}
        {footer ? <div className="mt-5 flex flex-wrap justify-end gap-2">{footer}</div> : null}
      </div>
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode
  title: string
  body: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <div className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-surface-2 text-muted">
        {icon}
      </div>
      <h3 className="mt-4 text-[15px] font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted">{body}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}

export function Switch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <div className="min-w-0">
        <p className="text-[12.5px] font-medium text-ink">{label}</p>
        {description ? (
          <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{description}</p>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 h-5 w-9 shrink-0 rounded-full border transition-colors',
          checked ? 'border-brand bg-brand' : 'border-line-strong bg-surface-3',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-all dark:bg-ink',
            checked ? 'left-[18px]' : 'left-0.5',
          )}
        />
      </button>
    </div>
  )
}
