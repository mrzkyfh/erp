import { serve } from "@hono/node-server";
import { env } from "./config/env.js";
import { createApp } from "./app.js";

const app = createApp();

// Untuk Cloudflare Workers
export default app;

// Untuk Local Node.js
if (process.env.NODE_ENV !== "production") {
  serve({
    fetch: app.fetch,
    port: env.PORT,
  }, (info) => {
    console.log(`Rumah Kue Nuraisah Backend berjalan di http://localhost:${info.port}`);
  });
}


