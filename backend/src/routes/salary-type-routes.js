import { Hono } from "hono";
import * as salaryTypeController from "../controllers/salary-type-controller.js";
import { requireRoles } from "../middleware/auth-middleware.js";

const salaryTypeRoutes = new Hono();

// Hanya owner dan manager yang bisa mengelola jenis gaji
salaryTypeRoutes.use("*", requireRoles("owner"));

salaryTypeRoutes.get("/", salaryTypeController.listSalaryTypes);
salaryTypeRoutes.post("/", salaryTypeController.storeSalaryType);
salaryTypeRoutes.put("/:id", salaryTypeController.updateSalaryType);
salaryTypeRoutes.delete("/:id", salaryTypeController.removeSalaryType);

export { salaryTypeRoutes };
