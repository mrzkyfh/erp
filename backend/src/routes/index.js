import { Hono } from "hono";
import { attendanceRoutes } from "./attendance-routes.js";
import { authRoutes } from "./auth-routes.js";
import { customerRoutes } from "./customer-routes.js";
import { dashboardRoutes } from "./dashboard-routes.js";
import { employeeRoutes } from "./employee-routes.js";
import { fineRoutes } from "./fine-routes.js";
import { inventoryRoutes } from "./inventory-routes.js";
import { payrollRoutes } from "./payroll-routes.js";
import { authenticate, requireRoles } from "../middleware/auth-middleware.js";

const router = new Hono();

router.use("*", authenticate);

router.route("/auth", authRoutes);
router.route("/dashboard", dashboardRoutes);
router.route("/employees", employeeRoutes); // Roles will be handled inside sub-router or middleware
router.route("/attendance", attendanceRoutes);
router.route("/fines", fineRoutes);
router.route("/payroll", payrollRoutes);
router.route("/customers", customerRoutes);
router.route("/inventory", inventoryRoutes);

export { router };

