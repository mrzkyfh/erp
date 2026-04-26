import { Router } from "express";
import { z } from "zod";
import {
  customers,
  editCustomer,
  removeCustomer,
  storeCustomer,
} from "../controllers/customer-controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { validateBody } from "../middleware/validate-body.js";

const router = Router();

const schema = z.object({
  name: z.string().min(2, "Nama konsumen wajib diisi."),
  phone: z.string().min(8, "Nomor HP wajib diisi."),
  email: z.string().email("Email tidak valid.").or(z.literal("")).optional().nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

router.get("/", asyncHandler(customers));
router.post("/", validateBody(schema), asyncHandler(storeCustomer));
router.put("/:id", validateBody(schema), asyncHandler(editCustomer));
router.delete("/:id", asyncHandler(removeCustomer));

export { router as customerRoutes };

