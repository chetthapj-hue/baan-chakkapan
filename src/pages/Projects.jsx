import { Home, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import ProjectCard from "../components/ProjectCard";
import { projectStatuses, projectTypes } from "../data/mockData";
import { getPublishedProjects } from "../services/projectService";

const priceRanges = [
  { label: "ทุกช่วงราคา", value: "all" },
  { label: "ไม่เกิน 1 ล้านบาท", value: "under-1" },
  { label: "3-5 ล้านบาท", value: "3-5" },
  { label: "มากกว่า 5 ล้านบาท", value: "over-5" },
];

const Projects = () => {
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    status: "all",
    price: "all",
  });

  const projects = getPublishedProjects();
  const modernCount = projects.filter(
    (project) =>
      project.type === "บ้านโมเดิร์น" || project.title.includes("โมเดิร์น"),
  ).length;

  const filteredProjects = useMemo(
    () =>
      projects.filter((project) => {
        const searchMatch = project.title
          .toLowerCase()
          .includes(filters.search.toLowerCase());
        const typeMatch =
          filters.type === "all" || project.type === filters.type;
        const statusMatch =
          filters.status === "all" || project.status === filters.status;
        const price = Number(project.priceValue);
        const priceMatch =
          filters.price === "all" ||
          (filters.price === "under-1" && price < 1000000) ||
          (filters.price === "3-5" && price >= 3000000 && price <= 5000000) ||
          (filters.price === "over-5" && price > 5000000);

        return searchMatch && typeMatch && statusMatch && priceMatch;
      }),
    [projects, filters],
  );

  const updateFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
  };

  return (
    <>
      <section className="relative overflow-hidden bg-[#106772] py-16 text-white">
        <div className="absolute inset-x-0 bottom-0 h-px bg-[#B28A55]" />
        <div className="container-page">
          <p className="section-kicker">Projects</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight md:text-5xl">
            ผลงานก่อสร้างและแบบบ้านโมเดิร์น
          </h1>
          <p className="mt-4 max-w-2xl leading-8 text-white/76">
            ค้นหาแบบบ้านตามราคา ประเภทงาน และสถานะ พร้อมดูรายละเอียดครบทั้งรูป
            ราคา พื้นที่ ห้องนอน ห้องน้ำ และแปลน
          </p>
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {[
              [`${projects.length}`, "แบบบ้านทั้งหมด"],
              [`${modernCount}`, "แบบโมเดิร์น"],
              ["100%", "มีแปลนประกอบ"],
            ].map(([value, label]) => (
              <div key={label} className="surface-dark rounded-lg p-5">
                <p className="text-3xl font-black text-white">{value}</p>
                <p className="mt-1 text-sm text-white/70">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-[#F6F8F4]">
        <div className="container-page space-y-8">
          <div className="surface rounded-lg p-4 md:p-5">
            <div className="mb-4 flex items-center gap-2 font-extrabold text-[#0E4F52]">
              <SlidersHorizontal size={20} /> ค้นหาและกรองผลงาน
            </div>
            <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
              <label className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#0E4F52]"
                  size={18}
                />
                <input
                  className="form-field !pl-10"
                  value={filters.search}
                  onChange={(event) =>
                    updateFilter("search", event.target.value)
                  }
                  placeholder="ค้นหาจากชื่อผลงาน"
                  aria-label="ค้นหาจากชื่อผลงาน"
                />
              </label>
              <select
                className="form-field"
                value={filters.type}
                onChange={(event) => updateFilter("type", event.target.value)}
                aria-label="กรองประเภทบ้าน"
              >
                <option value="all">ทุกประเภทบ้าน</option>
                {projectTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <select
                className="form-field"
                value={filters.status}
                onChange={(event) => updateFilter("status", event.target.value)}
                aria-label="กรองสถานะงาน"
              >
                <option value="all">ทุกสถานะ</option>
                {projectStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <select
                className="form-field"
                value={filters.price}
                onChange={(event) => updateFilter("price", event.target.value)}
                aria-label="กรองช่วงราคา"
              >
                {priceRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredProjects.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-[#0E4F52]/20 bg-white p-10 text-center">
              <Home className="mx-auto text-[#0E4F52]" size={40} />
              <h2 className="mt-4 text-2xl font-extrabold text-[#0E4F52]">
                ไม่พบผลงานที่ตรงกับเงื่อนไข
              </h2>
              <p className="mt-3 text-[#5e6256]">
                ลองล้างคำค้นหาหรือปรับตัวกรองช่วงราคา ประเภทบ้าน และสถานะงาน
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Projects;
