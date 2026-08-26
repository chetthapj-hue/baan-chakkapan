import { apiRequest, isApiEnabled } from './apiClient'
import { getAdminByUsername, mainAdmin } from './adminUserService'
import { storage, storageKeys } from './storageService'

export const demoAdmin = {
  username: mainAdmin.username,
  password: mainAdmin.password,
}

const isSessionValid = (session) => {
  if (!session?.username) return false
  if (isApiEnabled && !session.token) return false
  if (!isApiEnabled && !getAdminByUsername(session.username)) return false
  if (!session.expiresAt) return true
  return new Date(session.expiresAt).getTime() > Date.now()
}

export const loginAdmin = async ({ username, password }) => {
  if (isApiEnabled) {
    try {
      const result = await apiRequest('/auth/login', {
        method: 'POST',
        body: { username, password },
      })

      storage.writeJson(storageKeys.adminSession, {
        username: result.admin?.username || username,
        name: result.admin?.name || mainAdmin.name,
        role: mainAdmin.role,
        token: result.token,
        expiresAt: result.expiresAt,
        loggedInAt: new Date().toISOString(),
      })
      return true
    } catch {
      return false
    }
  }

  const admin = getAdminByUsername(username)
  const isValid = admin?.password === password
  if (!isValid) return false

  storage.writeJson(storageKeys.adminSession, {
    id: admin.id,
    username: admin.username,
    name: admin.name,
    role: admin.role,
    loggedInAt: new Date().toISOString(),
  })
  return true
}

export const logoutAdmin = () => {
  window.localStorage.removeItem(storageKeys.adminSession)
}

export const isAdminLoggedIn = () => {
  const session = storage.readJson(storageKeys.adminSession, null)
  return isSessionValid(session)
}
