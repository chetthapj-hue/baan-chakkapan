import {
  Copy,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react'
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
  listAdminAuditLogs,
  listAdmins,
  resetAdminPassword,
} from '../../services/adminUserService'

const emptyForm = {
  name: '',
  username: '',
  password: '',
}

const formatDateTime = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleString('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

const getAuditActionLabel = (action) => {
  if (action === 'PASSWORD_CHANGED') return 'เปลี่ยนรหัสผ่าน'
  if (action === 'PASSWORD_RESET') return 'รีเซ็ตรหัสผ่าน'
  return action || '-'
}

const validatePassword = (password) => {
  if (password.length < 10) return 'Password ต้องมีอย่างน้อย 10 ตัวอักษร'
  if (!/\p{L}/u.test(password) || !/\d/u.test(password)) {
    return 'Password ต้องมีทั้งตัวอักษรและตัวเลข'
  }
  return ''
}

const AdminUsers = () => {
  const currentAdmin = getCurrentAdmin()
  const canManageAdmins = isMainAdmin()
  const [admins, setAdmins] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [isLoading, setIsLoading] = useState(canManageAdmins)
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [resetTarget, setResetTarget] = useState(null)
  const [resetPassword, setResetPassword] = useState('')
  const [resetResult, setResetResult] = useState(null)
  const { toast, showToast, clearToast } = useToast()

  const loadAdmins = useCallback(
    async ({ showLoading = true } = {}) => {
      if (showLoading) setIsLoading(true)
      try {
        const [nextAdmins, nextAuditLogs] = await Promise.all([
          listAdmins(),
          listAdminAuditLogs(),
        ])
        setAdmins(nextAdmins)
        setAuditLogs(nextAuditLogs)
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
        const [nextAdmins, nextAuditLogs] = await Promise.all([
          listAdmins(),
          listAdminAuditLogs(),
        ])
        if (isMounted) {
          setAdmins(nextAdmins)
          setAuditLogs(nextAuditLogs)
        }
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

    const passwordError = validatePassword(form.password)
    if (passwordError) {
      showToast(passwordError, 'error')
      return
    }

    setIsSaving(true)
    try {
      await createAdmin({
        ...form,
        username: form.username.trim(),
        name: form.name.trim(),
      })
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

  const openResetModal = (admin) => {
    setResetTarget(admin)
    setResetPassword('')
  }

  const closeResetModal = () => {
    if (isResetting) return
    setResetTarget(null)
    setResetPassword('')
  }

  const handleResetPassword = async (event) => {
    event.preventDefault()
    if (!resetTarget || !resetPassword.trim()) {
      showToast('กรุณากรอกรหัสผ่านของเมนแอดมินเพื่อยืนยัน', 'error')
      return
    }

    setIsResetting(true)
    try {
      const result = await resetAdminPassword(resetTarget.id, resetPassword)
      setResetResult({
        username: result.username || resetTarget.username,
        temporaryPassword: result.temporaryPassword,
      })
      setResetTarget(null)
      setResetPassword('')
      await loadAdmins({ showLoading: false })
      showToast('รีเซ็ตรหัสผ่านเรียบร้อยแล้ว')
    } catch (error) {
      showToast(error.message || 'รีเซ็ตรหัสผ่านไม่สำเร็จ', 'error')
    } finally {
      setIsResetting(false)
    }
  }

  const closeResetResult = () => {
    setResetResult(null)
  }

  const copyTemporaryPassword = async () => {
    if (!resetResult?.temporaryPassword) return

    try {
      await navigator.clipboard.writeText(resetResult.temporaryPassword)
      showToast('คัดลอกรหัสผ่านชั่วคราวแล้ว')
    } catch {
      showToast('คัดลอกไม่สำเร็จ กรุณาคัดลอกด้วยตัวเอง', 'error')
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

      {resetTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="รีเซ็ตรหัสผ่าน"
        >
          <form
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl"
            onSubmit={handleResetPassword}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#0E4F52]">
                  รีเซ็ตรหัสผ่าน
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#5e6256]">
                  บัญชี {resetTarget.name || resetTarget.username} จะได้รับรหัสผ่านชั่วคราว
                  และต้องเปลี่ยนรหัสเมื่อเข้าสู่ระบบครั้งถัดไป
                </p>
              </div>
              <button
                type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#0E4F52]/15 text-[#0E4F52]"
                aria-label="ปิดหน้าต่างรีเซ็ตรหัสผ่าน"
                onClick={closeResetModal}
              >
                <XCircle size={18} />
              </button>
            </div>

            <label className="grid gap-2 text-sm font-semibold text-[#0E4F52]">
              รหัสผ่านของเมนแอดมิน
              <input
                className="form-field"
                type="password"
                value={resetPassword}
                onChange={(event) => setResetPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </label>

            <div className="mt-5 flex justify-end gap-3">
              <button type="button" className="btn-ghost" onClick={closeResetModal}>
                ยกเลิก
              </button>
              <button type="submit" className="btn-primary" disabled={isResetting}>
                <RotateCcw size={18} /> {isResetting ? 'กำลังรีเซ็ต' : 'รีเซ็ต'}
              </button>
            </div>
          </form>
        </div>
      )}

      {resetResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="รหัสผ่านชั่วคราว"
        >
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#0E4F52]">
                  รหัสผ่านชั่วคราว
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#5e6256]">
                  แสดงได้ครั้งเดียว กรุณาส่งให้เจ้าของบัญชีผ่านช่องทางส่วนตัว
                </p>
              </div>
              <button
                type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#0E4F52]/15 text-[#0E4F52]"
                aria-label="ปิดหน้าต่างรหัสผ่านชั่วคราว"
                onClick={closeResetResult}
              >
                <XCircle size={18} />
              </button>
            </div>

            <div className="grid gap-3 rounded-md bg-[#EAF4F2] p-4 text-[#0E4F52]">
              <p className="text-sm">
                Username: <strong>{resetResult.username}</strong>
              </p>
              <code className="break-all rounded-md bg-white px-3 py-2 text-base font-extrabold">
                {resetResult.temporaryPassword}
              </code>
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <button type="button" className="btn-ghost" onClick={copyTemporaryPassword}>
                <Copy size={18} /> Copy
              </button>
              <button type="button" className="btn-primary" onClick={closeResetResult}>
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

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
            <p className="rounded-md bg-[#EAF4F2] px-4 py-3 text-sm font-bold text-[#0E4F52]">
              Password ต้องมีอย่างน้อย 10 ตัวอักษร และมีทั้งตัวอักษรกับตัวเลข
            </p>
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
              <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left">
                <thead>
                  <tr className="text-sm text-[#5e6256]">
                    <th className="border-b border-[#0E4F52]/10 pb-3">ชื่อ</th>
                    <th className="border-b border-[#0E4F52]/10 pb-3">Username</th>
                    <th className="border-b border-[#0E4F52]/10 pb-3">สิทธิ์</th>
                    <th className="border-b border-[#0E4F52]/10 pb-3">สถานะรหัส</th>
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
                        <td className="border-b border-[#0E4F52]/8 py-4">
                          {admin.mustChangePassword ? (
                            <span className="rounded-full bg-[#FFF3D6] px-3 py-1 text-xs font-extrabold text-[#7A4B00]">
                              ต้องเปลี่ยนรหัส
                            </span>
                          ) : (
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700">
                              ปกติ
                            </span>
                          )}
                        </td>
                        <td className="border-b border-[#0E4F52]/8 py-4">
                          <div className="flex justify-end gap-2">
                            {!isCurrentAdmin && (
                              <button
                                type="button"
                                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#0E4F52]/15 text-[#0E4F52] transition hover:bg-[#EAF4F2]"
                                aria-label="รีเซ็ตรหัสผ่าน"
                                onClick={() => openResetModal(admin)}
                              >
                                <RotateCcw size={18} />
                              </button>
                            )}
                            <button
                              type="button"
                              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-red-200 text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label="ลบแอดมิน"
                              disabled={isCurrentAdmin || isMain}
                              onClick={() => setDeleteTarget(admin)}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
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

      <section className="rounded-lg bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-2 text-xl font-extrabold text-[#0E4F52]">
          <ShieldCheck size={22} /> ประวัติความปลอดภัย
        </div>
        {isLoading ? (
          <p className="text-sm font-bold text-[#5e6256]">กำลังโหลดข้อมูล</p>
        ) : auditLogs.length ? (
          <div className="grid gap-3">
            {auditLogs.slice(0, 20).map((log) => (
              <div
                key={log.id}
                className="rounded-md border border-[#0E4F52]/10 p-4 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-extrabold text-[#0E4F52]">
                    {getAuditActionLabel(log.action)}
                  </p>
                  <p className="text-xs font-bold text-[#5e6256]">
                    {formatDateTime(log.createdAt)}
                  </p>
                </div>
                <p className="mt-2 text-[#5e6256]">
                  ผู้ทำรายการ: {log.actorUsername || log.actorAdminId || '-'} / บัญชีเป้าหมาย:{' '}
                  {log.targetUsername || log.targetAdminId || '-'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-lg bg-[#EAF4F2] p-4 text-sm font-bold text-[#0E4F52]">
            ยังไม่มีประวัติการเปลี่ยนหรือรีเซ็ตรหัสผ่าน
          </p>
        )}
      </section>
    </div>
  )
}

export default AdminUsers
