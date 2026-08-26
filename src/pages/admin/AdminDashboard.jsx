import { Building2, FolderKanban, Mail, Plus, Timer } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import StatusBadge from '../../components/StatusBadge'
import { useProjects } from '../../hooks/useProjects'
import { getContacts } from '../../services/contactService'
import { formatDateThai } from '../../utils/formatters'

const AdminDashboard = () => {
  const { projects } = useProjects()
  const [contacts, setContacts] = useState([])

  useEffect(() => {
    let active = true

    getContacts()
      .then((nextContacts) => {
        if (active) setContacts(nextContacts)
      })
      .catch(() => {
        if (active) setContacts([])
      })

    return () => {
      active = false
    }
  }, [])

  const completed = projects.filter((project) => project.status === 'สร้างเสร็จแล้ว')
  const building = projects.filter((project) => project.status === 'กำลังก่อสร้าง')
  const latestProjects = projects.slice(0, 5)

  const stats = [
    { label: 'ผลงานทั้งหมด', value: projects.length, icon: FolderKanban },
    { label: 'สร้างเสร็จแล้ว', value: completed.length, icon: Building2 },
    { label: 'กำลังก่อสร้าง', value: building.length, icon: Timer },
    { label: 'ข้อความติดต่อ', value: contacts.length, icon: Mail },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-bold uppercase text-[#0E4F52]">Admin</p>
          <h1 className="text-3xl font-extrabold text-[#0E4F52]">Dashboard</h1>
        </div>
        <Link to="/admin/projects/new" className="btn-primary w-fit">
          <Plus size={18} /> เพิ่มผลงาน
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="rounded-lg bg-white p-5 shadow-sm">
              <Icon className="mb-4 text-[#0E4F52]" size={26} />
              <p className="text-3xl font-extrabold text-[#0E4F52]">{stat.value}</p>
              <p className="mt-1 text-sm text-[#5e6256]">{stat.label}</p>
            </div>
          )
        })}
      </div>

      <section className="rounded-lg bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold text-[#0E4F52]">ผลงานล่าสุด</h2>
          <Link to="/admin/projects" className="text-sm font-bold text-[#0E4F52]">
            จัดการผลงานทั้งหมด
          </Link>
        </div>
        <div className="grid gap-3">
          {latestProjects.map((project) => (
            <div
              key={project.id}
              className="grid gap-3 rounded-lg border border-[#0E4F52]/10 p-4 md:grid-cols-[1fr_auto_auto] md:items-center"
            >
              <div>
                <p className="font-extrabold text-[#0E4F52]">{project.title}</p>
                <p className="text-sm text-[#5e6256]">
                  อัปเดต {formatDateThai(project.updatedAt)}
                </p>
              </div>
              <StatusBadge value={project.status} />
              <StatusBadge value={project.publishStatus} />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default AdminDashboard
