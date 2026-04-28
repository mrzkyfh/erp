-- ============================================
-- FIX: Lembur Tidak Muncul di Payroll
-- ============================================
-- Jalankan script ini di Supabase SQL Editor
-- untuk menambahkan komponen lembur ke semua karyawan

-- STEP 1: Pastikan komponen Upah Lembur ada di salary_types
INSERT INTO public.salary_types (name, unit, amount)
SELECT 
  'Upah Lembur',
  'per_jam_lembur'::salary_unit,
  50000 -- Default Rp50.000 per jam
WHERE NOT EXISTS (
  SELECT 1 FROM public.salary_types WHERE unit = 'per_jam_lembur'
);

-- STEP 2: Tambahkan komponen Upah Lembur untuk SEMUA karyawan aktif
INSERT INTO employee_salary_components (employee_id, salary_type_id, amount)
SELECT 
  e.id,
  st.id,
  80000 -- Rp80.000 per jam (SESUAIKAN sesuai kebutuhan)
FROM employees e
CROSS JOIN salary_types st
WHERE e.status = 'aktif'
  AND st.unit = 'per_jam_lembur'
  AND NOT EXISTS (
    SELECT 1 FROM employee_salary_components esc
    WHERE esc.employee_id = e.id
      AND esc.salary_type_id = st.id
  );

-- STEP 3: Verifikasi - Tampilkan karyawan yang sudah punya komponen lembur
SELECT 
  p.full_name as "Nama Karyawan",
  st.name as "Komponen",
  'Rp' || to_char(esc.amount, 'FM999,999,999') as "Upah per Jam"
FROM employee_salary_components esc
JOIN employees e ON esc.employee_id = e.id
JOIN profiles p ON e.profile_id = p.id
JOIN salary_types st ON esc.salary_type_id = st.id
WHERE st.unit = 'per_jam_lembur'
  AND e.status = 'aktif'
ORDER BY p.full_name;

-- DONE! Sekarang:
-- 1. Kembali ke halaman Penggajian
-- 2. Pilih bulan dan tahun
-- 3. Klik "Hitung Payroll Periode Ini"
-- 4. Lembur yang disetujui akan otomatis masuk ke perhitungan!
