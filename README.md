# บ้านจักรพันธุ์ Frontend Mock

เว็บไซต์ frontend สำหรับธุรกิจรับสร้างบ้าน “บ้านจักรพันธุ์” สร้างด้วย React + Vite, JavaScript, Tailwind CSS v4, React Router DOM และ Lucide React โดยรอบนี้เป็นระบบ Mock ทั้งหมด ยังไม่มี Backend, API, MongoDB หรือระบบอัปโหลดไฟล์จริง

## ความสามารถหลัก

- หน้าเว็บไซต์ลูกค้า: หน้าแรก, รวมผลงาน, รายละเอียดผลงาน, เกี่ยวกับเรา และติดต่อ
- ระบบค้นหาและกรองผลงานตามชื่อ ประเภทบ้าน สถานะ และช่วงราคา
- Gallery พร้อม Lightbox ในหน้ารายละเอียดผลงาน
- แบบฟอร์มติดต่อพร้อม validation และบันทึกข้อความตัวอย่างลง `localStorage`
- ระบบแอดมินสาธิตสำหรับเพิ่ม แก้ไข ลบ เปลี่ยนสถานะเผยแพร่ และจัดการผลงาน
- ระบบเมนแอดมินสำหรับสร้างและลบแอดมิน mock พร้อมชื่อแอดมิน
- Seed ข้อมูล Mock อัตโนมัติครั้งแรก โดยไม่เขียนทับข้อมูลที่ผู้ใช้เพิ่มเอง

## วิธีติดตั้ง

```bash
npm install
```

หากใช้งานบน PowerShell แล้วติด execution policy ให้ใช้คำสั่งรูปแบบนี้แทน:

```bash
npm.cmd install
```

## วิธีเปิดใช้งาน

```bash
npm run dev
```

บน PowerShell สามารถใช้:

```bash
npm.cmd run dev
```

จากนั้นเปิด URL ที่ Vite แสดงใน terminal เช่น `http://localhost:5173/`

## Routes

- `/` หน้าแรก
- `/projects` หน้ารวมผลงานและแบบบ้าน
- `/projects/:id` หน้ารายละเอียดผลงาน
- `/about` หน้าเกี่ยวกับเรา
- `/contact` หน้าติดต่อ
- `/admin/login` หน้าเข้าสู่ระบบแอดมิน
- `/admin` หน้า Dashboard
- `/admin/projects` หน้าจัดการผลงาน
- `/admin/projects/new` หน้าเพิ่มผลงาน
- `/admin/projects/:id/edit` หน้าแก้ไขผลงาน
- `/admin/admins` หน้าจัดการแอดมิน

## บัญชีแอดมินทดลอง

- ชื่อแอดมิน: `เมนแอดมิน`
- Username: `admin`
- Password: `baan1234`

บัญชีนี้เป็นเมนแอดมินสำหรับสาธิต frontend สามารถสร้างและลบแอดมิน mock คนอื่นได้ ห้ามนำไปใช้กับ Production

## โครงสร้างโปรเจกต์

```text
src/
  components/      component ที่ใช้ซ้ำ เช่น Navbar, Logo, ProjectCard, Toast
  data/            mockData และ URL รูปภาพตัวอย่าง
  hooks/           hook สำหรับ projects และ toast
  layouts/         layout หน้าเว็บและแอดมิน
  pages/           หน้าเว็บไซต์ลูกค้า
  pages/admin/     หน้าแอดมินสาธิต
  routes/          route และ protected route
  services/        localStorage service, project, auth, contact
  utils/           formatter และ helper
```

## ข้อจำกัดของระบบ Mock

- ข้อมูลผลงาน ข้อความติดต่อ และ session แอดมินเก็บใน `localStorage`
- รูปที่อัปโหลดในแอดมินถูกแปลงเป็น Data URL และเก็บใน `localStorage` เฉพาะเพื่อสาธิต
- จำกัดรูป Gallery ไม่เกิน 10 รูป และรูปละไม่เกิน 2 MB
- ไม่มีระบบสิทธิ์ผู้ใช้จริง ไม่มีการ hash password และไม่มี API security
- รูปบ้านเริ่มต้นใช้ URL จาก Unsplash พร้อม fallback placeholder

## แนวทางเชื่อม Backend ภายหลัง

1. เปลี่ยน `src/services/projectService.js` จาก `localStorage` เป็น REST API หรือ GraphQL
2. เพิ่ม Backend สำหรับ auth จริง เช่น JWT/session พร้อม hash password และ role-based access
3. เก็บข้อมูลผลงานและข้อความติดต่อใน MongoDB แทน `localStorage`
4. เปลี่ยนการเก็บรูปจาก Data URL เป็น Cloudinary, S3 หรือ object storage อื่น
5. เพิ่ม validation ฝั่ง server และกำหนด schema สำหรับ project/contact ให้ตรงกับ frontend
6. เพิ่ม environment variables สำหรับ API endpoint และ upload preset

## ตรวจสอบโปรเจกต์

```bash
npm run lint
npm run build
```

บน PowerShell:

```bash
npm.cmd run lint
npm.cmd run build
```

## Backend API สำหรับเชื่อมต่อ

รอบนี้มี backend dev server อยู่ที่ `C:\Coding\baan-chakkapan-back-end` แล้ว โดยตั้งใจให้รันได้ด้วย Node.js built-in API ก่อน ยังไม่ต้องติดตั้ง dependency เพิ่ม และ backend code ทั้งหมดอยู่ในโฟลเดอร์แยกนี้

```bash
npm run server
```

API จะเปิดที่ `http://localhost:4000/api` และจะ seed ข้อมูล mock เดิมลงไฟล์ `C:\Coding\baan-chakkapan-back-end\data\projects.json` อัตโนมัติครั้งแรก ส่วนข้อความติดต่อจะอยู่ใน `C:\Coding\baan-chakkapan-back-end\data\contacts.json`

ดูรายละเอียด backend เพิ่มเติมได้ที่ `C:\Coding\baan-chakkapan-back-end\README.md`

ถ้าต้องการให้ frontend เรียก backend ให้สร้างไฟล์ `.env` จาก `.env.example` แล้วตั้งค่า:

```bash
VITE_API_BASE_URL=http://localhost:4000/api
```

Endpoint หลัก:

- `POST /api/auth/login`
- `GET /api/projects?publishStatus=published`
- `GET /api/projects`
- `GET /api/projects/:id`
- `POST /api/projects`
- `PUT /api/projects/:id`
- `PATCH /api/projects/:id/publish-status`
- `DELETE /api/projects/:id`
- `POST /api/contacts`
- `GET /api/contacts`

Endpoint admin ต้องส่ง `Authorization: Bearer <token>` จาก login ยกเว้นรายการ project ที่เผยแพร่และการส่ง contact form

