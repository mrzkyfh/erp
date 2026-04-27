# Data Cleanup Guide - Menghapus Data Dummy

## Overview
Panduan lengkap untuk menghapus data dummy dari database Supabase.

## ⚠️ PERINGATAN PENTING

**BACKUP DATA TERLEBIH DAHULU!**
- Proses penghapusan **TIDAK BISA DI-UNDO**
- Pastikan Anda sudah backup data penting
- Test di development environment dulu

---

## 📋 Langkah-Langkah

### Step 1: Cek Data yang Ada

1. Buka **Supabase Dashboard**: https://supabase.com/dashboard
2. Pilih project Anda
3. Klik **SQL Editor** di sidebar
4. Copy paste isi file `supabase/check-data-count.sql`
5. Klik **Run** untuk melihat jumlah data di setiap tabel

**Output yang diharapkan:**
```
table_name              | total_records | description
------------------------|---------------|---------------------------
employees               | 5             | User accounts and employee data
profiles                | 5             | User profiles (auth data)
customers               | 10            | Customer records
inventory_items         | 15            | Inventory items/stock
attendance_logs         | 100           | Attendance check-in/out records
...
```

---

### Step 2: Pilih Metode Penghapusan

#### **Metode A: Hapus SEMUA Data** (Nuclear Option)

**Gunakan jika:** Anda ingin mulai dari awal dengan database kosong

**File:** `supabase/clear-all-data.sql`

**Yang akan dihapus:**
- ✅ Semua karyawan (kecuali owner)
- ✅ Semua customer
- ✅ Semua inventory items & suppliers
- ✅ Semua attendance logs
- ✅ Semua payroll records
- ✅ Semua transaksi inventory

**Cara:**
1. Buka SQL Editor di Supabase
2. Copy paste isi `supabase/clear-all-data.sql`
3. **PENTING:** Edit bagian ini untuk keep owner account:
   ```sql
   -- Find your owner user ID first
   SELECT id, email FROM profiles WHERE role = 'owner';
   
   -- Then uncomment and replace 'your-user-id-here'
   DELETE FROM profiles WHERE id != 'your-user-id-here';
   ```
4. Klik **Run**

---

#### **Metode B: Hapus Data Tertentu** (Selective)

**Gunakan jika:** Anda hanya ingin hapus data tertentu

**File:** `supabase/clear-specific-data.sql`

**Pilihan yang tersedia:**
1. Hapus attendance data saja
2. Hapus payroll data saja
3. Hapus transaksi inventory (keep items & suppliers)
4. Hapus semua inventory data
5. Hapus customers saja
6. Hapus employees (kecuali owner)
7. Hapus salary types
8. Reset stock ke 0
9. Hapus attendance untuk periode tertentu
10. Hapus payroll untuk periode tertentu

**Cara:**
1. Buka file `supabase/clear-specific-data.sql`
2. **Uncomment** (hapus `--`) bagian yang ingin Anda jalankan
3. Copy paste ke SQL Editor
4. Klik **Run**

**Contoh - Hapus hanya attendance:**
```sql
-- Uncomment bagian ini:
DELETE FROM attendance_logs;
SELECT 'Attendance data cleared' as status;
```

---

### Step 3: Verifikasi Penghapusan

Setelah menjalankan script, verifikasi dengan query ini:

```sql
SELECT 
  'employees' as table_name, 
  COUNT(*) as remaining_records 
FROM employees

UNION ALL

SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'inventory_items', COUNT(*) FROM inventory_items
UNION ALL
SELECT 'attendance_logs', COUNT(*) FROM attendance_logs
UNION ALL
SELECT 'payroll_records', COUNT(*) FROM payroll_records;
```

**Expected result setelah clear all:**
```
table_name        | remaining_records
------------------|------------------
employees         | 0 atau 1 (owner)
profiles          | 1 (owner)
customers         | 0
inventory_items   | 0
attendance_logs   | 0
payroll_records   | 0
```

---

## 🔧 Cara Alternatif: Via Supabase Dashboard

### Hapus Data Manual (Satu per Satu)

1. **Buka Table Editor:**
   - Dashboard > Table Editor
   - Pilih table (misal: `customers`)

2. **Select & Delete:**
   - Centang rows yang ingin dihapus
   - Klik tombol **Delete** di toolbar
   - Confirm deletion

3. **Ulangi untuk table lain**

**Kelebihan:**
- ✅ Lebih aman (bisa pilih data spesifik)
- ✅ Visual interface

**Kekurangan:**
- ❌ Lambat untuk data banyak
- ❌ Harus manual satu-satu

---

## 🚨 Troubleshooting

### Error: "Foreign key constraint violation"

**Penyebab:** Mencoba hapus data yang masih direferensi oleh table lain

**Solusi:** Hapus dalam urutan yang benar:
```sql
-- Urutan yang benar:
1. payroll_records
2. attendance_logs
3. employee_salary_components
4. salary_types
5. stock_usages
6. stock_purchase_items
7. stock_purchases
8. inventory_items
9. suppliers
10. customers
11. employees
12. profiles
```

---

### Error: "Permission denied"

**Penyebab:** User tidak punya akses untuk delete

**Solusi:** 
1. Pastikan Anda login sebagai owner
2. Atau gunakan Service Role Key di SQL Editor
3. Atau jalankan via Supabase Dashboard (auto menggunakan service role)

---

### Data Tidak Terhapus

**Cek:**
1. Apakah query berhasil dijalankan? (lihat output)
2. Apakah ada error message?
3. Refresh page dan cek lagi

---

## 📊 Monitoring & Logging

### Cek Siapa yang Menghapus Data

Jika Anda perlu audit trail, tambahkan logging:

```sql
-- Create audit log table (optional)
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  table_name TEXT,
  action TEXT,
  deleted_count INTEGER,
  deleted_by UUID REFERENCES profiles(id),
  deleted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log deletion
INSERT INTO audit_logs (table_name, action, deleted_count, deleted_by)
VALUES ('customers', 'DELETE ALL', 10, auth.uid());
```

---

## 🔄 Reset Database Completely

Jika Anda ingin reset database ke kondisi awal:

### Option 1: Via Supabase Dashboard

1. Dashboard > Settings > General
2. Scroll ke **Danger Zone**
3. Klik **Pause Project**
4. Klik **Delete Project**
5. Create new project
6. Run migrations lagi

### Option 2: Drop & Recreate Tables

```sql
-- WARNING: This drops ALL tables!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Then run your migrations again
```

---

## 📝 Best Practices

### Before Deleting:

1. ✅ **Backup data** via Supabase Dashboard > Database > Backups
2. ✅ **Export to CSV** jika perlu keep data
3. ✅ **Test di development** environment dulu
4. ✅ **Inform team** jika multi-user
5. ✅ **Check dependencies** (foreign keys)

### After Deleting:

1. ✅ **Verify deletion** dengan query count
2. ✅ **Test aplikasi** untuk ensure tidak ada broken references
3. ✅ **Reset sequences** jika perlu (untuk clean IDs)
4. ✅ **Document** apa yang dihapus dan kenapa

---

## 🎯 Common Scenarios

### Scenario 1: "Saya ingin hapus semua data kecuali owner account"

```sql
-- Run this:
DELETE FROM payroll_records;
DELETE FROM attendance_logs;
DELETE FROM employee_salary_components;
DELETE FROM salary_types;
DELETE FROM stock_usages;
DELETE FROM stock_purchase_items;
DELETE FROM stock_purchases;
DELETE FROM inventory_items;
DELETE FROM suppliers;
DELETE FROM categories;
DELETE FROM customers;
DELETE FROM employees WHERE profile_id IN (
  SELECT id FROM profiles WHERE role != 'owner'
);
DELETE FROM profiles WHERE role != 'owner';
```

---

### Scenario 2: "Saya ingin hapus attendance bulan ini saja"

```sql
DELETE FROM attendance_logs 
WHERE check_in_at >= DATE_TRUNC('month', CURRENT_DATE)
AND check_in_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month';
```

---

### Scenario 3: "Saya ingin reset inventory stock ke 0"

```sql
UPDATE inventory_items SET current_stock = 0;
DELETE FROM stock_usages;
DELETE FROM stock_purchase_items;
DELETE FROM stock_purchases;
```

---

## 📞 Need Help?

Jika Anda mengalami masalah:

1. Check error message di SQL Editor
2. Verify foreign key constraints
3. Check RLS policies (Row Level Security)
4. Contact Supabase support jika perlu

---

## 🔐 Security Notes

- ⚠️ Hanya **owner** yang boleh delete data
- ⚠️ Jangan share Service Role Key
- ⚠️ Enable RLS untuk production
- ⚠️ Audit log untuk tracking

---

## Files Created

1. **`supabase/check-data-count.sql`** - Cek jumlah data
2. **`supabase/clear-all-data.sql`** - Hapus semua data
3. **`supabase/clear-specific-data.sql`** - Hapus data tertentu
4. **`DATA_CLEANUP_GUIDE.md`** - Dokumentasi ini

---

## Quick Reference

| Task | File | Command |
|------|------|---------|
| Cek data | `check-data-count.sql` | Copy paste ke SQL Editor |
| Hapus semua | `clear-all-data.sql` | Edit owner ID, then run |
| Hapus tertentu | `clear-specific-data.sql` | Uncomment section, then run |

---

**Remember:** Always backup before deleting! 🔒
