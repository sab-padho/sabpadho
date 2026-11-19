import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock, Info, Trophy } from 'lucide-react'
import { Badge, Button, ButtonLink, SectionLabel } from '../../components/ui'
import { getMock, paperMarks, paperQuestionCount, sectionQuestionCount } from '../../data/mocks'
import { loadResult } from '../../lib/attempt'
import { usePageTitle } from '../../lib/hooks'

export function MockInstructions() {
  const { mockId = '' } = useParams()
  const paper = getMock(mockId)
  const navigate = useNavigate()
  const [ack, setAck] = useState(false)
  usePageTitle(paper ? `${paper.title} · Instructions` : 'Mock instructions')

  if (!paper) {
    return (
      <div className="card mx-auto max-w-md p-6 text-center">
        <p className="text-[15px] font-semibold">This paper is not available</p>
        <p className="mt-1.5 text-[12.5px] text-muted">Check the mock series for papers open now.</p>
        <ButtonLink to="/app/mocks" className="mt-4">
          Back to mocks
        </ButtonLink>
      </div>
    )
  }

  const count = paperQuestionCount(paper)
  const marks = paperMarks(paper)
  const result = loadResult(paper.id)
  const scheduled = paper.status === 'scheduled'

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        to="/app/mocks"
        className="inline-flex items-center gap-1.5 text-[12px] text-muted transition hover:text-ink"
      >
        <ArrowLeft size={14} /> Mock tests
      </Link>

      <div className="mt-3 grid gap-4 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="brand">{paper.kind}</Badge>
              <span className="text-[11px] text-muted">
                {paper.exam} · Tier I · paper version 1
              </span>
            </div>
            <h1 className="mt-2.5 text-[25px] font-semibold leading-tight">{paper.title}</h1>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">{paper.description}</p>

            <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: 'Questions', value: count },
                { label: 'Minutes', value: paper.durationMinutes },
                { label: 'Marks', value: marks },
                { label: 'Sections', value: paper.sections.length },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-line bg-surface-2/50 px-2.5 py-2">
                  <dt className="text-[10px] text-muted">{item.label}</dt>
                  <dd className="num mt-0.5 font-display text-[17px] font-semibold leading-none">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>

            {scheduled ? (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-gold/30 bg-gold-soft px-3 py-2.5 text-[12px] leading-relaxed text-gold">
                <CalendarDays size={14} className="mt-0.5 shrink-0" />
                This paper opens {paper.opensOn}. The instructions stay here, and a reminder is all
                you need until then.
              </div>
            ) : result ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-positive/25 bg-positive-soft px-3 py-2.5 text-[12px] text-positive">
                <span className="inline-flex items-center gap-1.5">
                  <Check size={13} /> You have already submitted this paper.
                </span>
                <Link
                  to={`/app/mocks/${paper.id}/result`}
                  className="font-medium underline underline-offset-2"
                >
                  View the result
                </Link>
              </div>
            ) : null}
          </div>

          <div className="card p-5">
            <SectionLabel>Paper pattern</SectionLabel>
            <div className="mt-3 overflow-hidden rounded-lg border border-line">
              <div className="grid grid-cols-[1.6fr_0.7fr_0.7fr] gap-2 border-b border-line bg-surface-2/70 px-3 py-2 text-[10px] font-medium uppercase tracking-[0.08em] text-muted">
                <span>Section</span>
                <span className="text-right">Questions</span>
                <span className="text-right">Marks</span>
              </div>
              <ul className="divide-y divide-line">
                {paper.sections.map((section) => (
                  <li
                    key={section.id}
                    className="grid grid-cols-[1.6fr_0.7fr_0.7fr] items-center gap-2 px-3 py-2 text-[12px]"
                  >
                    <span className="text-ink-soft">{section.name}</span>
                    <span className="num text-right text-muted">{sectionQuestionCount(section)}</span>
                    <span className="num text-right">{sectionQuestionCount(section) * 2}</span>
                  </li>
                ))}
              </ul>
            </div>

            <SectionLabel className="mt-5">Instructions</SectionLabel>
            <ol className="mt-2.5 space-y-2 text-[12.5px] leading-relaxed text-ink-soft">
              {[
                `The paper has ${count} questions and a limit of ${paper.durationMinutes} minutes. The clock starts when you open the paper.`,
                'A correct answer earns 2 marks; a wrong answer deducts 0.5; an unattempted question earns nothing.',
                'Use the question palette to move between questions. Answered, marked and unanswered states are labelled separately.',
                'Your selection is saved as you choose it. The “answer saved” label reflects the last acknowledged change.',
                'The language switch in the header changes the prompt only — your selection, timer and review flag stay in place.',
                'Submit once, before the clock runs out. On expiry, the answers already saved are graded.',
                'In this preview, the attempt is kept in this browser tab so a reload does not lose it.',
              ].map((line, index) => (
                <li key={line} className="flex gap-2.5">
                  <span className="num mt-0.5 grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full border border-line text-[9px] text-muted">
                    {index + 1}
                  </span>
                  {line}
                </li>
              ))}
            </ol>

            <label
              className={`mt-5 flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-3 text-[12.5px] transition ${
                ack ? 'border-brand/30 bg-brand-soft/50' : 'border-line bg-surface-2/40'
              }`}
            >
              <input
                type="checkbox"
                checked={ack}
                onChange={(event) => setAck(event.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[var(--brand)]"
              />
              <span className="text-ink-soft">
                I have read the marking scheme and the instructions for this paper.
              </span>
            </label>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button
                disabled={!ack || scheduled}
                onClick={() => navigate(`/app/mocks/${paper.id}/attempt`)}
              >
                {scheduled ? 'Not open yet' : 'Begin paper'}
                <ArrowRight size={15} />
              </Button>
              <ButtonLink to="/app/mocks" variant="ghost" size="sm">
                Not now
              </ButtonLink>
            </div>
          </div>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-24">
          <div className="card p-4">
            <p className="label">At a glance</p>
            <ul className="mt-3 space-y-2.5 text-[12px]">
              <li className="flex items-start justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 text-muted">
                  <Clock size={12} /> Duration
                </span>
                <span>{paper.durationMinutes} minutes</span>
              </li>
              <li className="flex items-start justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 text-muted">
                  <Trophy size={12} /> Maximum
                </span>
                <span>{marks} marks</span>
              </li>
              <li className="flex items-start justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 text-muted">
                  <Info size={12} /> Negative
                </span>
                <span>0.5 per wrong</span>
              </li>
              <li className="flex items-start justify-between gap-3">
                <span className="text-muted">Language</span>
                <span>English · हिंदी</span>
              </li>
            </ul>
          </div>

          <div className="card p-4">
            <p className="text-[12px] font-medium">Before you begin</p>
            <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-muted">
              <li>Keep a rough sheet and pen handy.</li>
              <li>Use a stable connection if you can; the preview keeps answers locally.</li>
              <li>Decide a submission point — 5 minutes left is a sensible one.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-dashed border-line bg-surface-2/40 p-4">
            <p className="text-[11.5px] font-medium">A note on the clock</p>
            <p className="mt-1 text-[10.5px] leading-relaxed text-muted">
              In the live product the deadline is stored on the server, so a browser refresh cannot
              buy extra time. This preview uses the same rule but keeps the deadline in the tab.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
