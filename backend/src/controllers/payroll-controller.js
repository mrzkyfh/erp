import { getPayrollOverview, markPayrollPaid, processPayroll } from "../services/payroll-service.js";

export async function payrollPeriods(request, response) {
  const data = await getPayrollOverview(
    request.profile,
    request.query.month ? Number(request.query.month) : undefined,
    request.query.year ? Number(request.query.year) : undefined,
  );
  response.json({ data });
}

export async function runPayroll(request, response) {
  const data = await processPayroll(
    request.validatedBody.month,
    request.validatedBody.year,
    request.profile.id,
  );
  response.json({ data });
}

export async function payPayroll(request, response) {
  const data = await markPayrollPaid(request.params.id, request.profile.id);
  response.json({ data });
}

