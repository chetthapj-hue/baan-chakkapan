import { apiRequest } from './apiClient'
import { formatFileSize } from './imageUploadService'

export const videoRules = {
  allowedTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
  allowedExtensions: ['.mp4', '.webm', '.mov'],
  maxFileSize: 100 * 1024 * 1024,
}

export const videoErrorMessages = {
  maxSize: 'วิดีโอต้องมีขนาดไม่เกิน 100 MB',
  mimeType: 'รองรับเฉพาะไฟล์ MP4, WebM และ MOV',
}

const getExtension = (fileName = '') => {
  const dotIndex = fileName.lastIndexOf('.')
  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : ''
}

export const validateVideoFile = (file) => {
  if (!file) return ''

  if (
    !videoRules.allowedTypes.includes(file.type) ||
    !videoRules.allowedExtensions.includes(getExtension(file.name))
  ) {
    return videoErrorMessages.mimeType
  }

  if (file.size > videoRules.maxFileSize) return videoErrorMessages.maxSize

  return ''
}

const getVideoUploadSignature = async (file, path) =>
  apiRequest(path, {
    method: 'POST',
    auth: true,
    body: {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    },
  })

export const getProjectVideoUploadSignature = (file) =>
  getVideoUploadSignature(file, '/uploads/project-video/signature')

export const getHomepageVideoUploadSignature = (file) =>
  getVideoUploadSignature(file, '/uploads/homepage-video/signature')

const uploadSignedVideoToCloudinary = async ({ file, onProgress, getSignature }) => {
  const signature = await getSignature(file)
  const formData = new FormData()

  formData.append('file', file)
  formData.append('api_key', signature.apiKey)
  formData.append('timestamp', signature.timestamp)
  formData.append('signature', signature.signature)
  formData.append('folder', signature.folder)
  formData.append('upload_preset', signature.uploadPreset)

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
        reject(new Error(data?.error?.message || 'อัปโหลดวิดีโอไม่สำเร็จ'))
        return
      }

      onProgress?.(100)
      resolve({
        source: 'cloudinary',
        url: data.url || data.secure_url,
        secureUrl: data.secure_url || data.url,
        publicId: data.public_id,
        resourceType: data.resource_type || 'video',
        format: data.format || getExtension(file.name).replace('.', ''),
        bytes: data.bytes || file.size,
        duration: data.duration || 0,
        originalFilename: data.original_filename || file.name,
      })
    }

    request.onerror = () => reject(new Error('อัปโหลดวิดีโอไม่สำเร็จ'))
    request.open('POST', signature.uploadUrl)
    request.send(formData)
  })
}

export const uploadVideoToCloudinary = ({ file, onProgress }) =>
  uploadSignedVideoToCloudinary({
    file,
    onProgress,
    getSignature: getProjectVideoUploadSignature,
  })

export const uploadHomepageVideoToCloudinary = ({ file, onProgress }) =>
  uploadSignedVideoToCloudinary({
    file,
    onProgress,
    getSignature: getHomepageVideoUploadSignature,
  })

export const deleteUploadedVideo = async ({ publicId, projectId }) =>
  apiRequest('/uploads/project-video', {
    method: 'DELETE',
    auth: true,
    body: { publicId, projectId },
  })

export const deleteHomepageVideo = async (publicId) =>
  apiRequest('/uploads/homepage-video', {
    method: 'DELETE',
    auth: true,
    body: { publicId },
  })

export const getVideoFileSummary = (file) =>
  file ? `${file.name} (${formatFileSize(file.size)})` : ''
