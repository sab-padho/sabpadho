import { useMemo, useState } from 'react'
import { Archive, Copy, Download } from 'lucide-react'
import { useAdmin } from '../store'
import { Badge, Empty, PageHeader, SearchInput, Select, Toggle, downloadCsv, formatDate, number, relativeTime, statusTone, useToast } from '../ui'

const filters = ['All', 'Published', 'Draft', 'Archived'] as const

export function Mocks() {
  const { data, setMockStatus, duplicateMock } = useAdmin()
  const notify = useToast()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<(typeof filters)[number]>('All')

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return data.mocks.filter(mock => {
      const matchesStatus = status === 'All' || mock.status === status
      const matchesQuery = !needle || `${mock.title} ${mock.id}`.toLowerCase().includes(needle)
      return matchesStatus && matchesQuery
    })
  }, [data.mocks, query, status])

  const attempts = data.mocks.reduce((sum, mock) => sum + mock.attempts, 0)
  const live = data.mocks.filter(mock => mock.status === 'Published').length

  function exportCsv() {
    downloadCsv('sabpadho-mock-tests.csv', [
      ['ID', 'Title', 'Sections', 'Questions', 'Minutes', 'Attempts', 'Avg score', 'Status', 'Updated'],
      ...rows.map(mock => [mock.id, mock.title, mock.sections, mock.questions, mock.minutes, mock.attempts, mock.avgScore, mock.status, formatDate(mock.updated)]),
    ])
    notify(`Exported ${rows.length} mock paper${rows.length === 1 ? '' : 's'}`)
  }

  return (
    <>
      <PageHeader
        eyebrow="ADMIN PORTAL"
        title="Mock tests"
        description={`${data.mocks.length} papers · ${live} live · ${number(attempts)} attempts`}
        actions={<button className="button secondary" onClick={exportCsv}><Download size={16} />Export CSV</button>}
      />

      <section className="panel table-panel">
        <div className="toolbar">
          <SearchInput value={query} onChange={setQuery} placeholder="Search paper or ID" />
          <div className="toolbar-group">
            <Select value={status} onChange={setStatus} options={filters} label="Filter by status" />
          </div>
        </div>

        <div className="table-scroll">
          <table aria-label="Mock tests">
            <thead>
              <tr>
                <th scope="col">Paper</th>
                <th scope="col">Pattern</th>
                <th scope="col">Attempts</th>
                <th scope="col">Avg score</th>
                <th scope="col">Status</th>
                <th scope="col">Live</th>
                <th scope="col">Updated</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(mock => (
                <tr key={mock.id}>
                  <td data-label="Paper"><span className="cell-stack"><strong>{mock.title}</strong><small className="cell-sub">{mock.id}</small></span></td>
                  <td data-label="Pattern">{mock.sections} sections · {mock.questions} Q · {mock.minutes} min</td>
                  <td data-label="Attempts">{number(mock.attempts)}</td>
                  <td data-label="Avg score">{mock.avgScore ? mock.avgScore.toFixed(1) : '—'}</td>
                  <td data-label="Status"><Badge tone={statusTone(mock.status)}>{mock.status}</Badge></td>
                  <td data-label="Live">
                    <Toggle
                      checked={mock.status === 'Published'}
                      label={`${mock.status === 'Published' ? 'Unpublish' : 'Publish'} ${mock.title}`}
                      onChange={next => {
                        setMockStatus(mock.id, next ? 'Published' : 'Draft')
                        notify(next ? `${mock.title} published` : `${mock.title} moved to draft`)
                      }}
                    />
                  </td>
                  <td data-label="Updated">{relativeTime(mock.updated)}</td>
                  <td data-label="Actions">
                    <div className="row-actions">
                      <button className="icon-button" title="Duplicate as draft" aria-label={`Duplicate ${mock.title}`} onClick={() => { duplicateMock(mock.id); notify(`${mock.title} duplicated as draft`) }}>
                        <Copy size={15} />
                      </button>
                      <button
                        className="icon-button"
                        title="Archive"
                        aria-label={`Archive ${mock.title}`}
                        disabled={mock.status === 'Archived'}
                        onClick={() => { setMockStatus(mock.id, 'Archived'); notify(`${mock.title} archived`) }}
                      >
                        <Archive size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && <Empty>No mock papers match those filters.</Empty>}
        <footer className="table-foot">Showing {rows.length} of {data.mocks.length} papers. Duplicates start as drafts.</footer>
      </section>
    </>
  )
}
