import { Fragment, useMemo, useState } from 'react'
import { ChevronDown, Download } from 'lucide-react'
import { useAdmin } from '../store'
import { Badge, Empty, PageHeader, Progress, SearchInput, Select, downloadCsv, number, relativeTime, statusTone, useToast } from '../ui'

const difficulties = ['All levels', 'Easy', 'Medium', 'Hard'] as const
const statusFilters = ['All statuses', 'Published', 'Draft', 'Archived'] as const

export function Questions() {
  const { data, setQuestionStatus } = useAdmin()
  const notify = useToast()
  const [query, setQuery] = useState('')
  const [subject, setSubject] = useState('All subjects')
  const [difficulty, setDifficulty] = useState<(typeof difficulties)[number]>('All levels')
  const [status, setStatus] = useState<(typeof statusFilters)[number]>('All statuses')
  const [selected, setSelected] = useState<string[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)

  const subjectOptions = useMemo(() => ['All subjects', ...data.subjects.map(item => item.name)], [data.subjects])

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return data.questions.filter(question => {
      const matchesQuery = !needle || `${question.id} ${question.prompt} ${question.chapter}`.toLowerCase().includes(needle)
      const matchesSubject = subject === 'All subjects' || question.subject === subject
      const matchesDifficulty = difficulty === 'All levels' || question.difficulty === difficulty
      const matchesStatus = status === 'All statuses' || question.status === status
      return matchesQuery && matchesSubject && matchesDifficulty && matchesStatus
    })
  }, [data.questions, difficulty, query, status, subject])

  const visibleIds = rows.map(question => question.id)
  const allSelected = visibleIds.length > 0 && visibleIds.every(id => selected.includes(id))
  const counts = {
    published: data.questions.filter(question => question.status === 'Published').length,
    draft: data.questions.filter(question => question.status === 'Draft').length,
  }

  function toggleAll(next: boolean) {
    setSelected(current => (next ? Array.from(new Set([...current, ...visibleIds])) : current.filter(id => !visibleIds.includes(id))))
  }

  function toggleOne(id: string, next: boolean) {
    setSelected(current => (next ? [...current, id] : current.filter(item => item !== id)))
  }

  function applyBulk(next: 'Published' | 'Draft' | 'Archived') {
    if (!selected.length) return
    setQuestionStatus(selected, next)
    notify(`${selected.length} question${selected.length === 1 ? '' : 's'} moved to ${next.toLowerCase()}`)
    setSelected([])
  }

  function exportCsv() {
    downloadCsv('sabpadho-questions.csv', [
      ['ID', 'Subject', 'Chapter', 'Prompt', 'Difficulty', 'Type', 'Language', 'Status', 'Accuracy %', 'Updated'],
      ...rows.map(question => [question.id, question.subject, question.chapter, question.prompt, question.difficulty, question.type, question.language, question.status, question.accuracy, question.updated]),
    ])
    notify(`Exported ${rows.length} question${rows.length === 1 ? '' : 's'}`)
  }

  return (
    <>
      <PageHeader
        eyebrow="ADMIN PORTAL"
        title="Questions"
        description={`${number(data.questions.length)} questions · ${counts.published} published · ${counts.draft} in draft`}
        actions={<button className="button secondary" onClick={exportCsv}><Download size={16} />Export CSV</button>}
      />

      <section className="panel table-panel">
        <div className="toolbar wrap">
          <SearchInput value={query} onChange={setQuery} placeholder="Search prompt, chapter or ID" />
          <div className="toolbar-group">
            <Select value={subject} onChange={setSubject} options={subjectOptions} label="Filter by subject" />
            <Select value={difficulty} onChange={setDifficulty} options={difficulties} label="Filter by difficulty" />
            <Select value={status} onChange={setStatus} options={statusFilters} label="Filter by status" />
          </div>
        </div>

        {selected.length > 0 && (
          <div className="bulk-bar" role="region" aria-label="Bulk actions">
            <span>{selected.length} selected</span>
            <div className="toolbar-group">
              <button className="button small" onClick={() => applyBulk('Published')}>Publish</button>
              <button className="button secondary small" onClick={() => applyBulk('Draft')}>Move to draft</button>
              <button className="button ghost small" onClick={() => applyBulk('Archived')}>Archive</button>
              <button className="text-button" onClick={() => setSelected([])}>Clear</button>
            </div>
          </div>
        )}

        <div className="table-scroll">
          <table aria-label="Question bank">
            <thead>
              <tr>
                <th scope="col" className="check-cell">
                  <input type="checkbox" checked={allSelected} onChange={event => toggleAll(event.target.checked)} aria-label="Select all visible questions" />
                </th>
                <th scope="col">Question</th>
                <th scope="col">Chapter</th>
                <th scope="col">Level</th>
                <th scope="col">Accuracy</th>
                <th scope="col">Status</th>
                <th scope="col">Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(question => (
                <Fragment key={question.id}>
                  <tr className="clickable" onClick={() => setExpanded(current => (current === question.id ? null : question.id))}>
                    <td className="check-cell" data-label="" onClick={event => event.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.includes(question.id)}
                        onChange={event => toggleOne(question.id, event.target.checked)}
                        aria-label={`Select ${question.id}`}
                      />
                    </td>
                    <td data-label="Question">
                      <button
                        type="button"
                        className="cell-button question-cell"
                        aria-expanded={expanded === question.id}
                        onClick={event => {
                          event.stopPropagation()
                          setExpanded(current => (current === question.id ? null : question.id))
                        }}
                      >
                        <ChevronDown size={15} className={`row-chevron${expanded === question.id ? ' open' : ''}`} />
                        <span>
                          <strong>{question.prompt.length > 68 ? `${question.prompt.slice(0, 68)}…` : question.prompt}</strong>
                          <small className="cell-sub">{question.id} · {question.subject}</small>
                        </span>
                      </button>
                    </td>
                    <td data-label="Chapter">{question.chapter}</td>
                    <td data-label="Level"><Badge tone={question.difficulty === 'Easy' ? 'positive' : question.difficulty === 'Hard' ? 'negative' : 'warning'}>{question.difficulty}</Badge></td>
                    <td data-label="Accuracy">
                      <div className="cell-meter">
                        <Progress value={question.accuracy} tone={question.accuracy >= 70 ? 'positive' : question.accuracy >= 55 ? 'brand' : 'warning'} />
                        <span>{question.accuracy}%</span>
                      </div>
                    </td>
                    <td data-label="Status"><Badge tone={statusTone(question.status)}>{question.status}</Badge></td>
                    <td data-label="Updated">{relativeTime(question.updated)}</td>
                  </tr>
                  {expanded === question.id && (
                    <tr className="detail-row">
                      <td />
                      <td colSpan={6}>
                        <p className="detail-prompt">{question.prompt}</p>
                        <div className="detail-meta">
                          <span>Type: {question.type}</span>
                          <span>Language: {question.language}</span>
                          <span>Subject: {question.subject}</span>
                          <span>Chapter: {question.chapter}</span>
                        </div>
                        <div className="detail-actions">
                          <button className="button small" disabled={question.status === 'Published'} onClick={() => { setQuestionStatus([question.id], 'Published'); notify(`${question.id} published`) }}>Publish</button>
                          <button className="button secondary small" disabled={question.status === 'Draft'} onClick={() => { setQuestionStatus([question.id], 'Draft'); notify(`${question.id} moved to draft`) }}>Move to draft</button>
                          <button className="button ghost small" disabled={question.status === 'Archived'} onClick={() => { setQuestionStatus([question.id], 'Archived'); notify(`${question.id} archived`) }}>Archive</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && <Empty>No questions match those filters.</Empty>}
        <footer className="table-foot">Showing {rows.length} of {data.questions.length}. Select rows for bulk changes.</footer>
      </section>
    </>
  )
}
