const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

async function request(path, options = {}) {
  const token = localStorage.getItem('accessToken')

  const response = await fetch(`${API_BASE_URL}${path}`,{
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
  return request('/api/v1/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function register(payload) {
  return request('/api/v1/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function logout() {
  return request('/api/v1/logout', {
    method: 'POST',
  })
}

export function createScreenCode(payload) {
  return request('/api/v1/screens/code', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getNewScreen(code) {
  return request(`/api/v1/screens/new/${code}`)
}

export function listScreens() {
  return request('/api/v1/screens')
}

export function listTemplates() {
  return request('/api/v1/templates')
}

export function saveTemplate(payload) {
  return request('/api/v1/templates', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function assignTemplate(payload) {
  return request('/api/v1/templates/assign', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function activateEmergency(payload) {
  return request('/api/v1/emergency/activate', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function resetEmergency(payload) {
  return request('/api/v1/emergency/reset', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function listContent() {
  return request('/api/v1/content')
}

export function getWeather(params = {}) {
  const search = new URLSearchParams(params).toString()

  return request(`/api/v1/weather${search ? `?${search}` : ''}`)
}
