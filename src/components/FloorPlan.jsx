const toneClass = {
  main: 'bg-[#0E4F52] text-white',
  room: 'bg-white text-[#0E4F52]',
  soft: 'bg-[#EAF4F2] text-[#0E4F52]',
  service: 'bg-[#EDE4D2] text-[#0E4F52]',
  outdoor: 'bg-[#0B4245] text-white',
}

const FloorPlan = ({ plan, compact = false }) => {
  const rooms = plan?.rooms || []

  return (
    <div
      className={
        compact
          ? ''
          : 'rounded-lg border border-[#B28A55] bg-[#073A3D] p-4'
      }
      aria-label={plan?.title || 'แปลนบ้าน'}
    >
      {!compact && (
        <div className="mb-4 flex flex-col justify-between gap-2 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase text-white/75">
              Floor Plan
            </p>
            <h2 className="text-2xl font-extrabold text-white">
              {plan?.title || 'แปลนบ้านโมเดิร์น'}
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-white/72">{plan?.note}</p>
        </div>
      )}

      <div
        className={`grid grid-cols-6 grid-rows-5 gap-1 rounded-md border border-[#B28A55]/80 bg-[#B28A55] ${
          compact ? 'h-28' : 'h-[360px]'
        }`}
      >
        {rooms.map((room, index) => (
          <div
            key={`${room.label}-${index}`}
            className={`flex items-center justify-center border border-[#B28A55]/70 p-1 text-center font-extrabold ${
              compact ? 'text-[10px]' : 'text-sm md:text-base'
            } ${toneClass[room.tone] || toneClass.soft}`}
            style={{ gridColumn: room.col, gridRow: room.row }}
            title={room.thai}
          >
            <span>{compact ? room.label : room.thai}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FloorPlan