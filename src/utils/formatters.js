export const formatNumber = (value) =>
  new Intl.NumberFormat('th-TH').format(Number(value) || 0)

export const formatPriceShort = (value) => {
  const amount = Number(value) || 0
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(amount % 1000000 === 0 ? 0 : 1)} ล้านบาท`
  }
  return `${formatNumber(amount)} บาท`
}

export const formatDateThai = (value) =>
  new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
  }).format(new Date(value))

export const getEmbedUrl = (url) => {
  if (!url) return ''
  if (url.includes('/embed/')) return url

  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes('youtu.be')) {
      return `https://www.youtube.com/embed/${parsed.pathname.replace('/', '')}`
    }

    const videoId = parsed.searchParams.get('v')
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url
  } catch {
    return url
  }
}

export const createSlug = (value) =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9ก-๙-]/g, '')
    .replace(/-+/g, '-')


