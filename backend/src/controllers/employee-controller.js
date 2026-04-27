import {
  createEmployee,
  deleteEmployee,
  listEmployees,
  updateEmployee,
  updateEmployeeStatus,
  getEmployeeSalaryConfig,
  updateEmployeeSalaryConfig,
} from "../services/employee-service.js";

export async function getEmployees(c) {
  const data = await listEmployees();
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

export async function removeEmployee(c) {
  const id = c.req.param("id");
  await deleteEmployee(id);
  return c.json({ message: "Karyawan berhasil dihapus." });
}

export async function patchEmployeeStatus(c) {
  const id = c.req.param("id");
  await updateEmployeeStatus(id, c.get("validatedBody").status);
  return c.json({ message: "Status karyawan berhasil diperbarui." });
}

export async function getSalaryConfig(c) {
  const id = c.req.param("id");
  const data = await getEmployeeSalaryConfig(id);
  return c.json({ data });
}

export async function saveSalaryConfig(c) {
  const id = c.req.param("id");
  const body = await c.req.json();
  await updateEmployeeSalaryConfig(id, body.components);
  return c.json({ message: "Konfigurasi gaji berhasil disimpan." });
}
