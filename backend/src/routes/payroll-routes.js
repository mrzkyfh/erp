import { Hono } from "hono";
import { z } from "zod";
import { payPayroll, payrollPeriods, runPayroll } from "../controllers/payroll-controller.js";
import { validateBody } from "../middleware/validate-body.js";
import { requireRoles } from "../middleware/auth-middleware.js";

const router = new Hono();

router.get("/periods", payrollPeriods);
router.post(
  "/process",
  requireRoles("owner"),
  validateBody(
    z.object({
      month: z.number().min(1).max(12),
      year: z.number().min(2024).max(2100),
    }),
  ),
  runPayroll,
);
router.post("/details/:id/pay", requireRoles("owner"), payPayroll);

export { router as payrollRoutes };


