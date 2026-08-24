import { Outlet } from 'react-router-dom'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'

const PublicLayout = () => (
  <div className="min-h-screen bg-[#0E4F52] text-[#202520]">
    <Navbar />
    <main>
      <Outlet />
    </main>
    <Footer />
  </div>
)

export default PublicLayout



