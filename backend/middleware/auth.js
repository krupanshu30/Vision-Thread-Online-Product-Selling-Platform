// middleware/auth.js - JWT Authentication Middleware
const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * Middleware: Verify JWT token from Authorization header or httpOnly cookie
 * Protects all admin routes
 */
const authenticateAdmin = (req, res, next) => {
  try {
    // Support both Authorization header and cookie
    let token = null;

    const authHeader = req.headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.admin_token) {
      token = req.cookies.admin_token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Admin authentication required.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin" && decoded.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden. Admin privileges required.",
      });
    }

    req.admin = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again.",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid token. Access denied.",
    });
  }
};

module.exports = { authenticateAdmin };
