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
const uploadsDir = process.env.VERCEL ? path.join("/tmp", "uploads") : path.join(__dirname, "../uploads");
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (e) {
  // Gracefully ignore on read-only environments
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

let catalogVersion = Date.now().toString(36);
const jsProductsFilePath = path.join(__dirname, "../../js/products.js");
const cacheFilePath = path.join(__dirname, "../data/products_cache.json");

/**
 * Save products to the COMMITTED cache file (backend/data/products_cache.json).
 * This is the file that gets pushed to GitHub and bundled into Vercel deployments.
 * On Vercel (read-only FS), this write will silently fail – that's OK because
 * the file was already written locally and committed before the deploy triggered.
 */
function saveProductsToFileCache(products) {
  try {
    const dir = path.dirname(cacheFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(cacheFilePath, JSON.stringify(products, null, 2), "utf8");
  } catch (e) {
    // Silently ignore on Vercel's read-only filesystem – the file was already committed
    if (!process.env.VERCEL) {
      console.warn("[PRODUCTS] Failed to write cache file:", e.message);
    }
  }
}

/**
 * Read products from the committed cache file.
 * On Vercel, this file is bundled with the deployment (from the git repo),
 * so it always has the latest products from the last git push.
 */
function readProductsFromFileCache() {
  try {
    if (fs.existsSync(cacheFilePath)) {
      const raw = fs.readFileSync(cacheFilePath, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn("[PRODUCTS] Failed to read cache file:", e.message);
  }
  return [];
}

// In-memory product cache - serves as fast fallback when DB or file are unavailable
let _memProductsCache = [];

function syncCatalogFiles(products) {
  if (!Array.isArray(products) || products.length === 0) return;

  // Always keep in-memory cache up to date
  _memProductsCache = products;

  // 1. Write to the committed cache file (backend/data/products_cache.json)
  // This file gets committed to git and is bundled into every Vercel deployment
  saveProductsToFileCache(products);

  // 2. Update js/products.js with the latest DEFAULT_PRODUCTS and bump DATA_VERSION
  // This ensures the storefront always loads latest products even before the API responds
  try {
    if (fs.existsSync(jsProductsFilePath)) {
      let content = fs.readFileSync(jsProductsFilePath, "utf8");
      const newVersion = Date.now().toString();
      content = content.replace(/const DATA_VERSION\s*=\s*['"][^'"]*['"];/, `const DATA_VERSION = '${newVersion}';`);
      const jsonProducts = JSON.stringify(products, null, 2);
      const regex = /const DEFAULT_PRODUCTS\s*=\s*\[[\s\S]*?\];\s*(window\.getVtApiBase)/;
      if (regex.test(content)) {
        content = content.replace(regex, `const DEFAULT_PRODUCTS = ${jsonProducts};\n\n$1`);
        fs.writeFileSync(jsProductsFilePath, content, "utf8");
        console.log("[PRODUCTS] ✅ Synchronized js/products.js (Version: " + newVersion + ", Products: " + products.length + ")");
      }
    }
  } catch (e) {
    console.warn("[PRODUCTS] Could not update js/products.js:", e.message);
  }
}

const VERCEL_DEPLOY_HOOK_URL = process.env.VERCEL_DEPLOY_HOOK_URL || "https://api.vercel.com/v1/integrations/deploy/prj_HjiRllscsRHU5pSOpQTnWdsPRh1p/M6debyLwy9";

function pingVercelDeployHook() {
  if (!VERCEL_DEPLOY_HOOK_URL) return;
  fetch(VERCEL_DEPLOY_HOOK_URL, { method: "POST" })
    .then(r => r.json())
    .then(data => {
      console.log("[AUTO-DEPLOY] 🚀 Vercel Deploy Hook triggered successfully!", data?.job?.id || data?.message || "triggered");
    })
    .catch(err => {
      console.warn("[AUTO-DEPLOY] Deploy Hook notice:", err.message);
    });
}

let isDeploying = false;
let deployQueued = false;

function triggerAutoGitDeploy(reason = "Product catalog update") {
  if (process.env.VERCEL) {
    // When running inside Vercel serverless, only ping deploy hook
    pingVercelDeployHook();
    return;
  }
  if (isDeploying) {
    deployQueued = true;
    return;
  }
  isDeploying = true;
  deployQueued = false;

  const { exec } = require("child_process");
  const rootDir = path.resolve(__dirname, "../..");
  const safeReason = (reason || "Product catalog update").replace(/["`$\\]/g, "").slice(0, 80);

  // Use separate git commands so a failure in one step doesn't kill the whole chain
  // Step 1: Stage all product-related files
  const addCmd = `git add -f backend/data/products_cache.json js/products.js backend/uploads backend/data`;
  // Step 2: Commit (allow failure if nothing to commit)
  const commitMsg = `Auto-deploy: ${safeReason} [auto-sync]`;
  const commitCmd = `git commit -m "${commitMsg}"`;
  // Step 3: Push
  const pushCmd = `git push origin main`;

  console.log(`[AUTO-DEPLOY] 🚀 Deploying to GitHub & Vercel (${safeReason})...`);

  exec(addCmd, { cwd: rootDir }, (addErr) => {
    if (addErr) {
      console.warn("[AUTO-DEPLOY] git add warning:", addErr.message);
    }
    exec(commitCmd, { cwd: rootDir }, (commitErr) => {
      if (commitErr) {
        if (commitErr.message && (commitErr.message.includes("nothing to commit") || commitErr.message.includes("nothing added"))) {
          console.log("[AUTO-DEPLOY] No git changes to commit - pinging deploy hook anyway.");
          pingVercelDeployHook();
          isDeploying = false;
          if (deployQueued) triggerAutoGitDeploy("Queued updates");
          return;
        }
        console.warn("[AUTO-DEPLOY] git commit warning:", commitErr.message);
      }
      exec(pushCmd, { cwd: rootDir }, (pushErr) => {
        isDeploying = false;
        if (pushErr) {
          console.warn("[AUTO-DEPLOY] git push warning:", pushErr.message);
        } else {
          console.log("[AUTO-DEPLOY] ✅ Pushed to GitHub successfully! Vercel is now building the update.");
        }
        // Always ping Vercel deploy hook after push attempt
        pingVercelDeployHook();
        if (deployQueued) triggerAutoGitDeploy("Queued updates");
      });
    });
  });
}

async function getCatalogVersionFromDb() {
  try {
    const [[countRow]] = await db.execute("SELECT COUNT(*) as total, UNIX_TIMESTAMP(MAX(updated_at)) as max_updated, UNIX_TIMESTAMP(MAX(created_at)) as max_created FROM products");
    if (countRow) {
      catalogVersion = `v${countRow.total}_${countRow.max_updated || countRow.max_created || Date.now()}`;
      return { version: catalogVersion, total: countRow.total, lastUpdated: countRow.max_updated || countRow.max_created };
    }
  } catch (err) {
    const cached = readProductsFromFileCache();
    if (cached.length > 0) {
      catalogVersion = `v${cached.length}_cache_${Date.now()}`;
      return { version: catalogVersion, total: cached.length, lastUpdated: null };
    }
  }
  return { version: catalogVersion, total: 0, lastUpdated: null };
}

function sanitizeImageUrlForDb(url) {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  const uploadMatch = trimmed.match(/\/uploads\/[^"'\s?#]+/);
  if (uploadMatch) return uploadMatch[0];
  return trimmed;
}

// ---- PUBLIC ROUTES ----

// GET /api/products/version - Lightweight version checker for real-time mobile sync
router.get("/version", async (req, res) => {
  res.set({
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
  });
  const vInfo = await getCatalogVersionFromDb();
  return res.json({
    success: true,
    version: vInfo.version,
    total: vInfo.total,
    lastUpdated: vInfo.lastUpdated,
    timestamp: Date.now(),
  });
});

// GET /api/products - List products with live cache-busting & stock info
router.get("/", async (req, res) => {
  const vInfo = await getCatalogVersionFromDb();
  res.set({
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
    "Surrogate-Control": "no-store",
    "X-Catalog-Version": vInfo.version,
  });

  try {
    const { category, search, sort, inStockOnly } = req.query;
    let sql = "SELECT * FROM products WHERE 1=1";
    const params = [];

    if (inStockOnly === "true" || inStockOnly === "1") {
      sql += " AND in_stock = 1";
    }

    if (category && category !== "all") {
      sql += " AND LOWER(category) = LOWER(?)";
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
      default: "in_stock DESC, created_at DESC",
    };
    sql += " ORDER BY " + (sortMap[sort] || sortMap.default);

    const [rows] = await db.execute(sql, params);
    const formatted = rows.map(r => formatProduct(r, req));

    // Save full catalog to local fallback cache when fetching full list
    if (!category && !search && (inStockOnly === undefined || inStockOnly === "")) {
      saveProductsToFileCache(formatted);
    }

    return res.json({
      success: true,
      catalogVersion: vInfo.version,
      products: formatted,
    });
  } catch (err) {
    console.error("[PRODUCTS] DB Error, serving fallback cache:", err.message);
    // Fallback chain: file cache → in-memory cache
    const cached = readProductsFromFileCache();
    if (cached && cached.length > 0) {
      _memProductsCache = cached; // warm up in-memory cache
      return res.json({
        success: true,
        catalogVersion: vInfo.version,
        products: cached,
        fromCache: true,
      });
    }
    // Last resort: serve in-memory cache (populated from previous admin operations)
    if (_memProductsCache && _memProductsCache.length > 0) {
      return res.json({
        success: true,
        catalogVersion: vInfo.version,
        products: _memProductsCache,
        fromMemCache: true,
      });
    }
    return res.status(500).json({ success: false, message: "Failed to fetch products." });
  }
});

// GET /api/products/:id - Single product
router.get("/:id", async (req, res) => {
  try {
    res.set({
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    });
    const [rows] = await db.execute("SELECT * FROM products WHERE product_code = ? OR id = ?", [req.params.id, isNaN(req.params.id) ? 0 : req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: "Product not found." });
    return res.json({ success: true, product: formatProduct(rows[0], req) });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// ---- ADMIN-ONLY ROUTES ----

// GET /api/products/admin/all - All products including out-of-stock
router.get("/admin/all", authenticateAdmin, async (req, res) => {
  try {
    res.set({
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    });
    const { search, category, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let sql = "SELECT * FROM products WHERE 1=1";
    let countSql = "SELECT COUNT(*) as total FROM products WHERE 1=1";
    const params = [];
    const countParams = [];

    if (search) {
      const q = "%" + search + "%";
      sql += " AND (name LIKE ? OR product_code LIKE ?)";
      countSql += " AND (name LIKE ? OR product_code LIKE ?)";
      params.push(q, q);
      countParams.push(q, q);
    }
    if (category && category !== "all") {
      sql += " AND LOWER(category) = LOWER(?)";
      countSql += " AND LOWER(category) = LOWER(?)";
      params.push(category);
      countParams.push(category);
    }
    sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), offset);

    try {
      const [[countRow], [rows]] = await Promise.all([
        db.execute(countSql, countParams),
        db.execute(sql, params),
      ]);

      return res.json({
        success: true,
        catalogVersion,
        products: rows.map(r => formatProduct(r, req)),
        total: countRow[0].total,
        page: parseInt(page),
        pages: Math.ceil(countRow[0].total / parseInt(limit)) || 1,
      });
    } catch (dbErr) {
      console.warn("[ADMIN-PRODUCTS] DB unavailable, serving cache:", dbErr.message);
      let cached = readProductsFromFileCache();
      if (search) {
        const q = search.toLowerCase();
        cached = cached.filter(p => (p.name && p.name.toLowerCase().includes(q)) || (p.productCode && p.productCode.toLowerCase().includes(q)));
      }
      if (category && category !== "all") {
        cached = cached.filter(p => p.category && p.category.toLowerCase() === category.toLowerCase());
      }
      return res.json({
        success: true,
        catalogVersion,
        products: cached.slice(offset, offset + parseInt(limit)),
        total: cached.length,
        page: parseInt(page),
        pages: Math.ceil(cached.length / parseInt(limit)) || 1,
        fromCache: true,
      });
    }
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
    const cleanImg = sanitizeImageUrlForDb(imageUrl);
    const cleanGallery = (gallery && Array.isArray(gallery) && gallery.length > 0 ? gallery : (cleanImg ? [cleanImg] : [])).map(sanitizeImageUrlForDb);
    const cleanColors = (colors && Array.isArray(colors) && colors.length > 0) ? colors : ["Pink", "White"];

    let newProduct = null;
    let allProducts = [];

    try {
      const [result] = await db.execute(
        `INSERT INTO products (product_code, name, category, price, original_price, badge, short_desc, full_desc, image_url, gallery_json, colors_json, materials, dimensions, customizable, in_stock)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          code, name, category, parseFloat(price), originalPrice ? parseFloat(originalPrice) : null,
          badge || null, shortDesc || "", fullDesc || "", cleanImg,
          JSON.stringify(cleanGallery),
          JSON.stringify(cleanColors),
          materials || "", dimensions || "",
          customizable !== false ? 1 : 0, inStock !== false ? 1 : 0,
        ]
      );
      const [rows] = await db.execute("SELECT * FROM products WHERE id = ?", [result.insertId]);
      newProduct = formatProduct(rows[0], req);
      const [allRows] = await db.execute("SELECT * FROM products ORDER BY in_stock DESC, created_at DESC");
      allProducts = allRows.map(r => formatProduct(r, req));
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") return res.status(400).json({ success: false, message: "Product code already exists." });
      console.warn("[PRODUCT-ADD] DB unavailable, saving to cache store:", err.message);
      newProduct = {
        id: code,
        dbId: Date.now(),
        productCode: code,
        name,
        category,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        rating: 5.0,
        reviewsCount: 0,
        badge: badge || null,
        shortDescription: shortDesc || "",
        fullDescription: fullDesc || "",
        image: cleanImg,
        relativeImage: cleanImg,
        gallery: cleanGallery,
        colors: cleanColors,
        materials: materials || "",
        dimensions: dimensions || "",
        customizable: customizable !== false,
        inStock: inStock !== false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const existing = readProductsFromFileCache();
      allProducts = [newProduct, ...existing];
    }

    syncCatalogFiles(allProducts);
    triggerAutoGitDeploy(`Add product: ${name}`);
    const vInfo = await getCatalogVersionFromDb();

    return res.status(201).json({
      success: true,
      message: "Product added successfully! Changes are syncing with live website.",
      catalogVersion: vInfo.version,
      product: newProduct,
    });
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
      imageUrl: relativeUrl,
      relativeUrl: relativeUrl,
      fullUrl: fullUrl,
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

  const idParam = req.params.id;
  const numId = !isNaN(idParam) ? parseInt(idParam, 10) : 0;
  const cleanImg = sanitizeImageUrlForDb(imageUrl);
  let updatedProduct = null;
  let allProducts = [];

  try {
    const [existing] = await db.execute(
      "SELECT * FROM products WHERE id = ? OR product_code = ? LIMIT 1",
      [numId, idParam]
    );
    if (existing.length === 0) return res.status(404).json({ success: false, message: "Product not found." });
    const current = existing[0];
    const actualDbId = current.id;

    let gallery = safeJSON(current.gallery_json, []);
    gallery = Array.isArray(gallery) ? gallery.map(sanitizeImageUrlForDb) : [];
    if (!gallery.includes(cleanImg)) {
      gallery = [cleanImg, ...gallery.filter(g => g !== current.image_url)];
    }

    await db.execute(
      "UPDATE products SET image_url = ?, gallery_json = ?, updated_at = NOW() WHERE id = ?",
      [cleanImg, JSON.stringify(gallery), actualDbId]
    );

    const [rows] = await db.execute("SELECT * FROM products WHERE id = ?", [actualDbId]);
    updatedProduct = formatProduct(rows[0], req);
    const [allRows] = await db.execute("SELECT * FROM products ORDER BY in_stock DESC, created_at DESC");
    allProducts = allRows.map(r => formatProduct(r, req));
  } catch (err) {
    console.warn("[PRODUCT-IMAGE-UPDATE] DB unavailable, updating image in cache store:", err.message);
    const existing = readProductsFromFileCache();
    const idx = existing.findIndex(p => p.id === idParam || p.productCode === idParam || String(p.dbId) === String(idParam));
    if (idx === -1) return res.status(404).json({ success: false, message: "Product not found." });
    existing[idx].image = cleanImg;
    existing[idx].relativeImage = cleanImg;
    existing[idx].gallery = [cleanImg, ...(existing[idx].gallery || []).filter(g => g !== cleanImg)];
    existing[idx].updatedAt = new Date().toISOString();
    updatedProduct = existing[idx];
    allProducts = existing;
  }

  syncCatalogFiles(allProducts);
  triggerAutoGitDeploy(`Update image for product ${idParam}`);
  const vInfo = await getCatalogVersionFromDb();

  return res.json({
    success: true,
    message: "Product image updated successfully! Syncing with live website.",
    catalogVersion: vInfo.version,
    product: updatedProduct,
  });
});

// PUT /api/products/admin/:id - Update product
router.put("/admin/:id", authenticateAdmin, async (req, res) => {
  const { name, category, price, originalPrice, badge, shortDesc, fullDesc, imageUrl, gallery, colors, materials, dimensions, customizable, inStock } = req.body;
  const idParam = req.params.id;
  const numId = !isNaN(idParam) ? parseInt(idParam, 10) : 0;
  let updatedProduct = null;
  let allProducts = [];

  try {
    const [existing] = await db.execute(
      "SELECT * FROM products WHERE id = ? OR product_code = ? LIMIT 1",
      [numId, idParam]
    );
    if (existing.length === 0) return res.status(404).json({ success: false, message: "Product not found." });
    const current = existing[0];
    const actualDbId = current.id;

    const cleanImg = (imageUrl !== undefined && imageUrl !== null && imageUrl !== "")
      ? sanitizeImageUrlForDb(imageUrl)
      : sanitizeImageUrlForDb(current.image_url);

    const finalGallery = (gallery && Array.isArray(gallery) && gallery.length > 0)
      ? gallery.map(sanitizeImageUrlForDb)
      : (cleanImg ? [cleanImg] : safeJSON(current.gallery_json, []).map(sanitizeImageUrlForDb));

    const finalColors = colors && Array.isArray(colors) && colors.length > 0
      ? colors
      : safeJSON(current.colors_json, ["Pink", "White"]);

    await db.execute(
      `UPDATE products SET name=?, category=?, price=?, original_price=?, badge=?, short_desc=?, full_desc=?, image_url=?, gallery_json=?, colors_json=?, materials=?, dimensions=?, customizable=?, in_stock=?, updated_at=NOW()
       WHERE id=?`,
      [
        name, category, parseFloat(price), originalPrice ? parseFloat(originalPrice) : null,
        badge || null, shortDesc || "", fullDesc || "", cleanImg || "",
        JSON.stringify(finalGallery), JSON.stringify(finalColors),
        materials || "", dimensions || "",
        customizable !== false ? 1 : 0, inStock !== false ? 1 : 0,
        actualDbId,
      ]
    );

    const [rows] = await db.execute("SELECT * FROM products WHERE id = ?", [actualDbId]);
    updatedProduct = formatProduct(rows[0], req);
    const [allRows] = await db.execute("SELECT * FROM products ORDER BY in_stock DESC, created_at DESC");
    allProducts = allRows.map(r => formatProduct(r, req));
  } catch (err) {
    console.warn("[PRODUCT-UPDATE] DB unavailable, updating in cache store:", err.message);
    const existing = readProductsFromFileCache();
    const idx = existing.findIndex(p => p.id === idParam || p.productCode === idParam || String(p.dbId) === String(idParam));
    if (idx === -1) return res.status(404).json({ success: false, message: "Product not found." });

    const cleanImg = imageUrl ? sanitizeImageUrlForDb(imageUrl) : existing[idx].image;
    existing[idx] = {
      ...existing[idx],
      name: name || existing[idx].name,
      category: category || existing[idx].category,
      price: price !== undefined ? parseFloat(price) : existing[idx].price,
      originalPrice: originalPrice ? parseFloat(originalPrice) : existing[idx].originalPrice,
      badge: badge !== undefined ? badge : existing[idx].badge,
      shortDescription: shortDesc !== undefined ? shortDesc : existing[idx].shortDescription,
      fullDescription: fullDesc !== undefined ? fullDesc : existing[idx].fullDescription,
      image: cleanImg,
      relativeImage: cleanImg,
      gallery: gallery || (cleanImg ? [cleanImg] : existing[idx].gallery),
      colors: colors || existing[idx].colors,
      materials: materials !== undefined ? materials : existing[idx].materials,
      dimensions: dimensions !== undefined ? dimensions : existing[idx].dimensions,
      customizable: customizable !== undefined ? !!customizable : existing[idx].customizable,
      inStock: inStock !== undefined ? !!inStock : existing[idx].inStock,
      updatedAt: new Date().toISOString(),
    };
    updatedProduct = existing[idx];
    allProducts = existing;
  }

  syncCatalogFiles(allProducts);
  triggerAutoGitDeploy(`Update product: ${name || idParam}`);
  const vInfo = await getCatalogVersionFromDb();

  return res.json({
    success: true,
    message: "Product updated successfully! Changes are syncing with live website.",
    catalogVersion: vInfo.version,
    product: updatedProduct,
  });
});

// DELETE /api/products/admin/:id - Delete product
router.delete("/admin/:id", authenticateAdmin, async (req, res) => {
  const idParam = req.params.id;
  const numId = !isNaN(idParam) ? parseInt(idParam, 10) : 0;
  let allProducts = [];

  try {
    const [result] = await db.execute("DELETE FROM products WHERE id = ? OR product_code = ?", [numId, idParam]);
    const [allRows] = await db.execute("SELECT * FROM products ORDER BY in_stock DESC, created_at DESC");
    allProducts = allRows.map(r => formatProduct(r, req));
  } catch (err) {
    console.warn("[PRODUCT-DELETE] DB unavailable, deleting from cache store:", err.message);
    const existing = readProductsFromFileCache();
    allProducts = existing.filter(p => p.id !== idParam && p.productCode !== idParam && String(p.dbId) !== String(idParam));
  }

  syncCatalogFiles(allProducts);
  triggerAutoGitDeploy(`Delete product: ${idParam}`);
  const vInfo = await getCatalogVersionFromDb();

  return res.json({
    success: true,
    message: "Product deleted successfully. Live website is updating.",
    catalogVersion: vInfo.version,
  });
});

// POST /api/products/admin/sync-vercel - Manual sync & deploy trigger
router.post("/admin/sync-vercel", authenticateAdmin, async (req, res) => {
  try {
    let allProducts = [];
    try {
      const [allRows] = await db.execute("SELECT * FROM products ORDER BY in_stock DESC, created_at DESC");
      allProducts = allRows.map(r => formatProduct(r, req));
    } catch (e) {
      allProducts = readProductsFromFileCache();
    }

    syncCatalogFiles(allProducts);
    triggerAutoGitDeploy("Manual sync requested from Admin Panel");

    return res.json({
      success: true,
      message: "Catalog synchronized! Changes pushed to GitHub; Vercel is building the latest update.",
      totalProducts: allProducts.length,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Sync error: " + err.message });
  }
});

// Helper: format DB row to app-friendly object with dynamic host resolution
function formatProduct(row, req) {
  function cleanUrl(u) {
    if (!u || typeof u !== "string") return "";
    const trimmed = u.trim();
    const uploadMatch = trimmed.match(/\/uploads\/[^"'\s?#]+/);
    if (uploadMatch) {
      return uploadMatch[0];
    }
    return trimmed;
  }

  const rawGallery = safeJSON(row.gallery_json, []);
  let cleanedGallery = Array.isArray(rawGallery) ? rawGallery.map(cleanUrl).filter(Boolean) : [];
  const cleanedImage = cleanUrl(row.image_url) || (cleanedGallery[0] || "");
  if (cleanedImage && !cleanedGallery.includes(cleanedImage)) {
    cleanedGallery = [cleanedImage, ...cleanedGallery];
  }

  return {
    id: row.product_code || String(row.id),
    dbId: row.id,
    productCode: row.product_code,
    name: row.name,
    category: row.category,
    price: parseFloat(row.price),
    originalPrice: row.original_price ? parseFloat(row.original_price) : null,
    rating: parseFloat(row.rating || 5.0),
    reviewsCount: row.reviews_count || 0,
    badge: row.badge,
    shortDescription: row.short_desc || "",
    fullDescription: row.full_desc || "",
    image: cleanedImage,
    relativeImage: (row.image_url && row.image_url.includes('/uploads/')) ? (row.image_url.match(/\/uploads\/[^"'\s?#]+/)?.[0] || row.image_url) : (row.image_url || ""),
    gallery: cleanedGallery.length > 0 ? cleanedGallery : (cleanedImage ? [cleanedImage] : []),
    colors: safeJSON(row.colors_json, ["Pink", "White"]),
    materials: row.materials || "",
    dimensions: row.dimensions || "",
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
