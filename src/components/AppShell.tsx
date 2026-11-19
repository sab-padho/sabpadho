import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Bookmark,
  ChartNoAxesColumn,
  ChevronRight,
  ClipboardList,
  Flame,
  Home,
  Menu,
  PenLine,
  RotateCcw,
  Search,
  Settings,
  Target,
  X,
} from 'lucide-react'
import { Logo, LogoMark, LangToggle, ThemeToggle } from './brand'
import { Avatar } from './ui'
import { cn } from '../lib/utils'
import { learner, revisionQueue, shelfItems } from '../data/learner'
import { subjects } from '../data/subjects'
import { isPlayableMock, mockPapers } from '../data/mocks'
import { useLang } from '../lib/lang'

type NavItem = {
  to: string
  label: string
  icon: typeof Home
  end?: boolean
  badge?: number
  mobile?: boolean
}

const learnNav: NavItem[] = [
  { to: '/app', label: 'Study desk', icon: Home, end: true, mobile: true },
  { to: '/app/practice', label: 'Practice', icon: PenLine, mobile: true },
  { to: '/app/mocks', label: 'Mock tests', icon: ClipboardList, mobile: true },
  { to: '/app/revision', label: 'Revision', icon: RotateCcw, badge: revisionQueue.length, mobile: true },
  { to: '/app/shelf', label: 'Question shelf', icon: Bookmark, badge: shelfItems.length },
  { to: '/app/progress', label: 'Progress', icon: ChartNoAxesColumn, mobile: true },
]

const spaceNav: NavItem[] = [{ to: '/app/settings', label: 'Preferences', icon: Settings }]

const pageLabels: Record<string, string> = {
  '/app': 'Study desk',
  '/app/practice': 'Practice',
  '/app/mocks': 'Mock tests',
  '/app/revision': 'Revision',
  '/app/shelf': 'Question shelf',
  '/app/progress': 'Progress',
  '/app/settings': 'Preferences',
}

function pageTitle(pathname: string) {
  if (pageLabels[pathname]) return pageLabels[pathname]
  if (/^\/app\/practice\/.+/.test(pathname)) return 'Practice'
  if (/^\/app\/mocks\/.+\/instructions$/.test(pathname)) return 'Instructions'
  if (/^\/app\/mocks\/.+\/attempt$/.test(pathname)) return 'Exam hall'
  if (/^\/app\/mocks\/.+\/result$/.test(pathname)) return 'Result'
  return 'Study desk'
}

export function AppShell() {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const examHallMatch = pathname.match(/^\/app\/mocks\/(.+)\/attempt$/)
  const inExamHall = examHallMatch ? isPlayableMock(examHallMatch[1]) : false
  const title = pageTitle(pathname)

  return (
    <div className="min-h-dvh bg-canvas">
      <DesktopSidebar />

      <div className="lg:pl-[248px]">
        <div
          className={cn(
            'sticky top-0 z-30 border-b border-line bg-canvas/90 backdrop-blur-md',
            inExamHall && 'hidden',
          )}
        >
          <div className="flex h-14 items-center gap-3 px-4 lg:h-16 lg:px-6">
            <Link to="/app" className="lg:hidden">
              <LogoMark size={28} />
            </Link>
            <div className="hidden items-center gap-2 text-[12.5px] lg:flex">
              <Link to="/app" className="text-muted transition hover:text-ink">
                Learn
              </Link>
              <ChevronRight size={13} className="text-line-strong" />
              <span className="font-medium text-ink">{title}</span>
            </div>
            <span className="text-[13px] font-semibold text-ink lg:hidden">SabPadho</span>

            <div className="ml-auto flex items-center gap-1.5">
              <SearchBox />
              <ThemeToggle />
              <Link
                to="/app/settings"
                className="ml-0.5 rounded-full transition hover:opacity-90"
                aria-label="Your profile and preferences"
              >
                <Avatar initials={learner.initials} size={32} />
              </Link>
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="grid h-9 w-9 place-items-center rounded-[10px] border border-line bg-surface text-ink-soft lg:hidden"
                aria-label="Open menu"
                aria-expanded={menuOpen}
              >
                <Menu size={17} />
              </button>
            </div>
          </div>
        </div>

        <main
          className={cn(
            'mx-auto w-full max-w-[1180px] px-4 pt-5 md:px-6 lg:pt-8',
            inExamHall ? 'pb-8' : 'pb-24 lg:pb-12',
          )}
        >
          <Outlet />
        </main>
      </div>

      {inExamHall ? null : <MobileTabBar />}
      {menuOpen ? <MobileMenu onClose={() => setMenuOpen(false)} /> : null}
    </div>
  )
}

function navLinkClass(active: boolean) {
  return cn(
    'group flex items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-[13.5px] transition',
    active
      ? 'bg-brand-soft font-medium text-brand-ink'
      : 'text-ink-soft hover:bg-surface-2 hover:text-ink',
  )
}

function DesktopSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-line bg-surface lg:flex">
      <div className="flex h-16 items-center px-5">
        <Logo size="sm" />
      </div>

      <div className="px-3">
        <Link
          to="/app/settings"
          className="flex items-center gap-2.5 rounded-xl border border-line bg-surface-2/60 px-2.5 py-2 transition hover:bg-surface-2"
        >
          <Avatar initials={learner.initials} size={32} />
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-[13px] font-medium text-ink">{learner.name}</span>
            <span className="block truncate text-[11px] text-muted">{learner.target}</span>
          </span>
          <ChevronRight size={14} className="text-muted" />
        </Link>
      </div>

      <nav className="mt-5 flex-1 overflow-y-auto px-3 pb-3" aria-label="Study portal">
        <p className="label px-2.5 pb-2">Learning</p>
        <ul className="space-y-0.5">
          {learnNav.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} end={item.end} className={({ isActive }) => navLinkClass(isActive)}>
                {({ isActive }) => (
                  <>
                    <item.icon
                      size={16}
                      className={isActive ? 'text-brand' : 'text-muted group-hover:text-ink-soft'}
                      strokeWidth={1.9}
                    />
                    <span className="flex-1">{item.label}</span>
                    {item.badge ? (
                      <span
                        className={cn(
                          'num rounded-md px-1.5 py-0.5 text-[10.5px] font-medium',
                          isActive ? 'bg-brand/12 text-brand-ink' : 'bg-surface-3 text-muted',
                        )}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <p className="label mt-6 px-2.5 pb-2">Your space</p>
        <ul className="space-y-0.5">
          {spaceNav.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} className={({ isActive }) => navLinkClass(isActive)}>
                {({ isActive }) => (
                  <>
                    <item.icon
                      size={16}
                      className={isActive ? 'text-brand' : 'text-muted'}
                      strokeWidth={1.9}
                    />
                    <span className="flex-1">{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="mt-6 rounded-xl border border-line bg-surface-2/70 p-3">
          <div className="flex items-center gap-2 text-[12px] font-medium text-ink">
            <Flame size={15} className="text-gold" />
            {learner.streak}-day streak
          </div>
          <p className="mt-1 text-[11.5px] leading-relaxed text-muted">
            {learner.questionsThisWeek} questions this week. Keep the streak with a 5-question
            sprint.
          </p>
          <Link
            to="/app/practice"
            className="mt-2.5 inline-flex items-center gap-1 text-[12px] font-medium text-brand-ink hover:underline"
          >
            Start a sprint <ChevronRight size={13} />
          </Link>
        </div>
      </nav>

      <div className="border-t border-line px-3 py-3">
        <div className="flex items-center justify-between px-1 text-[11.5px] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Target size={13} /> {learner.daysToExam} days to go
          </span>
          <span>{learner.plan}</span>
        </div>
      </div>
    </aside>
  )
}

function MobileTabBar() {
  const tabs = learnNav.filter((item) => item.mobile)
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
      aria-label="Primary"
    >
      <ul className="flex items-stretch">
        {tabs.map((tab) => (
          <li key={tab.to} className="flex-1">
            <NavLink
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                cn(
                  'relative flex flex-col items-center gap-1 px-1 py-2.5 text-[10px] font-medium transition',
                  isActive ? 'text-brand' : 'text-muted',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative">
                    <tab.icon size={19} strokeWidth={isActive ? 2.2 : 1.8} />
                    {tab.badge ? (
                      <span className="absolute -right-2 -top-1 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-brand px-0.5 text-[8px] font-semibold text-white">
                        {tab.badge}
                      </span>
                    ) : null}
                  </span>
                  <span className="truncate">{tab.label === 'Study desk' ? 'Home' : tab.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-[#0b0814]/50 backdrop-blur-[2px] animate-fade"
        onClick={onClose}
        aria-label="Close menu"
      />
      <div className="animate-pop absolute inset-x-3 top-3 rounded-2xl border border-line bg-surface p-4 shadow-[var(--shadow-pop)]">
        <div className="flex items-center justify-between">
          <Logo size="sm" />
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-ink"
            aria-label="Close menu"
          >
            <X size={17} />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-line bg-surface-2/60 p-2.5">
          <Avatar initials={learner.initials} size={36} />
          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-medium">{learner.name}</p>
            <p className="truncate text-[11.5px] text-muted">
              {learner.target} · {learner.daysToExam} days to go
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-1">
          {[...learnNav, ...spaceNav].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className="flex items-center gap-2 rounded-lg px-2.5 py-2.5 text-[13px] text-ink-soft hover:bg-surface-2"
            >
              <item.icon size={16} className="text-muted" />
              {item.label}
              {item.badge ? <span className="ml-auto text-[11px] text-muted">{item.badge}</span> : null}
            </Link>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
          <span className="text-[12px] text-muted">Appearance & language</span>
          <div className="flex items-center gap-1.5">
            <LangToggle />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  )
}

function SearchBox() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const { lang } = useLang()

  const results = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (term.length < 2) return []
    const chapterHits = subjects.flatMap((subject) =>
      subject.chapters
        .filter((chapter) =>
          `${chapter.title.en} ${chapter.title.hi} ${subject.name.en} ${subject.short}`
            .toLowerCase()
            .includes(term),
        )
        .map((chapter) => ({
          key: chapter.id,
          label: lang === 'hi' ? chapter.title.hi : chapter.title.en,
          meta: subject.name.en,
          to: `/subjects/${subject.slug}/${chapter.slug}`,
        })),
    )
    const mockHits = mockPapers
      .filter((paper) => paper.title.toLowerCase().includes(term))
      .map((paper) => ({
        key: paper.id,
        label: paper.title,
        meta: 'Mock test',
        to: `/app/mocks/${paper.id}/instructions`,
      }))
    return [...chapterHits, ...mockHits].slice(0, 5)
  }, [query, lang])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="relative hidden md:block">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (results[0]) {
            navigate(results[0].to)
            setQuery('')
            setOpen(false)
          }
        }}
      >
        <Search
          size={14}
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 140)}
          placeholder="Search chapters"
          aria-label="Search chapters and mock tests"
          className="h-9 w-[184px] rounded-[10px] border border-line bg-surface pl-8 pr-11 text-[12.5px] text-ink placeholder:text-muted transition-[width,border-color,box-shadow] focus:w-[240px] focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-line bg-surface-2 px-1 py-0.5 text-[10px] text-muted">
          ⌘K
        </kbd>
      </form>

      {open && query.trim().length >= 2 ? (
        <div className="animate-pop absolute right-0 top-11 w-[320px] overflow-hidden rounded-xl border border-line bg-surface p-1.5 shadow-[var(--shadow-pop)]">
          {results.length ? (
            results.map((result) => (
              <button
                key={result.key}
                type="button"
                onMouseDown={() => {
                  navigate(result.to)
                  setQuery('')
                  setOpen(false)
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left hover:bg-surface-2"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] text-ink">{result.label}</span>
                  <span className="block truncate text-[11px] text-muted">{result.meta}</span>
                </span>
                <ChevronRight size={13} className="text-muted" />
              </button>
            ))
          ) : (
            <p className="px-3 py-4 text-center text-[12px] text-muted">
              Nothing matched “{query}”. Try a chapter name.
            </p>
          )}
        </div>
      ) : null}
    </div>
  )
}
