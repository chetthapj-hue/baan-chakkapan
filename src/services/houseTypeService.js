import { projectTypes } from '../data/mockData'
import { apiRequest, isApiEnabled } from './apiClient'

const fallbackHouseTypes = projectTypes.map((name, index) => ({
  id: `fallback-house-type-${index + 1}`,
  name,
}))

export const getHouseTypes = async () => {
  if (isApiEnabled) return apiRequest('/house-types')
  return fallbackHouseTypes
}

export const createHouseType = (name) => {
  if (!isApiEnabled) throw new Error('API base URL is not configured')

  return apiRequest('/house-types', {
    method: 'POST',
    auth: true,
    body: { name: name.trim() },
  })
}

export const updateHouseType = (id, name) => {
  if (!isApiEnabled) throw new Error('API base URL is not configured')

  return apiRequest(`/house-types/${encodeURIComponent(id)}`, {
    method: 'PUT',
    auth: true,
    body: { name: name.trim() },
  })
}

export const deleteHouseType = (id) => {
  if (!isApiEnabled) throw new Error('API base URL is not configured')

  return apiRequest(`/house-types/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    auth: true,
  })
}
