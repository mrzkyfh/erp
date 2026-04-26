import { Hono } from "hono";
import { dashboardSummary } from "../controllers/dashboard-controller.js";

const router = new Hono();

router.get("/summary", dashboardSummary);

export { router as dashboardRoutes };


