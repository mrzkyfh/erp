import { createCustomer, deleteCustomer, listCustomers, updateCustomer } from "../services/customer-service.js";

export async function customers(request, response) {
  const data = await listCustomers(request.query.search || "");
  response.json({ data });
}

export async function storeCustomer(request, response) {
  const data = await createCustomer(request.validatedBody);
  response.status(201).json({ data });
}

export async function editCustomer(request, response) {
  const data = await updateCustomer(request.params.id, request.validatedBody);
  response.json({ data });
}

export async function removeCustomer(request, response) {
  await deleteCustomer(request.params.id);
  response.json({ message: "Konsumen berhasil dihapus." });
}

