# 🧹 Panduan Cleanup Database untuk Serah Terima Client

## ⚠️ PERHATIAN PENTING!

Script ini akan **MENGHAPUS SEMUA DATA DUMMY** dari database kecuali user **owner@gmail.com**.

**Data yang akan dihapus:**
- ❌ Semua karyawan (kecuali owner@gmail.com)
- ❌ Semua customer
- ❌ Semua supplier
- ❌ Semua inventory items & transactions
- ❌ Semua attendance logs
- ❌ Semua overtime logs
- ❌ Semua payroll data
- ❌ Semua profiles & auth users (kecuali owner@gmail.com)

**Data yang DIPERTAHANKAN:**
- ✅ User owner@gmail.com (profile & employee jika ada)
- ✅ Salary types (komponen gaji)
- ✅ Business settings
- ✅ Struktur database (tables, functions, triggers)

---

## 📋 Langkah-Langkah Cleanup

### **Langkah 1: Backup Data (WAJIB!)**

Sebelum cleanup, **WAJIB** backup database terlebih dahulu:

1. Buka **Supabase Dashboard**
2. Pilih project Anda
3. Klik **Database** → **Backups**
4. Klik **Create Backup** atau pastikan ada backup terbaru

### **Langkah 2: Cek Data Saat Ini**

Jalankan script untuk melihat data yang akan dihapus:

```sql
-- File: supabase/BACKUP_BEFORE_CLEANUP.sql
```

Script ini akan menampilkan:
- Summary data saat ini
- Daftar semua users
- Konfirmasi owner@gmail.com ada
- Data yang akan dihapus
- Rekomendasi (aman/tidak aman)

**⚠️ JANGAN LANJUTKAN jika owner@gmail.com TIDAK DITEMUKAN!**

### **Langkah 3: Jalankan Cleanup**

Setelah yakin, jalankan script cleanup:

```sql
-- File: supabase/CLEANUP_FOR_CLIENT.sql
```

Script ini akan:
1. ✅ Cari dan simpan ID owner@gmail.com
2. ✅ Hapus semua data transaksi
3. ✅ Hapus semua karyawan (kecuali owner)
4. ✅ Hapus semua profiles (kecuali owner)
5. ✅ Tampilkan summary hasil cleanup
6. ✅ Tampilkan data yang tersisa

### **Langkah 4: Verifikasi Hasil**

Setelah cleanup, verifikasi:

1. **Login sebagai owner@gmail.com** - pastikan masih bisa login
2. **Cek halaman Dashboard** - pastikan tidak ada error
3. **Cek semua menu** - pastikan aplikasi berfungsi normal
4. **Cek data** - pastikan hanya ada user owner@gmail.com

---

## 🔍 Verifikasi Manual

Jalankan query ini untuk memastikan cleanup berhasil:

```sql
-- Cek jumlah data tersisa
SELECT 
  (SELECT COUNT(*) FROM profiles) as profiles,
  (SELECT COUNT(*) FROM employees) as employees,
  (SELECT COUNT(*) FROM customers) as customers,
  (SELECT COUNT(*) FROM suppliers) as suppliers,
  (SELECT COUNT(*) FROM inventory_items) as inventory_items,
  (SELECT COUNT(*) FROM attendance_logs) as attendance_logs,
  (SELECT COUNT(*) FROM overtime_logs) as overtime_logs,
  (SELECT COUNT(*) FROM payroll_periods) as payroll_periods;

-- Cek user yang tersisa
SELECT email, full_name, role FROM profiles;
```

**Hasil yang diharapkan:**
- profiles: 1 (owner@gmail.com)
- employees: 0 atau 1 (jika owner juga employee)
- customers: 0
- suppliers: 0
- inventory_items: 0
- attendance_logs: 0
- overtime_logs: 0
- payroll_periods: 0

---

## 🚨 Troubleshooting

### **Error: User owner@gmail.com tidak ditemukan**

**Solusi:**
1. Cek apakah user ada dengan email lain
2. Buat user owner@gmail.com terlebih dahulu
3. Atau edit script untuk menggunakan email yang benar

### **Error: Foreign key constraint**

**Solusi:**
Script sudah menangani cascade delete, tapi jika masih error:
1. Cek error message untuk tahu tabel mana yang bermasalah
2. Hapus data di tabel tersebut secara manual
3. Jalankan ulang script cleanup

### **User owner@gmail.com tidak bisa login setelah cleanup**

**Solusi:**
1. Restore dari backup
2. Cek apakah profile masih ada: `SELECT * FROM profiles WHERE email = 'owner@gmail.com'`
3. Cek apakah auth user masih ada di Supabase Auth dashboard

---

## 📝 Checklist Serah Terima

Sebelum menyerahkan ke client, pastikan:

- [ ] ✅ Backup database sudah dibuat
- [ ] ✅ Script BACKUP_BEFORE_CLEANUP.sql sudah dijalankan
- [ ] ✅ Script CLEANUP_FOR_CLIENT.sql sudah dijalankan
- [ ] ✅ User owner@gmail.com masih bisa login
- [ ] ✅ Semua fitur aplikasi berfungsi normal
- [ ] ✅ Tidak ada data dummy yang tersisa
- [ ] ✅ Database siap untuk data production client

---

## 🎯 Setelah Cleanup

Database sekarang dalam kondisi **clean** dan siap untuk client:

1. **User default:** owner@gmail.com
2. **Password:** (sesuai yang sudah diset)
3. **Role:** owner
4. **Data:** Kosong, siap diisi data production

Client bisa langsung:
- ✅ Login dengan owner@gmail.com
- ✅ Menambah karyawan baru
- ✅ Mengatur komponen gaji
- ✅ Menambah customer & supplier
- ✅ Mengelola inventory
- ✅ Mencatat absensi & lembur
- ✅ Memproses payroll

---

## 📞 Support

Jika ada masalah saat cleanup:
1. **JANGAN PANIK!** Restore dari backup
2. Cek error message dengan teliti
3. Jalankan script verifikasi untuk cek kondisi database
4. Hubungi developer jika perlu bantuan

---

## 🔐 Keamanan

**PENTING:**
- ❌ Jangan share script ini ke public
- ❌ Jangan commit file .env ke git
- ✅ Pastikan backup tersimpan dengan aman
- ✅ Ganti password owner@gmail.com setelah serah terima
