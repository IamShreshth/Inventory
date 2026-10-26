import { useState } from 'react'
import { reportsApi } from '../api/client'
import EmptyState from '../components/EmptyState'

const REPORTS = [
  { id: 'assetInventory', label: 'Asset inventory', fn: reportsApi.assetInventory },
  { id: 'borrowingHistory', label: 'Borrowing history', fn: reportsApi.borrowingHistory },
  { id: 'overdueLoans', label: 'Overdue loans', fn: reportsApi.overdueLoans },
  { id: 'maintenanceCosts', label: 'Maintenance costs', fn: reportsApi.maintenanceCosts },
  { id: 'disposalSummary', label: 'Disposal summary', fn: reportsApi.disposalSummary },
  { id: 'verificationProgress', label: 'Verification progress', fn: reportsApi.verificationProgress },
  { id: 'assetUtilization', label: 'Asset utilization', fn: reportsApi.assetUtilization },
]

export default function Reports() {
  const [active, setActive] = useState(REPORTS[0].id)
  const [rows, setRows] = useState([])
  const [raw, setRaw] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ran, setRan] = useState(false)

  async function runReport() {
    setLoading(true)
    setError('')
    setRan(true)
    try {
      const report = REPORTS.find((r) => r.id === active)
      const res = await report.fn({ limit: 50 })
      const data = res.data
      if (Array.isArray(data)) {
        setRows(data)
        setRaw(null)
      } else {
        setRows([])
        setRaw(data)
      }
    } catch (err) {
      setError(err.message)
      setRows([])
      setRaw(null)
    } finally {
      setLoading(false)
    }
  }

  const columns = rows.length > 0 ? Object.keys(rows[0]).slice(0, 6) : []

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Reports</h1>
          <p>Inventory, borrowing, and utilization reports.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={runReport} disabled={loading}>
          {loading ? 'Running…' : 'Run report'}
        </button>
      </div>

      {error ? <div className="error-banner">{error}</div> : null}

      <div className="tabs">
        {REPORTS.map((r) => (
          <button
            key={r.id}
            type="button"
            className={`tab ${active === r.id ? 'active' : ''}`}
            onClick={() => {
              setActive(r.id)
              setRan(false)
              setRows([])
              setRaw(null)
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="panel">
        <div className="table-wrap">
          {!ran ? (
            <EmptyState message="Select a report and click Run report." />
          ) : loading ? (
            <div className="loading">Generating report…</div>
          ) : raw ? (
            <pre className="code-block">{JSON.stringify(raw, null, 2)}</pre>
          ) : rows.length === 0 ? (
            <EmptyState message="No rows returned." />
          ) : (
            <table className="responsive-table">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col}>{col.replace(/_/g, ' ')}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={row.id || idx}>
                    {columns.map((col) => (
                      <td
                        key={col}
                        data-label={col.replace(/_/g, ' ')}
                        data-card-title={columns[0] === col ? true : undefined}
                        className={typeof row[col] === 'string' ? 'muted' : undefined}
                      >
                        {row[col] == null
                          ? '—'
                          : typeof row[col] === 'object'
                            ? JSON.stringify(row[col])
                            : String(row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
