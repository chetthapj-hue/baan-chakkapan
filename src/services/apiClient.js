import { storage, storageKeys } from './storageService'

const configuredApiUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? import.meta.env.VITE_API_BASE_URL : '')

export const apiBaseUrl = (configuredApiUrl || '').replace(/\/$/, '')
export const isApiEnabled = Boolean(apiBaseUrl)

const getSession = () => storage.readJson(storageKeys.adminSession, null)

export const apiRequest = async (path, options = {}) => {
  if (!isApiEnabled) {
    throw new Error('API base URL is not configured')
  }

  const { auth, body: requestBody, headers: requestHeaders, ...requestOptions } = options
  const headers = {
    Accept: 'application/json',
    ...(requestHeaders || {}),
  }
  let body = requestBody

  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(body)
  }

  if (auth) {
    const token = getSession()?.token
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...requestOptions,
    headers,
    body,
  })

  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await response.json() : null

  if (!response.ok) {
    throw new Error(data?.message || `Request failed with ${response.status}`)
  }

  return data
}
