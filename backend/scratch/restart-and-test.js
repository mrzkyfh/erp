import { exec } from "child_process";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Kill old server, start new one, then test
async function main() {
  // Kill existing processes on port 4001
  console.log("Killing old server...");
  exec('powershell -Command "Get-NetTCPConnection -LocalPort 4001 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"', async (err) => {
    if (err) console.log("No old server to kill (or already stopped)");
    
    console.log("Starting new server...");
    const server = exec("node src/index.js", { cwd: process.cwd() });
    server.stdout.on("data", (d) => console.log("[SERVER]", d.trim()));
    server.stderr.on("data", (d) => console.error("[SERVER ERR]", d.trim()));

    // Wait for server to start
    await new Promise(r => setTimeout(r, 3000));

    try {
      // Login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "mfariza045@gmail.com",
        password: "kiki123",
      });

      if (error) {
        console.error("Login failed:", error.message);
        server.kill();
        process.exit(1);
      }

      const token = data.session.access_token;
      console.log("Logged in successfully.");

      const apiBase = "http://localhost:4001/api";

      // Get active sessions
      const sessRes = await fetch(`${apiBase}/attendance/sessions/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sessions = await sessRes.json();
      console.log("Active sessions:", JSON.stringify(sessions, null, 2));
      const activeToken = sessions.data?.[0]?.qr_token;
      console.log("QR Token:", activeToken);

      // Check-in
      console.log("\n--- CHECK-IN ---");
      const ciRes = await fetch(`${apiBase}/attendance/check-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ qr_token: activeToken }),
      });
      const ciJson = await ciRes.json();
      console.log("Status:", ciRes.status, JSON.stringify(ciJson, null, 2));

      // Check-out
      console.log("\n--- CHECK-OUT ---");
      const coRes = await fetch(`${apiBase}/attendance/check-out`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });
      const coJson = await coRes.json();
      console.log("Status:", coRes.status, JSON.stringify(coJson, null, 2));

      // Permission
      console.log("\n--- PERMISSION ---");
      const pRes = await fetch(`${apiBase}/attendance/permission`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "izin", reason: "Sakit hari ini" }),
      });
      const pJson = await pRes.json();
      console.log("Status:", pRes.status, JSON.stringify(pJson, null, 2));

    } catch (e) {
      console.error("Test error:", e.message);
    }

    server.kill();
    process.exit(0);
  });
}

main();
