import { storage, storageKeys } from './storageService'

export const demoAdmin = {
  username: 'admin',
  password: 'baan1234',
}

export const loginAdmin = ({ username, password }) => {
  const isValid = username === demoAdmin.username && password === demoAdmin.password
  if (!isValid) return false

  storage.writeJson(storageKeys.adminSession, {
    username,
    loggedInAt: new Date().toISOString(),
  })
  return true
}

export const logoutAdmin = () => {
  window.localStorage.removeItem(storageKeys.adminSession)
}

export const isAdminLoggedIn = () => {
  const session = storage.readJson(storageKeys.adminSession, null)
  return Boolean(session?.username)
}


