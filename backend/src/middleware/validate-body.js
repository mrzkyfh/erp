import { AppError } from "../utils/app-error.js";

export function validateBody(schema) {
  return (request, _response, next) => {
    const result = schema.safeParse(request.body);
    if (!result.success) {
      return next(new AppError(result.error.issues[0]?.message || "Payload tidak valid.", 422));
    }

    request.validatedBody = result.data;
    return next();
  };
}

