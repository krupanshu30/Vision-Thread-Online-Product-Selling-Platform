// server.js - Vision Thread Backend - Main Express Server
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// Uploads and Static Assets
// ============================================================
const uploadsDir = path.join(__dirname, "uploads");
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (e) {
  // Gracefully ignore on read-only environments
}

if (process.env.VERCEL) {
  // On Vercel: serve /tmp/uploads first (runtime uploads), then bundled uploads (committed images)
  const tmpUploadsDir = path.join("/tmp", "uploads");
  try {
    if (!fs.existsSync(tmpUploadsDir)) fs.mkdirSync(tmpUploadsDir, { recursive: true });
  } catch (e) {}
  app.use("/uploads", express.static(tmpUploadsDir));
  app.use("/uploads", express.static(uploadsDir)); // fallback: committed images
} else {
  app.use("/uploads", express.static(uploadsDir));
}
app.use("/images", express.static(path.join(__dirname, "../images")));
app.use("/admin/images", express.static(path.join(__dirname, "../images")));

// ============================================================
// Security & Proxy Middleware
// ============================================================
app.set("trust proxy", true);

app.use(helmet({
  contentSecurityPolicy: false, // Disabled for serving admin panel HTML
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// CORS - allow all origins, tools, tunnels, and mobile devices
app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  // Allow all requested headers including Cache-Control, Pragma, Bypass-Tunnel-Reminder
}));
app.options("*", cors());

// Anti-caching headers for storefront HTML and JS to ensure all mobile updates appear immediately
app.use((req, res, next) => {
  if (req.path.endsWith(".html") || req.path === "/" || req.path.endsWith(".js") || req.path.startsWith("/api/")) {
    res.set({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    });
  }
  next();
});

// Parse JSON & cookies
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cookieParser());

// Global rate limiter (3000 requests per 15 minutes per IP)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3000,
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
// Serve Static Files, Customer Storefront & Admin Panel
// ============================================================
app.use("/css", express.static(path.join(__dirname, "../css")));
app.use("/js", express.static(path.join(__dirname, "../js")));
app.use("/images", express.static(path.join(__dirname, "../images")));
app.use("/admin/images", express.static(path.join(__dirname, "../images")));
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
  const os = require("os");
  function getLanIp() {
    try {
      const ifaces = os.networkInterfaces();
      for (const dev in ifaces) {
        for (const details of ifaces[dev]) {
          if (details.family === "IPv4" && !details.internal) {
            return details.address;
          }
        }
      }
    } catch (e) {}
    return "192.168.1.104";
  }
  const lanIp = getLanIp();

  app.listen(PORT, "0.0.0.0", () => {
    console.log("\n╔══════════════════════════════════════════════════════════╗");
    console.log("║           Vision Thread Store & Backend Running          ║");
    console.log("╠══════════════════════════════════════════════════════════╣");
    console.log("║  Website (This PC):    http://localhost:" + PORT + "               ║");
    console.log("║  Website (All Devices):http://" + lanIp + ":" + PORT + "           ║");
    console.log("║  Admin Panel:          http://localhost:" + PORT + "/admin         ║");
    console.log("║  Admin (All Devices):  http://" + lanIp + ":" + PORT + "/admin     ║");
    console.log("╚══════════════════════════════════════════════════════════╝\n");
  });
}

module.exports = app;

