import { Router } from "express";
import { z } from "zod";
import {
  inventoryOverview,
  storeInventoryItem,
  storePurchase,
  storeSupplier,
  storeUsage,
} from "../controllers/inventory-controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { validateBody } from "../middleware/validate-body.js";

const router = Router();

router.get("/overview", asyncHandler(inventoryOverview));
router.post(
  "/items",
  validateBody(
    z.object({
      name: z.string().min(2, "Nama item wajib diisi."),
      category_id: z.string().uuid(),
      unit: z.string().min(1),
      current_stock: z.number().nonnegative(),
      min_stock: z.number().nonnegative(),
      photo_url: z.string().optional().nullable(),
    }),
  ),
  asyncHandler(storeInventoryItem),
);
router.post(
  "/suppliers",
  validateBody(
    z.object({
      name: z.string().min(2, "Nama supplier wajib diisi."),
      contact_phone: z.string().optional().nullable(),
      email: z.string().email("Email supplier tidak valid.").or(z.literal("")).optional().nullable(),
      address: z.string().optional().nullable(),
    }),
  ),
  asyncHandler(storeSupplier),
);
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
  asyncHandler(storePurchase),
);
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
  asyncHandler(storeUsage),
);

export { router as inventoryRoutes };

