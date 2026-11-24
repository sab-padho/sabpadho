import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Bookmark,
  ChartNoAxesColumn,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Flame,
  FolderArchive,
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
import { Avatar, Badge } from './ui'
import { cn } from '../lib/utils'
import { learner, revisionQueue, shelfItems } from '../data/learner'
import { EXAM_OPTIONS, getExamConfig, type ExamId } from '../data/exams'
import { useCatalog } from '../lib/catalog'
import { useAuth } from '../lib/auth'
import { useToast } from '../lib/toast'
import { useLang } from '../lib/lang'
import { planLabel, useCopy } from '../lib/ui-copy'

type NavKey = 'desk' | 'practice' | 'mocks' | 'revision' | 'shelf' | 'progress' | 'settings'

type NavItem = {
  to: string
  label: NavKey
  icon: typeof Home
  end?: boolean
  badge?: number
  mobile?: boolean
}

const learnNav: NavItem[] = [
  { to: '/app', label: 'desk', icon: Home, end: true, mobile: true },
  { to: '/app/practice', label: 'practice', icon: PenLine, mobile: true },
  { to: '/app/mocks', label: 'mocks', icon: ClipboardList, mobile: true },
  { to: '/app/revision', label: 'revision', icon: RotateCcw, badge: revisionQueue.length, mobile: true },
  { to: '/app/shelf', label: 'shelf', icon: Bookmark, badge: shelfItems.length },
  { to: '/app/progress', label: 'progress', icon: ChartNoAxesColumn, mobile: true },
]

const spaceNav: NavItem[] = [{ to: '/app/settings', label: 'settings', icon: Settings }]

const pageKeys: Record<string, NavKey> = {
  '/app': 'desk',
  '/app/practice': 'practice',
  '/app/mocks': 'mocks',
  '/app/revision': 'revision',
  '/app/shelf': 'shelf',
  '/app/progress': 'progress',
  '/app/settings': 'settings',
}

function pageTitle(pathname: string, copy: ReturnType<typeof useCopy>) {
  if (pageKeys[pathname]) return copy.nav[pageKeys[pathname]]
  if (/^\/app\/practice\/.+/.test(pathname)) return copy.nav.practice
  if (/^\/app\/mocks\/.+\/instructions$/.test(pathname)) return copy.pages.instructions
  if (/^\/app\/mocks\/.+\/attempt$/.test(pathname)) return copy.pages.examHall
  if (/^\/app\/mocks\/.+\/result$/.test(pathname)) return copy.pages.result
  return copy.nav.desk
}

export function AppShell() {
  const { pathname } = useLocation()
  const copy = useCopy()
  const { isPlayableMock } = useCatalog()
  const { user, preferredExam } = useAuth()
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
  const title = pageTitle(pathname, copy)
  const initials = user?.initials ?? learner.initials

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
                {copy.shell.breadcrumb}
              </Link>
              <ChevronRight size={13} className="text-line-strong" />
              <span className="font-medium text-ink">{title}</span>
              <Badge tone="brand" className="ml-1">
                {preferredExam}
              </Badge>
            </div>
            <span className="text-[13px] font-semibold text-ink lg:hidden">SabPadho</span>

            <div className="ml-auto flex items-center gap-1.5">
              <ExamOthersSwitcher />
              <SearchBox />
              <LangToggle className="hidden sm:inline-flex" />
              <ThemeToggle />
              <Link
                to="/app/settings"
                className="ml-0.5 rounded-full transition hover:opacity-90"
                aria-label={copy.shell.profile}
              >
                <Avatar initials={initials} size={32} />
              </Link>
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="grid h-9 w-9 place-items-center rounded-[10px] border border-line bg-surface text-ink-soft lg:hidden"
                aria-label={copy.shell.openMenu}
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

/**
 * Compact header switcher displaying the active exam + "Others" menu so the
 * learner can switch to any other exam in one click from anywhere in the app.
 */
function ExamOthersSwitcher() {
  const { preferredExam, setPreferredExam } = useAuth()
  const { notify } = useToast()
  const { lang } = useLang()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const otherExams = EXAM_OPTIONS.filter((item) => item.id !== preferredExam)

  useEffect(() => {
    if (!open) return
    const handleOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  async function selectExam(next: ExamId) {
    await setPreferredExam(next)
    setOpen(false)
    notify(
      lang === 'hi'
        ? `परीक्षा ट्रैक बदलकर ${next} कर दिया गया है।`
        : `Switched workspace to ${next}.`,
      'success',
    )
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-line bg-surface px-2.5 text-[12px] font-medium text-ink transition hover:border-line-strong"
        title="Switch exam or open Others"
      >
        <FolderArchive size={13} className="text-brand" />
        <span className="hidden sm:inline">{preferredExam}</span>
        <span className="text-muted">·</span>
        <span className="text-brand-ink">{lang === 'hi' ? 'अन्य' : 'Others'}</span>
        <ChevronDown size={13} className={cn('text-muted transition-transform', open && 'rotate-180')} />
      </button>

      {open ? (
        <div className="animate-pop absolute right-0 top-11 z-50 w-[280px] overflow-hidden rounded-xl border border-line bg-surface p-2 shadow-[var(--shadow-pop)]">
          <div className="border-b border-line px-2.5 pb-2 pt-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
              {lang === 'hi' ? 'वर्तमान परीक्षा' : 'Active exam'}
            </p>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-[12.5px] font-semibold text-ink">{preferredExam}</span>
              <Badge tone="positive">
                <Check size={10} /> {lang === 'hi' ? 'सक्रिय' : 'Active'}
              </Badge>
            </div>
          </div>

          <div className="pt-2">
            <p className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
              {lang === 'hi' ? 'अन्य परीक्षाएँ (Others)' : 'Others (Zipped exams)'}
            </p>
            <ul className="space-y-0.5">
              {otherExams.map((exam) => (
                <li key={exam.id}>
                  <button
                    type="button"
                    onClick={() => selectExam(exam.id)}
                    className="flex w-full items-start justify-between gap-2 rounded-lg px-2.5 py-2 text-left transition hover:bg-surface-2"
                  >
                    <span className="min-w-0">
                      <span className="block text-[12.5px] font-medium text-ink">
                        {exam.shortLabel}
                      </span>
                      <span className="block truncate text-[10.5px] text-muted">
                        {lang === 'hi' ? exam.taglineHi : exam.tagline}
                      </span>
                    </span>
                    <span className="mt-0.5 shrink-0 text-[10.5px] font-medium text-brand-ink">
                      {lang === 'hi' ? 'चुनें' : 'Switch'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function navLinkClass(active: boolean) {
  return cn(
    'group flex items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-[13.5px] transition',
    active
      ? 'bg-rail-active font-medium text-rail-ink'
      : 'text-rail-muted hover:bg-white/5 hover:text-rail-ink',
  )
}

function DesktopSidebar() {
  const copy = useCopy()
  const { lang } = useLang()
  const { user, preferredExam, setPreferredExam } = useAuth()
  const { notify } = useToast()
  const [othersExpanded, setOthersExpanded] = useState(false)

  const examInfo = getExamConfig(preferredExam)
  const otherExams = EXAM_OPTIONS.filter((item) => item.id !== preferredExam)
  const displayName = user?.name ?? learner.name
  const initials = user?.initials ?? learner.initials
  const plan = user?.plan ?? learner.plan

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-rail-line bg-rail lg:flex">
      <div className="flex h-16 items-center px-5">
        <Logo size="sm" tone="rail" to="/app" />
      </div>

      <div className="px-3">
        <Link
          to="/app/settings"
          className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 transition hover:bg-white/10"
        >
          <Avatar initials={initials} size={32} />
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-[13px] font-medium text-rail-ink">{displayName}</span>
            <span className="block truncate text-[11px] text-rail-muted">{examInfo.targetDisplay}</span>
          </span>
          <ChevronRight size={14} className="text-rail-muted" />
        </Link>
      </div>

      <nav className="mt-5 flex-1 overflow-y-auto px-3 pb-3" aria-label={copy.a11y.portal}>
        <p className="px-2.5 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-rail-muted/75">
          {copy.shell.learn} · {preferredExam}
        </p>
        <ul className="space-y-0.5">
          {learnNav.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} end={item.end} className={({ isActive }) => navLinkClass(isActive)}>
                {({ isActive }) => (
                  <>
                    <item.icon
                      size={16}
                      className={isActive ? 'text-[#c6b1e6]' : 'text-rail-muted group-hover:text-rail-ink'}
                      strokeWidth={1.9}
                    />
                    <span className="flex-1">{copy.nav[item.label]}</span>
                    {item.badge ? (
                      <span
                        className={cn(
                          'num rounded-md px-1.5 py-0.5 text-[10.5px] font-medium',
                          isActive ? 'bg-white/15 text-rail-ink' : 'bg-white/8 text-rail-muted',
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

        <p className="mt-5 px-2.5 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-rail-muted/75">
          {lang === 'hi' ? 'परीक्षा ट्रैक' : 'Exam tracks'}
        </p>
        <div className="rounded-xl border border-white/10 bg-white/5 p-1.5">
          <button
            type="button"
            onClick={() => setOthersExpanded((v) => !v)}
            aria-expanded={othersExpanded}
            className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-[12.5px] text-rail-ink transition hover:bg-white/5"
          >
            <span className="flex items-center gap-2">
              <FolderArchive size={14} className="text-[#c6b1e6]" />
              <span>{lang === 'hi' ? 'अन्य परीक्षाएँ (Others)' : 'Others (Zipped)'}</span>
            </span>
            <span className="flex items-center gap-1 text-[10.5px] text-rail-muted">
              {otherExams.length}
              <ChevronDown
                size={13}
                className={cn('transition-transform', othersExpanded && 'rotate-180')}
              />
            </span>
          </button>

          {othersExpanded ? (
            <ul className="mt-1 space-y-0.5 border-t border-white/10 pt-1">
              {otherExams.map((exam) => (
                <li key={exam.id}>
                  <button
                    type="button"
                    onClick={async () => {
                      await setPreferredExam(exam.id)
                      setOthersExpanded(false)
                      notify(
                        lang === 'hi'
                          ? `मुख्य परीक्षा ${exam.shortLabel} चुनी गई।`
                          : `Switched active exam to ${exam.shortLabel}.`,
                        'success',
                      )
                    }}
                    className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[12px] text-rail-muted transition hover:bg-white/10 hover:text-rail-ink"
                  >
                    <span className="truncate">{exam.shortLabel}</span>
                    <span className="text-[10px] text-[#c6b1e6]">
                      {lang === 'hi' ? 'चुनें' : 'Select'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <p className="mt-5 px-2.5 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-rail-muted/75">
          {copy.shell.yourSpace}
        </p>
        <ul className="space-y-0.5">
          {spaceNav.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} className={({ isActive }) => navLinkClass(isActive)}>
                {({ isActive }) => (
                  <>
                    <item.icon
                      size={16}
                      className={isActive ? 'text-[#c6b1e6]' : 'text-rail-muted'}
                      strokeWidth={1.9}
                    />
                    <span className="flex-1">{copy.nav[item.label]}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center gap-2 text-[12px] font-medium text-rail-ink">
            <Flame size={15} className="text-[#dfa04f]" />
            {copy.shell.streak(learner.streak)}
          </div>
          <p className="mt-1 text-[11.5px] leading-relaxed text-rail-muted">
            {copy.shell.streakBody(learner.questionsThisWeek)}
          </p>
          <Link
            to="/app/practice"
            className="mt-2.5 inline-flex items-center gap-1 text-[12px] font-medium text-[#c6b1e6] hover:text-white hover:underline"
          >
            {copy.shell.startSprint} <ChevronRight size={13} />
          </Link>
        </div>
      </nav>

      <div className="border-t border-rail-line px-3 py-3">
        <div className="flex items-center justify-between px-1 text-[11.5px] text-rail-muted">
          <span className="inline-flex items-center gap-1.5">
            <Target size={13} /> {copy.shell.daysToGo(examInfo.daysToExam)}
          </span>
          <span>{planLabel(lang, plan)}</span>
        </div>
      </div>
    </aside>
  )
}

function MobileTabBar() {
  const copy = useCopy()
  const tabs = learnNav.filter((item) => item.mobile)
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
      aria-label={copy.a11y.primary}
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
                  <span className="truncate">
                    {tab.label === 'desk' ? copy.shell.home : copy.nav[tab.label]}
                  </span>
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
  const copy = useCopy()
  const { lang } = useLang()
  const { user, preferredExam, setPreferredExam } = useAuth()
  const { notify } = useToast()
  const examInfo = getExamConfig(preferredExam)
  const otherExams = EXAM_OPTIONS.filter((item) => item.id !== preferredExam)

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-[#0b0814]/50 backdrop-blur-[2px] animate-fade"
        onClick={onClose}
        aria-label={copy.shell.closeMenu}
      />
      <div className="animate-pop absolute inset-x-3 top-3 rounded-2xl border border-line bg-surface p-4 shadow-[var(--shadow-pop)]">
        <div className="flex items-center justify-between">
          <Logo size="sm" />
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-ink"
            aria-label={copy.shell.closeMenu}
          >
            <X size={17} />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-line bg-surface-2/60 p-2.5">
          <Avatar initials={user?.initials ?? learner.initials} size={36} />
          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-medium">{user?.name ?? learner.name}</p>
            <p className="truncate text-[11.5px] text-muted">
              {examInfo.targetDisplay} · {copy.shell.daysToGo(examInfo.daysToExam)}
            </p>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-line bg-surface-2/40 p-2.5">
          <p className="text-[10.5px] font-semibold uppercase tracking-wider text-muted">
            {lang === 'hi' ? 'अन्य परीक्षाएँ (Others)' : 'Others · Switch exam'}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {otherExams.map((exam) => (
              <button
                key={exam.id}
                type="button"
                onClick={async () => {
                  await setPreferredExam(exam.id)
                  notify(`Switched exam to ${exam.shortLabel}`, 'success')
                  onClose()
                }}
                className="rounded-md border border-line bg-surface px-2 py-1 text-[11.5px] font-medium text-ink-soft hover:border-brand hover:text-brand-ink"
              >
                {exam.shortLabel}
              </button>
            ))}
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
              {copy.nav[item.label]}
              {item.badge ? <span className="ml-auto text-[11px] text-muted">{item.badge}</span> : null}
            </Link>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
          <span className="text-[12px] text-muted">{copy.shell.appearance}</span>
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
  const copy = useCopy()
  const { subjects, mockPapers } = useCatalog()
  const { preferredExam } = useAuth()

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
          meta: lang === 'hi' ? subject.name.hi : subject.name.en,
          to: `/subjects/${subject.slug}/${chapter.slug}`,
        })),
    )
    const mockHits = mockPapers
      .filter((paper) => `${paper.title} ${paper.exam}`.toLowerCase().includes(term))
      .sort((a, b) => Number(b.exam === preferredExam) - Number(a.exam === preferredExam))
      .map((paper) => ({
        key: paper.id,
        label: paper.title,
        meta: `${paper.exam} · ${copy.shell.mockResult}`,
        to: `/app/mocks/${paper.id}/instructions`,
      }))
    return [...chapterHits, ...mockHits].slice(0, 5)
  }, [query, lang, copy.shell.mockResult, subjects, mockPapers, preferredExam])

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
          placeholder={copy.shell.search}
          aria-label={copy.shell.search}
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
            <p className="px-3 py-4 text-center text-[12px] text-muted">{copy.shell.noResults}</p>
          )}
        </div>
      ) : null}
    </div>
  )
}
