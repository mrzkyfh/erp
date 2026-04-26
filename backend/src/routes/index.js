import { Router } from "express";
import { attendanceRoutes } from "./attendance-routes.js";
import { authRoutes } from "./auth-routes.js";
import { customerRoutes } from "./customer-routes.js";
import { dashboardRoutes } from "./dashboard-routes.js";
import { employeeRoutes } from "./employee-routes.js";
import { fineRoutes } from "./fine-routes.js";
import { inventoryRoutes } from "./inventory-routes.js";
import { payrollRoutes } from "./payroll-routes.js";
import { authenticate, requireRoles } from "../middleware/auth-middleware.js";

const router = Router();

router.use(authenticate);
router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/employees", requireRoles("owner", "manager"), employeeRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/fines", requireRoles("owner", "manager"), fineRoutes);
router.use("/payroll", payrollRoutes);
router.use("/customers", requireRoles("owner", "manager"), customerRoutes);
router.use("/inventory", requireRoles("owner", "manager"), inventoryRoutes);

export { router };
