import { apiRequest } from './apiClient'

export const imageRules = {
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxFileSize: 5 * 1024 * 1024,
  maxProjectImages: 10,
}

export const imageErrorMessages = {
  maxSize: 'รูปภาพแต่ละไฟล์ต้องมีขนาดไม่เกิน 5 MB',
  maxCount: 'อัปโหลดรูปภาพได้รวมไม่เกิน 10 รูปต่อผลงาน',
  mimeType: 'รองรับเฉพาะไฟล์ JPG, PNG และ WebP',
}

export const validateImageFiles = (files, currentCount = 0) => {
  if (currentCount + files.length > imageRules.maxProjectImages) {
    return imageErrorMessages.maxCount
  }

  const invalidType = files.some((file) => !imageRules.allowedTypes.includes(file.type))
  if (invalidType) return imageErrorMessages.mimeType

  const oversized = files.some((file) => file.size > imageRules.maxFileSize)
  if (oversized) return imageErrorMessages.maxSize

  return ''
}

export const formatFileSize = (bytes = 0) => {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

export const uploadProjectImages = async ({ files, type, projectId, alt }) => {
  const formData = new FormData()
  files.forEach((file) => formData.append('images', file))
  formData.append('type', type)
  if (projectId) formData.append('projectId', projectId)
  if (alt) formData.append('alt', alt)

  return apiRequest('/uploads/project-images', {
    method: 'POST',
    auth: true,
    body: formData,
  })
}

export const deleteUploadedImage = async ({ publicId, projectId }) =>
  apiRequest('/uploads/project-images', {
    method: 'DELETE',
    auth: true,
    body: { publicId, projectId },
  })
