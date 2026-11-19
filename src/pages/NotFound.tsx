import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ButtonLink } from '../components/ui'
import { Logo } from '../components/brand'
import { usePageTitle } from '../lib/hooks'
import { useCopy } from '../lib/ui-copy'

export function NotFound() {
  const copy = useCopy()
  usePageTitle(copy.notFound.title)

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <div className="container-page flex h-16 items-center">
        <Logo withTagline />
      </div>
      <div className="container-page flex flex-1 flex-col items-start justify-center pb-24">
        <p className="label">{copy.notFound.eyebrow}</p>
        <h1 className="mt-3 max-w-xl text-[32px] font-semibold leading-tight sm:text-[42px]">
          {copy.notFound.heading}
        </h1>
        <p className="mt-3 max-w-md text-[14px] leading-relaxed text-muted">
          {copy.notFound.body}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <ButtonLink to="/app">
            {copy.notFound.backDesk} <ArrowLeft size={15} />
          </ButtonLink>
          <Link to="/subjects" className="btn btn-secondary">
            {copy.notFound.browse}
          </Link>
        </div>
      </div>
    </div>
  )
}
