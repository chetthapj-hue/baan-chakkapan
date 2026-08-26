import { ShieldCheck, Trash2, UserPlus, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import ConfirmModal from '../../components/ConfirmModal'
import FormInput from '../../components/FormInput'
import Toast from '../../components/Toast'
import { useToast } from '../../hooks/useToast'
import {
  createAdmin,
  deleteAdmin,
  getAdmins,
  getCurrentAdmin,
  getRoleLabel,
  isMainAdmin,
} from '../../services/adminUserService'
import { formatDateThai } from '../../utils/formatters'

const initialForm = {
  name: '',
  username: '',
  password: '',
}

const AdminUsers = () => {
  const [admins, setAdmins] = useState(() => getAdmins())
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [deleteTarget, setDeleteTarget] = useState(null)
  const { toast, showToast, clearToast } = useToast()
  const currentAdmin = getCurrentAdmin()
  const canManageAdmins = isMainAdmin()

  const adminStats = useMemo(
    () => ({
      total: admins.length,
      regular: admins.filter((admin) => admin.role !== 'main-admin').length,
    }),
    [admins],
  )

  const refresh = () => {
    setAdmins(getAdmins())
  }

  const update = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const validate = () => {
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'กรุณากรอกชื่อแอดมิน'
    if (!form.username.trim()) nextErrors.username = 'กรุณากรอก Username'
    if (!form.password.trim()) nextErrors.password = 'กรุณากรอก Password'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!validate()) return

    try {
      createAdmin(form)
      refresh()
      setForm(initialForm)
      setErrors({})
      showToast('เพิ่มแอดมินเรียบร้อยแล้ว')
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const confirmDelete = () => {
    if (!deleteTarget) return

    try {
      deleteAdmin(deleteTarget.id)
      refresh()
      showToast(`ลบ ${deleteTarget.name} แล้ว`)
      setDeleteTarget(null)
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  if (!canManageAdmins) {
    return (
      <div className="space-y-6">
        <Toast toast={toast} onClose={clearToast} />
        <div>
          <p className="text-sm font-bold uppercase text-[#0E4F52]">Admins</p>
          <h1 className="text-3xl font-extrabold text-[#0E4F52]">จัดการแอดมิน</h1>
        </div>
        <section className="rounded-lg bg-white p-8 text-center shadow-sm">
          <ShieldCheck className="mx-auto text-[#0E4F52]" size={42} />
          <h2 className="mt-4 text-2xl font-extrabold text-[#0E4F52]">
            เฉพาะเมนแอดมินเท่านั้น
          </h2>
          <p className="mt-2 text-[#5e6256]">
            บัญชี {currentAdmin?.name || currentAdmin?.username || 'แอดมิน'} ไม่มีสิทธิ์จัดการแอดมิน
          </p>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={clearToast} />
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="ยืนยันการลบแอดมิน"
        message={`ต้องการลบ ${deleteTarget?.name || ''} ออกจากระบบ mock หรือไม่`}
        confirmLabel="ลบแอดมิน"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />

      <div>
        <p className="text-sm font-bold uppercase text-[#0E4F52]">Admins</p>
        <h1 className="text-3xl font-extrabold text-[#0E4F52]">จัดการแอดมิน</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg bg-white p-5 shadow-sm">
          <Users className="mb-4 text-[#0E4F52]" size={26} />
          <p className="text-3xl font-extrabold text-[#0E4F52]">{adminStats.total}</p>
          <p className="mt-1 text-sm text-[#5e6256]">แอดมินทั้งหมด</p>
        </div>
        <div className="rounded-lg bg-white p-5 shadow-sm">
          <UserPlus className="mb-4 text-[#0E4F52]" size={26} />
          <p className="text-3xl font-extrabold text-[#0E4F52]">{adminStats.regular}</p>
          <p className="mt-1 text-sm text-[#5e6256]">แอดมินที่เพิ่มใหม่</p>
        </div>
      </div>

      <form className="grid gap-4 rounded-lg bg-white p-5 shadow-sm" onSubmit={handleSubmit}>
        <h2 className="text-xl font-extrabold text-[#0E4F52]">เพิ่มแอดมิน</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <FormInput
            label="ชื่อแอดมิน"
            name="name"
            value={form.name}
            error={errors.name}
            onChange={update}
            required
          />
          <FormInput
            label="Username"
            name="username"
            value={form.username}
            error={errors.username}
            onChange={update}
            required
          />
          <FormInput
            label="Password"
            type="password"
            name="password"
            value={form.password}
            error={errors.password}
            onChange={update}
            required
          />
        </div>
        <button type="submit" className="btn-primary w-fit">
          <UserPlus size={18} /> สร้างแอดมิน
        </button>
      </form>

      <section className="rounded-lg bg-white p-5 shadow-sm">
        <h2 className="text-xl font-extrabold text-[#0E4F52]">รายชื่อแอดมิน</h2>
        <div className="mt-5 grid gap-3">
          {admins.map((admin) => (
            <article
              key={admin.id}
              className="grid gap-3 rounded-lg border border-[#0E4F52]/10 p-4 md:grid-cols-[1fr_auto_auto] md:items-center"
            >
              <div>
                <p className="font-extrabold text-[#0E4F52]">{admin.name}</p>
                <p className="mt-1 text-sm text-[#5e6256]">
                  Username: {admin.username} • เพิ่มเมื่อ {formatDateThai(admin.createdAt)}
                </p>
              </div>
              <span className="rounded-full bg-[#EAF4F2] px-3 py-1 text-xs font-extrabold text-[#0E4F52]">
                {getRoleLabel(admin.role)}
              </span>
              <button
                type="button"
                className="btn-ghost px-3 text-red-700"
                aria-label={`ลบ ${admin.name}`}
                disabled={admin.role === 'main-admin'}
                onClick={() => setDeleteTarget(admin)}
              >
                <Trash2 size={18} />
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default AdminUsers
