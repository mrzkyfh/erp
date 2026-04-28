import {
  approveOvertime,
  createManualOvertime,
  deleteOvertime,
  endOvertime,
  listOvertimeLogs,
  startOvertime,
} from "../services/overtime-service.js";

export async function overtimeLogs(c) {
  const profile = c.get("profile");
  const { status, startDate, endDate } = c.req.query();
  
  const filters = {};
  if (status) filters.status = status;
  if (startDate) filters.startDate = startDate;
  if (endDate) filters.endDate = endDate;

  const data = await listOvertimeLogs(profile, filters);
  return c.json({ data });
}

export async function startOvertimeSession(c) {
  const profile = c.get("profile");
  const body = await c.req.json().catch(() => ({}));
  const data = await startOvertime(profile, body);
  return c.json({ data }, 201);
}

export async function endOvertimeSession(c) {
  const profile = c.get("profile");
  const body = await c.req.json().catch(() => ({}));
  const data = await endOvertime(profile, body);
  return c.json({ data });
}

export async function createOvertime(c) {
  const profile = c.get("profile");
  const body = await c.req.json();
  const data = await createManualOvertime(profile, body);
  return c.json({ data }, 201);
}

export async function approveOvertimeRequest(c) {
  const profile = c.get("profile");
  const { id } = c.req.param();
  const body = await c.req.json();
  const data = await approveOvertime(profile, id, body);
  return c.json({ data });
}

export async function deleteOvertimeLog(c) {
  const profile = c.get("profile");
  const { id } = c.req.param();
  const data = await deleteOvertime(profile, id);
  return c.json({ data });
}
