const TOKEN_KEY = 'gi_access_token'
const REFRESH_KEY = 'gi_refresh_token'
const USER_KEY = 'gi_user'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY)
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setSession({ token, refresh_token, user }) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  if (refresh_token) localStorage.setItem(REFRESH_KEY, refresh_token)
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(USER_KEY)
}

function paginationFromMeta(meta = {}) {
  if (meta.pagination) return meta.pagination
  return {
    page: meta.page ?? 1,
    limit: meta.limit ?? 20,
    total: meta.total ?? 0,
    pages: meta.pages ?? 1,
  }
}

async function refreshAccessToken() {
  const refresh_token = getRefreshToken()
  if (!refresh_token) return null

  const res = await fetch('/api/v1/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token }),
  })

  if (!res.ok) {
    clearSession()
    return null
  }

  const data = await res.json()
  setSession({
    token: data.token,
    refresh_token: data.refresh_token,
    user: getStoredUser(),
  })
  return data.token
}

export async function api(path, { method = 'GET', body, auth = true, headers = {} } = {}) {
  const opts = {
    method,
    headers: { ...headers },
  }

  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json'
    opts.body = JSON.stringify(body)
  }

  if (auth) {
    const token = getToken()
    if (token) opts.headers.Authorization = `Bearer ${token}`
  }

  let res = await fetch(`/api/v1${path}`, opts)

  if (res.status === 401 && auth) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      opts.headers.Authorization = `Bearer ${newToken}`
      res = await fetch(`/api/v1${path}`, opts)
    }
  }

  if (res.status === 204) return { data: null }

  const payload = await res.json().catch(() => ({}))

  if (!res.ok) {
    const err = new Error(payload?.error?.message || `Request failed (${res.status})`)
    err.status = res.status
    err.code = payload?.error?.code
    err.details = payload?.error?.details || []
    throw err
  }

  if (Array.isArray(payload.data)) {
    return {
      data: payload.data,
      pagination: paginationFromMeta(payload.meta || {}),
    }
  }

  return payload
}

export const authApi = {
  login: (email, password) =>
    api('/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  register: (body) =>
    api('/auth/register', { method: 'POST', body, auth: false }),
  logout: (refresh_token) =>
    api('/auth/logout', { method: 'POST', body: { refresh_token }, auth: false }),
  me: () => api('/users/me'),
}

export const assetsApi = {
  list: (params = {}) => {
    const q = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== '' && v != null)
    ).toString()
    return api(`/assets${q ? `?${q}` : ''}`)
  },
  get: (id) => api(`/assets/${id}`),
  create: (body) => api('/assets', { method: 'POST', body }),
  update: (id, body) => api(`/assets/${id}`, { method: 'PATCH', body }),
  remove: (id) => api(`/assets/${id}`, { method: 'DELETE' }),
}

export const issuesApi = {
  list: (params = {}) => {
    const q = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== '' && v != null)
    ).toString()
    return api(`/issues${q ? `?${q}` : ''}`)
  },
  overdue: () => api('/issues/overdue'),
  create: (body) => api('/issues', { method: 'POST', body }),
  issue: (id) => api(`/issues/${id}/issue`, { method: 'POST', body: {} }),
  return: (id, body) => api(`/issues/${id}/return`, { method: 'POST', body }),
  cancel: (id, body) => api(`/issues/${id}/cancel`, { method: 'POST', body }),
  renew: (id, body = {}) => api(`/issues/${id}/renew`, { method: 'POST', body }),
}

export const alertsApi = {
  list: (params = {}) => {
    const q = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== '' && v != null)
    ).toString()
    return api(`/alerts${q ? `?${q}` : ''}`)
  },
  summary: () => api('/alerts/summary'),
  generate: () => api('/alerts/generate', { method: 'POST', body: {} }),
  acknowledge: (id) => api(`/alerts/${id}/acknowledge`, { method: 'POST', body: {} }),
  resolve: (id) => api(`/alerts/${id}/resolve`, { method: 'POST', body: {} }),
  dismiss: (id) => api(`/alerts/${id}/dismiss`, { method: 'POST', body: {} }),
}

export const dashboardApi = {
  summary: () => api('/dashboard/summary'),
}

export const categoriesApi = {
  list: (params = {}) => {
    const q = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== '' && v != null)
    ).toString()
    return api(`/categories${q ? `?${q}` : ''}`)
  },
  create: (body) => api('/categories', { method: 'POST', body }),
}

export const locationsApi = {
  list: (params = {}) => {
    const q = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== '' && v != null)
    ).toString()
    return api(`/locations${q ? `?${q}` : ''}`)
  },
  create: (body) => api('/locations', { method: 'POST', body }),
}

export const orgUnitsApi = {
  list: (params = {}) => {
    const q = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== '' && v != null)
    ).toString()
    return api(`/org-units${q ? `?${q}` : ''}`)
  },
  create: (body) => api('/org-units', { method: 'POST', body }),
}

export const vendorsApi = {
  list: (params = {}) => {
    const q = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== '' && v != null)
    ).toString()
    return api(`/vendors${q ? `?${q}` : ''}`)
  },
}
