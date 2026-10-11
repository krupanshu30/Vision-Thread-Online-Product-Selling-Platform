// Vercel Serverless Function entrypoint
try {
  const app = require("../backend/server");
  module.exports = app;
} catch (err) {
  console.error("Failed to initialize backend server:", err);
  const express = require("express");
  const fallback = express();
  fallback.use((req, res) => {
    res.status(500).json({
      success: false,
      message: "Server initialization error: " + err.message,
    });
  });
  module.exports = fallback;
}
