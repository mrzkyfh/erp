import { Hono } from "hono";
import { attendanceRoutes } from "./attendance-routes.js";
import { authRoutes } from "./auth-routes.js";
import { customerRoutes } from "./customer-routes.js";
import { dashboardRoutes } from "./dashboard-routes.js";
import { employeeRoutes } from "./employee-routes.js";
import overtimeRoutes from "./overtime-routes.js";
import { inventoryRoutes } from "./inventory-routes.js";
import { payrollRoutes } from "./payroll-routes.js";
import { salaryTypeRoutes } from "./salary-type-routes.js";
import { businessSettingsRoutes } from "./business-settings-routes.js";
import { authenticate, requireRoles } from "../middleware/auth-middleware.js";
import { supabaseAdmin } from "../services/supabase.js";


const router = new Hono();

router.get("/test-db", async (c) => {
  try {
    const start = Date.now();
    const { data, error } = await supabaseAdmin.from("profiles").select("count").limit(1);
    const end = Date.now();
    
    if (error) throw error;
    
    return c.json({
      ok: true,
      time: `${end - start}ms`,
      data
    });
  } catch (error) {
    return c.json({
      ok: false,
      message: error.message
    }, 500);
  }
});

router.use("*", authenticate);

router.route("/auth", authRoutes);
router.route("/dashboard", dashboardRoutes);
router.route("/employees", employeeRoutes); // Roles will be handled inside sub-router or middleware
router.route("/attendance", attendanceRoutes);
router.route("/overtime", overtimeRoutes);
router.route("/payroll", payrollRoutes);
router.route("/salary-types", salaryTypeRoutes);
router.route("/customers", customerRoutes);

router.route("/inventory", inventoryRoutes);
router.route("/settings", businessSettingsRoutes);

export { router };

