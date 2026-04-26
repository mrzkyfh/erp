import { AppError } from "../utils/app-error.js";
import { supabaseAdmin } from "./supabase.js";

function mapEmployee(employee) {
  return {
    ...employee,
    jobdesks: (employee.employee_jobdesks || []).map((item) => item.jobdesk).filter(Boolean),
  };
}

export async function listEmployees() {
  const { data, error } = await supabaseAdmin
    .from("employees")
    .select(`
      *,
      profile:profiles!employees_profile_id_fkey(*),
      employee_jobdesks(
        jobdesk:jobdesks(*)
      )
    `)
    .order("join_date", { ascending: false });

  if (error) throw new AppError(error.message, 500);
  return data.map(mapEmployee);
}

export async function listJobdesks() {
  const { data, error } = await supabaseAdmin.from("jobdesks").select("*").order("name");
  if (error) throw new AppError(error.message, 500);
  return data;
}

export async function getEmployeeByProfileId(profileId) {
  const { data, error } = await supabaseAdmin.from("employees").select("*").eq("profile_id", profileId).single();
  if (error) throw new AppError("Data karyawan tidak ditemukan.", 404);
  return data;
}

export async function createEmployee(payload) {
  if (!payload.password) {
    throw new AppError("Password awal wajib diisi untuk karyawan baru.", 422);
  }

  const { data: authResult, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: payload.email,
    password: payload.password,
    email_confirm: true,
    user_metadata: {
      full_name: payload.full_name,
    },
  });

  if (authError) throw new AppError(authError.message, 400);

  const userId = authResult.user.id;

  const profilePayload = {
    id: userId,
    email: payload.email,
    full_name: payload.full_name,
    nik: payload.nik,
    phone: payload.phone,
    address: payload.address,
    role: payload.role,
    joined_at: payload.join_date,
    is_active: payload.status === "aktif",
  };

  const { error: profileError } = await supabaseAdmin.from("profiles").upsert(profilePayload);
  if (profileError) throw new AppError(profileError.message, 500);

  const { data: employee, error: employeeError } = await supabaseAdmin
    .from("employees")
    .insert({
      profile_id: userId,
      salary_type: payload.salary_type,
      base_salary: payload.base_salary,
      allowance: payload.allowance,
      default_deduction: payload.default_deduction || 0,
      join_date: payload.join_date,
      status: payload.status,
    })
    .select("*")
    .single();

  if (employeeError) throw new AppError(employeeError.message, 500);

  if (payload.jobdesk_ids?.length) {
    const { error: relationError } = await supabaseAdmin.from("employee_jobdesks").insert(
      payload.jobdesk_ids.map((jobdeskId) => ({
        employee_id: employee.id,
        jobdesk_id: jobdeskId,
      })),
    );
    if (relationError) throw new AppError(relationError.message, 500);
  }

  return employee;
}

export async function updateEmployee(employeeId, payload) {
  const { data: existing, error: existingError } = await supabaseAdmin
    .from("employees")
    .select("id, profile_id")
    .eq("id", employeeId)
    .single();

  if (existingError || !existing) throw new AppError("Karyawan tidak ditemukan.", 404);

  if (payload.email || payload.password || payload.full_name) {
    const updateResult = await supabaseAdmin.auth.admin.updateUserById(existing.profile_id, {
      ...(payload.email ? { email: payload.email } : {}),
      ...(payload.password ? { password: payload.password } : {}),
      ...(payload.full_name ? { user_metadata: { full_name: payload.full_name } } : {}),
    });
    if (updateResult.error) throw new AppError(updateResult.error.message, 400);
  }

  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .update({
      email: payload.email,
      full_name: payload.full_name,
      nik: payload.nik,
      phone: payload.phone,
      address: payload.address,
      role: payload.role,
      joined_at: payload.join_date,
      is_active: payload.status === "aktif",
    })
    .eq("id", existing.profile_id);

  if (profileError) throw new AppError(profileError.message, 500);

  const { error: employeeError } = await supabaseAdmin
    .from("employees")
    .update({
      salary_type: payload.salary_type,
      base_salary: payload.base_salary,
      allowance: payload.allowance,
      default_deduction: payload.default_deduction || 0,
      join_date: payload.join_date,
      status: payload.status,
    })
    .eq("id", employeeId);

  if (employeeError) throw new AppError(employeeError.message, 500);

  await supabaseAdmin.from("employee_jobdesks").delete().eq("employee_id", employeeId);
  if (payload.jobdesk_ids?.length) {
    const { error: relationError } = await supabaseAdmin.from("employee_jobdesks").insert(
      payload.jobdesk_ids.map((jobdeskId) => ({
        employee_id: employeeId,
        jobdesk_id: jobdeskId,
      })),
    );
    if (relationError) throw new AppError(relationError.message, 500);
  }

  return true;
}

export async function updateEmployeeStatus(employeeId, status) {
  const { data: employee, error } = await supabaseAdmin
    .from("employees")
    .update({ status })
    .eq("id", employeeId)
    .select("profile_id")
    .single();
  if (error) throw new AppError(error.message, 500);

  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .update({ is_active: status === "aktif" })
    .eq("id", employee.profile_id);
  if (profileError) throw new AppError(profileError.message, 500);
}
