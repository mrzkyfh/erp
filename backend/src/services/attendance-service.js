import { randomUUID } from "node:crypto";
import { AppError } from "../utils/app-error.js";
import { isLate, nowJakarta, todayDate } from "../utils/time.js";
import { getEmployeeByProfileId } from "./employee-service.js";
import { supabaseAdmin } from "./supabase.js";


async function getBusinessSettings() {
  const { data, error } = await supabaseAdmin.from("business_settings").select("*").limit(1).single();
  if (error || !data) {
    throw new AppError("Pengaturan bisnis belum diatur di Supabase.", 500);
  }
  return data;
}

async function findActiveSession(qrToken) {
  let query = supabaseAdmin
    .from("attendance_sessions")
    .select("*")
    .gte("expires_at", nowJakarta().toISOString())
    .order("created_at", { ascending: false });

  if (qrToken) {
    query = query.eq("qr_token", qrToken);
  } else {
    query = query.eq("date", todayDate());
  }

  const { data, error } = await query.limit(1).single();
  if (error || !data) {
    throw new AppError("Sesi absensi aktif tidak ditemukan atau sudah kadaluarsa.", 404);
  }
  return data;
}

async function createAutoFine(employeeId, triggerType) {
  const { data: fineType } = await supabaseAdmin
    .from("fine_types")
    .select("*")
    .eq("trigger_type", triggerType)
    .eq("is_auto", true)
    .limit(1)
    .single();

  if (!fineType) return;

  await supabaseAdmin.from("employee_fines").insert({
    employee_id: employeeId,
    fine_type_id: fineType.id,
    amount: fineType.amount,
    reason: `Denda otomatis: ${fineType.name}`,
    date: todayDate(),
  });
}

export async function getActiveSessions() {
  const { data, error } = await supabaseAdmin
    .from("attendance_sessions")
    .select("*")
    .gte("expires_at", nowJakarta().toISOString())
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) throw new AppError(error.message, 500);
  return data;
}

export async function generateAttendanceSession(createdBy) {
  const { data, error } = await supabaseAdmin
    .from("attendance_sessions")
    .insert({
      date: todayDate(),
      qr_token: randomUUID(),
      expires_at: nowJakarta().add(24, "hour").toISOString(),
      created_by: createdBy,
    })
    .select("*")
    .single();

  if (error) throw new AppError(error.message, 500);
  return data;
}

export async function listAttendanceLogs(profile) {
  let query = supabaseAdmin
    .from("attendance_logs")
    .select(`
      *,
      employee:employees!attendance_logs_employee_id_fkey(
        id,
        profile:profiles!employees_profile_id_fkey(full_name)
      )
    `)
    .order("check_in_at", { ascending: false })
    .limit(100);

  if (profile.role === "karyawan") {
    const employee = await getEmployeeByProfileId(profile.id);
    query = query.eq("employee_id", employee.id);
  }

  const { data, error } = await query;
  if (error) throw new AppError(error.message, 500);

  return data.map((item) => ({
    ...item,
    employee_name: item.employee?.profile?.full_name || "-",
  }));
}

export async function checkInAttendance(profile, payload) {
  const employee = await getEmployeeByProfileId(profile.id);
  const settings = await getBusinessSettings();
  const session = await findActiveSession(payload.qr_token);
  const currentTime = nowJakarta().toISOString();


  const { data: existingLog } = await supabaseAdmin
    .from("attendance_logs")
    .select("id")
    .eq("employee_id", employee.id)
    .gte("check_in_at", nowJakarta().startOf("day").toISOString())
    .lte("check_in_at", nowJakarta().endOf("day").toISOString())
    .maybeSingle();

  if (existingLog) {
    throw new AppError("Anda sudah melakukan check-in hari ini.", 409);
  }

  const status = isLate(currentTime, settings.work_start_time, settings.tolerance_minutes) ? "telat" : "hadir";

  const { data, error } = await supabaseAdmin
    .from("attendance_logs")
    .insert({
      employee_id: employee.id,
      session_id: session.id,
      check_in_at: currentTime,
      status,
    })
    .select("*")
    .single();

  if (error) throw new AppError(error.message, 500);
  if (status === "telat") await createAutoFine(employee.id, "late");
  return data;
}

export async function checkOutAttendance(profile, payload) {
  const employee = await getEmployeeByProfileId(profile.id);
  const settings = await getBusinessSettings();

  const { data: log, error: logError } = await supabaseAdmin
    .from("attendance_logs")
    .select("*")
    .eq("employee_id", employee.id)
    .gte("check_in_at", nowJakarta().startOf("day").toISOString())
    .lte("check_in_at", nowJakarta().endOf("day").toISOString())
    .is("check_out_at", null)
    .single();

  if (logError || !log) throw new AppError("Check-in hari ini belum ditemukan.", 404);

  const { data, error } = await supabaseAdmin
    .from("attendance_logs")
    .update({
      check_out_at: nowJakarta().toISOString(),
    })
    .eq("id", log.id)
    .select("*")
    .single();

  if (error) throw new AppError(error.message, 500);
  return data;
}

export async function submitPermission(profile, payload) {
  const employee = await getEmployeeByProfileId(profile.id);
  const { data, error } = await supabaseAdmin
    .from("attendance_logs")
    .insert({
      employee_id: employee.id,
      check_in_at: nowJakarta().toISOString(),
      status: payload.status,
      permission_reason: payload.reason,
    })
    .select("*")
    .single();

  if (error) throw new AppError(error.message, 500);
  return data;
}
