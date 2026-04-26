import { AppError } from "../utils/app-error.js";
import { supabaseAdmin } from "./supabase.js";

export async function listFineTypes() {
  const { data, error } = await supabaseAdmin.from("fine_types").select("*").order("name");
  if (error) throw new AppError(error.message, 500);
  return data;
}

export async function createFineType(payload) {
  const { data, error } = await supabaseAdmin.from("fine_types").insert(payload).select("*").single();
  if (error) throw new AppError(error.message, 500);
  return data;
}

export async function listFines(profile) {
  let query = supabaseAdmin
    .from("employee_fines")
    .select(`
      *,
      fine_type:fine_types(name),
      employee:employees!employee_fines_employee_id_fkey(
        id,
        profile:profiles!employees_profile_id_fkey(full_name)
      )
    `)
    .order("date", { ascending: false });

  if (profile.role === "karyawan") {
    const { data: employee } = await supabaseAdmin.from("employees").select("id").eq("profile_id", profile.id).single();
    query = query.eq("employee_id", employee.id);
  }

  const { data, error } = await query;
  if (error) throw new AppError(error.message, 500);
  return data.map((item) => ({
    ...item,
    employee_name: item.employee?.profile?.full_name || "-",
    fine_type_name: item.fine_type?.name || "-",
  }));
}

export async function createFine(payload, createdBy) {
  const { data, error } = await supabaseAdmin
    .from("employee_fines")
    .insert({
      ...payload,
      created_by: createdBy,
    })
    .select("*")
    .single();
  if (error) throw new AppError(error.message, 500);
  return data;
}

