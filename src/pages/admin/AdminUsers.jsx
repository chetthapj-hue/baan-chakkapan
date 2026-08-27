import { RefreshCw, Trash2, UserPlus, Users } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import ConfirmModal from '../../components/ConfirmModal'
import Toast from '../../components/Toast'
import { useToast } from '../../hooks/useToast'
import {
  createAdmin,
  deleteAdmin,
  getCurrentAdmin,
  getRoleLabel,
  isMainAdmin,
  listAdmins,
} from '../../services/adminUserService'

const emptyForm = {
  name: '',
  username: '',
  password: '',
}

const AdminUsers = () => {
  const currentAdmin = getCurrentAdmin()
  const canManageAdmins = isMainAdmin()
  const [admins, setAdmins] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [isLoading, setIsLoading] = useState(canManageAdmins)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const { toast, showToast, clearToast } = useToast()

  const loadAdmins = useCallback(
    async ({ showLoading = true } = {}) => {
      if (showLoading) setIsLoading(true)
      try {
        setAdmins(await listAdmins())
      } catch (error) {
        showToast(error.message || 'โหลดรายชื่อแอดมินไม่สำเร็จ', 'error')
      } finally {
        if (showLoading) setIsLoading(false)
      }
    },
    [showToast],
  )

  useEffect(() => {
    if (!canManageAdmins) return undefined

    let isMounted = true
    const loadInitialAdmins = async () => {
      try {
        const nextAdmins = await listAdmins()
        if (isMounted) setAdmins(nextAdmins)
      } catch (error) {
        if (isMounted) {
          showToast(error.message || 'โหลดรายชื่อแอดมินไม่สำเร็จ', 'error')
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadInitialAdmins()

    return () => {
      isMounted = false
    }
  }, [canManageAdmins, showToast])

  const updateForm = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.username.trim() || !form.password.trim()) {
      showToast('กรุณากรอก username และ password', 'error')
      return
    }
    if (form.password.length < 8) {
      showToast('password ต้องมีอย่างน้อย 8 ตัวอักษร', 'error')
      return
    }

    setIsSaving(true)
    try {
      await createAdmin(form)
      setForm(emptyForm)
      await loadAdmins({ showLoading: false })
      showToast('เพิ่มแอดมินรองเรียบร้อยแล้ว')
    } catch (error) {
      showToast(error.message || 'เพิ่มแอดมินไม่สำเร็จ', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    try {
      await deleteAdmin(deleteTarget.id)
      await loadAdmins({ showLoading: false })
      showToast('ลบแอดมินเรียบร้อยแล้ว')
    } catch (error) {
      showToast(error.message || 'ลบแอดมินไม่สำเร็จ', 'error')
    } finally {
      setDeleteTarget(null)
    }
  }

  if (!canManageAdmins) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <p className="text-sm font-bold uppercase text-[#0E4F52]">Admins</p>
        <h1 className="mt-1 text-3xl font-extrabold text-[#0E4F52]">จัดการแอดมิน</h1>
        <p className="mt-3 text-[#5e6256]">
          เมนูนี้ใช้งานได้เฉพาะเมนแอดมินเท่านั้น กรุณาออกจากระบบแล้วเข้าสู่ระบบใหม่
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={clearToast} />
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="ลบแอดมิน"
        message={
          deleteTarget
            ? `ต้องการลบแอดมิน ${deleteTarget.name || deleteTarget.username} ใช่ไหม`
            : ''
        }
        confirmLabel="ลบแอดมิน"
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase text-[#0E4F52]">Admins</p>
          <h1 className="text-3xl font-extrabold text-[#0E4F52]">จัดการแอดมิน</h1>
        </div>
        <button type="button" className="btn-ghost" onClick={() => loadAdmins()}>
          <RefreshCw size={18} /> รีเฟรช
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <form className="rounded-lg bg-white p-5 shadow-sm" onSubmit={handleSubmit}>
          <div className="mb-5 flex items-center gap-2 text-xl font-extrabold text-[#0E4F52]">
            <UserPlus size={22} /> เพิ่มแอดมินรอง
          </div>
          <div className="grid gap-4">
            <label className="grid gap-2 text-sm font-semibold text-[#0E4F52]">
              ชื่อแสดงผล
              <input
                className="form-field"
                name="name"
                value={form.name}
                onChange={updateForm}
                autoComplete="name"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-[#0E4F52]">
              Username
              <input
                className="form-field"
                name="username"
                value={form.username}
                onChange={updateForm}
                autoComplete="username"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-[#0E4F52]">
              Password
              <input
                className="form-field"
                type="password"
                name="password"
                value={form.password}
                onChange={updateForm}
                autoComplete="new-password"
                required
              />
            </label>
            <button type="submit" className="btn-primary" disabled={isSaving}>
              <UserPlus size={18} /> {isSaving ? 'กำลังบันทึก' : 'เพิ่มแอดมิน'}
            </button>
          </div>
        </form>

        <section className="rounded-lg bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2 text-xl font-extrabold text-[#0E4F52]">
            <Users size={22} /> รายชื่อแอดมิน
          </div>
          {isLoading ? (
            <p className="text-sm font-bold text-[#5e6256]">กำลังโหลดข้อมูล</p>
          ) : admins.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-separate border-spacing-0 text-left">
                <thead>
                  <tr className="text-sm text-[#5e6256]">
                    <th className="border-b border-[#0E4F52]/10 pb-3">ชื่อ</th>
                    <th className="border-b border-[#0E4F52]/10 pb-3">Username</th>
                    <th className="border-b border-[#0E4F52]/10 pb-3">สิทธิ์</th>
                    <th className="border-b border-[#0E4F52]/10 pb-3 text-right">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => {
                    const isCurrentAdmin = admin.id === currentAdmin?.id
                    const isMain = admin.role === 'main-admin'

                    return (
                      <tr key={admin.id} className="text-sm">
                        <td className="border-b border-[#0E4F52]/8 py-4 font-extrabold text-[#0E4F52]">
                          {admin.name || admin.username}
                        </td>
                        <td className="border-b border-[#0E4F52]/8 py-4 text-[#5e6256]">
                          {admin.username}
                        </td>
                        <td className="border-b border-[#0E4F52]/8 py-4">
                          <span className="rounded-full bg-[#EAF4F2] px-3 py-1 text-xs font-extrabold text-[#0E4F52]">
                            {getRoleLabel(admin.role)}
                          </span>
                        </td>
                        <td className="border-b border-[#0E4F52]/8 py-4 text-right">
                          <button
                            type="button"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-red-200 text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="ลบแอดมิน"
                            disabled={isCurrentAdmin || isMain}
                            onClick={() => setDeleteTarget(admin)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="rounded-lg bg-[#EAF4F2] p-4 text-sm font-bold text-[#0E4F52]">
              ยังไม่มีแอดมินในระบบ
            </p>
          )}
        </section>
      </div>
    </div>
  )
}

export default AdminUsers
