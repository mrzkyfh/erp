import {
  checkInAttendance,
  checkOutAttendance,
  generateAttendanceSession,
  getActiveSessions,
  listAttendanceLogs,
  submitPermission,
} from "../services/attendance-service.js";

export async function activeSessions(_request, response) {
  const data = await getActiveSessions();
  response.json({ data });
}

export async function createSession(request, response) {
  const data = await generateAttendanceSession(request.profile.id);
  response.status(201).json({ data });
}

export async function attendanceLogs(request, response) {
  const data = await listAttendanceLogs(request.profile);
  response.json({ data });
}

export async function checkIn(request, response) {
  const data = await checkInAttendance(request.profile, request.validatedBody);
  response.status(201).json({ data });
}

export async function checkOut(request, response) {
  const data = await checkOutAttendance(request.profile, request.validatedBody);
  response.json({ data });
}

export async function permission(request, response) {
  const data = await submitPermission(request.profile, request.validatedBody);
  response.status(201).json({ data });
}

