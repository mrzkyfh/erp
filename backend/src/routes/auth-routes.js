import { Hono } from "hono";
import { z } from "zod";
import { getMe, updateMyProfile } from "../controllers/auth-controller.js";
import { validateBody } from "../middleware/validate-body.js";

const router = new Hono();

const profileSchema = z.object({
  full_name: z.string().min(2, "Nama lengkap wajib diisi."),
  nik: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  photo_url: z.string().url("URL foto tidak valid.").or(z.literal("")).optional().nullable(),
});

router.get("/me", getMe);
router.put("/profile", validateBody(profileSchema), updateMyProfile);

export { router as authRoutes };


