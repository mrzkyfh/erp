import { AppError } from "../utils/app-error.js";
import { supabaseAdmin } from "./supabase.js";

export async function listCustomers(search = "") {
  let query = supabaseAdmin.from("customers").select("*").order("created_at", { ascending: false });
  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw new AppError(error.message, 500);
  return data;
}

export async function createCustomer(payload) {
  const { data, error } = await supabaseAdmin.from("customers").insert(payload).select("*").single();
  if (error) throw new AppError(error.message, 500);
  return data;
}

export async function updateCustomer(id, payload) {
  const { data, error } = await supabaseAdmin.from("customers").update(payload).eq("id", id).select("*").single();
  if (error) throw new AppError(error.message, 500);
  return data;
}

export async function deleteCustomer(id) {
  const { error } = await supabaseAdmin.from("customers").delete().eq("id", id);
  if (error) throw new AppError(error.message, 500);
}

