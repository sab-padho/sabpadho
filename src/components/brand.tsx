import { Link } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { cn } from '../lib/utils'
import { useTheme } from '../lib/theme'
import { useLang } from '../lib/lang'
import { useCopy } from '../lib/ui-copy'

export function LogoMark({ size = 34, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn('relative block shrink-0 overflow-hidden', className)}
      style={{ width: size, height: size, borderRadius: Math.max(6, Math.round(size * 0.24)) }}
      aria-hidden
    >
      <img
        src="/brand/logo-light.png"
        alt=""
        width={size}
        height={size}
        draggable={false}
        className="block h-full w-full dark:hidden"
      />
      <img
        src="/brand/logo-dark.png"
        alt=""
        width={size}
        height={size}
        draggable={false}
        className="hidden h-full w-full dark:block"
      />
    </span>
  )
}

export function Logo({
  size = 'md',
  withTagline = false,
  to = '/',
  tone = 'default',
  className,
}: {
  size?: 'sm' | 'md'
  withTagline?: boolean
  to?: string
  tone?: 'default' | 'rail'
  className?: string
}) {
  const copy = useCopy()
  const markSize = size === 'sm' ? 28 : 34
  const rail = tone === 'rail'
  return (
    <Link
      to={to}
      className={cn('group inline-flex items-center gap-2.5 no-underline', className)}
      aria-label={copy.a11y.home}
    >
      <LogoMark size={markSize} />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            'font-display font-bold tracking-[-0.03em]',
            rail ? 'text-rail-ink' : 'text-ink',
            size === 'sm' ? 'text-[16px]' : 'text-[18px]',
          )}
        >
          Sab<span className={rail ? 'text-[#c6b1e6]' : 'text-brand'}>Padho</span>
        </span>
        {withTagline ? (
          <span
            className={cn(
              'mt-1 text-[10px] font-medium tracking-[0.01em]',
              rail ? 'text-rail-muted' : 'text-muted',
            )}
          >
            Sab padho, sab badho.
          </span>
        ) : null}
      </span>
    </Link>
  )
}

export function ThemeToggle({ className, withLabel = false }: { className?: string; withLabel?: boolean }) {
  const { resolved, toggle } = useTheme()
  const copy = useCopy()
  const next = resolved === 'dark' ? 'light' : 'dark'
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={copy.a11y.switchTo(next === 'dark' ? copy.settings.dark : copy.settings.light)}
      title={copy.a11y.switchTo(next === 'dark' ? copy.settings.dark : copy.settings.light)}
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
      {withLabel ? <span className="text-[13px] font-medium">{next === 'dark' ? copy.settings.dark : copy.settings.light}</span> : null}
      <span className="sr-only" aria-live="polite">
        {resolved === 'dark' ? copy.a11y.themeOn : copy.a11y.themeOff}
      </span>
    </button>
  )
}

export function LangToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLang()
  const copy = useCopy()
  return (
    <div
      role="group"
      aria-label={copy.marketing.questionLanguage}
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
