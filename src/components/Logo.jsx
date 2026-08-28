import { Link } from "react-router-dom";
import logoImg from "../assets/logo2.png";

const Logo = ({ compact = false, inverse = false, to = "/" }) => {
  const content = (
    <div className="flex items-center gap-3">
      <img
        src={logoImg}
        alt="บ้านจักรพันธ์"
        className="h-14 w-14 shrink-0 object-contain"
      />

      {!compact && (
        <div className="flex flex-col">
          <span
            className={`text-[19px] font-bold leading-none tracking-tight ${
              inverse ? "text-white" : "text-[#0E4F52]"
            }`}
          >
            BANCHAKKAPAN
          </span>

          <span
            className={`mt-1 text-[11px] font-medium ${
              inverse ? "text-white/70" : "text-[#77776b]"
            }`}
          >
            รับสร้างบ้านและออกแบบครบวงจร
          </span>
        </div>
      )}
    </div>
  );

  if (!to) return content;

  return (
    <Link
      to={to}
      aria-label="กลับสู่หน้าแรก บ้านจักรพันธ์"
      className="inline-flex"
    >
      {content}
    </Link>
  );
};

export default Logo;
