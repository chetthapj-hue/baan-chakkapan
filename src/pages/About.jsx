import { Award, Building2, ShieldCheck, Users } from "lucide-react";
import ImageWithFallback from "../components/ImageWithFallback";
import { houseImages } from "../data/mockData";

const stats = [
  ["120+", "บ้านที่ส่งมอบ"],
  ["12 ปี", "ประสบการณ์ทีมงาน"],
  ["35+", "ทีมช่างและผู้ประสานงาน"],
  ["96%", "ความพึงพอใจจากลูกค้า"],
];

const team = [
  {
    id: "team-member-1",
    nickname: "จักร",
    fullName: "พันธนนท์ สุปินนะ",
    role: "ผู้ก่อตั้งบริษัท",
    phone: "083-481-8025",
  },
  {
    id: "team-member-2",
    nickname: "กัปตัน",
    fullName: "ชนิตพล ขันขาว",
    role: "สถาปนิก[สถ.บ.]",
    phone: "095-191-6954",
  },
  {
    id: "team-member-3",
    nickname: "นัท",
    fullName: "ณัฐพล กาวิล",
    role: "สถาปนิก",
    phone: "099-508-5983",
  },
  {
    id: "team-member-4",
    nickname: "ไอซ์",
    fullName: "กรรชัย จันจินา",
    role: "โฟร์แมน",
    phone: "0931793744",
  },
  {
    id: "team-member-5",
    nickname: "ไมค์",
    fullName: "วทัญญู แก้วเกตุ",
    role: "ผู้ประสานงานและสื่อดิจิทัล",
    phone: "093-179-3744",
  },
];

const About = () => (
  <>
    <section className="bg-[#106772] py-16 text-white">
      <div className="container-page grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-bold uppercase text-white/75">About Us</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight md:text-5xl">
            บ้านจักรพันธ์ ทีมรับสร้างบ้านที่เริ่มจากการฟังเจ้าของบ้านให้ชัด
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
            บ้านจักรพันธ์ — เราไม่ได้สร้างเพียงบ้าน แต่สร้างความไว้ใจ
            บ้านจักรพันธ์ ดำเนินงานด้านการออกแบบและก่อสร้างบ้าน
            ด้วยความตั้งใจที่จะสร้างบ้านที่มีคุณภาพ ควบคู่ไปกับความซื่อสัตย์
            ความรับผิดชอบ และการดูแลลูกค้าในทุกขั้นตอน ตลอดระยะเวลากว่า 10 ปี
            เราได้เรียนรู้ว่า สำหรับเจ้าของบ้าน “บ้านหนึ่งหลัง”
            ไม่ใช่เพียงสิ่งปลูกสร้าง แต่คือเงินเก็บ ความฝัน และอนาคตของครอบครัว
            เราจึงให้ความสำคัญตั้งแต่การออกแบบ การเลือกวัสดุ
            การควบคุมคุณภาพงานก่อสร้าง ไปจนถึงการตรวจสอบและส่งมอบบ้าน
          </p>
          <p>
            เรายึดมั่นในการทำงานอย่างตรงไปตรงมา ไม่ทิ้งงาน ตรวจสอบได้
            และรับผิดชอบต่อผลงานของเรา
            พร้อมดูแลลูกค้าต่อเนื่องแม้หลังจากส่งมอบบ้านแล้ว
            วันนี้บ้านจักรพันธ์ยังคงพัฒนาทีมงาน ระบบการทำงาน
            และมาตรฐานการก่อสร้างอย่างต่อเนื่อง เพื่อให้ทุกครอบครัวมั่นใจได้ว่า
            บ้านที่เราสร้างจะเป็นบ้านที่พวกเขาภูมิใจและอยู่อาศัยได้อย่างมีความสุข
            บ้านจักรพันธ์ “สร้างบ้านดี มีความรับผิดชอบ ถูกใจเจ้าของ”
          </p>
        </div>
      </div>
    </section>

    <section className="section-pad bg-[#106772]">
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
            title: "วิสัยทัศน์",
            text: "สร้างบ้านที่สะท้อนตัวตนเจ้าของบ้าน โดยยังคุมงบประมาณและดูแลการใช้งานระยะยาว",
          },
          {
            icon: ShieldCheck,
            title: "มาตรฐานงานก่อสร้าง",
            text: "กำหนดจุดตรวจงานสำคัญ เช่น โครงสร้าง ระบบไฟ ระบบประปา และงานเก็บรายละเอียดก่อนส่งมอบ",
          },
          {
            icon: Award,
            title: "แนวคิดการทำงาน",
            text: "สื่อสารตรงไปตรงมา อธิบายทางเลือก และให้เจ้าของบ้านตัดสินใจจากข้อมูลที่เห็นภาพ",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article
              key={item.title}
              className="rounded-lg border border-[#0E4F52]/10 p-6"
            >
              <Icon className="mb-5 text-[#0E4F52]" size={32} />
              <h2 className="text-xl font-extrabold text-[#0E4F52]">
                {item.title}
              </h2>
              <p className="mt-3 leading-7 text-[#5e6256]">{item.text}</p>
            </article>
          );
        })}
      </div>
    </section>

    <section className="section-pad bg-[#106772] text-white">
      <div className="container-page space-y-8">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold uppercase text-white/75">
            <Users size={18} /> Team
          </p>
          <h2 className="mt-2 text-3xl font-extrabold">ทีมงานของเรา</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {team.map(({ id, nickname, fullName, role, phone }) => (
            <article
              key={id}
              className="rounded-lg border border-white/12 bg-white/8 p-6 ring-1 ring-[#B28A55]"
            >
              {/* <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-white text-xl font-extrabold text-black">
                {nickname.slice(0, 2)}
              </div> */}

              <p className="text-xs font-bold uppercase text-white/60">
                ชื่อเล่น
              </p>
              <h3 className="mt-1 text-lg font-extrabold">{nickname}</h3>

              <p className="mt-4 text-xs font-bold uppercase text-white/60">
                ชื่อ-นามสกุล
              </p>
              <p className="mt-1 font-semibold text-white">{fullName}</p>

              <p className="mt-2 text-sm text-white/72">{role}</p>

              <a
                href={`tel:${phone}`}
                className="mt-2 block text-sm font-semibold text-[#e7c58f] hover:text-white"
              >
                โทร: {phone}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  </>
);

export default About;
