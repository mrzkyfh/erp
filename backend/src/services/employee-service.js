import { AppError } from "../utils/app-error.js";
import { supabaseAdmin } from "./supabase.js";


export async function listEmployees() {
  const { data, error } = await supabaseAdmin
    .from("employees")
    .select(`
      *,
      profile:profiles!employees_profile_id_fkey(*)
    `)
    .order("join_date", { ascending: false });

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

  console.log("Creating auth user...");
  const { data: authResult, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: payload.email,
    password: payload.password,
    email_confirm: true,
    user_metadata: {
      full_name: payload.full_name,
    },
  });

  if (authError) {
    console.error("Auth error:", authError.message);
    throw new AppError(authError.message, 400);
  }

  const userId = authResult.user.id;
  console.log("Auth user created:", userId);

  const profilePayload = {
    id: userId,
    email: payload.email,
    full_name: payload.full_name,
    phone: payload.phone,

    address: payload.address,
    role: payload.role,
    joined_at: payload.join_date,
    is_active: payload.status === "aktif",
  };

  console.log("Upserting profile...");
  const { error: profileError } = await supabaseAdmin.from("profiles").upsert(profilePayload);
  if (profileError) {
    console.error("Profile error:", profileError.message);
    throw new AppError(profileError.message, 500);
  }

  console.log("Inserting employee...");
  const { data: employee, error: employeeError } = await supabaseAdmin
    .from("employees")
    .insert({
      profile_id: userId,
      salary_type: payload.salary_type || "bulanan",
      base_salary: payload.base_salary || 0,
      allowance: payload.allowance || 0,
      default_deduction: payload.default_deduction || 0,
      join_date: payload.join_date,
      status: payload.status,

    })
    .select("*")
    .single();

  if (employeeError) {
    console.error("Employee error:", employeeError.message);
    throw new AppError(employeeError.message, 500);
  }


  return employee;
}

export async function updateEmployee(employeeId, payload) {
  console.log(`Starting update for employee ${employeeId}`);
  const { data: existing, error: existingError } = await supabaseAdmin
    .from("employees")
    .select("id, profile_id")
    .eq("id", employeeId)
    .single();

  if (existingError || !existing) throw new AppError("Karyawan tidak ditemukan.", 404);

  if (payload.email || payload.password || payload.full_name) {
    console.log("Updating auth user...");
    const updatePayload = {};
    if (payload.email) updatePayload.email = payload.email;
    if (payload.password) updatePayload.password = payload.password;
    if (payload.full_name) updatePayload.user_metadata = { full_name: payload.full_name };

    const updateResult = await supabaseAdmin.auth.admin.updateUserById(existing.profile_id, updatePayload);
    if (updateResult.error) {
      console.error("Auth update error:", updateResult.error.message);
      throw new AppError(updateResult.error.message, 400);
    }
    console.log("Auth user updated.");
  }

  console.log("Updating profile table...");
  const profileUpdate = {};
  if (payload.email) profileUpdate.email = payload.email;
  if (payload.full_name) profileUpdate.full_name = payload.full_name;
  if (payload.phone !== undefined) profileUpdate.phone = payload.phone;
  if (payload.address !== undefined) profileUpdate.address = payload.address;
  if (payload.role) profileUpdate.role = payload.role;
  if (payload.join_date) profileUpdate.joined_at = payload.join_date;
  if (payload.status) profileUpdate.is_active = payload.status === "aktif";

  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .update(profileUpdate)
    .eq("id", existing.profile_id);

  if (profileError) {
    console.error("Profile update error:", profileError.message);
    throw new AppError(profileError.message, 500);
  }

  console.log("Updating employee table...");
  const employeeUpdate = {};
  if (payload.salary_type) employeeUpdate.salary_type = payload.salary_type;
  if (payload.base_salary !== undefined) employeeUpdate.base_salary = payload.base_salary;
  if (payload.allowance !== undefined) employeeUpdate.allowance = payload.allowance;
  if (payload.default_deduction !== undefined) employeeUpdate.default_deduction = payload.default_deduction;
  if (payload.join_date) employeeUpdate.join_date = payload.join_date;
  if (payload.status) employeeUpdate.status = payload.status;

  const { error: employeeError } = await supabaseAdmin
    .from("employees")
    .update(employeeUpdate)
    .eq("id", employeeId);

  if (employeeError) {
    console.error("Employee update error:", employeeError.message);
    throw new AppError(employeeError.message, 500);
  }


  console.log("Update completed successfully.");
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

export async function getEmployeeSalaryConfig(employeeId) {
  const { data, error } = await supabaseAdmin
    .from("employee_salary_components")
    .select(`
      *,
      salary_type:salary_types(*)
    `)
    .eq("employee_id", employeeId);
    
  if (error) throw new AppError(error.message, 500);
  return data;
}

export async function updateEmployeeSalaryConfig(employeeId, components) {
  // Clear existing first
  await supabaseAdmin
    .from("employee_salary_components")
    .delete()
    .eq("employee_id", employeeId);
    
  if (components.length > 0) {
    const { error } = await supabaseAdmin
      .from("employee_salary_components")
      .insert(components.map(c => ({
        employee_id: employeeId,
        salary_type_id: c.salary_type_id,
        amount: c.amount
      })));
      
    if (error) throw new AppError(error.message, 500);
  }
  
  return true;
}

