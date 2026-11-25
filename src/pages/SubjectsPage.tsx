import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown, Clock, FolderArchive, ListChecks, Lock, Sparkles } from 'lucide-react'
import { SectionLabel, Badge, Button, ButtonLink } from '../components/ui'
import { EXAM_OPTIONS, type ExamId } from '../data/exams'
import { useCatalog } from '../lib/catalog'
import { useAuth } from '../lib/auth'
import { useToast } from '../lib/toast'
import { tintTile } from '../components/subject-tint'
import { cn } from '../lib/utils'
import { usePageTitle } from '../lib/hooks'
import { useLang } from '../lib/lang'
import { subjectShortByLabel, useCopy } from '../lib/ui-copy'
import type { Subject } from '../data/subjects'

export function SubjectsPage() {
  const copy = useCopy()
  const { lang } = useLang()
  usePageTitle(copy.library.title)
  const { subjects, questionsForSubject, isChapterFree, partitionSubjectsByExam } = useCatalog()
  const { email, preferredExam, setPreferredExam } = useAuth()
  const { notify } = useToast()
  const [othersOpen, setOthersOpen] = useState(false)

  const isSignedIn = Boolean(email)
  const totalChapters = subjects.reduce((sum, subject) => sum + subject.chapters.length, 0)
  const freeChaptersCount = subjects.reduce(
    (sum, subject) => sum + subject.chapters.filter((ch) => isChapterFree(ch)).length,
    0,
  )

  const { preferred: preferredSubjects, others: otherSubjects } = isSignedIn
    ? partitionSubjectsByExam(preferredExam)
    : { preferred: subjects, others: [] }

  const otherExamOptions = EXAM_OPTIONS.filter((exam) => exam.id !== preferredExam)

  async function handleSwitchExam(nextExam: ExamId) {
    await setPreferredExam(nextExam)
    notify(
      lang === 'hi'
        ? `मुख्य परीक्षा बदलकर ${nextExam} कर दी गई है।`
        : `Switched your preferred exam to ${nextExam}.`,
      'success',
    )
  }

  return (
    <div className="container-page pb-16 pt-10 md:pt-14">
      <div className="max-w-2xl">
        <div className="flex flex-wrap items-center gap-2">
          <SectionLabel>{copy.library.eyebrow}</SectionLabel>
          {isSignedIn ? (
            <Badge tone="brand">{preferredExam}</Badge>
          ) : (
            <Badge tone="gold">
              {lang === 'hi'
                ? `${freeChaptersCount} निःशुल्क सैंपल अध्याय`
                : `${freeChaptersCount} free starter chapters`}
            </Badge>
          )}
        </div>
        <h1 className="mt-3 text-[32px] font-semibold leading-[1.1] sm:text-[44px]">
          {isSignedIn
            ? lang === 'hi'
              ? `${preferredExam} का पाठ्यक्रम, अध्याय दर अध्याय।`
              : `${preferredExam} syllabus, chapter by chapter.`
            : copy.library.heading}
        </h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
          {isSignedIn
            ? lang === 'hi'
              ? `आपकी चुनी हुई ${preferredExam} परीक्षा के सभी विषय नीचे खुले हैं। अन्य परीक्षाओं के अध्याय नीचे "Others" में व्यवस्थित हैं।`
              : `All subjects and chapters for your preferred ${preferredExam} track are unlocked below. Chapters for other exams are neatly tucked in the “Others” section.`
            : lang === 'hi'
              ? `प्रत्येक विषय का पहला अध्याय सभी के लिए निःशुल्क खुला है (${freeChaptersCount} सैंपल अध्याय)। बाकी सभी ${totalChapters - freeChaptersCount} अध्यायों, प्रैक्टिस स्प्रिंट और मॉक टेस्ट के लिए निःशुल्क साइन अप करें।`
              : `Read the first starter chapter of every subject for free (${freeChaptersCount} free primers). Sign up for free and select your target exam to unlock all ${totalChapters} chapters, sprints, and mocks.`}
        </p>
      </div>

      {!isSignedIn ? (
        <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl border border-brand/25 bg-brand-soft/45 p-4 sm:flex-row sm:items-center sm:px-5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand text-white">
              <Sparkles size={15} />
            </span>
            <div>
              <p className="text-[13.5px] font-semibold text-ink">
                {lang === 'hi'
                  ? 'सीमित निःशुल्क एक्सेस सक्रिय है'
                  : 'Visiting on limited free access'}
              </p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-muted">
                {lang === 'hi'
                  ? 'निःशुल्क साइन अप करें और अपनी परीक्षा (SSC CGL, CHSL, GD, Railways या Banking) चुनकर पूरा सिलेबस अनलॉक करें।'
                  : 'Sign up for free and pick your target exam (SSC CGL, CHSL, GD, Railways, or Banking) to unlock locked primers, practice sprints, and mocks.'}
              </p>
            </div>
          </div>
          <ButtonLink to="/signup" size="sm" className="shrink-0">
            {lang === 'hi' ? 'साइन अप कर अनलॉक करें' : 'Sign up to unlock all'} <ArrowRight size={14} />
          </ButtonLink>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2">
        {preferredSubjects.map((subject) => (
          <a
            key={subject.id}
            href={`#${subject.slug}`}
            className="chip transition hover:border-line-strong hover:text-ink"
          >
            {subjectShortByLabel(lang, subject.short)}
            <span className="text-[10px] text-muted">{questionsForSubject(subject.id).length}</span>
          </a>
        ))}
      </div>

      <div className="mt-10 space-y-12">
        {preferredSubjects.map((subject) => (
          <SubjectBlock
            key={subject.id}
            subject={subject}
            isSignedIn={isSignedIn}
            isChapterFree={isChapterFree}
          />
        ))}
      </div>

      {isSignedIn ? (
        <section className="mt-12 overflow-hidden rounded-2xl border border-line bg-surface">
          <button
            type="button"
            onClick={() => setOthersOpen((v) => !v)}
            aria-expanded={othersOpen}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-surface-2/50"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-line bg-surface-2 text-muted">
                <FolderArchive size={17} />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[15.5px] font-semibold text-ink">
                    {lang === 'hi' ? 'अन्य परीक्षाएँ (Others)' : 'Others · Other exams & archived tracks'}
                  </h2>
                  <Badge tone="outline">
                    {otherExamOptions.length} {lang === 'hi' ? 'अन्य परीक्षाएँ' : 'other exams'}
                  </Badge>
                </div>
                <p className="mt-0.5 text-[12px] text-muted">
                  {lang === 'hi'
                    ? `${otherExamOptions.map((e) => e.shortLabel).join(', ')} का डेटा यहाँ ज़िप किया गया है — खोलने या परीक्षा बदलने के लिए क्लिक करें।`
                    : `Content for ${otherExamOptions.map((e) => e.shortLabel).join(', ')} is zipped here so your ${preferredExam} syllabus stays focused.`}
                </p>
              </div>
            </div>
            <ChevronDown
              size={18}
              className={cn('shrink-0 text-muted transition-transform', othersOpen && 'rotate-180')}
            />
          </button>

          {othersOpen ? (
            <div className="space-y-6 border-t border-line bg-surface-2/30 p-5">
              <div>
                <p className="label">
                  {lang === 'hi'
                    ? 'अन्य परीक्षा पर स्विच करें'
                    : 'Switch your active exam preference'}
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {otherExamOptions.map((exam) => (
                    <Button
                      key={exam.id}
                      variant="secondary"
                      size="sm"
                      onClick={() => handleSwitchExam(exam.id)}
                    >
                      {lang === 'hi' ? `${exam.shortLabel} चुनें` : `Switch to ${exam.shortLabel}`}
                      <ArrowRight size={13} />
                    </Button>
                  ))}
                </div>
              </div>

              {otherSubjects.length > 0 ? (
                <div className="space-y-6 border-t border-line pt-5">
                  <p className="label">
                    {lang === 'hi'
                      ? `${preferredExam} के बाहर के विषय और अध्याय`
                      : `Chapters outside ${preferredExam} (zipped)`}
                  </p>
                  {otherSubjects.map((subject) => (
                    <SubjectBlock
                      key={`other-${subject.id}`}
                      subject={subject}
                      isSignedIn={isSignedIn}
                      isChapterFree={isChapterFree}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-muted">
                  {lang === 'hi'
                    ? `${preferredExam} में सभी उपलब्ध विषय पहले से शामिल हैं। किसी अन्य परीक्षा के विशेष मॉक देखने के लिए ऊपर से परीक्षा बदलें।`
                    : `${preferredExam} already includes all 5 core subjects. Switch to another exam above to tailor your mocks and study desk to that exam pattern.`}
                </p>
              )}
            </div>
          ) : null}
        </section>
      ) : null}

      <div className="mt-14 flex flex-col items-start justify-between gap-4 rounded-2xl border border-line bg-surface px-5 py-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-[18px] font-semibold">
            {isSignedIn
              ? copy.library.alreadyTitle
              : lang === 'hi'
                ? 'सभी 25 अध्याय और प्रैक्टिस सेट अनलॉक करना चाहते हैं?'
                : 'Want access to all chapters, practice sprints & mocks?'}
          </h2>
          <p className="mt-1 text-[13px] text-muted">
            {isSignedIn
              ? copy.library.alreadyBody
              : lang === 'hi'
                ? 'मुफ़्त साइन अप करें, अपनी परीक्षा चुनें और व्यक्तिगत अध्ययन डेस्क पाएँ।'
                : 'Sign up for free, choose your exam preference, and get a personalised study workspace.'}
          </p>
        </div>
        <ButtonLink to={isSignedIn ? '/app/practice' : '/signup'}>
          {isSignedIn
            ? copy.library.sprintCta
            : lang === 'hi'
              ? 'निःशुल्क साइन अप करें'
              : 'Sign up & choose exam'}{' '}
          <ArrowRight size={15} />
        </ButtonLink>
      </div>
    </div>
  )
}

function SubjectBlock({
  subject,
  isSignedIn,
  isChapterFree,
}: {
  subject: Subject
  isSignedIn: boolean
  isChapterFree: (ch: Subject['chapters'][number]) => boolean
}) {
  const copy = useCopy()
  const { lang } = useLang()

  return (
    <section id={subject.slug} className="scroll-mt-24">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-4">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              'grid h-11 w-11 shrink-0 place-items-center rounded-xl font-display text-[13px] font-bold',
              tintTile[subject.tint],
            )}
          >
            {subject.code}
          </span>
          <div>
            <h2 className="text-[20px] font-semibold leading-tight">
              {lang === 'hi' ? subject.name.hi : subject.name.en}
            </h2>
            <p className="mt-1 max-w-xl text-[12.5px] leading-relaxed text-muted">
              {subject.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="neutral">
            <ListChecks size={11} /> {copy.library.chaptersN(subject.chapters.length)}
          </Badge>
          <Link
            to={`/subjects/${subject.slug}`}
            className="inline-flex items-center gap-1 text-[12.5px] font-medium text-brand-ink hover:underline"
          >
            {copy.library.overview} <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {subject.chapters.map((chapter) => {
          const unlocked = isSignedIn || isChapterFree(chapter)
          return (
            <Link
              key={chapter.id}
              to={
                unlocked
                  ? `/subjects/${subject.slug}/${chapter.slug}`
                  : '/signup'
              }
              state={
                unlocked
                  ? undefined
                  : {
                      from: `/subjects/${subject.slug}/${chapter.slug}`,
                      reason: `Sign up for free and select your exam to read "${chapter.title.en}" and unlock all practice features.`,
                    }
              }
              className={cn(
                'group flex items-center gap-3 rounded-xl border px-3.5 py-3 transition',
                unlocked
                  ? 'border-line bg-surface hover:border-line-strong hover:bg-surface-2/50'
                  : 'border-dashed border-line bg-surface-2/35 hover:border-brand/40 hover:bg-brand-soft/20',
              )}
            >
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-[13.5px] font-medium text-ink">
                    {lang === 'hi' ? chapter.title.hi : chapter.title.en}
                  </span>
                  {!isSignedIn && unlocked ? (
                    <Badge tone="positive" className="px-1.5 py-0 text-[9.5px]">
                      {lang === 'hi' ? 'निःशुल्क' : 'Free'}
                    </Badge>
                  ) : null}
                  {!unlocked ? (
                    <Badge tone="outline" className="px-1.5 py-0 text-[9.5px]">
                      <Lock size={9} /> {lang === 'hi' ? 'साइन अप' : 'Sign up'}
                    </Badge>
                  ) : null}
                </span>
                <span className="mt-0.5 block truncate text-[11.5px] text-muted">
                  {chapter.blurb}
                </span>
              </span>
              <span className="hidden shrink-0 items-center gap-1 text-[10.5px] text-muted sm:inline-flex">
                <Clock size={11} /> {copy.library.minN(chapter.minutes)}
              </span>
              {unlocked ? (
                <ArrowRight
                  size={14}
                  className="shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-ink"
                />
              ) : (
                <Lock size={13} className="shrink-0 text-muted group-hover:text-brand" />
              )}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
