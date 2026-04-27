-- ============================================
-- CHECK DATA COUNT IN ALL TABLES
-- ============================================
-- Run this before deleting to see what data exists
-- ============================================

-- Main tables count
SELECT 
  'employees' as table_name, 
  COUNT(*) as total_records,
  'User accounts and employee data' as description
FROM employees

UNION ALL

SELECT 
  'profiles', 
  COUNT(*),
  'User profiles (auth data)'
FROM profiles

UNION ALL

SELECT 
  'customers', 
  COUNT(*),
  'Customer records'
FROM customers

UNION ALL

SELECT 
  'inventory_items', 
  COUNT(*),
  'Inventory items/stock'
FROM inventory_items

UNION ALL

SELECT 
  'suppliers', 
  COUNT(*),
  'Supplier records'
FROM suppliers

UNION ALL

SELECT 
  'categories', 
  COUNT(*),
  'Item categories'
FROM categories

UNION ALL

SELECT 
  'attendance_logs', 
  COUNT(*),
  'Attendance check-in/out records'
FROM attendance_logs

UNION ALL

SELECT 
  'payroll_records', 
  COUNT(*),
  'Payroll/salary records'
FROM payroll_records

UNION ALL

SELECT 
  'stock_purchases', 
  COUNT(*),
  'Stock purchase transactions'
FROM stock_purchases

UNION ALL

SELECT 
  'stock_purchase_items', 
  COUNT(*),
  'Stock purchase line items'
FROM stock_purchase_items

UNION ALL

SELECT 
  'stock_usages', 
  COUNT(*),
  'Stock usage records'
FROM stock_usages

UNION ALL

SELECT 
  'salary_types', 
  COUNT(*),
  'Salary type configurations'
FROM salary_types

UNION ALL

SELECT 
  'employee_salary_components', 
  COUNT(*),
  'Employee salary components'
FROM employee_salary_components

UNION ALL

SELECT 
  'business_settings', 
  COUNT(*),
  'Business settings'
FROM business_settings

ORDER BY total_records DESC;

-- ============================================
-- DETAILED BREAKDOWN
-- ============================================

-- Show all users/employees
SELECT 
  'USERS/EMPLOYEES' as section,
  p.email,
  p.full_name,
  p.role,
  p.is_active,
  e.status as employee_status
FROM profiles p
LEFT JOIN employees e ON e.profile_id = p.id
ORDER BY p.role, p.email;

-- Show inventory summary
SELECT 
  'INVENTORY ITEMS' as section,
  name,
  current_stock,
  min_stock,
  unit,
  CASE 
    WHEN current_stock <= min_stock THEN 'LOW STOCK'
    ELSE 'OK'
  END as stock_status
FROM inventory_items
ORDER BY name;

-- Show recent attendance (last 30 days)
SELECT 
  'RECENT ATTENDANCE' as section,
  DATE(check_in_at) as date,
  COUNT(*) as total_checkins
FROM attendance_logs
WHERE check_in_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(check_in_at)
ORDER BY date DESC
LIMIT 10;

-- Show recent payroll
SELECT 
  'RECENT PAYROLL' as section,
  period_start,
  period_end,
  COUNT(*) as total_records,
  SUM(total_salary) as total_amount
FROM payroll_records
GROUP BY period_start, period_end
ORDER BY period_start DESC
LIMIT 5;
