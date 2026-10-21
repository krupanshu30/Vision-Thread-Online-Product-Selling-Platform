// routes/orders.js - Orders + checkout + custom orders + contact + dashboard
const express = require("express");
const { body, validationResult } = require("express-validator");
const db = require("../config/database");
const { authenticateAdmin } = require("../middleware/auth");

const router = express.Router();

// ======================================================
// PUBLIC: Submit checkout order
// ======================================================
router.post(["/", "/orders"], [
  body().custom((value, { req }) => {
    const name = (req.body.customerName || req.body.name || "").trim();
    if (!name) throw new Error("Customer name required");
    const mobile = (req.body.customerMobile || req.body.phone || req.body.customerPhone || "").trim().replace(/\D/g, "");
    if (!mobile || mobile.length < 10) throw new Error("Valid 10-digit phone number required");
    const address = (req.body.address || req.body.fullAddress || "").trim();
    if (!address) throw new Error("Full address required");
    const pincode = (req.body.pincode || req.body.pinCode || req.body.pin || "").trim();
    if (!pincode || !/^\d{6}$/.test(pincode)) throw new Error("Valid 6-digit PIN code required");
    const items = req.body.items;
    if (!Array.isArray(items) || items.length === 0) throw new Error("Order must have at least one product");
    return true;
  }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });

  const customerName = (req.body.customerName || req.body.name || "").trim();
  const rawMobile = (req.body.customerMobile || req.body.phone || req.body.customerPhone || "").trim();
  const cleanMobile = rawMobile.replace(/\D/g, "");
  const customerMobile = cleanMobile.length >= 10 ? cleanMobile.slice(-10) : rawMobile.slice(0, 20);
  const address = (req.body.address || req.body.fullAddress || "").trim();
  const pincode = (req.body.pincode || req.body.pinCode || req.body.pin || "").trim();
  const customerEmail = (req.body.customerEmail || req.body.email || "").trim() || null;
  const city = (req.body.city || "").trim();
  const state = (req.body.state || "").trim();
  const paymentMethod = (req.body.paymentMethod || "Instagram DM").trim();
  const { subtotal, deliveryCharge, discount, grandTotal, couponCode, items, notes } = req.body;

  const orderId = (req.body.orderId && typeof req.body.orderId === "string" && req.body.orderId.trim())
    ? req.body.orderId.trim()
    : "#VT-" + Math.floor(10000 + Math.random() * 90000);

  try {
    await db.execute(
      `INSERT INTO orders (order_id, customer_name, customer_mobile, customer_email, address, city, state, pincode, payment_method, subtotal, delivery_charge, discount, grand_total, coupon_code, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId, customerName, customerMobile, customerEmail || null, address, city, state || "", pincode,
        paymentMethod || "", parseFloat(subtotal) || 0, parseFloat(deliveryCharge) || 0,
        parseFloat(discount) || 0, parseFloat(grandTotal) || 0, couponCode || null, notes || null
      ]
    );

    // Insert order items
    for (const item of items) {
      await db.execute(
        "INSERT INTO order_items (order_id, product_code, product_name, category, price, quantity, color, custom_note, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [orderId, item.productCode || null, item.name, item.category || "", parseFloat(item.price), parseInt(item.quantity), item.color || "", item.customNote || null, item.image || ""]
      );
    }

    // Update coupon usage if any
    if (couponCode) {
      await db.execute("UPDATE coupons SET used_count = used_count + 1 WHERE code = ? AND is_active = 1", [couponCode]);
    }

    return res.status(201).json({ success: true, message: "Order placed!", orderId });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      // Order with this ID already registered in MySQL (e.g. offline re-sync)
      return res.status(200).json({ success: true, message: "Order already registered in system.", orderId });
    }
    console.error("[ORDERS] Error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to save order. Try again." });
  }
});

// ======================================================
// PUBLIC: Submit Instagram DM order (saves to DB + shows in Admin Panel)
// ======================================================
router.post("/instagram-order", [
  body().custom((value, { req }) => {
    const name = (req.body.customerName || req.body.name || "").trim();
    if (!name) throw new Error("Customer name required");
    const mobile = (req.body.customerMobile || req.body.phone || req.body.customerPhone || "").trim().replace(/\D/g, "");
    if (!mobile || mobile.length < 10) throw new Error("Valid 10-digit phone number required");
    const address = (req.body.address || req.body.fullAddress || "").trim();
    if (!address) throw new Error("Full address required");
    const pincode = (req.body.pincode || req.body.pinCode || req.body.pin || "").trim();
    if (!pincode || !/^\d{6}$/.test(pincode)) throw new Error("Valid 6-digit PIN code required");
    const items = req.body.items;
    if (!Array.isArray(items) || items.length === 0) throw new Error("Order must have at least one product");
    return true;
  }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });

  const customerName = (req.body.customerName || req.body.name || "").trim();
  const rawMobile = (req.body.customerMobile || req.body.phone || req.body.customerPhone || "").trim();
  const cleanMobile = rawMobile.replace(/\D/g, "");
  const customerMobile = cleanMobile.length >= 10 ? cleanMobile.slice(-10) : rawMobile.slice(0, 20);
  const address = (req.body.address || req.body.fullAddress || "").trim();
  const pincode = (req.body.pincode || req.body.pinCode || req.body.pin || "").trim();
  const customerEmail = (req.body.customerEmail || req.body.email || "").trim() || null;
  const city = (req.body.city || "").trim();
  const state = (req.body.state || "").trim();
  const { subtotal, deliveryCharge, discount, grandTotal, couponCode, items, notes } = req.body;

  const orderId = (req.body.orderId && typeof req.body.orderId === "string" && req.body.orderId.trim())
    ? req.body.orderId.trim()
    : "#VT-" + Math.floor(10000 + Math.random() * 90000);

  try {
    await db.execute(
      `INSERT INTO orders (order_id, customer_name, customer_mobile, customer_email, address, city, state, pincode, payment_method, subtotal, delivery_charge, discount, grand_total, coupon_code, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId, customerName, customerMobile, customerEmail || null, address, city, state || "", pincode,
        "Instagram DM (@vision_thread00)",
        parseFloat(subtotal) || 0, 0,
        parseFloat(discount) || 0, parseFloat(grandTotal || subtotal) || 0,
        couponCode || null,
        notes || null
      ]
    );

    // Insert order items
    for (const item of items) {
      await db.execute(
        "INSERT INTO order_items (order_id, product_code, product_name, category, price, quantity, color, custom_note, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [orderId, item.productCode || null, item.name, item.category || "", parseFloat(item.price), parseInt(item.quantity), item.color || "", item.customNote || null, item.image || ""]
      );
    }

    return res.status(201).json({ success: true, message: "Instagram order saved!", orderId });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(200).json({ success: true, message: "Order already registered in system.", orderId });
    }
    console.error("[INSTAGRAM-ORDER] Error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to save Instagram order. Try again." });
  }
});


// ======================================================
// PUBLIC: Validate coupon code
// ======================================================
router.post("/validate-coupon", async (req, res) => {
  const { code, subtotal } = req.body;
  if (!code) return res.status(400).json({ success: false, message: "Coupon code required." });

  try {
    const [rows] = await db.execute(
      "SELECT * FROM coupons WHERE code = ? AND is_active = 1 AND (expires_at IS NULL OR expires_at > NOW()) AND (max_uses IS NULL OR used_count < max_uses)",
      [code.toUpperCase()]
    );

    if (rows.length === 0) return res.status(404).json({ success: false, message: "Invalid or expired coupon code." });

    const coupon = rows[0];
    if (parseFloat(subtotal) < parseFloat(coupon.min_order)) {
      return res.status(400).json({ success: false, message: `Minimum order ₹${coupon.min_order} required for this coupon.` });
    }

    let discountAmount = 0;
    if (coupon.discount_type === "percentage") {
      discountAmount = (parseFloat(subtotal) * parseFloat(coupon.discount_value)) / 100;
    } else {
      discountAmount = parseFloat(coupon.discount_value);
    }

    return res.json({ success: true, discount: discountAmount, type: coupon.discount_type, value: coupon.discount_value, message: `Coupon applied! You saved ₹${discountAmount.toFixed(2)}` });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// ======================================================
// PUBLIC: Submit custom order form
// ======================================================
router.post("/custom", [
  body("customerName").trim().notEmpty().withMessage("Name required"),
  body("mobile").notEmpty().withMessage("Mobile number required"),
  body("productType").notEmpty().withMessage("Product type required"),
  body("requirements").trim().notEmpty().withMessage("Requirements description required"),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });

  const { customerName, mobile, productType, preferredColor, quantity, requirements, imageRefUrl } = req.body;
  const orderRef = "CUST-" + Date.now().toString(36).toUpperCase();

  try {
    await db.execute(
      "INSERT INTO custom_orders (order_ref, customer_name, mobile, product_type, preferred_color, quantity, requirements, image_ref_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [orderRef, customerName, mobile, productType, preferredColor || "", parseInt(quantity) || 1, requirements, imageRefUrl || null]
    );
    return res.status(201).json({ success: true, message: "Custom order submitted!", orderRef });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to submit custom order." });
  }
});

// ======================================================
// PUBLIC: Submit contact form
// ======================================================
router.post("/contact", [
  body("name").trim().notEmpty().withMessage("Name required"),
  body("mobile").notEmpty().withMessage("Mobile required"),
  body("message").trim().isLength({ min: 5 }).withMessage("Message too short"),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });

  const { name, mobile, message } = req.body;
  try {
    await db.execute("INSERT INTO contact_messages (name, mobile, message) VALUES (?, ?, ?)", [name, mobile, message]);
    return res.status(201).json({ success: true, message: "Message sent! We will reply soon." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to send message." });
  }
});

// ======================================================
// ADMIN: Dashboard statistics
// ======================================================
router.get("/admin/dashboard", authenticateAdmin, async (req, res) => {
  try {
    const [[orderStats]] = await db.execute("SELECT COUNT(*) as total_orders, COALESCE(SUM(grand_total),0) as total_revenue FROM orders WHERE status != 'cancelled'");
    const [[productStats]] = await db.execute("SELECT COUNT(*) as total_products, COALESCE(SUM(in_stock=1), 0) as in_stock_count FROM products");
    const [[customOrderStats]] = await db.execute("SELECT COUNT(*) as total_custom, COALESCE(SUM(status='new'), 0) as new_custom FROM custom_orders");
    const [[messageStats]] = await db.execute("SELECT COUNT(*) as total_messages, COALESCE(SUM(is_read=0), 0) as unread_messages FROM contact_messages");
    const [[pendingOrders]] = await db.execute("SELECT COUNT(*) as pending_orders FROM orders WHERE status = 'pending'");

    // Recent orders
    const [recentOrders] = await db.execute(
      "SELECT order_id, customer_name, customer_mobile, grand_total, payment_method, status, created_at FROM orders ORDER BY created_at DESC LIMIT 10"
    );

    // Revenue by day (last 7 days)
    const [revenueChart] = await db.execute(
      "SELECT DATE(created_at) as date, COUNT(*) as count, COALESCE(SUM(grand_total),0) as revenue FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND status != 'cancelled' GROUP BY DATE(created_at) ORDER BY date"
    );

    // Category sales
    const [categorySales] = await db.execute(
      "SELECT oi.category, COUNT(*) as count, SUM(oi.price * oi.quantity) as revenue FROM order_items oi JOIN orders o ON oi.order_id = o.order_id WHERE o.status != 'cancelled' GROUP BY oi.category ORDER BY revenue DESC LIMIT 8"
    );

    return res.json({
      success: true,
      stats: {
        totalOrders: orderStats.total_orders,
        totalRevenue: parseFloat(orderStats.total_revenue).toFixed(2),
        totalProducts: productStats.total_products,
        inStockProducts: productStats.in_stock_count,
        totalCustomOrders: customOrderStats.total_custom,
        newCustomOrders: customOrderStats.new_custom,
        totalMessages: messageStats.total_messages,
        unreadMessages: messageStats.unread_messages,
        pendingOrders: pendingOrders.pending_orders,
      },
      recentOrders,
      revenueChart,
      categorySales,
    });
  } catch (err) {
    console.error("[DASHBOARD]", err.message);
    return res.status(500).json({ success: false, message: "Error fetching dashboard data." });
  }
});

// ======================================================
// ADMIN: Orders CRUD
// ======================================================
router.get("/admin/orders", authenticateAdmin, async (req, res) => {
  try {
    const { search, status, page = 1, limit = 15 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let sql = "SELECT * FROM orders WHERE 1=1";
    let countSql = "SELECT COUNT(*) as total FROM orders WHERE 1=1";
    const params = [];
    const countParams = [];
    if (search) {
      const condition = " AND (order_id LIKE ? OR customer_name LIKE ? OR customer_mobile LIKE ?)";
      const q = "%" + search + "%";
      sql += condition;
      countSql += condition;
      params.push(q, q, q);
      countParams.push(q, q, q);
    }
    if (status) {
      sql += " AND status = ?";
      countSql += " AND status = ?";
      params.push(status);
      countParams.push(status);
    }
    sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), offset);
    const [[countRow]] = await db.execute(countSql, countParams);
    const [rows] = await db.execute(sql, params);
    return res.json({ success: true, orders: rows, total: countRow.total, page: parseInt(page), pages: Math.ceil(countRow.total / parseInt(limit)) });
  } catch (err) { return res.status(500).json({ success: false, message: "Error fetching orders." }); }
});

router.get("/admin/orders/:orderId", authenticateAdmin, async (req, res) => {
  try {
    const rawId = req.params.orderId;
    const withHash = rawId.startsWith("#") ? rawId : "#" + rawId;
    const withoutHash = rawId.replace(/^#/, "");
    const [orders] = await db.execute("SELECT * FROM orders WHERE order_id = ? OR order_id = ? OR order_id = ?", [rawId, withHash, withoutHash]);
    if (orders.length === 0) return res.status(404).json({ success: false, message: "Order not found." });
    const order = orders[0];
    const [items] = await db.execute("SELECT * FROM order_items WHERE order_id = ?", [order.order_id]);
    return res.json({ success: true, order: { ...order, items } });
  } catch (err) { return res.status(500).json({ success: false, message: "Server error." }); }
});

router.put("/admin/orders/:orderId", authenticateAdmin, async (req, res) => {
  const { status, adminNotes } = req.body;
  const rawId = req.params.orderId;
  const withHash = rawId.startsWith("#") ? rawId : "#" + rawId;
  const withoutHash = rawId.replace(/^#/, "");
  try {
    await db.execute("UPDATE orders SET status = ?, admin_notes = ?, updated_at = NOW() WHERE order_id = ? OR order_id = ? OR order_id = ?", [status, adminNotes || "", rawId, withHash, withoutHash]);
    return res.json({ success: true, message: "Order updated!" });
  } catch (err) { return res.status(500).json({ success: false, message: "Server error." }); }
});

router.delete("/admin/orders/:orderId", authenticateAdmin, async (req, res) => {
  const rawId = req.params.orderId;
  const withHash = rawId.startsWith("#") ? rawId : "#" + rawId;
  const withoutHash = rawId.replace(/^#/, "");
  try {
    const [result] = await db.execute("DELETE FROM orders WHERE order_id = ? OR order_id = ? OR order_id = ?", [rawId, withHash, withoutHash]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Order not found." });
    return res.json({ success: true, message: "Order deleted." });
  } catch (err) { return res.status(500).json({ success: false, message: "Server error." }); }
});

// ======================================================
// ADMIN: Custom Orders CRUD
// ======================================================
router.get("/admin/custom-orders", authenticateAdmin, async (req, res) => {
  try {
    const { search, status, page = 1, limit = 15 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let sql = "SELECT * FROM custom_orders WHERE 1=1";
    const params = [];
    if (search) { sql += " AND (customer_name LIKE ? OR mobile LIKE ? OR order_ref LIKE ?)"; const q="%" + search + "%"; params.push(q,q,q); }
    if (status) { sql += " AND status = ?"; params.push(status); }
    sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), offset);
    const [[countRow]] = await db.execute("SELECT COUNT(*) as total FROM custom_orders");
    const [rows] = await db.execute(sql, params);
    return res.json({ success: true, orders: rows, total: countRow.total });
  } catch (err) { return res.status(500).json({ success: false, message: "Server error." }); }
});

router.put("/admin/custom-orders/:id", authenticateAdmin, async (req, res) => {
  const { status, adminNotes } = req.body;
  try {
    await db.execute("UPDATE custom_orders SET status = ?, admin_notes = ?, updated_at = NOW() WHERE id = ?", [status, adminNotes || "", req.params.id]);
    return res.json({ success: true, message: "Custom order updated!" });
  } catch (err) { return res.status(500).json({ success: false, message: "Server error." }); }
});

router.delete("/admin/custom-orders/:id", authenticateAdmin, async (req, res) => {
  try {
    await db.execute("DELETE FROM custom_orders WHERE id = ?", [req.params.id]);
    return res.json({ success: true, message: "Custom order deleted." });
  } catch (err) { return res.status(500).json({ success: false, message: "Server error." }); }
});

// ======================================================
// ADMIN: Contact Messages
// ======================================================
router.get("/admin/messages", authenticateAdmin, async (req, res) => {
  try {
    const { unread } = req.query;
    let sql = "SELECT * FROM contact_messages";
    if (unread === "true") sql += " WHERE is_read = 0";
    sql += " ORDER BY created_at DESC";
    const [rows] = await db.execute(sql);
    return res.json({ success: true, messages: rows });
  } catch (err) { return res.status(500).json({ success: false, message: "Server error." }); }
});

router.put("/admin/messages/:id/read", authenticateAdmin, async (req, res) => {
  try {
    await db.execute("UPDATE contact_messages SET is_read = 1 WHERE id = ?", [req.params.id]);
    return res.json({ success: true, message: "Marked as read." });
  } catch (err) { return res.status(500).json({ success: false, message: "Server error." }); }
});

router.delete("/admin/messages/:id", authenticateAdmin, async (req, res) => {
  try {
    await db.execute("DELETE FROM contact_messages WHERE id = ?", [req.params.id]);
    return res.json({ success: true, message: "Message deleted." });
  } catch (err) { return res.status(500).json({ success: false, message: "Server error." }); }
});

// ======================================================
// ADMIN: Coupons
// ======================================================
router.get("/admin/coupons", authenticateAdmin, async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM coupons ORDER BY created_at DESC");
    return res.json({ success: true, coupons: rows });
  } catch (err) { return res.status(500).json({ success: false, message: "Server error." }); }
});

router.post("/admin/coupons", authenticateAdmin, [
  body("code").trim().notEmpty().withMessage("Coupon code required"),
  body("discountValue").isNumeric().withMessage("Discount value required"),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });

  const { code, discountType, discountValue, minOrder, maxUses, expiresAt } = req.body;
  try {
    await db.execute(
      "INSERT INTO coupons (code, discount_type, discount_value, min_order, max_uses, expires_at) VALUES (?, ?, ?, ?, ?, ?)",
      [code.toUpperCase(), discountType || "percentage", parseFloat(discountValue), parseFloat(minOrder) || 0, maxUses ? parseInt(maxUses) : null, expiresAt || null]
    );
    return res.status(201).json({ success: true, message: "Coupon created!" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") return res.status(400).json({ success: false, message: "Coupon code already exists." });
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

router.put("/admin/coupons/:id", authenticateAdmin, async (req, res) => {
  const { isActive, discountValue, minOrder, maxUses, expiresAt } = req.body;
  try {
    await db.execute(
      "UPDATE coupons SET is_active = ?, discount_value = ?, min_order = ?, max_uses = ?, expires_at = ? WHERE id = ?",
      [isActive ? 1 : 0, parseFloat(discountValue), parseFloat(minOrder) || 0, maxUses ? parseInt(maxUses) : null, expiresAt || null, req.params.id]
    );
    return res.json({ success: true, message: "Coupon updated!" });
  } catch (err) { return res.status(500).json({ success: false, message: "Server error." }); }
});

router.delete("/admin/coupons/:id", authenticateAdmin, async (req, res) => {
  try {
    await db.execute("DELETE FROM coupons WHERE id = ?", [req.params.id]);
    return res.json({ success: true, message: "Coupon deleted." });
  } catch (err) { return res.status(500).json({ success: false, message: "Server error." }); }
});

// ======================================================
// ADMIN: Website Customers / Users Management
// ======================================================
router.get("/admin/customers", authenticateAdmin, async (req, res) => {
  try {
    const { search } = req.query;
    let sql = `
      SELECT 
        customer_mobile,
        MAX(customer_name) AS customer_name,
        MAX(customer_email) AS customer_email,
        MAX(city) AS city,
        MAX(state) AS state,
        COUNT(id) AS total_orders,
        COALESCE(SUM(grand_total), 0) AS total_spent,
        MAX(created_at) AS last_order_date
      FROM orders
      WHERE 1=1
    `;
    const params = [];
    if (search) {
      sql += " AND (customer_name LIKE ? OR customer_mobile LIKE ? OR customer_email LIKE ? OR city LIKE ?)";
      const q = "%" + search + "%";
      params.push(q, q, q, q);
    }
    sql += " GROUP BY customer_mobile ORDER BY last_order_date DESC";
    const [customers] = await db.execute(sql, params);

    // Also get admin user list
    const [admins] = await db.execute(
      "SELECT id, email, username, full_name, role, is_active, last_login, created_at FROM admin_users ORDER BY id ASC"
    );

    return res.json({ success: true, customers, admins });
  } catch (err) {
    console.error("[CUSTOMERS] Error:", err.message);
    return res.status(500).json({ success: false, message: "Error fetching customer data." });
  }
});

module.exports = router;
