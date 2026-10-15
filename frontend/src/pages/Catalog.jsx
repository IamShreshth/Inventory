import { useCallback, useEffect, useState } from 'react'
import { categoriesApi, locationsApi, orgUnitsApi } from '../api/client'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'

const tabs = [
  { id: 'categories', label: 'Categories' },
  { id: 'locations', label: 'Locations' },
  { id: 'orgs', label: 'Org units' },
]

export default function Catalog() {
  const [tab, setTab] = useState('categories')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({})

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      let res
      if (tab === 'categories') res = await categoriesApi.list({ limit: 50 })
      else if (tab === 'locations') res = await locationsApi.list({ limit: 50 })
      else res = await orgUnitsApi.list({ limit: 50 })
      setItems(res.data || [])
    } catch (err) {
      setError(err.message)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [tab])

  useEffect(() => {
    load()
  }, [load])

  function openCreate() {
    if (tab === 'categories') {
      setForm({ name: '', default_loan_days: 7, default_low_stock_threshold: 0, max_renewals: 0 })
    } else if (tab === 'locations') {
      setForm({ name: '', type: 'storage', building: '', floor: '', room_number: '' })
    } else {
      setForm({ name: '', code: '', type: 'club' })
    }
    setShowCreate(true)
  }

  async function handleCreate(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (tab === 'categories') {
        await categoriesApi.create({
          name: form.name.trim(),
          default_loan_days: Number(form.default_loan_days),
          default_low_stock_threshold: Number(form.default_low_stock_threshold),
          max_renewals: Number(form.max_renewals),
        })
      } else if (tab === 'locations') {
        await locationsApi.create({
          name: form.name.trim(),
          type: form.type.trim(),
          building: form.building.trim() || undefined,
          floor: form.floor.trim() || undefined,
          room_number: form.room_number.trim() || undefined,
        })
      } else {
        await orgUnitsApi.create({
          name: form.name.trim(),
          code: form.code.trim(),
          type: form.type.trim(),
        })
      }
      setShowCreate(false)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Catalog</h1>
          <p>Categories, storage locations, and organization units.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          Add {tabs.find((t) => t.id === tab)?.label.slice(0, -1).toLowerCase()}
        </button>
      </div>

      {error ? <div className="error-banner">{error}</div> : null}

      <div className="tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="panel">
        <div className="table-wrap">
          {loading ? (
            <div className="loading">Loading…</div>
          ) : items.length === 0 ? (
            <EmptyState message="Nothing in this catalog yet." />
          ) : tab === 'categories' ? (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Loan days</th>
                  <th>Low stock</th>
                  <th>Max renewals</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.default_loan_days}</td>
                    <td>{item.default_low_stock_threshold}</td>
                    <td>{item.max_renewals}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : tab === 'locations' ? (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Building</th>
                  <th>Room</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td className="muted">{item.type}</td>
                    <td className="muted">{item.building || '—'}</td>
                    <td className="muted">
                      {[item.floor, item.room_number].filter(Boolean).join(' / ') || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Active</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td className="muted">{item.code}</td>
                    <td className="muted">{item.type}</td>
                    <td>
                      <StatusPill active={item.is_active !== false} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showCreate ? (
        <Modal
          title={`Add ${tabs.find((t) => t.id === tab)?.label.slice(0, -1).toLowerCase()}`}
          onClose={() => setShowCreate(false)}
          footer={
            <>
              <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>
                Cancel
              </button>
              <button type="submit" form="create-catalog" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Create'}
              </button>
            </>
          }
        >
          <form id="create-catalog" className="form" onSubmit={handleCreate}>
            {tab === 'categories' ? (
              <>
                <div className="field">
                  <label htmlFor="name">Name</label>
                  <input
                    id="name"
                    value={form.name || ''}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="field">
                    <label htmlFor="default_loan_days">Default loan days</label>
                    <input
                      id="default_loan_days"
                      type="number"
                      min="1"
                      value={form.default_loan_days}
                      onChange={(e) => setForm((p) => ({ ...p, default_loan_days: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="default_low_stock_threshold">Low stock threshold</label>
                    <input
                      id="default_low_stock_threshold"
                      type="number"
                      min="0"
                      value={form.default_low_stock_threshold}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, default_low_stock_threshold: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="max_renewals">Max renewals</label>
                  <input
                    id="max_renewals"
                    type="number"
                    min="0"
                    value={form.max_renewals}
                    onChange={(e) => setForm((p) => ({ ...p, max_renewals: e.target.value }))}
                  />
                </div>
              </>
            ) : null}

            {tab === 'locations' ? (
              <>
                <div className="field">
                  <label htmlFor="name">Name</label>
                  <input
                    id="name"
                    value={form.name || ''}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="type">Type</label>
                  <input
                    id="type"
                    value={form.type || ''}
                    onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="field">
                    <label htmlFor="building">Building</label>
                    <input
                      id="building"
                      value={form.building || ''}
                      onChange={(e) => setForm((p) => ({ ...p, building: e.target.value }))}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="floor">Floor</label>
                    <input
                      id="floor"
                      value={form.floor || ''}
                      onChange={(e) => setForm((p) => ({ ...p, floor: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="room_number">Room</label>
                  <input
                    id="room_number"
                    value={form.room_number || ''}
                    onChange={(e) => setForm((p) => ({ ...p, room_number: e.target.value }))}
                  />
                </div>
              </>
            ) : null}

            {tab === 'orgs' ? (
              <>
                <div className="field">
                  <label htmlFor="name">Name</label>
                  <input
                    id="name"
                    value={form.name || ''}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="field">
                    <label htmlFor="code">Code</label>
                    <input
                      id="code"
                      value={form.code || ''}
                      onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="type">Type</label>
                    <input
                      id="type"
                      value={form.type || ''}
                      onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              </>
            ) : null}
          </form>
        </Modal>
      ) : null}
    </div>
  )
}

function StatusPill({ active }) {
  return (
    <span className={`badge ${active ? 'badge-ok' : 'badge-danger'}`}>
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}
