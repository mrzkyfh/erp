import { AppError } from "../utils/app-error.js";
import { supabaseAdmin } from "./supabase.js";

export async function getInventoryOverview() {
  const [itemsResult, categoriesResult, suppliersResult, purchasesResult, usagesResult] = await Promise.all([
    supabaseAdmin
      .from("inventory_items")
      .select(`
        *,
        category:categories(*)
      `)
      .order("name"),
    supabaseAdmin.from("categories").select("*").order("name"),
    supabaseAdmin.from("suppliers").select("*").order("name"),
    supabaseAdmin
      .from("stock_purchases")
      .select(`
        *,
        supplier:suppliers(*)
      `)
      .order("date", { ascending: false })
      .limit(10),
    supabaseAdmin
      .from("stock_usages")
      .select(`
        *,
        item:inventory_items(name, unit)
      `)
      .order("date", { ascending: false })
      .limit(10),
  ]);

  if (itemsResult.error || categoriesResult.error || suppliersResult.error || purchasesResult.error || usagesResult.error) {
    throw new AppError("Gagal memuat data inventori.", 500);
  }

  return {
    items: itemsResult.data,
    categories: categoriesResult.data,
    suppliers: suppliersResult.data,
    purchases: purchasesResult.data,
    usages: usagesResult.data,
  };
}

export async function createInventoryItem(payload) {
  const { data, error } = await supabaseAdmin.from("inventory_items").insert(payload).select("*").single();
  if (error) throw new AppError(error.message, 500);
  return data;
}

export async function createSupplier(payload) {
  const { data, error } = await supabaseAdmin.from("suppliers").insert(payload).select("*").single();
  if (error) throw new AppError(error.message, 500);
  return data;
}

export async function createPurchase(payload, createdBy) {
  const totalAmount = Number(payload.qty) * Number(payload.unit_price || 0);

  const { data: purchase, error: purchaseError } = await supabaseAdmin
    .from("stock_purchases")
    .insert({
      supplier_id: payload.supplier_id,
      date: payload.date,
      total_amount: totalAmount,
      status: "confirmed",
      created_by: createdBy,
    })
    .select("*")
    .single();

  if (purchaseError) throw new AppError(purchaseError.message, 500);

  const { error: itemError } = await supabaseAdmin.from("stock_purchase_items").insert({
    purchase_id: purchase.id,
    item_id: payload.item_id,
    qty: payload.qty,
    unit_price: payload.unit_price,
  });
  if (itemError) throw new AppError(itemError.message, 500);

  const { data: currentItem } = await supabaseAdmin
    .from("inventory_items")
    .select("current_stock")
    .eq("id", payload.item_id)
    .single();

  if (!currentItem) throw new AppError("Item inventori tidak ditemukan.", 404);

  const { error: stockError } = await supabaseAdmin
    .from("inventory_items")
    .update({
      current_stock: Number(currentItem.current_stock || 0) + Number(payload.qty),
    })
    .eq("id", payload.item_id);
  if (stockError) throw new AppError(stockError.message, 500);

  return purchase;
}

export async function createStockUsage(payload, createdBy, usedBy) {
  const { data: currentItem, error: itemError } = await supabaseAdmin
    .from("inventory_items")
    .select("current_stock")
    .eq("id", payload.item_id)
    .single();

  if (itemError || !currentItem) throw new AppError("Item inventori tidak ditemukan.", 404);
  if (Number(currentItem.current_stock) < Number(payload.qty)) {
    throw new AppError("Stok tidak mencukupi untuk penggunaan ini.", 422);
  }

  const { data, error } = await supabaseAdmin
    .from("stock_usages")
    .insert({
      item_id: payload.item_id,
      qty: payload.qty,
      reason: payload.reason,
      used_by: usedBy,
      date: payload.date,
      created_by: createdBy,
    })
    .select("*")
    .single();

  if (error) throw new AppError(error.message, 500);

  const { error: stockError } = await supabaseAdmin
    .from("inventory_items")
    .update({
      current_stock: Number(currentItem.current_stock || 0) - Number(payload.qty),
    })
    .eq("id", payload.item_id);
  if (stockError) throw new AppError(stockError.message, 500);

  return data;
}
