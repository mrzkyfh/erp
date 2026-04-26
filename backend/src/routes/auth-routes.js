import { Router } from "express";
import { z } from "zod";
import { getMe, updateMyProfile } from "../controllers/auth-controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { validateBody } from "../middleware/validate-body.js";

const router = Router();

const profileSchema = z.object({
  full_name: z.string().min(2, "Nama lengkap wajib diisi."),
  nik: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  photo_url: z.string().url("URL foto tidak valid.").or(z.literal("")).optional().nullable(),
});

router.get("/me", asyncHandler(getMe));
router.put("/profile", validateBody(profileSchema), asyncHandler(updateMyProfile));

export { router as authRoutes };

