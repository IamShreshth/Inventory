import { useCallback, useEffect, useState } from 'react'
import { assetsApi, categoriesApi } from '../api/client'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import Pagination from '../components/Pagination'
import StatusBadge from '../components/StatusBadge'

const emptyForm = {
  name: '',
  category_id: '',
  tracking: 'individual',
  quantity: 1,
  low_stock_threshold: 0,
  condition: 'good',
  status: 'available',
  brand_model: '',
  serial_no: '',
  description: '',
  is_issuable: true,
}

export default function Assets() {
  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 })
  const [categories, setCategories] = useState([])
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await assetsApi.list({
        page,
        limit: 20,
        q: q || undefined,
        status: status || undefined,
      })
      setItems(res.data || [])
      setPagination(res.pagination || { page: 1, limit: 20, total: 0, pages: 1 })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [page, q, status])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    categoriesApi
      .list({ limit: 100 })
      .then((res) => setCategories(res.data || []))
      .catch(() => setCategories([]))
  }, [])

  function updateForm(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleCreate(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await assetsApi.create({
        name: form.name.trim(),
        category_id: form.category_id,
        tracking: form.tracking,
        quantity: Number(form.quantity),
        low_stock_threshold: Number(form.low_stock_threshold),
        condition: form.condition,
        status: form.status,
        brand_model: form.brand_model.trim() || undefined,
        serial_no: form.serial_no.trim() || undefined,
        description: form.description.trim() || undefined,
        is_issuable: form.is_issuable,
      })
      setShowCreate(false)
      setForm(emptyForm)
      setPage(1)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this asset?')) return
    try {
      await assetsApi.remove(id)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Assets</h1>
          <p>Search, filter, and register equipment.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowCreate(true)}>
          Add asset
        </button>
      </div>

      {error ? <div className="error-banner">{error}</div> : null}

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Search assets…"
          value={q}
          onChange={(e) => {
            setPage(1)
            setQ(e.target.value)
          }}
        />
        <select
          className="select"
          value={status}
          onChange={(e) => {
            setPage(1)
            setStatus(e.target.value)
          }}
        >
          <option value="">All statuses</option>
          <option value="available">Available</option>
          <option value="issued">Issued</option>
          <option value="in_maintenance">In maintenance</option>
          <option value="reserved">Reserved</option>
          <option value="disposed">Disposed</option>
          <option value="lost">Lost</option>
        </select>
      </div>

      <div className="panel">
        <div className="table-wrap">
          {loading ? (
            <div className="loading">Loading assets…</div>
          ) : items.length === 0 ? (
            <EmptyState message="No assets found. Add one to get started." />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Condition</th>
                  <th>Qty</th>
                  <th>Tracking</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((asset) => (
                  <tr key={asset.id}>
                    <td>
                      <div>{asset.name}</div>
                      <div className="muted">
                        {asset.asset_tag || asset.brand_model || asset.id.slice(0, 8)}
                      </div>
                    </td>
                    <td>
                      <StatusBadge value={asset.status} />
                    </td>
                    <td>
                      <StatusBadge value={asset.condition} />
                    </td>
                    <td>{asset.quantity}</td>
                    <td className="muted">{asset.tracking}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(asset.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <Pagination pagination={pagination} onChange={setPage} />
      </div>

      {showCreate ? (
        <Modal
          title="Add asset"
          onClose={() => setShowCreate(false)}
          footer={
            <>
              <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>
                Cancel
              </button>
              <button type="submit" form="create-asset" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Create'}
              </button>
            </>
          }
        >
          <form id="create-asset" className="form" onSubmit={handleCreate}>
            <div className="field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                value={form.name}
                onChange={(e) => updateForm('name', e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="category_id">Category</label>
              <select
                id="category_id"
                value={form.category_id}
                onChange={(e) => updateForm('category_id', e.target.value)}
                required
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {categories.length === 0 ? (
                <span className="muted">Create a category under Catalog first.</span>
              ) : null}
            </div>
            <div className="form-row">
              <div className="field">
                <label htmlFor="tracking">Tracking</label>
                <select
                  id="tracking"
                  value={form.tracking}
                  onChange={(e) => updateForm('tracking', e.target.value)}
                >
                  <option value="individual">Individual</option>
                  <option value="quantity">Quantity</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="quantity">Quantity</label>
                <input
                  id="quantity"
                  type="number"
                  min="0"
                  value={form.quantity}
                  onChange={(e) => updateForm('quantity', e.target.value)}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label htmlFor="condition">Condition</label>
                <select
                  id="condition"
                  value={form.condition}
                  onChange={(e) => updateForm('condition', e.target.value)}
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                  <option value="damaged">Damaged</option>
                  <option value="under_repair">Under repair</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  value={form.status}
                  onChange={(e) => updateForm('status', e.target.value)}
                >
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="in_maintenance">In maintenance</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label htmlFor="brand_model">Brand / model</label>
                <input
                  id="brand_model"
                  value={form.brand_model}
                  onChange={(e) => updateForm('brand_model', e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="serial_no">Serial no.</label>
                <input
                  id="serial_no"
                  value={form.serial_no}
                  onChange={(e) => updateForm('serial_no', e.target.value)}
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => updateForm('description', e.target.value)}
              />
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  )
}
