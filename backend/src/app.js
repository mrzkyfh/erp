import { Hono } from "hono";
import { cors } from "hono/cors";
import { env, getEnv } from "./config/env.js";
import { router } from "./routes/index.js";

export function createApp() {
  const app = new Hono();

  app.use("*", async (c, next) => {
    const currentEnv = getEnv(c.env);
    const allowedOrigins = currentEnv.FRONTEND_URL.split(",").map(o => o.trim());
    
    return cors({
      origin: (origin) => {
        // Izinkan jika origin terdaftar atau berasal dari domain .pages.dev milik Anda
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".pages.dev")) {
          return origin;
        }
        return allowedOrigins[0]; // Fallback ke origin pertama
      },
      credentials: true,
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
      allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
      maxAge: 600,
    })(c, next);
  });


  app.get("/health", (c) => {
    return c.json({
      ok: true,
      message: "ERP Mini backend siap digunakan (Hono).",
      timezone: env.APP_TIMEZONE,
    });
  });

  // API Routes
  app.route("/api", router);

  app.notFound((c) => c.json({ message: "Endpoint tidak ditemukan" }, 404));
  app.onError((err, c) => {
    console.error(err);
    return c.json({ message: err.message || "Internal Server Error" }, 500);
  });

  return app;
}


