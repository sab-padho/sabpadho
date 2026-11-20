import { useState, type FormEvent } from 'react'
import { Check, Copy, Download, Plus } from 'lucide-react'
import type { Coupon } from '../data'
import { useAdmin } from '../store'
import { Badge, Empty, PageHeader, SearchInput, Select, downloadCsv, formatDate, relativeTime, useToast } from '../ui'

const filters = ['All', 'Active', 'Paused', 'Expired'] as const
type Filter = (typeof filters)[number]

const tone = (status: Coupon['status']) => (status === 'Active' ? 'positive' : status === 'Paused' ? 'warning' : 'negative')

const kindOptions = [
  { value: 'percent', label: 'Percent off' },
  { value: 'flat', label: 'Flat ₹ off' },
] as const

export function Coupons() {
  const { data, setCouponStatus, addCoupon } = useAdmin()
  const notify = useToast()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('All')
  const [code, setCode] = useState('')
  const [discount, setDiscount] = useState('25')
  const [kind, setKind] = useState<Coupon['kind']>('percent')
  const [limit, setLimit] = useState('100')
  const [expires, setExpires] = useState(() => new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10))
  const [error, setError] = useState('')

  const rows = data.coupons.filter(coupon => {
    const matchesQuery = !query.trim() || coupon.code.toLowerCase().includes(query.trim().toLowerCase())
    const matchesFilter = filter === 'All' || coupon.status === filter
    return matchesQuery && matchesFilter
  })

  const active = data.coupons.filter(coupon => coupon.status === 'Active').length
  const redeemed = data.coupons.reduce((sum, coupon) => sum + coupon.redemptions, 0)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleanCode = code.trim().toUpperCase()
    const value = Number(discount)
    const cap = Number(limit)

    if (!/^[A-Z0-9-]{3,16}$/.test(cleanCode)) {
      setError('Use 3–16 letters, numbers or dashes for the code.')
      return
    }
    if (data.coupons.some(coupon => coupon.code === cleanCode)) {
      setError('That code already exists.')
      return
    }
    if (!Number.isFinite(value) || value < 1 || (kind === 'percent' && value > 90) || (kind === 'flat' && value > 500)) {
      setError(kind === 'percent' ? 'Percentage discounts must be between 1 and 90.' : 'Flat discounts must be between ₹1 and ₹500.')
      return
    }
    if (!Number.isFinite(cap) || cap < 1 || cap > 100000) {
      setError('Set a redemption limit between 1 and 100,000.')
      return
    }
    if (!expires || new Date(expires).getTime() < Date.now()) {
      setError('Pick an expiry date in the future.')
      return
    }

    addCoupon({ code: cleanCode, discount: value, kind, limit: cap, expires: new Date(`${expires}T23:59:00`).toISOString() })
    notify(`Coupon ${cleanCode} created`)
    setCode('')
    setError('')
  }

  async function copy(code: string) {
    try {
      await navigator.clipboard.writeText(code)
      notify(`${code} copied`)
    } catch {
      notify(`Copy failed — the code is ${code}`)
    }
  }

  function exportCsv() {
    downloadCsv('sabpadho-coupons.csv', [
      ['Code', 'Discount', 'Type', 'Plan', 'Redeemed', 'Limit', 'Status', 'Expires'],
      ...rows.map(coupon => [coupon.code, coupon.discount, coupon.kind, coupon.plan, coupon.redemptions, coupon.limit, coupon.status, formatDate(coupon.expires)]),
    ])
    notify(`Exported ${rows.length} coupon${rows.length === 1 ? '' : 's'}`)
  }

  return (
    <>
      <PageHeader
        eyebrow="ADMIN PORTAL"
        title="Coupons"
        description={`${data.coupons.length} codes · ${active} active · ${redeemed} redemptions`}
        actions={<button className="button secondary" onClick={exportCsv}><Download size={16} />Export CSV</button>}
      />

      <section className="panel composer coupon-composer">
        <header>
          <span className="icon-tile"><Plus size={20} /></span>
          <div>
            <h2>New coupon</h2>
            <p>Applies to the Pro plan at checkout.</p>
          </div>
        </header>
        <form onSubmit={submit} className="coupon-form">
          <div className="field-group">
            <label htmlFor="coupon-code">Code</label>
            <input
              id="coupon-code"
              value={code}
              onChange={event => { setCode(event.target.value.toUpperCase()); setError('') }}
              placeholder="PROLAUNCH"
              maxLength={16}
            />
          </div>
          <div className="field-group">
            <label htmlFor="coupon-kind">Type</label>
            <Select
              value={kind}
              onChange={value => { setKind(value); setError('') }}
              options={kindOptions}
              label="Discount type"
            />
          </div>
          <div className="field-group">
            <label htmlFor="coupon-discount">{kind === 'percent' ? 'Discount %' : 'Discount ₹'}</label>
            <input id="coupon-discount" type="number" min={1} max={kind === 'percent' ? 90 : 500} value={discount} onChange={event => { setDiscount(event.target.value); setError('') }} />
          </div>
          <div className="field-group">
            <label htmlFor="coupon-limit">Redemption limit</label>
            <input id="coupon-limit" type="number" min={1} value={limit} onChange={event => { setLimit(event.target.value); setError('') }} />
          </div>
          <div className="field-group">
            <label htmlFor="coupon-expiry">Expires</label>
            <input id="coupon-expiry" type="date" value={expires} onChange={event => { setExpires(event.target.value); setError('') }} />
          </div>
          <button className="button primary" type="submit">Create coupon</button>
        </form>
        {error && <p className="notice" role="alert">{error}</p>}
      </section>

      <section className="panel table-panel">
        <div className="toolbar">
          <SearchInput value={query} onChange={setQuery} placeholder="Search coupon code" />
          <div className="toolbar-group">
            <Select value={filter} onChange={setFilter} options={filters} label="Filter by status" />
          </div>
        </div>

        <div className="table-scroll">
          <table aria-label="Coupons">
            <thead>
              <tr>
                <th scope="col">Code</th>
                <th scope="col">Discount</th>
                <th scope="col">Plan</th>
                <th scope="col">Redemptions</th>
                <th scope="col">Expires</th>
                <th scope="col">Status</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(coupon => {
                const used = Math.round((coupon.redemptions / coupon.limit) * 100)
                return (
                  <tr key={coupon.id}>
                    <td data-label="Code">
                      <span className="cell-stack">
                        <span className="coupon-code">{coupon.code}</span>
                        <small className="cell-sub">{coupon.id}</small>
                      </span>
                    </td>
                    <td data-label="Discount"><span className="cell-stack"><span><strong>{coupon.kind === 'percent' ? `${coupon.discount}%` : `₹${coupon.discount}`}</strong> off</span></span></td>
                    <td data-label="Plan">{coupon.plan}</td>
                    <td data-label="Redemptions">
                      <div className="cell-meter">
                        <span className="meter-track"><span className={used >= 100 ? 'full' : ''} style={{ width: `${Math.min(100, used)}%` }} /></span>
                        <span>{coupon.redemptions}/{coupon.limit}</span>
                      </div>
                    </td>
                    <td data-label="Expires" title={formatDate(coupon.expires)}>{relativeTime(coupon.expires)}</td>
                    <td data-label="Status"><Badge tone={tone(coupon.status)}>{coupon.status}</Badge></td>
                    <td data-label="Actions">
                      <div className="row-actions">
                        <button className="icon-button" title="Copy code" aria-label={`Copy ${coupon.code}`} onClick={() => copy(coupon.code)}>
                          <Copy size={15} />
                        </button>
                        <button
                          className="icon-button"
                          title={coupon.status === 'Active' ? 'Pause coupon' : 'Activate coupon'}
                          aria-label={`${coupon.status === 'Active' ? 'Pause' : 'Activate'} ${coupon.code}`}
                          disabled={coupon.status === 'Expired'}
                          onClick={() => {
                            const next = coupon.status === 'Active' ? 'Paused' : 'Active'
                            setCouponStatus(coupon.id, next)
                            notify(`${coupon.code} ${next === 'Active' ? 'activated' : 'paused'}`)
                          }}
                        >
                          <Check size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {!rows.length && <Empty>No coupons match those filters.</Empty>}
        <footer className="table-foot">Showing {rows.length} of {data.coupons.length} codes. Paused codes stay valid but cannot be redeemed.</footer>
      </section>
    </>
  )
}
