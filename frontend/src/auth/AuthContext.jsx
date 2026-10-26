import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  authApi,
  clearSession,
  getRefreshToken,
  getStoredUser,
  getToken,
  setSession,
} from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser())
  const [loading, setLoading] = useState(!!getToken())

  useEffect(() => {
    if (!getToken()) {
      setLoading(false)
      return
    }

    authApi
      .me()
      .then((res) => {
        const next = res.data
        setUser(next)
        setSession({ user: next })
      })
      .catch(() => {
        clearSession()
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password)
    setSession(data)
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async (form) => {
    const data = await authApi.register(form)
    setSession(data)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    try {
      const refresh_token = getRefreshToken()
      if (refresh_token) await authApi.logout(refresh_token)
    } catch {
      // ignore logout errors
    }
    clearSession()
    setUser(null)
  }, [])

  const roles = user?.roles?.map((role) => role.role) || []
  const isAdmin = roles.some((role) => ['super_admin', 'org_admin', 'berm_incharge'].includes(role))
  const isSuperAdmin = roles.includes('super_admin')
  const canViewAuditLog = isAdmin || roles.includes('auditor')
  const value = useMemo(
    () => ({ user, loading, isAuthenticated: !!user, isAdmin, isSuperAdmin, canViewAuditLog, login, register, logout }),
    [user, loading, isAdmin, isSuperAdmin, canViewAuditLog, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
