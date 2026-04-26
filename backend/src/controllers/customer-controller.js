import { createCustomer, deleteCustomer, listCustomers, updateCustomer } from "../services/customer-service.js";

export async function customers(c) {
  const search = c.req.query("search") || "";
  const data = await listCustomers(search);
  return c.json({ data });
}

export async function storeCustomer(c) {
  const data = await createCustomer(c.get("validatedBody"));
  return c.json({ data }, 201);
}

export async function editCustomer(c) {
  const id = c.req.param("id");
  const data = await updateCustomer(id, c.get("validatedBody"));
  return c.json({ data });
}

export async function removeCustomer(c) {
  const id = c.req.param("id");
  await deleteCustomer(id);
  return c.json({ message: "Konsumen berhasil dihapus." });
}


