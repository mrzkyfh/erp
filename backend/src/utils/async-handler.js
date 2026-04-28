// AsyncHandler for Hono framework
export function asyncHandler(handler) {
  return async (c) => {
    try {
      return await handler(c);
    } catch (error) {
      console.error("AsyncHandler caught error:", error);
      
      const statusCode = error.statusCode || 500;
      const message = error.message || "Terjadi kesalahan pada server.";
      
      return c.json({ message }, statusCode);
    }
  };
}

