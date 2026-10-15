export default function StatusBadge({ value }) {
  if (!value) return <span className="muted">—</span>
  const key = String(value).toLowerCase().replace(/\s+/g, '_')
  return <span className={`badge badge-${key}`}>{value.replace(/_/g, ' ')}</span>
}
