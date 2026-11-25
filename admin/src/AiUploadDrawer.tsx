import { useState, type ChangeEvent } from 'react'
import { Check, FileText, Image as ImageIcon, KeyRound, Loader2, Sparkles, Trash2, Upload } from 'lucide-react'
import {
  convertFileWithOpenAI,
  getOpenAIApiKey,
  setOpenAIApiKey,
  type ExtractedNotes,
  type ExtractedQuestion,
} from './aiImport'
import { EXAM_TARGETS, type Difficulty, type ExamTarget } from './data'
import { useAdmin } from './store'
import { Badge, Drawer, useToast } from './ui'

export function AiUploadDrawer({
  defaultMode = 'both',
  defaultSubjectId,
  defaultChapterId,
  onClose,
}: {
  defaultMode?: 'questions' | 'notes' | 'both'
  defaultSubjectId?: string
  defaultChapterId?: string
  onClose: () => void
}) {
  const { data, importQuestions, importChapterNote, source } = useAdmin()
  const notify = useToast()

  const initialSubject =
    data.subjects.find((s) => s.id === defaultSubjectId) ?? data.subjects[0]
  const [subjectId, setSubjectId] = useState(initialSubject?.id ?? 'maths')
  const activeSubject = data.subjects.find((s) => s.id === subjectId) ?? data.subjects[0]
  const [chapterId, setChapterId] = useState(
    defaultChapterId ?? activeSubject?.chapters[0]?.id ?? '',
  )
  const [mode, setMode] = useState<'questions' | 'notes' | 'both'>(defaultMode)
  const [selectedExams, setSelectedExams] = useState<ExamTarget[]>([
    'SSC CGL',
    'SSC CHSL',
  ])
  const [markNoteFree, setMarkNoteFree] = useState(true)
  const [apiKey, setApiKey] = useState(getOpenAIApiKey)
  const [showKeyField, setShowKeyField] = useState(() => !getOpenAIApiKey())
  const [file, setFile] = useState<File | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [questions, setQuestions] = useState<ExtractedQuestion[]>([])
  const [notes, setNotes] = useState<ExtractedNotes | null>(null)

  const activeChapter =
    activeSubject?.chapters.find((c) => c.id === chapterId) ?? activeSubject?.chapters[0]

  function onSubjectChange(nextSubjectId: string) {
    setSubjectId(nextSubjectId)
    const subj = data.subjects.find((s) => s.id === nextSubjectId)
    if (subj?.chapters[0]) {
      setChapterId(subj.chapters[0].id)
    }
  }

  function toggleExam(exam: ExamTarget) {
    setSelectedExams((prev) =>
      prev.includes(exam)
        ? prev.length > 1
          ? prev.filter((item) => item !== exam)
          : prev
        : [...prev, exam],
    )
  }

  function handleFilePick(e: ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0] ?? null
    setFile(picked)
    setError(null)
  }

  async function runExtraction() {
    if (!file) {
      setError('Select a PDF or image file first.')
      return
    }
    if (!activeSubject || !activeChapter) {
      setError('Select a target subject and chapter.')
      return
    }
    setError(null)
    setExtracting(true)
    try {
      if (apiKey.trim()) {
        setOpenAIApiKey(apiKey.trim())
      }
      const result = await convertFileWithOpenAI({
        file,
        mode,
        subjectName: activeSubject.name,
        chapterTitle: activeChapter.title,
        exams: selectedExams,
        apiKey: apiKey.trim(),
      })
      setQuestions(result.questions)
      setNotes(result.notes ?? null)
      if (!result.questions.length && !result.notes) {
        setError('OpenAI processed the file, but no structured questions or notes were detected.')
      } else {
        notify(
          `Extracted ${result.questions.length} question${result.questions.length === 1 ? '' : 's'}${result.notes ? ' + structured chapter notes' : ''}`,
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OpenAI extraction failed.')
    } finally {
      setExtracting(false)
    }
  }

  function updateQuestion(index: number, patch: Partial<ExtractedQuestion>) {
    setQuestions((prev) => prev.map((q, idx) => (idx === index ? { ...q, ...patch } : q)))
  }

  function removeQuestion(index: number) {
    setQuestions((prev) => prev.filter((_, idx) => idx !== index))
  }

  async function saveAllToSupabase() {
    if (!activeSubject || !activeChapter) return
    if (!questions.length && !notes) return

    setSaving(true)
    setError(null)
    try {
      let savedCount = 0
      if (questions.length > 0) {
        savedCount = await importQuestions(
          questions.map((q) => ({
            subjectId: activeSubject.id,
            subjectName: activeSubject.name,
            chapterId: activeChapter.id,
            chapterTitle: activeChapter.title,
            promptEn: q.promptEn,
            promptHi: q.promptHi,
            optionsEn: q.optionsEn,
            optionsHi: q.optionsHi,
            correct: q.correct,
            explanationEn: q.explanationEn,
            explanationHi: q.explanationHi,
            difficulty: q.difficulty,
            exams: selectedExams,
            status: 'Published',
            sourceFilename: file?.name,
          })),
        )
      }

      if (notes) {
        await importChapterNote({
          subjectId: activeSubject.id,
          chapterId: activeChapter.id,
          titleEn: notes.titleEn,
          titleHi: notes.titleHi,
          contentEn: notes.contentEn,
          contentHi: notes.contentHi,
          keyPointsEn: notes.keyPointsEn,
          keyPointsHi: notes.keyPointsHi,
          formulas: notes.formulas,
          isFree: markNoteFree,
          exams: selectedExams,
          status: 'Published',
          sourceFilename: file?.name,
        })
      }

      notify(
        `Saved ${savedCount ? `${savedCount} questions` : ''}${savedCount && notes ? ' and ' : ''}${notes ? 'chapter notes' : ''} to ${source === 'supabase' ? 'Supabase' : 'catalogue'}`,
      )
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save to Supabase.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Drawer
      title="Upload PDF or Image → OpenAI Importer"
      subtitle="Convert question papers, textbook scans, or handwritten sheets into bilingual MCQs & structured notes stored in Supabase."
      onClose={onClose}
    >
      <div className="drawer-row">
        <Badge tone="brand">OpenAI GPT-4o Vision + JSON</Badge>
        <Badge tone={source === 'supabase' ? 'positive' : 'neutral'}>
          {source === 'supabase' ? 'Connected to Supabase' : 'Supabase + Local Sync'}
        </Badge>
      </div>

      {/* Step 1: Destination & Mode */}
      <div className="drawer-block">
        <h3>1. Target chapter &amp; exams</h3>
        <div style={{ display: 'grid', gap: '10px', marginTop: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="field-group" style={{ margin: 0 }}>
              <label htmlFor="ai-subject">Subject</label>
              <select
                id="ai-subject"
                value={subjectId}
                onChange={(e) => onSubjectChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid var(--line)',
                  background: 'var(--surface)',
                  color: 'var(--ink)',
                  fontSize: '13px',
                }}
              >
                {data.subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group" style={{ margin: 0 }}>
              <label htmlFor="ai-chapter">Chapter</label>
              <select
                id="ai-chapter"
                value={activeChapter?.id ?? ''}
                onChange={(e) => setChapterId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid var(--line)',
                  background: 'var(--surface)',
                  color: 'var(--ink)',
                  fontSize: '13px',
                }}
              >
                {(activeSubject?.chapters ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field-group" style={{ margin: 0 }}>
            <label>Convert into</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {(
                [
                  { id: 'both', label: 'Questions + Chapter Notes' },
                  { id: 'questions', label: 'Structured Questions only' },
                  { id: 'notes', label: 'Chapter Notes only' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`button small ${mode === opt.id ? 'primary' : 'secondary'}`}
                  onClick={() => setMode(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field-group" style={{ margin: 0 }}>
            <label>Tag for target exams</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {EXAM_TARGETS.map((exam) => {
                const active = selectedExams.includes(exam)
                return (
                  <button
                    key={exam}
                    type="button"
                    onClick={() => toggleExam(exam)}
                    className={`button small ${active ? 'primary' : 'secondary'}`}
                  >
                    {active ? <Check size={13} /> : null}
                    {exam}
                  </button>
                )
              })}
            </div>
          </div>

          {mode !== 'questions' ? (
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12.5px',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={markNoteFree}
                onChange={(e) => setMarkNoteFree(e.target.checked)}
              />
              Allow unauthenticated visitors to view these notes on free starter chapters
            </label>
          ) : null}
        </div>
      </div>

      {/* Step 2: OpenAI API Key & File */}
      <div className="drawer-block">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>2. Upload PDF or Image</h3>
          <button
            type="button"
            className="text-button"
            onClick={() => setShowKeyField((v) => !v)}
            style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <KeyRound size={13} />
            {apiKey ? 'OpenAI key configured' : 'Set OpenAI API key'}
          </button>
        </div>

        {showKeyField ? (
          <div className="field-group" style={{ marginTop: '8px' }}>
            <label htmlFor="openai-key">OpenAI API Key (used directly with api.openai.com)</label>
            <input
              id="openai-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              autoComplete="off"
            />
            <small className="field-note">
              Reads <code>VITE_OPENAI_API_KEY</code> automatically if set in <code>.env</code>, or saves locally in this browser.
            </small>
          </div>
        ) : null}

        <label
          htmlFor="ai-file-upload"
          style={{
            marginTop: '10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '18px',
            border: '1.5px dashed var(--line-strong, var(--line))',
            borderRadius: '12px',
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          {file ? (
            <>
              {file.type.includes('pdf') ? <FileText size={22} /> : <ImageIcon size={22} />}
              <strong style={{ fontSize: '13px' }}>{file.name}</strong>
              <small style={{ color: 'var(--muted)', fontSize: '11.5px' }}>
                {(file.size / 1024).toFixed(1)} KB · Click to replace file
              </small>
            </>
          ) : (
            <>
              <Upload size={22} />
              <strong style={{ fontSize: '13px' }}>Choose a PDF or Image (PNG, JPG, WEBP)</strong>
              <small style={{ color: 'var(--muted)', fontSize: '11.5px' }}>
                Supports digital PDFs, scanned question papers, and coaching notes photos
              </small>
            </>
          )}
          <input
            id="ai-file-upload"
            type="file"
            accept=".pdf,image/png,image/jpeg,image/webp"
            onChange={handleFilePick}
            style={{ display: 'none' }}
          />
        </label>

        {error ? (
          <p className="notice" role="alert" style={{ marginTop: '10px' }}>
            {error}
          </p>
        ) : null}

        <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="button primary"
            disabled={!file || extracting}
            onClick={runExtraction}
          >
            {extracting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Converting with OpenAI…
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Convert with OpenAI
              </>
            )}
          </button>
        </div>
      </div>

      {/* Step 3: Preview & Edit Structured Output */}
      {(questions.length > 0 || notes) && (
        <div className="drawer-block">
          <h3>
            3. Review &amp; Save to Supabase ({questions.length} MCQs
            {notes ? ' + 1 Note set' : ''})
          </h3>

          {notes ? (
            <div
              style={{
                marginTop: '10px',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid var(--line)',
                display: 'grid',
                gap: '8px',
              }}
            >
              <Badge tone="brand">Structured Chapter Notes</Badge>
              <div className="field-group" style={{ margin: 0 }}>
                <label>Title (EN)</label>
                <input
                  value={notes.titleEn}
                  onChange={(e) => setNotes({ ...notes, titleEn: e.target.value })}
                />
              </div>
              <div className="field-group" style={{ margin: 0 }}>
                <label>Summary (EN)</label>
                <textarea
                  rows={3}
                  value={notes.contentEn}
                  onChange={(e) => setNotes({ ...notes, contentEn: e.target.value })}
                />
              </div>
              <div className="field-group" style={{ margin: 0 }}>
                <label>सारांश (HI)</label>
                <textarea
                  rows={2}
                  value={notes.contentHi}
                  onChange={(e) => setNotes({ ...notes, contentHi: e.target.value })}
                />
              </div>
              {notes.keyPointsEn.length > 0 ? (
                <small style={{ color: 'var(--muted)', fontSize: '11.5px' }}>
                  {notes.keyPointsEn.length} key points · {notes.formulas.length} formulas extracted
                </small>
              ) : null}
            </div>
          ) : null}

          {questions.length > 0 ? (
            <div style={{ marginTop: '10px', display: 'grid', gap: '10px' }}>
              {questions.map((q, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid var(--line)',
                    display: 'grid',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '12.5px' }}>Question #{idx + 1}</strong>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <select
                        value={q.difficulty}
                        onChange={(e) =>
                          updateQuestion(idx, { difficulty: e.target.value as Difficulty })
                        }
                        style={{
                          padding: '3px 6px',
                          borderRadius: '6px',
                          border: '1px solid var(--line)',
                          background: 'var(--surface)',
                          color: 'var(--ink)',
                          fontSize: '11.5px',
                        }}
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => removeQuestion(idx)}
                        aria-label="Remove question"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    value={q.promptEn}
                    onChange={(e) => updateQuestion(idx, { promptEn: e.target.value })}
                    placeholder="English prompt"
                    style={{ fontSize: '12.5px' }}
                  />
                  <textarea
                    rows={2}
                    value={q.promptHi}
                    onChange={(e) => updateQuestion(idx, { promptHi: e.target.value })}
                    placeholder="हिंदी प्रश्न"
                    style={{ fontSize: '12.5px' }}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    {q.optionsEn.map((opt, optIdx) => (
                      <label
                        key={optIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px',
                        }}
                      >
                        <input
                          type="radio"
                          name={`correct-${idx}`}
                          checked={q.correct === optIdx}
                          onChange={() =>
                            updateQuestion(idx, { correct: optIdx as 0 | 1 | 2 | 3 })
                          }
                        />
                        <input
                          value={opt}
                          onChange={(e) => {
                            const next = [...q.optionsEn] as [string, string, string, string]
                            next[optIdx] = e.target.value
                            updateQuestion(idx, { optionsEn: next })
                          }}
                          style={{ width: '100%', fontSize: '12px', padding: '4px 6px' }}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="drawer-actions" style={{ marginTop: '14px' }}>
            <button
              type="button"
              className="button primary"
              disabled={saving}
              onClick={saveAllToSupabase}
            >
              {saving ? 'Saving to Supabase…' : 'Save & Publish to Supabase'}
            </button>
          </div>
        </div>
      )}
    </Drawer>
  )
}
