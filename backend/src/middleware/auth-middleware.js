import { supabaseAdmin } from "../services/supabase.js";

export async function authenticate(c, next) {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return c.json({ message: "Token autentikasi tidak ditemukan." }, 401);
  }

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return c.json({ message: "Sesi login tidak valid." }, 401);
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return c.json({ message: "Profil pengguna tidak ditemukan." }, 404);
  }

  c.set("user", user);
  c.set("profile", profile);
  return next();
}

export function requireRoles(...allowedRoles) {
  return async (c, next) => {
    const profile = c.get("profile");
    if (!allowedRoles.includes(profile?.role)) {
      return c.json({ message: "Anda tidak memiliki akses ke fitur ini." }, 403);
    }

    return next();
  };
}


