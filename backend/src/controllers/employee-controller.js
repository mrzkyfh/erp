import {
  createEmployee,
  listEmployees,
  listJobdesks,
  updateEmployee,
  updateEmployeeStatus,
} from "../services/employee-service.js";

export async function getEmployees(_request, response) {
  const data = await listEmployees();
  response.json({ data });
}

export async function getJobdesks(_request, response) {
  const data = await listJobdesks();
  response.json({ data });
}

export async function storeEmployee(request, response) {
  const data = await createEmployee(request.validatedBody);
  response.status(201).json({ data });
}

export async function editEmployee(request, response) {
  await updateEmployee(request.params.id, request.validatedBody);
  response.json({ message: "Data karyawan berhasil diperbarui." });
}

export async function patchEmployeeStatus(request, response) {
  await updateEmployeeStatus(request.params.id, request.validatedBody.status);
  response.json({ message: "Status karyawan berhasil diperbarui." });
}

