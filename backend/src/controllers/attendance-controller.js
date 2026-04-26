import {
  checkInAttendance,
  checkOutAttendance,
  generateAttendanceSession,
  getActiveSessions,
  listAttendanceLogs,
  submitPermission,
} from "../services/attendance-service.js";

export async function activeSessions(c) {
  const data = await getActiveSessions();
  return c.json({ data });
}

export async function createSession(c) {
  const profile = c.get("profile");
  const data = await generateAttendanceSession(profile.id);
  return c.json({ data }, 201);
}

export async function attendanceLogs(c) {
  const profile = c.get("profile");
  const data = await listAttendanceLogs(profile);
  return c.json({ data });
}

export async function checkIn(c) {
  const profile = c.get("profile");
  const data = await checkInAttendance(profile, c.get("validatedBody"));
  return c.json({ data }, 201);
}

export async function checkOut(c) {
  const profile = c.get("profile");
  const data = await checkOutAttendance(profile, c.get("validatedBody"));
  return c.json({ data });
}

export async function permission(c) {
  const profile = c.get("profile");
  const data = await submitPermission(profile, c.get("validatedBody"));
  return c.json({ data }, 201);
}


