import fs from "fs";
import path from "path";
import {
  createInventoryItem,
  createPurchase,
  createStockUsage,
  createSupplier,
  deleteInventoryItem,
  deleteStockUsage,
  deleteSupplier,
  getInventoryOverview,
  createMaterialExpense,
  getLatestItemPrice,
} from "../services/inventory-service.js";

import { getEmployeeByProfileId } from "../services/employee-service.js";

export async function inventoryOverview(c) {
  const data = await getInventoryOverview();
  return c.json({ data });
}

export async function storeInventoryItem(c) {
  const data = await createInventoryItem(c.get("validatedBody"));
  return c.json({ data }, 201);
}

export async function removeInventoryItem(c) {
  const itemId = c.req.param("id");
  await deleteInventoryItem(itemId);
  return c.json({ message: "Item berhasil dihapus." });
}

export async function storeSupplier(c) {
  const data = await createSupplier(c.get("validatedBody"));
  return c.json({ data }, 201);
}

export async function removeSupplier(c) {
  const supplierId = c.req.param("id");
  await deleteSupplier(supplierId);
  return c.json({ message: "Supplier berhasil dihapus." });
}

export async function storePurchase(c) {
  const payload = c.get("validatedBody");
  const profile = c.get("profile");
  
  const logMessage = `[${new Date().toISOString()}] [Controller] Store Purchase: ${JSON.stringify(payload)} by ${profile.id}\n`;
  fs.appendFileSync(path.resolve(process.cwd(), "backend-debug.log"), logMessage);

  const data = await createPurchase(payload, profile.id);
  return c.json({ data }, 201);
}


export async function storeUsage(c) {
  const profile = c.get("profile");
  const employee = await getEmployeeByProfileId(profile.id).catch(() => null);
  const data = await createStockUsage(c.get("validatedBody"), profile.id, employee?.id || null);
  return c.json({ data }, 201);
}

export async function removeUsage(c) {
  const usageId = c.req.param("id");
  await deleteStockUsage(usageId);
  return c.json({ message: "Data penggunaan berhasil dihapus." });
}

export async function storeMaterialExpense(c) {
  const profile = c.get("profile");
  const data = await createMaterialExpense(c.get("validatedBody"), profile.id);
  return c.json({ data }, 201);
}

export async function getLatestPrice(c) {
  const itemId = c.req.param("itemId");
  const price = await getLatestItemPrice(itemId);
  return c.json({ data: { price } });
}
