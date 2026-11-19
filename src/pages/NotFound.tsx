import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ButtonLink } from '../components/ui'
import { Logo } from '../components/brand'
import { usePageTitle } from '../lib/hooks'

export function NotFound() {
  usePageTitle('Page not found')

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <div className="container-page flex h-16 items-center">
        <Logo withTagline />
      </div>
      <div className="container-page flex flex-1 flex-col items-start justify-center pb-24">
        <p className="label">404 · Page not found</p>
        <h1 className="mt-3 max-w-xl text-[32px] font-semibold leading-tight sm:text-[42px]">
          This page is not in the syllabus.
        </h1>
        <p className="mt-3 max-w-md text-[14px] leading-relaxed text-muted">
          The link may be old, or the chapter may have moved. Your progress is untouched — pick a
          subject and carry on.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <ButtonLink to="/app">
            Back to the study desk <ArrowLeft size={15} />
          </ButtonLink>
          <Link to="/subjects" className="btn btn-secondary">
            Browse chapters
          </Link>
        </div>
      </div>
    </div>
  )
}
