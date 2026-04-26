import { Router } from "express";
import { z } from "zod";
import { payPayroll, payrollPeriods, runPayroll } from "../controllers/payroll-controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { validateBody } from "../middleware/validate-body.js";
import { requireRoles } from "../middleware/auth-middleware.js";

const router = Router();

router.get("/periods", asyncHandler(payrollPeriods));
router.post(
  "/process",
  requireRoles("owner", "manager"),
  validateBody(
    z.object({
      month: z.number().min(1).max(12),
      year: z.number().min(2024).max(2100),
    }),
  ),
  asyncHandler(runPayroll),
);
router.post("/details/:id/pay", requireRoles("owner"), asyncHandler(payPayroll));

export { router as payrollRoutes };

