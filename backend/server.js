// server.js - Vision Thread Backend - Main Express Server
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// Uploads and Static Assets
// ============================================================
const uploadsDir = process.env.VERCEL ? path.join("/tmp", "uploads") : path.join(__dirname, "uploads");
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (e) {
  // Gracefully ignore on read-only environments
}
app.use("/uploads", express.static(uploadsDir));
app.use("/images", express.static(path.join(__dirname, "../images")));
app.use("/admin/images", express.static(path.join(__dirname, "../images")));

// ============================================================
// Security Middleware
// ============================================================
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for serving admin panel HTML
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// CORS - allow local frontend origins and tools
app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Parse JSON & cookies
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cookieParser());

// Global rate limiter (100 requests per 15 minutes per IP)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please slow down." },
});
app.use("/api", globalLimiter);

// ============================================================
// API Routes
// ============================================================
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");

app.use("/api/admin", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api", orderRoutes);

// ============================================================
// ============================================================
// Serve Admin Panel & Storefront locally (on Vercel, Edge CDN handles this)
// ============================================================
if (!process.env.VERCEL) {
  app.use("/admin", express.static(path.join(__dirname, "admin-panel")));
  app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "admin-panel", "index.html"));
  });
  app.get("/admin/*", (req, res) => {
    res.sendFile(path.join(__dirname, "admin-panel", "index.html"));
  });

  app.use(express.static(path.join(__dirname, "..")));
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "index.html"));
  });
}

// ============================================================
// Health check
// ============================================================
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Vision Thread API is running!", timestamp: new Date().toISOString() });
});

// ============================================================
// 404 handler
// ============================================================
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Endpoint not found." });
});

// ============================================================
// Global error handler
// ============================================================
app.use((err, req, res, next) => {
  console.error("[ERROR]", err.stack || err.message);
  res.status(500).json({ success: false, message: "Internal server error." });
});

// ============================================================
// Start Server (only when run directly: node backend/server.js)
// ============================================================
if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log("\n╔══════════════════════════════════════════════════════════╗");
    console.log("║           Vision Thread Store & Backend Running          ║");
    console.log("╠══════════════════════════════════════════════════════════╣");
    console.log("║  Website (This PC):    http://localhost:" + PORT + "               ║");
    console.log("║  Website (All Devices):http://192.168.1.104:" + PORT + "           ║");
    console.log("║  Admin Panel:          http://localhost:" + PORT + "/admin         ║");
    console.log("║  Admin (All Devices):  http://192.168.1.104:" + PORT + "/admin     ║");
    console.log("╚══════════════════════════════════════════════════════════╝\n");
  });
}

module.exports = app;

