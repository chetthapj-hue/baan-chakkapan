import {
  FolderKanban,
  Home,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Mail,
  Settings,
  Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  getCurrentAdmin,
  getRoleLabel,
  isMainAdmin,
} from '../services/adminUserService'
import { logoutAdmin } from '../services/authService'
import { getContactStats } from '../services/contactService'
import Logo from './Logo'

const adminNavClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-bold transition ${
    isActive
      ? 'bg-[#EAF4F2] text-[#0E4F52]'
      : 'text-white/76 hover:bg-white/10 hover:text-white'
  }`

const AdminSidebar = () => {
  const navigate = useNavigate()
  const currentAdmin = getCurrentAdmin()
  const [unreadContacts, setUnreadContacts] = useState(0)

  useEffect(() => {
    let active = true

    getContactStats()
      .then((stats) => {
        if (active) setUnreadContacts(stats.unread || 0)
      })
      .catch(() => {
        if (active) setUnreadContacts(0)
      })

    return () => {
      active = false
    }
  }, [])

  const handleLogout = () => {
    logoutAdmin()
    navigate('/admin/login')
  }

  return (
    <aside className="flex min-h-screen flex-col bg-[#0E4F52] p-5 text-white lg:sticky lg:top-0">
      <div className="mb-8 rounded-lg bg-white p-3">
        <Logo to="/" />
      </div>
      <nav className="grid gap-2">
        <NavLink to="/admin" end className={adminNavClass}>
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>
        <NavLink to="/admin/projects" className={adminNavClass}>
          <FolderKanban size={18} /> จัดการผลงาน
        </NavLink>
        <NavLink to="/admin/house-types" className={adminNavClass}>
          <Home size={18} /> ประเภทบ้าน
        </NavLink>
        <NavLink to="/admin/project-statuses" className={adminNavClass}>
          <ListChecks size={18} /> สถานะงาน
        </NavLink>
        <NavLink to="/admin/contacts" className={adminNavClass}>
          <Mail size={18} /> ข้อความติดต่อ
          {unreadContacts > 0 && (
            <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-xs font-extrabold text-[#0E4F52]">
              {unreadContacts}
            </span>
          )}
        </NavLink>
        {isMainAdmin() && (
          <NavLink to="/admin/admins" className={adminNavClass}>
            <Users size={18} /> แอดมิน
          </NavLink>
        )}
        <NavLink to="/admin/settings" className={adminNavClass}>
          <Settings size={18} /> ตั้งค่าหน้าแรก
        </NavLink>
      </nav>
      {currentAdmin && (
        <div className="mt-6 rounded-lg border border-white/12 bg-white/8 p-3">
          <p className="text-sm font-extrabold text-white">
            {currentAdmin.name || currentAdmin.username}
          </p>
          <p className="mt-1 text-xs font-bold text-white/60">
            {getRoleLabel(currentAdmin.role)}
          </p>
        </div>
      )}
      <button
        type="button"
        className="mt-auto flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-bold text-white/76 transition hover:bg-white/10 hover:text-white"
        onClick={handleLogout}
      >
        <LogOut size={18} /> ออกจากระบบ
      </button>
    </aside>
  )
}

export default AdminSidebar
