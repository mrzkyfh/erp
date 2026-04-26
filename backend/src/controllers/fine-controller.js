import { createFine, createFineType, listFines, listFineTypes } from "../services/fine-service.js";

export async function fineTypes(_request, response) {
  const data = await listFineTypes();
  response.json({ data });
}

export async function storeFineType(request, response) {
  const data = await createFineType(request.validatedBody);
  response.status(201).json({ data });
}

export async function fines(request, response) {
  const data = await listFines(request.profile);
  response.json({ data });
}

export async function storeFine(request, response) {
  const data = await createFine(request.validatedBody, request.profile.id);
  response.status(201).json({ data });
}

