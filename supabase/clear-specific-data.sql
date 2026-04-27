-- ============================================
-- CLEAR SPECIFIC DATA FROM DATABASE
-- ============================================
-- Choose which data to delete by uncommenting the sections you need
-- ============================================

-- ============================================
-- 1. CLEAR ATTENDANCE DATA ONLY
-- ============================================
-- DELETE FROM attendance_logs;
-- SELECT 'Attendance data cleared' as status;

-- ============================================
-- 2. CLEAR PAYROLL DATA ONLY
-- ============================================
-- DELETE FROM payroll_records;
-- SELECT 'Payroll data cleared' as status;

-- ============================================
-- 3. CLEAR INVENTORY TRANSACTIONS ONLY (keep items and suppliers)
-- ============================================
-- DELETE FROM stock_usages;
-- DELETE FROM stock_purchase_items;
-- DELETE FROM stock_purchases;
-- SELECT 'Inventory transactions cleared' as status;

-- ============================================
-- 4. CLEAR ALL INVENTORY DATA (items, suppliers, transactions)
-- ============================================
-- DELETE FROM stock_usages;
-- DELETE FROM stock_purchase_items;
-- DELETE FROM stock_purchases;
-- DELETE FROM inventory_items;
-- DELETE FROM suppliers;
-- DELETE FROM categories;
-- SELECT 'All inventory data cleared' as status;

-- ============================================
-- 5. CLEAR CUSTOMERS ONLY
-- ============================================
-- DELETE FROM customers;
-- SELECT 'Customers cleared' as status;

-- ============================================
-- 6. CLEAR EMPLOYEES (except owner)
-- ============================================
-- First, get the owner's employee ID
-- SELECT e.id, p.email, p.full_name 
-- FROM employees e 
-- JOIN profiles p ON e.profile_id = p.id 
-- WHERE p.role = 'owner';

-- Then delete all employees except owner
-- DELETE FROM employees 
-- WHERE profile_id IN (
--   SELECT id FROM profiles WHERE role != 'owner'
-- );

-- Delete profiles except owner
-- DELETE FROM profiles WHERE role != 'owner';
-- SELECT 'Non-owner employees cleared' as status;

-- ============================================
-- 7. CLEAR SALARY TYPES (custom salary types only)
-- ============================================
-- DELETE FROM employee_salary_components;
-- DELETE FROM salary_types;
-- SELECT 'Salary types cleared' as status;

-- ============================================
-- 8. RESET INVENTORY STOCK TO ZERO
-- ============================================
-- UPDATE inventory_items SET current_stock = 0;
-- SELECT 'Inventory stock reset to zero' as status;

-- ============================================
-- 9. CLEAR ATTENDANCE FOR SPECIFIC DATE RANGE
-- ============================================
-- DELETE FROM attendance_logs 
-- WHERE check_in_at >= '2024-01-01' 
-- AND check_in_at < '2024-12-31';
-- SELECT 'Attendance for 2024 cleared' as status;

-- ============================================
-- 10. CLEAR PAYROLL FOR SPECIFIC PERIOD
-- ============================================
-- DELETE FROM payroll_records 
-- WHERE period_start >= '2024-01-01' 
-- AND period_end <= '2024-12-31';
-- SELECT 'Payroll for 2024 cleared' as status;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to check remaining data

SELECT 'employees' as table_name, COUNT(*) as count FROM employees
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'inventory_items', COUNT(*) FROM inventory_items
UNION ALL
SELECT 'suppliers', COUNT(*) FROM suppliers
UNION ALL
SELECT 'attendance_logs', COUNT(*) FROM attendance_logs
UNION ALL
SELECT 'payroll_records', COUNT(*) FROM payroll_records
UNION ALL
SELECT 'stock_purchases', COUNT(*) FROM stock_purchases
UNION ALL
SELECT 'stock_usages', COUNT(*) FROM stock_usages
UNION ALL
SELECT 'salary_types', COUNT(*) FROM salary_types;
