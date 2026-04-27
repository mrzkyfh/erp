import { AppError } from "../utils/app-error.js";
import { monthRange, nowJakarta } from "../utils/time.js";
import { supabaseAdmin } from "./supabase.js";

async function getOrCreatePeriod(month, year, processedBy) {
  const { data: existing } = await supabaseAdmin
    .from("payroll_periods")
    .select("*")
    .eq("month", month)
    .eq("year", year)
    .limit(1)
    .maybeSingle();

  if (existing) return existing;

  const { data, error } = await supabaseAdmin
    .from("payroll_periods")
    .insert({
      month,
      year,
      status: "draft",
      processed_by: processedBy,
    })
    .select("*")
    .single();

  if (error) throw new AppError(error.message, 500);
  return data;
}

export async function processPayroll(month, year, processedBy) {
  const period = await getOrCreatePeriod(month, year, processedBy);
  const range = monthRange(month, year);

  // 1. Get all active employees
  const { data: employees, error: employeeError } = await supabaseAdmin
    .from("employees")
    .select(`
      *,
      profile:profiles!employees_profile_id_fkey(full_name)
    `)
    .eq("status", "aktif");

  if (employeeError) throw new AppError(employeeError.message, 500);

  // 2. Get all salary types
  const { data: salaryTypes, error: salaryTypeError } = await supabaseAdmin
    .from("salary_types")
    .select("*");

  if (salaryTypeError) throw new AppError(salaryTypeError.message, 500);

  const details = [];

  for (const employee of employees) {
    // 3. Count attendances for this month
    const { data: attendanceLogs, error: attError } = await supabaseAdmin
      .from("attendance_logs")
      .select("check_in_at, check_out_at")
      .eq("employee_id", employee.id)
      .in("status", ["hadir", "telat"])
      .gte("check_in_at", range.start)
      .lte("check_in_at", range.end);

    if (attError) throw new AppError(attError.message, 500);

    const attendancesCount = attendanceLogs.length;
    
    // 4. Calculate total hours worked
    let totalHours = 0;
    attendanceLogs.forEach(log => {
      if (log.check_in_at && log.check_out_at) {
        const start = new Date(log.check_in_at);
        const end = new Date(log.check_out_at);
        const diffMs = end - start;
        const diffHours = diffMs / (1000 * 60 * 60);
        totalHours += Math.max(0, diffHours);
      }
    });

    // 5. Get salary components FOR THIS SPECIFIC EMPLOYEE
    const { data: empComponents, error: empCompError } = await supabaseAdmin
      .from("employee_salary_components")
      .select(`
        amount,
        salary_types (
          id,
          name,
          unit
        )
      `)
      .eq("employee_id", employee.id);

    if (empCompError) throw new AppError(empCompError.message, 500);

    // Fallback: If no custom config, use global salary types (optional, based on user preference)
    const activeComponents = empComponents.length > 0 
      ? empComponents.map(ec => ({
          id: ec.salary_types.id,
          name: ec.salary_types.name,
          unit: ec.salary_types.unit,
          amount: ec.amount
        }))
      : salaryTypes; // Using global defaults if not configured per employee

    const payrollItems = [];
    let totalAllowances = 0;

    for (const type of activeComponents) {
      let count = 1;
      let totalAmount = 0;

      if (type.unit === 'per_kehadiran') {
        count = attendancesCount;
        totalAmount = Number(type.amount) * count;
      } else if (type.unit === 'per_jam') {
        count = Math.round(totalHours * 100) / 100;
        totalAmount = Number(type.amount) * count;
      } else {
        count = 1;
        totalAmount = Number(type.amount);
      }

      payrollItems.push({
        salary_type_id: type.id,
        name: type.name,
        amount: type.amount,
        unit: type.unit,
        count: count,
        total_amount: Math.round(totalAmount)
      });

      totalAllowances += totalAmount;
    }


    const deductions = Number(employee.default_deduction || 0);
    const netSalary = Math.round(totalAllowances - deductions);

    // 6. Upsert payroll detail
    const { data: detail, error: detailError } = await supabaseAdmin
      .from("payroll_details")
      .upsert(
        {
          period_id: period.id,
          employee_id: employee.id,
          base_salary: 0, // We now use payroll_items for everything
          allowance: 0, 
          deductions,
          total_allowances: Math.round(totalAllowances),
          net_salary: netSalary,
        },
        {
          onConflict: "period_id,employee_id",
        },
      )
      .select("*")
      .single();

    if (detailError) throw new AppError(detailError.message, 500);

    // 7. Insert payroll items (breakdown)
    // First, clear existing items for this detail
    await supabaseAdmin.from("payroll_items").delete().eq("payroll_detail_id", detail.id);
    
    // Then insert new ones
    const itemsWithDetailId = payrollItems.map(item => ({
      ...item,
      payroll_detail_id: detail.id
    }));
    
    const { error: itemsError } = await supabaseAdmin.from("payroll_items").insert(itemsWithDetailId);
    if (itemsError) throw new AppError(itemsError.message, 500);

    details.push({
      ...detail,
      employee_name: employee.profile?.full_name || "-",
      items: payrollItems
    });
  }

  // 8. Update period status
  const { error: periodError } = await supabaseAdmin
    .from("payroll_periods")
    .update({
      status: "processed",
      processed_at: nowJakarta().toISOString(),
      processed_by: processedBy,
    })
    .eq("id", period.id);

  if (periodError) throw new AppError(periodError.message, 500);

  return {
    period,
    details,
  };
}

export async function getPayrollOverview(profile, month, year) {
  let periodQuery = supabaseAdmin
    .from("payroll_periods")
    .select("*")
    .order("year", { ascending: false })
    .order("month", { ascending: false })
    .limit(12);

  if (month) periodQuery = periodQuery.eq("month", month);
  if (year) periodQuery = periodQuery.eq("year", year);

  const { data: periods, error: periodsError } = await periodQuery;
  if (periodsError) throw new AppError(periodsError.message, 500);

  let detailQuery = supabaseAdmin
    .from("payroll_details")
    .select(`
      *,
      period:payroll_periods(month, year),
      employee:employees!payroll_details_employee_id_fkey(
        id,
        profile:profiles!employees_profile_id_fkey(full_name)
      ),
      items:payroll_items(*)
    `)
    .order("created_at", { ascending: false });

  if (periods.length) {
    detailQuery = detailQuery.in("period_id", periods.map((period) => period.id));
  }

  if (profile.role === "karyawan") {
    const { data: employee } = await supabaseAdmin.from("employees").select("id").eq("profile_id", profile.id).single();
    detailQuery = detailQuery.eq("employee_id", employee.id);
  }

  const { data: details, error: detailsError } = await detailQuery;
  if (detailsError) throw new AppError(detailsError.message, 500);

  return {
    periods,
    details: details.map((item) => ({
      ...item,
      employee_name: item.employee?.profile?.full_name || "-",
    })),
  };
}

export async function markPayrollPaid(detailId, paidBy) {
  const { data, error } = await supabaseAdmin
    .from("payroll_details")
    .update({
      is_paid: true,
      paid_at: nowJakarta().toISOString(),
      paid_by: paidBy,
    })
    .eq("id", detailId)
    .select("*")
    .single();
  if (error) throw new AppError(error.message, 500);
  return data;
}
