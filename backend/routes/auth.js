// routes/auth.js - Admin login/logout with JWT
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const db = require("../config/database");
const { authenticateAdmin } = require("../middleware/auth");

const router = express.Router();

// Rate limiter: max 100 login attempts in development
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many login attempts. Try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
});

// POST /api/admin/login
router.post(
  "/login",
  loginLimiter,
  [
    body().custom((value, { req }) => {
      const id = req.body.identifier || req.body.email || req.body.username;
      if (!id || !id.toString().trim()) {
        throw new Error("Email or username required");
      }
      return true;
    }),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const identifier = (req.body.identifier || req.body.email || req.body.username || "").trim();
    const { password } = req.body;

    try {
      const [rows] = await db.execute(
        "SELECT id, email, username, password, full_name, role, is_active FROM admin_users WHERE LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?) OR (username = 'visionthread_admin' AND LOWER(?) = 'admin') LIMIT 1",
        [identifier, identifier, identifier]
      );

      if (rows.length === 0) {
        return res.status(401).json({ success: false, message: "Invalid email/username or password." });
      }

      const admin = rows[0];

      if (!admin.is_active) {
        return res.status(403).json({ success: false, message: "This account is disabled." });
      }

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid email or password." });
      }

      // Update last login
      await db.execute("UPDATE admin_users SET last_login = NOW() WHERE id = ?", [admin.id]);

      // Sign JWT
      const token = jwt.sign(
        { id: admin.id, email: admin.email, username: admin.username, role: admin.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
      );

      // Set httpOnly cookie (secure, no JS access) + return token in body
      res.cookie("admin_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      return res.json({
        success: true,
        message: "Login successful!",
        token,
        admin: {
          id: admin.id,
          email: admin.email,
          username: admin.username,
          fullName: admin.full_name,
          role: admin.role,
        },
      });
    } catch (err) {
      console.error("[AUTH] Login error:", err.message);
      if (err.code === "ER_ACCESS_DENIED_ERROR") {
        return res.status(500).json({
          success: false,
          message: "Database Error: MySQL password in backend/.env is incorrect. Please set your actual MySQL password in backend/.env line 9."
        });
      }
      if (err.code === "ER_BAD_DB_ERROR" || err.code === "ER_NO_SUCH_TABLE") {
        return res.status(500).json({
          success: false,
          message: "Database Error: Database tables have not been created yet. Please run setup_database.bat first."
        });
      }
      if (err.code === "ECONNREFUSED") {
        return res.status(500).json({
          success: false,
          message: "Database Error: MySQL service is not reachable on port 3306. Ensure MySQL is running."
        });
      }
      return res.status(500).json({ success: false, message: "Server error. Try again later." });
    }
  }
);

// POST /api/admin/logout
router.post("/logout", authenticateAdmin, (req, res) => {
  res.clearCookie("admin_token");
  return res.json({ success: true, message: "Logged out successfully." });
});

// GET /api/admin/me - Verify token & get current admin info
router.get("/me", authenticateAdmin, async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT id, email, username, full_name, role, last_login FROM admin_users WHERE id = ?",
      [req.admin.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: "Admin not found." });
    return res.json({ success: true, admin: rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// POST /api/admin/change-password
router.post(
  "/change-password",
  authenticateAdmin,
  [
    body("currentPassword").notEmpty().withMessage("Current password required"),
    body("newPassword").isLength({ min: 8 }).withMessage("New password must be at least 8 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { currentPassword, newPassword } = req.body;
    try {
      const [rows] = await db.execute("SELECT password FROM admin_users WHERE id = ?", [req.admin.id]);
      const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
      if (!isMatch) return res.status(401).json({ success: false, message: "Current password is incorrect." });

      const hashed = await bcrypt.hash(newPassword, 12);
      await db.execute("UPDATE admin_users SET password = ? WHERE id = ?", [hashed, req.admin.id]);

      return res.json({ success: true, message: "Password changed successfully!" });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Server error." });
    }
  }
);

module.exports = router;
