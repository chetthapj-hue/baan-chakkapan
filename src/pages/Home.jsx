import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  DraftingCompass,
  Handshake,
  Hammer,
  Home as HomeIcon,
  Layers,
  PlayCircle,
  Ruler,
  Sparkles,
  Wrench,
} from "lucide-react";
import { Link } from "react-router-dom";
import ContactButtons from "../components/ContactButtons";
import ImageWithFallback from "../components/ImageWithFallback";
import ProjectCard from "../components/ProjectCard";
import { houseImages } from "../data/mockData";
import { getPublishedProjects } from "../services/projectService";

const services = [
  {
    icon: DraftingCompass,
    title: "ออกแบบบ้าน",
    text: "วางผังบ้านตามขนาดที่ดิน งบประมาณ และวิถีชีวิตของครอบครัว",
  },
  {
    icon: Hammer,
    title: "รับสร้างบ้าน",
    text: "ดูแลงานก่อสร้างด้วยขั้นตอนตรวจรับที่ชัดเจนและสื่อสารง่าย",
  },
  {
    icon: Wrench,
    title: "ต่อเติมและปรับปรุง",
    text: "ช่วยประเมินหน้างานเดิมและออกแบบให้ต่อเนื่องกับบ้านหลัก",
  },
  {
    icon: Handshake,
    title: "ดูแลหลังส่งมอบ",
    text: "ให้คำแนะนำการดูแลบ้านและติดตามรายการเก็บงานตามรอบสัญญา",
  },
];

const process = [
  "พูดคุยความต้องการและงบประมาณ",
  "ออกแบบแนวคิดและประเมินราคา",
  "ก่อสร้างพร้อมรายงานความคืบหน้า",
  "ตรวจรับ ส่งมอบ และดูแลหลังงานจบ",
];

const reasons = [
  "ทีมงานสื่อสารเป็นขั้นตอน เห็นภาพงบและขอบเขตงานก่อนเริ่ม",
  "เลือกวัสดุให้เหมาะกับสภาพอากาศและการใช้งานในประเทศไทย",
  "ออกแบบพื้นที่ให้ดูดีและใช้งานสะดวกในชีวิตประจำวัน",
];

const heroStats = [
  ["120+", "ผลงานออกแบบและก่อสร้าง"],
  ["12 ปี", "ประสบการณ์ทีมงาน"],
  ["96%", "ความพึงพอใจจากลูกค้า"],
];

const buildBrief = [
  { icon: HomeIcon, label: "บ้านโมเดิร์น", value: "ทรงเรียบ คม สว่าง" },
  { icon: Ruler, label: "วางแปลน", value: "ครบพื้นที่ใช้งานจริง" },
  { icon: Layers, label: "งานก่อสร้าง", value: "ดูแลเป็นขั้นตอน" },
];

const Home = () => {
  const publishedProjects = getPublishedProjects();
  const modernProjects = publishedProjects.filter(
    (project) =>
      project.type === "บ้านโมเดิร์น" || project.title.includes("โมเดิร์น"),
  );
  const featuredProjects = (
    modernProjects.length >= 3 ? modernProjects : publishedProjects
  ).slice(0, 3);
  const heroImage = houseImages[9] || houseImages[0];

  return (
    <>
      <section className="relative min-h-[720px] overflow-hidden bg-[#0E4F52] text-white">
        <ImageWithFallback
          src={heroImage.url}
          alt={heroImage.alt}
          loading="eager"
          className="absolute inset-0 h-full w-full object-cover object-center brightness-105 contrast-105 saturate-110"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#073f43]/55 via-[#0E4F52]/35 to-black/5" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-[#5ba19e]" />
        <div className="container-page relative flex min-h-[720px] items-center py-16">
          <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div className="max-w-3xl space-y-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#B28A55]/70 bg-[#b5dee4dc]/62 px-4 py-2 text-sm font-extrabold text-white">
                <Sparkles size={16} /> รับสร้างบ้านโมเดิร์น ออกแบบ
                และดูแลงานครบวงจร
              </span>
              <div className="space-y-5">
                <div className="gold-rule" />
                <h1 className="text-5xl font-black leading-tight text-white md:text-7xl">
                  บ้านจักรพันธ์
                </h1>
                <h2 className="text-4xl font-black">
                  สร้างบ้านดี มีความรับผิดชอบ ถูกใจเจ้าของ
                </h2>
                <p className="max-w-2xl text-lg leading-8 text-white/82 md:text-xl">
                  รับออกแบบและก่อสร้างบ้านครบวงจร ใส่ใจทุกขั้นตอน ตรวจสอบงานได้
                  พร้อมดูแลหลังส่งมอบ ไม่เคยมีประวัติทิ้งงาน ประสบการณ์มากกว่า
                  10 ปี มีวิศวกรสถาปนิกควบคุมดูแล
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/projects" className="btn-secondary">
                  ชมแบบบ้านโมเดิร์น <ArrowRight size={18} />
                </Link>
                <Link
                  to="/contact"
                  className="btn-ghost border-white/30 bg-white text-[#0E4F52]"
                >
                  ปรึกษาสร้างบ้าน
                </Link>
              </div>
              <div className="grid max-w-2xl grid-cols-3 gap-3 pt-4">
                {heroStats.map(([value, label]) => (
                  <div
                    key={label}
                    className="border-l border-[#B28A55]/74 pl-4"
                  >
                    <p className="text-2xl font-black text-white md:text-3xl">
                      {value}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/70 md:text-sm">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="surface-dark hidden rounded-lg p-5 lg:block">
              <div className="flex items-center gap-2 text-sm font-extrabold text-white">
                <BadgeCheck size={18} className="text-[#B28A55]" /> Modern Build
                Brief
              </div>
              <div className="mt-5 grid gap-4">
                {buildBrief.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="flex items-start gap-3 border-t border-white/12 pt-4"
                    >
                      <Icon className="mt-1 text-[#B28A55]" size={20} />
                      <div>
                        <p className="font-extrabold text-white">
                          {item.label}
                        </p>
                        <p className="mt-1 text-sm text-white/70">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="section-pad bg-[#106772] text-white">
        <div className="container-page space-y-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="section-kicker">Featured Projects</p>
              <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">
                แบบบ้านโมเดิร์นแนะนำ
              </h2>
              <p className="mt-3 leading-8 text-white/72">
                รวมแบบบ้านที่มีรูป ราคา พื้นที่ ห้องนอน ห้องน้ำ
                และแปลนให้ดูครบในหน้าเดียว
              </p>
            </div>
            <Link to="/projects" className="btn-ghost w-fit">
              ดูผลงานทั้งหมด <ArrowRight size={18} />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-[#F6F8F4] text-[#202520]">
        <div className="container-page space-y-10">
          <div className="max-w-2xl">
            <p className="text-sm font-extrabold uppercase text-[#0E4F52]">
              Services
            </p>
            <h2 className="mt-2 text-3xl font-black text-[#0E4F52] md:text-4xl">
              บริการของเรา
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <article key={service.title} className="surface rounded-lg p-6">
                  <Icon className="mb-5 text-[#0E4F52]" size={32} />
                  <h3 className="text-lg font-extrabold text-[#0E4F52]">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#5e6256]">
                    {service.text}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-pad bg-[#106772] text-white">
        <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="section-kicker">Process</p>
            <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">
              ขั้นตอนการทำงาน 4 ขั้นตอน
            </h2>
            <p className="mt-4 leading-8 text-white/76">
              เจ้าของบ้านติดตามงานได้ง่าย ตั้งแต่คุยโจทย์แรก จนถึงวันรับกุญแจ
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {process.map((item, index) => (
              <article key={item} className="surface-dark rounded-lg p-5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md border border-[#B28A55] bg-[#0E4F52] font-extrabold text-white">
                  {index + 1}
                </div>
                <h3 className="font-extrabold text-white">{item}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-[#F6F8F4] text-[#202520]">
        <div className="container-page grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="flex items-center gap-2 text-sm font-extrabold uppercase text-[#0E4F52]">
              <PlayCircle size={18} /> Company Video
            </p>
            <h2 className="mt-2 text-3xl font-black text-[#0E4F52] md:text-4xl">
              วิดีโอแนะนำบริษัท
            </h2>
            <p className="mt-4 leading-8 text-[#5e6256]">
              ใช้พื้นที่นี้สำหรับวิดีโอแนะนำทีมงาน รีวิวบ้านลูกค้า
              หรือภาพบรรยากาศระหว่างก่อสร้าง
            </p>
          </div>
          <div className="aspect-video overflow-hidden rounded-lg border border-[#B28A55]/50 bg-black shadow-[0_22px_54px_rgba(6,56,59,0.18)]">
            <iframe
              className="h-full w-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="วิดีโอแนะนำบริษัทบ้านจักรพันธุ์"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      <section className="section-pad bg-[#106772] text-white">
        <div className="container-page grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="section-kicker">Why Us</p>
            <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">
              เหตุผลที่ลูกค้าเลือกบ้านจักรพันธ์
            </h2>
          </div>
          <div className="grid gap-4">
            {reasons.map((reason) => (
              <div key={reason} className="surface rounded-lg p-5">
                <div className="flex gap-4">
                  <CheckCircle2 className="shrink-0 text-[#0E4F52]" size={24} />
                  <p className="leading-7 text-[#5e6256]">{reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#106772] py-14">
        <div className="container-page grid gap-6 rounded-lg border border-[#B28A55]/60 bg-white p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
          <div>
            <p className="flex items-center gap-2 text-sm font-extrabold text-[#0E4F52]">
              <Building2 size={18} /> เริ่มวางแผนบ้านของคุณ
            </p>
            <h2 className="mt-2 text-2xl font-black text-[#0E4F52]">
              นัดคุยโจทย์บ้าน งบประมาณ และพื้นที่จริงได้เลย
            </h2>
          </div>
          <ContactButtons />
        </div>
      </section>
    </>
  );
};

export default Home;
