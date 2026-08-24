const statusClass = {
  สร้างเสร็จแล้ว: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  กำลังก่อสร้าง: 'border-amber-200 bg-amber-50 text-amber-700',
  แบบบ้าน: 'border-sky-200 bg-sky-50 text-sky-700',
  published: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  draft: 'border-stone-200 bg-stone-50 text-stone-700',
}

const statusLabel = {
  published: 'เผยแพร่',
  draft: 'ฉบับร่าง',
}

const StatusBadge = ({ value }) => (
  <span
    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${
      statusClass[value] || 'border-[#0E4F52]/15 bg-[#EAF4F2] text-[#0E4F52]'
    }`}
  >
    {statusLabel[value] || value}
  </span>
)

export default StatusBadge



