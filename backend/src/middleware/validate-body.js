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
      return c.json({ message: result.error.issues[0]?.message || "Payload tidak valid." }, 422);
    }

    c.set("validatedBody", result.data);
    return next();
  };
}


