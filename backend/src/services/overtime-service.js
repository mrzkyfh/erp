import { AppError } from "../utils/app-error.js";
import { nowJakarta, todayDate } from "../utils/time.js";
import { getEmployeeByProfileId } from "./employee-service.js";
import { supabaseAdmin } from "./supabase.js";

/**
 * Get overtime logs
 * Owner/Manager: see all
 * Karyawan: see own only
 */
export async function listOvertimeLogs(profile, filters = {}) {
  let query = supabaseAdmin
    .from("overtime_logs")
    .select(`
      *,
      employee:employees!overtime_logs_employee_id_fkey(
        id,
        profile:profiles!employees_profile_id_fkey(full_name)
      ),
      approver:profiles!overtime_logs_approved_by_fkey(full_name)
    `)
    .order("date", { ascending: false })
    .order("start_time", { ascending: false })
    .limit(100);

  // Filter by role
  if (profile.role === "karyawan") {
    const employee = await getEmployeeByProfileId(profile.id);
    query = query.eq("employee_id", employee.id);
  }

  // Filter by status
  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  // Filter by date range
  if (filters.startDate) {
    query = query.gte("date", filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte("date", filters.endDate);
  }

  const { data, error } = await query;
  if (error) throw new AppError(error.message, 500);

  // Get overtime salary type ID
  const { data: overtimeSalaryType } = await supabaseAdmin
    .from("salary_types")
    .select("id, amount")
    .eq("unit", "per_jam_lembur")
    .limit(1)
    .maybeSingle();

  if (!overtimeSalaryType) {
    throw new AppError("Tipe gaji lembur belum dikonfigurasi.", 500);
  }

  // Get all unique employee IDs
  const employeeIds = [...new Set(data.map(log => log.employee_id))];

  // Get custom overtime rates for all employees
  const { data: customRates } = await supabaseAdmin
    .from("employee_salary_components")
    .select("employee_id, amount")
    .eq("salary_type_id", overtimeSalaryType.id)
    .in("employee_id", employeeIds);

  // Create a map of employee_id -> custom rate
  const rateMap = {};
  customRates?.forEach(rate => {
    rateMap[rate.employee_id] = Number(rate.amount);
  });

  // Default rate from salary_types
  const defaultRate = Number(overtimeSalaryType.amount || 0);

  return data.map((item) => {
    // Use custom rate if exists, otherwise use default
    const ratePerHour = rateMap[item.employee_id] || defaultRate;
    
    return {
      ...item,
      employee_name: item.employee?.profile?.full_name || "-",
      approver_name: item.approver?.full_name || "-",
      rate_per_hour: ratePerHour,
      total_earning: item.total_hours ? Math.round(item.total_hours * ratePerHour) : 0,
    };
  });
}

/**
 * Start overtime (check-in lembur)
 */
export async function startOvertime(profile, payload) {
  const employee = await getEmployeeByProfileId(profile.id);

  // Check if already has active overtime today
  const { data: activeOvertime } = await supabaseAdmin
    .from("overtime_logs")
    .select("id")
    .eq("employee_id", employee.id)
    .eq("date", todayDate())
    .is("end_time", null)
    .maybeSingle();

  if (activeOvertime) {
    throw new AppError("Anda masih memiliki sesi lembur aktif yang belum selesai.", 409);
  }

  const { data, error } = await supabaseAdmin
    .from("overtime_logs")
    .insert({
      employee_id: employee.id,
      date: todayDate(),
      start_time: nowJakarta().toISOString(),
      reason: payload.reason || "Lembur",
      status: "pending",
    })
    .select("*")
    .single();

  if (error) throw new AppError(error.message, 500);
  return data;
}

/**
 * End overtime (check-out lembur)
 */
export async function endOvertime(profile, payload) {
  const employee = await getEmployeeByProfileId(profile.id);

  // Find active overtime session
  const { data: overtime, error: findError } = await supabaseAdmin
    .from("overtime_logs")
    .select("*")
    .eq("employee_id", employee.id)
    .eq("date", todayDate())
    .is("end_time", null)
    .order("start_time", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (findError || !overtime) {
    throw new AppError("Sesi lembur aktif tidak ditemukan.", 404);
  }

  const endTime = nowJakarta().toISOString();
  const startTime = new Date(overtime.start_time);
  const endTimeDate = new Date(endTime);
  
  // Calculate total hours
  const diffMs = endTimeDate - startTime;
  const totalHours = Math.max(0, diffMs / (1000 * 60 * 60));
  const roundedHours = Math.round(totalHours * 100) / 100;

  const { data, error } = await supabaseAdmin
    .from("overtime_logs")
    .update({
      end_time: endTime,
      total_hours: roundedHours,
    })
    .eq("id", overtime.id)
    .select("*")
    .single();

  if (error) throw new AppError(error.message, 500);
  return data;
}

/**
 * Create manual overtime entry (for owner/manager)
 */
export async function createManualOvertime(profile, payload) {
  if (profile.role !== "owner" && profile.role !== "manager") {
    throw new AppError("Hanya owner/manager yang bisa membuat entri lembur manual.", 403);
  }

  // Calculate total hours if both times provided
  let totalHours = 0;
  if (payload.start_time && payload.end_time) {
    const start = new Date(payload.start_time);
    const end = new Date(payload.end_time);
    const diffMs = end - start;
    totalHours = Math.max(0, diffMs / (1000 * 60 * 60));
    totalHours = Math.round(totalHours * 100) / 100;
  }

  const { data, error } = await supabaseAdmin
    .from("overtime_logs")
    .insert({
      employee_id: payload.employee_id,
      date: payload.date || todayDate(),
      start_time: payload.start_time,
      end_time: payload.end_time || null,
      total_hours: totalHours,
      reason: payload.reason || "Lembur",
      status: payload.status || "pending",
      notes: payload.notes,
    })
    .select("*")
    .single();

  if (error) throw new AppError(error.message, 500);
  return data;
}

/**
 * Approve or reject overtime
 */
export async function approveOvertime(profile, overtimeId, payload) {
  if (profile.role !== "owner" && profile.role !== "manager") {
    throw new AppError("Hanya owner/manager yang bisa approve lembur.", 403);
  }

  const { data, error } = await supabaseAdmin
    .from("overtime_logs")
    .update({
      status: payload.status, // 'approved' or 'rejected'
      approved_by: profile.id,
      approved_at: nowJakarta().toISOString(),
      notes: payload.notes,
    })
    .eq("id", overtimeId)
    .select("*")
    .single();

  if (error) throw new AppError(error.message, 500);
  return data;
}

/**
 * Delete overtime log
 */
export async function deleteOvertime(profile, overtimeId) {
  if (profile.role !== "owner") {
    throw new AppError("Hanya owner yang bisa menghapus log lembur.", 403);
  }

  const { error } = await supabaseAdmin
    .from("overtime_logs")
    .delete()
    .eq("id", overtimeId);

  if (error) throw new AppError(error.message, 500);
  return { success: true };
}

/**
 * Get overtime summary for payroll calculation
 */
export async function getOvertimeSummary(employeeId, startDate, endDate) {
  const { data, error } = await supabaseAdmin
    .from("overtime_logs")
    .select("total_hours")
    .eq("employee_id", employeeId)
    .eq("status", "approved") // Only count approved overtime
    .gte("date", startDate)
    .lte("date", endDate);

  if (error) throw new AppError(error.message, 500);

  const totalOvertimeHours = data.reduce((sum, log) => sum + Number(log.total_hours || 0), 0);
  return {
    total_hours: Math.round(totalOvertimeHours * 100) / 100,
    count: data.length,
  };
}
