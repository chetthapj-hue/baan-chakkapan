import { storage, storageKeys } from './storageService'

export const getContacts = () => storage.readJson(storageKeys.contacts, [])

export const saveContact = (message) => {
  const contacts = getContacts()
  const nextMessage = {
    ...message,
    id: `contact-${Date.now()}`,
    createdAt: new Date().toISOString(),
  }

  storage.writeJson(storageKeys.contacts, [nextMessage, ...contacts])
  return nextMessage
}


