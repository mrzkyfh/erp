import { getPayrollOverview, markPayrollPaid, processPayroll } from "../services/payroll-service.js";

export async function payrollPeriods(c) {
  const month = c.req.query("month");
  const year = c.req.query("year");
  
  const data = await getPayrollOverview(
    c.get("profile"),
    month ? Number(month) : undefined,
    year ? Number(year) : undefined,
  );
  return c.json({ data });
}

export async function runPayroll(c) {
  const validatedBody = c.get("validatedBody");
  const profile = c.get("profile");
  
  const data = await processPayroll(
    validatedBody.month,
    validatedBody.year,
    profile.id,
  );
  return c.json({ data });
}

export async function payPayroll(c) {
  const id = c.req.param("id");
  const profile = c.get("profile");
  const data = await markPayrollPaid(id, profile.id);
  return c.json({ data });
}


