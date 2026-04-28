-- ============================================
-- FORCE FIX: Update Unit Lembur ke per_jam_lembur
-- ============================================

-- 1. Lihat semua salary_types yang ada
SELECT 'BEFORE UPDATE' as status, id, name, unit, amount FROM salary_types ORDER BY name;

-- 2. Update SEMUA komponen yang mengandung kata "lembur" (case insensitive)
UPDATE public.salary_types 
SET unit = 'per_jam_lembur'
WHERE LOWER(name) LIKE '%lembur%' 
  AND unit != 'per_jam_lembur';

-- 3. Jika tidak ada yang ter-update, buat komponen baru
INSERT INTO public.salary_types (name, unit, amount)
SELECT 
  'Upah Lembur',
  'per_jam_lembur'::salary_unit,
  80000
WHERE NOT EXISTS (
  SELECT 1 FROM public.salary_types WHERE unit = 'per_jam_lembur'
);

-- 4. Lihat hasil setelah update
SELECT 'AFTER UPDATE' as status, id, name, unit, amount FROM salary_types ORDER BY name;

-- 5. Update employee_salary_components untuk menggunakan komponen lembur yang benar
-- Hapus komponen lembur lama (yang bukan per_jam_lembur)
DELETE FROM employee_salary_components 
WHERE salary_type_id IN (
  SELECT id FROM salary_types 
  WHERE LOWER(name) LIKE '%lembur%' 
    AND unit != 'per_jam_lembur'
);

-- 6. Tambahkan komponen lembur yang benar untuk semua karyawan aktif
INSERT INTO employee_salary_components (employee_id, salary_type_id, amount)
SELECT 
  e.id,
  st.id,
  80000 -- Rp80.000 per jam
FROM employees e
CROSS JOIN salary_types st
WHERE e.status = 'aktif'
  AND st.unit = 'per_jam_lembur'
  AND NOT EXISTS (
    SELECT 1 FROM employee_salary_components esc
    WHERE esc.employee_id = e.id
      AND esc.salary_type_id = st.id
  );

-- 7. Verifikasi hasil akhir
SELECT 
  'FINAL RESULT' as status,
  p.full_name as karyawan,
  st.name as komponen,
  st.unit,
  esc.amount as nominal
FROM employee_salary_components esc
JOIN employees e ON esc.employee_id = e.id
JOIN profiles p ON e.profile_id = p.id
JOIN salary_types st ON esc.salary_type_id = st.id
WHERE st.unit = 'per_jam_lembur'
  AND e.status = 'aktif'
ORDER BY p.full_name;