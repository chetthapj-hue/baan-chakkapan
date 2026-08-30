import { BrowserRouter, Route, Routes } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout'
import AdminLayout from '../layouts/AdminLayout'
import ProtectedRoute from './ProtectedRoute'
import Home from '../pages/Home'
import Projects from '../pages/Projects'
import ProjectDetail from '../pages/ProjectDetail'
import About from '../pages/About'
import Contact from '../pages/Contact'
import NotFound from '../pages/NotFound'
import AdminLogin from '../pages/admin/AdminLogin'
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminProjects from '../pages/admin/AdminProjects'
import ProjectForm from '../pages/admin/ProjectForm'
import AdminSettings from '../pages/admin/AdminSettings'
import AdminUsers from '../pages/admin/AdminUsers'
import AdminContacts from '../pages/admin/AdminContacts'
import AdminHouseTypes from '../pages/admin/AdminHouseTypes'
import AdminProjectStatuses from '../pages/admin/AdminProjectStatuses'
import AdminChangePassword from '../pages/admin/AdminChangePassword'

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
      </Route>

      <Route path="admin/login" element={<AdminLogin />} />
      <Route path="admin" element={<ProtectedRoute />}>
        <Route path="change-password" element={<AdminChangePassword />} />
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="projects/new" element={<ProjectForm mode="new" />} />
          <Route path="projects/:id/edit" element={<ProjectForm mode="edit" />} />
          <Route path="contacts" element={<AdminContacts />} />
          <Route path="house-types" element={<AdminHouseTypes />} />
          <Route path="project-statuses" element={<AdminProjectStatuses />} />
          <Route path="admins" element={<AdminUsers />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
)

export default AppRoutes
