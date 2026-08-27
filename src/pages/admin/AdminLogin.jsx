import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Logo from '../../components/Logo'
import { isAdminLoggedIn, loginAdmin } from '../../services/authService'

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  if (isAdminLoggedIn()) return <Navigate to="/admin" replace />

  const handleChange = (event) => {
    const { name, value } = event.target
    setCredentials((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    const success = await loginAdmin(credentials)
    setIsSubmitting(false)

    if (!success) {
      setError('Username หรือ Password ไม่ถูกต้อง')
      return
    }

    navigate('/admin')
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#0E4F52] px-4 py-10">
      <section className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-6">
          <Logo />
        </div>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-semibold text-[#0E4F52]">
            Username
            <input
              className="form-field"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-[#0E4F52]">
            Password
            <input
              className="form-field"
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </label>
          {error && <p className="text-sm font-bold text-red-600">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            เข้าสู่ระบบแอดมิน
          </button>
          <Link to="/" className="text-center text-sm font-bold text-[#0E4F52]">
            กลับหน้าเว็บไซต์
          </Link>
        </form>
      </section>
    </main>
  )
}

export default AdminLogin
