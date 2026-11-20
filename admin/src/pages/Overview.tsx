import { ArrowRight, ArrowUpRight, CircleAlert, TrendingDown, TrendingUp } from 'lucide-react'
import { TOTAL_LEARNERS, type Page } from '../data'
import { useAdmin } from '../store'
import { Badge, Bars, Progress, Sparkline, formatDate, number, relativeTime, statusTone } from '../ui'

function Delta({ value, label }: { value: number; label: string }) {
  const up = value >= 0
  const Icon = up ? TrendingUp : TrendingDown
  return (
    <span className={`delta ${up ? 'up' : 'down'}`}>
      <Icon size={13} /> {up ? '+' : ''}{value}% {label}
    </span>
  )
}

export function Overview({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const { data } = useAdmin()
  const active = data.learners.filter(learner => learner.status === 'Active')
  const suspended = data.learners.filter(learner => learner.status === 'Suspended').length
  const attempts = active.reduce((sum, learner) => sum + learner.attempts, 0)
  const accuracy = active.length ? Math.round(active.reduce((sum, learner) => sum + learner.accuracy, 0) / active.length) : 0
  const mockAttempts = data.mocks.reduce((sum, mock) => sum + mock.attempts, 0)
  const publishedQuestions = data.questions.filter(question => question.status === 'Published').length
  const pro = data.plans.find(plan => plan.id === 'pro')
  const free = data.plans.find(plan => plan.id === 'free')
  const yearly = (pro?.learners ?? 0) * (pro?.price ?? 0)

  const attemptsSeries = data.daily.map(point => point.attempts)
  const learnerSeries = data.daily.map(point => point.learners)
  const weekAttempts = attemptsSeries.slice(-7).reduce((sum, value) => sum + value, 0)
  const previousWeek = attemptsSeries.slice(0, 7).reduce((sum, value) => sum + value, 0)
  const weekChange = previousWeek ? Math.round(((weekAttempts - previousWeek) / previousWeek) * 100) : 0
  const peak = data.daily.reduce((best, point) => (point.attempts > best.attempts ? point : best), data.daily[0])

  const drafts = [
    { label: 'Mock tests in draft', count: data.mocks.filter(mock => mock.status === 'Draft').length, page: 'Mock tests' as Page },
    { label: 'Questions awaiting review', count: data.questions.filter(question => question.status === 'Draft').length, page: 'Questions' as Page },
    { label: 'Subject chapters in draft', count: data.subjects.reduce((sum, subject) => sum + subject.chapters.filter(chapter => chapter.status === 'Draft').length, 0), page: 'Subjects' as Page },
  ]

  return (
    <>
      <div className="stat-grid">
        <button className="panel stat" onClick={() => onNavigate('Learners')}>
          <span className="stat-label">Learners</span>
          <strong>{number(TOTAL_LEARNERS)}</strong>
          <Delta value={6} label="vs last week" />
          <Sparkline values={learnerSeries} tone="positive" />
          <span className="stat-foot">{number(free?.learners ?? 0)} free · {number(pro?.learners ?? 0)} pro</span>
        </button>
        <button className="panel stat" onClick={() => onNavigate('Plans')}>
          <span className="stat-label">Pro subscribers</span>
          <strong>{number(pro?.learners ?? 0)}</strong>
          <Delta value={11} label="vs last week" />
          <Progress value={Math.round(((pro?.learners ?? 0) / TOTAL_LEARNERS) * 100)} />
          <span className="stat-foot">₹{number(yearly)} a year at ₹{pro?.price ?? 51}</span>
        </button>
        <button className="panel stat" onClick={() => onNavigate('Questions')}>
          <span className="stat-label">Practice attempts</span>
          <strong>{number(attempts)}</strong>
          <Delta value={weekChange} label="weekly trend" />
          <Sparkline values={attemptsSeries} />
          <span className="stat-foot">{publishedQuestions} published questions</span>
        </button>
        <button className="panel stat" onClick={() => onNavigate('Learners')}>
          <span className="stat-label">Average accuracy</span>
          <strong>{accuracy}%</strong>
          <Delta value={3} label="vs last week" />
          <Progress value={accuracy} />
          <span className="stat-foot">Sample of {data.learners.length} loaded accounts</span>
        </button>
        <button className="panel stat" onClick={() => onNavigate('Mock tests')}>
          <span className="stat-label">Mock attempts</span>
          <strong>{number(mockAttempts)}</strong>
          <Delta value={-4} label="vs last week" />
          <Sparkline values={data.mocks.map(mock => mock.attempts + 40)} tone="warning" />
          <span className="stat-foot">{data.mocks.filter(mock => mock.status === 'Published').length} papers live</span>
        </button>
      </div>

      <div className="overview-grid">
        <section className="panel chart-card">
          <header>
            <div>
              <h2>Practice attempts</h2>
              <p>Last 14 days · {number(weekAttempts)} answered this week</p>
            </div>
            <Badge tone="brand">{number(peak.attempts)} peak</Badge>
          </header>
          <Bars points={data.daily} />
          <footer>
            <span>{formatDate(data.daily[0].date)}</span>
            <span>{formatDate(data.daily[data.daily.length - 1].date)}</span>
          </footer>
        </section>

        <section className="panel queue-card">
          <header>
            <h2>Needs attention</h2>
            <p>Drafts waiting on a decision</p>
          </header>
          <ul>
            {drafts.map(item => (
              <li key={item.label}>
                <button onClick={() => onNavigate(item.page)}>
                  <span className={`queue-count${item.count ? ' active' : ''}`}>{item.count}</span>
                  <span>{item.label}</span>
                  <ArrowUpRight size={15} />
                </button>
              </li>
            ))}
          </ul>
          {suspended > 0 && (
            <p className="queue-note">
              <CircleAlert size={14} /> {suspended} learner{suspended === 1 ? '' : 's'} suspended
            </p>
          )}
        </section>
      </div>

      <div className="overview-grid wide-left">
        <section className="panel list-card">
          <header>
            <div>
              <h2>Section accuracy</h2>
              <p>Average score per subject across learners</p>
            </div>
            <button className="text-button" onClick={() => onNavigate('Subjects')}>All subjects <ArrowRight size={14} /></button>
          </header>
          <ul className="subject-rows">
            {data.subjects.map(subject => (
              <li key={subject.id}>
                <div className="subject-row-main">
                  <span className="subject-code">{subject.code}</span>
                  <div>
                    <strong>{subject.name}</strong>
                    <small>{subject.chapters.length} chapters · {number(subject.learners)} learners</small>
                  </div>
                </div>
                <div className="subject-row-metrics">
                  <Progress value={subject.accuracy} tone={subject.accuracy >= 70 ? 'positive' : subject.accuracy >= 60 ? 'brand' : 'warning'} />
                  <span>{subject.accuracy}%</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel list-card">
          <header>
            <div>
              <h2>Recent activity</h2>
              <p>Staff changes in this workspace</p>
            </div>
            <button className="text-button" onClick={() => onNavigate('Activity')}>Full log <ArrowRight size={14} /></button>
          </header>
          <ul className="feed">
            {data.activity.slice(0, 5).map(entry => (
              <li key={entry.id}>
                <span className="avatar">{entry.actor.slice(0, 1).toUpperCase()}</span>
                <div>
                  <p><strong>{entry.actor}</strong> {entry.action} <em>{entry.target}</em></p>
                  <small>{relativeTime(entry.at)}</small>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="panel list-card">
        <header>
          <div>
            <h2>Latest mock papers</h2>
            <p>Attempts and average scores</p>
          </div>
          <button className="text-button" onClick={() => onNavigate('Mock tests')}>Manage <ArrowRight size={14} /></button>
        </header>
        <div className="table-scroll">
          <table aria-label="Latest mock papers">
            <thead>
              <tr><th scope="col">Paper</th><th scope="col">Questions</th><th scope="col">Attempts</th><th scope="col">Avg score</th><th scope="col">Status</th></tr>
            </thead>
            <tbody>
              {data.mocks.slice(0, 4).map(mock => (
                <tr key={mock.id}>
                  <td><strong>{mock.title}</strong><small className="cell-sub">{mock.sections} sections · {mock.minutes} min</small></td>
                  <td>{mock.questions}</td>
                  <td>{number(mock.attempts)}</td>
                  <td>{mock.avgScore || '—'}</td>
                  <td><Badge tone={statusTone(mock.status)}>{mock.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
