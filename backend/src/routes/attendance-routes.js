import { Router } from "express";
import { z } from "zod";
import {
  activeSessions,
  attendanceLogs,
  checkIn,
  checkOut,
  createSession,
  permission,
} from "../controllers/attendance-controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { validateBody } from "../middleware/validate-body.js";

const router = Router();

const coordinatesSchema = z.object({
  qr_token: z.string().uuid().optional().or(z.literal("")),
  latitude: z.number(),
  longitude: z.number(),
});

router.get("/sessions/active", asyncHandler(activeSessions));
router.post("/sessions", asyncHandler(createSession));
router.get("/logs", asyncHandler(attendanceLogs));
router.post("/check-in", validateBody(coordinatesSchema), asyncHandler(checkIn));
router.post("/check-out", validateBody(coordinatesSchema.omit({ qr_token: true })), asyncHandler(checkOut));
router.post(
  "/permission",
  validateBody(
    z.object({
      status: z.enum(["izin"]),
      reason: z.string().min(3, "Alasan izin wajib diisi."),
    }),
  ),
  asyncHandler(permission),
);

export { router as attendanceRoutes };

