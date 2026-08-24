import {
  Bath,
  BedDouble,
  Car,
  ChevronRight,
  Home,
  Layers,
  Ruler,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import ContactButtons from '../components/ContactButtons'
import FloorPlan from '../components/FloorPlan'
import ImageWithFallback from '../components/ImageWithFallback'
import ProjectCard from '../components/ProjectCard'
import ProjectGallery from '../components/ProjectGallery'
import StatusBadge from '../components/StatusBadge'
import { getProjectById, getPublishedProjects } from '../services/projectService'
import { getEmbedUrl } from '../utils/formatters'
import NotFound from './NotFound'

const statItems = [
  { key: 'area', label: 'พื้นที่ใช้สอย', suffix: 'ตร.ม.', icon: Ruler },
  { key: 'floors', label: 'จำนวนชั้น', suffix: 'ชั้น', icon: Layers },
  { key: 'bedrooms', label: 'ห้องนอน', suffix: 'ห้อง', icon: BedDouble },
  { key: 'bathrooms', label: 'ห้องน้ำ', suffix: 'ห้อง', icon: Bath },
  { key: 'parking', label: 'ที่จอดรถ', suffix: 'คัน', icon: Car },
]

const ProjectDetail = () => {
  const { id } = useParams()
  const project = getProjectById(id)

  if (!project || project.publishStatus !== 'published') return <NotFound />

  const relatedProjects = getPublishedProjects()
    .filter((item) => item.id !== project.id)
    .filter((item) => item.type === project.type || item.status === project.status)
    .slice(0, 3)

  return (
    <>
      <section className="bg-[#0E4F52] py-8">
        <div className="container-page flex flex-wrap items-center gap-2 text-sm font-semibold text-white/75">
          <Link to="/" className="hover:text-white">
            หน้าแรก
          </Link>
          <ChevronRight size={16} />
          <Link to="/projects" className="hover:text-white">
            ผลงาน
          </Link>
          <ChevronRight size={16} />
          <span className="text-white">{project.title}</span>
        </div>
      </section>

      <article className="bg-[#F6F8F4]">
        <section className="bg-[#0E4F52] pb-14 text-white">
          <div className="container-page grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div className="space-y-6 py-4">
              <StatusBadge value={project.status} />
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="h-px w-12 bg-[#B28A55]" />
                  <p className="text-sm font-extrabold uppercase text-white/76">
                    {project.type}
                  </p>
                </div>
                <h1 className="text-4xl font-black leading-tight text-white md:text-5xl">
                  {project.title}
                </h1>
              </div>
              <div className="rounded-lg border-l-4 border-[#B28A55] bg-white/8 p-5">
                <p className="text-sm font-bold text-white/70">ราคาเริ่มต้น</p>
                <p className="mt-1 text-3xl font-black text-white">{project.price}</p>
              </div>
              <p className="leading-8 text-white/78">{project.description}</p>
              <ContactButtons />
            </div>
            <div className="aspect-[16/10] overflow-hidden rounded-lg border border-[#B28A55]/50 bg-[#EAF4F2] shadow-[0_26px_70px_rgba(0,0,0,0.24)]">
              <ImageWithFallback
                src={project.coverImage}
                alt={project.coverAlt}
                loading="eager"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>

        <section className="container-page -mt-8 pb-12">
          <div className="grid gap-3 md:grid-cols-5">
            {statItems.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.key} className="surface rounded-lg p-4">
                  <Icon className="mb-3 text-[#0E4F52]" size={22} />
                  <p className="text-sm text-[#5e6256]">{item.label}</p>
                  <p className="mt-1 text-xl font-black text-[#0E4F52]">
                    {project[item.key]} {item.suffix}
                  </p>
                </div>
              )
            })}
          </div>
        </section>

        <section className="container-page space-y-8 pb-16">
          <FloorPlan plan={project.floorPlan} />

          <div>
            <h2 className="mb-4 text-2xl font-black text-[#0E4F52]">
              รูปภาพบ้าน
            </h2>
            <ProjectGallery images={project.gallery} />
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-lg border border-[#0E4F52]/10 bg-white p-6">
              <h2 className="text-2xl font-black text-[#0E4F52]">
                สิ่งที่ได้รับ
              </h2>
              <ul className="mt-5 grid gap-3">
                {project.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-3 text-[#5e6256]">
                    <Home className="mt-1 shrink-0 text-[#0E4F52]" size={18} />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="aspect-video overflow-hidden rounded-lg border border-[#B28A55]/50 bg-black shadow-[0_22px_54px_rgba(6,56,59,0.18)]">
              <iframe
                className="h-full w-full"
                src={getEmbedUrl(project.videoUrl)}
                title={`วิดีโอ ${project.title}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        <section className="bg-[#0E4F52] py-14">
          <div className="container-page space-y-6">
            <h2 className="text-2xl font-black text-white">
              ผลงานใกล้เคียง
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {relatedProjects.map((item) => (
                <ProjectCard key={item.id} project={item} />
              ))}
            </div>
          </div>
        </section>
      </article>
    </>
  )
}

export default ProjectDetail