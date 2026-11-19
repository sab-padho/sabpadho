import { twMerge } from 'tailwind-merge'

export function cn(...parts: Array<string | false | null | undefined>) {
  return twMerge(parts.filter(Boolean).join(' '))
}

export function pct(value: number, total: number) {
  if (!total) return 0
  return Math.round((value / total) * 100)
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

/** 41 => 41:00 */
export function formatClock(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds))
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export function plural(count: number, singular: string, pluralForm = `${singular}s`) {
  return `${count} ${count === 1 ? singular : pluralForm}`
}

export function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
