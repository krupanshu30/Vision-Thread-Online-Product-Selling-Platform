const mysql = require("mysql2/promise");
require("dotenv").config({ path: __dirname + "/../.env" });

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "Root@123",
    database: process.env.DB_NAME || "vision_thread_db",
  });
  await conn.query(`
    ALTER TABLE orders 
    MODIFY COLUMN status ENUM('pending','confirmed','processing','completed','shipped','delivered','cancelled','refunded') 
    DEFAULT 'pending'
  `);
  console.log("Status ENUM updated with 'completed' successfully!");
  await conn.end();
}

run().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
