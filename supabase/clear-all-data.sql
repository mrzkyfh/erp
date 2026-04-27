-- ============================================
-- CLEAR ALL DATA FROM DATABASE
-- ============================================
-- WARNING: This will delete ALL data from all tables
-- Use with caution! This action cannot be undone.
-- ============================================

-- Disable triggers temporarily for faster deletion
SET session_replication_role = 'replica';

-- Delete in correct order to respect foreign key constraints

-- 1. Delete payroll related data
DELETE FROM payroll_records;

-- 2. Delete attendance data
DELETE FROM attendance_logs;

-- 3. Delete employee salary components
DELETE FROM employee_salary_components;

-- 4. Delete salary types
DELETE FROM salary_types;

-- 5. Delete inventory transactions
DELETE FROM stock_usages;
DELETE FROM stock_purchase_items;
DELETE FROM stock_purchases;

-- 6. Delete inventory items and suppliers
DELETE FROM inventory_items;
DELETE FROM suppliers;
DELETE FROM categories;

-- 7. Delete customers
DELETE FROM customers;

-- 8. Delete employees (will cascade to related tables)
DELETE FROM employees;

-- 9. Delete business settings
DELETE FROM business_settings;

-- 10. Delete profiles (except the one you're using)
-- IMPORTANT: Replace 'your-user-id-here' with your actual user ID
-- To find your user ID, run: SELECT id, email FROM profiles WHERE role = 'owner';
-- DELETE FROM profiles WHERE id != 'your-user-id-here';

-- Or delete all profiles except owner
DELETE FROM profiles WHERE role != 'owner';

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Reset sequences (optional - for clean IDs)
-- ALTER SEQUENCE employees_id_seq RESTART WITH 1;
-- ALTER SEQUENCE customers_id_seq RESTART WITH 1;
-- ALTER SEQUENCE inventory_items_id_seq RESTART WITH 1;
-- ALTER SEQUENCE suppliers_id_seq RESTART WITH 1;
-- ALTER SEQUENCE categories_id_seq RESTART WITH 1;
-- ALTER SEQUENCE salary_types_id_seq RESTART WITH 1;

-- Verify deletion
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
SELECT 'stock_usages', COUNT(*) FROM stock_usages;
