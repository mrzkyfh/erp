import { AppError } from "../utils/app-error.js";
import { monthRange, nowJakarta, todayDate } from "../utils/time.js";
import { getEmployeeByProfileId } from "./employee-service.js";
import { supabaseAdmin } from "./supabase.js";

export async function getDashboardSummary(profile) {
  const month = nowJakarta().month() + 1;
  const year = nowJakarta().year();
  const range = monthRange(month, year);

  const [
    employeesResult,
    attendanceCountResult,
    payrollResult,
    lowStockResult,
    businessSettingsResult,
    attendanceLogsResult,
  ] = await Promise.all([
    supabaseAdmin.from("employees").select("*", { count: "exact", head: true }).eq("status", "aktif"),
    supabaseAdmin
      .from("attendance_logs")
      .select("*", { count: "exact", head: true })
      .in("status", ["hadir", "telat"])
      .gte("check_in_at", `${todayDate()}T00:00:00`)
      .lte("check_in_at", `${todayDate()}T23:59:59`),
    supabaseAdmin
      .from("payroll_details")
      .select("net_salary")
      .gte("created_at", range.start)
      .lte("created_at", range.end),
    supabaseAdmin.from("inventory_items").select("name,current_stock,min_stock"),
    supabaseAdmin.from("business_settings").select("*").limit(1).single(),
    supabaseAdmin
      .from("attendance_logs")
      .select(`
        *,
        employee:employees!attendance_logs_employee_id_fkey(
          profile:profiles!employees_profile_id_fkey(full_name)
        )
      `)
      .order("check_in_at", { ascending: false })
      .limit(5),
  ]);

  if (
    employeesResult.error ||
    attendanceCountResult.error ||
    payrollResult.error ||
    lowStockResult.error ||
    attendanceLogsResult.error ||
    businessSettingsResult.error
  ) {
    throw new AppError("Gagal memuat ringkasan dashboard.", 500);
  }

  let lastAttendance = null;
  let currentEmployeeId = null;
  if (profile.role === "karyawan") {
    try {
      const employee = await getEmployeeByProfileId(profile.id);
      currentEmployeeId = employee.id;
      const { data } = await supabaseAdmin
        .from("attendance_logs")
        .select("check_in_at")
        .eq("employee_id", employee.id)
        .order("check_in_at", { ascending: false })
        .limit(1)
        .single();
      lastAttendance = data?.check_in_at || null;
    } catch (_error) {
      lastAttendance = null;
    }
  } else {
    lastAttendance = attendanceLogsResult.data[0]?.check_in_at || null;
  }

  const latestAttendances =
    profile.role === "karyawan"
      ? attendanceLogsResult.data
          .filter((item) => item.employee_id === currentEmployeeId)
          .map((item) => ({
            ...item,
            employee_name: item.employee?.profile?.full_name || "-",
          }))
      : attendanceLogsResult.data.map((item) => ({
          ...item,
          employee_name: item.employee?.profile?.full_name || "-",
        }));

  const lowStockItems = lowStockResult.data.filter(
    (item) => Number(item.current_stock || 0) <= Number(item.min_stock || 0),
  );

  return {
    employeesActive: employeesResult.count || 0,
    presentToday: attendanceCountResult.count || 0,
    payrollThisMonth: (payrollResult.data || []).reduce((sum, item) => sum + Number(item.net_salary || 0), 0),
    lowStockItems: lowStockItems.length,
    businessRadius: businessSettingsResult.data?.attendance_radius_meters || 100,
    currentPeriod: `${month}/${year}`,
    lastAttendance,
    latestAttendances,
    alerts: [
      ...(lowStockItems.length
        ? [
            {
              title: "Stok minimum terdeteksi",
              description: `${lowStockItems.length} item berada di bawah batas minimum.`,
            },
          ]
        : []),
      {
        title: "Payroll siap diproses",
        description: "Lakukan pengecekan denda dan absensi sebelum konfirmasi pembayaran.",
      },
    ],
  };
}
