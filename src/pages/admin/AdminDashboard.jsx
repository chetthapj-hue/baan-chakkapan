import { Building2, FolderKanban, Mail, Plus, Timer } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import StatusBadge from '../../components/StatusBadge'
import { useProjects } from '../../hooks/useProjects'
import { getContactStats } from '../../services/contactService'
import { getAdminProjectStatuses } from '../../services/projectStatusService'
import { formatDateThai } from '../../utils/formatters'

const AdminDashboard = () => {
  const { projects } = useProjects()
  const [contactStats, setContactStats] = useState({ total: 0, unread: 0 })
  const [projectStatuses, setProjectStatuses] = useState([])

  useEffect(() => {
    let active = true

    getContactStats()
      .then((stats) => {
        if (active) {
          setContactStats({
            total: stats.total || 0,
            unread: stats.unread || 0,
          })
        }
      })
      .catch(() => {
        if (active) setContactStats({ total: 0, unread: 0 })
      })

    getAdminProjectStatuses()
      .then((statuses) => {
        if (active) setProjectStatuses(statuses)
      })
      .catch(() => {
        if (active) setProjectStatuses([])
      })

    return () => {
      active = false
    }
  }, [])

  const getStatusCount = (status) =>
    projects.filter((project) => {
      if (!status) return false
      return (
        project.statusId === status.id ||
        project.statusSlug === status.slug ||
        project.status === status.name
      )
    }).length

  const summaryStatuses = projectStatuses.slice(0, 2)
  const latestProjects = projects.slice(0, 5)

  const stats = [
    { label: 'ผลงานทั้งหมด', value: projects.length, icon: FolderKanban },
    {
      label: summaryStatuses[0]?.name || 'สถานะงานที่ 1',
      value: getStatusCount(summaryStatuses[0]),
      icon: Building2,
    },
    {
      label: summaryStatuses[1]?.name || 'สถานะงานที่ 2',
      value: getStatusCount(summaryStatuses[1]),
      icon: Timer,
    },
    {
      label: 'ข้อความติดต่อ',
      value: contactStats.total,
      icon: Mail,
      to: '/admin/contacts',
      badge: contactStats.unread,
    },
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
          const Card = stat.to ? Link : 'div'

          return (
            <Card
              key={stat.label}
              to={stat.to}
              className="rounded-lg bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <Icon className="text-[#0E4F52]" size={26} />
                {stat.badge > 0 && (
                  <span className="rounded-full bg-[#EAF4F2] px-3 py-1 text-xs font-extrabold text-[#0E4F52]">
                    ยังไม่อ่าน {stat.badge}
                  </span>
                )}
              </div>
              <p className="text-3xl font-extrabold text-[#0E4F52]">{stat.value}</p>
              <p className="mt-1 text-sm text-[#5e6256]">{stat.label}</p>
            </Card>
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
              <StatusBadge value={project.status} color={project.statusColor} />
              <StatusBadge value={project.publishStatus} />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default AdminDashboard
