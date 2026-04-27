import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testAttendance() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: "mfariza045@gmail.com",
    password: "kiki123",
  });

  if (error) {
    console.error("Login failed:", error.message);
    return;
  }

  const token = data.session.access_token;
  console.log("Logged in. Token retrieved.");

  const apiBase = "http://localhost:4001/api";

  async function callApi(path, body = {}) {
    const res = await fetch(`${apiBase}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    const json = await res.json();
    console.log(`POST ${path}:`, res.status, JSON.stringify(json, null, 2));
  }

  // 1. Check active session
  const sessRes = await fetch(`${apiBase}/attendance/sessions/active`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const sessions = await sessRes.json();
  const activeToken = sessions.data[0]?.qr_token;
  console.log("Active Session Token:", activeToken);

  // 2. Try Check-in
  await callApi("/attendance/check-in", { qr_token: activeToken });

  // 3. Try Check-out
  await callApi("/attendance/check-out", {});

  process.exit(0);
}

testAttendance();
