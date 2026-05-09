-- ============================================
-- BACKUP: Cek Data Sebelum Cleanup
-- ============================================
-- Jalankan script ini SEBELUM cleanup untuk melihat data yang akan dihapus

-- 1. SUMMARY DATA SAAT INI
SELECT 
  'CURRENT DATA SUMMARY' as info,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM employees) as total_employees,
  (SELECT COUNT(*) FROM customers) as total_customers,
  (SELECT COUNT(*) FROM suppliers) as total_suppliers,
  (SELECT COUNT(*) FROM inventory_items) as total_inventory_items,
  (SELECT COUNT(*) FROM inventory_transactions) as total_inventory_transactions,
  (SELECT COUNT(*) FROM attendance_logs) as total_attendance_logs,
  (SELECT COUNT(*) FROM overtime_logs) as total_overtime_logs,
  (SELECT COUNT(*) FROM payroll_periods) as total_payroll_periods,
  (SELECT COUNT(*) FROM payroll_details) as total_payroll_details,
  (SELECT COUNT(*) FROM payroll_items) as total_payroll_items;

-- 2. DAFTAR SEMUA USERS
SELECT 
  'ALL USERS' as info,
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.is_active,
  e.id as employee_id,
  e.status as employee_status,
  e.join_date
FROM profiles p
LEFT JOIN employees e ON p.id = e.profile_id
ORDER BY p.email;

-- 3. CEK OWNER@GMAIL.COM
SELECT 
  'OWNER CHECK' as info,
  CASE 
    WHEN EXISTS (SELECT 1 FROM profiles WHERE email = 'owner@gmail.com') 
    THEN '✅ owner@gmail.com DITEMUKAN'
    ELSE '❌ owner@gmail.com TIDAK DITEMUKAN - JANGAN LANJUTKAN CLEANUP!'
  END as status,
  p.id as profile_id,
  p.full_name,
  p.role,
  e.id as employee_id
FROM profiles p
LEFT JOIN employees e ON p.id = e.profile_id
WHERE p.email = 'owner@gmail.com';

-- 4. DATA YANG AKAN DIHAPUS (Profiles & Employees)
SELECT 
  'WILL BE DELETED - PROFILES' as info,
  p.id,
  p.email,
  p.full_name,
  p.role,
  e.id as employee_id
FROM profiles p
LEFT JOIN employees e ON p.id = e.profile_id
WHERE p.email != 'owner@gmail.com'
ORDER BY p.email;

-- 5. DATA TRANSAKSI YANG AKAN DIHAPUS
SELECT 
  'WILL BE DELETED - TRANSACTIONS' as info,
  (SELECT COUNT(*) FROM attendance_logs WHERE employee_id NOT IN (
    SELECT e.id FROM employees e JOIN profiles p ON e.profile_id = p.id WHERE p.email = 'owner@gmail.com'
  )) as attendance_logs_to_delete,
  (SELECT COUNT(*) FROM overtime_logs WHERE employee_id NOT IN (
    SELECT e.id FROM employees e JOIN profiles p ON e.profile_id = p.id WHERE p.email = 'owner@gmail.com'
  )) as overtime_logs_to_delete,
  (SELECT COUNT(*) FROM payroll_details) as payroll_details_to_delete,
  (SELECT COUNT(*) FROM payroll_items) as payroll_items_to_delete,
  (SELECT COUNT(*) FROM inventory_transactions) as inventory_transactions_to_delete;

-- 6. MASTER DATA YANG AKAN DIHAPUS
SELECT 
  'WILL BE DELETED - MASTER DATA' as info,
  (SELECT COUNT(*) FROM customers) as customers_to_delete,
  (SELECT COUNT(*) FROM suppliers) as suppliers_to_delete,
  (SELECT COUNT(*) FROM inventory_items) as inventory_items_to_delete;

-- 7. REKOMENDASI
SELECT 
  'RECOMMENDATION' as info,
  CASE 
    WHEN EXISTS (SELECT 1 FROM profiles WHERE email = 'owner@gmail.com') 
    THEN '✅ AMAN untuk menjalankan cleanup. User owner@gmail.com akan dipertahankan.'
    ELSE '❌ JANGAN jalankan cleanup! User owner@gmail.com tidak ditemukan.'
  END as recommendation;
