const statusClass = {
  published: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  draft: 'border-stone-200 bg-stone-50 text-stone-700',
}

const statusLabel = {
  published: 'เผยแพร่',
  draft: 'ฉบับร่าง',
}

const isHexColor = (color = '') => /^#[0-9A-Fa-f]{6}$/.test(color)

const getReadableTextColor = (color = '') => {
  if (!isHexColor(color)) return '#0E4F52'

  const hex = color.replace('#', '')
  const red = parseInt(hex.slice(0, 2), 16)
  const green = parseInt(hex.slice(2, 4), 16)
  const blue = parseInt(hex.slice(4, 6), 16)
  const brightness = (red * 299 + green * 587 + blue * 114) / 1000
  return brightness > 150 ? '#0E4F52' : '#FFFFFF'
}

const StatusBadge = ({ value, color }) => {
  const label = statusLabel[value] || value || 'ไม่ระบุ'

  if (isHexColor(color) && !statusClass[value]) {
    return (
      <span
        className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold"
        style={{
          backgroundColor: color,
          borderColor: color,
          color: getReadableTextColor(color),
        }}
      >
        {label}
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${
        statusClass[value] || 'border-[#0E4F52]/15 bg-[#EAF4F2] text-[#0E4F52]'
      }`}
    >
      {label}
    </span>
  )
}

export default StatusBadge
