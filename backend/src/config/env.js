import dotenv from "dotenv";

dotenv.config();

const required = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Environment variable ${key} belum diatur.`);
  }
}

export const env = {
  PORT: Number(process.env.PORT || 4000),
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  APP_TIMEZONE: process.env.APP_TIMEZONE || "Asia/Jakarta",
};

