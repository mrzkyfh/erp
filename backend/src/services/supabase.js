import { createClient } from "@supabase/supabase-js";
import { getEnv } from "../config/env.js";

export const getSupabaseAdmin = (cEnv = {}) => {
  const envSource = getEnv(cEnv);
  if (!envSource.SUPABASE_URL || !envSource.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  return createClient(envSource.SUPABASE_URL, envSource.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
};

export const getSupabaseAnon = (cEnv = {}) => {
  const envSource = getEnv(cEnv);
  if (!envSource.SUPABASE_URL || !envSource.SUPABASE_ANON_KEY) {
    return null;
  }
  return createClient(envSource.SUPABASE_URL, envSource.SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
};

// Global clients for local dev (will be null during Workers deploy/validation)
export const supabaseAdmin = getSupabaseAdmin();
export const supabaseAnon = getSupabaseAnon();



