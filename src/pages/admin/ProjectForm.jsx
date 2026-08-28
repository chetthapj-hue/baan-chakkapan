import {
  ArrowDown,
  ArrowUp,
  Film,
  ImagePlus,
  Save,
  Star,
  Trash2,
  Upload,
  Video,
  XCircle,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import FormInput from '../../components/FormInput'
import ImageWithFallback from '../../components/ImageWithFallback'
import Toast from '../../components/Toast'
import { FALLBACK_IMAGE } from '../../data/mockData'
import { useProjects } from '../../hooks/useProjects'
import { useToast } from '../../hooks/useToast'
import { getHouseTypes } from '../../services/houseTypeService'
import {
  deleteUploadedImage,
  formatFileSize,
  imageRules,
  uploadProjectImages,
  validateImageFiles,
} from '../../services/imageUploadService'
import { getProjectById } from '../../services/projectService'
import { getAdminProjectStatuses } from '../../services/projectStatusService'
import {
  deleteUploadedVideo,
  getVideoFileSummary,
  uploadVideoToCloudinary,
  validateVideoFile,
} from '../../services/videoUploadService'
import { createSlug, formatPriceShort } from '../../utils/formatters'

const emptyProject = {
  title: '',
  slug: '',
  type: '',
  status: '',
  statusId: '',
  statusSlug: '',
  statusColor: '',
  publishStatus: 'published',
  price: '',
  priceValue: '',
  location: '',
  area: '',
  floors: 1,
  bedrooms: 3,
  bathrooms: 2,
  parking: 2,
  description: '',
  highlightsText: '',
  videoMode: 'none',
  videoUrl: '',
  video: {
    source: null,
    url: '',
    secureUrl: '',
    publicId: '',
    resourceType: '',
    format: '',
    bytes: 0,
    duration: 0,
    originalFilename: '',
  },
  coverImage: '',
  coverImagePublicId: '',
  coverAlt: '',
  galleryImages: [],
  floorPlanImages: [],
}

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

const emptyVideo = emptyProject.video

const normalizeVideo = (project = {}) => {
  const video = project.video || {}
  if (video.source === 'cloudinary' && video.publicId) {
    return {
      source: 'cloudinary',
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

  const youtubeUrl = video.source === 'youtube' ? video.url : project.videoUrl
  if (youtubeUrl) {
    return {
      ...emptyVideo,
      source: 'youtube',
      url: youtubeUrl,
      secureUrl: youtubeUrl,
    }
  }

  return { ...emptyVideo }
}

const getVideoMode = (video) => video.source || 'none'

const normalizeProjectForForm = (project) => {
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
  const video = normalizeVideo(project)

  return {
    ...emptyProject,
    ...project,
    priceValue: project.priceValue || '',
    highlightsText: (project.highlights || []).join('\n'),
    galleryImages,
    floorPlanImages,
    coverImage,
    coverImagePublicId,
    coverAlt,
    video,
    videoMode: getVideoMode(video),
    videoUrl: video.source === 'youtube' ? video.url : '',
  }
}

const withCurrentTypeOption = (houseTypes, currentType) => {
  if (!currentType || houseTypes.some((houseType) => houseType.name === currentType)) {
    return houseTypes
  }

  return [{ id: `current-${currentType}`, name: currentType }, ...houseTypes]
}

const withCurrentStatusOption = (statuses, currentProject) => {
  const currentStatusId = currentProject.statusId || currentProject.statusSlug || currentProject.status
  if (!currentStatusId) return statuses

  const hasCurrentStatus = statuses.some(
    (status) =>
      status.id === currentProject.statusId ||
      status.slug === currentProject.statusSlug ||
      status.name === currentProject.status,
  )
  if (hasCurrentStatus) return statuses

  return [
    {
      id: currentProject.statusId || `current-${currentProject.status}`,
      name: currentProject.status,
      slug: currentProject.statusSlug || currentProject.status,
      color: currentProject.statusColor || '#0E4F52',
      isActive: false,
    },
    ...statuses,
  ]
}

const makeQueuedFiles = (files) =>
  files.map((file, index) => ({
    id: `${file.name}-${file.size}-${file.lastModified}-${index}`,
    file,
    previewUrl: URL.createObjectURL(file),
  }))

const getImageKey = (image, index) => image.publicId || `${image.url}-${index}`

const ProjectForm = ({ mode }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { save } = useProjects()
  const { toast, showToast, clearToast } = useToast()
  const [editingProject, setEditingProject] = useState(null)
  const [loadingProject, setLoadingProject] = useState(mode === 'edit')
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isVideoUploading, setIsVideoUploading] = useState(false)
  const [isDeletingImage, setIsDeletingImage] = useState(false)
  const [isDeletingVideo, setIsDeletingVideo] = useState(false)
  const [form, setForm] = useState(emptyProject)
  const [errors, setErrors] = useState({})
  const [imageError, setImageError] = useState('')
  const [videoError, setVideoError] = useState('')
  const [videoFile, setVideoFile] = useState(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('')
  const [videoUploadProgress, setVideoUploadProgress] = useState(0)
  const [galleryQueue, setGalleryQueue] = useState([])
  const [floorPlanQueue, setFloorPlanQueue] = useState([])
  const [houseTypes, setHouseTypes] = useState([])
  const [houseTypesLoading, setHouseTypesLoading] = useState(true)
  const [houseTypesError, setHouseTypesError] = useState('')
  const [projectStatuses, setProjectStatuses] = useState([])
  const [projectStatusesLoading, setProjectStatusesLoading] = useState(true)
  const [projectStatusesError, setProjectStatusesError] = useState('')

  const typeOptions = useMemo(
    () => withCurrentTypeOption(houseTypes, form.type),
    [houseTypes, form.type],
  )
  const statusOptions = useMemo(
    () => withCurrentStatusOption(projectStatuses, form),
    [projectStatuses, form],
  )
  const selectedStatusValue = form.statusId || form.statusSlug || form.status
  const totalSavedImages = form.galleryImages.length + form.floorPlanImages.length
  const queuedImages = galleryQueue.length + floorPlanQueue.length
  const totalImages = totalSavedImages + queuedImages
  const selectedCover =
    form.galleryImages.find((image) => image.publicId === form.coverImagePublicId) ||
    form.galleryImages.find((image) => image.url === form.coverImage) ||
    form.galleryImages[0]

  useEffect(
    () => () => {
      galleryQueue.forEach((item) => URL.revokeObjectURL(item.previewUrl))
      floorPlanQueue.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    },
    [galleryQueue, floorPlanQueue],
  )

  useEffect(
    () => () => {
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl)
    },
    [videoPreviewUrl],
  )

  const loadHouseTypes = async ({ showLoading = true } = {}) => {
    if (showLoading) setHouseTypesLoading(true)
    try {
      const nextHouseTypes = await getHouseTypes()
      setHouseTypes(nextHouseTypes)
      setHouseTypesError('')
      setForm((current) => ({
        ...current,
        type: current.type || nextHouseTypes[0]?.name || '',
      }))
    } catch (error) {
      setHouseTypesError(error.message || 'โหลดประเภทบ้านไม่สำเร็จ')
    } finally {
      if (showLoading) setHouseTypesLoading(false)
    }
  }

  const applyDefaultStatus = useCallback((nextStatuses) => {
    setForm((current) => {
      if (current.status || current.statusId || current.statusSlug) return current
      const firstStatus = nextStatuses[0]
      if (!firstStatus) return current

      return {
        ...current,
        status: firstStatus.name,
        statusId: firstStatus.id,
        statusSlug: firstStatus.slug,
        statusColor: firstStatus.color || '#0E4F52',
      }
    })
  }, [])

  const loadProjectStatuses = async ({ showLoading = true } = {}) => {
    if (showLoading) setProjectStatusesLoading(true)
    try {
      const nextStatuses = await getAdminProjectStatuses()
      const activeStatuses = nextStatuses.filter((status) => status.isActive)
      setProjectStatuses(activeStatuses)
      setProjectStatusesError('')
      applyDefaultStatus(activeStatuses)
    } catch (error) {
      setProjectStatusesError(error.message || 'โหลดสถานะงานไม่สำเร็จ')
    } finally {
      if (showLoading) setProjectStatusesLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    const loadInitialHouseTypes = async () => {
      try {
        const nextHouseTypes = await getHouseTypes()
        if (!active) return
        setHouseTypes(nextHouseTypes)
        setHouseTypesError('')
        setForm((current) => ({
          ...current,
          type: current.type || nextHouseTypes[0]?.name || '',
        }))
      } catch (error) {
        if (active) setHouseTypesError(error.message || 'โหลดประเภทบ้านไม่สำเร็จ')
      } finally {
        if (active) setHouseTypesLoading(false)
      }
    }

    loadInitialHouseTypes()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    const loadInitialProjectStatuses = async () => {
      try {
        const nextStatuses = await getAdminProjectStatuses()
        if (!active) return
        const activeStatuses = nextStatuses.filter((status) => status.isActive)
        setProjectStatuses(activeStatuses)
        setProjectStatusesError('')
        applyDefaultStatus(activeStatuses)
      } catch (error) {
        if (active) setProjectStatusesError(error.message || 'โหลดสถานะงานไม่สำเร็จ')
      } finally {
        if (active) setProjectStatusesLoading(false)
      }
    }

    loadInitialProjectStatuses()

    return () => {
      active = false
    }
  }, [applyDefaultStatus])

  useEffect(() => {
    let active = true

    const timeoutId = window.setTimeout(() => {
      if (mode !== 'edit' || !id) {
        const firstStatus = projectStatuses[0]
        setEditingProject(null)
        setForm(
          firstStatus
            ? {
                ...emptyProject,
                status: firstStatus.name,
                statusId: firstStatus.id,
                statusSlug: firstStatus.slug,
                statusColor: firstStatus.color || '#0E4F52',
              }
            : emptyProject,
        )
        setLoadingProject(false)
        return
      }

      setLoadingProject(true)
      getProjectById(id, { includeDraft: true })
        .then((project) => {
          if (!active) return
          setEditingProject(project || null)
          if (project) setForm(normalizeProjectForForm(project))
        })
        .catch(() => {
          if (!active) return
          setEditingProject(null)
        })
        .finally(() => {
          if (active) setLoadingProject(false)
        })
    }, 0)

    return () => {
      active = false
      window.clearTimeout(timeoutId)
    }
  }, [id, mode, projectStatuses])

  const update = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    if (name === 'status') {
      const selectedStatus = statusOptions.find(
        (status) => status.id === value || status.slug === value || status.name === value,
      )
      setForm((current) => ({
        ...current,
        status: selectedStatus?.name || value,
        statusId: selectedStatus?.id || '',
        statusSlug: selectedStatus?.slug || '',
        statusColor: selectedStatus?.color || '#0E4F52',
      }))
      return
    }
    if (name === 'title' && !form.slug) {
      setForm((current) => ({
        ...current,
        title: value,
        slug: createSlug(value),
      }))
      return
    }
    if (name === 'priceValue' && !form.price) {
      const price = value ? `เริ่มต้น ${formatPriceShort(value)}` : ''
      setForm((current) => ({ ...current, priceValue: value, price }))
      return
    }
    update(name, value)
  }

  const updateVideoMode = (mode) => {
    setVideoError('')
    setVideoUploadProgress(0)
    setForm((current) => {
      if (mode === 'youtube') {
        return {
          ...current,
          videoMode: mode,
          video: current.video?.source === 'youtube' ? current.video : { ...emptyVideo },
        }
      }

      if (mode === 'cloudinary') {
        return {
          ...current,
          videoMode: mode,
          videoUrl: '',
        }
      }

      return {
        ...current,
        videoMode: mode,
        videoUrl: '',
        video: { ...emptyVideo },
      }
    })
  }

  const handleVideoFile = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const error = validateVideoFile(file)
    if (error) {
      setVideoError(error)
      return
    }

    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl)
    setVideoFile(file)
    setVideoPreviewUrl(URL.createObjectURL(file))
    setVideoUploadProgress(0)
    setVideoError('')
    updateVideoMode('cloudinary')
  }

  const uploadSelectedVideo = async () => {
    if (!videoFile) return

    const error = validateVideoFile(videoFile)
    if (error) {
      setVideoError(error)
      return
    }

    setIsVideoUploading(true)
    setVideoUploadProgress(1)
    try {
      const uploadedVideo = await uploadVideoToCloudinary({
        file: videoFile,
        onProgress: setVideoUploadProgress,
      })
      setForm((current) => ({
        ...current,
        videoMode: 'cloudinary',
        videoUrl: '',
        video: uploadedVideo,
      }))
      setVideoFile(null)
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl)
      setVideoPreviewUrl('')
      setVideoError('')
      showToast('อัปโหลดวิดีโอเรียบร้อยแล้ว')
    } catch (error) {
      setVideoError(error.message || 'อัปโหลดวิดีโอไม่สำเร็จ')
      showToast(error.message || 'อัปโหลดวิดีโอไม่สำเร็จ', 'error')
    } finally {
      setIsVideoUploading(false)
    }
  }

  const clearVideo = async () => {
    const currentVideo = form.video
    const shouldDeleteCloudinaryVideo =
      currentVideo?.source === 'cloudinary' && currentVideo.publicId

    setIsDeletingVideo(true)
    try {
      if (shouldDeleteCloudinaryVideo) {
        await deleteUploadedVideo({
          publicId: currentVideo.publicId,
          projectId: editingProject?.id,
        })
      }

      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl)
      setVideoFile(null)
      setVideoPreviewUrl('')
      setVideoUploadProgress(0)
      setVideoError('')
      setForm((current) => ({
        ...current,
        videoMode: 'none',
        videoUrl: '',
        video: { ...emptyVideo },
      }))
      showToast('ลบวิดีโอแล้ว')
    } catch (error) {
      showToast(error.message || 'ลบวิดีโอไม่สำเร็จ', 'error')
    } finally {
      setIsDeletingVideo(false)
    }
  }

  const validate = () => {
    const requiredFields = [
      'title',
      'slug',
      'type',
      'status',
      'publishStatus',
      'price',
      'priceValue',
      'location',
      'area',
      'floors',
      'bedrooms',
      'bathrooms',
      'parking',
      'description',
    ]
    const nextErrors = {}
    requiredFields.forEach((field) => {
      if (!String(form[field] || '').trim()) nextErrors[field] = 'กรุณากรอกข้อมูล'
    })
    if (!form.galleryImages.length) nextErrors.galleryImages = 'กรุณาอัปโหลดรูปผลงานอย่างน้อย 1 รูป'
    if (!selectedCover?.url) nextErrors.coverImage = 'กรุณาเลือกรูปปกจาก Gallery'
    if (!form.highlightsText.trim()) nextErrors.highlightsText = 'กรุณากรอกจุดเด่นอย่างน้อย 1 รายการ'
    if (houseTypesError && !form.type) nextErrors.type = 'โหลดประเภทบ้านไม่สำเร็จ'
    if (projectStatusesError && !form.status) nextErrors.status = 'โหลดสถานะงานไม่สำเร็จ'
    if (totalImages > imageRules.maxProjectImages) {
      nextErrors.galleryImages = 'อัปโหลดรูปภาพได้รวมไม่เกิน 10 รูปต่อผลงาน'
    }

    const imagesWithoutAlt = [...form.galleryImages, ...form.floorPlanImages].some(
      (image) => !image.alt?.trim(),
    )
    if (imagesWithoutAlt) nextErrors.galleryImages = 'รูปทั้งหมดต้องมี Alt text'
    if (isVideoUploading) nextErrors.video = 'กรุณารอให้อัปโหลดวิดีโอเสร็จก่อน'
    if (videoFile) nextErrors.video = 'กรุณาอัปโหลดวิดีโอที่เลือกไว้ก่อนบันทึก'
    if (form.videoMode === 'youtube' && !form.videoUrl.trim()) {
      nextErrors.video = 'กรุณาใส่ URL วิดีโอ YouTube'
    }
    if (form.videoMode === 'cloudinary' && form.video?.source !== 'cloudinary') {
      nextErrors.video = 'กรุณาอัปโหลดวิดีโอให้เสร็จก่อนบันทึก'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const addQueuedFiles = (event, type) => {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    if (!files.length) return

    const error = validateImageFiles(files, totalImages)
    if (error) {
      setImageError(error)
      return
    }

    const queued = makeQueuedFiles(files)
    setImageError('')
    if (type === 'gallery') {
      setGalleryQueue((current) => [...current, ...queued])
      return
    }
    setFloorPlanQueue((current) => [...current, ...queued])
  }

  const removeQueuedFile = (id, type) => {
    const removeFromQueue = (queue) => {
      const item = queue.find((queuedFile) => queuedFile.id === id)
      if (item) URL.revokeObjectURL(item.previewUrl)
      return queue.filter((queuedFile) => queuedFile.id !== id)
    }

    if (type === 'gallery') {
      setGalleryQueue(removeFromQueue)
      return
    }
    setFloorPlanQueue(removeFromQueue)
  }

  const uploadQueue = async (type) => {
    const queue = type === 'gallery' ? galleryQueue : floorPlanQueue
    if (!queue.length) return

    const error = validateImageFiles(
      queue.map((item) => item.file),
      totalSavedImages,
    )
    if (error) {
      setImageError(error)
      return
    }

    setIsUploading(true)
    try {
      const result = await uploadProjectImages({
        files: queue.map((item) => item.file),
        type,
        projectId: editingProject?.id,
      })
      const uploadedImages = normalizeImages(
        result.images.map((image, index) => ({
          ...image,
          alt:
            type === 'gallery'
              ? `${form.title || 'ผลงานบ้าน'} รูปที่ ${form.galleryImages.length + index + 1}`
              : `แปลนชั้น ${form.floorPlanImages.length + index + 1}`,
        })),
      )

      setForm((current) => {
        if (type === 'gallery') {
          const galleryImages = normalizeImages([...current.galleryImages, ...uploadedImages])
          const cover = current.coverImagePublicId
            ? galleryImages.find((image) => image.publicId === current.coverImagePublicId)
            : galleryImages[0]
          return {
            ...current,
            galleryImages,
            coverImage: cover?.url || '',
            coverImagePublicId: cover?.publicId || '',
            coverAlt: cover?.alt || '',
          }
        }

        return {
          ...current,
          floorPlanImages: normalizeImages([...current.floorPlanImages, ...uploadedImages]),
        }
      })

      queue.forEach((item) => URL.revokeObjectURL(item.previewUrl))
      if (type === 'gallery') setGalleryQueue([])
      else setFloorPlanQueue([])
      setImageError('')
      showToast(type === 'gallery' ? 'อัปโหลดรูปผลงานแล้ว' : 'อัปโหลดรูปแปลนแล้ว')
    } catch (error) {
      showToast(error.message || 'อัปโหลดรูปภาพไม่สำเร็จ', 'error')
    } finally {
      setIsUploading(false)
    }
  }

  const updateImageAlt = (type, index, alt) => {
    const key = type === 'gallery' ? 'galleryImages' : 'floorPlanImages'
    setForm((current) => {
      const images = current[key].map((image, itemIndex) =>
        itemIndex === index ? { ...image, alt } : image,
      )
      const next = { ...current, [key]: images }
      if (type === 'gallery' && images[index]?.publicId === current.coverImagePublicId) {
        next.coverAlt = alt
      }
      return next
    })
  }

  const moveImage = (type, index, direction) => {
    const key = type === 'gallery' ? 'galleryImages' : 'floorPlanImages'
    const nextIndex = index + direction
    setForm((current) => {
      if (nextIndex < 0 || nextIndex >= current[key].length) return current

      const images = [...current[key]]
      const [item] = images.splice(index, 1)
      images.splice(nextIndex, 0, item)
      return { ...current, [key]: normalizeImages(images) }
    })
  }

  const setAsCover = (image) => {
    setForm((current) => ({
      ...current,
      coverImage: image.url,
      coverImagePublicId: image.publicId || '',
      coverAlt: image.alt,
    }))
  }

  const removeSavedImage = async (type, index) => {
    const key = type === 'gallery' ? 'galleryImages' : 'floorPlanImages'
    const image = form[key][index]
    if (!image) return

    setIsDeletingImage(true)
    try {
      if (image.publicId) {
        await deleteUploadedImage({
          publicId: image.publicId,
          projectId: editingProject?.id,
        })
      }

      setForm((current) => {
        const images = current[key].filter((_, itemIndex) => itemIndex !== index)
        if (type !== 'gallery') return { ...current, [key]: normalizeImages(images) }

        const galleryImages = normalizeImages(images)
        const removedCover =
          current.coverImagePublicId === image.publicId || current.coverImage === image.url
        const nextCover = removedCover ? galleryImages[0] : selectedCover
        return {
          ...current,
          galleryImages,
          coverImage: nextCover?.url || '',
          coverImagePublicId: nextCover?.publicId || '',
          coverAlt: nextCover?.alt || '',
        }
      })
      showToast('ลบรูปภาพแล้ว')
    } catch (error) {
      showToast(error.message || 'ลบรูปภาพไม่สำเร็จ', 'error')
    } finally {
      setIsDeletingImage(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isVideoUploading || videoFile) {
      showToast('กรุณาอัปโหลดวิดีโอให้เสร็จก่อนบันทึก', 'error')
      return
    }
    if (queuedImages) {
      showToast('กรุณาอัปโหลดรูปที่เลือกไว้ก่อนบันทึก', 'error')
      return
    }
    if (!validate()) {
      showToast('กรุณาตรวจสอบข้อมูลที่จำเป็น', 'error')
      return
    }

    const cover = selectedCover || form.galleryImages[0]
    const galleryImages = normalizeImages(form.galleryImages)
    const floorPlanImages = normalizeImages(form.floorPlanImages)
    const selectedStatus = statusOptions.find(
      (status) =>
        status.id === selectedStatusValue ||
        status.slug === selectedStatusValue ||
        status.name === selectedStatusValue,
    )
    const video =
      form.videoMode === 'cloudinary'
        ? form.video
        : form.videoMode === 'youtube'
          ? {
              ...emptyVideo,
              source: 'youtube',
              url: form.videoUrl.trim(),
              secureUrl: form.videoUrl.trim(),
            }
          : { ...emptyVideo }
    const payload = {
      ...form,
      id: editingProject?.id || form.slug,
      status: selectedStatus?.name || form.status,
      statusId: selectedStatus?.id || form.statusId || '',
      statusSlug: selectedStatus?.slug || form.statusSlug || '',
      statusColor: selectedStatus?.color || form.statusColor || '#0E4F52',
      priceValue: Number(form.priceValue),
      area: Number(form.area),
      floors: Number(form.floors),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      parking: Number(form.parking),
      coverImage: cover?.url || FALLBACK_IMAGE,
      coverImagePublicId: cover?.publicId || '',
      coverAlt: cover?.alt || form.coverAlt,
      galleryImages,
      floorPlanImages,
      gallery: galleryImages,
      floorPlan: null,
      video,
      videoUrl: video.source === 'youtube' ? video.url : '',
      highlights: form.highlightsText
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),
    }

    setIsSaving(true)
    try {
      await save(payload)
      showToast(mode === 'edit' ? 'บันทึกการแก้ไขแล้ว' : 'เพิ่มผลงานใหม่แล้ว')
      window.setTimeout(() => navigate('/admin/projects'), 700)
    } catch (error) {
      showToast(error.message || 'บันทึกไม่สำเร็จ กรุณาลองใหม่', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const renderQueue = (queue, type) =>
    queue.length ? (
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {queue.map((item) => (
          <div key={item.id} className="rounded-lg border border-[#0E4F52]/10 p-2">
            <div className="aspect-[4/3] overflow-hidden rounded-md bg-[#EAF4F2]">
              <img
                src={item.previewUrl}
                alt={item.file.name}
                className="h-full w-full object-cover"
              />
            </div>
            <p className="mt-2 line-clamp-1 text-xs font-bold text-[#0E4F52]">
              {item.file.name}
            </p>
            <p className="mt-1 text-xs text-[#5e6256]">
              {formatFileSize(item.file.size)}
            </p>
            <button
              type="button"
              className="btn-ghost mt-2 min-h-9 px-2 text-red-700"
              onClick={() => removeQueuedFile(item.id, type)}
              disabled={isUploading}
            >
              <Trash2 size={15} /> ลบออก
            </button>
          </div>
        ))}
      </div>
    ) : null

  const renderImageList = (images, type) =>
    images.length ? (
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {images.map((image, index) => (
          <div key={getImageKey(image, index)} className="rounded-lg border border-[#0E4F52]/10 p-2">
            <div className="aspect-[4/3] overflow-hidden rounded-md bg-[#EAF4F2]">
              <ImageWithFallback
                src={image.url}
                alt={image.alt}
                className="h-full w-full object-cover"
              />
            </div>
            <FormInput
              label={type === 'gallery' ? 'Alt text' : 'ชื่อ/Alt แปลน'}
              value={image.alt}
              onChange={(event) => updateImageAlt(type, index, event.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-ghost min-h-9 px-2"
                onClick={() => moveImage(type, index, -1)}
                disabled={index === 0}
                aria-label="เลื่อนรูปขึ้น"
              >
                <ArrowUp size={15} />
              </button>
              <button
                type="button"
                className="btn-ghost min-h-9 px-2"
                onClick={() => moveImage(type, index, 1)}
                disabled={index === images.length - 1}
                aria-label="เลื่อนรูปลง"
              >
                <ArrowDown size={15} />
              </button>
              {type === 'gallery' && (
                <button
                  type="button"
                  className="btn-ghost min-h-9 px-2"
                  onClick={() => setAsCover(image)}
                >
                  <Star size={15} />
                  {selectedCover?.url === image.url ? 'รูปปก' : 'ตั้งปก'}
                </button>
              )}
              <button
                type="button"
                className="btn-ghost min-h-9 px-2 text-red-700"
                aria-label="ลบรูปภาพ"
                onClick={() => removeSavedImage(type, index)}
                disabled={isDeletingImage}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="mt-4 rounded-lg bg-[#EAF4F2] p-5 text-sm font-bold text-[#5e6256]">
        {type === 'gallery' ? 'ยังไม่มีรูปผลงาน' : 'ยังไม่มีรูปแปลน'}
      </div>
    )

  if (loadingProject) {
    return (
      <div className="rounded-lg bg-white p-8 text-center text-[#5e6256] shadow-sm">
        Loading...
      </div>
    )
  }

  if (mode === 'edit' && !editingProject) {
    return (
      <div className="rounded-lg bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-extrabold text-[#0E4F52]">ไม่พบผลงาน</h1>
        <Link to="/admin/projects" className="btn-primary mt-5">
          กลับหน้าจัดการผลงาน
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={clearToast} />
      <div>
        <p className="text-sm font-bold uppercase text-[#0E4F52]">
          {mode === 'edit' ? 'Edit Project' : 'New Project'}
        </p>
        <h1 className="text-3xl font-extrabold text-[#0E4F52]">
          {mode === 'edit' ? 'แก้ไขผลงาน' : 'เพิ่มผลงาน'}
        </h1>
      </div>

      <form className="grid gap-6" onSubmit={handleSubmit}>
        <section className="rounded-lg bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-xl font-extrabold text-[#0E4F52]">
            ข้อมูลหลัก
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <FormInput
              label="ชื่อผลงาน"
              name="title"
              value={form.title}
              error={errors.title}
              onChange={handleChange}
              required
            />
            <FormInput
              label="Slug หรือ ID"
              name="slug"
              value={form.slug}
              error={errors.slug}
              onChange={handleChange}
              required
            />
            <FormInput label="ประเภทบ้าน" error={errors.type} required>
              {houseTypesError && (
                <div className="mb-2 rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                  {houseTypesError}
                  <button
                    type="button"
                    className="ml-3 underline"
                    onClick={() => loadHouseTypes()}
                  >
                    ลองใหม่
                  </button>
                </div>
              )}
              <select
                className="form-field"
                name="type"
                value={form.type}
                onChange={handleChange}
                disabled={houseTypesLoading || (!typeOptions.length && Boolean(houseTypesError))}
              >
                {houseTypesLoading && <option value="">กำลังโหลดประเภทบ้าน</option>}
                {!houseTypesLoading && !typeOptions.length && (
                  <option value="">ยังไม่มีประเภทบ้าน</option>
                )}
                {typeOptions.map((type) => (
                  <option key={type.id} value={type.name}>
                    {type.name}
                  </option>
                ))}
              </select>
            </FormInput>
            <FormInput label="สถานะงาน" error={errors.status} required>
              {projectStatusesError && (
                <div className="mb-2 rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                  {projectStatusesError}
                  <button
                    type="button"
                    className="ml-3 underline"
                    onClick={() => loadProjectStatuses()}
                  >
                    ลองใหม่
                  </button>
                </div>
              )}
              <select
                className="form-field"
                name="status"
                value={selectedStatusValue}
                onChange={handleChange}
                disabled={projectStatusesLoading || (!statusOptions.length && Boolean(projectStatusesError))}
              >
                {projectStatusesLoading && <option value="">กำลังโหลดสถานะงาน</option>}
                {!projectStatusesLoading && !statusOptions.length && (
                  <option value="">ยังไม่มีสถานะงาน</option>
                )}
                {statusOptions.map((status) => (
                  <option key={status.id} value={status.id || status.slug || status.name}>
                    {status.name}
                  </option>
                ))}
              </select>
            </FormInput>
            <FormInput label="สถานะเผยแพร่" error={errors.publishStatus} required>
              <select
                className="form-field"
                name="publishStatus"
                value={form.publishStatus}
                onChange={handleChange}
              >
                <option value="published">เผยแพร่</option>
                <option value="draft">ฉบับร่าง</option>
              </select>
            </FormInput>
            <FormInput
              label="ราคาแสดงผล"
              name="price"
              value={form.price}
              error={errors.price}
              onChange={handleChange}
              required
            />
            <FormInput
              label="ราคาเป็นตัวเลขสำหรับ filter"
              type="number"
              name="priceValue"
              value={form.priceValue}
              error={errors.priceValue}
              onChange={handleChange}
              required
            />
            <FormInput
              label="ที่ตั้ง"
              name="location"
              value={form.location}
              error={errors.location}
              onChange={handleChange}
              required
            />
          </div>
        </section>

        <section className="rounded-lg bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-xl font-extrabold text-[#0E4F52]">
            รายละเอียดพื้นที่
          </h2>
          <div className="grid gap-4 md:grid-cols-5">
            {[
              ['พื้นที่ใช้สอย', 'area', 'ตร.ม.'],
              ['จำนวนชั้น', 'floors', 'ชั้น'],
              ['ห้องนอน', 'bedrooms', 'ห้อง'],
              ['ห้องน้ำ', 'bathrooms', 'ห้อง'],
              ['ที่จอดรถ', 'parking', 'คัน'],
            ].map(([label, name, suffix]) => (
              <FormInput
                key={name}
                label={`${label} (${suffix})`}
                type="number"
                name={name}
                value={form[name]}
                error={errors[name]}
                onChange={handleChange}
                required
              />
            ))}
          </div>
        </section>

        <section className="rounded-lg bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-xl font-extrabold text-[#0E4F52]">
            เนื้อหาและวิดีโอ
          </h2>
          <div className="grid gap-4">
            <FormInput
              label="รายละเอียดแบบยาว"
              as="textarea"
              name="description"
              rows="5"
              value={form.description}
              error={errors.description}
              onChange={handleChange}
              required
            />
            <FormInput
              label="รายการจุดเด่น (แยกบรรทัดละ 1 รายการ)"
              as="textarea"
              name="highlightsText"
              rows="5"
              value={form.highlightsText}
              error={errors.highlightsText}
              onChange={handleChange}
              required
            />
            <div className="rounded-lg border border-[#0E4F52]/10 p-4">
              <div className="mb-4 flex flex-wrap gap-2">
                {[
                  ['cloudinary', 'อัปโหลดวิดีโอจากเครื่อง', Film],
                  ['youtube', 'ใช้ URL วิดีโอ YouTube', Video],
                  ['none', 'ไม่ใส่วิดีโอ', XCircle],
                ].map(([modeValue, label, Icon]) => (
                  <button
                    key={modeValue}
                    type="button"
                    className={`inline-flex min-h-10 items-center gap-2 rounded-md border px-3 py-2 text-sm font-extrabold transition ${
                      form.videoMode === modeValue
                        ? 'border-[#0E4F52] bg-[#EAF4F2] text-[#0E4F52]'
                        : 'border-[#0E4F52]/15 text-[#5e6256] hover:bg-[#EAF4F2]'
                    }`}
                    onClick={() => updateVideoMode(modeValue)}
                    disabled={isVideoUploading}
                  >
                    <Icon size={17} /> {label}
                  </button>
                ))}
              </div>

              {(videoError || errors.video) && (
                <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                  {videoError || errors.video}
                </p>
              )}

              {form.videoMode === 'youtube' && (
                <FormInput
                  label="URL วิดีโอ YouTube"
                  name="videoUrl"
                  value={form.videoUrl}
                  error={errors.video}
                  onChange={handleChange}
                />
              )}

              {form.videoMode === 'cloudinary' && (
                <div className="grid gap-4">
                  {form.video?.source === 'cloudinary' && (
                    <div className="rounded-lg bg-[#EAF4F2] p-4">
                      <p className="font-extrabold text-[#0E4F52]">
                        {form.video.originalFilename || 'วิดีโอผลงาน'}
                      </p>
                      <p className="mt-1 text-sm text-[#5e6256]">
                        {formatFileSize(form.video.bytes)} · {form.video.format?.toUpperCase()}
                      </p>
                      <video
                        className="mt-3 aspect-video w-full rounded-lg bg-black"
                        src={form.video.secureUrl || form.video.url}
                        controls
                        playsInline
                        preload="metadata"
                      >
                        เบราว์เซอร์ของคุณไม่รองรับการเล่นวิดีโอ
                      </video>
                    </div>
                  )}

                  {videoFile && (
                    <div className="rounded-lg border border-[#0E4F52]/10 p-4">
                      <p className="font-extrabold text-[#0E4F52]">
                        {getVideoFileSummary(videoFile)}
                      </p>
                      {videoPreviewUrl && (
                        <video
                          className="mt-3 aspect-video w-full rounded-lg bg-black"
                          src={videoPreviewUrl}
                          controls
                          playsInline
                          preload="metadata"
                        >
                          เบราว์เซอร์ของคุณไม่รองรับการเล่นวิดีโอ
                        </video>
                      )}
                      <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#EAF4F2]">
                        <div
                          className="h-full rounded-full bg-[#0E4F52] transition-all"
                          style={{ width: `${videoUploadProgress}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs font-bold text-[#5e6256]">
                        {videoUploadProgress}%
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <label className="btn-ghost cursor-pointer">
                      <Film size={18} /> {form.video?.source === 'cloudinary' ? 'เปลี่ยนวิดีโอ' : 'เลือกวิดีโอ'}
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime,.mov"
                        className="sr-only"
                        onChange={handleVideoFile}
                        disabled={isVideoUploading}
                      />
                    </label>
                    <button
                      type="button"
                      className="btn-primary"
                      disabled={!videoFile || isVideoUploading}
                      onClick={uploadSelectedVideo}
                    >
                      <Upload size={18} /> {isVideoUploading ? 'กำลังอัปโหลด' : 'อัปโหลดวิดีโอ'}
                    </button>
                    {(form.video?.source === 'cloudinary' || videoFile) && (
                      <button
                        type="button"
                        className="btn-ghost text-red-700"
                        onClick={clearVideo}
                        disabled={isVideoUploading || isDeletingVideo}
                      >
                        <Trash2 size={18} /> ลบวิดีโอ
                      </button>
                    )}
                  </div>
                </div>
              )}

              {form.videoMode === 'none' && (
                <p className="rounded-lg bg-[#EAF4F2] p-4 text-sm font-bold text-[#5e6256]">
                  ผลงานนี้จะไม่แสดงส่วนวิดีโอในหน้าเว็บไซต์
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-lg bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-extrabold text-[#0E4F52]">รูปภาพและแปลนบ้าน</h2>
              <p className="mt-1 text-sm text-[#5e6256]">
                รองรับ JPG, PNG, WebP ไม่เกิน 5 MB ต่อไฟล์ และรวมรูปผลงานกับรูปแปลนไม่เกิน 10 รูป
              </p>
              <p className="mt-1 text-sm font-bold text-[#0E4F52]">
                ใช้แล้ว {totalImages}/{imageRules.maxProjectImages} รูป
              </p>
            </div>
          </div>
          {(imageError || errors.galleryImages || errors.coverImage) && (
            <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
              {imageError || errors.galleryImages || errors.coverImage}
            </p>
          )}

          <div className="grid gap-6">
            <div className="rounded-lg border border-[#0E4F52]/10 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-[#0E4F52]">รูปผลงาน</h3>
                  <p className="text-sm text-[#5e6256]">
                    เลือกรูปปกจากรูปชุดนี้เท่านั้น
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <label className="btn-ghost cursor-pointer">
                    <ImagePlus size={18} /> เลือกรูปผลงาน
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="sr-only"
                      onChange={(event) => addQueuedFiles(event, 'gallery')}
                    />
                  </label>
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={isUploading || !galleryQueue.length}
                    onClick={() => uploadQueue('gallery')}
                  >
                    <Upload size={18} /> อัปโหลดรูปผลงาน
                  </button>
                </div>
              </div>
              {renderQueue(galleryQueue, 'gallery')}
              {renderImageList(form.galleryImages, 'gallery')}
            </div>

            <div className="rounded-lg border border-[#0E4F52]/10 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-[#0E4F52]">รูปแปลนบ้าน</h3>
                  <p className="text-sm text-[#5e6256]">
                    ถ้าไม่มีรูปแปลน ระบบจะไม่แสดงแปลน Mock แทน
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <label className="btn-ghost cursor-pointer">
                    <ImagePlus size={18} /> เลือกรูปแปลน
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="sr-only"
                      onChange={(event) => addQueuedFiles(event, 'floorPlan')}
                    />
                  </label>
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={isUploading || !floorPlanQueue.length}
                    onClick={() => uploadQueue('floorPlan')}
                  >
                    <Upload size={18} /> อัปโหลดรูปแปลน
                  </button>
                </div>
              </div>
              {renderQueue(floorPlanQueue, 'floorPlan')}
              {renderImageList(form.floorPlanImages, 'floorPlan')}
            </div>
          </div>
        </section>

        <div className="flex flex-wrap justify-end gap-3">
          <Link to="/admin/projects" className="btn-ghost">
            ยกเลิก
          </Link>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSaving || isUploading || isDeletingImage || isVideoUploading || isDeletingVideo}
          >
            <Save size={18} /> {isSaving ? 'กำลังบันทึก' : 'บันทึกผลงาน'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProjectForm
