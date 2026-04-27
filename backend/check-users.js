import { supabaseAdmin } from "./src/services/supabase.js";
import dotenv from "dotenv";
dotenv.config();

async function checkUsers() {
  const { data, error } = await supabaseAdmin.from("profiles").select("email, role");
  if (error) {
    console.error("Error:", error.message);
  } else {
    console.log("Users:", data);
  }
  process.exit(0);
}

checkUsers();
