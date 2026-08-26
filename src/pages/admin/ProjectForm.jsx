import { ImagePlus, Save, Trash2, Upload } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import FormInput from '../../components/FormInput'
import ImageWithFallback from '../../components/ImageWithFallback'
import Toast from '../../components/Toast'
import { FALLBACK_IMAGE, projectStatuses, projectTypes } from '../../data/mockData'
import { useProjects } from '../../hooks/useProjects'
import { useToast } from '../../hooks/useToast'
import { getProjectById } from '../../services/projectService'
import { createSlug, formatPriceShort } from '../../utils/formatters'

const maxImageSize = 2 * 1024 * 1024

const emptyProject = {
  title: '',
  slug: '',
  type: projectTypes[0],
  status: projectStatuses[0],
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
  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  coverImage: '',
  coverAlt: '',
  gallery: [],
}

const normalizeProjectForForm = (project) => ({
  ...emptyProject,
  ...project,
  priceValue: project.priceValue || '',
  highlightsText: (project.highlights || []).join('\n'),
})

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const validateImage = (file) => {
  if (!file.type.startsWith('image/')) return 'รองรับเฉพาะไฟล์รูปภาพ'
  if (file.size > maxImageSize) return 'รูปภาพต้องไม่เกิน 2 MB'
  return ''
}

const ProjectForm = ({ mode }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { save } = useProjects()
  const { toast, showToast, clearToast } = useToast()
  const [editingProject, setEditingProject] = useState(null)
  const [loadingProject, setLoadingProject] = useState(mode === 'edit')
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState(emptyProject)
  const [errors, setErrors] = useState({})
  const [imageError, setImageError] = useState('')

  useEffect(() => {
    let active = true

    const timeoutId = window.setTimeout(() => {
      if (mode !== 'edit' || !id) {
        setEditingProject(null)
        setForm(emptyProject)
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
  }, [id, mode])

  const update = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleChange = (event) => {
    const { name, value } = event.target
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
    if (!form.coverImage.trim()) nextErrors.coverImage = 'กรุณาใส่ URL หรืออัปโหลดรูปปก'
    if (!form.coverAlt.trim()) nextErrors.coverAlt = 'กรุณากรอก alt text รูปปก'
    if (!form.highlightsText.trim()) nextErrors.highlightsText = 'กรุณากรอกจุดเด่นอย่างน้อย 1 รายการ'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleCoverFile = async (event) => {
    const file = event.target.files?.[0]
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
      coverImage: dataUrl,
      coverAlt: current.coverAlt || `รูปปก ${current.title || 'ผลงานบ้าน'}`,
    }))
  }

  const handleGalleryFiles = async (event) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return
    if (form.gallery.length + files.length > 10) {
      setImageError('จำกัดรูป Gallery ไม่เกิน 10 รูป')
      return
    }

    const invalid = files.map(validateImage).find(Boolean)
    if (invalid) {
      setImageError(invalid)
      return
    }

    const images = await Promise.all(
      files.map(async (file, index) => ({
        url: await readFileAsDataUrl(file),
        alt: `${form.title || 'ผลงานบ้าน'} รูปที่ ${form.gallery.length + index + 1}`,
      })),
    )
    setImageError('')
    setForm((current) => ({
      ...current,
      gallery: [...current.gallery, ...images],
    }))
  }

  const removeGalleryImage = (index) => {
    setForm((current) => ({
      ...current,
      gallery: current.gallery.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  const setAsCover = (image) => {
    setForm((current) => ({
      ...current,
      coverImage: image.url,
      coverAlt: image.alt,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) {
      showToast('กรุณาตรวจสอบข้อมูลที่จำเป็น', 'error')
      return
    }

    const payload = {
      ...form,
      id: editingProject?.id || form.slug,
      priceValue: Number(form.priceValue),
      area: Number(form.area),
      floors: Number(form.floors),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      parking: Number(form.parking),
      coverImage: form.coverImage || FALLBACK_IMAGE,
      highlights: form.highlightsText
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),
      gallery: form.gallery.length
        ? form.gallery
        : [{ url: form.coverImage, alt: form.coverAlt }],
    }

    setIsSaving(true)
    try {
      await save(payload)
      showToast(mode === 'edit' ? 'บันทึกการแก้ไขแล้ว' : 'เพิ่มผลงานใหม่แล้ว')
      window.setTimeout(() => navigate('/admin/projects'), 700)
    } catch {
      showToast('บันทึกไม่สำเร็จ กรุณาลองใหม่', 'error')
    } finally {
      setIsSaving(false)
    }
  }

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
              <select
                className="form-field"
                name="type"
                value={form.type}
                onChange={handleChange}
              >
                {projectTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </FormInput>
            <FormInput label="สถานะงาน" error={errors.status} required>
              <select
                className="form-field"
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                {projectStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
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
            <FormInput
              label="URL วิดีโอ YouTube"
              name="videoUrl"
              value={form.videoUrl}
              onChange={handleChange}
            />
          </div>
        </section>

        <section className="rounded-lg bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-extrabold text-[#0E4F52]">รูปภาพ</h2>
              <p className="mt-1 text-sm text-[#5e6256]">
                Mock จะเก็บรูปเป็น Data URL ใน localStorage เท่านั้น Production ควรใช้ Cloudinary หรือระบบเก็บไฟล์จริง
              </p>
            </div>
          </div>
          {imageError && (
            <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
              {imageError}
            </p>
          )}
          <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="space-y-4">
              <div className="aspect-[4/3] overflow-hidden rounded-lg bg-[#EAF4F2]">
                <ImageWithFallback
                  src={form.coverImage}
                  alt={form.coverAlt || 'ตัวอย่างรูปปก'}
                  className="h-full w-full object-cover"
                />
              </div>
              <FormInput
                label="URL รูปปก"
                name="coverImage"
                value={form.coverImage}
                error={errors.coverImage}
                onChange={handleChange}
                required
              />
              <FormInput
                label="Alt text รูปปก"
                name="coverAlt"
                value={form.coverAlt}
                error={errors.coverAlt}
                onChange={handleChange}
                required
              />
              <label className="btn-ghost cursor-pointer justify-start">
                <Upload size={18} /> อัปโหลดรูปปก
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleCoverFile}
                />
              </label>
            </div>

            <div>
              <label className="btn-ghost mb-4 cursor-pointer">
                <ImagePlus size={18} /> เพิ่มรูป Gallery
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={handleGalleryFiles}
                />
              </label>
              <div className="grid gap-3 md:grid-cols-3">
                {form.gallery.map((image, index) => (
                  <div key={`${image.url}-${index}`} className="rounded-lg border border-[#0E4F52]/10 p-2">
                    <div className="aspect-[4/3] overflow-hidden rounded-md bg-[#EAF4F2]">
                      <ImageWithFallback
                        src={image.url}
                        alt={image.alt}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs text-[#5e6256]">
                      {image.alt}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        className="btn-ghost min-h-9 px-2 text-xs"
                        onClick={() => setAsCover(image)}
                      >
                        ตั้งเป็นรูปปก
                      </button>
                      <button
                        type="button"
                        className="btn-ghost min-h-9 px-2 text-red-700"
                        aria-label="ลบรูป Gallery"
                        onClick={() => removeGalleryImage(index)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap justify-end gap-3">
          <Link to="/admin/projects" className="btn-ghost">
            ยกเลิก
          </Link>
          <button type="submit" className="btn-primary" disabled={isSaving}>
            <Save size={18} /> บันทึกผลงาน
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProjectForm




