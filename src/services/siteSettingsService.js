import { houseImages } from '../data/mockData'
import { apiRequest, isApiEnabled } from './apiClient'
import { storage, storageKeys } from './storageService'

const defaultHeroImage = houseImages[9] || houseImages[0]
const defaultAboutHeroImage = houseImages[2] || houseImages[0] || defaultHeroImage

export const emptyHomepageVideo = {
  source: null,
  title: '',
  description: '',
  url: '',
  secureUrl: '',
  publicId: '',
  resourceType: '',
  format: '',
  bytes: 0,
  duration: 0,
  originalFilename: '',
}

export const emptySiteImage = {
  url: '',
  secureUrl: '',
  publicId: '',
  alt: '',
  resourceType: '',
  format: '',
  bytes: 0,
  version: 0,
  originalFilename: '',
}

const defaultAboutHeroSettings = {
  ...emptySiteImage,
  url: defaultAboutHeroImage.url,
  secureUrl: defaultAboutHeroImage.url,
  alt: defaultAboutHeroImage.alt,
}

export const defaultSiteSettings = {
  homeHeroImage: defaultHeroImage.url,
  homeHeroAlt: defaultHeroImage.alt,
  homepageVideo: { ...emptyHomepageVideo },
  aboutPage: {
    heroImage: { ...defaultAboutHeroSettings },
  },
}

export const normalizeHomepageVideo = (video = {}) => {
  if (video.source === 'cloudinary' && video.publicId) {
    return {
      source: 'cloudinary',
      title: video.title || '',
      description: video.description || '',
      url: video.url || video.secureUrl,
      secureUrl: video.secureUrl || video.url,
      publicId: video.publicId,
      resourceType: video.resourceType || 'video',
      format: video.format || '',
      bytes: Number(video.bytes) || 0,
      duration: Number(video.duration) || 0,
      originalFilename: video.originalFilename || '',
    }
  }

  if (video.source === 'youtube' && video.url) {
    return {
      ...emptyHomepageVideo,
      source: 'youtube',
      title: video.title || '',
      description: video.description || '',
      url: video.url,
      secureUrl: video.url,
    }
  }

  return { ...emptyHomepageVideo }
}

export const normalizeSiteImage = (image = {}, fallback = emptySiteImage) => {
  const mergedImage = {
    ...emptySiteImage,
    ...fallback,
    ...image,
  }

  const url = String(mergedImage.url || mergedImage.secureUrl || '').trim()
  const secureUrl = String(mergedImage.secureUrl || mergedImage.url || '').trim()

  return {
    url,
    secureUrl,
    publicId: String(mergedImage.publicId || '').trim(),
    alt: String(mergedImage.alt || '').trim(),
    resourceType: String(mergedImage.resourceType || '').trim(),
    format: String(mergedImage.format || '').trim().toLowerCase(),
    bytes: Number(mergedImage.bytes) || 0,
    version: Number(mergedImage.version) || 0,
    originalFilename: String(mergedImage.originalFilename || '').trim(),
  }
}

const normalizeAboutPage = (aboutPage = {}) => ({
  ...aboutPage,
  heroImage: normalizeSiteImage(aboutPage.heroImage, defaultAboutHeroSettings),
})

const normalizeSiteSettings = (settings = {}) => ({
  ...defaultSiteSettings,
  ...settings,
  homepageVideo: normalizeHomepageVideo(settings.homepageVideo),
  aboutPage: normalizeAboutPage(settings.aboutPage),
})

const getLocalSiteSettings = () =>
  normalizeSiteSettings(storage.readJson(storageKeys.siteSettings, {}))

const dispatchSettingsUpdated = (settings) => {
  window.dispatchEvent(
    new CustomEvent('baanjakkraphan:site-settings-updated', {
      detail: settings,
    }),
  )
}

export const getSiteSettings = async () => {
  if (isApiEnabled) return normalizeSiteSettings(await apiRequest('/site-settings'))
  return getLocalSiteSettings()
}

export const saveSiteSettings = async (settings) => {
  const nextSettings = normalizeSiteSettings(settings)

  if (isApiEnabled) {
    const savedSettings = normalizeSiteSettings(
      await apiRequest('/site-settings', {
        method: 'PUT',
        auth: true,
        body: nextSettings,
      }),
    )
    dispatchSettingsUpdated(savedSettings)
    return savedSettings
  }

  const localSettings = {
    ...getLocalSiteSettings(),
    ...nextSettings,
    updatedAt: new Date().toISOString(),
  }

  storage.writeJson(storageKeys.siteSettings, localSettings)
  dispatchSettingsUpdated(localSettings)
  return localSettings
}

export const resetSiteSettings = () => saveSiteSettings(defaultSiteSettings)
