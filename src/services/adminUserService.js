import { storage, storageKeys } from './storageService'

export const adminRoles = {
  main: 'main-admin',
  admin: 'admin',
}

export const mainAdmin = {
  id: 'main-admin',
  name: 'เมนแอดมิน',
  username: 'admin',
  password: 'baan1234',
  role: adminRoles.main,
  createdAt: '2026-08-26T00:00:00.000Z',
}

const createId = () =>
  window.crypto?.randomUUID?.() || `admin-${Date.now()}-${Math.random()}`

const normalizeAdmin = (admin) => ({
  ...admin,
  name: admin.name || admin.username,
  role: admin.role || adminRoles.admin,
})

const ensureAdmins = () => {
  const existing = storage.readJson(storageKeys.admins, null)
  if (!existing) {
    storage.writeJson(storageKeys.admins, [mainAdmin])
    return [mainAdmin]
  }

  const hasMainAdmin = existing.some((admin) => admin.role === adminRoles.main)
  const admins = (hasMainAdmin ? existing : [mainAdmin, ...existing]).map(normalizeAdmin)

  if (JSON.stringify(admins) !== JSON.stringify(existing)) {
    storage.writeJson(storageKeys.admins, admins)
  }

  return admins
}

export const getAdmins = () =>
  ensureAdmins().sort((a, b) => {
    if (a.role === adminRoles.main) return -1
    if (b.role === adminRoles.main) return 1
    return new Date(b.createdAt) - new Date(a.createdAt)
  })

export const getAdminByUsername = (username) =>
  getAdmins().find(
    (admin) => admin.username.toLowerCase() === username.trim().toLowerCase(),
  )

export const createAdmin = ({ name, username, password }) => {
  const nextName = name.trim()
  const nextUsername = username.trim()
  const nextPassword = password.trim()

  if (!nextName || !nextUsername || !nextPassword) {
    throw new Error('กรุณากรอกข้อมูลแอดมินให้ครบ')
  }

  if (getAdminByUsername(nextUsername)) {
    throw new Error('Username นี้ถูกใช้แล้ว')
  }

  const admins = getAdmins()
  const nextAdmin = {
    id: createId(),
    name: nextName,
    username: nextUsername,
    password: nextPassword,
    role: adminRoles.admin,
    createdAt: new Date().toISOString(),
  }

  storage.writeJson(storageKeys.admins, [nextAdmin, ...admins])
  return nextAdmin
}

export const deleteAdmin = (id) => {
  const admins = getAdmins()
  const admin = admins.find((item) => item.id === id)

  if (!admin) return false
  if (admin.role === adminRoles.main) {
    throw new Error('ไม่สามารถลบเมนแอดมินได้')
  }

  storage.writeJson(
    storageKeys.admins,
    admins.filter((item) => item.id !== id),
  )
  return true
}

export const getRoleLabel = (role) =>
  role === adminRoles.main ? 'เมนแอดมิน' : 'แอดมิน'

export const getCurrentAdmin = () => {
  const session = storage.readJson(storageKeys.adminSession, null)
  if (!session?.username) return null

  const admin = getAdminByUsername(session.username)
  if (!admin) return session

  return {
    ...session,
    id: session.id || admin.id,
    name: session.name || admin.name,
    role: session.role || admin.role,
  }
}

export const isMainAdmin = () => getCurrentAdmin()?.role === adminRoles.main
