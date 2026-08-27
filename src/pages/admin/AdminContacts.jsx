import {
  Eye,
  Mail,
  MailOpen,
  Phone,
  RefreshCw,
  Search,
  Trash2,
  XCircle,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import ConfirmModal from '../../components/ConfirmModal'
import Toast from '../../components/Toast'
import { useToast } from '../../hooks/useToast'
import {
  deleteContact,
  getContactById,
  getContacts,
  updateContactStatus,
} from '../../services/contactService'

const statusFilters = [
  { label: 'ทั้งหมด', value: 'all' },
  { label: 'ยังไม่อ่าน', value: 'new' },
  { label: 'อ่านแล้ว', value: 'read' },
]

const formatDateTime = (value) => {
  if (!value) return '-'

  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

const contactStatusLabel = (status) =>
  status === 'read' ? 'อ่านแล้ว' : 'ยังไม่อ่าน'

const AdminContacts = () => {
  const [contacts, setContacts] = useState([])
  const [filters, setFilters] = useState({ status: 'all', search: '' })
  const [selectedContact, setSelectedContact] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { toast, showToast, clearToast } = useToast()

  const loadContacts = useCallback(
    async ({ showLoading = true } = {}) => {
      if (showLoading) setIsLoading(true)

      try {
        const nextContacts = await getContacts(filters)
        setContacts(nextContacts)
        setError('')
      } catch (loadError) {
        const message =
          loadError.message || 'โหลดข้อความติดต่อไม่สำเร็จ กรุณาลองใหม่'
        setError(message)
        showToast(message, 'error')
      } finally {
        if (showLoading) setIsLoading(false)
      }
    },
    [filters, showToast],
  )

  useEffect(() => {
    let isMounted = true

    const loadInitialContacts = async () => {
      try {
        const nextContacts = await getContacts(filters)
        if (!isMounted) return
        setContacts(nextContacts)
        setError('')
      } catch (loadError) {
        if (!isMounted) return
        const message =
          loadError.message || 'โหลดข้อความติดต่อไม่สำเร็จ กรุณาลองใหม่'
        setError(message)
        showToast(message, 'error')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadInitialContacts()

    return () => {
      isMounted = false
    }
  }, [filters, showToast])

  const unreadCount = useMemo(
    () => contacts.filter((contact) => contact.status !== 'read').length,
    [contacts],
  )

  const openContact = async (contact) => {
    setIsDetailLoading(true)

    try {
      const detail = await getContactById(contact.id)
      const nextDetail =
        detail.status === 'read'
          ? detail
          : await updateContactStatus(detail.id, 'read')

      setSelectedContact(nextDetail)
      setContacts((current) =>
        current.map((item) =>
          item.id === nextDetail.id ? { ...item, status: nextDetail.status } : item,
        ),
      )
    } catch (detailError) {
      showToast(
        detailError.message || 'เปิดรายละเอียดข้อความไม่สำเร็จ',
        'error',
      )
    } finally {
      setIsDetailLoading(false)
    }
  }

  const markUnread = async (contact = selectedContact) => {
    if (!contact) return

    setIsSubmitting(true)
    try {
      const updatedContact = await updateContactStatus(contact.id, 'new')
      setSelectedContact(updatedContact)
      setContacts((current) =>
        current.map((item) =>
          item.id === updatedContact.id
            ? { ...item, status: updatedContact.status }
            : item,
        ),
      )
      showToast('ทำเครื่องหมายว่ายังไม่อ่านแล้ว')
    } catch (statusError) {
      showToast(statusError.message || 'เปลี่ยนสถานะไม่สำเร็จ', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    setIsSubmitting(true)
    try {
      await deleteContact(deleteTarget.id)
      setContacts((current) =>
        current.filter((contact) => contact.id !== deleteTarget.id),
      )
      if (selectedContact?.id === deleteTarget.id) setSelectedContact(null)
      setDeleteTarget(null)
      showToast('ลบข้อความติดต่อเรียบร้อยแล้ว')
    } catch (deleteError) {
      showToast(deleteError.message || 'ลบข้อความไม่สำเร็จ', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={clearToast} />
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="ลบข้อความติดต่อ"
        message={
          deleteTarget
            ? `ต้องการลบข้อความจาก ${deleteTarget.name} ใช่ไหม`
            : ''
        }
        confirmLabel="ลบข้อความ"
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />

      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <section className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase text-[#0E4F52]">
                  Contact
                </p>
                <h2 className="mt-1 text-2xl font-extrabold text-[#0E4F52]">
                  {selectedContact.subject}
                </h2>
                <p className="mt-2 text-sm text-[#5e6256]">
                  {formatDateTime(selectedContact.createdAt)}
                </p>
              </div>
              <button
                type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#0E4F52]/15 text-[#0E4F52]"
                aria-label="ปิดรายละเอียดข้อความ"
                onClick={() => setSelectedContact(null)}
              >
                <XCircle size={18} />
              </button>
            </div>

            <div className="grid gap-3 rounded-lg bg-[#EAF4F2] p-4 text-sm md:grid-cols-2">
              <p>
                <span className="font-extrabold text-[#0E4F52]">ชื่อ: </span>
                {selectedContact.name}
              </p>
              <p>
                <span className="font-extrabold text-[#0E4F52]">โทร: </span>
                {selectedContact.phone}
              </p>
              <p className="break-all md:col-span-2">
                <span className="font-extrabold text-[#0E4F52]">อีเมล: </span>
                {selectedContact.email}
              </p>
            </div>

            <div className="mt-5 whitespace-pre-wrap rounded-lg border border-[#0E4F52]/10 p-4 leading-7 text-[#202520]">
              {selectedContact.message}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <a className="btn-primary" href={`tel:${selectedContact.phone}`}>
                <Phone size={18} /> โทรหา
              </a>
              <a className="btn-ghost" href={`mailto:${selectedContact.email}`}>
                <Mail size={18} /> ส่งอีเมล
              </a>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => markUnread()}
                disabled={isSubmitting}
              >
                <MailOpen size={18} /> ทำเครื่องหมายว่ายังไม่อ่าน
              </button>
              <button
                type="button"
                className="btn-ghost text-red-700"
                onClick={() => setDeleteTarget(selectedContact)}
                disabled={isSubmitting}
              >
                <Trash2 size={18} /> ลบข้อความ
              </button>
            </div>
          </section>
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase text-[#0E4F52]">
            Contact Messages
          </p>
          <h1 className="text-3xl font-extrabold text-[#0E4F52]">
            ข้อความติดต่อ
          </h1>
          <p className="mt-2 text-sm font-bold text-[#5e6256]">
            ยังไม่อ่าน {unreadCount} ข้อความ
          </p>
        </div>
        <button type="button" className="btn-ghost" onClick={() => loadContacts()}>
          <RefreshCw size={18} /> รีเฟรช
        </button>
      </div>

      <section className="rounded-lg bg-white p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_180px]">
          <label className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#0E4F52]"
              size={18}
            />
            <input
              className="form-field !pl-10"
              value={filters.search}
              onChange={(event) =>
                setFilters((current) => ({ ...current, search: event.target.value }))
              }
              placeholder="ค้นหาชื่อ เบอร์โทร อีเมล หรือหัวข้อ"
            />
          </label>
          <select
            className="form-field"
            value={filters.status}
            onChange={(event) =>
              setFilters((current) => ({ ...current, status: event.target.value }))
            }
          >
            {statusFilters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {error && (
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-sm font-bold text-red-700">{error}</p>
          <button type="button" className="btn-ghost mt-3" onClick={() => loadContacts()}>
            <RefreshCw size={18} /> ลองใหม่
          </button>
        </div>
      )}

      <section className="rounded-lg bg-white p-5 shadow-sm">
        {isLoading ? (
          <p className="text-sm font-bold text-[#5e6256]">
            กำลังโหลดข้อความ
          </p>
        ) : contacts.length ? (
          <div className="space-y-3">
            {contacts.map((contact) => (
              <article
                key={contact.id}
                className="grid gap-4 rounded-lg border border-[#0E4F52]/10 p-4 lg:grid-cols-[1.2fr_1fr_1fr_auto] lg:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-extrabold text-[#0E4F52]">
                      {contact.name}
                    </p>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                        contact.status === 'read'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-[#EAF4F2] text-[#0E4F52]'
                      }`}
                    >
                      {contactStatusLabel(contact.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-bold text-[#202520]">
                    {contact.subject}
                  </p>
                  <p className="mt-1 text-xs text-[#5e6256]">
                    {formatDateTime(contact.createdAt)}
                  </p>
                </div>
                <div className="text-sm text-[#5e6256]">
                  <p>{contact.phone}</p>
                  <p className="mt-1 break-all">{contact.email}</p>
                </div>
                <p className="line-clamp-2 text-sm leading-6 text-[#5e6256]">
                  {contact.message}
                </p>
                <div className="flex gap-2 lg:justify-end">
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#0E4F52]/15 text-[#0E4F52] transition hover:bg-[#EAF4F2] disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="ดูรายละเอียดข้อความ"
                    disabled={isDetailLoading}
                    onClick={() => openContact(contact)}
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-red-200 text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="ลบข้อความ"
                    disabled={isSubmitting}
                    onClick={() => setDeleteTarget(contact)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-lg bg-[#EAF4F2] p-6 text-center">
            <Mail className="mx-auto text-[#0E4F52]" size={34} />
            <p className="mt-3 font-extrabold text-[#0E4F52]">
              ยังไม่มีข้อความติดต่อ
            </p>
            <p className="mt-1 text-sm text-[#5e6256]">
              เมื่อผู้เข้าชมส่งแบบฟอร์ม ข้อความจะแสดงในหน้านี้
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

export default AdminContacts
