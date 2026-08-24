import { Outlet } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'

const AdminLayout = () => (
  <div className="grid min-h-screen bg-[#EAF4F2] lg:grid-cols-[280px_1fr]">
    <AdminSidebar />
    <main className="min-w-0 p-4 md:p-8">
      <Outlet />
    </main>
  </div>
)

export default AdminLayout





