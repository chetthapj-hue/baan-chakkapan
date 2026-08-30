import { storage, storageKeys } from './storageService'
import { apiRequest } from './apiClient'

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

export const listAdmins = () => apiRequest('/admins', { auth: true })

export const createAdmin = ({ name, username, password }) =>
  apiRequest('/admins', {
    method: 'POST',
    auth: true,
    body: { name, username, password },
  })

export const deleteAdmin = (id) =>
  apiRequest(`/admins/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    auth: true,
  })

export const resetAdminPassword = (id, currentPassword) =>
  apiRequest(`/admins/${encodeURIComponent(id)}/reset-password`, {
    method: 'POST',
    auth: true,
    body: { currentPassword },
  })

export const listAdminAuditLogs = () =>
  apiRequest('/admins/audit-logs', { auth: true })
