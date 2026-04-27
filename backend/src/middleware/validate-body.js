export function validateBody(schema) {
  return async (c, next) => {
    let body;
    try {
      body = await c.req.json();
    } catch (e) {
      body = {};
    }
    
    const result = schema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0];
      const message = firstError ? `${firstError.path.join(".")}: ${firstError.message}` : "Payload tidak valid.";
      return c.json({ message }, 422);
    }

    c.set("validatedBody", result.data);
    return next();
  };
}


