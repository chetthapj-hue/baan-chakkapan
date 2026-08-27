import { apiRequest, isApiEnabled } from './apiClient'
import { storage, storageKeys } from './storageService'

const getLocalContacts = () => storage.readJson(storageKeys.contacts, [])

const saveLocalContact = (message) => {
  const contacts = getLocalContacts()
  const nextMessage = {
    ...message,
    id: `contact-${Date.now()}`,
    status: 'new',
    createdAt: new Date().toISOString(),
  }

  storage.writeJson(storageKeys.contacts, [nextMessage, ...contacts])
  return nextMessage
}

export const getContacts = async (options = {}) => {
  if (isApiEnabled) {
    const params = new URLSearchParams()
    if (options.status && options.status !== 'all') params.set('status', options.status)
    if (options.search?.trim()) params.set('search', options.search.trim())
    const query = params.toString()
    return apiRequest(`/contacts${query ? `?${query}` : ''}`, { auth: true })
  }
  return getLocalContacts()
}

export const getContactById = async (id) => {
  if (isApiEnabled) return apiRequest(`/contacts/${encodeURIComponent(id)}`, { auth: true })
  return getLocalContacts().find((contact) => contact.id === id) || null
}

export const getContactStats = async () => {
  if (isApiEnabled) return apiRequest('/contacts/stats', { auth: true })
  const contacts = getLocalContacts()
  return {
    total: contacts.length,
    unread: contacts.filter((contact) => contact.status !== 'read').length,
  }
}

export const updateContactStatus = async (id, status) => {
  if (isApiEnabled) {
    return apiRequest(`/contacts/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      auth: true,
      body: { status },
    })
  }

  const nextContacts = getLocalContacts().map((contact) =>
    contact.id === id ? { ...contact, status } : contact,
  )
  storage.writeJson(storageKeys.contacts, nextContacts)
  return nextContacts.find((contact) => contact.id === id) || null
}

export const deleteContact = async (id) => {
  if (isApiEnabled) {
    return apiRequest(`/contacts/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      auth: true,
    })
  }

  storage.writeJson(
    storageKeys.contacts,
    getLocalContacts().filter((contact) => contact.id !== id),
  )
  return { message: 'ลบข้อความติดต่อเรียบร้อยแล้ว' }
}

export const saveContact = async (message) => {
  if (isApiEnabled) {
    return apiRequest('/contacts', {
      method: 'POST',
      body: message,
    })
  }

  return saveLocalContact(message)
}
