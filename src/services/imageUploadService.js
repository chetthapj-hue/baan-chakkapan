import { apiRequest } from './apiClient'

export const imageRules = {
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
  maxFileSize: 5 * 1024 * 1024,
  maxProjectImages: 10,
}

export const imageErrorMessages = {
  maxSize: 'รูปภาพแต่ละไฟล์ต้องมีขนาดไม่เกิน 5 MB',
  maxCount: 'อัปโหลดรูปภาพได้รวมไม่เกิน 10 รูปต่อผลงาน',
  mimeType: 'รองรับเฉพาะไฟล์ JPG, PNG และ WebP',
}

const getExtension = (fileName = '') => {
  const dotIndex = fileName.lastIndexOf('.')
  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : ''
}

export const validateSingleImageFile = (file) => {
  if (!file) return ''

  if (
    !imageRules.allowedTypes.includes(file.type) ||
    !imageRules.allowedExtensions.includes(getExtension(file.name))
  ) {
    return imageErrorMessages.mimeType
  }

  if (file.size > imageRules.maxFileSize) return imageErrorMessages.maxSize

  return ''
}

export const validateImageFiles = (files, currentCount = 0) => {
  if (currentCount + files.length > imageRules.maxProjectImages) {
    return imageErrorMessages.maxCount
  }

  const invalidFile = files.find((file) => validateSingleImageFile(file))
  if (invalidFile) return validateSingleImageFile(invalidFile)

  return ''
}

export const formatFileSize = (bytes = 0) => {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

const getAboutHeroImageUploadSignature = (file) =>
  apiRequest('/uploads/about-hero-image/signature', {
    method: 'POST',
    auth: true,
    body: {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    },
  })

const uploadSignedImageToCloudinary = async ({ file, onProgress, getSignature }) => {
  const signature = await getSignature(file)
  const formData = new FormData()

  formData.append('file', file)
  formData.append('api_key', signature.apiKey)
  formData.append('timestamp', signature.timestamp)
  formData.append('signature', signature.signature)
  formData.append('folder', signature.folder)
  if (signature.uploadPreset) formData.append('upload_preset', signature.uploadPreset)

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) return
      onProgress?.(Math.round((event.loaded / event.total) * 100))
    }

    request.onload = () => {
      let data
      try {
        data = JSON.parse(request.responseText)
      } catch {
        data = null
      }

      if (request.status < 200 || request.status >= 300) {
        reject(new Error(data?.error?.message || 'อัปโหลดรูปภาพไม่สำเร็จ'))
        return
      }

      onProgress?.(100)
      resolve({
        url: data.secure_url || data.url,
        secureUrl: data.secure_url || data.url,
        publicId: data.public_id,
        alt: '',
        resourceType: data.resource_type || 'image',
        format: data.format || getExtension(file.name).replace('.', ''),
        bytes: data.bytes || file.size,
        version: Number(data.version || 0),
        originalFilename: data.original_filename || file.name,
      })
    }

    request.onerror = () => reject(new Error('อัปโหลดรูปภาพไม่สำเร็จ'))
    request.open('POST', signature.uploadUrl)
    request.send(formData)
  })
}

export const uploadAboutHeroImageToCloudinary = ({ file, onProgress }) =>
  uploadSignedImageToCloudinary({
    file,
    onProgress,
    getSignature: getAboutHeroImageUploadSignature,
  })

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

export const deleteAboutHeroImage = async (publicId) =>
  apiRequest('/uploads/about-hero-image', {
    method: 'DELETE',
    auth: true,
    body: { publicId },
  })
