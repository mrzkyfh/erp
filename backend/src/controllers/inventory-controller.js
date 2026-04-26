import {
  createInventoryItem,
  createPurchase,
  createStockUsage,
  createSupplier,
  getInventoryOverview,
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

export async function storeSupplier(c) {
  const data = await createSupplier(c.get("validatedBody"));
  return c.json({ data }, 201);
}

export async function storePurchase(c) {
  const profile = c.get("profile");
  const data = await createPurchase(c.get("validatedBody"), profile.id);
  return c.json({ data }, 201);
}

export async function storeUsage(c) {
  const profile = c.get("profile");
  const employee = await getEmployeeByProfileId(profile.id).catch(() => null);
  const data = await createStockUsage(c.get("validatedBody"), profile.id, employee?.id || null);
  return c.json({ data }, 201);
}


