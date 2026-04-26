import { getDashboardSummary } from "../services/dashboard-service.js";

export async function dashboardSummary(c) {
  const profile = c.get("profile");
  const data = await getDashboardSummary(profile);
  return c.json({ data });
}


