import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
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
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="app-shell">
      <aside className={`sidebar${menuOpen ? ' menu-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            Gymkhana Inventory
            <span>BERM equipment desk</span>
          </div>
          <button
            type="button"
            className="mobile-menu-toggle btn btn-ghost btn-sm"
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? 'Close menu' : 'Menu'}
          </button>
        </div>
        <nav className="nav" id="primary-navigation" aria-label="Primary navigation">
          {links.filter((link) => (!link.adminOnly || isAdmin) && (!link.auditAccessOnly || canViewAuditLog)).map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} onClick={() => setMenuOpen(false)}>
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
