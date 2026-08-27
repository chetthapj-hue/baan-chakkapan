import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import ImageWithFallback from './ImageWithFallback'

const getNextIndex = (currentIndex, direction, length) =>
  (currentIndex + direction + length) % length

const ProjectGallery = ({ images = [], title = 'รูปภาพผลงาน' }) => {
  const [activeIndex, setActiveIndex] = useState(null)
  const touchStartX = useRef(null)
  const activeButtonRef = useRef(null)
  const thumbnailRefs = useRef([])
  const activeImage = activeIndex === null ? null : images[activeIndex]

  const closeLightbox = useCallback(() => {
    setActiveIndex(null)
    window.setTimeout(() => activeButtonRef.current?.focus(), 0)
  }, [])

  const openLightbox = (index) => {
    activeButtonRef.current = thumbnailRefs.current[index]
    setActiveIndex(index)
  }

  const move = useCallback((direction) => {
    setActiveIndex((current) =>
      current === null ? current : getNextIndex(current, direction, images.length),
    )
  }, [images.length])

  useEffect(() => {
    if (activeIndex === null) return undefined

    const previousStyle = document.body.getAttribute('style') || ''
    document.body.setAttribute('style', `${previousStyle}; overflow: hidden;`)

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeLightbox()
      if (event.key === 'ArrowLeft') move(-1)
      if (event.key === 'ArrowRight') move(1)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      if (previousStyle) document.body.setAttribute('style', previousStyle)
      else document.body.removeAttribute('style')
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeIndex, closeLightbox, move])

  useEffect(() => {
    if (activeIndex === null || !images.length) return

    const previousImage = images[getNextIndex(activeIndex, -1, images.length)]
    const nextImage = images[getNextIndex(activeIndex, 1, images.length)]
    ;[previousImage, nextImage].forEach((image) => {
      if (!image?.url) return
      const preload = new Image()
      preload.src = image.url
    })
  }, [activeIndex, images])

  if (!images.length) return null

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {images.map((image, index) => (
          <button
            key={`${image.url}-${index}`}
            ref={(element) => {
              thumbnailRefs.current[index] = element
            }}
            type="button"
            aria-label={`เปิดรูปภาพ ${image.alt}`}
            className="aspect-[4/3] overflow-hidden rounded-lg bg-[#EAF4F2]"
            onClick={() => openLightbox(index)}
          >
            <ImageWithFallback
              src={image.url}
              alt={image.alt}
              className="h-full w-full object-cover transition duration-300 hover:scale-105"
            />
          </button>
        ))}
      </div>

      {activeImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/86 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onClick={closeLightbox}
          onTouchStart={(event) => {
            touchStartX.current = event.touches[0]?.clientX || null
          }}
          onTouchEnd={(event) => {
            if (touchStartX.current === null) return
            const distance = event.changedTouches[0].clientX - touchStartX.current
            if (Math.abs(distance) > 45) move(distance > 0 ? -1 : 1)
            touchStartX.current = null
          }}
        >
          <button
            type="button"
            aria-label="ปิดรูปภาพ"
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-md bg-white text-[#0E4F52]"
            onClick={closeLightbox}
          >
            <X size={22} />
          </button>

          <button
            type="button"
            aria-label="รูปก่อนหน้า"
            className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md bg-white text-[#0E4F52]"
            onClick={(event) => {
              event.stopPropagation()
              move(-1)
            }}
          >
            <ChevronLeft size={24} />
          </button>

          <figure
            className="flex max-h-[88vh] max-w-[92vw] flex-col items-center gap-3"
            onClick={(event) => event.stopPropagation()}
          >
            <ImageWithFallback
              src={activeImage.url}
              alt={activeImage.alt}
              className="max-h-[72vh] max-w-[92vw] rounded-lg object-contain"
            />
            <figcaption className="text-center text-sm font-bold text-white">
              {activeImage.alt} · {activeIndex + 1} / {images.length}
            </figcaption>
            <div className="flex max-w-[92vw] gap-2 overflow-x-auto pb-1">
              {images.map((image, index) => (
                <button
                  key={`${image.url}-thumb-${index}`}
                  type="button"
                  aria-label={`เลือกรูปที่ ${index + 1}`}
                  className={`h-16 w-20 shrink-0 overflow-hidden rounded-md border-2 ${
                    index === activeIndex ? 'border-white' : 'border-transparent'
                  }`}
                  onClick={() => setActiveIndex(index)}
                >
                  <ImageWithFallback
                    src={image.url}
                    alt={image.alt}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </figure>

          <button
            type="button"
            aria-label="รูปถัดไป"
            className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md bg-white text-[#0E4F52]"
            onClick={(event) => {
              event.stopPropagation()
              move(1)
            }}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}
    </>
  )
}

export default ProjectGallery
