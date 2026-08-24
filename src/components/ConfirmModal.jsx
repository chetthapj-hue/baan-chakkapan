import { XCircle } from 'lucide-react'

const ConfirmModal = ({ open, title, message, confirmLabel, onConfirm, onClose }) => {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-[#0E4F52]">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#5e6256]">{message}</p>
          </div>
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#0E4F52]/15 text-[#0E4F52]"
            aria-label="ปิดหน้าต่างยืนยัน"
            onClick={onClose}
          >
            <XCircle size={18} />
          </button>
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" className="btn-ghost" onClick={onClose}>
            ยกเลิก
          </button>
          <button type="button" className="btn-primary bg-red-700" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal


