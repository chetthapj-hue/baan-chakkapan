import { houseImages } from '../data/mockData'
import { storage, storageKeys } from './storageService'

const defaultHeroImage = houseImages[9] || houseImages[0]

export const defaultSiteSettings = {
  homeHeroImage: defaultHeroImage.url,
  homeHeroAlt: defaultHeroImage.alt,
}

export const getSiteSettings = () => ({
  ...defaultSiteSettings,
  ...storage.readJson(storageKeys.siteSettings, {}),
})

export const saveSiteSettings = (settings) => {
  const nextSettings = {
    ...getSiteSettings(),
    ...settings,
    updatedAt: new Date().toISOString(),
  }

  storage.writeJson(storageKeys.siteSettings, nextSettings)
  window.dispatchEvent(
    new CustomEvent('baanjakkraphan:site-settings-updated', {
      detail: nextSettings,
    }),
  )
  return nextSettings
}

export const resetSiteSettings = () => saveSiteSettings(defaultSiteSettings)