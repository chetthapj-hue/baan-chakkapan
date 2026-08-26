import { apiRequest, isApiEnabled } from './apiClient'
import { storage, storageKeys } from './storageService'

const getLocalContacts = () => storage.readJson(storageKeys.contacts, [])

const saveLocalContact = (message) => {
  const contacts = getLocalContacts()
  const nextMessage = {
    ...message,
    id: `contact-${Date.now()}`,
    createdAt: new Date().toISOString(),
  }

  storage.writeJson(storageKeys.contacts, [nextMessage, ...contacts])
  return nextMessage
}

export const getContacts = async () => {
  if (isApiEnabled) return apiRequest('/contacts', { auth: true })
  return getLocalContacts()
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
