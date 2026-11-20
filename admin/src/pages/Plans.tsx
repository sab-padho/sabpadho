import { Check, Crown, Users } from 'lucide-react'
import { TOTAL_LEARNERS, type Plan } from '../data'
import { useAdmin } from '../store'
import { Badge, PageHeader, Progress, Toggle, number, statusTone, useToast } from '../ui'

const priceLabel = (plan: Plan) => (plan.price === 0 ? 'Free' : `₹${plan.price}`)
const periodLabel = (plan: Plan) => (plan.period === 'year' ? '/year' : '')

export function Plans() {
  const { data, setPlanStatus } = useAdmin()
  const notify = useToast()

  const total = data.plans.reduce((sum, plan) => sum + plan.learners, 0) || TOTAL_LEARNERS
  const pro = data.plans.find(plan => plan.id === 'pro')
  const free = data.plans.find(plan => plan.id === 'free')
  const paying = pro?.learners ?? 0
  const yearly = paying * (pro?.price ?? 0)
  const conversions = total ? Math.round((paying / total) * 100) : 0

  return (
    <>
      <PageHeader
        eyebrow="ADMIN PORTAL"
        title="Plans"
        description={`${number(TOTAL_LEARNERS)} learners on ${data.plans.length} plans · Pro is ₹${pro?.price ?? 51} per year`}
        actions={<Badge tone="brand">Static demo figures</Badge>}
      />

      <div className="stat-grid">
        <div className="panel stat">
          <span className="stat-label">Total learners</span>
          <strong>{number(TOTAL_LEARNERS)}</strong>
          <span className="stat-foot">Reported by the learner portal</span>
        </div>
        <div className="panel stat">
          <span className="stat-label">On Free</span>
          <strong>{number(free?.learners ?? 0)}</strong>
          <span className="stat-foot">{100 - conversions}% of all accounts</span>
        </div>
        <div className="panel stat">
          <span className="stat-label">Pro subscribers</span>
          <strong>{number(paying)}</strong>
          <span className="stat-foot">{conversions}% conversion</span>
        </div>
        <div className="panel stat">
          <span className="stat-label">Annual revenue</span>
          <strong>₹{number(yearly)}</strong>
          <span className="stat-foot">{number(paying)} × ₹{pro?.price ?? 51} billed yearly</span>
        </div>
      </div>

      <section className="panel split-card">
        <header>
          <div>
            <h2>Plan mix</h2>
            <p>Share of the {number(TOTAL_LEARNERS)} learner accounts</p>
          </div>
        </header>
        <div className="split-bar" aria-hidden>
          <span className="free" style={{ width: `${100 - conversions}%` }} />
          <span className="pro" style={{ width: `${conversions}%` }} />
        </div>
        <ul className="split-legend">
          <li><i className="dot free" />Free · {number(free?.learners ?? 0)} learners</li>
          <li><i className="dot pro" />Pro · {number(paying)} learners</li>
        </ul>
      </section>

      <div className="plan-grid">
        {data.plans.map(plan => (
          <section key={plan.id} className={`panel plan-card${plan.featured ? ' featured' : ''}`}>
            <header>
              <div>
                <div className="plan-title">
                  {plan.featured && <Crown size={16} className="plan-crown" />}
                  <h2>{plan.name}</h2>
                  {plan.featured && <Badge tone="brand">Most popular</Badge>}
                </div>
                <p>{plan.tagline}</p>
              </div>
              <Toggle
                checked={plan.status === 'Published'}
                label={`${plan.status === 'Published' ? 'Take' : 'Publish'} ${plan.name} offline`}
                onChange={next => {
                  setPlanStatus(plan.id, next ? 'Published' : 'Draft')
                  notify(next ? `${plan.name} plan is live` : `${plan.name} plan taken offline`)
                }}
              />
            </header>

            <div className="plan-price">
              <strong>{priceLabel(plan)}</strong>
              <span>{periodLabel(plan)}</span>
            </div>

            <div className="plan-meta">
              <span><Users size={14} />{number(plan.learners)} learners</span>
              <Badge tone={statusTone(plan.status)}>{plan.status === 'Published' ? 'Available' : 'Hidden'}</Badge>
            </div>

            <ul className="plan-features">
              {plan.features.map(feature => (
                <li key={feature}><Check size={14} />{feature}</li>
              ))}
            </ul>

            <footer>
              <Progress value={Math.round((plan.learners / total) * 100)} tone={plan.featured ? 'brand' : 'positive'} />
              <span>{Math.round((plan.learners / total) * 100)}% of learners</span>
            </footer>
          </section>
        ))}
      </div>

      <p className="page-note">
        Learner counts are static demo figures ({number(TOTAL_LEARNERS)} accounts). Prices and availability toggles are stored in this browser only.
      </p>
    </>
  )
}
