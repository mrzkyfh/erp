# 🏢 Rumah Kue Nuraisah - ERP System

> **Enterprise Resource Planning System** untuk manajemen bisnis kecil dan menengah dengan fitur lengkap: manajemen karyawan, absensi, lembur, penggajian, inventori, dan customer management.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v25.9.0-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-brightgreen)](https://supabase.com/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-orange)](https://workers.cloudflare.com/)

---

## 📸 Preview

### Dashboard
![Dashboard](https://via.placeholder.com/800x400?text=Dashboard+Preview)

### Manajemen Karyawan
![Employees](https://via.placeholder.com/800x400?text=Employee+Management)

### Sistem Lembur
![Overtime](https://via.placeholder.com/800x400?text=Overtime+System)

### Penggajian Terintegrasi
![Payroll](https://via.placeholder.com/800x400?text=Payroll+System)

---

## ✨ Fitur Utama

### 👥 **Manajemen Karyawan**
- ✅ CRUD karyawan dengan role-based access (Owner/Karyawan)
- ✅ Profil lengkap: nama, email, nomor HP, alamat, tanggal masuk
- ✅ Konfigurasi komponen gaji per karyawan
- ✅ Status karyawan (Aktif/Nonaktif)
- ✅ Integrasi dengan Supabase Auth

### 📅 **Sistem Absensi**
- ✅ Check-in/Check-out real-time dengan tracking waktu
- ✅ Status kehadiran: Hadir, Telat, Izin, Sakit
- ✅ Perhitungan otomatis jam kerja
- ✅ Riwayat absensi dengan filter tanggal
- ✅ Integrasi dengan perhitungan gaji

### ⏰ **Sistem Lembur (Overtime)**
- ✅ Start/End overtime session dengan tracking real-time
- ✅ Approval workflow: Pending → Approved/Rejected
- ✅ Custom overtime rate per karyawan
- ✅ Perhitungan earnings otomatis
- ✅ Status filtering dan analytics
- ✅ Integrasi dengan payroll untuk perhitungan gaji

### 💰 **Sistem Penggajian Terintegrasi**
- ✅ Perhitungan gaji otomatis berdasarkan:
  - Kehadiran (per hari hadir)
  - Jam kerja reguler (per jam)
  - Jam lembur yang disetujui (per jam)
  - Komponen gaji custom per karyawan
- ✅ Breakdown komponen gaji detail
- ✅ Konfirmasi pembayaran dengan timestamp
- ✅ Riwayat payroll per periode
- ✅ Support multiple salary components

### 📦 **Manajemen Inventori**
- ✅ CRUD inventory items dengan kategori
- ✅ Tracking stock real-time
- ✅ Supplier management
- ✅ Transaksi pembelian dan penggunaan
- ✅ Pengeluaran bahan material
- ✅ Alert minimum stock
- ✅ Riwayat transaksi dengan filter tanggal
- ✅ Delete item dengan cascade transaksi

### 👤 **Customer Management**
- ✅ CRUD customer dengan kontak lengkap
- ✅ Tracking customer untuk order/transaksi
- ✅ Status customer (Aktif/Nonaktif)

### ⚙️ **Pengaturan Bisnis**
- ✅ Konfigurasi komponen gaji global
- ✅ Setup salary types dengan unit berbeda
- ✅ Business settings dan preferences

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  - Vite + React 18                                       │
│  - Tailwind CSS + Shadcn UI                              │
│  - Responsive Design (Mobile-First)                      │
│  - Real-time Updates                                     │
└────────────────┬────────────────────────────────────────┘
                 │ HTTPS
┌────────────────▼────────────────────────────────────────┐
│              Backend (Hono + Cloudflare Workers)         │
│  - Serverless API                                        │
│  - JWT Authentication                                    │
│  - Role-Based Access Control                             │
│  - Error Handling & Validation                           │
└────────────────┬────────────────────────────────────────┘
                 │ PostgreSQL
┌────────────────▼────────────────────────────────────────┐
│           Database (Supabase PostgreSQL)                 │
│  - 15+ Tables dengan relationships                       │
│  - Row Level Security (RLS)                              │
│  - Real-time Subscriptions                               │
│  - Automated Backups                                     │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS + Shadcn UI Components
- **State Management:** Zustand
- **HTTP Client:** Fetch API
- **Auth:** Supabase Auth
- **Icons:** Lucide React
- **Notifications:** Sonner Toast

### Backend
- **Runtime:** Cloudflare Workers (Serverless)
- **Framework:** Hono (Lightweight Web Framework)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** JWT + Supabase Auth
- **Deployment:** Cloudflare Workers

### Database
- **DBMS:** PostgreSQL (Supabase)
- **ORM:** Supabase JS Client
- **Migrations:** SQL Scripts
- **Security:** Row Level Security (RLS)

### DevOps & Deployment
- **Frontend Hosting:** Cloudflare Pages
- **Backend Hosting:** Cloudflare Workers
- **Version Control:** Git + GitHub
- **CI/CD:** Manual deployment via Wrangler CLI

---

## 📊 Database Schema

### Core Tables
- `profiles` - User profiles & authentication
- `employees` - Employee data & salary info
- `attendance_logs` - Daily attendance records
- `overtime_logs` - Overtime tracking & approval
- `payroll_periods` - Payroll period management
- `payroll_details` - Employee payroll per period
- `payroll_items` - Salary component breakdown

### Inventory Tables
- `inventory_items` - Product/material items
- `inventory_categories` - Item categories
- `suppliers` - Supplier information
- `stock_purchases` - Purchase transactions
- `stock_purchase_items` - Purchase line items
- `stock_usages` - Material usage tracking
- `inventory_transactions` - All inventory movements

### Business Tables
- `customers` - Customer information
- `salary_types` - Salary component definitions
- `employee_salary_components` - Custom rates per employee
- `business_settings` - System configuration

---

## 🚀 Quick Start

### Prerequisites
- Node.js v25.9.0+
- npm v11.12.1+
- Git
- Supabase account
- Cloudflare account

### Installation

1. **Clone Repository**
```bash
git clone https://github.com/mrzkyfh/erp.git
cd erp
```

2. **Setup Backend**
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env dengan Supabase credentials

# Deploy ke Cloudflare Workers
npx wrangler deploy
```

3. **Setup Frontend**
```bash
cd frontend
npm install

# Create .env file
cp .env.example .env
# Edit .env dengan API URL dan Supabase credentials

# Development
npm run dev

# Production build
npm run build
npx wrangler pages deploy dist --project-name=erp
```

4. **Database Setup**
```bash
# Run migrations di Supabase SQL Editor
# File: supabase/migrations/*.sql
```

---

## 📖 Dokumentasi

### User Guides
- [Panduan Fitur Absensi](./FITUR_ABSENSI.md)
- [Panduan Fitur Lembur](./FITUR_LEMBUR.md)
- [Cara Atur Upah Lembur](./CARA_ATUR_UPAH_LEMBUR.md)
- [Integrasi Gaji-Absensi-Lembur](./INTEGRASI_GAJI_ABSENSI_LEMBUR.md)

### Technical Documentation
- [Alur Lengkap Sistem](./ALUR_LENGKAP_SISTEM.md)
- [Testing Report](./TESTING_REPORT_LEMBUR.md)
- [Cleanup Guide](./CLEANUP_GUIDE.md)

### Setup Guides
- [Install Fitur Lembur](./CARA_INSTALL_FITUR_LEMBUR.md)
- [Fix Lembur di Payroll](./FIX_LEMBUR_TIDAK_MUNCUL_DI_PAYROLL.md)

---

## 🔐 Security Features

- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Row Level Security (RLS)** - Database-level access control
- ✅ **Role-Based Access Control** - Owner/Karyawan permissions
- ✅ **Input Validation** - Server-side validation
- ✅ **CORS Protection** - Configured for specific domains
- ✅ **Secure Password Storage** - Supabase Auth handles hashing
- ✅ **Environment Variables** - Sensitive data in .env files

---

## 📈 Performance

- **Frontend Build Size:** ~648 KB (gzipped: 182 KB)
- **Backend Startup Time:** ~36-49 ms
- **Database Response:** <100ms average
- **API Response Time:** <200ms average
- **Mobile Optimized:** Responsive design for all devices

---

## 🧪 Testing

### Test Coverage
- ✅ 27 test cases untuk fitur lembur
- ✅ 100% pass rate
- ✅ Manual testing untuk semua fitur
- ✅ Integration testing untuk payroll

Lihat [TESTING_REPORT_LEMBUR.md](./TESTING_REPORT_LEMBUR.md) untuk detail lengkap.

---

## 📝 API Documentation

### Authentication
```bash
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/register
```

### Employees
```bash
GET    /api/employees
POST   /api/employees
PUT    /api/employees/:id
PATCH  /api/employees/:id/status
GET    /api/employees/:id/salary-config
POST   /api/employees/:id/salary-config
```

### Attendance
```bash
GET    /api/attendance
POST   /api/attendance/check-in
POST   /api/attendance/check-out
```

### Overtime
```bash
GET    /api/overtime
POST   /api/overtime/start
POST   /api/overtime/end
PATCH  /api/overtime/:id/approve
DELETE /api/overtime/:id
```

### Payroll
```bash
GET    /api/payroll/periods
POST   /api/payroll/process
POST   /api/payroll/details/:id/pay
```

### Inventory
```bash
GET    /api/inventory/overview
POST   /api/inventory/items
DELETE /api/inventory/items/:id
POST   /api/inventory/purchases
POST   /api/inventory/usages
```

---

## 🎯 Fitur yang Akan Datang

- [ ] Export payroll ke Excel/PDF
- [ ] SMS/Email notifications
- [ ] Mobile app (React Native)
- [ ] Advanced analytics & reporting
- [ ] Multi-branch support
- [ ] Accounting integration
- [ ] Tax calculation automation
- [ ] Biometric attendance integration

---

## 🐛 Known Issues & Troubleshooting

### Lembur tidak muncul di payroll
**Solusi:** Lihat [FIX_LEMBUR_TIDAK_MUNCUL_DI_PAYROLL.md](./FIX_LEMBUR_TIDAK_MUNCUL_DI_PAYROLL.md)

### Endpoint tidak ditemukan (404)
**Solusi:** Pastikan API URL di frontend sudah benar dan backend sudah di-deploy

### Foreign key constraint error saat delete
**Solusi:** Backend sudah handle cascade delete otomatis

---

## 📞 Support & Contact

- **Email:** support@rumahkuenuraisah.com
- **GitHub Issues:** [Report Bug](https://github.com/mrzkyfh/erp/issues)
- **Documentation:** Lihat folder docs dan markdown files

---

## 📄 License

Project ini dilisensikan di bawah [MIT License](LICENSE) - bebas digunakan untuk keperluan komersial maupun non-komersial.

---

## 👨‍💻 Author

**Muhammad Rizky**
- GitHub: [@mrzkyfh](https://github.com/mrzkyfh)
- Portfolio: [Portfolio Link]
- Email: [Your Email]

---

## 🙏 Acknowledgments

- **Supabase** - Backend database & authentication
- **Cloudflare** - Hosting & CDN
- **React** - Frontend framework
- **Tailwind CSS** - Styling
- **Shadcn UI** - UI components

---

## 📊 Project Statistics

- **Total Commits:** 50+
- **Lines of Code:** 10,000+
- **Database Tables:** 15+
- **API Endpoints:** 30+
- **React Components:** 20+
- **Development Time:** 2+ months
- **Test Cases:** 27+

---

## 🔄 Version History

### v1.0.0 (Current)
- ✅ Complete ERP system with all core features
- ✅ Overtime system with approval workflow
- ✅ Integrated payroll calculation
- ✅ Inventory management
- ✅ Customer management
- ✅ Production-ready deployment

---

## 📚 Learning Resources

Project ini menggunakan best practices dari:
- Clean Code Architecture
- RESTful API Design
- Database Normalization
- Security Best Practices
- Performance Optimization
- Responsive Web Design

---

**Made with ❤️ by Muhammad Rizky**

⭐ Jika project ini membantu, silakan beri star di GitHub!
