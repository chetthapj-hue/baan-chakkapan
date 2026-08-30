import { Eye, EyeOff, KeyRound, Save } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../../components/Logo'
import Toast from '../../components/Toast'
import { useToast } from '../../hooks/useToast'
import {
  changePassword,
  logoutAdmin,
  isPasswordChangeRequired,
} from '../../services/authService'

const emptyForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

const passwordRules = [
  'อย่างน้อย 10 ตัวอักษร',
  'มีตัวอักษรอย่างน้อย 1 ตัว',
  'มีตัวเลขอย่างน้อย 1 ตัว',
  'ต้องไม่ซ้ำกับรหัสผ่านเดิม',
]

const validateForm = (form) => {
  if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
    return 'กรุณากรอกรหัสผ่านให้ครบถ้วน'
  }

  if (form.newPassword.length < 10) {
    return 'รหัสผ่านใหม่ต้องมีอย่างน้อย 10 ตัวอักษร'
  }

  if (!/\p{L}/u.test(form.newPassword) || !/\d/u.test(form.newPassword)) {
    return 'รหัสผ่านใหม่ต้องมีทั้งตัวอักษรและตัวเลข'
  }

  if (form.newPassword !== form.confirmPassword) {
    return 'รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน'
  }

  if (form.currentPassword === form.newPassword) {
    return 'รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม'
  }

  return ''
}

const AdminChangePassword = () => {
  const [form, setForm] = useState(emptyForm)
  const [showPasswords, setShowPasswords] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast, showToast, clearToast } = useToast()
  const navigate = useNavigate()
  const mustChangePassword = isPasswordChangeRequired()

  const updateForm = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationError = validateForm(form)
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)
    try {
      await changePassword(form)
      setForm(emptyForm)
      showToast('เปลี่ยนรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบใหม่')
      window.setTimeout(() => {
        logoutAdmin()
        navigate('/admin/login', { replace: true })
      }, 700)
    } catch (requestError) {
      setError(requestError.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ')
      showToast(requestError.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F3EA] px-4 py-10">
      <Toast toast={toast} onClose={clearToast} />
      <section className="mx-auto w-full max-w-xl rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-6">
          <Logo />
        </div>

        <div className="mb-6">
          <p className="text-sm font-bold uppercase text-[#0E4F52]">Security</p>
          <h1 className="mt-1 flex items-center gap-2 text-3xl font-extrabold text-[#0E4F52]">
            <KeyRound size={28} /> เปลี่ยนรหัสผ่าน
          </h1>
          {mustChangePassword && (
            <p className="mt-3 rounded-md bg-[#FFF3D6] px-4 py-3 text-sm font-bold text-[#7A4B00]">
              บัญชีนี้ใช้รหัสผ่านชั่วคราว กรุณาตั้งรหัสผ่านใหม่ก่อนใช้งานระบบ
            </p>
          )}
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-semibold text-[#0E4F52]">
            รหัสผ่านปัจจุบัน
            <input
              className="form-field"
              type={showPasswords ? 'text' : 'password'}
              name="currentPassword"
              value={form.currentPassword}
              onChange={updateForm}
              autoComplete="current-password"
              required
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-[#0E4F52]">
            รหัสผ่านใหม่
            <input
              className="form-field"
              type={showPasswords ? 'text' : 'password'}
              name="newPassword"
              value={form.newPassword}
              onChange={updateForm}
              autoComplete="new-password"
              required
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-[#0E4F52]">
            ยืนยันรหัสผ่านใหม่
            <input
              className="form-field"
              type={showPasswords ? 'text' : 'password'}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={updateForm}
              autoComplete="new-password"
              required
            />
          </label>

          <button
            type="button"
            className="btn-ghost w-fit"
            onClick={() => setShowPasswords((value) => !value)}
          >
            {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
            {showPasswords ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
          </button>

          <div className="rounded-md bg-[#EAF4F2] p-4 text-sm text-[#0E4F52]">
            <p className="font-extrabold">เงื่อนไขรหัสผ่าน</p>
            <ul className="mt-2 grid gap-1">
              {passwordRules.map((rule) => (
                <li key={rule}>- {rule}</li>
              ))}
            </ul>
          </div>

          {error && <p className="text-sm font-bold text-red-600">{error}</p>}

          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            <Save size={18} /> {isSubmitting ? 'กำลังบันทึก' : 'บันทึกรหัสผ่านใหม่'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default AdminChangePassword
