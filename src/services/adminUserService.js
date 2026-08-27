import { storage, storageKeys } from './storageService'

export const adminRoles = {
  main: 'main-admin',
  admin: 'admin',
}

export const getRoleLabel = (role) =>
  role === adminRoles.main ? 'เมนแอดมิน' : 'แอดมิน'

export const getCurrentAdmin = () => {
  const session = storage.readJson(storageKeys.adminSession, null)
  if (!session?.username) return null

  return {
    ...session,
    id: session.id || session.username,
    name: session.name || session.username,
    role: session.role || adminRoles.main,
  }
}

export const isMainAdmin = () => getCurrentAdmin()?.role === adminRoles.main
