import { Hono } from "hono";
import { z } from "zod";
import {
  editEmployee,
  getEmployees,
  patchEmployeeStatus,
  removeEmployee,
  storeEmployee,
  getSalaryConfig,
  saveSalaryConfig,
} from "../controllers/employee-controller.js";
import { validateBody } from "../middleware/validate-body.js";

const router = new Hono();

const employeeSchema = z.object({
  email: z.string().email("Email tidak valid."),
  password: z.string().min(6, "Password minimal 6 karakter.").optional().or(z.literal("")),
  full_name: z.string().min(2, "Nama lengkap wajib diisi."),
  phone: z.string().optional().nullable(),

  address: z.string().optional().nullable(),
  role: z.enum(["owner", "karyawan"]),
  join_date: z.string().min(1, "Tanggal masuk wajib diisi."),
  salary_type: z.enum(["harian", "bulanan"]).optional(),
  base_salary: z.number().nonnegative().optional(),
  allowance: z.number().nonnegative().optional(),
  status: z.enum(["aktif", "nonaktif"]),
});

router.get("/", getEmployees);
router.post("/", validateBody(employeeSchema), storeEmployee);
router.put("/:id", validateBody(employeeSchema), editEmployee);
router.delete("/:id", removeEmployee);
router.patch(
  "/:id/status",
  validateBody(z.object({ status: z.enum(["aktif", "nonaktif"]) })),
  patchEmployeeStatus,
);

router.get("/:id/salary-config", getSalaryConfig);
router.post("/:id/salary-config", saveSalaryConfig);

export { router as employeeRoutes };
