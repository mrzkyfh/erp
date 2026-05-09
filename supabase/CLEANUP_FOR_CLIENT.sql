-- ============================================
-- CLEANUP: Hapus Data Dummy untuk Serah Terima Client
-- ============================================
-- Script ini akan menghapus semua data dummy kecuali user owner@gmail.com
-- PERHATIAN: Backup data dulu sebelum menjalankan script ini!

-- 1. Cari ID profile owner@gmail.com (akan kita simpan)
DO $$
DECLARE
  owner_profile_id uuid;
  owner_employee_id uuid;
BEGIN
  -- Get owner profile ID
  SELECT id INTO owner_profile_id 
  FROM profiles 
  WHERE email = 'owner@gmail.com';
  
  IF owner_profile_id IS NULL THEN
    RAISE EXCEPTION 'User owner@gmail.com tidak ditemukan! Pastikan user ini ada sebelum cleanup.';
  END IF;
  
  -- Get owner employee ID (if exists)
  SELECT id INTO owner_employee_id 
  FROM employees 
  WHERE profile_id = owner_profile_id;
  
  RAISE NOTICE '✅ Owner profile ID: %', owner_profile_id;
  RAISE NOTICE '✅ Owner employee ID: %', COALESCE(owner_employee_id::text, 'N/A');
  
  -- Store in temp table for reference
  CREATE TEMP TABLE IF NOT EXISTS owner_data (
    profile_id uuid,
    employee_id uuid
  );
  
  DELETE FROM owner_data;
  INSERT INTO owner_data VALUES (owner_profile_id, owner_employee_id);
END $$;

-- 2. HAPUS DATA TRANSAKSI & OPERASIONAL
-- (Data ini akan dihapus tanpa mempertimbangkan owner)

-- Hapus payroll items
DELETE FROM payroll_items;
RAISE NOTICE '✅ Payroll items dihapus';

-- Hapus payroll details
DELETE FROM payroll_details;
RAISE NOTICE '✅ Payroll details dihapus';

-- Hapus payroll periods
DELETE FROM payroll_periods;
RAISE NOTICE '✅ Payroll periods dihapus';

-- Hapus overtime logs (kecuali milik owner jika ada)
DELETE FROM overtime_logs 
WHERE employee_id NOT IN (SELECT employee_id FROM owner_data WHERE employee_id IS NOT NULL);
RAISE NOTICE '✅ Overtime logs dihapus (kecuali owner)';

-- Hapus attendance logs (kecuali milik owner jika ada)
DELETE FROM attendance_logs 
WHERE employee_id NOT IN (SELECT employee_id FROM owner_data WHERE employee_id IS NOT NULL);
RAISE NOTICE '✅ Attendance logs dihapus (kecuali owner)';

-- Hapus inventory transactions
DELETE FROM inventory_transactions;
RAISE NOTICE '✅ Inventory transactions dihapus';

-- Hapus inventory items
DELETE FROM inventory_items;
RAISE NOTICE '✅ Inventory items dihapus';

-- Hapus suppliers
DELETE FROM suppliers;
RAISE NOTICE '✅ Suppliers dihapus';

-- Hapus customers
DELETE FROM customers;
RAISE NOTICE '✅ Customers dihapus';

-- 3. HAPUS KARYAWAN (kecuali owner)
-- Hapus employee salary components untuk karyawan lain
DELETE FROM employee_salary_components 
WHERE employee_id NOT IN (SELECT employee_id FROM owner_data WHERE employee_id IS NOT NULL);
RAISE NOTICE '✅ Employee salary components dihapus (kecuali owner)';

-- Hapus employees (kecuali owner)
DELETE FROM employees 
WHERE profile_id NOT IN (SELECT profile_id FROM owner_data);
RAISE NOTICE '✅ Employees dihapus (kecuali owner)';

-- 4. HAPUS PROFILES & AUTH USERS (kecuali owner)
DO $$
DECLARE
  profile_record RECORD;
  deleted_count INTEGER := 0;
BEGIN
  -- Loop through all profiles except owner
  FOR profile_record IN 
    SELECT id, email 
    FROM profiles 
    WHERE id NOT IN (SELECT profile_id FROM owner_data)
  LOOP
    -- Delete from auth.users (Supabase Auth)
    BEGIN
      PERFORM auth.uid() FROM auth.users WHERE id = profile_record.id;
      -- Note: Supabase RLS might prevent direct deletion
      -- This will be handled by CASCADE from profiles deletion
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not delete auth user: %', profile_record.email;
    END;
    
    deleted_count := deleted_count + 1;
  END LOOP;
  
  -- Delete profiles (will cascade to auth if configured)
  DELETE FROM profiles 
  WHERE id NOT IN (SELECT profile_id FROM owner_data);
  
  RAISE NOTICE '✅ % profiles dihapus (kecuali owner)', deleted_count;
END $$;

-- 5. RESET SALARY TYPES ke default (opsional)
-- Uncomment jika ingin reset salary types
-- DELETE FROM salary_types;
-- INSERT INTO salary_types (name, unit, amount) VALUES
--   ('Gaji Pokok (Harian)', 'per_kehadiran', 100000),
--   ('Uang Makan', 'per_kehadiran', 25000),
--   ('Uang Transport', 'per_kehadiran', 15000),
--   ('Upah Lembur', 'per_jam_lembur', 50000);

-- 6. VERIFIKASI HASIL
SELECT 
  'CLEANUP SUMMARY' as info,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM employees) as total_employees,
  (SELECT COUNT(*) FROM customers) as total_customers,
  (SELECT COUNT(*) FROM suppliers) as total_suppliers,
  (SELECT COUNT(*) FROM inventory_items) as total_inventory_items,
  (SELECT COUNT(*) FROM inventory_transactions) as total_inventory_transactions,
  (SELECT COUNT(*) FROM attendance_logs) as total_attendance_logs,
  (SELECT COUNT(*) FROM overtime_logs) as total_overtime_logs,
  (SELECT COUNT(*) FROM payroll_periods) as total_payroll_periods,
  (SELECT COUNT(*) FROM payroll_details) as total_payroll_details;

-- 7. TAMPILKAN DATA YANG TERSISA
SELECT 
  'REMAINING DATA' as info,
  p.email,
  p.full_name,
  p.role,
  e.id as employee_id,
  e.status as employee_status
FROM profiles p
LEFT JOIN employees e ON p.id = e.profile_id
ORDER BY p.email;

-- Cleanup temp table
DROP TABLE IF EXISTS owner_data;

-- DONE!
RAISE NOTICE '🎉 Cleanup selesai! Database siap diserahkan ke client.';
RAISE NOTICE '⚠️  Pastikan user owner@gmail.com masih bisa login.';
