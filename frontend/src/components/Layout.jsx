import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/assets', label: 'Assets' },
  { to: '/issues', label: 'Borrowing' },
  { to: '/transfers', label: 'Transfers' },
  { to: '/alerts', label: 'Alerts' },
  { to: '/catalog', label: 'Catalog' },
  { to: '/vendors', label: 'Vendors', adminOnly: true },
  { to: '/purchases', label: 'Purchases' },
  { to: '/users', label: 'Users', adminOnly: true },
  { to: '/blocks', label: 'Borrower blocks', adminOnly: true },
  { to: '/reports', label: 'Reports', adminOnly: true },
  { to: '/audit-log', label: 'Audit log', auditAccessOnly: true },
]

export default function Layout() {
  const { user, logout, isAdmin, canViewAuditLog } = useAuth()
  const [openPath, setOpenPath] = useState(null)
  const location = useLocation()
  const menuOpen = openPath === location.pathname
  const toggleRef = useRef(null)
  const closeRef = useRef(null)
  const wasOpen = useRef(false)

  useEffect(() => {
    if (!menuOpen) return undefined

    const toggle = toggleRef.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpenPath(null)
        return
      }
      if (event.key !== 'Tab') return

      const focusable = [...document.querySelectorAll(
        '.sidebar[aria-modal="true"] a[href], .sidebar[aria-modal="true"] button:not(:disabled)'
      )]
      const first = focusable[0]
      const last = focusable.at(-1)
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      if (wasOpen.current) toggle?.focus()
    }
  }, [menuOpen])

  useEffect(() => {
    wasOpen.current = menuOpen
  }, [menuOpen])

  const initials = (user?.full_name || user?.institute_email || 'U')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return (
    <div className="app-shell">
      <header className="mobile-topbar">
        <button
          ref={toggleRef}
          type="button"
          className="mobile-menu-toggle"
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setOpenPath(location.pathname)}
        >
          <span aria-hidden="true">☰</span>
        </button>
        <strong>Gymkhana Inventory</strong>
        <span className="user-avatar" aria-label={user?.full_name || user?.institute_email || 'User'}>
          {initials}
        </span>
      </header>
      {menuOpen ? (
        <button
          type="button"
          className="drawer-backdrop"
          aria-label="Close navigation menu"
          tabIndex={-1}
          onClick={() => setOpenPath(null)}
        />
      ) : null}
      <aside
        className={`sidebar${menuOpen ? ' menu-open' : ''}`}
        aria-modal={menuOpen ? 'true' : undefined}
        role={menuOpen ? 'dialog' : undefined}
        aria-label={menuOpen ? 'Navigation menu' : undefined}
      >
        <div className="sidebar-header">
          <div className="sidebar-brand">
            Gymkhana Inventory
            <span>BERM equipment desk</span>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="mobile-menu-toggle btn btn-ghost btn-sm"
            aria-label="Close navigation menu"
            onClick={() => setOpenPath(null)}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <nav className="nav" id="primary-navigation" aria-label="Primary navigation">
          {links.filter((link) => (!link.adminOnly || isAdmin) && (!link.auditAccessOnly || canViewAuditLog)).map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} onClick={() => setOpenPath(null)}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-user">
          <div>
            <strong>{user?.full_name || 'User'}</strong>
            <span>{user?.institute_email || user?.email}</span>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={logout}>
            Sign out
          </button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
