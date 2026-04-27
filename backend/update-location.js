import { supabaseAdmin } from "./src/services/supabase.js";
import dotenv from "dotenv";
dotenv.config();

async function updateLocation() {
  const latitude = -6.216600;
  const longitude = 107.037414;
  const radius = 1000;

  console.log("Checking environment...");
  if (!process.env.SUPABASE_URL) {
    console.error("SUPABASE_URL is missing!");
    process.exit(1);
  }

  console.log(`Updating business location to: ${latitude}, ${longitude}...`);

  try {
    const { data: existing, error: fetchError } = await supabaseAdmin.from("business_settings").select("id").limit(1).maybeSingle();
    
    if (fetchError) {
      console.error("Fetch error:", fetchError.message);
      process.exit(1);
    }

    let result;
    if (existing) {
      console.log("Found existing settings, updating...");
      result = await supabaseAdmin.from("business_settings").update({
        latitude,
        longitude,
        attendance_radius_meters: radius
      }).eq("id", existing.id);
    } else {
      console.log("No existing settings, inserting...");
      result = await supabaseAdmin.from("business_settings").insert({
        latitude,
        longitude,
        attendance_radius_meters: radius,
        business_name: "Bisnis Anda"
      });
    }

    if (result.error) {
      console.error("Error updating location:", result.error.message);
      process.exit(1);
    } else {
      console.log("Successfully updated business location!");
      process.exit(0);
    }
  } catch (err) {
    console.error("Unexpected error:", err.message);
    process.exit(1);
  }
}

updateLocation();

// Safety exit after 10s
setTimeout(() => {
  console.log("Timed out.");
  process.exit(1);
}, 10000);
