import { createDefaultFloorPlan, seedProjects } from '../data/mockData'
import { storage, storageKeys } from './storageService'

const seedProjectById = new Map(seedProjects.map((project) => [project.id, project]))

const withProjectDefaults = (project, index = 0) => {
  const seedProject = seedProjectById.get(project.id) || {}
  return {
    ...seedProject,
    ...project,
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

export const getProjects = () =>
  ensureProjects().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

export const getPublishedProjects = () =>
  getProjects().filter((project) => project.publishStatus === 'published')

export const getProjectById = (id) =>
  getProjects().find((project) => project.id === id || project.slug === id)

export const saveProject = (project) => {
  const projects = getProjects()
  const now = new Date().toISOString()
  const id = project.id || project.slug || `project-${Date.now()}`
  const nextProject = {
    ...project,
    id,
    slug: project.slug || id,
    priceValue: Number(project.priceValue) || 0,
    area: Number(project.area) || 0,
    floors: Number(project.floors) || 1,
    bedrooms: Number(project.bedrooms) || 0,
    bathrooms: Number(project.bathrooms) || 0,
    parking: Number(project.parking) || 0,
    gallery: project.gallery || [],
    highlights: project.highlights || [],
    floorPlan: project.floorPlan || createDefaultFloorPlan(project, projects.length),
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

export const deleteProject = (id) => {
  const nextProjects = getProjects().filter((project) => project.id !== id)
  storage.writeJson(storageKeys.projects, nextProjects)
}

export const togglePublishStatus = (id) => {
  const projects = getProjects()
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

