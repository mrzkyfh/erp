import { supabaseAdmin } from "../services/supabase.js";

export async function getMe(c) {
  return c.json({
    data: {
      user: c.get("user"),
      profile: c.get("profile"),
    },
  });
}

export async function updateMyProfile(c) {
  const profile = c.get("profile");
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update(c.get("validatedBody"))
    .eq("id", profile.id)
    .select("*")
    .single();

  if (error) {
    return c.json({ message: error.message }, 500);
  }
  return c.json({ data });
}


