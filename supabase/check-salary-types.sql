-- Check all salary types
SELECT id, name, unit, amount, created_at 
FROM salary_types 
ORDER BY created_at;

-- Check if per_jam_lembur exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM salary_types WHERE unit = 'per_jam_lembur') 
    THEN '✅ Komponen lembur SUDAH ADA'
    ELSE '❌ Komponen lembur BELUM ADA - perlu ditambahkan'
  END as status;
