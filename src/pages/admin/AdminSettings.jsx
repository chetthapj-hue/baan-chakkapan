import {
  Film,
  ImagePlus,
  RotateCcw,
  Save,
  Trash2,
  Upload,
  Video,
  XCircle,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import FormInput from '../../components/FormInput'
import ImageWithFallback from '../../components/ImageWithFallback'
import Toast from '../../components/Toast'
import { useToast } from '../../hooks/useToast'
import {
  defaultSiteSettings,
  emptyHomepageVideo,
  getSiteSettings,
  resetSiteSettings,
  saveSiteSettings,
} from '../../services/siteSettingsService'
import {
  deleteHomepageVideo,
  getVideoFileSummary,
  uploadHomepageVideoToCloudinary,
  validateVideoFile,
} from '../../services/videoUploadService'

const maxImageSize = 5 * 1024 * 1024

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const validateImage = (file) => {
  if (!file.type.startsWith('image/')) return 'รองรับเฉพาะไฟล์รูปภาพ'
  if (file.size > maxImageSize) return 'รูปภาพต้องไม่เกิน 5 MB'
  return ''
}

const getVideoMode = (video) => video?.source || 'none'

const AdminSettings = () => {
  const [form, setForm] = useState(defaultSiteSettings)
  const [errors, setErrors] = useState({})
  const [imageError, setImageError] = useState('')
  const [videoError, setVideoError] = useState('')
  const [videoFile, setVideoFile] = useState(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('')
  const [videoUploadProgress, setVideoUploadProgress] = useState(0)
  const [pendingUploadedPublicId, setPendingUploadedPublicId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isVideoUploading, setIsVideoUploading] = useState(false)
  const { toast, showToast, clearToast } = useToast()

  const loadSettings = useCallback(async () => {
    setIsLoading(true)
    try {
      setForm(await getSiteSettings())
      setErrors({})
      setVideoError('')
    } catch (error) {
      showToast(error.message || 'โหลดการตั้งค่าหน้าแรกไม่สำเร็จ', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadSettings()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadSettings])

  useEffect(
    () => () => {
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl)
    },
    [videoPreviewUrl],
  )

  const update = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const updateHomepageVideo = (nextVideo) => {
    setForm((current) => ({
      ...current,
      homepageVideo: {
        ...emptyHomepageVideo,
        ...current.homepageVideo,
        ...nextVideo,
      },
    }))
  }

  const updateVideoText = (name, value) => {
    updateHomepageVideo({ [name]: value })
  }

  const updateVideoMode = (mode) => {
    setVideoError('')
    setVideoUploadProgress(0)

    if (mode === 'youtube') {
      updateHomepageVideo({
        source: 'youtube',
        url: form.homepageVideo.source === 'youtube' ? form.homepageVideo.url : '',
        secureUrl: form.homepageVideo.source === 'youtube' ? form.homepageVideo.url : '',
        publicId: '',
        resourceType: '',
        format: '',
        bytes: 0,
        duration: 0,
        originalFilename: '',
      })
      return
    }

    if (mode === 'cloudinary') {
      updateHomepageVideo({
        source: form.homepageVideo.source === 'cloudinary' ? 'cloudinary' : null,
        url: form.homepageVideo.source === 'cloudinary' ? form.homepageVideo.url : '',
        secureUrl: form.homepageVideo.source === 'cloudinary' ? form.homepageVideo.secureUrl : '',
      })
      return
    }

    updateHomepageVideo({ ...emptyHomepageVideo })
  }

  const validate = () => {
    const nextErrors = {}
    const homepageVideo = form.homepageVideo || emptyHomepageVideo

    if (!form.homeHeroImage?.trim()) nextErrors.homeHeroImage = 'กรุณาใส่ URL รูปหน้าปก'
    if (!form.homeHeroAlt?.trim()) nextErrors.homeHeroAlt = 'กรุณากรอกคำอธิบายรูปหน้าปก'

    if (homepageVideo.title?.length > 120) {
      nextErrors.video = 'หัวข้อวิดีโอต้องไม่เกิน 120 ตัวอักษร'
    }

    if (homepageVideo.description?.length > 500) {
      nextErrors.video = 'คำอธิบายวิดีโอต้องไม่เกิน 500 ตัวอักษร'
    }

    if (homepageVideo.source === 'youtube' && !homepageVideo.url?.trim()) {
      nextErrors.video = 'กรุณาใส่ URL YouTube'
    }

    if (homepageVideo.source === 'cloudinary' && !homepageVideo.publicId) {
      nextErrors.video = 'กรุณาอัปโหลดวิดีโอให้เสร็จก่อนบันทึก'
    }

    if (isVideoUploading || videoFile) {
      nextErrors.video = 'กรุณาอัปโหลดวิดีโอให้เสร็จก่อนบันทึก'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleHeroFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const error = validateImage(file)
    if (error) {
      setImageError(error)
      return
    }

    const dataUrl = await readFileAsDataUrl(file)
    setImageError('')
    setForm((current) => ({
      ...current,
      homeHeroImage: dataUrl,
      homeHeroAlt: current.homeHeroAlt || 'รูปหน้าปกบ้านจักรพันธุ์',
    }))
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
      const uploadedVideo = await uploadHomepageVideoToCloudinary({
        file: videoFile,
        onProgress: setVideoUploadProgress,
      })
      updateHomepageVideo({
        ...uploadedVideo,
        title: form.homepageVideo.title || '',
        description: form.homepageVideo.description || '',
      })
      setPendingUploadedPublicId(uploadedVideo.publicId)
      setVideoFile(null)
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl)
      setVideoPreviewUrl('')
      setVideoError('')
      showToast('อัปโหลดวิดีโอหน้าแรกเรียบร้อยแล้ว')
    } catch (error) {
      setVideoError(error.message || 'อัปโหลดวิดีโอไม่สำเร็จ')
      showToast(error.message || 'อัปโหลดวิดีโอไม่สำเร็จ', 'error')
    } finally {
      setIsVideoUploading(false)
    }
  }

  const clearVideo = async () => {
    const currentVideo = form.homepageVideo || emptyHomepageVideo

    if (pendingUploadedPublicId && currentVideo.publicId === pendingUploadedPublicId) {
      try {
        await deleteHomepageVideo(pendingUploadedPublicId)
      } catch (error) {
        showToast(error.message || 'ลบวิดีโอไม่สำเร็จ', 'error')
        return
      }
    }

    if (currentVideo.source && !pendingUploadedPublicId) {
      setIsSaving(true)
      try {
        const savedSettings = await saveSiteSettings({
          ...form,
          homepageVideo: { ...emptyHomepageVideo },
        })
        setForm(savedSettings)
        setErrors({})
        setVideoError('')
        showToast('ลบวิดีโอหน้าแรกเรียบร้อยแล้ว')
      } catch (error) {
        showToast(error.message || 'ลบวิดีโอไม่สำเร็จ', 'error')
      } finally {
        setIsSaving(false)
      }
      return
    }

    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl)
    setVideoFile(null)
    setVideoPreviewUrl('')
    setVideoUploadProgress(0)
    setPendingUploadedPublicId('')
    updateHomepageVideo({ ...emptyHomepageVideo })
    showToast('ล้างข้อมูลวิดีโอแล้ว กดบันทึกเพื่อปิดการแสดงผล')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) {
      showToast('กรุณาตรวจสอบข้อมูลหน้าแรก', 'error')
      return
    }

    setIsSaving(true)
    try {
      const savedSettings = await saveSiteSettings({
        ...form,
        homepageVideo: {
          ...form.homepageVideo,
          title: form.homepageVideo.title?.trim() || '',
          description: form.homepageVideo.description?.trim() || '',
          url: form.homepageVideo.url?.trim() || '',
        },
      })
      setForm(savedSettings)
      setPendingUploadedPublicId('')
      setErrors({})
      showToast('บันทึกการตั้งค่าหน้าแรกเรียบร้อยแล้ว')
    } catch (error) {
      if (
        pendingUploadedPublicId &&
        form.homepageVideo?.publicId === pendingUploadedPublicId
      ) {
        await deleteHomepageVideo(pendingUploadedPublicId).catch(() => {})
        setPendingUploadedPublicId('')
      }
      showToast(error.message || 'บันทึกการตั้งค่าไม่สำเร็จ', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    setIsSaving(true)
    try {
      const defaultSettings = await resetSiteSettings()
      setForm(defaultSettings)
      setErrors({})
      setImageError('')
      setVideoError('')
      setPendingUploadedPublicId('')
      showToast('คืนค่ารูปหน้าปกและปิดวิดีโอหน้าแรกแล้ว')
    } catch (error) {
      showToast(error.message || 'คืนค่าเริ่มต้นไม่สำเร็จ', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const homepageVideo = form.homepageVideo || emptyHomepageVideo
  const videoMode = getVideoMode(homepageVideo)

  if (isLoading) {
    return (
      <div className="rounded-lg bg-white p-8 text-center text-[#5e6256] shadow-sm">
        Loading...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={clearToast} />

      <div>
        <p className="text-sm font-bold uppercase text-[#0E4F52]">Settings</p>
        <h1 className="text-3xl font-extrabold text-[#0E4F52]">
          ตั้งค่าหน้าแรก
        </h1>
        <p className="mt-2 text-[#5e6256]">
          จัดการรูปหน้าปกและวิดีโอแนะนำบริษัทที่แสดงบนหน้าแรก
        </p>
      </div>

      <form className="grid gap-6" onSubmit={handleSubmit}>
        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-2 text-xl font-extrabold text-[#0E4F52]">
              <ImagePlus size={22} /> รูปหน้าปกหน้าแรก
            </div>
            <div className="grid gap-4">
              <FormInput
                label="URL รูปหน้าปก"
                name="homeHeroImage"
                value={form.homeHeroImage}
                error={errors.homeHeroImage}
                onChange={update}
                required
              />
              <FormInput
                label="คำอธิบายรูปหน้าปก"
                name="homeHeroAlt"
                value={form.homeHeroAlt}
                error={errors.homeHeroAlt}
                onChange={update}
                required
              />
              {imageError && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                  {imageError}
                </p>
              )}
              <label className="btn-ghost cursor-pointer justify-start">
                <Upload size={18} /> อัปโหลดรูปหน้าปก
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleHeroFile}
                  disabled={isSaving || isVideoUploading}
                />
              </label>
            </div>
          </div>

          <section className="rounded-lg bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-xl font-extrabold text-[#0E4F52]">
              ตัวอย่างหน้าปก
            </h2>
            <div className="aspect-[16/9] overflow-hidden rounded-lg border border-[#B28A55]/50 bg-[#EAF4F2]">
              <ImageWithFallback
                src={form.homeHeroImage}
                alt={form.homeHeroAlt || 'ตัวอย่างรูปหน้าปก'}
                className="h-full w-full object-cover"
              />
            </div>
          </section>
        </section>

        <section className="rounded-lg bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2 text-xl font-extrabold text-[#0E4F52]">
            <Film size={22} /> วิดีโอแนะนำบริษัท
          </div>

          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormInput
                label="หัวข้อวิดีโอ"
                value={homepageVideo.title}
                onChange={(event) => updateVideoText('title', event.target.value)}
              />
              <FormInput
                label="คำอธิบายวิดีโอ"
                value={homepageVideo.description}
                onChange={(event) => updateVideoText('description', event.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                ['cloudinary', 'อัปโหลดวิดีโอจากเครื่อง', Film],
                ['youtube', 'ใช้ URL YouTube', Video],
                ['none', 'ไม่แสดงวิดีโอ', XCircle],
              ].map(([mode, label, Icon]) => (
                <button
                  key={mode}
                  type="button"
                  className={`inline-flex min-h-10 items-center gap-2 rounded-md border px-3 py-2 text-sm font-extrabold transition ${
                    videoMode === mode
                      ? 'border-[#0E4F52] bg-[#EAF4F2] text-[#0E4F52]'
                      : 'border-[#0E4F52]/15 text-[#5e6256] hover:bg-[#EAF4F2]'
                  }`}
                  onClick={() => updateVideoMode(mode)}
                  disabled={isSaving || isVideoUploading}
                >
                  <Icon size={17} /> {label}
                </button>
              ))}
            </div>

            {(videoError || errors.video) && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                {videoError || errors.video}
              </p>
            )}

            {videoMode === 'youtube' && (
              <FormInput
                label="URL YouTube"
                value={homepageVideo.url}
                onChange={(event) =>
                  updateHomepageVideo({
                    source: 'youtube',
                    url: event.target.value,
                    secureUrl: event.target.value,
                    publicId: '',
                    resourceType: '',
                    format: '',
                    bytes: 0,
                    duration: 0,
                    originalFilename: '',
                  })
                }
                error={errors.video}
              />
            )}

            {videoMode === 'cloudinary' && (
              <div className="grid gap-4">
                {homepageVideo.source === 'cloudinary' && (
                  <div className="rounded-lg bg-[#EAF4F2] p-4">
                    <p className="font-extrabold text-[#0E4F52]">
                      {homepageVideo.originalFilename || 'วิดีโอแนะนำบริษัท'}
                    </p>
                    <p className="mt-1 text-sm text-[#5e6256]">
                      {homepageVideo.bytes
                        ? getVideoFileSummary({
                            name: homepageVideo.originalFilename || 'video',
                            size: homepageVideo.bytes,
                          })
                        : homepageVideo.format?.toUpperCase()}
                    </p>
                    <video
                      className="mt-3 aspect-video w-full rounded-lg bg-black"
                      src={homepageVideo.secureUrl || homepageVideo.url}
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
                    <Film size={18} />
                    {homepageVideo.source === 'cloudinary' ? 'เปลี่ยนวิดีโอ' : 'เลือกวิดีโอ'}
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,.mov"
                      className="sr-only"
                      onChange={handleVideoFile}
                      disabled={isSaving || isVideoUploading}
                    />
                  </label>
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={!videoFile || isSaving || isVideoUploading}
                    onClick={uploadSelectedVideo}
                  >
                    <Upload size={18} />
                    {isVideoUploading ? 'กำลังอัปโหลด' : 'อัปโหลดวิดีโอ'}
                  </button>
                  {(homepageVideo.source === 'cloudinary' || videoFile) && (
                    <button
                      type="button"
                      className="btn-ghost text-red-700"
                      onClick={clearVideo}
                      disabled={isSaving || isVideoUploading}
                    >
                      <Trash2 size={18} /> ลบวิดีโอ
                    </button>
                  )}
                </div>
              </div>
            )}

            {videoMode === 'none' && (
              <p className="rounded-lg bg-[#EAF4F2] p-4 text-sm font-bold text-[#5e6256]">
                หน้าแรกจะไม่แสดงส่วนวิดีโอแนะนำบริษัท
              </p>
            )}
          </div>
        </section>

        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            className="btn-ghost"
            onClick={handleReset}
            disabled={isSaving || isVideoUploading}
          >
            <RotateCcw size={18} /> คืนค่าเริ่มต้น
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSaving || isVideoUploading || Boolean(videoFile)}
          >
            <Save size={18} /> {isSaving ? 'กำลังบันทึก' : 'บันทึก'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminSettings
