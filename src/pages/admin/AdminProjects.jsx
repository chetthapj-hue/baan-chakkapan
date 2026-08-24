import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ConfirmModal from '../../components/ConfirmModal'
import ImageWithFallback from '../../components/ImageWithFallback'
import StatusBadge from '../../components/StatusBadge'
import Toast from '../../components/Toast'
import { useProjects } from '../../hooks/useProjects'
import { useToast } from '../../hooks/useToast'

const AdminProjects = () => {
  const { projects, remove, togglePublish } = useProjects()
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const { toast, showToast, clearToast } = useToast()

  const filteredProjects = useMemo(
    () =>
      projects.filter((project) =>
        project.title.toLowerCase().includes(search.toLowerCase()),
      ),
    [projects, search],
  )

  const confirmDelete = () => {
    remove(deleteTarget.id)
    showToast(`ลบ ${deleteTarget.title} แล้ว`)
    setDeleteTarget(null)
  }

  const handleToggle = (id) => {
    const updatedProject = togglePublish(id)
    showToast(
      updatedProject.publishStatus === 'published'
        ? 'เปลี่ยนเป็นสถานะเผยแพร่แล้ว'
        : 'เปลี่ยนเป็นฉบับร่างแล้ว',
    )
  }

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={clearToast} />
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="ยืนยันการลบผลงาน"
        message={`ต้องการลบ ${deleteTarget?.title || ''} ออกจาก localStorage หรือไม่`}
        confirmLabel="ลบผลงาน"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-bold uppercase text-[#0E4F52]">Projects</p>
          <h1 className="text-3xl font-extrabold text-[#0E4F52]">จัดการผลงาน</h1>
        </div>
        <Link to="/admin/projects/new" className="btn-primary w-fit">
          <Plus size={18} /> เพิ่มผลงาน
        </Link>
      </div>

      <div className="rounded-lg bg-white p-4 shadow-sm">
        <label className="relative block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#0E4F52]"
            size={18}
          />
          <input
            className="form-field pl-10"
            placeholder="ค้นหาผลงาน"
            aria-label="ค้นหาผลงานในแอดมิน"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </div>

      <div className="grid gap-4">
        {filteredProjects.map((project) => (
          <article
            key={project.id}
            className="grid gap-4 rounded-lg bg-white p-4 shadow-sm lg:grid-cols-[150px_1fr_auto] lg:items-center"
          >
            <div className="aspect-[4/3] overflow-hidden rounded-lg bg-[#EAF4F2]">
              <ImageWithFallback
                src={project.coverImage}
                alt={project.coverAlt}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 space-y-3">
              <div>
                <h2 className="text-lg font-extrabold text-[#0E4F52]">
                  {project.title}
                </h2>
                <p className="text-sm text-[#5e6256]">
                  {project.type} • {project.location} • {project.price}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge value={project.status} />
                <StatusBadge value={project.publishStatus} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <Link
                to={`/projects/${project.slug}`}
                className="btn-ghost px-3"
                aria-label={`ดูหน้าเว็บไซต์ ${project.title}`}
              >
                <Eye size={18} />
              </Link>
              <Link
                to={`/admin/projects/${project.id}/edit`}
                className="btn-ghost px-3"
                aria-label={`แก้ไข ${project.title}`}
              >
                <Pencil size={18} />
              </Link>
              <button
                type="button"
                className="btn-ghost px-3"
                onClick={() => handleToggle(project.id)}
              >
                {project.publishStatus === 'published' ? 'ซ่อน' : 'เผยแพร่'}
              </button>
              <button
                type="button"
                className="btn-ghost px-3 text-red-700"
                aria-label={`ลบ ${project.title}`}
                onClick={() => setDeleteTarget(project)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default AdminProjects




