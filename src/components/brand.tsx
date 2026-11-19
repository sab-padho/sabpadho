import { Link } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { cn } from '../lib/utils'
import { useTheme } from '../lib/theme'
import { useLang } from '../lib/lang'

export function LogoMark({ size = 34, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={cn('shrink-0', className)}
      aria-hidden
    >
      <defs>
        <linearGradient id="sb-tile" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#17213A" />
          <stop offset="1" stopColor="#080B14" />
        </linearGradient>
        <linearGradient id="sb-gold" x1="4" y1="34" x2="36" y2="8" gradientUnits="userSpaceOnUse">
          <stop stopColor="#B07C27" />
          <stop offset="0.45" stopColor="#F2CE84" />
          <stop offset="1" stopColor="#BF8C32" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#sb-tile)" />
      <rect x="0.5" y="0.5" width="39" height="39" rx="9.5" stroke="#fff" strokeOpacity=".1" />
      <path
        d="M8.5 20.9a11.5 11.5 0 0 1 23 0"
        stroke="url(#sb-gold)"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M6 27.9c4.8-2.7 9.4-2.6 14 .5 4.6-3.1 9.2-3.2 14-.5v3.5c-4.8-2.6-9.4-2.5-14 .6-4.6-3.1-9.2-3.2-14-.6z"
        fill="#F1E5CA"
      />
      <path d="M18.6 25.4 29.1 14.8" stroke="url(#sb-gold)" strokeWidth="2.3" strokeLinecap="round" />
      <path
        d="M23.7 14.5h5.8v5.8"
        stroke="url(#sb-gold)"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Logo({
  size = 'md',
  withTagline = false,
  to = '/',
  className,
}: {
  size?: 'sm' | 'md'
  withTagline?: boolean
  to?: string
  className?: string
}) {
  const markSize = size === 'sm' ? 28 : 34
  return (
    <Link
      to={to}
      className={cn('group inline-flex items-center gap-2.5 no-underline', className)}
      aria-label="SabPadho home"
    >
      <LogoMark size={markSize} />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            'font-display font-bold tracking-[-0.03em] text-ink',
            size === 'sm' ? 'text-[16px]' : 'text-[18px]',
          )}
        >
          Sab<span className="text-brand">Padho</span>
        </span>
        {withTagline ? (
          <span className="mt-1 text-[10px] font-medium tracking-[0.01em] text-muted">
            Sab padho, sab badho.
          </span>
        ) : null}
      </span>
    </Link>
  )
}

export function ThemeToggle({ className, withLabel = false }: { className?: string; withLabel?: boolean }) {
  const { resolved, toggle } = useTheme()
  const next = resolved === 'dark' ? 'light' : 'dark'
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={cn(
        'inline-flex h-9 items-center justify-center gap-2 rounded-[10px] border border-line bg-surface px-2.5 text-muted transition hover:border-line-strong hover:bg-surface-2 hover:text-ink',
        withLabel && 'px-3',
        className,
      )}
    >
      <span className="relative grid h-4 w-4 place-items-center">
        <Sun
          size={16}
          className={cn(
            'absolute transition-all duration-300',
            resolved === 'dark' ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100',
          )}
        />
        <Moon
          size={16}
          className={cn(
            'absolute transition-all duration-300',
            resolved === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0',
          )}
        />
      </span>
      {withLabel ? <span className="text-[13px] font-medium">{next === 'dark' ? 'Dark' : 'Light'}</span> : null}
      <span className="sr-only" aria-live="polite">
        {resolved === 'dark' ? 'Dark theme on' : 'Light theme on'}
      </span>
    </button>
  )
}

export function LangToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLang()
  return (
    <div
      role="group"
      aria-label="Question language"
      className={cn(
        'inline-flex h-9 items-center rounded-[10px] border border-line bg-surface p-0.5',
        className,
      )}
    >
      {(['en', 'hi'] as const).map((code) => {
        const active = lang === code
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code)}
            aria-pressed={active}
            className={cn(
              'h-full rounded-[8px] px-2.5 text-[12px] font-medium transition',
              active ? 'bg-brand-soft text-brand-ink' : 'text-muted hover:text-ink',
            )}
          >
            {code === 'en' ? 'EN' : 'हिं'}
            <span className="sr-only">{code === 'en' ? ' English' : ' Hindi'}</span>
          </button>
        )
      })}
    </div>
  )
}
