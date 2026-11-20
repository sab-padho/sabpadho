import { Check, Crown } from 'lucide-react'
import { TOTAL_LEARNERS, type Plan } from '../data'
import { useAdmin } from '../store'
import { Badge, PageHeader, Toggle, number, statusTone, useToast } from '../ui'

const priceLabel = (plan: Plan) => (plan.price === 0 ? 'Free' : `₹${plan.price}`)
const periodLabel = (plan: Plan) => (plan.period === 'year' ? '/year' : '')

export function Plans() {
  const { data, setPlanStatus } = useAdmin()
  const notify = useToast()

  const pro = data.plans.find(plan => plan.id === 'pro')
  const live = data.plans.filter(plan => plan.status === 'Published').length

  return (
    <>
      <PageHeader
        eyebrow="ADMIN PORTAL"
        title="Plans"
        description={`${data.plans.length} plans · Pro is ₹${pro?.price ?? 51} per year · available to ${number(TOTAL_LEARNERS)} learners`}
        actions={<Badge tone="brand">Static demo figures</Badge>}
      />

      <div className="stat-grid">
        <div className="panel stat">
          <span className="stat-label">Total learners</span>
          <strong>{number(TOTAL_LEARNERS)}</strong>
          <span className="stat-foot">Reported by the learner portal</span>
        </div>
        <div className="panel stat">
          <span className="stat-label">Live plans</span>
          <strong>{live} of {data.plans.length}</strong>
          <span className="stat-foot">Toggle a plan to take it offline</span>
        </div>
        <div className="panel stat">
          <span className="stat-label">Pro price</span>
          <strong>₹{pro?.price ?? 51}</strong>
          <span className="stat-foot">Billed once a year</span>
        </div>
      </div>

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
              <Badge tone={statusTone(plan.status)}>{plan.status === 'Published' ? 'Available' : 'Hidden'}</Badge>
            </div>

            <ul className="plan-features">
              {plan.features.map(feature => (
                <li key={feature}><Check size={14} />{feature}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="page-note">
        Prices and availability toggles are stored in this browser only. Learner figures are a static demo total.
      </p>
    </>
  )
}
