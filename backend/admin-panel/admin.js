// ============================================================
// Vision Thread Admin Panel - JavaScript
// @vision_thread00
// ============================================================

const API = (function() {
  if (typeof window === "undefined" || !window.location) return "http://localhost:5000/api";
  const proto = window.location.protocol;
  const host = window.location.hostname;
  const port = window.location.port;

  if (proto === "file:") return "http://localhost:5000/api";
  if (port === "5000") return "/api";
  if (host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0") return `${proto}//${host}:5000/api`;
  if (/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(host)) return `${proto}//${host}:5000/api`;
  return "/api";
})();
let authToken = localStorage.getItem("vt_admin_token") || "";
let currentPage = { orders: 1, products: 1 };
let searchTimers = {};

// ==================== AUTH ====================
async function apiCall(method, path, data = null, showErr = true) {
  try {
    const opts = {
      method,
      headers: { "Content-Type": "application/json", ...(authToken ? { Authorization: "Bearer " + authToken } : {}) },
      ...(window.location.protocol.startsWith("http") ? { credentials: "include" } : {}),
    };
    if (data) opts.body = JSON.stringify(data);
    const res = await fetch(API + path, opts);
    const json = await res.json();
    if (!res.ok && showErr) showToast(json.message || "Error occurred", "error");
    return { ok: res.ok, data: json, status: res.status };
  } catch (err) {
    if (showErr) showToast("Network error. Is the server running? Run start_backend.bat", "error");
    return { ok: false, data: null, status: 0 };
  }
}

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = document.getElementById("loginBtn");
  const errEl = document.getElementById("loginError");
  errEl.classList.add("hidden");
  btn.disabled = true;
  btn.querySelector("span").textContent = "Signing in...";

  const identifierInput = document.getElementById("loginIdentifier") || document.getElementById("loginEmail");
  const identifier = identifierInput ? identifierInput.value.trim() : "";
  const password = document.getElementById("loginPassword").value;

  const { ok, data } = await apiCall("POST", "/admin/login", {
    identifier,
    email: identifier,
    password,
  }, false);

  if (ok && data && data.success) {
    authToken = data.token;
    localStorage.setItem("vt_admin_token", authToken);
    showAdminApp(data.admin);
  } else {
    if (!data) {
      errEl.textContent = "❌ Cannot reach backend server. Please double-click 'start_backend.bat' and keep it open!";
    } else {
      errEl.textContent = (data && data.message) || "Login failed. Check your credentials.";
    }
    errEl.classList.remove("hidden");
    btn.disabled = false;
    btn.querySelector("span").textContent = "Sign In to Admin Panel";
  }
});

async function checkAuth() {
  if (!authToken) return showLoginPage();
  const { ok, data } = await apiCall("GET", "/admin/me", null, false);
  if (ok && data.success) showAdminApp(data.admin);
  else { authToken = ""; localStorage.removeItem("vt_admin_token"); showLoginPage(); }
}

function showLoginPage() {
  document.getElementById("loginPage").classList.remove("hidden");
  document.getElementById("adminApp").classList.add("hidden");
}

function showAdminApp(admin) {
  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("adminApp").classList.remove("hidden");
  document.getElementById("adminInfo").innerHTML = `<strong style="color:white">${admin.full_name || admin.username}</strong><br>${admin.email}`;
  loadDashboard();
  updateClock();
  setInterval(updateClock, 1000);
}

async function logout() {
  await apiCall("POST", "/admin/logout", null, false);
  authToken = "";
  localStorage.removeItem("vt_admin_token");
  showToast("Logged out successfully.", "success");
  setTimeout(() => location.reload(), 1000);
}

function togglePassword() {
  const inp = document.getElementById("loginPassword");
  inp.type = inp.type === "password" ? "text" : "password";
}

// ==================== NAVIGATION ====================
function showSection(name) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  document.getElementById("section-" + name)?.classList.add("active");
  document.querySelector("[data-section='" + name + "']")?.classList.add("active");
  document.getElementById("pageTitle").textContent = {
    dashboard: "Dashboard", orders: "Orders", "custom-orders": "Custom Orders",
    products: "Products", messages: "Messages", coupons: "Coupons",
    customers: "Customers & Website Users", settings: "Settings"
  }[name] || name;

  const loaders = {
    dashboard: loadDashboard,
    orders: loadOrders,
    "custom-orders": loadCustomOrders,
    products: loadProducts,
    messages: loadMessages,
    coupons: loadCoupons,
    customers: loadCustomers
  };
  if (loaders[name]) loaders[name]();

  if (window.innerWidth < 768) closeSidebar();
  return false;
}

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
}
function closeSidebar() {
  document.getElementById("sidebar").classList.remove("open");
}
function updateClock() {
  document.getElementById("currentTime").textContent = new Date().toLocaleTimeString("en-IN", { hour12: true });
}

// ==================== DASHBOARD ====================
async function loadDashboard() {
  const { ok, data } = await apiCall("GET", "/admin/dashboard");
  if (!ok) return;
  const s = data.stats;

  document.getElementById("statOrders").textContent = s.totalOrders;
  document.getElementById("statRevenue").textContent = "₹" + parseFloat(s.totalRevenue).toLocaleString("en-IN");
  document.getElementById("statProducts").textContent = s.totalProducts;
  document.getElementById("statCustom").textContent = s.totalCustomOrders;
  document.getElementById("statPending").textContent = s.pendingOrders;
  document.getElementById("statMessages").textContent = s.unreadMessages;

  // Update badges
  const pendingBadge = document.getElementById("pendingBadge");
  const customBadge = document.getElementById("customBadge");
  const msgBadge = document.getElementById("msgBadge");
  if (s.pendingOrders > 0) { pendingBadge.textContent = s.pendingOrders; pendingBadge.classList.remove("hidden"); } else pendingBadge.classList.add("hidden");
  if (s.newCustomOrders > 0) { customBadge.textContent = s.newCustomOrders; customBadge.classList.remove("hidden"); } else customBadge.classList.add("hidden");
  if (s.unreadMessages > 0) { msgBadge.textContent = s.unreadMessages; msgBadge.classList.remove("hidden"); } else msgBadge.classList.add("hidden");

  // Recent orders
  const tbody = document.getElementById("recentOrdersBody");
  if (data.recentOrders && data.recentOrders.length > 0) {
    tbody.innerHTML = data.recentOrders.map(o => `
      <tr>
        <td><strong>${o.order_id}</strong></td>
        <td>${e(o.customer_name)}</td>
        <td>${e(o.customer_mobile)}</td>
        <td><strong>₹${parseFloat(o.grand_total).toLocaleString("en-IN")}</strong></td>
        <td>${paymentBadge(o.payment_method)}</td>
        <td>${statusBadge(o.status)}</td>
        <td>${fmtDate(o.created_at)}</td>
        <td>
          <div class="action-btns">
            <button class="btn-icon btn-icon-view" onclick="viewOrder('${o.order_id}')" title="View Order Details">👁</button>
          </div>
        </td>
      </tr>`).join("");
  } else {
    tbody.innerHTML = `<tr><td colspan="8" class="empty-row">No orders yet. Place your first order on the website!</td></tr>`;
  }
}

// ==================== ORDERS ====================
let ordersData = [];
async function loadOrders(page = 1) {
  currentPage.orders = page;
  const search = document.getElementById("orderSearch")?.value || "";
  const status = document.getElementById("orderStatusFilter")?.value || "";
  const { ok, data } = await apiCall("GET", `/admin/orders?page=${page}&limit=15&search=${encodeURIComponent(search)}&status=${status}`);
  if (!ok) return;
  ordersData = data.orders || [];
  renderOrdersTable(ordersData);
  renderPagination("ordersPagination", data.page, data.pages, loadOrders);
}

function renderOrdersTable(orders) {
  const tbody = document.getElementById("ordersBody");
  if (!orders.length) { tbody.innerHTML = `<tr><td colspan="8" class="empty-row">No orders found.</td></tr>`; return; }
  tbody.innerHTML = orders.map(o => `
    <tr>
      <td><strong>${o.order_id}</strong></td>
      <td>${e(o.customer_name)}</td>
      <td>${e(o.customer_mobile)}</td>
      <td>₹${parseFloat(o.grand_total).toLocaleString("en-IN")}</td>
      <td>${paymentBadge(o.payment_method)}</td>
      <td>${statusBadge(o.status)}</td>
      <td>${fmtDate(o.created_at)}</td>
      <td>
        <div class="action-btns">
          <button class="btn-icon btn-icon-view" onclick="viewOrder('${o.order_id}')" title="View">👁</button>
          <button class="btn-icon btn-icon-delete" onclick="deleteOrder('${o.order_id}')" title="Delete">🗑</button>
        </div>
      </td>
    </tr>`).join("");
}

function searchOrders(val) {
  clearTimeout(searchTimers.orders);
  searchTimers.orders = setTimeout(() => loadOrders(1), 400);
}
function filterOrdersByStatus(val) { loadOrders(1); }

async function viewOrder(orderId) {
  const { ok, data } = await apiCall("GET", "/admin/orders/" + encodeURIComponent(orderId));
  if (!ok) return;
  const o = data.order;
  const modal = document.getElementById("orderDetailModal");
  document.getElementById("orderDetailContent").innerHTML = `
    <div class="detail-section">
      <div class="detail-grid">
        <div class="detail-item"><span>Order ID</span><strong>${o.order_id}</strong></div>
        <div class="detail-item"><span>Date</span><strong>${fmtDate(o.created_at)}</strong></div>
        <div class="detail-item"><span>Customer</span><strong>${e(o.customer_name)}</strong></div>
        <div class="detail-item"><span>Mobile</span><strong>${e(o.customer_mobile)}</strong></div>
        <div class="detail-item"><span>Email</span><strong>${e(o.customer_email || "-")}</strong></div>
        <div class="detail-item"><span>Payment</span><strong>${paymentBadge(o.payment_method)}</strong></div>
        <div class="detail-item"><span>Subtotal</span><strong>₹${o.subtotal}</strong></div>
        <div class="detail-item"><span>Delivery</span><strong>${parseFloat(o.delivery_charge) > 0 ? '₹' + o.delivery_charge : '₹0'}</strong></div>
        <div class="detail-item"><span>Discount</span><strong>-₹${o.discount}</strong></div>
        <div class="detail-item"><span>Grand Total</span><strong style="color:var(--blue-primary)">₹${o.grand_total}</strong></div>
        <div class="detail-item" style="grid-column:1/-1"><span>Address</span><strong>${e(o.address)}, ${e(o.city)}, ${e(o.state)} - ${e(o.pincode)}</strong></div>
      </div>
      <div class="detail-label">Order Items</div>
      <table class="data-table" style="margin-bottom:1rem">
        <thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Color</th><th>Total</th></tr></thead>
        <tbody>${(o.items || []).map(i => `<tr><td>${e(i.product_name)}</td><td>₹${i.price}</td><td>${i.quantity}</td><td>${e(i.color || "-")}</td><td>₹${(i.price * i.quantity).toFixed(2)}</td></tr>`).join("") || "<tr><td colspan='5' class='empty-row'>No items</td></tr>"}</tbody>
      </table>
      <div class="detail-label">Update Status</div>
      <div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap">
        <select class="status-select" id="orderStatusUpdate">
          ${["pending","confirmed","processing","completed","shipped","delivered","cancelled","refunded"].map(s => `<option value="${s}" ${o.status===s?"selected":""}>${s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join("")}
        </select>
        <input type="text" class="notes-input search-input" id="orderNotesUpdate" placeholder="Admin notes..." value="${e(o.admin_notes || "")}" style="flex:1;min-width:160px" />
        <button class="btn btn-primary btn-sm" onclick="updateOrderStatus('${o.order_id}')">Save</button>
      </div>
    </div>`;
  modal.classList.remove("hidden");
}

async function updateOrderStatus(orderId) {
  const status = document.getElementById("orderStatusUpdate").value;
  const adminNotes = document.getElementById("orderNotesUpdate").value;
  const { ok } = await apiCall("PUT", "/admin/orders/" + encodeURIComponent(orderId), { status, adminNotes });
  if (ok) { showToast("Order updated!", "success"); closeOrderModal(); loadOrders(currentPage.orders); }
}

async function deleteOrder(orderId) {
  if (!confirm("Delete order " + orderId + "? This cannot be undone.")) return;
  const { ok } = await apiCall("DELETE", "/admin/orders/" + encodeURIComponent(orderId));
  if (ok) { showToast("Order deleted.", "success"); loadOrders(currentPage.orders); }
}

function closeOrderModal() { document.getElementById("orderDetailModal").classList.add("hidden"); }

// ==================== CUSTOM ORDERS ====================
async function loadCustomOrders() {
  const search = document.getElementById("customSearch")?.value || "";
  const status = document.getElementById("customStatusFilter")?.value || "";
  const { ok, data } = await apiCall("GET", `/admin/custom-orders?search=${encodeURIComponent(search)}&status=${status}`);
  if (!ok) return;
  const orders = data.orders || [];
  const tbody = document.getElementById("customOrdersBody");
  if (!orders.length) { tbody.innerHTML = `<tr><td colspan="8" class="empty-row">No custom orders found.</td></tr>`; return; }
  tbody.innerHTML = orders.map(o => `
    <tr>
      <td><strong>${o.order_ref}</strong></td>
      <td>${e(o.customer_name)}</td>
      <td>${e(o.mobile)}</td>
      <td>${e(o.product_type)}</td>
      <td>${o.quantity}</td>
      <td>${customStatusBadge(o.status)}</td>
      <td>${fmtDate(o.created_at)}</td>
      <td>
        <div class="action-btns">
          <button class="btn-icon btn-icon-view" onclick="viewCustomOrder(${o.id})" title="View">👁</button>
          <button class="btn-icon btn-icon-delete" onclick="deleteCustomOrder(${o.id})" title="Delete">🗑</button>
        </div>
      </td>
    </tr>`).join("");
}

function searchCustomOrders(v) { clearTimeout(searchTimers.custom); searchTimers.custom = setTimeout(loadCustomOrders, 400); }
function filterCustomOrders(v) { loadCustomOrders(); }

async function viewCustomOrder(id) {
  // Find from loaded data or fetch
  const { ok, data } = await apiCall("GET", "/admin/custom-orders?limit=999");
  if (!ok) return;
  const o = (data.orders || []).find(x => x.id === id);
  if (!o) return;
  const modal = document.getElementById("customDetailModal");
  document.getElementById("customDetailContent").innerHTML = `
    <div class="detail-section">
      <div class="detail-grid">
        <div class="detail-item"><span>Ref</span><strong>${o.order_ref}</strong></div>
        <div class="detail-item"><span>Date</span><strong>${fmtDate(o.created_at)}</strong></div>
        <div class="detail-item"><span>Customer</span><strong>${e(o.customer_name)}</strong></div>
        <div class="detail-item"><span>Mobile (WhatsApp)</span><strong>${e(o.mobile)}</strong></div>
        <div class="detail-item"><span>Product Type</span><strong>${e(o.product_type)}</strong></div>
        <div class="detail-item"><span>Quantity</span><strong>${o.quantity}</strong></div>
        <div class="detail-item"><span>Preferred Color</span><strong>${e(o.preferred_color || "-")}</strong></div>
        <div class="detail-item"><span>Status</span><strong>${customStatusBadge(o.status)}</strong></div>
        <div class="detail-item" style="grid-column:1/-1"><span>Requirements</span><strong>${e(o.requirements)}</strong></div>
      </div>
      <div class="detail-label">Update Status</div>
      <div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap">
        <select class="status-select" id="custStatusUpdate">
          ${["new","in_review","approved","in_progress","completed","cancelled"].map(s => `<option value="${s}" ${o.status===s?"selected":""}>${s.replace(/_/g," ")}</option>`).join("")}
        </select>
        <input type="text" class="notes-input search-input" id="custNotesUpdate" placeholder="Admin notes..." value="${e(o.admin_notes || "")}" style="flex:1;min-width:160px" />
        <button class="btn btn-primary btn-sm" onclick="updateCustomOrder(${o.id})">Save</button>
      </div>
      <div style="margin-top:.75rem">
        <a href="https://wa.me/91${o.mobile.replace(/\D/g,'')}" target="_blank" class="btn btn-success btn-sm">💬 Chat on WhatsApp</a>
      </div>
    </div>`;
  modal.classList.remove("hidden");
}

async function updateCustomOrder(id) {
  const status = document.getElementById("custStatusUpdate").value;
  const adminNotes = document.getElementById("custNotesUpdate").value;
  const { ok } = await apiCall("PUT", "/admin/custom-orders/" + id, { status, adminNotes });
  if (ok) { showToast("Custom order updated!", "success"); closeCustomModal(); loadCustomOrders(); }
}

async function deleteCustomOrder(id) {
  if (!confirm("Delete this custom order?")) return;
  const { ok } = await apiCall("DELETE", "/admin/custom-orders/" + id);
  if (ok) { showToast("Deleted.", "success"); loadCustomOrders(); }
}
function closeCustomModal() { document.getElementById("customDetailModal").classList.add("hidden"); }

// ==================== PRODUCTS ====================
async function loadProducts(page = 1) {
  currentPage.products = page;
  const search = document.getElementById("productSearch")?.value || "";
  const { ok, data } = await apiCall("GET", `/products/admin/all?page=${page}&limit=15&search=${encodeURIComponent(search)}`);
  if (!ok) return;
  const products = data.products || [];
  const tbody = document.getElementById("productsBody");
  if (!products.length) { tbody.innerHTML = `<tr><td colspan="8" class="empty-row">No products found.</td></tr>`; return; }
  tbody.innerHTML = products.map(p => {
    const safeName = (p.name || "").replace(/'/g, "\\'");
    const encImg = encodeURIComponent(p.image || "");
    const prodId = p.dbId || p.id;
    return `
    <tr>
      <td>
        <div class="product-thumb-container" onclick="openQuickImageModal('${prodId}', '${safeName}', '${encImg}')" title="Click to Change Image">
          ${p.image ? `<img src="${p.image}" class="product-thumb" onerror="this.src='';this.alt='🌸'">` : `<div class="product-thumb-placeholder">🌸</div>`}
          <div class="thumb-overlay">Change</div>
        </div>
      </td>
      <td>
        <strong class="product-name-link" onclick="editProduct('${prodId}')" title="Click to Update Details">${e(p.name)}</strong>
        <br><small style="color:var(--text-light)">${p.productCode || p.id}</small>
      </td>
      <td>${e(p.category)}</td>
      <td><strong>₹${p.price}</strong></td>
      <td>${p.originalPrice ? "₹" + p.originalPrice : "-"}</td>
      <td>${p.inStock ? `<span class="badge badge-green">In Stock</span>` : `<span class="badge badge-red">Out of Stock</span>`}</td>
      <td>${p.badge ? `<span class="badge badge-pink">${e(p.badge)}</span>` : "-"}</td>
      <td>
        <div class="action-btns">
          <button class="btn-action-edit" onclick="editProduct('${prodId}')" title="Update / Edit Product Details">✏️ Update</button>
          <button class="btn-icon btn-icon-img" onclick="openQuickImageModal('${prodId}', '${safeName}', '${encImg}')" title="Change Image">🖼️</button>
          <button class="btn-icon btn-icon-delete" onclick="deleteProduct('${prodId}')" title="Delete">🗑</button>
        </div>
      </td>
    </tr>`;
  }).join("");
  renderPagination("productsPagination", data.page, data.pages, loadProducts);
}

function searchProducts(v) { clearTimeout(searchTimers.products); searchTimers.products = setTimeout(() => loadProducts(1), 400); }

let productsList = [];
async function editProduct(id) {
  const { ok, data } = await apiCall("GET", "/products/admin/all?limit=999");
  if (!ok) return;
  const p = (data.products || []).find(x => (x.dbId && x.dbId == id) || x.id == id || x.productCode == id);
  if (!p) {
    showToast("Product not found", "error");
    return;
  }
  document.getElementById("productModalTitle").textContent = "Update Product: " + (p.name || "");
  document.getElementById("editProductId").value = p.dbId || p.id;
  document.getElementById("pName").value = p.name || "";
  document.getElementById("pCategory").value = p.category || "Bouquets";
  document.getElementById("pPrice").value = p.price || "";
  document.getElementById("pOriginalPrice").value = p.originalPrice || "";
  document.getElementById("pImage").value = p.image || "";
  document.getElementById("pImageUploadStatus").textContent = "";
  syncImagePreview("pImage", "pImagePreview", "pImagePreviewWrap");
  document.getElementById("pBadge").value = p.badge || "";
  document.getElementById("pShortDesc").value = p.shortDescription || "";
  document.getElementById("pFullDesc").value = p.fullDescription || "";
  document.getElementById("pMaterials").value = p.materials || "";
  document.getElementById("pDimensions").value = p.dimensions || "";
  document.getElementById("pCustomizable").checked = p.customizable !== false;
  document.getElementById("pInStock").checked = p.inStock !== false;
  document.getElementById("productSubmitBtn").textContent = "Save Changes (Update)";
  document.getElementById("productFormAlert").classList.add("hidden");
  document.getElementById("productModal").classList.remove("hidden");
}

function openProductModal() {
  document.getElementById("productModalTitle").textContent = "Add New Product";
  document.getElementById("editProductId").value = "";
  document.getElementById("productForm").reset();
  document.getElementById("pImagePreviewWrap").style.display = "none";
  document.getElementById("pImageUploadStatus").textContent = "";
  document.getElementById("pCustomizable").checked = true;
  document.getElementById("pInStock").checked = true;
  document.getElementById("productSubmitBtn").textContent = "Save Product";
  document.getElementById("productFormAlert").classList.add("hidden");
  document.getElementById("productModal").classList.remove("hidden");
}

function closeProductModal() { document.getElementById("productModal").classList.add("hidden"); }

// Image upload and sync functions
async function uploadProductImage(fileInput, targetInputId, previewImgId, wrapId) {
  const file = fileInput.files && fileInput.files[0];
  if (!file) return;

  const statusEl = document.getElementById(targetInputId === "pImage" ? "pImageUploadStatus" : "quickImageUploadStatus");
  if (statusEl) {
    statusEl.textContent = "⏳ Uploading image...";
    statusEl.style.color = "var(--text-light)";
  }

  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await fetch(API + "/products/admin/upload-image", {
      method: "POST",
      headers: authToken ? { Authorization: "Bearer " + authToken } : {},
      body: formData,
    });
    const json = await res.json();
    if (res.ok && json.success) {
      const imgInput = document.getElementById(targetInputId);
      if (imgInput) {
        imgInput.value = json.relativeUrl || json.imageUrl;
      }
      syncImagePreview(targetInputId, previewImgId, wrapId);
      if (statusEl) {
        statusEl.textContent = "✅ Image uploaded!";
        statusEl.style.color = "#059669";
      }
      showToast("Image uploaded successfully!", "success");
    } else {
      if (statusEl) {
        statusEl.textContent = "❌ " + (json.message || "Upload failed");
        statusEl.style.color = "#dc2626";
      }
      showToast(json.message || "Failed to upload image.", "error");
    }
  } catch (err) {
    if (statusEl) {
      statusEl.textContent = "❌ Upload failed";
      statusEl.style.color = "#dc2626";
    }
    showToast("Error uploading file. Check connection.", "error");
  } finally {
    fileInput.value = "";
  }
}

function syncImagePreview(inputId, previewImgId, wrapId) {
  const inputEl = document.getElementById(inputId);
  const val = (inputEl?.value || "").trim();
  const previewImg = document.getElementById(previewImgId);
  const wrap = wrapId ? document.getElementById(wrapId) : null;
  if (!previewImg) return;

  if (val) {
    let resolvedSrc = val;
    if (!val.startsWith("http://") && !val.startsWith("https://") && !val.startsWith("data:") && !val.startsWith("/")) {
      resolvedSrc = "/" + val;
    }
    previewImg.src = resolvedSrc;
    if (wrap) wrap.style.display = "flex";
  } else {
    previewImg.src = "";
    if (wrap) wrap.style.display = "none";
  }
}

// Quick Change Image Modal functions
function openQuickImageModal(id, name, encodedImageUrl) {
  const modal = document.getElementById("quickImageModal");
  if (!modal) return;
  document.getElementById("quickImageProductId").value = id;
  document.getElementById("quickImageName").textContent = name || "Product #" + id;
  const currentImg = decodeURIComponent(encodedImageUrl || "");
  const inputEl = document.getElementById("quickImageUrlInput");
  inputEl.value = currentImg;
  const statusEl = document.getElementById("quickImageUploadStatus");
  if (statusEl) {
    statusEl.textContent = "JPG, PNG, WEBP, GIF, SVG";
    statusEl.style.color = "var(--text-light)";
  }
  const alertEl = document.getElementById("quickImageAlert");
  if (alertEl) alertEl.classList.add("hidden");
  syncImagePreview("quickImageUrlInput", "quickImagePreview");
  modal.classList.remove("hidden");
}

function closeQuickImageModal() {
  document.getElementById("quickImageModal")?.classList.add("hidden");
}

async function saveQuickProductImage() {
  const id = document.getElementById("quickImageProductId").value;
  const imageUrl = document.getElementById("quickImageUrlInput").value.trim();
  const alertEl = document.getElementById("quickImageAlert");
  const saveBtn = document.getElementById("saveQuickImageBtn");

  if (!imageUrl) {
    if (alertEl) {
      alertEl.textContent = "Please upload an image or provide an image URL/path.";
      alertEl.className = "alert alert-error";
      alertEl.classList.remove("hidden");
    }
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = "Saving...";

  const { ok, data } = await apiCall("PATCH", "/products/admin/" + id + "/image", { imageUrl });
  saveBtn.disabled = false;
  saveBtn.textContent = "Update Image";

  if (ok && data.success) {
    showToast("Product image updated successfully!", "success");
    closeQuickImageModal();
    loadProducts(currentPage.products);
    try {
      localStorage.setItem("vt_catalog_sync", Date.now().toString());
      window.dispatchEvent(new CustomEvent("vt:catalog-updated"));
    } catch (e) {}
  } else {
    if (alertEl) {
      alertEl.textContent = data?.message || "Failed to update image.";
      alertEl.className = "alert alert-error";
      alertEl.classList.remove("hidden");
    }
  }
}

document.getElementById("productForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("editProductId").value;
  const submitBtn = document.getElementById("productSubmitBtn");
  const origBtnText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = id ? "Updating..." : "Saving...";

  const payload = {
    name: document.getElementById("pName").value.trim(),
    category: document.getElementById("pCategory").value,
    price: parseFloat(document.getElementById("pPrice").value) || 0,
    originalPrice: document.getElementById("pOriginalPrice").value ? parseFloat(document.getElementById("pOriginalPrice").value) : null,
    imageUrl: document.getElementById("pImage").value.trim(),
    badge: document.getElementById("pBadge").value.trim(),
    shortDesc: document.getElementById("pShortDesc").value.trim(),
    fullDesc: document.getElementById("pFullDesc").value.trim(),
    materials: document.getElementById("pMaterials").value.trim(),
    dimensions: document.getElementById("pDimensions").value.trim(),
    customizable: document.getElementById("pCustomizable").checked,
    inStock: document.getElementById("pInStock").checked,
  };
  const alertEl = document.getElementById("productFormAlert");
  alertEl.classList.add("hidden");

  const { ok, data } = id
    ? await apiCall("PUT", "/products/admin/" + encodeURIComponent(id), payload)
    : await apiCall("POST", "/products/admin", payload);

  submitBtn.disabled = false;
  submitBtn.textContent = origBtnText;

  if (ok) {
    showToast(id ? "Product updated successfully!" : "Product added successfully!", "success");
    closeProductModal();
    loadProducts(currentPage.products);
    try {
      localStorage.setItem("vt_catalog_sync", Date.now().toString());
      window.dispatchEvent(new CustomEvent("vt:catalog-updated"));
    } catch (e) {}
  } else {
    alertEl.textContent = data?.message || "Failed to save product.";
    alertEl.className = "alert alert-error";
    alertEl.classList.remove("hidden");
  }
});

async function deleteProduct(id) {
  if (!confirm("Delete this product? This cannot be undone.")) return;
  const { ok } = await apiCall("DELETE", "/products/admin/" + id);
  if (ok) {
    showToast("Product deleted.", "success");
    loadProducts(currentPage.products);
    try {
      localStorage.setItem("vt_catalog_sync", Date.now().toString());
      window.dispatchEvent(new CustomEvent("vt:catalog-updated"));
    } catch (e) {}
  }
}

// ==================== MESSAGES ====================
async function loadMessages() {
  const { ok, data } = await apiCall("GET", "/admin/messages");
  if (!ok) return;
  const msgs = data.messages || [];
  const tbody = document.getElementById("messagesBody");
  if (!msgs.length) { tbody.innerHTML = `<tr><td colspan="6" class="empty-row">No messages yet.</td></tr>`; return; }
  tbody.innerHTML = msgs.map(m => `
    <tr style="${!m.is_read ? "background:#fdf8fb;font-weight:600" : ""}">
      <td>${e(m.name)}</td>
      <td>${e(m.mobile)}</td>
      <td style="max-width:250px;word-break:break-word">${e(m.message)}</td>
      <td>${m.is_read ? '<span class="badge badge-gray">Read</span>' : '<span class="badge badge-blue">Unread</span>'}</td>
      <td>${fmtDate(m.created_at)}</td>
      <td>
        <div class="action-btns">
          ${!m.is_read ? `<button class="btn-icon btn-icon-check" onclick="markRead(${m.id})" title="Mark Read">✓</button>` : ""}
          <a href="https://wa.me/91${m.mobile.replace(/\D/g,'')}" target="_blank" class="btn-icon btn-icon-view" title="WhatsApp">💬</a>
          <button class="btn-icon btn-icon-delete" onclick="deleteMessage(${m.id})" title="Delete">🗑</button>
        </div>
      </td>
    </tr>`).join("");
}

async function markRead(id) {
  const { ok } = await apiCall("PUT", "/admin/messages/" + id + "/read");
  if (ok) { loadMessages(); loadDashboard(); }
}
async function deleteMessage(id) {
  if (!confirm("Delete this message?")) return;
  const { ok } = await apiCall("DELETE", "/admin/messages/" + id);
  if (ok) { showToast("Message deleted.", "success"); loadMessages(); }
}

// ==================== COUPONS ====================
async function loadCoupons() {
  const { ok, data } = await apiCall("GET", "/admin/coupons");
  if (!ok) return;
  const coupons = data.coupons || [];
  const tbody = document.getElementById("couponsBody");
  if (!coupons.length) { tbody.innerHTML = `<tr><td colspan="8" class="empty-row">No coupons found.</td></tr>`; return; }
  tbody.innerHTML = coupons.map(c => `
    <tr>
      <td><strong style="font-family:monospace;letter-spacing:.05em">${c.code}</strong></td>
      <td>${c.discount_type === "percentage" ? "%" : "₹"}</td>
      <td>${c.discount_type === "percentage" ? c.discount_value + "%" : "₹" + c.discount_value}</td>
      <td>₹${c.min_order || 0}</td>
      <td>${c.used_count}${c.max_uses ? " / " + c.max_uses : ""}</td>
      <td>${c.is_active ? '<span class="badge badge-green">Active</span>' : '<span class="badge badge-gray">Inactive</span>'}</td>
      <td>${c.expires_at ? fmtDate(c.expires_at) : "Never"}</td>
      <td>
        <div class="action-btns">
          <button class="btn-icon ${c.is_active ? "btn-icon-delete" : "btn-icon-check"}" onclick="toggleCoupon(${c.id},${c.is_active},${c.discount_value},${c.min_order})" title="${c.is_active ? "Deactivate" : "Activate"}">${c.is_active ? "⏸" : "▶"}</button>
          <button class="btn-icon btn-icon-delete" onclick="deleteCoupon(${c.id})" title="Delete">🗑</button>
        </div>
      </td>
    </tr>`).join("");
}

function openCouponModal() { document.getElementById("couponForm").reset(); document.getElementById("couponFormAlert").classList.add("hidden"); document.getElementById("couponModal").classList.remove("hidden"); }
function closeCouponModal() { document.getElementById("couponModal").classList.add("hidden"); }

document.getElementById("couponForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const alertEl = document.getElementById("couponFormAlert");
  alertEl.classList.add("hidden");
  const { ok, data } = await apiCall("POST", "/admin/coupons", {
    code: document.getElementById("cCode").value,
    discountType: document.getElementById("cType").value,
    discountValue: document.getElementById("cValue").value,
    minOrder: document.getElementById("cMinOrder").value,
    maxUses: document.getElementById("cMaxUses").value || null,
    expiresAt: document.getElementById("cExpires").value || null,
  });
  if (ok) { showToast("Coupon created!", "success"); closeCouponModal(); loadCoupons(); }
  else { alertEl.textContent = data?.message || "Error"; alertEl.className = "alert alert-error"; alertEl.classList.remove("hidden"); }
});

async function toggleCoupon(id, currentActive, dv, mo) {
  await apiCall("PUT", "/admin/coupons/" + id, { isActive: !currentActive, discountValue: dv, minOrder: mo });
  loadCoupons();
}
async function deleteCoupon(id) {
  if (!confirm("Delete this coupon?")) return;
  const { ok } = await apiCall("DELETE", "/admin/coupons/" + id);
  if (ok) { showToast("Coupon deleted.", "success"); loadCoupons(); }
}

// ==================== CUSTOMERS & USERS ====================
let customersData = [];
async function loadCustomers() {
  const search = document.getElementById("customerSearch")?.value || "";
  const { ok, data } = await apiCall("GET", `/admin/customers?search=${encodeURIComponent(search)}`);
  if (!ok) return;

  customersData = data.customers || [];
  const admins = data.admins || [];

  // Update badge count
  const badgeEl = document.getElementById("totalCustomersBadge");
  if (badgeEl) badgeEl.textContent = `${customersData.length} Customer${customersData.length === 1 ? "" : "s"}`;

  renderCustomersTable(customersData);
  renderAdminsTable(admins);
}

function searchCustomers(val) {
  clearTimeout(searchTimers.customers);
  searchTimers.customers = setTimeout(() => loadCustomers(), 400);
}

function renderCustomersTable(customers) {
  const tbody = document.getElementById("customersBody");
  if (!tbody) return;
  if (!customers.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty-row">No customer records found yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = customers.map(c => `
    <tr>
      <td><strong>${e(c.customer_name || "Guest")}</strong></td>
      <td>
        <span style="font-family:monospace">${e(c.customer_mobile)}</span>
      </td>
      <td>${e(c.customer_email || "-")}</td>
      <td>${e(c.city || "-")}${c.state ? ", " + e(c.state) : ""}</td>
      <td><span class="badge badge-purple">${c.total_orders} Orders</span></td>
      <td><strong style="color:var(--blue-primary)">₹${parseFloat(c.total_spent || 0).toLocaleString("en-IN")}</strong></td>
      <td>${fmtDate(c.last_order_date)}</td>
      <td>
        <div class="action-btns">
          <a href="https://wa.me/91${(c.customer_mobile || '').replace(/\D/g, '')}" target="_blank" class="btn-icon btn-icon-view" title="Contact on WhatsApp">💬</a>
        </div>
      </td>
    </tr>
  `).join("");
}

function renderAdminsTable(admins) {
  const tbody = document.getElementById("adminsBody");
  if (!tbody) return;
  if (!admins.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-row">No admin accounts found.</td></tr>`;
    return;
  }

  tbody.innerHTML = admins.map(a => `
    <tr>
      <td>#${a.id}</td>
      <td><strong>${e(a.username)}</strong>${a.full_name ? ` (${e(a.full_name)})` : ""}</td>
      <td>${e(a.email)}</td>
      <td><span class="badge badge-pink">${e(a.role)}</span></td>
      <td>${a.is_active ? '<span class="badge badge-green">Active</span>' : '<span class="badge badge-red">Disabled</span>'}</td>
      <td>${a.last_login ? fmtDate(a.last_login) : "Never"}</td>
      <td>${fmtDate(a.created_at)}</td>
    </tr>
  `).join("");
}

// ==================== SETTINGS ====================
async function changePassword(e) {
  if (e) e.preventDefault();
  const alertEl = document.getElementById("pwAlert");
  const newPw = document.getElementById("newPw").value;
  const confirmPw = document.getElementById("confirmPw").value;
  if (newPw !== confirmPw) {
    alertEl.textContent = "Passwords do not match.";
    alertEl.className = "alert alert-error";
    alertEl.classList.remove("hidden");
    return;
  }
  const { ok, data } = await apiCall("POST", "/admin/change-password", {
    currentPassword: document.getElementById("currentPw").value,
    newPassword: newPw,
  });
  if (ok) {
    alertEl.textContent = "✅ Password changed successfully! Use your new password next login.";
    alertEl.className = "alert alert-success";
    alertEl.classList.remove("hidden");
    document.getElementById("changePasswordForm").reset();
  } else {
    alertEl.textContent = data?.message || "Failed to change password.";
    alertEl.className = "alert alert-error";
    alertEl.classList.remove("hidden");
  }
}

const changePwForm = document.getElementById("changePasswordForm");
if (changePwForm) {
  changePwForm.addEventListener("submit", changePassword);
}

// ==================== HELPERS ====================
function renderPagination(containerId, currentP, totalPages, loadFn) {
  const el = document.getElementById(containerId);
  if (!el || totalPages <= 1) { if (el) el.innerHTML = ""; return; }
  let html = "";
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn${i === currentP ? " active" : ""}" onclick="${loadFn.name}(${i})">${i}</button>`;
  }
  el.innerHTML = html;
}

function statusBadge(status) {
  const map = { pending: "yellow", confirmed: "blue", processing: "purple", completed: "green", shipped: "orange", delivered: "green", cancelled: "red", refunded: "gray" };
  const cls = map[status] || "gray";
  return `<span class="badge badge-${cls}">${status || "-"}</span>`;
}

function customStatusBadge(status) {
  const map = { new: "blue", in_review: "purple", approved: "orange", in_progress: "pink", completed: "green", cancelled: "red" };
  const cls = map[status] || "gray";
  return `<span class="badge badge-${cls}">${(status || "-").replace(/_/g, " ")}</span>`;
}

function paymentBadge(method) {
  if (!method) return `<span class="badge badge-gray">-</span>`;
  if (/instagram/i.test(method)) {
    return `<span class="badge" style="background:#fce7f3;color:#be185d;border:1px solid #fbcfe8;font-weight:600">📸 Instagram DM</span>`;
  }
  return `<span class="badge badge-gray">${e(method)}</span>`;
}

function e(str) {
  if (!str) return "";
  return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function fmtDate(dt) {
  if (!dt) return "-";
  return new Date(dt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function showToast(msg, type = "info") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = "0"; setTimeout(() => toast.remove(), 300); }, 3500);
}

// Close modals on backdrop click
document.querySelectorAll(".modal-overlay").forEach(el => {
  el.addEventListener("click", (e) => { if (e.target === el) el.classList.add("hidden"); });
});

// ==================== INIT ====================
checkAuth();



