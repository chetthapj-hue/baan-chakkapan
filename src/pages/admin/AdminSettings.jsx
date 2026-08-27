import { ImagePlus, RotateCcw, Save, Upload } from 'lucide-react'
import { useState } from 'react'
import FormInput from '../../components/FormInput'
import ImageWithFallback from '../../components/ImageWithFallback'
import Toast from '../../components/Toast'
import { useToast } from '../../hooks/useToast'
import {
  getSiteSettings,
  resetSiteSettings,
  saveSiteSettings,
} from '../../services/siteSettingsService'

const maxImageSize = 2 * 1024 * 1024

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

const AdminSettings = () => {
  const [form, setForm] = useState(() => getSiteSettings())
  const [errors, setErrors] = useState({})
  const [imageError, setImageError] = useState('')
  const { toast, showToast, clearToast } = useToast()

  const update = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const validate = () => {
    const nextErrors = {}
    if (!form.homeHeroImage?.trim()) nextErrors.homeHeroImage = 'กรุณาใส่ URL หรืออัปโหลดรูปหน้าปก'
    if (!form.homeHeroAlt?.trim()) nextErrors.homeHeroAlt = 'กรุณากรอกคำอธิบายรูป'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleHeroFile = async (event) => {
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
      homeHeroImage: dataUrl,
      homeHeroAlt: current.homeHeroAlt || 'รูปหน้าปกบ้านจักรพันธุ์',
    }))
    event.target.value = ''
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!validate()) {
      showToast('กรุณาตรวจสอบข้อมูลรูปหน้าปก', 'error')
      return
    }

    const savedSettings = saveSiteSettings(form)
    setForm(savedSettings)
    setErrors({})
    showToast('บันทึกรูปหน้าปกหน้าแรกเรียบร้อยแล้ว')
  }

  const handleReset = () => {
    const defaultSettings = resetSiteSettings()
    setForm(defaultSettings)
    setErrors({})
    setImageError('')
    showToast('คืนค่ารูปหน้าปกเริ่มต้นแล้ว')
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
          เปลี่ยนรูปหน้าปกที่แสดงบนหน้าแรกของเว็บไซต์
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <form className="rounded-lg bg-white p-5 shadow-sm" onSubmit={handleSubmit}>
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
              />
            </label>
            <div className="flex flex-wrap gap-3 pt-2">
              <button type="submit" className="btn-primary">
                <Save size={18} /> บันทึก
              </button>
              <button type="button" className="btn-ghost" onClick={handleReset}>
                <RotateCcw size={18} /> คืนค่าเริ่มต้น
              </button>
            </div>
          </div>
        </form>

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
          <p className="mt-4 text-sm leading-7 text-[#5e6256]">
            เมื่อบันทึกแล้ว หน้าแรกจะใช้รูปนี้เป็นภาพพื้นหลังส่วนหน้าปกทันที
          </p>
        </section>
      </div>
    </div>
  )
}

export default AdminSettings