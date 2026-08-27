import { Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react'
import { useState } from 'react'
import FormInput from '../components/FormInput'
import Toast from '../components/Toast'
import { companyInfo } from '../data/mockData'
import { useToast } from '../hooks/useToast'
import { saveContact } from '../services/contactService'

const initialForm = {
  name: '',
  phone: '',
  email: '',
  subject: '',
  message: '',
}

const Contact = () => {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast, showToast, clearToast } = useToast()

  const validate = () => {
    const nextErrors = {}
    const phone = form.phone.trim()
    const email = form.email.trim()

    if (!form.name.trim()) nextErrors.name = 'กรุณากรอกชื่อ'
    if (!phone) nextErrors.phone = 'กรุณากรอกเบอร์โทร'
    if (phone && !/^[0-9+\-\s]{8,}$/.test(phone)) {
      nextErrors.phone = 'กรุณากรอกเบอร์โทรให้ถูกต้อง'
    }
    if (!email) nextErrors.email = 'กรุณากรอกอีเมล'
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      nextErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง'
    }
    if (!form.subject.trim()) nextErrors.subject = 'กรุณากรอกหัวข้อ'
    if (!form.message.trim()) nextErrors.message = 'กรุณากรอกข้อความ'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSubmitting || !validate()) return

    setIsSubmitting(true)
    try {
      await saveContact({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      })
      setForm(initialForm)
      setErrors({})
      showToast(
        'ส่งข้อความเรียบร้อย ทีมงานจะติดต่อกลับตามข้อมูลที่ให้ไว้',
      )
    } catch {
      showToast('ส่งข้อความไม่สำเร็จ กรุณาลองใหม่', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Toast toast={toast} onClose={clearToast} />
      <section className="bg-[#106772] py-16 text-white">
        <div className="container-page">
          <p className="text-sm font-bold uppercase text-white/75">Contact</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight md:text-5xl">
            คุยกับบ้านจักรพันธ์เรื่องบ้านที่อยากสร้าง
          </h1>
          <p className="mt-4 max-w-2xl leading-8 text-white/76">
            ส่งรายละเอียดบ้านที่อยากสร้าง ทีมงานจะช่วยประเมินแนวทาง งบประมาณ
            และขั้นตอนถัดไป
          </p>
        </div>
      </section>

      <section className="section-pad bg-[#106772]">
        <div className="container-page grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-5">
            {[
              { icon: Phone, label: 'โทร', value: companyInfo.phone },
              {
                icon: MessageCircle,
                label: 'LINE ID',
                value: companyInfo.lineId,
              },
              { icon: Mail, label: 'อีเมล', value: companyInfo.email },
              { icon: MapPin, label: 'ที่อยู่', value: companyInfo.address },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="surface rounded-lg p-5">
                  <p className="flex items-center gap-2 text-sm font-bold text-[#0E4F52]">
                    <Icon size={18} /> {item.label}
                  </p>
                  <p className="mt-2 font-bold text-[#0E4F52]">{item.value}</p>
                </div>
              )
            })}
            <div className="surface rounded-lg p-5">
              <p className="font-bold text-[#0E4F52]">เวลาเปิดทำการ</p>
              <p className="mt-2 text-[#5e6256]">{companyInfo.hours}</p>
            </div>
            <div className="flex min-h-64 items-center justify-center rounded-lg border border-dashed border-[#0E4F52]/20 bg-white p-6 text-center text-[#5e6256]">
              พื้นที่แผนที่สำหรับแสดงตำแหน่งสำนักงานและจุดนัดหมายโครงการ
            </div>
          </div>

          <form
            className="surface rounded-lg p-5 md:p-7"
            onSubmit={handleSubmit}
          >
            <h2 className="text-2xl font-extrabold text-[#0E4F52]">
              ส่งข้อความถึงเรา
            </h2>
            <div className="mt-6 grid gap-4">
              <FormInput
                label="ชื่อ"
                name="name"
                value={form.name}
                error={errors.name}
                onChange={handleChange}
                required
              />
              <div className="grid gap-4 md:grid-cols-2">
                <FormInput
                  label="เบอร์โทร"
                  name="phone"
                  value={form.phone}
                  error={errors.phone}
                  onChange={handleChange}
                  required
                />
                <FormInput
                  label="อีเมล"
                  type="email"
                  name="email"
                  value={form.email}
                  error={errors.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <FormInput
                label="หัวข้อ"
                name="subject"
                value={form.subject}
                error={errors.subject}
                onChange={handleChange}
                required
              />
              <FormInput
                label="ข้อความ"
                as="textarea"
                name="message"
                rows="6"
                value={form.message}
                error={errors.message}
                onChange={handleChange}
                required
              />
              <button
                type="submit"
                className="btn-primary w-fit disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
              >
                <Send size={18} /> {isSubmitting ? 'กำลังส่ง' : 'ส่งข้อความ'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  )
}

export default Contact
