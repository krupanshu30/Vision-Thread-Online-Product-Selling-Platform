// scripts/setup-database.js - Run with: node scripts/setup-database.js
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

async function setupDatabase() {
  if (!process.env.DB_PASSWORD || process.env.DB_PASSWORD === "your_mysql_password_here") {
    console.error("\n[SETUP] ❌ Notice: MySQL password has not been set yet!");
    console.error("[SETUP] 👉 Please open 'backend/.env' in VS Code.");
    console.error("[SETUP] 👉 Change line 9 from:");
    console.error("          DB_PASSWORD=your_mysql_password_here");
    console.error("        to:");
    console.error("          DB_PASSWORD=your_actual_mysql_password\n");
    process.exit(1);
  }

  console.log("\n[SETUP] Connecting to MySQL...");
  let conn;
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD,
      multipleStatements: true,
    });

    console.log("[SETUP] Connected. Creating database and tables...");

    const sqlFile = path.join(__dirname, "setup-database.sql");
    let sql = fs.readFileSync(sqlFile, "utf8").replace(/^\uFEFF/, "").trim();

    // Execute all SQL statements
    await conn.query(sql);
    console.log("[SETUP] ✅ Database and all tables created successfully!");
    console.log("[SETUP] Next step: Run `npm run seed-admin` to create your admin account.");
  } catch (err) {
    console.error("[SETUP] ❌ Error:", err.message);
    if (err.code === "ER_ACCESS_DENIED_ERROR") {
      console.error("       Check DB_USER and DB_PASSWORD in your .env file.");
    } else if (err.code === "ECONNREFUSED") {
      console.error("       MySQL is not running. Start MySQL service first.");
    }
    process.exit(1);
  } finally {
    if (conn) conn.end();
  }
}

setupDatabase();
