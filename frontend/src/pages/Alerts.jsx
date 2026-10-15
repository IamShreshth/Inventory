import { useCallback, useEffect, useState } from 'react'
import { alertsApi } from '../api/client'
import EmptyState from '../components/EmptyState'
import Pagination from '../components/Pagination'
import StatusBadge from '../components/StatusBadge'

export default function Alerts() {
  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 })
  const [status, setStatus] = useState('open')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await alertsApi.list({
        page,
        limit: 20,
        status: status || undefined,
      })
      setItems(res.data || [])
      setPagination(res.pagination || { page: 1, limit: 20, total: 0, pages: 1 })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [page, status])

  useEffect(() => {
    load()
  }, [load])

  async function runAction(fn) {
    setBusy(true)
    setError('')
    try {
      await fn()
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Alerts</h1>
          <p>Stock, overdue, and system notifications.</p>
        </div>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={busy}
          onClick={() => runAction(() => alertsApi.generate())}
        >
          Generate alerts
        </button>
      </div>

      {error ? <div className="error-banner">{error}</div> : null}

      <div className="tabs">
        {[
          ['open', 'Open'],
          ['acknowledged', 'Acknowledged'],
          ['resolved', 'Resolved'],
          ['dismissed', 'Dismissed'],
          ['', 'All'],
        ].map(([value, label]) => (
          <button
            key={value || 'all'}
            type="button"
            className={`tab ${status === value ? 'active' : ''}`}
            onClick={() => {
              setPage(1)
              setStatus(value)
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="panel">
        <div className="table-wrap">
          {loading ? (
            <div className="loading">Loading alerts…</div>
          ) : items.length === 0 ? (
            <EmptyState message="No alerts in this view." />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((alert) => (
                  <tr key={alert.id}>
                    <td>
                      <div>{alert.title}</div>
                      <div className="muted">{alert.message}</div>
                    </td>
                    <td className="muted">{alert.type?.replace(/_/g, ' ')}</td>
                    <td>
                      <StatusBadge value={alert.severity} />
                    </td>
                    <td>
                      <StatusBadge value={alert.status} />
                    </td>
                    <td>
                      <div className="row-actions">
                        {alert.status === 'open' ? (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            disabled={busy}
                            onClick={() => runAction(() => alertsApi.acknowledge(alert.id))}
                          >
                            Ack
                          </button>
                        ) : null}
                        {alert.status === 'open' || alert.status === 'acknowledged' ? (
                          <>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              disabled={busy}
                              onClick={() => runAction(() => alertsApi.resolve(alert.id))}
                            >
                              Resolve
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              disabled={busy}
                              onClick={() => runAction(() => alertsApi.dismiss(alert.id))}
                            >
                              Dismiss
                            </button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <Pagination pagination={pagination} onChange={setPage} />
      </div>
    </div>
  )
}
