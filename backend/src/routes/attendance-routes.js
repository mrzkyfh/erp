import { Hono } from "hono";
import { z } from "zod";
import {
  activeSessions,
  attendanceLogs,
  checkIn,
  checkOut,
  createSession,
  permission,
} from "../controllers/attendance-controller.js";
import { validateBody } from "../middleware/validate-body.js";

const router = new Hono();

const attendanceActionSchema = z.object({}).passthrough();

router.get("/sessions/active", activeSessions);
router.post("/sessions", createSession);
router.get("/logs", attendanceLogs);
router.post("/check-in", checkIn);
router.post("/check-out", checkOut);
router.post(
  "/permission",
  validateBody(
    z.object({
      status: z.enum(["izin"]),
      reason: z.string().min(3, "Alasan izin wajib diisi."),
    }),
  ),
  permission,
);

export { router as attendanceRoutes };


