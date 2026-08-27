import { createDefaultFloorPlan, seedProjects } from '../data/mockData'
import { apiRequest, isApiEnabled } from './apiClient'
import { storage, storageKeys } from './storageService'

const seedProjectById = new Map(seedProjects.map((project) => [project.id, project]))

const normalizeImages = (images = []) =>
  images
    .map((image, index) => ({
      url: image.url,
      publicId: image.publicId || '',
      alt: image.alt || `รูปภาพ ${index + 1}`,
      order: Number.isFinite(Number(image.order)) ? Number(image.order) : index,
    }))
    .filter((image) => image.url)
    .sort((a, b) => a.order - b.order)
    .map((image, index) => ({ ...image, order: index }))

const withProjectImages = (project = {}) => {
  const galleryImages = normalizeImages(
    project.galleryImages?.length ? project.galleryImages : project.gallery,
  )
  const floorPlanImages = normalizeImages(project.floorPlanImages)
  const coverImagePublicId =
    project.coverImagePublicId ||
    galleryImages.find((image) => image.url === project.coverImage)?.publicId ||
    galleryImages[0]?.publicId ||
    ''
  const coverImage =
    galleryImages.find((image) => image.publicId === coverImagePublicId)?.url ||
    project.coverImage ||
    galleryImages[0]?.url ||
    ''
  const coverAlt =
    galleryImages.find((image) => image.url === coverImage)?.alt ||
    project.coverAlt ||
    galleryImages[0]?.alt ||
    ''

  return {
    ...project,
    galleryImages,
    floorPlanImages,
    coverImagePublicId,
    coverImage,
    coverAlt,
    gallery: galleryImages.length ? galleryImages : project.gallery || [],
  }
}

const emptyVideo = {
  source: null,
  url: '',
  secureUrl: '',
  publicId: '',
  resourceType: '',
  format: '',
  bytes: 0,
  duration: 0,
  originalFilename: '',
}

const withProjectVideo = (project = {}) => {
  const video = project.video || {}
  if (video.source === 'cloudinary' && video.publicId) {
    return {
      ...project,
      video: {
        source: 'cloudinary',
        url: video.url || video.secureUrl,
        secureUrl: video.secureUrl || video.url,
        publicId: video.publicId,
        resourceType: video.resourceType || 'video',
        format: video.format || '',
        bytes: Number(video.bytes) || 0,
        duration: Number(video.duration) || 0,
        originalFilename: video.originalFilename || '',
      },
      videoUrl: '',
    }
  }

  const youtubeUrl = video.source === 'youtube' ? video.url : project.videoUrl
  if (youtubeUrl) {
    return {
      ...project,
      video: {
        ...emptyVideo,
        source: 'youtube',
        url: youtubeUrl,
        secureUrl: youtubeUrl,
      },
      videoUrl: youtubeUrl,
    }
  }

  return { ...project, video: { ...emptyVideo }, videoUrl: '' }
}

const withProjectDefaults = (project, index = 0) => {
  const seedProject = seedProjectById.get(project.id) || {}
  const mergedProject = withProjectVideo(
    withProjectImages({
      ...seedProject,
      ...project,
    }),
  )

  return {
    ...mergedProject,
    floorPlan:
      project.floorPlan || seedProject.floorPlan || createDefaultFloorPlan(project, index),
  }
}

const ensureProjects = () => {
  const existing = storage.readJson(storageKeys.projects, null)
  if (!existing) {
    storage.writeJson(storageKeys.projects, seedProjects)
    return seedProjects
  }

  const existingIds = new Set(existing.map((project) => project.id))
  const missingSeedProjects = seedProjects.filter(
    (project) => !existingIds.has(project.id),
  )
  const migratedProjects = [...missingSeedProjects, ...existing].map(withProjectDefaults)
  if (JSON.stringify(migratedProjects) !== JSON.stringify(existing)) {
    storage.writeJson(storageKeys.projects, migratedProjects)
  }
  return migratedProjects
}

const getLocalProjects = () =>
  ensureProjects().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

const getLocalPublishedProjects = () =>
  getLocalProjects().filter((project) => project.publishStatus === 'published')

const getLocalProjectById = (id) =>
  getLocalProjects().find((project) => project.id === id || project.slug === id)

const saveLocalProject = (project) => {
  const projects = getLocalProjects()
  const now = new Date().toISOString()
  const id = project.id || project.slug || `project-${Date.now()}`
  const nextProject = {
    ...withProjectVideo(withProjectImages(project)),
    id,
    slug: project.slug || id,
    priceValue: Number(project.priceValue) || 0,
    area: Number(project.area) || 0,
    floors: Number(project.floors) || 1,
    bedrooms: Number(project.bedrooms) || 0,
    bathrooms: Number(project.bathrooms) || 0,
    parking: Number(project.parking) || 0,
    gallery: withProjectImages(project).gallery,
    galleryImages: withProjectImages(project).galleryImages,
    floorPlanImages: withProjectImages(project).floorPlanImages,
    highlights: project.highlights || [],
    floorPlan: project.floorPlan || null,
    createdAt: project.createdAt || now,
    updatedAt: now,
  }

  const exists = projects.some((item) => item.id === id)
  const nextProjects = exists
    ? projects.map((item) => (item.id === id ? nextProject : item))
    : [nextProject, ...projects]

  storage.writeJson(storageKeys.projects, nextProjects)
  return nextProject
}

const deleteLocalProject = (id) => {
  const nextProjects = getLocalProjects().filter((project) => project.id !== id)
  storage.writeJson(storageKeys.projects, nextProjects)
}

const toggleLocalPublishStatus = (id) => {
  const projects = getLocalProjects()
  let updatedProject = null

  const nextProjects = projects.map((project) => {
    if (project.id !== id) return project
    updatedProject = {
      ...project,
      publishStatus:
        project.publishStatus === 'published' ? 'draft' : 'published',
      updatedAt: new Date().toISOString(),
    }
    return updatedProject
  })

  storage.writeJson(storageKeys.projects, nextProjects)
  return updatedProject
}

export const getProjects = async () => {
  if (isApiEnabled) return apiRequest('/projects', { auth: true })
  return getLocalProjects()
}

export const getPublishedProjects = async () => {
  if (isApiEnabled) return apiRequest('/projects?publishStatus=published')
  return getLocalPublishedProjects()
}

export const getProjectById = async (id, options = {}) => {
  if (isApiEnabled) {
    return apiRequest(`/projects/${encodeURIComponent(id)}`, {
      auth: options.includeDraft,
    })
  }

  return getLocalProjectById(id)
}

export const saveProject = async (project) => {
  if (isApiEnabled) {
    const id = project.id || project.slug
    const path = id ? `/projects/${encodeURIComponent(id)}` : '/projects'
    const method = id ? 'PUT' : 'POST'

    return apiRequest(path, {
      method,
      auth: true,
      body: project,
    })
  }

  return saveLocalProject(project)
}

export const deleteProject = async (id) => {
  if (isApiEnabled) {
    await apiRequest(`/projects/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      auth: true,
    })
    return
  }

  deleteLocalProject(id)
}

export const togglePublishStatus = async (id) => {
  if (isApiEnabled) {
    return apiRequest(`/projects/${encodeURIComponent(id)}/publish-status`, {
      method: 'PATCH',
      auth: true,
    })
  }

  return toggleLocalPublishStatus(id)
}
