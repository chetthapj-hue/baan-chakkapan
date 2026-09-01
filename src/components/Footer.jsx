import { Mail, MapPin, MessageCircle, Phone, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { companyInfo } from "../data/mockData";
import Logo from "./Logo";

const phoneHref = `tel:${companyInfo.phone.replace(/\s/g, "")}`;

const Footer = () => (
  <footer className="bg-[#0E4F52] text-white">
    <div className="container-page grid gap-10 py-12 md:grid-cols-[1.25fr_1fr_1fr]">
      <div className="space-y-5">
        <Logo to="/" inverse />
        <p className="max-w-md text-sm leading-7 text-white/76">
          รับออกแบบและก่อสร้างบ้านครบวงจร ใส่ใจทุกขั้นตอน ตรวจสอบงานได้
          พร้อมดูแลหลังส่งมอบ ไม่เคยมีประวัติทิ้งงาน ประสบการณ์มากกว่า 10 ปี
          มีวิศวกรสถาปนิกควบคุมดูแล
        </p>
      </div>
      <div>
        <h2 className="mb-4 text-base font-bold">เมนูเว็บไซต์</h2>
        <div className="grid gap-3 text-sm text-white/78">
          <Link to="/projects" className="hover:text-white">
            ผลงานและแบบบ้าน
          </Link>
          <Link to="/about" className="hover:text-white">
            เกี่ยวกับเรา
          </Link>
          <Link to="/contact" className="hover:text-white">
            ติดต่อเรา
          </Link>
        </div>
      </div>
      <div>
        <h2 className="mb-4 text-base font-bold">ติดต่อบ้านจักรพันธ์</h2>
        <div className="grid gap-3 text-sm text-white/78">
          <a href={phoneHref} className="flex items-center gap-2 hover:text-white">
            <Phone size={16} /> {companyInfo.phone}
          </a>
          <a
            href={companyInfo.lineUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 hover:text-white"
          >
            <MessageCircle size={16} /> LINE ID {companyInfo.lineId}
          </a>
          <a
            href={companyInfo.facebookUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 hover:text-white"
          >
            <Share2 size={16} /> {companyInfo.facebook}
          </a>
          <a
            href={`mailto:${companyInfo.email}`}
            className="flex items-center gap-2 hover:text-white"
          >
            <Mail size={16} /> {companyInfo.email}
          </a>
          <a
            href={companyInfo.mapUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-start gap-2 hover:text-white"
          >
            <MapPin className="mt-1" size={16} /> {companyInfo.address}
          </a>
        </div>
      </div>
    </div>
    <div className="border-t border-[#B28A55] py-4 text-center text-xs text-white/58">
      © 2026 บ้านจักรพันธ์ สงวนลิขสิทธิ์
    </div>
  </footer>
);

export default Footer;