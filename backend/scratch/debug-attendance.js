import { supabaseAdmin } from "./src/services/supabase.js";
import dotenv from "dotenv";
dotenv.config();

async function checkData() {
  const { data: profiles } = await supabaseAdmin.from("profiles").select("id, email, role");
  const { data: employees } = await supabaseAdmin.from("employees").select("id, profile_id");
  const { data: sessions } = await supabaseAdmin.from("attendance_sessions").select("*").limit(5);

  console.log("PROFILES:", profiles);
  console.log("EMPLOYEES:", employees);
  console.log("SESSIONS:", sessions);
  process.exit(0);
}

checkData();
