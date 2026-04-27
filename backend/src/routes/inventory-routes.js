import { Hono } from "hono";
import { z } from "zod";
import {
  inventoryOverview,
  removeInventoryItem,
  removeSupplier,
  removeUsage,
  storeInventoryItem,
  storePurchase,
  storeSupplier,
  storeUsage,
  storeMaterialExpense,
  getLatestPrice,
} from "../controllers/inventory-controller.js";

import { validateBody } from "../middleware/validate-body.js";
import { requireRoles } from "../middleware/auth-middleware.js";

const router = new Hono();

// Karyawan bisa lihat overview
router.get("/overview", inventoryOverview);
router.get("/latest-price/:itemId", getLatestPrice);


// Hanya owner bisa create/delete item dan supplier
router.post(
  "/items",
  requireRoles("owner"),
  validateBody(
    z.object({
      name: z.string().min(2, "Nama item wajib diisi."),
      category_id: z.string().uuid().nullable().optional(),
      unit: z.string().min(1),
      current_stock: z.number().nonnegative(),
      min_stock: z.number().nonnegative(),
      photo_url: z.string().optional().nullable(),
    }),
  ),
  storeInventoryItem,
);
router.delete("/items/:id", requireRoles("owner"), removeInventoryItem);

router.post(
  "/suppliers",
  requireRoles("owner"),
  validateBody(
    z.object({
      name: z.string().min(2, "Nama supplier wajib diisi."),
      contact_phone: z.string().optional().nullable(),
      address: z.string().optional().nullable(),
    }),
  ),
  storeSupplier,
);
router.delete("/suppliers/:id", requireRoles("owner"), removeSupplier);
router.post(
  "/purchases",
  validateBody(
    z.object({
      supplier_id: z.string().uuid(),
      item_id: z.string().uuid(),
      qty: z.number().positive(),
      unit_price: z.number().nonnegative(),
      date: z.string().min(1, "Tanggal pembelian wajib diisi."),
    }),
  ),
  storePurchase,
);

// Semua role (owner, manager, karyawan) bisa record usage
router.post(
  "/usages",
  validateBody(
    z.object({
      item_id: z.string().uuid(),
      qty: z.number().positive(),
      reason: z.string().min(2, "Alasan penggunaan wajib diisi."),
      date: z.string().min(1, "Tanggal penggunaan wajib diisi."),
    }),
  ),
  storeUsage,
);
router.delete("/usages/:id", requireRoles("owner"), removeUsage);

// Semua role bisa record material expenses
router.post(
  "/material-expenses",
  validateBody(
    z.object({
      item_id: z.string().uuid(),
      qty: z.number().positive(),
      unit_price: z.number().nonnegative(),
      total_expense: z.number().nonnegative(),
      reason: z.string().optional().nullable(),
      date: z.string().min(1, "Tanggal wajib diisi."),
    }),
  ),
  storeMaterialExpense,
);

export { router as inventoryRoutes };


