import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'
import type { DayPoint } from './data'

/* ------------------------------------------------------------------ formatting */

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

export const formatDate = (iso: string) => dateFormat.format(new Date(iso))

export function relativeTime(iso: string) {
  const then = new Date(iso).getTime()
  const minutes = Math.round((Date.now() - then) / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  const days = Math.round(hours / 24)
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  const weeks = Math.round(days / 7)
  if (weeks < 5) return `${weeks} week${weeks === 1 ? '' : 's'} ago`
  const months = Math.round(days / 30)
  return `${months} month${months === 1 ? '' : 's'} ago`
}

export const number = (value: number) => value.toLocaleString('en-IN')

/* ------------------------------------------------------------------ csv export */

export function downloadCsv(filename: string, rows: Array<Array<string | number>>) {
  const escape = (cell: string | number) => `"${String(cell).replace(/"/g, '""')}"`
  const csv = rows.map(row => row.map(escape).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

/* ------------------------------------------------------------------ toasts */

type Toast = { id: number; message: string }
const ToastContext = createContext<(message: string) => void>(() => {})

export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const notify = useCallback((message: string) => {
    const id = Date.now() + Math.random()
    setToasts(current => [...current, { id, message }])
    window.setTimeout(() => setToasts(current => current.filter(item => item.id !== id)), 3200)
  }, [])

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="toast-host" aria-live="polite">
        {toasts.map(toast => <p className="toast" key={toast.id}>{toast.message}</p>)}
      </div>
    </ToastContext.Provider>
  )
}

/* ------------------------------------------------------------------ primitives */

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="heading-actions">{actions}</div>}
    </div>
  )
}

type BadgeTone = 'brand' | 'positive' | 'warning' | 'negative' | 'neutral'

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: BadgeTone }) {
  return <span className={`pill ${tone}`}>{children}</span>
}

export const statusTone = (status: string): BadgeTone =>
  status === 'Published' || status === 'Active' || status === 'Sent'
    ? 'positive'
    : status === 'Draft' || status === 'Invited'
      ? 'warning'
      : status === 'Suspended' || status === 'Archived'
        ? 'negative'
        : 'neutral'

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (next: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={label}
      className={`toggle${checked ? ' on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  )
}

export function SearchInput({ value, onChange, placeholder = 'Search' }: { value: string; onChange: (next: string) => void; placeholder?: string }) {
  return <input className="search-input" type="search" value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} aria-label={placeholder} />
}

export function Select<T extends string>({ value, onChange, options, label }: { value: T; onChange: (next: T) => void; options: readonly T[] | readonly { value: T; label: string }[]; label: string }) {
  const items = options.map(option => (typeof option === 'string' ? { value: option, label: option } : option))
  return (
    <label className="select">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={event => onChange(event.target.value as T)} aria-label={label}>
        {items.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
    </label>
  )
}

export function Drawer({ title, subtitle, onClose, children }: { title: string; subtitle?: string; onClose: () => void; children: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    panel.current?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="drawer-layer" role="presentation">
      <button className="drawer-scrim" aria-label="Close panel" onClick={onClose} />
      <div className="drawer" role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={panel}>
        <header>
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close panel"><X size={18} /></button>
        </header>
        <div className="drawer-body">{children}</div>
      </div>
    </div>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="empty">{children}</p>
}

export function Progress({ value, tone }: { value: number; tone?: 'brand' | 'positive' | 'warning' }) {
  return (
    <span className="progress" aria-hidden>
      <span className={tone ?? 'brand'} style={{ width: `${Math.max(2, Math.min(100, value))}%` }} />
    </span>
  )
}

/* ------------------------------------------------------------------ charts */

export function Bars({ points }: { points: DayPoint[] }) {
  const max = Math.max(...points.map(point => point.attempts), 1)
  const total = points.reduce((sum, point) => sum + point.attempts, 0)
  return (
    <div className="bars" role="img" aria-label={`Practice attempts over the last ${points.length} days, ${number(total)} in total`}>
      {points.map(point => {
        const height = Math.max(4, Math.round((point.attempts / max) * 100))
        return (
          <div className="bar-slot" key={point.date}>
            <div className="bar" style={{ height: `${height}%` }}>
              <span className="bar-tip">{number(point.attempts)} · {formatDate(point.date)}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function Sparkline({ values, tone = 'brand' }: { values: number[]; tone?: 'brand' | 'positive' | 'warning' }) {
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || 1
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 100
      const y = 30 - ((value - min) / span) * 26
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')
  return (
    <svg className={`sparkline ${tone}`} viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden focusable="false">
      <polyline points={points} fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
