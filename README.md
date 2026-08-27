# บ้านจักรพันธ์ Frontend

Frontend สำหรับเว็บไซต์บ้านจักรพันธ์ สร้างด้วย React, Vite, Tailwind CSS, React Router DOM และ Lucide React

## Features

- หน้าเว็บไซต์ลูกค้า: หน้าแรก, ผลงาน, รายละเอียดผลงาน, เกี่ยวกับเรา และติดต่อ
- ระบบค้นหาและกรองผลงาน
- Gallery และแปลนบ้านในหน้ารายละเอียด
- ฟอร์มติดต่อที่ส่งข้อมูลเข้า backend
- ระบบแอดมินสำหรับจัดการผลงานและตั้งค่ารูปหน้าแรก
- เชื่อม backend ผ่าน `VITE_API_BASE_URL`

## Setup

```bash
npm.cmd install
```

สร้างไฟล์ `.env` จาก `.env.example` แล้วตั้งค่า API:

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

## Run

```bash
npm.cmd run dev
```

เปิด URL ที่ Vite แสดง เช่น:

```text
http://localhost:5173/
```

## Routes

- `/`
- `/projects`
- `/projects/:id`
- `/about`
- `/contact`
- `/admin/login`
- `/admin`
- `/admin/projects`
- `/admin/projects/new`
- `/admin/projects/:id/edit`
- `/admin/settings`

## Backend

Backend อยู่ที่:

```text
../baan-chakkapan-back-end
```

รัน backend:

```bash
npm.cmd run server
```

API base URL:

```text
http://localhost:4000/api
```

Admin endpoints ต้องส่ง `Authorization: Bearer <token>` จาก `POST /api/auth/login`

## Checks

```bash
npm.cmd run lint
npm.cmd run build
```
