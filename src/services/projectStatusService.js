import { apiRequest } from './apiClient'

export const createProjectStatusSlug = (value = '') =>
  String(value)
    .trim()
    .toLocaleLowerCase('th')
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

export const getProjectStatuses = () => apiRequest('/project-statuses')

export const getAdminProjectStatuses = () =>
  apiRequest('/admin/project-statuses', { auth: true })

export const createProjectStatus = (projectStatus) =>
  apiRequest('/admin/project-statuses', {
    method: 'POST',
    auth: true,
    body: {
      name: projectStatus.name.trim(),
      slug: createProjectStatusSlug(projectStatus.slug || projectStatus.name),
      color: projectStatus.color,
      isActive: projectStatus.isActive,
      sortOrder: projectStatus.sortOrder,
    },
  })

export const updateProjectStatus = (id, projectStatus) =>
  apiRequest(`/admin/project-statuses/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    auth: true,
    body: {
      name: projectStatus.name.trim(),
      slug: createProjectStatusSlug(projectStatus.slug || projectStatus.name),
      color: projectStatus.color,
      isActive: projectStatus.isActive,
      sortOrder: projectStatus.sortOrder,
    },
  })

export const toggleProjectStatus = (id) =>
  apiRequest(`/admin/project-statuses/${encodeURIComponent(id)}/toggle`, {
    method: 'PATCH',
    auth: true,
  })

export const deleteProjectStatus = (id) =>
  apiRequest(`/admin/project-statuses/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    auth: true,
  })

export const reorderProjectStatuses = (orderedIds) =>
  apiRequest('/admin/project-statuses/reorder', {
    method: 'PATCH',
    auth: true,
    body: { orderedIds },
  })
