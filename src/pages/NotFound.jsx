import { Home, SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'

const NotFound = () => (
  <section className="min-h-[60vh] bg-[#0E4F52] py-20">
    <div className="container-page flex justify-center">
      <div className="max-w-xl rounded-lg bg-white p-8 text-center shadow-xl">
        <SearchX className="mx-auto text-[#0E4F52]" size={48} />
        <h1 className="mt-5 text-3xl font-extrabold text-[#0E4F52]">
          ไม่พบหน้าที่ต้องการ
        </h1>
        <p className="mt-3 leading-7 text-[#5e6256]">
          ลิงก์นี้อาจไม่มีอยู่ หรือผลงานที่ค้นหาอาจยังไม่พร้อมเผยแพร่
        </p>
        <Link to="/" className="btn-primary mt-6">
          <Home size={18} /> กลับหน้าแรก
        </Link>
      </div>
    </div>
  </section>
)

export default NotFound





