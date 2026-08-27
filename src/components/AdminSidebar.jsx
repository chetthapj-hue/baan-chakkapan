import { FolderKanban, LayoutDashboard, LogOut, Settings } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { getCurrentAdmin, getRoleLabel } from '../services/adminUserService'
import { logoutAdmin } from '../services/authService'
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
