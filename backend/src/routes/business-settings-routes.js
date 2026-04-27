import { Hono } from "hono";
import { z } from "zod";
import { supabaseAdmin } from "../services/supabase.js";
import { AppError } from "../utils/app-error.js";
import { requireRoles } from "../middleware/auth-middleware.js";
import { validateBody } from "../middleware/validate-body.js";

const router = new Hono();

const schema = z.object({
  business_name: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  attendance_radius_meters: z.number().int().positive(),
  work_start_time: z.string().optional(),
  tolerance_minutes: z.number().int().nonnegative().optional(),
});

router.get("/", async (c) => {
  let { data, error } = await supabaseAdmin.from("business_settings").select("*").limit(1).single();
  
  // If no data exists, create default
  if (error && error.code === 'PGRST116') {
    const defaultSettings = {
      business_name: 'Bisnis Anda',
      latitude: 0,
      longitude: 0,
      attendance_radius_meters: 100,
      work_start_time: '08:00:00',
      tolerance_minutes: 15,
      timezone: 'Asia/Jakarta'
    };
    
    const { data: newData, error: insertError } = await supabaseAdmin
      .from("business_settings")
      .insert(defaultSettings)
      .select("*")
      .single();
    
    if (insertError) throw new AppError(insertError.message, 500);
    data = newData;
  } else if (error) {
    throw new AppError(error.message, 500);
  }
  
  return c.json({ data });
});

router.put("/", requireRoles("owner"), validateBody(schema), async (c) => {
  const payload = c.get("validatedBody");
  
  // Get existing settings ID
  const { data: existing } = await supabaseAdmin.from("business_settings").select("id").limit(1).maybeSingle();
  
  let result;
  if (existing) {
    result = await supabaseAdmin.from("business_settings").update(payload).eq("id", existing.id).select("*").single();
  } else {
    result = await supabaseAdmin.from("business_settings").insert(payload).select("*").single();
  }
  
  if (result.error) throw new AppError(result.error.message, 500);
  return c.json({ data: result.data });
});

export { router as businessSettingsRoutes };
