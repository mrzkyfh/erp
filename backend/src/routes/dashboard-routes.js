import { Router } from "express";
import { dashboardSummary } from "../controllers/dashboard-controller.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.get("/summary", asyncHandler(dashboardSummary));

export { router as dashboardRoutes };

