-- Script untuk setup komponen lembur untuk semua karyawan aktif
-- Jalankan script ini di Supabase SQL Editor

-- 1. Pastikan komponen Upah Lembur ada
INSERT INTO public.salary_types (name, unit, amount)
SELECT 
  'Upah Lembur',
  'per_jam_lembur'::salary_unit,
  50000 -- Default Rp50.000 per jam (bisa diubah per karyawan nanti)
WHERE NOT EXISTS (
  SELECT 1 FROM public.salary_types WHERE unit = 'per_jam_lembur'
);

-- 2. Tambahkan komponen Upah Lembur untuk SEMUA karyawan aktif
-- yang belum punya komponen ini
INSERT INTO employee_salary_components (employee_id, salary_type_id, amount)
SELECT 
  e.id,
  st.id,
  80000 -- Rp80.000 per jam (SESUAIKAN dengan kebutuhan Anda)
FROM employees e
CROSS JOIN salary_types st
WHERE e.status = 'aktif'
  AND st.unit = 'per_jam_lembur'
  AND NOT EXISTS (
    SELECT 1 FROM employee_salary_components esc
    WHERE esc.employee_id = e.id
      AND esc.salary_type_id = st.id
  );

-- 3. Tampilkan hasil
SELECT 
  p.full_name as "Nama Karyawan",
  st.name as "Komponen",
  esc.amount as "Nominal per Jam",
  'Rp' || to_char(esc.amount, 'FM999,999,999') as "Format Rupiah"
FROM employee_salary_components esc
JOIN employees e ON esc.employee_id = e.id
JOIN profiles p ON e.profile_id = p.id
JOIN salary_types st ON esc.salary_type_id = st.id
WHERE st.unit = 'per_jam_lembur'
  AND e.status = 'aktif'
ORDER BY p.full_name;

-- 4. Summary
SELECT 
  COUNT(*) as "Total Karyawan dengan Upah Lembur",
  MIN(esc.amount) as "Upah Minimum",
  MAX(esc.amount) as "Upah Maximum",
  AVG(esc.amount)::integer as "Upah Rata-rata"
FROM employee_salary_components esc
JOIN employees e ON esc.employee_id = e.id
JOIN salary_types st ON esc.salary_type_id = st.id
WHERE st.unit = 'per_jam_lembur'
  AND e.status = 'aktif';
