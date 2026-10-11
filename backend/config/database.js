// config/database.js - MySQL Connection Pool (Secure)
const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "vision_thread_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4",
  timezone: "+05:30",
  ssl: (process.env.DB_SSL === "true" || process.env.NODE_ENV === "production") ? { rejectUnauthorized: false } : false,
});

// Test connection on startup with clear diagnostics (local/standalone only)
if (!process.env.VERCEL) {
  pool.getConnection()
    .then((conn) => {
      console.log("[DB] ✅ MySQL connected successfully to database:", process.env.DB_NAME || "vision_thread_db");
      conn.release();
    })
    .catch((err) => {
      console.warn("\n[DB] ⚠️  MySQL initial connection notice:", err.message);
      if (err.code === "ER_ACCESS_DENIED_ERROR") {
        console.warn("[DB] 👉 Please verify your DB_USER and DB_PASSWORD inside backend/.env");
      } else if (err.code === "ER_BAD_DB_ERROR") {
        console.warn("[DB] 👉 Database '" + (process.env.DB_NAME || "vision_thread_db") + "' not found yet. Run: npm run setup-db");
      } else if (err.code === "ECONNREFUSED") {
        console.warn("[DB] 👉 MySQL service is not responding on port " + (process.env.DB_PORT || 3306) + ". Ensure MySQL is running.");
      }
      console.warn("[DB] The backend server will continue running. Update backend/.env and restart when ready.\n");
    });
}

module.exports = pool;
