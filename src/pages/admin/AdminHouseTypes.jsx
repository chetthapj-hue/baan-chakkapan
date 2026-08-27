import { Edit3, Home, Plus, RefreshCw, Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import ConfirmModal from '../../components/ConfirmModal'
import Toast from '../../components/Toast'
import { useToast } from '../../hooks/useToast'
import {
  createHouseType,
  deleteHouseType,
  getHouseTypes,
  updateHouseType,
} from '../../services/houseTypeService'

const AdminHouseTypes = () => {
  const [houseTypes, setHouseTypes] = useState([])
  const [name, setName] = useState('')
  const [editingHouseType, setEditingHouseType] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { toast, showToast, clearToast } = useToast()

  const loadHouseTypes = useCallback(
    async ({ showLoading = true } = {}) => {
      if (showLoading) setIsLoading(true)
      try {
        setHouseTypes(await getHouseTypes())
        setError('')
      } catch (loadError) {
        const message = loadError.message || 'โหลดประเภทบ้านไม่สำเร็จ'
        setError(message)
        showToast(message, 'error')
      } finally {
        if (showLoading) setIsLoading(false)
      }
    },
    [showToast],
  )

  useEffect(() => {
    let isMounted = true

    const loadInitialHouseTypes = async () => {
      try {
        const nextHouseTypes = await getHouseTypes()
        if (isMounted) {
          setHouseTypes(nextHouseTypes)
          setError('')
        }
      } catch (loadError) {
        if (isMounted) {
          const message = loadError.message || 'โหลดประเภทบ้านไม่สำเร็จ'
          setError(message)
          showToast(message, 'error')
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadInitialHouseTypes()

    return () => {
      isMounted = false
    }
  }, [showToast])

  const resetForm = () => {
    setName('')
    setEditingHouseType(null)
  }

  const handleEdit = (houseType) => {
    setName(houseType.name)
    setEditingHouseType(houseType)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const trimmedName = name.trim()

    if (!trimmedName) {
      showToast('กรุณากรอกชื่อประเภทบ้าน', 'error')
      return
    }

    setIsSubmitting(true)
    try {
      if (editingHouseType) {
        await updateHouseType(editingHouseType.id, trimmedName)
        showToast('แก้ไขประเภทบ้านเรียบร้อยแล้ว')
      } else {
        await createHouseType(trimmedName)
        showToast('เพิ่มประเภทบ้านเรียบร้อยแล้ว')
      }

      resetForm()
      await loadHouseTypes({ showLoading: false })
    } catch (submitError) {
      showToast(submitError.message || 'บันทึกประเภทบ้านไม่สำเร็จ', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    setIsSubmitting(true)
    try {
      await deleteHouseType(deleteTarget.id)
      setDeleteTarget(null)
      await loadHouseTypes({ showLoading: false })
      showToast('ลบประเภทบ้านเรียบร้อยแล้ว')
    } catch (deleteError) {
      showToast(deleteError.message || 'ลบประเภทบ้านไม่สำเร็จ', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={clearToast} />
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="ลบประเภทบ้าน"
        message={
          deleteTarget
            ? `ต้องการลบประเภทบ้าน ${deleteTarget.name} ใช่ไหม`
            : ''
        }
        confirmLabel="ลบประเภทบ้าน"
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase text-[#0E4F52]">House Types</p>
          <h1 className="text-3xl font-extrabold text-[#0E4F52]">
            จัดการประเภทบ้าน
          </h1>
        </div>
        <button type="button" className="btn-ghost" onClick={() => loadHouseTypes()}>
          <RefreshCw size={18} /> รีเฟรช
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <form className="rounded-lg bg-white p-5 shadow-sm" onSubmit={handleSubmit}>
          <div className="mb-5 flex items-center gap-2 text-xl font-extrabold text-[#0E4F52]">
            <Home size={22} /> {editingHouseType ? 'แก้ไขประเภทบ้าน' : 'เพิ่มประเภทบ้าน'}
          </div>
          <label className="grid gap-2 text-sm font-semibold text-[#0E4F52]">
            ชื่อประเภทบ้าน
            <input
              className="form-field"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={80}
              required
            />
          </label>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              <Plus size={18} /> {editingHouseType ? 'บันทึกชื่อใหม่' : 'เพิ่มประเภท'}
            </button>
            {editingHouseType && (
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
            <Home size={22} /> รายการประเภทบ้าน
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-4">
              <p className="text-sm font-bold text-red-700">{error}</p>
              <button
                type="button"
                className="btn-ghost mt-3 min-h-9 px-3 text-sm"
                onClick={() => loadHouseTypes()}
              >
                <RefreshCw size={16} /> ลองใหม่
              </button>
            </div>
          )}

          {isLoading ? (
            <p className="text-sm font-bold text-[#5e6256]">กำลังโหลดข้อมูล</p>
          ) : houseTypes.length ? (
            <div className="grid gap-3">
              {houseTypes.map((houseType) => (
                <div
                  key={houseType.id}
                  className="flex flex-col gap-3 rounded-lg border border-[#0E4F52]/10 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-extrabold text-[#0E4F52]">{houseType.name}</p>
                    <p className="mt-1 text-xs font-bold text-[#5e6256]">
                      {houseType.id}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#0E4F52]/15 text-[#0E4F52] transition hover:bg-[#EAF4F2]"
                      aria-label="แก้ไขประเภทบ้าน"
                      disabled={isSubmitting}
                      onClick={() => handleEdit(houseType)}
                    >
                      <Edit3 size={17} />
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-red-200 text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="ลบประเภทบ้าน"
                      disabled={isSubmitting}
                      onClick={() => setDeleteTarget(houseType)}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-lg bg-[#EAF4F2] p-4 text-sm font-bold text-[#0E4F52]">
              ยังไม่มีประเภทบ้านในระบบ
            </p>
          )}
        </section>
      </div>
    </div>
  )
}

export default AdminHouseTypes
