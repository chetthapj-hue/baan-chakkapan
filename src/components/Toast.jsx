import { CheckCircle2, X } from 'lucide-react'
import { useEffect } from 'react'

const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(onClose, 3200)
    return () => window.clearTimeout(timer)
  }, [toast, onClose])

  if (!toast) return null

  return (
    <div className="fixed right-4 top-24 z-50 flex max-w-sm items-center gap-3 rounded-lg border border-[#0E4F52]/12 bg-white px-4 py-3 text-[#0E4F52] shadow-xl">
      <CheckCircle2 size={20} className="text-emerald-600" />
      <p className="text-sm font-bold">{toast.message}</p>
      <button
        type="button"
        aria-label="ปิดข้อความแจ้งเตือน"
        className="ml-2 text-[#5e6256]"
        onClick={onClose}
      >
        <X size={16} />
      </button>
    </div>
  )
}

export default Toast


