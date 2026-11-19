import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock, Info, Trophy } from 'lucide-react'
import { Badge, Button, ButtonLink, SectionLabel } from '../../components/ui'
import { getMock, paperMarks, paperQuestionCount, sectionQuestionCount } from '../../data/mocks'
import { loadResult } from '../../lib/attempt'
import { usePageTitle } from '../../lib/hooks'
import { useLang } from '../../lib/lang'
import { useCopy, localDate, mockKindLabel, sectionName } from '../../lib/ui-copy'

export function MockInstructions() {
  const { mockId = '' } = useParams()
  const paper = getMock(mockId)
  const navigate = useNavigate()
  const { lang } = useLang()
  const copy = useCopy()
  const [ack, setAck] = useState(false)
  usePageTitle(paper ? copy.instructions.title(paper.title) : copy.instructions.fallback)

  if (!paper) {
    return (
      <div className="card mx-auto max-w-md p-6 text-center">
        <p className="text-[15px] font-semibold">{copy.mock.notAvailableTitle}</p>
        <p className="mt-1.5 text-[12.5px] text-muted">{copy.mock.notAvailableBody}</p>
        <ButtonLink to="/app/mocks" className="mt-4">
          {copy.mock.backToMocks}
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
        <ArrowLeft size={14} /> {copy.mock.label}
      </Link>

      <div className="mt-3 grid gap-4 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="brand">{mockKindLabel(lang, paper.kind)}</Badge>
              <span className="text-[11px] text-muted">{copy.instructions.examMeta(paper.exam)}</span>
            </div>
            <h1 className="mt-2.5 text-[25px] font-semibold leading-tight">{paper.title}</h1>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">{lang === 'hi' ? paper.descriptionHi : paper.description}</p>

            <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: copy.instructions.questions, value: count },
                { label: copy.instructions.minutes, value: paper.durationMinutes },
                { label: copy.instructions.marks, value: marks },
                { label: copy.instructions.sections, value: paper.sections.length },
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
                {paper.opensOn ? copy.instructions.opensBody(localDate(lang, paper.opensOn)) : null}
              </div>
            ) : result ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-positive/25 bg-positive-soft px-3 py-2.5 text-[12px] text-positive">
                <span className="inline-flex items-center gap-1.5">
                  <Check size={13} /> {copy.instructions.alreadySubmitted}
                </span>
                <Link
                  to={`/app/mocks/${paper.id}/result`}
                  className="font-medium underline underline-offset-2"
                >
                  {copy.instructions.viewResult}
                </Link>
              </div>
            ) : null}
          </div>

          <div className="card p-5">
            <SectionLabel>{copy.instructions.pattern}</SectionLabel>
            <div className="mt-3 overflow-hidden rounded-lg border border-line">
              <div className="grid grid-cols-[1.6fr_0.7fr_0.7fr] gap-2 border-b border-line bg-surface-2/70 px-3 py-2 text-[10px] font-medium uppercase tracking-[0.08em] text-muted">
                <span>{copy.instructions.section}</span>
                <span className="text-right">{copy.instructions.questionsCol}</span>
                <span className="text-right">{copy.instructions.marksCol}</span>
              </div>
              <ul className="divide-y divide-line">
                {paper.sections.map((section) => (
                  <li
                    key={section.id}
                    className="grid grid-cols-[1.6fr_0.7fr_0.7fr] items-center gap-2 px-3 py-2 text-[12px]"
                  >
                    <span className="text-ink-soft">{sectionName(lang, section.name)}</span>
                    <span className="num text-right text-muted">{sectionQuestionCount(section)}</span>
                    <span className="num text-right">{sectionQuestionCount(section) * 2}</span>
                  </li>
                ))}
              </ul>
            </div>

            <SectionLabel className="mt-5">{copy.instructions.heading}</SectionLabel>
            <ol className="mt-2.5 space-y-2 text-[12.5px] leading-relaxed text-ink-soft">
              {[
                copy.instructions.ruleClock(count, paper.durationMinutes),
                copy.instructions.ruleMarking,
                copy.instructions.rulePalette,
                copy.instructions.ruleSaved,
                copy.instructions.ruleLanguage,
                copy.instructions.ruleSubmit,
                copy.instructions.rulePreview,
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
                {copy.instructions.ack}
              </span>
            </label>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button
                disabled={!ack || scheduled}
                onClick={() => navigate(`/app/mocks/${paper.id}/attempt`)}
              >
                {scheduled ? copy.instructions.notOpen : copy.instructions.begin}
                <ArrowRight size={15} />
              </Button>
              <ButtonLink to="/app/mocks" variant="ghost" size="sm">
                {copy.instructions.notNow}
              </ButtonLink>
            </div>
          </div>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-24">
          <div className="card p-4">
            <p className="label">{copy.instructions.glance}</p>
            <ul className="mt-3 space-y-2.5 text-[12px]">
              <li className="flex items-start justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 text-muted">
                  <Clock size={12} /> {copy.instructions.duration}
                </span>
                <span>{copy.mock.minutesN(paper.durationMinutes)}</span>
              </li>
              <li className="flex items-start justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 text-muted">
                  <Trophy size={12} /> {copy.instructions.maximum}
                </span>
                <span>{copy.mock.marksN(marks)}</span>
              </li>
              <li className="flex items-start justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 text-muted">
                  <Info size={12} /> {copy.instructions.negative}
                </span>
                <span>{copy.instructions.negativeVal}</span>
              </li>
              <li className="flex items-start justify-between gap-3">
                <span className="text-muted">{copy.instructions.language}</span>
                <span>English · हिंदी</span>
              </li>
            </ul>
          </div>

          <div className="card p-4">
            <p className="text-[12px] font-medium">{copy.instructions.beforeBegin}</p>
            <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-muted">
              <li>{copy.instructions.tip1}</li>
              <li>{copy.instructions.tip2}</li>
              <li>{copy.instructions.tip3}</li>
            </ul>
          </div>

          <div className="rounded-xl border border-dashed border-line bg-surface-2/40 p-4">
            <p className="text-[11.5px] font-medium">{copy.instructions.clockNote}</p>
            <p className="mt-1 text-[10.5px] leading-relaxed text-muted">
              {copy.instructions.clockBody}
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
