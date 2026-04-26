import dotenv from "dotenv";

dotenv.config();

export const getEnv = (cEnv = {}) => {
  const envSource = { ...process.env, ...cEnv };
  
  return {
    PORT: Number(envSource.PORT || 4000),
    FRONTEND_URL: envSource.FRONTEND_URL || "http://localhost:5173",
    SUPABASE_URL: envSource.SUPABASE_URL,
    SUPABASE_ANON_KEY: envSource.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: envSource.SUPABASE_SERVICE_ROLE_KEY,
    APP_TIMEZONE: envSource.APP_TIMEZONE || "Asia/Jakarta",
  };
};

export const env = getEnv();


