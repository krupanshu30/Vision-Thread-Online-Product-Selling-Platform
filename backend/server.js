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

const staticImageOptions = {
  maxAge: "30d",
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (/\.(jpg|jpeg|png|webp|gif|svg|ico)$/i.test(filePath)) {
      res.setHeader("Cache-Control", "public, max-age=2592000, stale-while-revalidate=86400");
    }
  }
};

if (process.env.VERCEL) {
  // On Vercel: serve /tmp/uploads first (runtime uploads), then bundled uploads (committed images)
  const tmpUploadsDir = path.join("/tmp", "uploads");
  try {
    if (!fs.existsSync(tmpUploadsDir)) fs.mkdirSync(tmpUploadsDir, { recursive: true });
  } catch (e) {}
  app.use("/uploads", express.static(tmpUploadsDir, staticImageOptions));
  app.use("/uploads", express.static(uploadsDir, staticImageOptions)); // fallback: committed images
} else {
  app.use("/uploads", express.static(uploadsDir, staticImageOptions));
}
app.use("/images", express.static(path.join(__dirname, "../images"), staticImageOptions));
app.use("/admin/images", express.static(path.join(__dirname, "../images"), staticImageOptions));

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

// Anti-caching headers for storefront HTML and JS to ensure all mobile/device updates appear immediately
app.use((req, res, next) => {
  const path_ = req.path;
  // Never apply no-cache to images or uploads to allow smooth, flicker-free scrolling
  if (/\.(jpg|jpeg|png|webp|gif|svg|ico)$/i.test(path_) || path_.startsWith("/uploads/")) {
    return next();
  }
  if (path_ === '/' || path_.endsWith('.html')) {
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    });
  } else if (path_.endsWith('.js') || path_.startsWith('/api/')) {
    // Extra aggressive for products.js and API endpoints:
    // Surrogate-Control kills Vercel's CDN/edge cache between deployments
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store',
      'CDN-Cache-Control': 'no-store',
      'Vercel-CDN-Cache-Control': 'no-store',
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
  validate: { trustProxy: false },
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
// Serve JS files with no-cache to ensure product updates appear immediately across all devices
app.use("/js", express.static(path.join(__dirname, "../js"), {
  maxAge: 0,
  etag: false,
  lastModified: false,
  setHeaders: (res) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');
    res.set('Vercel-CDN-Cache-Control', 'no-store');
  }
}));
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

