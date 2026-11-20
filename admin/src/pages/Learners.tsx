import { useMemo, useState } from 'react'
import { ChevronRight, Download, PauseCircle, PlayCircle } from 'lucide-react'
import { TOTAL_LEARNERS, type Learner, type LearnerStatus } from '../data'
import { useAdmin } from '../store'
import { Badge, Drawer, Empty, PageHeader, Progress, SearchInput, Select, downloadCsv, formatDate, number, relativeTime, statusTone, useToast } from '../ui'

const statuses = ['All', 'Active', 'Invited', 'Suspended'] as const
const sorts = [
  { value: 'recent', label: 'Recently active' },
  { value: 'accuracy', label: 'Highest accuracy' },
  { value: 'attempts', label: 'Most attempts' },
  { value: 'name', label: 'Name (A–Z)' },
] as const
type Sort = (typeof sorts)[number]['value']

export function Learners() {
  const { data, setLearnerStatus } = useAdmin()
  const notify = useToast()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<(typeof statuses)[number]>('All')
  const [sort, setSort] = useState<Sort>('recent')
  const [selected, setSelected] = useState<Learner | null>(null)

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const filtered = data.learners.filter(learner => {
      const matchesStatus = status === 'All' || learner.status === status
      const matchesQuery = !needle || `${learner.name} ${learner.email} ${learner.id} ${learner.target}`.toLowerCase().includes(needle)
      return matchesStatus && matchesQuery
    })
    const sorted = [...filtered]
    sorted.sort((a, b) => {
      if (sort === 'accuracy') return b.accuracy - a.accuracy
      if (sort === 'attempts') return b.attempts - a.attempts
      if (sort === 'name') return a.name.localeCompare(b.name)
      return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
    })
    return sorted
  }, [data.learners, query, sort, status])

  const counts = {
    Active: data.learners.filter(learner => learner.status === 'Active').length,
    Invited: data.learners.filter(learner => learner.status === 'Invited').length,
    Suspended: data.learners.filter(learner => learner.status === 'Suspended').length,
  }

  function exportCsv() {
    downloadCsv('sabpadho-learners.csv', [
      ['ID', 'Name', 'Email', 'Target', 'Status', 'Attempts', 'Accuracy %', 'Streak', 'Saved', 'Joined', 'Last active'],
      ...rows.map(learner => [learner.id, learner.name, learner.email, learner.target, learner.status, learner.attempts, learner.accuracy, learner.streak, learner.saved, formatDate(learner.joined), formatDate(learner.lastActive)]),
    ])
    notify(`Exported ${rows.length} learner${rows.length === 1 ? '' : 's'} to CSV`)
  }

  function toggleAccess(learner: Learner) {
    const next: LearnerStatus = learner.status === 'Suspended' ? 'Active' : 'Suspended'
    setLearnerStatus(learner.id, next)
    setSelected(current => (current && current.id === learner.id ? { ...current, status: next } : current))
    notify(next === 'Suspended' ? `${learner.name} suspended` : `${learner.name} reactivated`)
  }

  return (
    <>
      <PageHeader
        eyebrow="ADMIN PORTAL"
        title="Learners"
        description={`${number(TOTAL_LEARNERS)} accounts · ${counts.Active} active, ${counts.Invited} invited, ${counts.Suspended} suspended in this sample`}
        actions={<button className="button secondary" onClick={exportCsv}><Download size={16} />Export CSV</button>}
      />

      <section className="panel table-panel">
        <div className="toolbar">
          <SearchInput value={query} onChange={setQuery} placeholder="Search name, email or ID" />
          <div className="toolbar-group">
            <Select value={status} onChange={setStatus} options={statuses} label="Filter by status" />
            <Select value={sort} onChange={setSort} options={sorts} label="Sort learners" />
          </div>
        </div>

        <div className="table-scroll">
          <table aria-label="Learners">
            <thead>
              <tr>
                <th scope="col">Learner</th>
                <th scope="col">Target</th>
                <th scope="col">Status</th>
                <th scope="col">Attempts</th>
                <th scope="col">Accuracy</th>
                <th scope="col">Last active</th>
                <th scope="col"><span className="sr-only">Open</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(learner => (
                <tr key={learner.id} className="clickable" onClick={() => setSelected(learner)}>
                  <td data-label="Learner">
                    <button className="cell-button" onClick={() => setSelected(learner)}>
                      <strong>{learner.name}</strong>
                      <small className="cell-sub">{learner.email}</small>
                    </button>
                  </td>
                  <td data-label="Target">{learner.target}</td>
                  <td data-label="Status"><Badge tone={statusTone(learner.status)}>{learner.status}</Badge></td>
                  <td data-label="Attempts">{number(learner.attempts)}</td>
                  <td data-label="Accuracy">
                    <div className="cell-meter">
                      <Progress value={learner.accuracy} tone={learner.accuracy >= 70 ? 'positive' : learner.accuracy >= 60 ? 'brand' : 'warning'} />
                      <span>{learner.accuracy}%</span>
                    </div>
                  </td>
                  <td data-label="Last active">{relativeTime(learner.lastActive)}</td>
                  <td className="chev-cell" data-label=""><ChevronRight size={16} className="row-chevron" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && <Empty>No learners match those filters.</Empty>}
        <footer className="table-foot">Showing {rows.length} of {number(TOTAL_LEARNERS)} learners · {data.learners.length} accounts are loaded as a sample</footer>
      </section>

      {selected && (
        <Drawer title={selected.name} subtitle={`${selected.id} · ${selected.email}`} onClose={() => setSelected(null)}>
          <div className="drawer-row">
            <Badge tone={statusTone(selected.status)}>{selected.status}</Badge>
            <Badge tone="brand">{selected.target}</Badge>
          </div>

          <dl className="metric-grid">
            <div><dt>Attempts</dt><dd>{number(selected.attempts)}</dd></div>
            <div><dt>Accuracy</dt><dd>{selected.accuracy}%</dd></div>
            <div><dt>Streak</dt><dd>{selected.streak} days</dd></div>
            <div><dt>Saved questions</dt><dd>{selected.saved}</dd></div>
          </dl>

          <div className="drawer-block">
            <h3>Account</h3>
            <ul className="key-values">
              <li><span>Joined</span><span>{formatDate(selected.joined)}</span></li>
              <li><span>Last active</span><span>{relativeTime(selected.lastActive)}</span></li>
              <li><span>Learner ID</span><span>{selected.id}</span></li>
            </ul>
          </div>

          <div className="drawer-block">
            <h3>Recent practice</h3>
            <ul className="key-values">
              {data.subjects.slice(0, 3).map(subject => (
                <li key={subject.id}>
                  <span>{subject.name}</span>
                  <span>{Math.max(12, Math.round(selected.accuracy - 6 + subject.accuracy / 4))}% accuracy</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="drawer-actions">
            <button className={`button ${selected.status === 'Suspended' ? 'primary' : 'danger'}`} onClick={() => toggleAccess(selected)}>
              {selected.status === 'Suspended' ? <><PlayCircle size={16} />Reactivate access</> : <><PauseCircle size={16} />Suspend access</>}
            </button>
          </div>
          <p className="drawer-note">Demo action: the change is stored in this browser and written to the activity log.</p>
        </Drawer>
      )}
    </>
  )
}
