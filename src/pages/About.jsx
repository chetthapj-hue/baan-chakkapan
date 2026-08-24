import { Award, Building2, ShieldCheck, Users } from 'lucide-react'
import ImageWithFallback from '../components/ImageWithFallback'
import { houseImages } from '../data/mockData'

const stats = [
  ['120+', 'บ้านที่ส่งมอบ'],
  ['12 ปี', 'ประสบการณ์ทีมงาน'],
  ['35+', 'ทีมช่างและผู้ประสานงาน'],
  ['96%', 'ความพึงพอใจจากลูกค้า'],
]

const team = [
  ['คุณจักรพันธุ์', 'ผู้ประสานงานโครงการ'],
  ['คุณภัทรา', 'สถาปนิกและที่ปรึกษาแบบบ้าน'],
  ['คุณธนากร', 'วิศวกรควบคุมงาน'],
]

const About = () => (
  <>
    <section className="bg-[#0E4F52] py-16 text-white">
      <div className="container-page grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-bold uppercase text-white/75">About Us</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight md:text-5xl">
            บ้านจักรพันธุ์ ทีมรับสร้างบ้านที่เริ่มจากการฟังเจ้าของบ้านให้ชัด
          </h1>
          <p className="mt-5 leading-8 text-white/76">
            เราดูแลเจ้าของบ้านตั้งแต่สำรวจที่ดิน ออกแบบ วางงบประมาณ
            ไปจนถึงควบคุมงานก่อสร้างและส่งมอบบ้านให้พร้อมใช้งาน
          </p>
        </div>
        <div className="aspect-[4/3] overflow-hidden rounded-lg">
          <ImageWithFallback
            src={houseImages[2].url}
            alt={houseImages[2].alt}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>

    <section className="section-pad bg-white">
      <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-sm font-bold uppercase text-[#0E4F52]">Story</p>
          <h2 className="mt-2 text-3xl font-extrabold text-[#0E4F52]">
            ประวัติบริษัท
          </h2>
        </div>
        <div className="space-y-5 leading-8 text-[#5e6256]">
          <p>
            บ้านจักรพันธุ์เป็นทีมออกแบบและรับสร้างบ้าน
            ที่ดูแลเจ้าของบ้านตั้งแต่สำรวจที่ดิน
            ออกแบบ วางงบประมาณ ประสานงานก่อสร้าง และส่งมอบบ้านพร้อมรายการตรวจรับ
          </p>
          <p>
            แนวคิดการทำงานคือทำให้เรื่องสร้างบ้านเข้าใจง่ายขึ้น
            เจ้าของบ้านควรเห็นขอบเขตงาน วัสดุ ระยะเวลา และจุดตัดสินใจที่สำคัญก่อนเริ่มงานจริง
          </p>
        </div>
      </div>
    </section>

    <section className="section-pad bg-[#0E4F52]">
      <div className="container-page grid gap-4 md:grid-cols-4">
        {stats.map(([value, label]) => (
          <div key={label} className="surface rounded-lg p-6">
            <p className="text-3xl font-extrabold text-[#0E4F52]">{value}</p>
            <p className="mt-2 text-sm text-[#5e6256]">{label}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="section-pad bg-white">
      <div className="container-page grid gap-6 md:grid-cols-3">
        {[
          {
            icon: Building2,
            title: 'วิสัยทัศน์',
            text: 'สร้างบ้านที่สะท้อนตัวตนเจ้าของบ้าน โดยยังคุมงบประมาณและดูแลการใช้งานระยะยาว',
          },
          {
            icon: ShieldCheck,
            title: 'มาตรฐานงานก่อสร้าง',
            text: 'กำหนดจุดตรวจงานสำคัญ เช่น โครงสร้าง ระบบไฟ ระบบประปา และงานเก็บรายละเอียดก่อนส่งมอบ',
          },
          {
            icon: Award,
            title: 'แนวคิดการทำงาน',
            text: 'สื่อสารตรงไปตรงมา อธิบายทางเลือก และให้เจ้าของบ้านตัดสินใจจากข้อมูลที่เห็นภาพ',
          },
        ].map((item) => {
          const Icon = item.icon
          return (
            <article key={item.title} className="rounded-lg border border-[#0E4F52]/10 p-6">
              <Icon className="mb-5 text-[#0E4F52]" size={32} />
              <h2 className="text-xl font-extrabold text-[#0E4F52]">{item.title}</h2>
              <p className="mt-3 leading-7 text-[#5e6256]">{item.text}</p>
            </article>
          )
        })}
      </div>
    </section>

    <section className="section-pad bg-[#0E4F52] text-white">
      <div className="container-page space-y-8">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold uppercase text-white/75">
            <Users size={18} /> Team
          </p>
          <h2 className="mt-2 text-3xl font-extrabold">ทีมงานของเรา</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {team.map(([name, role]) => (
            <article key={name} className="rounded-lg border border-white/12 bg-white/8 p-6">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-white text-xl font-extrabold text-[#0E4F52]">
                {name.slice(3, 5)}
              </div>
              <h3 className="text-lg font-extrabold">{name}</h3>
              <p className="mt-2 text-sm text-white/72">{role}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  </>
)

export default About





