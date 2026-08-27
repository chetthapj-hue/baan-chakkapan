import { apiRequest, isApiEnabled } from './apiClient'
import { storage, storageKeys } from './storageService'

const isSessionValid = (session) => {
  if (!session?.username) return false
  if (!session.token) return false
  if (!session.expiresAt) return true
  return new Date(session.expiresAt).getTime() > Date.now()
}

export const loginAdmin = async ({ username, password }) => {
  if (!isApiEnabled) return false

  try {
    const result = await apiRequest('/auth/login', {
      method: 'POST',
      body: { username, password },
    })

    storage.writeJson(storageKeys.adminSession, {
      id: result.admin?.id || username,
      username: result.admin?.username || username,
      name: result.admin?.name || 'Admin',
      role: result.admin?.role || 'admin',
      token: result.token,
      expiresAt: result.expiresAt,
      loggedInAt: new Date().toISOString(),
    })
    return true
  } catch {
    return false
  }
}

export const logoutAdmin = () => {
  window.localStorage.removeItem(storageKeys.adminSession)
}

export const isAdminLoggedIn = () => {
  const session = storage.readJson(storageKeys.adminSession, null)
  return isSessionValid(session)
}
