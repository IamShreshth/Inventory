import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import Layout from './components/Layout'
import Alerts from './pages/Alerts'
import Assets from './pages/Assets'
import AuditLog from './pages/AuditLog'
import Blocks from './pages/Blocks'
import Catalog from './pages/Catalog'
import Dashboard from './pages/Dashboard'
import DropBoxes from './pages/DropBoxes'
import ForgotPassword from './pages/ForgotPassword'
import Issues from './pages/Issues'
import Login from './pages/Login'
import Purchases from './pages/Purchases'
import Register from './pages/Register'
import Reports from './pages/Reports'
import ResetPassword from './pages/ResetPassword'
import Transfers from './pages/Transfers'
import Users from './pages/Users'
import Vendors from './pages/Vendors'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div className="loading">Loading…</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="assets" element={<Assets />} />
        <Route path="issues" element={<Issues />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="catalog" element={<Catalog />} />
        <Route path="users" element={<Users />} />
        <Route path="vendors" element={<Vendors />} />
        <Route path="purchases" element={<Purchases />} />
        <Route path="transfers" element={<Transfers />} />
        <Route path="drop-boxes" element={<DropBoxes />} />
        <Route path="blocks" element={<Blocks />} />
        <Route path="audit-log" element={<AuditLog />} />
        <Route path="reports" element={<Reports />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
