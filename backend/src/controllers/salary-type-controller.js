import * as salaryTypeService from "../services/salary-type-service.js";

export async function listSalaryTypes(c) {
  const data = await salaryTypeService.getAllSalaryTypes();
  return c.json({ data });
}

export async function storeSalaryType(c) {
  const body = await c.req.json();
  const data = await salaryTypeService.createSalaryType(body);
  return c.json({ data }, 201);
}

export async function updateSalaryType(c) {
  const id = c.req.param("id");
  const body = await c.req.json();
  const data = await salaryTypeService.updateSalaryType(id, body);
  return c.json({ data });
}

export async function removeSalaryType(c) {
  const id = c.req.param("id");
  await salaryTypeService.deleteSalaryType(id);
  return c.json({ message: "Jenis gaji berhasil dihapus" });
}
