-- ============================================
-- DEBUG: Investigasi Lembur Tidak Muncul di Payroll
-- ============================================

-- 1. CEK SALARY TYPES - Apakah komponen lembur sudah ada?
SELECT 
  'SALARY_TYPES' as table_name,
  id, 
  name, 
  unit, 
  amount,
  created_at
FROM salary_types 
ORDER BY name;

-- 2. CEK EMPLOYEE SALARY COMPONENTS - Apakah karyawan sudah punya komponen lembur?
SELECT 
  'EMPLOYEE_SALARY_COMPONENTS' as table_name,
  p.full_name as karyawan,
  st.name as komponen,
  st.unit,
  esc.amount as nominal
FROM employee_salary_components esc
JOIN employees e ON esc.employee_id = e.id
JOIN profiles p ON e.profile_id = p.id
JOIN salary_types st ON esc.salary_type_id = st.id
WHERE e.status = 'aktif'
ORDER BY p.full_name, st.name;

-- 3. CEK OVERTIME LOGS - Apakah ada lembur yang disetujui?
SELECT 
  'OVERTIME_LOGS' as table_name,
  p.full_name as karyawan,
  ol.date,
  ol.start_time,
  ol.end_time,
  ol.total_hours,
  ol.status,
  ol.earnings
FROM overtime_logs ol
JOIN employees e ON ol.employee_id = e.id
JOIN profiles p ON e.profile_id = p.id
WHERE ol.date >= '2026-01-01'
ORDER BY ol.date DESC, p.full_name;

-- 4. CEK PAYROLL ITEMS - Apa yang masuk ke perhitungan payroll?
SELECT 
  'PAYROLL_ITEMS' as table_name,
  p.full_name as karyawan,
  pi.name as komponen,
  pi.unit,
  pi.count,
  pi.amount as rate,
  pi.total_amount
FROM payroll_items pi
JOIN payroll_details pd ON pi.payroll_detail_id = pd.id
JOIN employees e ON pd.employee_id = e.id
JOIN profiles p ON e.profile_id = p.id
JOIN payroll_periods pp ON pd.period_id = pp.id
WHERE pp.month = 1 AND pp.year = 2026
ORDER BY p.full_name, pi.name;

-- 5. CEK ENUM VALUES - Apakah per_jam_lembur sudah ada di enum?
SELECT 
  'ENUM_VALUES' as table_name,
  enumlabel as unit_value
FROM pg_enum 
WHERE enumtypid = 'public.salary_unit'::regtype
ORDER BY enumlabel;

-- 6. SUMMARY - Ringkasan masalah
SELECT 
  'SUMMARY' as info,
  CASE 
    WHEN EXISTS (SELECT 1 FROM salary_types WHERE unit = 'per_jam_lembur') 
    THEN '✅ Komponen per_jam_lembur ADA di salary_types'
    ELSE '❌ Komponen per_jam_lembur TIDAK ADA di salary_types'
  END as komponen_lembur,
  
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM employee_salary_components esc
      JOIN salary_types st ON esc.salary_type_id = st.id
      WHERE st.unit = 'per_jam_lembur'
    ) 
    THEN '✅ Karyawan SUDAH punya komponen lembur'
    ELSE '❌ Karyawan BELUM punya komponen lembur'
  END as karyawan_config,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM overtime_logs WHERE status = 'approved' AND date >= '2026-01-01') 
    THEN '✅ Ada lembur yang DISETUJUI'
    ELSE '❌ TIDAK ada lembur yang disetujui'
  END as lembur_approved;