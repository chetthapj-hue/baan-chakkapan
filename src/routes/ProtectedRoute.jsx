import { Navigate, Outlet, useLocation } from 'react-router-dom'
import {
  isAdminLoggedIn,
  isPasswordChangeRequired,
} from '../services/authService'

const ProtectedRoute = () => {
  const location = useLocation()

  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  if (
    isPasswordChangeRequired() &&
    location.pathname !== '/admin/change-password'
  ) {
    return <Navigate to="/admin/change-password" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
