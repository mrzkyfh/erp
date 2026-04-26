import { createFine, createFineType, listFines, listFineTypes } from "../services/fine-service.js";

export async function fineTypes(c) {
  const data = await listFineTypes();
  return c.json({ data });
}

export async function storeFineType(c) {
  const data = await createFineType(c.get("validatedBody"));
  return c.json({ data }, 201);
}

export async function fines(c) {
  const profile = c.get("profile");
  const data = await listFines(profile);
  return c.json({ data });
}

export async function storeFine(c) {
  const profile = c.get("profile");
  const data = await createFine(c.get("validatedBody"), profile.id);
  return c.json({ data }, 201);
}


