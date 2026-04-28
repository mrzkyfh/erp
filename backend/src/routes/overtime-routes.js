import { Hono } from "hono";
import { authenticate } from "../middleware/auth-middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  approveOvertimeRequest,
  createOvertime,
  deleteOvertimeLog,
  endOvertimeSession,
  overtimeLogs,
  startOvertimeSession,
} from "../controllers/overtime-controller.js";

const router = new Hono();

router.use("*", authenticate);

// Get overtime logs (with filters)
router.get("/", asyncHandler(overtimeLogs));

// Start overtime session (karyawan)
router.post("/start", asyncHandler(startOvertimeSession));

// End overtime session (karyawan)
router.post("/end", asyncHandler(endOvertimeSession));

// Create manual overtime entry (owner/manager)
router.post("/manual", asyncHandler(createOvertime));

// Approve/reject overtime (owner/manager)
router.patch("/:id/approve", asyncHandler(approveOvertimeRequest));

// Delete overtime log (owner only)
router.delete("/:id", asyncHandler(deleteOvertimeLog));

export default router;
