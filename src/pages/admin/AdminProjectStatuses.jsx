import {
  ArrowDown,
  ArrowUp,
  Edit3,
  ListChecks,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import ConfirmModal from '../../components/ConfirmModal'
import StatusBadge from '../../components/StatusBadge'
import Toast from '../../components/Toast'
import { useToast } from '../../hooks/useToast'
import { isMainAdmin } from '../../services/adminUserService'
import {
  createProjectStatus,
  createProjectStatusSlug,
  deleteProjectStatus,
  getAdminProjectStatuses,
  reorderProjectStatuses,
  toggleProjectStatus,
  updateProjectStatus,
} from '../../services/projectStatusService'

const defaultForm = {
  name: '',
  slug: '',
  color: '#0E4F52',
  isActive: true,
}

const AdminProjectStatuses = () => {
  const [statuses, setStatuses] = useState([])
  const [form, setForm] = useState(defaultForm)
  const [slugTouched, setSlugTouched] = useState(false)
  const [editingStatus, setEditingStatus] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { toast, showToast, clearToast } = useToast()
  const canManage = isMainAdmin()

  const loadStatuses = useCallback(
    async ({ showLoading = true } = {}) => {
      if (showLoading) setIsLoading(true)
      try {
        setStatuses(await getAdminProjectStatuses())
        setError('')
      } catch (loadError) {
        const message = loadError.message || 'โหลดสถานะงานไม่สำเร็จ'
        setError(message)
        showToast(message, 'error')
      } finally {
        if (showLoading) setIsLoading(false)
      }
    },
    [showToast],
  )

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadStatuses()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [loadStatuses])

  const resetForm = () => {
    setForm(defaultForm)
    setSlugTouched(false)
    setEditingStatus(null)
  }

  const updateName = (name) => {
    setForm((current) => ({
      ...current,
      name,
      slug: slugTouched ? current.slug : createProjectStatusSlug(name),
    }))
  }

  const updateSlug = (slug) => {
    setSlugTouched(true)
    setForm((current) => ({ ...current, slug: createProjectStatusSlug(slug) }))
  }

  const handleEdit = (status) => {
    setEditingStatus(status)
    setSlugTouched(true)
    setForm({
      name: status.name,
      slug: status.slug,
      color: status.color || '#0E4F52',
      isActive: Boolean(status.isActive),
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!canManage) return

    const trimmedName = form.name.trim()
    const trimmedSlug = createProjectStatusSlug(form.slug || trimmedName)

    if (!trimmedName) {
      showToast('กรุณากรอกชื่อสถานะงาน', 'error')
      return
    }
    if (!trimmedSlug) {
      showToast('กรุณากรอก Slug สถานะงาน', 'error')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        ...form,
        name: trimmedName,
        slug: trimmedSlug,
        sortOrder: editingStatus?.sortOrder ?? statuses.length,
      }
      if (editingStatus) {
        await updateProjectStatus(editingStatus.id, payload)
        showToast('แก้ไขสถานะงานเรียบร้อยแล้ว')
      } else {
        await createProjectStatus(payload)
        showToast('เพิ่มสถานะงานเรียบร้อยแล้ว')
      }

      resetForm()
      await loadStatuses({ showLoading: false })
    } catch (submitError) {
      showToast(submitError.message || 'บันทึกสถานะงานไม่สำเร็จ', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggle = async (status) => {
    if (!canManage) return
    setIsSubmitting(true)
    try {
      await toggleProjectStatus(status.id)
      await loadStatuses({ showLoading: false })
      showToast(status.isActive ? 'ปิดใช้งานสถานะงานแล้ว' : 'เปิดใช้งานสถานะงานแล้ว')
    } catch (toggleError) {
      showToast(toggleError.message || 'เปลี่ยนสถานะใช้งานไม่สำเร็จ', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget || !canManage) return
    setIsSubmitting(true)
    try {
      await deleteProjectStatus(deleteTarget.id)
      setDeleteTarget(null)
      await loadStatuses({ showLoading: false })
      showToast('ลบสถานะงานเรียบร้อยแล้ว')
    } catch (deleteError) {
      showToast(deleteError.message || 'ลบสถานะงานไม่สำเร็จ', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const moveStatus = async (index, direction) => {
    if (!canManage) return
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= statuses.length) return

    const orderedStatuses = [...statuses]
    const [item] = orderedStatuses.splice(index, 1)
    orderedStatuses.splice(nextIndex, 0, item)

    setStatuses(orderedStatuses)
    setIsSubmitting(true)
    try {
      await reorderProjectStatuses(orderedStatuses.map((status) => status.id))
      await loadStatuses({ showLoading: false })
      showToast('จัดลำดับสถานะงานเรียบร้อยแล้ว')
    } catch (reorderError) {
      showToast(reorderError.message || 'จัดลำดับสถานะงานไม่สำเร็จ', 'error')
      await loadStatuses({ showLoading: false })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={clearToast} />
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="ลบสถานะงาน"
        message={
          deleteTarget
            ? `ต้องการลบสถานะงาน ${deleteTarget.name} ใช่ไหม หากมีผลงานใช้งานอยู่ระบบจะไม่อนุญาตให้ลบ`
            : ''
        }
        confirmLabel="ลบสถานะงาน"
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase text-[#0E4F52]">Project Statuses</p>
          <h1 className="text-3xl font-extrabold text-[#0E4F52]">
            จัดการสถานะงาน
          </h1>
        </div>
        <button type="button" className="btn-ghost" onClick={() => loadStatuses()}>
          <RefreshCw size={18} /> รีเฟรช
        </button>
      </div>

      {!canManage && (
        <p className="rounded-lg bg-[#EAF4F2] p-4 text-sm font-bold text-[#0E4F52]">
          บัญชีนี้ดูรายการสถานะงานได้ แต่การเพิ่ม แก้ไข ลบ และจัดลำดับสำหรับเมนแอดมินเท่านั้น
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <form className="rounded-lg bg-white p-5 shadow-sm" onSubmit={handleSubmit}>
          <div className="mb-5 flex items-center gap-2 text-xl font-extrabold text-[#0E4F52]">
            <ListChecks size={22} />
            {editingStatus ? 'แก้ไขสถานะงาน' : 'เพิ่มสถานะงาน'}
          </div>
          <div className="grid gap-4">
            <label className="grid gap-2 text-sm font-semibold text-[#0E4F52]">
              ชื่อสถานะงาน
              <input
                className="form-field"
                value={form.name}
                onChange={(event) => updateName(event.target.value)}
                maxLength={80}
                disabled={!canManage || isSubmitting}
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-[#0E4F52]">
              Slug
              <input
                className="form-field"
                value={form.slug}
                onChange={(event) => updateSlug(event.target.value)}
                maxLength={100}
                disabled={!canManage || isSubmitting}
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-[#0E4F52]">
              สี Badge
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  className="h-11 w-16 rounded-md border border-[#0E4F52]/15 bg-white"
                  value={form.color}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, color: event.target.value }))
                  }
                  disabled={!canManage || isSubmitting}
                />
                <input
                  className="form-field"
                  value={form.color}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, color: event.target.value }))
                  }
                  disabled={!canManage || isSubmitting}
                />
              </div>
            </label>
            <label className="flex items-center gap-3 text-sm font-bold text-[#0E4F52]">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  setForm((current) => ({ ...current, isActive: event.target.checked }))
                }
                disabled={!canManage || isSubmitting}
              />
              เปิดใช้งานในฟอร์มและตัวกรองหน้าเว็บ
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="submit"
              className="btn-primary"
              disabled={!canManage || isSubmitting}
            >
              {editingStatus ? <Save size={18} /> : <Plus size={18} />}
              {editingStatus ? 'บันทึกสถานะ' : 'เพิ่มสถานะ'}
            </button>
            {editingStatus && (
              <button
                type="button"
                className="btn-ghost"
                onClick={resetForm}
                disabled={isSubmitting}
              >
                <X size={18} /> ยกเลิก
              </button>
            )}
          </div>
        </form>

        <section className="rounded-lg bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2 text-xl font-extrabold text-[#0E4F52]">
            <ListChecks size={22} /> รายการสถานะงาน
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-4">
              <p className="text-sm font-bold text-red-700">{error}</p>
              <button
                type="button"
                className="btn-ghost mt-3 min-h-9 px-3 text-sm"
                onClick={() => loadStatuses()}
              >
                <RefreshCw size={16} /> ลองใหม่
              </button>
            </div>
          )}

          {isLoading ? (
            <p className="text-sm font-bold text-[#5e6256]">กำลังโหลดข้อมูล</p>
          ) : statuses.length ? (
            <div className="grid gap-3">
              {statuses.map((status, index) => (
                <article
                  key={status.id}
                  className="grid gap-3 rounded-lg border border-[#0E4F52]/10 p-4 lg:grid-cols-[1fr_auto] lg:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge value={status.name} color={status.color} />
                      {!status.isActive && (
                        <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-bold text-stone-600">
                          ปิดใช้งาน
                        </span>
                      )}
                    </div>
                    <p className="mt-2 break-words text-sm font-bold text-[#0E4F52]">
                      {status.name}
                    </p>
                    <p className="mt-1 break-all text-xs font-semibold text-[#5e6256]">
                      {status.slug} • ใช้อยู่ {status.usageCount || 0} ผลงาน
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <button
                      type="button"
                      className="btn-ghost px-3"
                      onClick={() => moveStatus(index, -1)}
                      disabled={!canManage || isSubmitting || index === 0}
                      aria-label="เลื่อนสถานะขึ้น"
                    >
                      <ArrowUp size={18} />
                    </button>
                    <button
                      type="button"
                      className="btn-ghost px-3"
                      onClick={() => moveStatus(index, 1)}
                      disabled={!canManage || isSubmitting || index === statuses.length - 1}
                      aria-label="เลื่อนสถานะลง"
                    >
                      <ArrowDown size={18} />
                    </button>
                    <button
                      type="button"
                      className="btn-ghost px-3"
                      onClick={() => handleEdit(status)}
                      disabled={!canManage || isSubmitting}
                    >
                      <Edit3 size={18} /> แก้ไข
                    </button>
                    <button
                      type="button"
                      className="btn-ghost px-3"
                      onClick={() => handleToggle(status)}
                      disabled={!canManage || isSubmitting}
                    >
                      {status.isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                    </button>
                    <button
                      type="button"
                      className="btn-ghost px-3 text-red-700"
                      onClick={() => setDeleteTarget(status)}
                      disabled={!canManage || isSubmitting}
                    >
                      <Trash2 size={18} /> ลบ
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="rounded-lg bg-[#EAF4F2] p-4 text-sm font-bold text-[#0E4F52]">
              ยังไม่มีสถานะงานในระบบ
            </p>
          )}
        </section>
      </div>
    </div>
  )
}

export default AdminProjectStatuses
