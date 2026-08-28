import { ArrowRight, Bath, BedDouble, FileText, MapPin, Ruler } from 'lucide-react'
import { Link } from 'react-router-dom'
import ImageWithFallback from './ImageWithFallback'
import StatusBadge from './StatusBadge'

const ProjectCard = ({ project }) => {
  const floorPlanCount = project.floorPlanImages?.length || 0

  return (
    <article className="group overflow-hidden rounded-lg border border-[#0E4F52]/12 bg-white shadow-[0_22px_54px_rgba(6,56,59,0.14)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(6,56,59,0.2)]">
      <Link to={`/projects/${project.slug}`} aria-label={`ดูรายละเอียด ${project.title}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-[#EAF4F2]">
          <ImageWithFallback
            src={project.coverImage}
            alt={project.coverAlt}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#062F31]/82 to-transparent" />
          <div className="absolute left-4 top-4">
            <StatusBadge value={project.status} color={project.statusColor} />
          </div>
          <div className="absolute bottom-4 left-4 rounded-md border border-[#B28A55]/70 bg-[#0E4F52] px-3 py-2 text-sm font-extrabold text-white shadow-lg">
            {project.price}
          </div>
        </div>
      </Link>
      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="h-px w-9 bg-[#B28A55]" />
            <p className="text-xs font-extrabold uppercase text-[#0E4F52]">
              {project.type}
            </p>
          </div>
          <h2 className="text-xl font-extrabold leading-snug text-[#0E4F52]">
            <Link to={`/projects/${project.slug}`} className="hover:text-[#073A3D]">
              {project.title}
            </Link>
          </h2>
        </div>
        <p className="flex items-center gap-2 text-sm font-semibold text-[#5e6256]">
          <MapPin size={16} className="text-[#0E4F52]" /> {project.location}
        </p>
        <div className="grid grid-cols-3 gap-2 border-y border-[#0E4F52]/10 py-3 text-center text-sm text-[#0E4F52]">
          <span className="grid min-h-16 place-items-center gap-1 rounded-md bg-[#EAF4F2] px-2 py-2 font-bold">
            <Ruler size={16} /> {project.area} ตร.ม.
          </span>
          <span className="grid min-h-16 place-items-center gap-1 rounded-md bg-[#EAF4F2] px-2 py-2 font-bold">
            <BedDouble size={16} /> {project.bedrooms} ห้องนอน
          </span>
          <span className="grid min-h-16 place-items-center gap-1 rounded-md bg-[#EAF4F2] px-2 py-2 font-bold">
            <Bath size={16} /> {project.bathrooms} ห้องน้ำ
          </span>
        </div>
        {floorPlanCount > 0 && (
          <p className="flex items-center gap-2 rounded-md bg-[#EAF4F2] px-3 py-2 text-sm font-extrabold text-[#0E4F52]">
            <FileText size={16} className="text-[#0E4F52]" /> มีรูปแปลน {floorPlanCount} รูป
          </p>
        )}
        <Link
          to={`/projects/${project.slug}`}
          className="inline-flex items-center gap-2 border-b border-[#B28A55] pb-1 text-sm font-extrabold text-[#0E4F52] hover:text-[#073A3D]"
        >
          ดูรายละเอียด <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  )
}

export default ProjectCard
