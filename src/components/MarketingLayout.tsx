import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { ArrowRight, Menu, X } from 'lucide-react'
import { Logo, LangToggle, ThemeToggle } from './brand'
import { useCopy } from '../lib/ui-copy'
import { ButtonLink } from './ui'
import { cn } from '../lib/utils'

export function MarketingLayout() {
  const copy = useCopy()
  const navLinks = [
    { to: '/subjects', label: copy.marketing.subjects },
    { to: '/mocks', label: copy.marketing.mocks },
    { to: '/how-it-works', label: copy.marketing.how },
  ]
  const [open, setOpen] = useState(false)
  const { pathname, hash } = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [pathname, hash])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur-md">
        <div className="container-page flex h-16 items-center justify-between gap-3">
          <Logo withTagline />

          <nav className="hidden items-center gap-0.5 md:flex" aria-label={copy.a11y.mainNav}>
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-3 text-[13.5px] font-medium transition',
                    isActive ? 'text-ink' : 'text-muted hover:text-ink',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <LangToggle className="hidden sm:inline-flex" />
            <ThemeToggle />
            <Link
              to="/signin"
              className="hidden rounded-lg px-3 py-2 text-[13.5px] font-medium text-ink-soft transition hover:text-ink sm:inline-flex"
            >
              {copy.marketing.signIn}
            </Link>
            <ButtonLink to="/app" size="sm" className="hidden sm:inline-flex">
              {copy.marketing.openDesk}
              <ArrowRight size={15} />
            </ButtonLink>
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-[10px] border border-line bg-surface text-ink md:hidden"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? copy.shell.closeMenu : copy.shell.openMenu}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {open ? (
          <div id="mobile-nav" className="animate-fade border-t border-line bg-surface md:hidden">
            <nav className="container-page flex flex-col py-3" aria-label={copy.a11y.mobileNav}>
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      'rounded-lg px-3 py-3 text-[15px] font-medium',
                      isActive ? 'bg-surface-2 text-ink' : 'text-ink-soft',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="mt-3 flex flex-col gap-2 border-t border-line pt-4">
                <ButtonLink to="/app" size="lg" className="w-full">
                  {copy.marketing.openDesk}
                  <ArrowRight size={16} />
                </ButtonLink>
                <ButtonLink to="/signin" variant="secondary" size="lg" className="w-full">
                  {copy.marketing.signIn}
                </ButtonLink>
                <div className="mt-1 flex items-center justify-between px-1">
                  <span className="text-xs text-muted">{copy.marketing.questionLanguage}</span>
                  <LangToggle />
                </div>
              </div>
            </nav>
          </div>
        ) : null}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="text-[13px] text-muted transition hover:text-ink">
      {children}
    </Link>
  )
}

export function Footer() {
  const copy = useCopy()
  return (
    <footer className="mt-20 border-t border-line bg-surface/60">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-muted">
            {copy.footer.tagline}
          </p>
          <p className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-positive" />
            {copy.home.beta}
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <p className="label mb-1">{copy.footer.learn}</p>
          <FooterLink to="/subjects">{copy.footer.primers}</FooterLink>
          <FooterLink to="/app/practice">{copy.footer.sprints}</FooterLink>
          <FooterLink to="/mocks">{copy.footer.mocks}</FooterLink>
          <FooterLink to="/app/revision">{copy.footer.queue}</FooterLink>
        </div>

        <div className="flex flex-col gap-2.5">
          <p className="label mb-1">{copy.footer.exam}</p>
          <FooterLink to="/how-it-works">{copy.footer.pattern}</FooterLink>
          <FooterLink to="/how-it-works#marking">{copy.footer.marking}</FooterLink>
          <FooterLink to="/how-it-works#bilingual">{copy.footer.bilingual}</FooterLink>
          <FooterLink to="/how-it-works#faq">{copy.footer.common}</FooterLink>
        </div>

        <div className="flex flex-col gap-2.5">
          <p className="label mb-1">{copy.footer.brand}</p>
          <FooterLink to="/how-it-works">{copy.footer.how}</FooterLink>
          <FooterLink to="/signin">{copy.marketing.signIn}</FooterLink>
          <a href="mailto:hello@sabpadho.in" className="text-[13px] text-muted transition hover:text-ink">
            hello@sabpadho.in
          </a>
          <span className="text-[13px] text-muted">{copy.footer.city}</span>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-5 text-[11.5px] leading-relaxed text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>{copy.footer.copyright}</p>
          <p>
            {copy.footer.independent}
          </p>
        </div>
      </div>
    </footer>
  )
}
