import { AppError } from "../utils/app-error.js";
import { supabaseAdmin } from "./supabase.js";

export async function getAllSalaryTypes() {
  const { data, error } = await supabaseAdmin
    .from("salary_types")
    .select("*")
    .order("created_at", { ascending: true });
    
  if (error) throw new AppError(error.message, 500);
  return data;
}

export async function createSalaryType(payload) {
  const { data, error } = await supabaseAdmin
    .from("salary_types")
    .insert(payload)
    .select("*")
    .single();
    
  if (error) throw new AppError(error.message, 500);
  return data;
}

export async function updateSalaryType(id, payload) {
  const { data, error } = await supabaseAdmin
    .from("salary_types")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();
    
  if (error) throw new AppError(error.message, 500);
  return data;
}

export async function deleteSalaryType(id) {
  const { error } = await supabaseAdmin
    .from("salary_types")
    .delete()
    .eq("id", id);
    
  if (error) throw new AppError(error.message, 500);
  return true;
}
