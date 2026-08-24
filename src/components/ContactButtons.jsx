import { Mail, MessageCircle, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { companyInfo } from '../data/mockData'

const ContactButtons = ({ className = '' }) => (
  <div className={`flex flex-wrap gap-3 ${className}`}>
    <a href={`tel:${companyInfo.phone}`} className="btn-primary">
      <Phone size={18} /> โทร {companyInfo.phone}
    </a>
    <a
      href="https://line.me/R/ti/p/@baanjakkraphan"
      target="_blank"
      rel="noreferrer"
      className="btn-secondary"
    >
      <MessageCircle size={18} /> LINE {companyInfo.lineId}
    </a>
    <Link to="/contact" className="btn-ghost">
      <Mail size={18} /> ส่งข้อความ
    </Link>
  </div>
)

export default ContactButtons


