import { Hono } from "hono";
import { z } from "zod";
import {
  editEmployee,
  getEmployees,
  getJobdesks,
  patchEmployeeStatus,
  storeEmployee,
} from "../controllers/employee-controller.js";
import { validateBody } from "../middleware/validate-body.js";

const router = new Hono();

const employeeSchema = z.object({
  email: z.string().email("Email tidak valid."),
  password: z.string().min(6, "Password minimal 6 karakter.").optional().or(z.literal("")),
  full_name: z.string().min(2, "Nama lengkap wajib diisi."),
  nik: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  role: z.enum(["owner", "manager", "karyawan"]),
  join_date: z.string().min(1, "Tanggal masuk wajib diisi."),
  salary_type: z.enum(["harian", "bulanan"]),
  base_salary: z.number().nonnegative(),
  allowance: z.number().nonnegative(),
  default_deduction: z.number().nonnegative().optional(),
  status: z.enum(["aktif", "nonaktif"]),
  jobdesk_ids: z.array(z.string().uuid()).optional(),
});

router.get("/", getEmployees);
router.get("/jobdesks", getJobdesks);
router.post("/", validateBody(employeeSchema), storeEmployee);
router.put("/:id", validateBody(employeeSchema), editEmployee);
router.patch(
  "/:id/status",
  validateBody(z.object({ status: z.enum(["aktif", "nonaktif"]) })),
  patchEmployeeStatus,
);

export { router as employeeRoutes };


