# Fix: Lembur Tidak Muncul di Payroll

## 🔴 Masalah
Penghasilan lembur sudah muncul di halaman **Lembur** (misalnya Rp80, Rp180), tapi di halaman **Penggajian** masih **Rp0**.

## 🔍 Penyebab
Ada 3 kemungkinan penyebab:

### 1. Migration Belum Dijalankan
Migration `006_add_overtime_unit.sql` atau `007_ensure_overtime_salary_component.sql` belum dijalankan.

### 2. Komponen "Upah Lembur" Belum Ada
Tabel `salary_types` belum punya komponen dengan `unit = 'per_jam_lembur'`.

### 3. Karyawan Belum Dikonfigurasi
Karyawan belum diatur komponen gajinya (termasuk upah lembur).

---

## ✅ Solusi

### Langkah 1: Jalankan Migration
Jalankan migration untuk memastikan komponen lembur tersedia:

```bash
# Di Supabase SQL Editor, jalankan:
supabase/migrations/006_add_overtime_unit.sql
supabase/migrations/007_ensure_overtime_salary_component.sql
```

Atau manual via SQL:

```sql
-- Tambah komponen Upah Lembur jika belum ada
INSERT INTO public.salary_types (name, unit, amount)
SELECT 
  'Upah Lembur',
  'per_jam_lembur'::salary_unit,
  50000
WHERE NOT EXISTS (
  SELECT 1 FROM public.salary_types WHERE unit = 'per_jam_lembur'
);
```

### Langkah 2: Cek Komponen Tersedia
Pastikan komponen "Upah Lembur" sudah ada:

```sql
SELECT id, name, unit, amount 
FROM salary_types 
WHERE unit = 'per_jam_lembur';
```

Harusnya muncul:
```
| id | name        | unit           | amount |
|----|-------------|----------------|--------|
| X  | Upah Lembur | per_jam_lembur | 50000  |
```

### Langkah 3: Atur Komponen Gaji Karyawan

#### Opsi A: Via UI (Recommended)
1. Buka halaman **Data Karyawan**
2. Klik tombol **ikon Wallet (💰)** pada karyawan yang bersangkutan
3. Di sidebar kiri, klik **"Upah Lembur"** untuk menambahkan
4. Atur nominal per jam (misalnya Rp80.000)
5. Klik **"Simpan Konfigurasi"**

#### Opsi B: Via SQL (Bulk untuk semua karyawan)
```sql
-- Tambahkan komponen Upah Lembur untuk SEMUA karyawan aktif
INSERT INTO employee_salary_components (employee_id, salary_type_id, amount)
SELECT 
  e.id,
  (SELECT id FROM salary_types WHERE unit = 'per_jam_lembur' LIMIT 1),
  80000 -- Rp80.000 per jam (sesuaikan)
FROM employees e
WHERE e.status = 'aktif'
  AND NOT EXISTS (
    SELECT 1 FROM employee_salary_components esc
    WHERE esc.employee_id = e.id
      AND esc.salary_type_id = (SELECT id FROM salary_types WHERE unit = 'per_jam_lembur' LIMIT 1)
  );
```

### Langkah 4: Proses Ulang Payroll
1. Buka halaman **Penggajian**
2. Pilih bulan dan tahun yang sesuai
3. Klik **"Hitung Payroll Periode Ini"**
4. Lembur yang sudah **disetujui** akan otomatis masuk ke perhitungan

---

## 🧪 Verifikasi

### 1. Cek Komponen Gaji Karyawan
```sql
SELECT 
  e.id,
  p.full_name,
  st.name as komponen,
  st.unit,
  esc.amount
FROM employees e
JOIN profiles p ON e.profile_id = p.id
LEFT JOIN employee_salary_components esc ON e.id = esc.employee_id
LEFT JOIN salary_types st ON esc.salary_type_id = st.id
WHERE e.status = 'aktif'
ORDER BY p.full_name, st.name;
```

### 2. Cek Lembur yang Disetujui
```sql
SELECT 
  ol.id,
  p.full_name,
  ol.date,
  ol.total_hours,
  ol.status,
  ol.earnings
FROM overtime_logs ol
JOIN employees e ON ol.employee_id = e.id
JOIN profiles p ON e.profile_id = p.id
WHERE ol.status = 'approved'
  AND ol.date >= '2026-01-01'
ORDER BY ol.date DESC;
```

### 3. Cek Payroll Items
```sql
SELECT 
  p.full_name,
  pd.net_salary,
  pi.name as komponen,
  pi.unit,
  pi.count,
  pi.amount as rate,
  pi.total_amount
FROM payroll_details pd
JOIN employees e ON pd.employee_id = e.id
JOIN profiles p ON e.profile_id = p.id
LEFT JOIN payroll_items pi ON pd.id = pi.payroll_detail_id
WHERE pd.period_id = (SELECT id FROM payroll_periods ORDER BY year DESC, month DESC LIMIT 1)
ORDER BY p.full_name, pi.name;
```

---

## 📝 Catatan Penting

1. **Hanya lembur yang DISETUJUI** yang masuk ke payroll
2. **Karyawan harus punya komponen "Upah Lembur"** di konfigurasi gaji
3. **Nominal per jam bisa berbeda** untuk setiap karyawan
4. **Payroll harus diproses ulang** setelah mengubah konfigurasi

---

## 🎯 Hasil yang Diharapkan

Setelah mengikuti langkah di atas, di halaman **Penggajian**:

```
Karyawan: Sri Nuraisah
├─ Upah Lembur (0.01 jam) → Rp80
├─ [komponen lain...]
└─ Total Gaji: Rp[total termasuk lembur]
```

---

## 🆘 Troubleshooting

### Masih Rp0 setelah proses payroll?
1. Pastikan lembur sudah **disetujui** (status = approved)
2. Pastikan tanggal lembur **sesuai dengan periode payroll**
3. Pastikan karyawan **sudah punya komponen Upah Lembur**

### Komponen tidak muncul di modal konfigurasi?
1. Refresh halaman
2. Cek di SQL apakah `salary_types` sudah ada komponen `per_jam_lembur`
3. Restart backend jika perlu

### Error saat menyimpan konfigurasi?
1. Cek console browser untuk error detail
2. Pastikan API endpoint `/employees/:id/salary-config` berfungsi
3. Cek backend logs
