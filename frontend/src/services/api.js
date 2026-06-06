const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Request failed: ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export function login(payload) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function register(payload) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function logout() {
  return request('/api/auth/logout', {
    method: 'POST',
  })
}

export function listScreens() {
  return request('/api/screens')
}

export function listTemplates() {
  return request('/api/templates')
}

export function assignTemplate(payload) {
  return request('/api/templates/assign', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function activateEmergency(payload) {
  return request('/api/emergency/activate', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function resetEmergency(payload) {
  return request('/api/emergency/reset', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function listContent() {
  return request('/api/content')
}

export function getWeather(params = {}) {
  const search = new URLSearchParams(params).toString()

  return request(`/api/weather${search ? `?${search}` : ''}`)
}
