import { supabaseAdmin } from "../services/supabase.js";
import { AppError } from "../utils/app-error.js";

export async function authenticate(request, _response, next) {
  const authHeader = request.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return next(new AppError("Token autentikasi tidak ditemukan.", 401));
  }

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return next(new AppError("Sesi login tidak valid.", 401));
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return next(new AppError("Profil pengguna tidak ditemukan.", 404));
  }

  request.user = user;
  request.profile = profile;
  return next();
}

export function requireRoles(...allowedRoles) {
  return (request, _response, next) => {
    if (!allowedRoles.includes(request.profile?.role)) {
      return next(new AppError("Anda tidak memiliki akses ke fitur ini.", 403));
    }

    return next();
  };
}

