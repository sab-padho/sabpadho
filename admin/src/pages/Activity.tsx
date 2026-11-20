import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { useAdmin } from '../store'
import { PageHeader, SearchInput, downloadCsv, formatDate, relativeTime, useToast } from '../ui'

export function ActivityPage() {
  const { data } = useAdmin()
  const notify = useToast()
  const [query, setQuery] = useState('')

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return data.activity.filter(entry =>
      !needle || `${entry.actor} ${entry.action} ${entry.target}`.toLowerCase().includes(needle),
    )
  }, [data.activity, query])

  const actors = Array.from(new Set(data.activity.map(entry => entry.actor)))

  function exportCsv() {
    downloadCsv('sabpadho-activity.csv', [
      ['When', 'Actor', 'Action', 'Target'],
      ...rows.map(entry => [formatDate(entry.at), entry.actor, entry.action, entry.target]),
    ])
    notify(`Exported ${rows.length} entr${rows.length === 1 ? 'y' : 'ies'}`)
  }

  return (
    <>
      <PageHeader
        eyebrow="ADMIN PORTAL"
        title="Activity"
        description={`${data.activity.length} recent changes by ${actors.length} staff account${actors.length === 1 ? '' : 's'}`}
        actions={<button className="button secondary" onClick={exportCsv}><Download size={16} />Export CSV</button>}
      />

      <section className="panel table-panel">
        <div className="toolbar">
          <SearchInput value={query} onChange={setQuery} placeholder="Search action, target or staff" />
        </div>
        <ol className="timeline">
          {rows.map(entry => (
            <li key={entry.id}>
              <span className="avatar">{entry.actor.slice(0, 1).toUpperCase()}</span>
              <div className="timeline-body">
                <p><strong>{entry.actor}</strong> {entry.action} <em>{entry.target}</em></p>
                <small title={formatDate(entry.at)}>{relativeTime(entry.at)}</small>
              </div>
            </li>
          ))}
        </ol>
        {!rows.length && <p className="empty">No activity matches that search.</p>}
        <footer className="table-foot">Portal actions are appended here and kept in this browser only.</footer>
      </section>
    </>
  )
}
