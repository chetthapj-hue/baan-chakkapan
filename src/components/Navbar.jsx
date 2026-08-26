import { Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import Logo from "./Logo";

const navItems = [
  { label: "หน้าแรก", to: "/" },
  { label: "ผลงาน", to: "/projects" },
  { label: "เกี่ยวกับเรา", to: "/about" },
  { label: "ติดต่อ", to: "/contact" },
];

const navClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-semibold transition ${
    isActive
      ? "bg-white text-[#0E4F52] shadow-sm"
      : "text-white/84 hover:bg-white/10 hover:text-white"
  }`;

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[#B28A55]/70 bg-[#0E4F52]/95 text-white shadow-lg shadow-[#06383B]/14 backdrop-blur">
      <nav className="container-page flex min-h-18 items-center justify-between gap-4">
        <Logo inverse />
        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navClass}>
              {item.label}
            </NavLink>
          ))}
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/admin/login"
            className="btn-ghost border-white/28 bg-white text-sm"
          >
            แอดมินสาธิต
          </Link>
          <Link to="/contact" className="btn-secondary text-sm">
            ปรึกษาสร้างบ้าน
          </Link>
        </div>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-white/28 text-white md:hidden"
          aria-label={open ? "ปิดเมนู" : "เปิดเมนู"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>
      {open && (
        <div className="border-t border-[#B28A55]/60 bg-[#0E4F52] md:hidden">
          <div className="container-page grid gap-2 py-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={navClass}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/admin/login"
              className="btn-ghost mt-2 border-white/30 bg-white"
              onClick={() => setOpen(false)}
            >
              แอดมิน
            </Link>
            <Link
              to="/contact"
              className="btn-secondary"
              onClick={() => setOpen(false)}
            >
              ปรึกษาสร้างบ้าน
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
