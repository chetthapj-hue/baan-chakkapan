const readJson = (key, fallback) => {
  try {
    const value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

const writeJson = (key, value) => {
  window.localStorage.setItem(key, JSON.stringify(value))
}

export const storageKeys = {
  projects: 'baanjakkraphan.projects',
  contacts: 'baanjakkraphan.contacts',
  adminSession: 'baanjakkraphan.adminSession',
  siteSettings: 'baanjakkraphan.siteSettings',
}

export const storage = {
  readJson,
  writeJson,
}


