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
    .single();

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

  const { data: employees, error: employeeError } = await supabaseAdmin
    .from("employees")
    .select(`
      *,
      profile:profiles!employees_profile_id_fkey(full_name)
    `)
    .eq("status", "aktif");

  if (employeeError) throw new AppError(employeeError.message, 500);

  const details = [];

  for (const employee of employees) {
    const { count: attendancesCount } = await supabaseAdmin
      .from("attendance_logs")
      .select("*", { count: "exact", head: true })
      .eq("employee_id", employee.id)
      .in("status", ["hadir", "telat"])
      .gte("check_in_at", range.start)
      .lte("check_in_at", range.end);

    const { data: finesData } = await supabaseAdmin
      .from("employee_fines")
      .select("amount")
      .eq("employee_id", employee.id)
      .gte("date", range.start.slice(0, 10))
      .lte("date", range.end.slice(0, 10));

    const totalFines = (finesData || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const baseSalary =
      employee.salary_type === "harian"
        ? Number(employee.base_salary || 0) * Number(attendancesCount || 0)
        : Number(employee.base_salary || 0);
    const allowance = Number(employee.allowance || 0);
    const deductions = Number(employee.default_deduction || 0);
    const netSalary = baseSalary + allowance - totalFines - deductions;

    const { data: detail, error: detailError } = await supabaseAdmin
      .from("payroll_details")
      .upsert(
        {
          period_id: period.id,
          employee_id: employee.id,
          base_salary: baseSalary,
          allowance,
          total_fines: totalFines,
          deductions,
          net_salary: netSalary,
        },
        {
          onConflict: "period_id,employee_id",
        },
      )
      .select("*")
      .single();

    if (detailError) throw new AppError(detailError.message, 500);

    details.push({
      ...detail,
      employee_name: employee.profile?.full_name || "-",
    });
  }

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
      )
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
