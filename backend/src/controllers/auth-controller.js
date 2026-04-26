import { AppError } from "../utils/app-error.js";
import { supabaseAdmin } from "../services/supabase.js";

export async function getMe(request, response) {
  response.json({
    data: {
      user: request.user,
      profile: request.profile,
    },
  });
}

export async function updateMyProfile(request, response) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update(request.validatedBody)
    .eq("id", request.profile.id)
    .select("*")
    .single();

  if (error) throw new AppError(error.message, 500);
  response.json({ data });
}

