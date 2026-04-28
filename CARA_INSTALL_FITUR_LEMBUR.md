# 🚀 Cara Install Fitur Lembur

## 1️⃣ Apply Database Migration

Jalankan migration di Supabase SQL Editor:

### **Migration 1: Overtime System**
Buka Supabase Dashboard → SQL Editor → New Query → Copy paste:

```sql
-- File: supabase/migrations/005_overtime_system.sql
```
Jalankan semua isi file `supabase/migrations/005_overtime_system.sql`

### **Migration 2: Add Overtime Unit**

**⚠️ PENTING: Jalankan dalam 2 query terpisah!**

#### **Query 1 - Tambah Enum Value:**
Buka Supabase Dashboard → SQL Editor → New Query → Copy paste:

```sql
do $$
begin
  if not exists (
    select 1 from pg_enum 
    where enumlabel = 'per_jam_lembur' 
    and enumtypid = 'public.salary_unit'::regtype
  ) then
    alter type public.salary_unit add value 'per_jam_lembur';
  end if;
end $$;
```

Klik **Run** → Tunggu sampai selesai ✅

#### **Query 2 - Update Data:**
Buka Supabase Dashboard → SQL Editor → **New Query Baru** → Copy paste:

```sql
-- Update existing 'Uang Lembur' to use new unit
update public.salary_types 
set unit = 'per_jam_lembur' 
where name = 'Uang Lembur';

-- Add comment
comment on type public.salary_unit is 'Unit perhitungan gaji: per_kehadiran (per hari hadir), per_jam (per jam kerja reguler), per_jam_lembur (per jam lembur approved), fixed (tetap bulanan)';
```

Klik **Run** → Selesai ✅

---

## 2️⃣ Restart Backend

```bash
cd backend
npm run dev
```

Backend akan otomatis load route `/api/overtime`

---

## 3️⃣ Restart Frontend

```bash
cd frontend
npm run dev
```

Frontend akan otomatis load halaman `/lembur`

---

## 4️⃣ Testing

### **Test sebagai Karyawan:**
1. Login sebagai karyawan
2. Buka menu **Lembur** di sidebar
3. Isi alasan lembur: "Testing fitur lembur"
4. Klik **Mulai Lembur**
5. Tunggu beberapa menit (atau ubah waktu manual di database untuk testing)
6. Klik **Selesai Lembur**
7. Lihat status: **Pending**

### **Test sebagai Owner:**
1. Login sebagai owner
2. Buka menu **Lembur** di sidebar
3. Lihat pengajuan lembur dari karyawan
4. Klik **Setuju** untuk approve
5. Status berubah jadi **Disetujui**

### **Test Payroll:**
1. Login sebagai owner
2. Buka menu **Penggajian**
3. Klik **Proses Gaji** untuk bulan ini
4. Lihat detail gaji karyawan
5. Harus ada item **Uang Lembur** dengan jumlah jam yang approved

---

## 5️⃣ Konfigurasi Upah Lembur

### **Cara 1: Via Database (Supabase)**
```sql
-- Update upah lembur global
UPDATE salary_types 
SET amount = 15000 
WHERE name = 'Uang Lembur';
```

### **Cara 2: Via Frontend (Coming Soon)**
Nanti bisa diatur di halaman **Pengaturan Gaji**

---

## 6️⃣ Troubleshooting

### **Error: "overtime_logs table does not exist"**
→ Migration belum dijalankan. Ulangi langkah 1.

### **Error: "per_jam_lembur is not a valid enum value"**
→ Migration 006 belum dijalankan. Jalankan migration 006.

### **Menu Lembur tidak muncul**
→ Clear cache browser atau hard refresh (Ctrl+Shift+R)

### **Lembur tidak masuk payroll**
→ Pastikan status lembur = **approved** (bukan pending/rejected)

---

## 7️⃣ Verifikasi

Cek apakah semua sudah berjalan:

```bash
# Test backend endpoint
curl http://localhost:4000/api/overtime \
  -H "Authorization: Bearer YOUR_TOKEN"

# Harus return array (bisa kosong)
```

Atau buka browser:
- Frontend: http://localhost:5173/lembur
- Harus muncul halaman Absensi Lembur

---

## ✅ Checklist

- [ ] Migration 005 applied
- [ ] Migration 006 applied
- [ ] Backend restart
- [ ] Frontend restart
- [ ] Menu Lembur muncul di sidebar
- [ ] Karyawan bisa mulai/selesai lembur
- [ ] Owner bisa approve/reject
- [ ] Lembur approved masuk payroll
