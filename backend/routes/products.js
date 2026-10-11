// routes/products.js - CRUD for products (admin) + public listing
const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { body, query, validationResult } = require("express-validator");
const db = require("../config/database");
const { authenticateAdmin } = require("../middleware/auth");

const router = express.Router();

// Upload setup for product images
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    cb(null, `prod_${Date.now()}_${cleanName}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif|svg\+xml|svg/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(file.mimetype) || allowed.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (JPG, PNG, WEBP, GIF, SVG) are allowed."));
    }
  },
});

// ---- PUBLIC ROUTES ----

// GET /api/products - List all in-stock products (for frontend)
router.get("/", async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let sql = "SELECT * FROM products WHERE in_stock = 1";
    const params = [];

    if (category && category !== "all") {
      sql += " AND category = ?";
      params.push(category);
    }
    if (search) {
      sql += " AND (name LIKE ? OR short_desc LIKE ? OR category LIKE ?)";
      const q = "%" + search + "%";
      params.push(q, q, q);
    }

    const sortMap = {
      "price-low": "price ASC",
      "price-high": "price DESC",
      rating: "rating DESC",
      name: "name ASC",
      default: "created_at DESC",
    };
    sql += " ORDER BY " + (sortMap[sort] || sortMap.default);

    const [rows] = await db.execute(sql, params);
    return res.json({ success: true, products: rows.map(formatProduct) });
  } catch (err) {
    console.error("[PRODUCTS] Error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to fetch products." });
  }
});

// GET /api/products/:id - Single product
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM products WHERE product_code = ? OR id = ?", [req.params.id, isNaN(req.params.id) ? 0 : req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: "Product not found." });
    return res.json({ success: true, product: formatProduct(rows[0]) });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// ---- ADMIN-ONLY ROUTES ----

// GET /api/products/admin/all - All products including out-of-stock
router.get("/admin/all", authenticateAdmin, async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let sql = "SELECT * FROM products WHERE 1=1";
    const params = [];
    if (search) {
      sql += " AND (name LIKE ? OR product_code LIKE ?)";
      const q = "%" + search + "%";
      params.push(q, q);
    }
    if (category && category !== "all") {
      sql += " AND category = ?";
      params.push(category);
    }
    sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), offset);

    const [[countRow], [rows]] = await Promise.all([
      db.execute("SELECT COUNT(*) as total FROM products", []),
      db.execute(sql, params),
    ]);

    return res.json({
      success: true,
      products: rows.map(formatProduct),
      total: countRow[0].total,
      page: parseInt(page),
      pages: Math.ceil(countRow[0].total / parseInt(limit)),
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// POST /api/products/admin - Add new product
router.post(
  "/admin",
  authenticateAdmin,
  [
    body("name").trim().notEmpty().withMessage("Product name required"),
    body("category").notEmpty().withMessage("Category required"),
    body("price").isNumeric().withMessage("Valid price required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });

    const { name, category, price, originalPrice, badge, shortDesc, fullDesc, imageUrl, gallery, colors, materials, dimensions, customizable, inStock } = req.body;
    const code = "vt-" + Date.now().toString(36);

    try {
      const [result] = await db.execute(
        `INSERT INTO products (product_code, name, category, price, original_price, badge, short_desc, full_desc, image_url, gallery_json, colors_json, materials, dimensions, customizable, in_stock)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          code, name, category, parseFloat(price), originalPrice ? parseFloat(originalPrice) : null,
          badge || null, shortDesc || "", fullDesc || "", imageUrl || "",
          JSON.stringify(gallery || [imageUrl]),
          JSON.stringify(colors || ["Pink", "White"]),
          materials || "", dimensions || "",
          customizable !== false ? 1 : 0, inStock !== false ? 1 : 0,
        ]
      );
      const [rows] = await db.execute("SELECT * FROM products WHERE id = ?", [result.insertId]);
      return res.status(201).json({ success: true, message: "Product added!", product: formatProduct(rows[0]) });
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") return res.status(400).json({ success: false, message: "Product code already exists." });
      return res.status(500).json({ success: false, message: "Server error." });
    }
  }
);

// POST /api/products/admin/upload-image - Upload product image file from device
router.post("/admin/upload-image", authenticateAdmin, (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      console.error("[UPLOAD] Error:", err.message);
      return res.status(400).json({ success: false, message: err.message || "Failed to upload image." });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file provided." });
    }

    const host = req.get("host") || `localhost:${process.env.PORT || 5000}`;
    const protocol = req.protocol || "http";
    const fullUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    const relativeUrl = `/uploads/${req.file.filename}`;

    return res.json({
      success: true,
      message: "Image uploaded successfully!",
      imageUrl: fullUrl,
      relativeUrl: relativeUrl,
      filename: req.file.filename,
    });
  });
});

// PATCH /api/products/admin/:id/image - Directly change product image
router.patch("/admin/:id/image", authenticateAdmin, async (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl || !imageUrl.trim()) {
    return res.status(400).json({ success: false, message: "Image URL or path is required." });
  }

  try {
    const [existing] = await db.execute("SELECT * FROM products WHERE id = ?", [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    const current = existing[0];
    let gallery = safeJSON(current.gallery_json, []);
    const cleanImg = imageUrl.trim();
    if (!gallery.includes(cleanImg)) {
      gallery = [cleanImg, ...gallery.filter(g => g !== current.image_url)];
    }

    await db.execute(
      "UPDATE products SET image_url = ?, gallery_json = ?, updated_at = NOW() WHERE id = ?",
      [cleanImg, JSON.stringify(gallery), req.params.id]
    );

    const [rows] = await db.execute("SELECT * FROM products WHERE id = ?", [req.params.id]);
    return res.json({
      success: true,
      message: "Product image updated successfully!",
      product: formatProduct(rows[0]),
    });
  } catch (err) {
    console.error("[PRODUCT-IMAGE-UPDATE] Error:", err.message);
    return res.status(500).json({ success: false, message: "Server error while updating image." });
  }
});

// PUT /api/products/admin/:id - Update product
router.put("/admin/:id", authenticateAdmin, async (req, res) => {
  const { name, category, price, originalPrice, badge, shortDesc, fullDesc, imageUrl, gallery, colors, materials, dimensions, customizable, inStock } = req.body;
  try {
    const [existing] = await db.execute("SELECT * FROM products WHERE id = ?", [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: "Product not found." });
    const current = existing[0];

    const finalGallery = gallery && Array.isArray(gallery) && gallery.length > 0
      ? gallery
      : (imageUrl ? [imageUrl] : safeJSON(current.gallery_json, []));

    const finalColors = colors && Array.isArray(colors) && colors.length > 0
      ? colors
      : safeJSON(current.colors_json, ["Pink", "White"]);

    await db.execute(
      `UPDATE products SET name=?, category=?, price=?, original_price=?, badge=?, short_desc=?, full_desc=?, image_url=?, gallery_json=?, colors_json=?, materials=?, dimensions=?, customizable=?, in_stock=?, updated_at=NOW()
       WHERE id=?`,
      [
        name, category, parseFloat(price), originalPrice ? parseFloat(originalPrice) : null,
        badge || null, shortDesc || "", fullDesc || "", imageUrl || "",
        JSON.stringify(finalGallery), JSON.stringify(finalColors),
        materials || "", dimensions || "",
        customizable !== false ? 1 : 0, inStock !== false ? 1 : 0,
        req.params.id,
      ]
    );
    const [rows] = await db.execute("SELECT * FROM products WHERE id = ?", [req.params.id]);
    return res.json({ success: true, message: "Product updated!", product: formatProduct(rows[0]) });
  } catch (err) {
    console.error("[PRODUCT-UPDATE] Error:", err.message);
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// DELETE /api/products/admin/:id - Delete product
router.delete("/admin/:id", authenticateAdmin, async (req, res) => {
  try {
    const [result] = await db.execute("DELETE FROM products WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Product not found." });
    return res.json({ success: true, message: "Product deleted." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// Helper: format DB row to app-friendly object
function formatProduct(row) {
  return {
    id: row.product_code || String(row.id),
    dbId: row.id,
    productCode: row.product_code,
    name: row.name,
    category: row.category,
    price: parseFloat(row.price),
    originalPrice: row.original_price ? parseFloat(row.original_price) : null,
    rating: parseFloat(row.rating),
    reviewsCount: row.reviews_count,
    badge: row.badge,
    shortDescription: row.short_desc,
    fullDescription: row.full_desc,
    image: row.image_url,
    gallery: safeJSON(row.gallery_json, []),
    colors: safeJSON(row.colors_json, []),
    materials: row.materials,
    dimensions: row.dimensions,
    customizable: !!row.customizable,
    inStock: !!row.in_stock,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function safeJSON(val, fallback) {
  try { return typeof val === "string" ? JSON.parse(val) : (val || fallback); } catch { return fallback; }
}

module.exports = router;
