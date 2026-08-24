import { X } from 'lucide-react'
import { useState } from 'react'
import ImageWithFallback from './ImageWithFallback'

const ProjectGallery = ({ images = [] }) => {
  const [activeImage, setActiveImage] = useState(null)

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {images.map((image, index) => (
          <button
            key={`${image.url}-${index}`}
            type="button"
            aria-label={`เปิดรูปภาพ ${image.alt}`}
            className="aspect-[4/3] overflow-hidden rounded-lg bg-[#EAF4F2]"
            onClick={() => setActiveImage(image)}
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/82 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="แสดงรูปภาพผลงาน"
        >
          <button
            type="button"
            aria-label="ปิดรูปภาพ"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-md bg-white text-[#0E4F52]"
            onClick={() => setActiveImage(null)}
          >
            <X size={22} />
          </button>
          <ImageWithFallback
            src={activeImage.url}
            alt={activeImage.alt}
            className="max-h-[86vh] max-w-[92vw] rounded-lg object-contain"
          />
        </div>
      )}
    </>
  )
}

export default ProjectGallery



