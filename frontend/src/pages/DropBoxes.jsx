import { useCallback, useEffect, useState } from 'react'
import { dropBoxesApi, locationsApi, orgUnitsApi } from '../api/client'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import Pagination from '../components/Pagination'
import { useAuth } from '../auth/AuthContext'

const emptyForm = {
  name: '',
  location_id: '',
  org_unit_id: '',
  description: '',
  is_active: true,
}

export default function DropBoxes({ embedded = false }) {
  const { isAdmin } = useAuth()
  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 })
  const [locations, setLocations] = useState([])
  const [orgs, setOrgs] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await dropBoxesApi.list({ page, limit: 20 })
      setItems(res.data || [])
      setPagination(res.pagination || { page: 1, limit: 20, total: 0, pages: 1 })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    Promise.all([
      locationsApi.list({ limit: 100 }).catch(() => ({ data: [] })),
      orgUnitsApi.list({ limit: 100 }).catch(() => ({ data: [] })),
    ]).then(([l, o]) => {
      setLocations(l.data || [])
      setOrgs(o.data || [])
    })
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await dropBoxesApi.create({
        name: form.name.trim(),
        location_id: form.location_id,
        org_unit_id: form.org_unit_id || undefined,
        description: form.description.trim() || undefined,
        is_active: form.is_active,
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

  async function handleUpdate(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await dropBoxesApi.update(editItem.id, {
        name: form.name.trim(),
        location_id: form.location_id,
        org_unit_id: form.org_unit_id || undefined,
        description: form.description.trim() || undefined,
        is_active: form.is_active,
      })
      setEditItem(null)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this drop box?')) return
    try {
      await dropBoxesApi.remove(id)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  function openEdit(item) {
    setEditItem(item)
    setForm({
      name: item.name || '',
      location_id: item.location_id || '',
      org_unit_id: item.org_unit_id || '',
      description: item.description || '',
      is_active: item.is_active !== false,
    })
  }

  const formFields = (
    <>
      <div className="field">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="location_id">Location</label>
        <select
          id="location_id"
          value={form.location_id}
          onChange={(e) => setForm((p) => ({ ...p, location_id: e.target.value }))}
          required
        >
          <option value="">Select location</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="org_unit_id">Org unit</label>
        <select
          id="org_unit_id"
          value={form.org_unit_id}
          onChange={(e) => setForm((p) => ({ ...p, org_unit_id: e.target.value }))}
        >
          <option value="">Optional</option>
          {orgs.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
        />
      </div>
      <div className="field">
        <label>
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
          />{' '}
          Active
        </label>
      </div>
    </>
  )

  return (
    <div>
      {!embedded ? <div className="page-header">
        <div>
          <h1>Drop boxes</h1>
          <p>Return drop points for borrowed equipment.</p>
        </div>
        {isAdmin ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setForm(emptyForm)
              setShowCreate(true)
            }}
          >
            Add drop box
          </button>
        ) : null}
      </div> : isAdmin ? (
        <div className="toolbar toolbar-end">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setForm(emptyForm)
              setShowCreate(true)
            }}
          >
            Add drop box
          </button>
        </div>
      ) : null}

      {error ? <div className="error-banner">{error}</div> : null}

      <div className="panel">
        <div className="table-wrap">
          {loading ? (
            <div className="loading">Loading drop boxes…</div>
          ) : items.length === 0 ? (
            <EmptyState message="No drop boxes yet." />
          ) : (
            <table className="responsive-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Active</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td data-label="Name" data-card-title>
                      <div>{item.name}</div>
                      <div className="muted">{item.description || '—'}</div>
                    </td>
                    <td className="muted" data-label="Location">{item.location_name || item.location_id?.slice(0, 8)}</td>
                    <td data-label="Active">
                      <span className={`badge ${item.is_active !== false ? 'badge-ok' : 'badge-danger'}`}>
                        {item.is_active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td data-actions>
                      {isAdmin ? (
                        <div className="row-actions">
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(item.id)}
                          >
                            Delete
                          </button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <Pagination pagination={pagination} onChange={setPage} />
      </div>

      {showCreate && isAdmin ? (
        <Modal
          title="Add drop box"
          onClose={() => setShowCreate(false)}
          footer={
            <>
              <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>
                Cancel
              </button>
              <button type="submit" form="create-dropbox" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Create'}
              </button>
            </>
          }
        >
          <form id="create-dropbox" className="form" onSubmit={handleCreate}>
            {formFields}
          </form>
        </Modal>
      ) : null}

      {editItem && isAdmin ? (
        <Modal
          title="Edit drop box"
          onClose={() => setEditItem(null)}
          footer={
            <>
              <button type="button" className="btn btn-ghost" onClick={() => setEditItem(null)}>
                Cancel
              </button>
              <button type="submit" form="edit-dropbox" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </>
          }
        >
          <form id="edit-dropbox" className="form" onSubmit={handleUpdate}>
            {formFields}
          </form>
        </Modal>
      ) : null}
    </div>
  )
}
