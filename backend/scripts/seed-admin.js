// scripts/seed-admin.js - Create the admin account securely
// Run ONCE: node scripts/seed-admin.js
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

async function seedAdmin() {
  console.log("\n[SEED] Creating admin account...");

  const email = process.env.ADMIN_EMAIL || "admin@visionthread.in";
  const password = process.env.ADMIN_PASSWORD || "Admin@123";
  const username = "visionthread_admin";
  const fullName = "Vision Thread Store Owner";

  if (!password || password.length < 8) {
    console.error("[SEED] ❌ ADMIN_PASSWORD must be at least 8 characters in .env");
    process.exit(1);
  }

  if (!process.env.DB_PASSWORD || process.env.DB_PASSWORD === "your_mysql_password_here") {
    console.error("\n[SEED] ❌ Set your MySQL DB_PASSWORD in backend/.env first.");
    process.exit(1);
  }

  let conn;
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || "vision_thread_db",
    });

    // Check if admin already exists
    const [existing] = await conn.execute(
      "SELECT id FROM admin_users WHERE email = ?", [email]
    );

    if (existing.length > 0) {
      console.log("[SEED] ⚠️  Admin account already exists:", email);
      console.log("[SEED] If you want to reset the password, delete the row and re-run.");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await conn.execute(
      "INSERT INTO admin_users (email, username, password, full_name, role) VALUES (?, ?, ?, ?, ?)",
      [email, username, hashedPassword, fullName, "superadmin"]
    );

    console.log("[SEED] ✅ Admin account created successfully!");
    console.log("[SEED]    Email:    " + email);
    console.log("[SEED]    Password: " + password + " (change this after first login!)");
    console.log("\n[SEED] 🚀 Start the server: npm run dev");
    console.log("[SEED] 🔐 Admin Panel:   http://localhost:5000/admin");
  } catch (err) {
    console.error("[SEED] ❌ Error:", err.message);
    process.exit(1);
  } finally {
    if (conn) conn.end();
  }
}

seedAdmin();
