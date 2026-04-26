import {
  createInventoryItem,
  createPurchase,
  createStockUsage,
  createSupplier,
  getInventoryOverview,
} from "../services/inventory-service.js";
import { getEmployeeByProfileId } from "../services/employee-service.js";

export async function inventoryOverview(_request, response) {
  const data = await getInventoryOverview();
  response.json({ data });
}

export async function storeInventoryItem(request, response) {
  const data = await createInventoryItem(request.validatedBody);
  response.status(201).json({ data });
}

export async function storeSupplier(request, response) {
  const data = await createSupplier(request.validatedBody);
  response.status(201).json({ data });
}

export async function storePurchase(request, response) {
  const data = await createPurchase(request.validatedBody, request.profile.id);
  response.status(201).json({ data });
}

export async function storeUsage(request, response) {
  const employee = await getEmployeeByProfileId(request.profile.id).catch(() => null);
  const data = await createStockUsage(request.validatedBody, request.profile.id, employee?.id || null);
  response.status(201).json({ data });
}

