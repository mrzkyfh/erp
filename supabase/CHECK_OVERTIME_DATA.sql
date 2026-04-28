-- ============================================
-- CHECK: Data Lembur vs Payroll
-- ============================================

-- 1. CEK LEMBUR YANG ADA (Januari 2026)
SELECT 
  'OVERTIME_LOGS_JAN_2026' as info,
  p.full_name as karyawan,
  ol.date,
  ol.start_time,
  ol.end_time,
  ol.total_hours,
  ol.status,
  ol.earnings,
  CASE 
    WHEN ol.status = 'approved' THEN '✅ DISETUJUI'
    WHEN ol.status = 'pending' THEN '⏳ MENUNGGU'
    WHEN ol.status = 'rejected' THEN '❌ DITOLAK'
    ELSE '❓ UNKNOWN'
  END as status_info
FROM overtime_logs ol
JOIN employees e ON ol.employee_id = e.id
JOIN profiles p ON e.profile_id = p.id
WHERE ol.date >= '2026-01-01' 
  AND ol.date <= '2026-01-31'
ORDER BY ol.date DESC, p.full_name;

-- 2. CEK PAYROLL PERIODE JANUARI 2026
SELECT 
  'PAYROLL_PERIODS' as info,
  id,
  month,
  year,
  status,
  processed_at
FROM payroll_periods 
WHERE month = 1 AND year = 2026;

-- 3. CEK PAYROLL ITEMS UNTUK LEMBUR (Januari 2026)
SELECT 
  'PAYROLL_ITEMS_LEMBUR' as info,
  p.full_name as karyawan,
  pi.name as komponen,
  pi.unit,
  pi.count as jam_lembur,
  pi.amount as rate_per_jam,
  pi.total_amount as total_earnings
FROM payroll_items pi
JOIN payroll_details pd ON pi.payroll_detail_id = pd.id
JOIN employees e ON pd.employee_id = e.id
JOIN profiles p ON e.profile_id = p.id
JOIN payroll_periods pp ON pd.period_id = pp.id
WHERE pp.month = 1 AND pp.year = 2026
  AND pi.unit = 'per_jam_lembur'
ORDER BY p.full_name;

-- 4. SUMMARY MASALAH
SELECT 
  'DIAGNOSIS' as info,
  
  -- Cek apakah ada lembur approved di Januari 2026
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM overtime_logs ol
      JOIN employees e ON ol.employee_id = e.id
      WHERE ol.status = 'approved' 
        AND ol.date >= '2026-01-01' 
        AND ol.date <= '2026-01-31'
        AND e.status = 'aktif'
    ) 
    THEN '✅ Ada lembur APPROVED di Januari 2026'
    ELSE '❌ TIDAK ada lembur approved di Januari 2026'
  END as lembur_approved,
  
  -- Cek apakah payroll Januari 2026 sudah diproses
  CASE 
    WHEN EXISTS (SELECT 1 FROM payroll_periods WHERE month = 1 AND year = 2026) 
    THEN '✅ Payroll Januari 2026 sudah diproses'
    ELSE '❌ Payroll Januari 2026 belum diproses'
  END as payroll_processed,
  
  -- Cek apakah ada payroll items lembur
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM payroll_items pi
      JOIN payroll_details pd ON pi.payroll_detail_id = pd.id
      JOIN payroll_periods pp ON pd.period_id = pp.id
      WHERE pp.month = 1 AND pp.year = 2026 AND pi.unit = 'per_jam_lembur'
    ) 
    THEN '✅ Ada payroll items lembur'
    ELSE '❌ TIDAK ada payroll items lembur'
  END as payroll_items_lembur;

-- 5. SOLUSI BERDASARKAN MASALAH
SELECT 
  'SOLUSI' as info,
  'Jika lembur approved tapi payroll items kosong:' as masalah,
  'Proses ulang payroll Januari 2026' as solusi;