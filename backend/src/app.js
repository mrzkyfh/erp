import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { router } from "./routes/index.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: (origin, callback) => {
        const allowedOrigins = env.FRONTEND_URL.split(",");
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "10mb" }));

  app.get("/health", (_request, response) => {
    response.json({
      ok: true,
      message: "ERP Mini backend siap digunakan.",
      timezone: env.APP_TIMEZONE,
    });
  });

  app.use("/api", router);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

