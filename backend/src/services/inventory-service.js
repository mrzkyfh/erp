import fs from "fs";
import path from "path";
import { AppError } from "../utils/app-error.js";
import { supabaseAdmin } from "./supabase.js";

function logDebug(message, data = null) {
  const logMessage = `[${new Date().toISOString()}] ${message} ${data ? JSON.stringify(data) : ""}\n`;
  fs.appendFileSync(path.resolve(process.cwd(), "backend-debug.log"), logMessage);
}


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

  if (purchaseError) {
    logDebug("Error creating purchase", purchaseError);
    throw new AppError(purchaseError.message, 500);
  }
  logDebug("Purchase created successfully", purchase);


  const { error: itemError } = await supabaseAdmin.from("stock_purchase_items").insert({
    purchase_id: purchase.id,
    item_id: payload.item_id,
    qty: payload.qty,
    unit_price: payload.unit_price,
  });
  if (itemError) {
    logDebug("Error creating purchase items", itemError);
    throw new AppError(itemError.message, 500);
  }


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

export async function createMaterialExpense(payload, createdBy) {
  // Material expense is similar to stock usage, but we store it with a specific reason prefix
  const { data: currentItem, error: itemError } = await supabaseAdmin
    .from("inventory_items")
    .select("current_stock")
    .eq("id", payload.item_id)
    .single();

  if (itemError || !currentItem) throw new AppError("Item inventori tidak ditemukan.", 404);
  
  // We don't reduce stock for material expenses, just record the expense
  // Store in stock_usages with a special reason format
  const expenseReason = `[PENGELUARAN] ${payload.reason || 'Pengeluaran bahan'} - Rp ${payload.total_expense.toLocaleString('id-ID')}`;
  
  const { data, error } = await supabaseAdmin
    .from("stock_usages")
    .insert({
      item_id: payload.item_id,
      qty: payload.qty,
      reason: expenseReason,
      used_by: null, // No specific user for material expenses
      date: payload.date,
      created_by: createdBy,
    })
    .select("*")
    .single();

  if (error) throw new AppError(error.message, 500);

  return data;
}

export async function getLatestItemPrice(itemId) {
  logDebug(`Fetching latest price for itemId: ${itemId}`);
  const { data, error } = await supabaseAdmin
    .from("stock_purchase_items")
    .select("unit_price")
    .eq("item_id", itemId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    logDebug("Error fetching latest price", error);
    return 0;
  }
  
  const price = data?.unit_price || 0;
  logDebug(`Found price: ${price}`);
  return price;
}

export async function deleteInventoryItem(itemId) {
  // Delete related stock usages first (cascade)
  const { error: usageError } = await supabaseAdmin
    .from("stock_usages")
    .delete()
    .eq("item_id", itemId);
    
  if (usageError) throw new AppError(usageError.message, 500);
  
  // Delete related stock purchase items (cascade)
  const { error: purchaseError } = await supabaseAdmin
    .from("stock_purchase_items")
    .delete()
    .eq("item_id", itemId);
    
  if (purchaseError) throw new AppError(purchaseError.message, 500);
  
  // Now delete the item itself
  const { error } = await supabaseAdmin
    .from("inventory_items")
    .delete()
    .eq("id", itemId);
    
  if (error) throw new AppError(error.message, 500);
  return true;
}

export async function deleteSupplier(supplierId) {
  // Check if supplier has any purchases
  const { data: purchases } = await supabaseAdmin
    .from("stock_purchases")
    .select("id")
    .eq("supplier_id", supplierId)
    .limit(1);
    
  if (purchases && purchases.length > 0) {
    throw new AppError("Supplier tidak dapat dihapus karena sudah memiliki riwayat pembelian.", 422);
  }
  
  const { error } = await supabaseAdmin
    .from("suppliers")
    .delete()
    .eq("id", supplierId);
    
  if (error) throw new AppError(error.message, 500);
  return true;
}

export async function deleteStockUsage(usageId) {
  // Get usage details first
  const { data: usage, error: fetchError } = await supabaseAdmin
    .from("stock_usages")
    .select("item_id, qty")
    .eq("id", usageId)
    .single();
    
  if (fetchError || !usage) throw new AppError("Data penggunaan tidak ditemukan.", 404);
  
  // Restore stock
  const { data: currentItem } = await supabaseAdmin
    .from("inventory_items")
    .select("current_stock")
    .eq("id", usage.item_id)
    .single();
    
  if (currentItem) {
    await supabaseAdmin
      .from("inventory_items")
      .update({
        current_stock: Number(currentItem.current_stock || 0) + Number(usage.qty),
      })
      .eq("id", usage.item_id);
  }
  
  // Delete usage record
  const { error } = await supabaseAdmin
    .from("stock_usages")
    .delete()
    .eq("id", usageId);
    
  if (error) throw new AppError(error.message, 500);
  return true;
}
