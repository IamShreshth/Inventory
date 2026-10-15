export default function Pagination({ pagination, onChange }) {
  if (!pagination || pagination.pages <= 1) return null

  const { page, pages, total } = pagination

  return (
    <div className="pagination">
      <span className="muted">
        Page {page} of {pages} · {total} total
      </span>
      <div className="row-actions">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          Previous
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  )
}
