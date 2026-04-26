import { getDashboardSummary } from "../services/dashboard-service.js";

export async function dashboardSummary(request, response) {
  const data = await getDashboardSummary(request.profile);
  response.json({ data });
}

