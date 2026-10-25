import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { alertsApi, dashboardApi, issuesApi } from '../api/client'
import EmptyState from '../components/EmptyState'
import StatusBadge from '../components/StatusBadge'

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [overdue, setOverdue] = useState(null)
  const [alerts, setAlerts] = useState(null)
  const [summaryError, setSummaryError] = useState('')
  const [overdueError, setOverdueError] = useState('')
  const [alertsError, setAlertsError] = useState('')
  const [loading, setLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setSummaryError('')
      setOverdueError('')
      setAlertsError('')

      const [dash, overdueRes, alertsRes] = await Promise.allSettled([
        dashboardApi.summary(),
        issuesApi.overdue(),
        alertsApi.list({ limit: 5, status: 'open' }),
      ])

      if (cancelled) return
      if (dash.status === 'fulfilled') setSummary(dash.value.data)
      else setSummaryError(dash.reason?.message || String(dash.reason))
      if (overdueRes.status === 'fulfilled') setOverdue(overdueRes.value.data)
      else setOverdueError(overdueRes.reason?.message || String(overdueRes.reason))
      if (alertsRes.status === 'fulfilled') setAlerts(alertsRes.value.data)
      else setAlertsError(alertsRes.reason?.message || String(alertsRes.reason))
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Snapshot of inventory health and open loans.</p>
        </div>
        <div className="toolbar">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setReloadKey((key) => key + 1)}
            disabled={loading}
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
          <Link to="/assets" className="btn btn-primary">
            Browse assets
          </Link>
        </div>
      </div>

      {summaryError ? (
        <div className="error-banner" role="alert">
          Dashboard summary failed: {summaryError}
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => setReloadKey((key) => key + 1)}
            disabled={loading}
          >
            Retry
          </button>
        </div>
      ) : null}

      <div className="stats">
        <div className="stat">
          <div className="label">Total assets</div>
          <div className="value">{summary?.total_assets ?? '—'}</div>
        </div>
        <div className="stat">
          <div className="label">Active loans</div>
          <div className="value">{summary?.active_issues ?? '—'}</div>
        </div>
        <div className="stat warn">
          <div className="label">Overdue</div>
          <div className="value">{summary?.overdue_count ?? '—'}</div>
        </div>
        <div className="stat danger">
          <div className="label">Low stock</div>
          <div className="value">{summary?.low_stock_count ?? '—'}</div>
        </div>
        <div className="stat">
          <div className="label">In maintenance</div>
          <div className="value">{summary?.open_maintenance ?? '—'}</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-header">
            <h2>Overdue loans</h2>
            <Link to="/issues" className="muted">
              View all
            </Link>
          </div>
          <div className="table-wrap">
            {overdueError ? (
              <div className="error-banner" role="alert">
                Could not load overdue loans: {overdueError}
              </div>
            ) : overdue === null ? (
              <div className="loading">Loading overdue loans…</div>
            ) : overdue.length === 0 ? (
              <EmptyState message="No overdue loans." />
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Due</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {overdue.slice(0, 6).map((item) => (
                    <tr key={item.id}>
                      <td>{item.asset_name || item.asset_id?.slice(0, 8)}</td>
                      <td className="muted">
                        {item.due_at ? new Date(item.due_at).toLocaleDateString() : '—'}
                      </td>
                      <td>
                        <StatusBadge value={item.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>Open alerts</h2>
            <Link to="/alerts" className="muted">
              View all
            </Link>
          </div>
          <div className="table-wrap">
            {alertsError ? (
              <div className="error-banner" role="alert">
                Could not load alerts: {alertsError}
              </div>
            ) : alerts === null ? (
              <div className="loading">Loading alerts…</div>
            ) : alerts.length === 0 ? (
              <EmptyState message="No open alerts." />
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Alert</th>
                    <th>Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div>{item.title}</div>
                        <div className="muted">{item.type?.replace(/_/g, ' ')}</div>
                      </td>
                      <td>
                        <StatusBadge value={item.severity} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
