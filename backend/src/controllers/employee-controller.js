import {
  createEmployee,
  listEmployees,
  listJobdesks,
  updateEmployee,
  updateEmployeeStatus,
} from "../services/employee-service.js";

export async function getEmployees(c) {
  const data = await listEmployees();
  return c.json({ data });
}

export async function getJobdesks(c) {
  const data = await listJobdesks();
  return c.json({ data });
}

export async function storeEmployee(c) {
  const data = await createEmployee(c.get("validatedBody"));
  return c.json({ data }, 201);
}

export async function editEmployee(c) {
  const id = c.req.param("id");
  await updateEmployee(id, c.get("validatedBody"));
  return c.json({ message: "Data karyawan berhasil diperbarui." });
}

export async function patchEmployeeStatus(c) {
  const id = c.req.param("id");
  await updateEmployeeStatus(id, c.get("validatedBody").status);
  return c.json({ message: "Status karyawan berhasil diperbarui." });
}


