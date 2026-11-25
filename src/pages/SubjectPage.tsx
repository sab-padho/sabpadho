import { Link, useParams } from 'react-router-dom'
import { ArrowRight, ChevronRight, Clock, ListChecks, Lock } from 'lucide-react'
import { Badge, ButtonLink, SectionLabel } from '../components/ui'
import { useCatalog } from '../lib/catalog'
import { useAuth } from '../lib/auth'
import { tintTile } from '../components/subject-tint'
import { cn } from '../lib/utils'
import { usePageTitle } from '../lib/hooks'
import { NotFound } from './NotFound'
import { sectionName, subjectShortByLabel, useCopy } from '../lib/ui-copy'
import { useLang } from '../lib/lang'

export function SubjectPage() {
  const copy = useCopy()
  const { lang } = useLang()
  const { subjectSlug = '' } = useParams()
  const { findSubject, questionsForSubject, isChapterFree } = useCatalog()
  const { email, preferredExam } = useAuth()
  const isSignedIn = Boolean(email)
  const subject = findSubject(subjectSlug)

  usePageTitle(subject ? (lang === 'hi' ? subject.name.hi : subject.name.en) : copy.subjectPage.fallback)

  if (!subject) return <NotFound />

  const questions = questionsForSubject(subject.id)
  const visibleChapters = isSignedIn
    ? subject.chapters.filter((ch) => !ch.exams || ch.exams.includes(preferredExam))
    : subject.chapters
  const chaptersToShow = visibleChapters.length > 0 ? visibleChapters : subject.chapters

  return (
    <div className="container-page pb-16 pt-8 md:pt-12">
      <nav className="flex items-center gap-1.5 text-[12px] text-muted" aria-label={copy.a11y.breadcrumb}>
        <Link to="/subjects" className="hover:text-ink">
          {copy.subjectPage.crumbSubjects}
        </Link>
        <ChevronRight size={12} />
        <span className="text-ink-soft">{subjectShortByLabel(lang, subject.short)}</span>
      </nav>

      <header className="mt-6 flex flex-col gap-5 border-b border-line pb-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <span
            className={cn(
              'grid h-14 w-14 shrink-0 place-items-center rounded-2xl font-display text-[15px] font-bold',
              tintTile[subject.tint],
            )}
          >
            {subject.code}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <SectionLabel>{copy.subjectPage.tierSection}</SectionLabel>
              {isSignedIn ? <Badge tone="brand">{preferredExam}</Badge> : null}
            </div>
            <h1 className="mt-1.5 text-[30px] font-semibold leading-tight sm:text-[38px]">
              {lang === 'hi' ? subject.name.hi : subject.name.en}
            </h1>
            <p className="mt-0.5 text-[14px] text-muted">{lang === 'hi' ? subject.name.en : subject.name.hi}</p>
            <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-muted">
              {subject.description}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <div className="flex gap-2">
            <Badge tone="neutral">
              <ListChecks size={11} /> {copy.subjectPage.chaptersN(chaptersToShow.length)}
            </Badge>
            <Badge tone="neutral">{copy.subjectPage.questionsN(questions.length)}</Badge>
          </div>
          <div className="flex gap-2">
            {isSignedIn ? (
              <ButtonLink to="/app/practice" size="sm">
                {copy.subjectPage.practiseSubject}
              </ButtonLink>
            ) : (
              <ButtonLink
                to="/signup"
                state={{
                  from: '/app/practice',
                  reason: `Sign up for free and select your exam to practise ${subject.name.en} sprints.`,
                }}
                size="sm"
              >
                {lang === 'hi' ? 'साइन अप कर अभ्यास करें' : 'Sign up to practise'}
              </ButtonLink>
            )}
          </div>
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_0.8fr] lg:gap-12">
        <div>
          <div className="flex items-baseline justify-between">
            <h2 className="text-[19px] font-semibold">{copy.subjectPage.chapters}</h2>
            <span className="text-[11.5px] text-muted">
              {isSignedIn
                ? `${preferredExam}`
                : lang === 'hi'
                  ? 'केवल 1 निःशुल्क सैंपल अध्याय खुला है'
                  : '1 free starter primer · Sign up for full syllabus'}
            </span>
          </div>

          <ul className="mt-4 divide-y divide-line border-y border-line">
            {chaptersToShow.map((chapter) => {
              const attempted = chapter.attempts
              const unlocked = isSignedIn || isChapterFree(chapter)
              return (
                <li key={chapter.id} className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={unlocked ? `/subjects/${subject.slug}/${chapter.slug}` : '/signup'}
                          state={
                            unlocked
                              ? undefined
                              : {
                                  from: `/subjects/${subject.slug}/${chapter.slug}`,
                                  reason: `Sign up for free to unlock "${chapter.title.en}" and all chapters for your target exam.`,
                                }
                          }
                          className="text-[14.5px] font-medium text-ink hover:text-brand-ink"
                        >
                          {lang === 'hi' ? chapter.title.hi : chapter.title.en}
                          <span className="ml-2 text-[12px] font-normal text-muted">
                            {lang === 'hi' ? chapter.title.en : chapter.title.hi}
                          </span>
                        </Link>
                        {!isSignedIn && unlocked ? (
                          <Badge tone="positive" className="px-1.5 py-0 text-[9.5px]">
                            {lang === 'hi' ? 'निःशुल्क' : 'Free primer'}
                          </Badge>
                        ) : null}
                        {!unlocked ? (
                          <Badge tone="outline" className="px-1.5 py-0 text-[9.5px]">
                            <Lock size={9} /> {lang === 'hi' ? 'लॉक्ड' : 'Sign up required'}
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{chapter.blurb}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
                        <span className="inline-flex items-center gap-1">
                          <Clock size={11} /> {copy.subjectPage.minN(chapter.minutes)}
                        </span>
                        {isSignedIn ? (
                          <>
                            <span className="h-1 w-1 rounded-full bg-line-strong" />
                            {attempted && attempted >= 3 ? (
                              <span>
                                {copy.subjectPage.attemptsCorrect(attempted, chapter.accuracy ?? 0)}
                              </span>
                            ) : attempted ? (
                              <span>{copy.subjectPage.attemptEarly(attempted)}</span>
                            ) : (
                              <span>{copy.subjectPage.notStarted}</span>
                            )}
                          </>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      {unlocked ? (
                        <Link
                          to={`/subjects/${subject.slug}/${chapter.slug}`}
                          className="inline-flex items-center gap-1 text-[12px] font-medium text-brand-ink hover:underline"
                        >
                          {copy.subjectPage.primer} <ArrowRight size={13} />
                        </Link>
                      ) : (
                        <Link
                          to="/signup"
                          state={{
                            from: `/subjects/${subject.slug}/${chapter.slug}`,
                            reason: `Create a free account to unlock "${chapter.title.en}".`,
                          }}
                          className="inline-flex items-center gap-1 text-[12px] font-medium text-muted hover:text-brand-ink"
                        >
                          <Lock size={12} /> {lang === 'hi' ? 'अनलॉक करें' : 'Unlock'}
                        </Link>
                      )}
                      {isSignedIn ? (
                        <Link
                          to={`/app/practice/${chapter.slug}`}
                          className="text-[11.5px] text-muted hover:text-ink"
                        >
                          {copy.subjectPage.practise}
                        </Link>
                      ) : (
                        <Link
                          to="/signup"
                          state={{
                            from: `/app/practice/${chapter.slug}`,
                            reason: 'Practice sprints unlock right after you sign up and select your exam.',
                          }}
                          className="text-[11.5px] text-muted hover:text-ink"
                        >
                          {lang === 'hi' ? 'अभ्यास (साइन अप)' : 'Practise (Sign up)'}
                        </Link>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        <aside className="space-y-3">
          <div className="card p-4">
            <p className="label">{copy.subjectPage.scoredTitle}</p>
            <ul className="mt-3 space-y-2 text-[12.5px] text-ink-soft">
              <li className="flex justify-between gap-3">
                <span className="text-muted">{copy.subjectPage.section}</span>
                <span className="text-right">{sectionName(lang, subject.paperSection)}</span>
              </li>
              <li className="flex justify-between gap-3">
                <span className="text-muted">{copy.subjectPage.questionsTier}</span>
                <span>{copy.subjectPage.of100}</span>
              </li>
              <li className="flex justify-between gap-3">
                <span className="text-muted">{copy.subjectPage.marks}</span>
                <span>{copy.subjectPage.marksVal}</span>
              </li>
            </ul>
          </div>

          {isSignedIn ? (
            <div className="card p-4">
              <p className="label">{copy.subjectPage.yourAccuracy}</p>
              <p className="num mt-2 font-display text-[30px] font-semibold leading-none">
                {subject.accuracy}%
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
                <div className="h-full rounded-full bg-brand" style={{ width: `${subject.accuracy}%` }} />
              </div>
              <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
                {copy.subjectPage.acrossAttempts(
                  subject.chapters.reduce((sum, chapter) => sum + (chapter.attempts ?? 0), 0),
                )}
              </p>
            </div>
          ) : (
            <div className="card border-brand/25 bg-brand-soft/35 p-4">
              <p className="text-[12.5px] font-semibold text-ink">
                {lang === 'hi' ? 'निःशुल्क साइन अप करें' : 'Unlock full access for free'}
              </p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-muted">
                {lang === 'hi'
                  ? 'मेहमान के रूप में केवल पहला अध्याय खुला है। साइन अप कर अपनी परीक्षा चुनें और सभी अध्याय व मॉक पाएँ।'
                  : 'Visitors get 1 free chapter primer per subject. Sign up and pick your target exam to unlock all chapters, sprints, and mocks.'}
              </p>
              <ButtonLink to="/signup" size="sm" className="mt-3 w-full">
                {lang === 'hi' ? 'खाता बनाएँ' : 'Sign up free'} <ArrowRight size={13} />
              </ButtonLink>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
