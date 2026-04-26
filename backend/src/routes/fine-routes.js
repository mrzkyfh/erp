import { Router } from "express";
import { z } from "zod";
import { fineTypes, fines, storeFine, storeFineType } from "../controllers/fine-controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { validateBody } from "../middleware/validate-body.js";

const router = Router();

router.get("/types", asyncHandler(fineTypes));
router.post(
  "/types",
  validateBody(
    z.object({
      name: z.string().min(2, "Nama jenis denda wajib diisi."),
      amount: z.number().nonnegative(),
      is_auto: z.boolean().default(false),
      trigger_type: z.string().min(2),
    }),
  ),
  asyncHandler(storeFineType),
);
router.get("/", asyncHandler(fines));
router.post(
  "/",
  validateBody(
    z.object({
      employee_id: z.string().uuid(),
      fine_type_id: z.string().uuid(),
      amount: z.number().nonnegative(),
      reason: z.string().optional().nullable(),
      date: z.string().optional().nullable(),
    }),
  ),
  asyncHandler(storeFine),
);

export { router as fineRoutes };

