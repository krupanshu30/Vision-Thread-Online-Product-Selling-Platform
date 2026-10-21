/**
 * Vision Thread (@vision_thread00) - Main Application Engine
 * Handles State, Routing, Cart, Wishlist, Custom Orders, Checkout & Admin
 */

class VisionThreadApp {
  constructor() {
    this.cartKey = 'vision_thread_cart';
    this.wishlistKey = 'vision_thread_wishlist';
    this.ordersKey = 'vision_thread_orders';
    this.contactPhone = '919876543210'; // Vision Thread Official WhatsApp Number placeholder
    this.instagramHandle = 'vision_thread00';

    this.cart = this.loadCart();
    this.wishlist = this.loadWishlist();
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.priceFilter = 'all';
    this.sortBy = 'default';
    this.selectedProduct = null;
    this.appliedCoupon = null;

    // Dynamic API URL adapts to current host (localhost, local IP, or domain)
    this.apiBase = (typeof window.getVtApiBase === 'function')
      ? window.getVtApiBase()
      : 'http://localhost:5000/api';
    this.backendOrigin = this.apiBase.replace(/\/api\/?$/, '');

    this.init();
  }

  resolveImageUrl(imgUrl) {
    if (!imgUrl || typeof imgUrl !== 'string') return 'images/pink-purple-lily-bouquet.jpg';
    const trimmed = imgUrl.trim();
    if (!trimmed) return 'images/pink-purple-lily-bouquet.jpg';

    // Check if it's an uploaded product image
    const uploadMatch = trimmed.match(/\/uploads\/[^"'\s?#]+/);
    if (uploadMatch) {
      const relPath = uploadMatch[0];
      const backendOrigin = (this.apiBase && !this.apiBase.startsWith('/'))
        ? this.apiBase.replace(/\/api\/?$/, '')
        : (window.location.origin || '');
      return `${backendOrigin}${relPath}`;
    }

    // Upgrade insecure HTTP image URLs when viewing on HTTPS mobile/public web
    if (window.location && window.location.protocol === 'https:' && trimmed.startsWith('http://')) {
      return trimmed.replace(/^http:\/\//, 'https://');
    }

    return trimmed;
  }

  init() {
    this.bindEvents();
    this.handleRoute();
    this.renderCategories();
    this.renderProducts();
    this.updateCartBadge();
    this.updateWishlistBadge();
    this.renderInstagramGrid();

    // Listen for product sync from backend
    window.addEventListener('vt:products-synced', () => {
      this.onProductsSynced();
    });

    window.addEventListener('vt:catalog-updated', () => {
      this.onProductsSynced();
    });

    // Cross-tab / cross-window sync listener
    window.addEventListener('storage', (e) => {
      if (e.key === 'vt_catalog_sync' || e.key === 'vision_thread_products') {
        if (window.productStore && typeof window.productStore.syncWithBackend === 'function') {
          window.productStore.syncWithBackend(true);
        }
      }
    });

    // Mobile visibilitychange & pageshow (vital for iOS Safari and Android Chrome)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        if (window.productStore && typeof window.productStore.syncWithBackend === 'function') {
          window.productStore.syncWithBackend(true);
        }
        this.syncOfflineOrders();
      }
    });

    window.addEventListener('pageshow', () => {
      if (window.productStore && typeof window.productStore.syncWithBackend === 'function') {
        window.productStore.syncWithBackend(true);
      }
      this.syncOfflineOrders();
    });

    // When tab/window regains focus, immediately sync products and offline orders
    window.addEventListener('focus', () => {
      if (window.productStore && typeof window.productStore.syncWithBackend === 'function') {
        window.productStore.syncWithBackend(true);
      }
      this.syncOfflineOrders();
    });

    window.addEventListener('online', () => {
      if (window.productStore && typeof window.productStore.syncWithBackend === 'function') {
        window.productStore.syncWithBackend(true);
      }
      this.syncOfflineOrders();
    });

    // Periodic lightweight background sync every 3.5 seconds to detect admin edits in real-time on all devices
    this.syncInterval = setInterval(() => {
      if (window.productStore && typeof window.productStore.checkCatalogVersion === 'function') {
        window.productStore.checkCatalogVersion();
      }
    }, 3500);

    // Proactively sync products from backend now that app is initialized
    if (window.productStore && typeof window.productStore.syncWithBackend === 'function') {
      window.productStore.syncWithBackend(true);
    }

    // Sync any orders stored offline
    this.syncOfflineOrders();

    // Check if URL has hash
    window.addEventListener('hashchange', () => this.handleRoute());
  }

  onProductsSynced() {
    this.renderCategories();
    this.renderProducts();
    this.renderShopProducts();

    // If product details modal is currently open, refresh with updated data
    if (this.selectedProduct && this.selectedProduct.id) {
      const updated = window.productStore ? window.productStore.getById(this.selectedProduct.id) : null;
      if (updated) {
        this.selectedProduct = updated;
        const modal = document.getElementById('productDetailsModal');
        if (modal && !modal.classList.contains('hidden')) {
          this.openProductDetails(updated.id);
        }
      }
    }
  }

  /* -------------------------------------------------------------
     Routing & Page View Handling
  ------------------------------------------------------------- */
  handleRoute() {
    const hash = window.location.hash || '#/';
    if (window.productStore && typeof window.productStore.syncWithBackend === 'function') {
      window.productStore.syncWithBackend();
    }
    const pages = document.querySelectorAll('.page-view');
    pages.forEach(p => p.classList.add('hidden'));

    // Highlight nav link
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href === hash || (hash.startsWith('#/shop') && href === '#/shop')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (hash === '#/' || hash === '') {
      document.getElementById('pageHome')?.classList.remove('hidden');
    } else if (hash.startsWith('#/shop')) {
      document.getElementById('pageShop')?.classList.remove('hidden');
      this.renderShopProducts();
    } else if (hash.startsWith('#/product')) {
      const urlParams = new URLSearchParams(hash.split('?')[1]);
      const productId = urlParams.get('id');
      if (productId) {
        this.openProductDetails(productId);
      } else {
        window.location.hash = '#/shop';
      }
    } else if (hash === '#/custom-orders') {
      document.getElementById('pageCustomOrders')?.classList.remove('hidden');
    } else if (hash === '#/about') {
      document.getElementById('pageAbout')?.classList.remove('hidden');
    } else if (hash === '#/contact') {
      document.getElementById('pageContact')?.classList.remove('hidden');
    } else if (hash === '#/cart') {
      document.getElementById('pageCart')?.classList.remove('hidden');
      this.renderFullCartPage();
    } else if (hash === '#/checkout') {
      document.getElementById('pageCheckout')?.classList.remove('hidden');
      this.renderCheckoutSummary();
    } else if (hash.startsWith('#/order-confirmation')) {
      document.getElementById('pageConfirmation')?.classList.remove('hidden');
      this.renderOrderConfirmation();
    } else {
      document.getElementById('pageHome')?.classList.remove('hidden');
    }
  }

  navigateTo(hash) {
    window.location.hash = hash;
  }

  /* -------------------------------------------------------------
     Data Persistence (Cart, Wishlist, Orders)
  ------------------------------------------------------------- */
  loadCart() {
    try {
      const data = localStorage.getItem(this.cartKey);
      if (!data) return [];
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(item => item && item.product && typeof item.product.price === 'number' && item.quantity > 0);
    } catch (e) {
      return [];
    }
  }

  saveCart() {
    localStorage.setItem(this.cartKey, JSON.stringify(this.cart));
    this.updateCartBadge();
    this.renderCartDrawer();
    this.renderFullCartPage();
    this.renderCheckoutSummary();
  }

  loadWishlist() {
    try {
      const data = localStorage.getItem(this.wishlistKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveWishlist() {
    localStorage.setItem(this.wishlistKey, JSON.stringify(this.wishlist));
    this.updateWishlistBadge();
    this.renderWishlistDrawer();
    this.renderProducts();
    this.renderShopProducts();
  }

  /* -------------------------------------------------------------
     Cart Actions
  ------------------------------------------------------------- */
  addToCart(productId, quantity = 1, selectedColor = null, customNote = '') {
    const product = window.productStore.getById(productId);
    if (!product) return;

    const color = selectedColor || (product.colors && product.colors.length ? product.colors[0] : 'Standard');
    const existingIndex = this.cart.findIndex(
      item => item.id === productId && item.selectedColor === color && item.customNote === customNote
    );

    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += quantity;
    } else {
      this.cart.push({
        id: productId,
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image,
          category: product.category
        },
        quantity: quantity,
        selectedColor: color,
        customNote: customNote
      });
    }

    this.saveCart();
    this.showToast(`✨ Added "${product.name}" to cart!`);
    this.openCartDrawer();
  }

  removeFromCart(index) {
    if (this.cart[index]) {
      const item = this.cart[index];
      this.cart.splice(index, 1);
      this.saveCart();
      this.showToast(`Removed "${item.product.name}" from cart`);
    }
  }

  updateQuantity(index, delta) {
    if (this.cart[index]) {
      this.cart[index].quantity += delta;
      if (this.cart[index].quantity <= 0) {
        this.removeFromCart(index);
      } else {
        this.saveCart();
      }
    }
  }

  getCartSubtotal() {
    return this.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }

  getDeliveryCharge() {
    return 0; // Delivery charges discussed individually via Instagram DM
  }

  getDiscount() {
    if (!this.appliedCoupon) return 0;
    const subtotal = this.getCartSubtotal();
    if (this.appliedCoupon.flatDiscount) {
      return Math.min(subtotal, Math.round(this.appliedCoupon.flatDiscount));
    }
    return Math.round(subtotal * ((this.appliedCoupon.discountPercent || 10) / 100));
  }

  getCartTotal() {
    const subtotal = this.getCartSubtotal();
    if (subtotal === 0) return 0;
    return Math.max(0, subtotal - this.getDiscount() + this.getDeliveryCharge());
  }

  updateCartBadge() {
    const totalCount = this.cart.reduce((acc, item) => acc + item.quantity, 0);
    const badges = document.querySelectorAll('.cart-count-badge');
    badges.forEach(b => {
      b.textContent = totalCount;
      b.classList.toggle('hidden', totalCount === 0);
    });
  }

  /* -------------------------------------------------------------
     Wishlist Actions
  ------------------------------------------------------------- */
  toggleWishlist(productId) {
    const index = this.wishlist.indexOf(productId);
    const product = window.productStore.getById(productId);
    if (index > -1) {
      this.wishlist.splice(index, 1);
      this.showToast(`Removed "${product ? product.name : 'item'}" from Wishlist`);
    } else {
      this.wishlist.push(productId);
      this.showToast(`❤️ Added "${product ? product.name : 'item'}" to Wishlist!`);
    }
    this.saveWishlist();
  }

  updateWishlistBadge() {
    const count = this.wishlist.length;
    const badges = document.querySelectorAll('.wishlist-count-badge');
    badges.forEach(b => {
      b.textContent = count;
      b.classList.toggle('hidden', count === 0);
    });
  }

  /* -------------------------------------------------------------
     Render Categories
  ------------------------------------------------------------- */
  renderCategories() {
    const container = document.getElementById('categoriesGrid');
    if (!container) return;

    const catsWithCounts = (window.productStore && typeof window.productStore.getCategories === 'function')
      ? window.productStore.getCategories()
      : window.PRODUCT_CATEGORIES;

    const cats = catsWithCounts.filter(c => c.id !== 'all');
    container.innerHTML = cats.map(cat => `
      <div class="category-card cursor-pointer group" onclick="app.selectCategoryAndShop('${cat.id}')">
        <div class="w-16 h-16 rounded-full bg-pink-50 border border-pink-200 flex items-center justify-center text-3xl mb-3 shadow-inner group-hover:scale-110 transition-transform">
          ${cat.icon}
        </div>
        <h4 class="font-serif font-bold text-gray-800 text-sm md:text-base group-hover:text-pink-600 transition-colors">${cat.name}</h4>
        <p class="text-xs text-pink-500 font-medium mt-1">${cat.count || 0} Crafts →</p>
      </div>
    `).join('');

    // Also populate shop category pill buttons
    const shopPills = document.getElementById('shopCategoryPills');
    if (shopPills) {
      shopPills.innerHTML = catsWithCounts.map(c => `
        <button onclick="app.filterByShopCategory('${c.id}')" 
          class="category-pill whitespace-nowrap px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all ${this.currentCategory.toLowerCase() === c.id.toLowerCase() ? 'bg-pink-600 text-white shadow-md' : 'bg-white border border-pink-200 text-gray-700 hover:border-pink-500'}">
          ${c.icon} ${c.name} (${c.count || 0})
        </button>
      `).join('');
    }
  }

  selectCategoryAndShop(catId) {
    this.currentCategory = catId;
    this.navigateTo('#/shop');
    this.renderCategories();
  }

  filterByShopCategory(catId) {
    this.currentCategory = catId;
    this.renderCategories();
    this.renderShopProducts();
  }

  /* -------------------------------------------------------------
     Render Products (Home & Shop Grid)
     Desktop: 4 items per row
     Mobile: 2 items per row
  ------------------------------------------------------------- */
  renderProducts() {
    const featuredContainer = document.getElementById('featuredProductsGrid');
    if (!featuredContainer) return;

    // Show 8 featured products on homepage
    const allProducts = window.productStore.getAll();
    const featured = allProducts.slice(0, 8);

    featuredContainer.innerHTML = featured.map(p => this.createProductCardHtml(p)).join('');
  }

  renderShopProducts() {
    const shopContainer = document.getElementById('shopProductsGrid');
    const countDisplay = document.getElementById('shopProductCount');
    if (!shopContainer) return;

    let items = window.productStore.getAll();

    // Category Filter
    if (this.currentCategory && this.currentCategory !== 'all') {
      items = items.filter(p => p.category.toLowerCase() === this.currentCategory.toLowerCase());
    }

    // Search Query Filter
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      items = items.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.shortDescription.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    // Price Filter
    if (this.priceFilter === 'under200') {
      items = items.filter(p => p.price < 200);
    } else if (this.priceFilter === '200to400') {
      items = items.filter(p => p.price >= 200 && p.price <= 400);
    } else if (this.priceFilter === 'above400') {
      items = items.filter(p => p.price > 400);
    }

    // Sort By
    if (this.sortBy === 'price-low') {
      items.sort((a, b) => a.price - b.price);
    } else if (this.sortBy === 'price-high') {
      items.sort((a, b) => b.price - a.price);
    } else if (this.sortBy === 'name') {
      items.sort((a, b) => a.name.localeCompare(b.name));
    } else if (this.sortBy === 'rating') {
      items.sort((a, b) => (b.rating || 5) - (a.rating || 5));
    }

    if (countDisplay) {
      countDisplay.textContent = `Showing ${items.length} handmade item${items.length === 1 ? '' : 's'}`;
    }

    if (items.length === 0) {
      shopContainer.innerHTML = `
        <div class="col-span-full py-16 text-center">
          <div class="text-5xl mb-3">🌸</div>
          <h3 class="font-serif text-xl font-bold text-gray-700">No crafts found</h3>
          <p class="text-sm text-gray-500 mt-1 max-w-sm mx-auto">We couldn't find any products matching your filters. Try clearing search or choosing another category!</p>
          <button onclick="app.resetShopFilters()" class="btn-primary mt-4 text-xs">Reset All Filters</button>
        </div>
      `;
      return;
    }

    shopContainer.innerHTML = items.map(p => this.createProductCardHtml(p)).join('');
  }

  createProductCardHtml(p) {
    const isWishlisted = this.wishlist.includes(p.id);
    const discount = p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
    const inStock = p.inStock !== false;
    const resolvedImg = this.resolveImageUrl(p.image);

    return `
      <div class="product-card group ${!inStock ? 'opacity-90' : ''}" data-product-id="${p.id}">
        <!-- Image Container -->
        <div class="product-image-wrap">
          <img src="${resolvedImg}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src='images/pink-purple-lily-bouquet.jpg'" />
          
          <!-- Badges -->
          <div class="card-badge ${!inStock ? '!bg-gray-800 !text-white' : ''}">
            ${!inStock ? 'Out of Stock' : (p.badge || 'Handmade')}
          </div>

          <!-- Wishlist Button -->
          <button class="btn-wishlist ${isWishlisted ? 'active' : ''}" 
                  onclick="app.toggleWishlist('${p.id}')" 
                  aria-label="Add to wishlist" title="Save to wishlist">
            <svg class="w-4 h-4" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="${isWishlisted ? '#ec4899' : 'none'}">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        <!-- Product Content -->
        <div class="p-3 md:p-4 flex flex-col flex-grow justify-between">
          <div>
            <div class="flex items-center justify-between">
              <span class="text-[10px] md:text-xs font-semibold text-pink-600 uppercase tracking-wider">${p.category}</span>
              ${!inStock ? `<span class="text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">Sold Out</span>` : ''}
            </div>
            <h3 class="font-serif font-bold text-gray-900 text-sm md:text-base leading-snug mt-0.5 line-clamp-1 group-hover:text-pink-600 transition-colors cursor-pointer" onclick="app.openProductDetails('${p.id}')">
              ${p.name}
            </h3>
            <p class="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed hidden sm:block">
              ${p.shortDescription || ''}
            </p>
          </div>

          <div class="mt-3 pt-2 border-t border-pink-100 flex flex-col gap-2">
            <!-- Price and Rating -->
            <div class="flex items-baseline justify-between">
              <div class="flex items-baseline gap-1.5">
                <span class="text-base md:text-lg font-bold text-gray-900 font-sans">₹${p.price}</span>
                ${p.originalPrice ? `<span class="text-xs text-gray-400 line-through">₹${p.originalPrice}</span>` : ''}
              </div>
              <div class="flex items-center text-[11px] text-amber-500 font-semibold">
                ★ ${p.rating || 4.9}
              </div>
            </div>

            <!-- Action Buttons: View Product & Add to Cart -->
            <div class="grid grid-cols-2 gap-1.5 mt-1">
              <button onclick="app.openProductDetails('${p.id}')" 
                class="px-2 py-1.5 text-xs font-semibold text-pink-600 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors border border-pink-200 text-center flex items-center justify-center">
                View
              </button>
              ${inStock ? `
                <button onclick="app.addToCart('${p.id}')" 
                  class="px-2 py-1.5 text-xs font-semibold text-white bg-pink-600 hover:bg-pink-700 rounded-lg transition-all shadow-sm flex items-center justify-center gap-1 active:scale-95">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                  <span>Add</span>
                </button>
              ` : `
                <button disabled 
                  class="px-2 py-1.5 text-xs font-semibold text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed border border-gray-200 text-center flex items-center justify-center">
                  Sold Out
                </button>
              `}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  resetShopFilters() {
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.priceFilter = 'all';
    this.sortBy = 'default';
    const searchInput = document.getElementById('shopSearchInput');
    if (searchInput) searchInput.value = '';
    const priceSelect = document.getElementById('priceFilterSelect');
    if (priceSelect) priceSelect.value = 'all';
    const sortSelect = document.getElementById('sortFilterSelect');
    if (sortSelect) sortSelect.value = 'default';
    this.renderCategories();
    this.renderShopProducts();
  }

  /* -------------------------------------------------------------
     Product Details View / Modal
  ------------------------------------------------------------- */
  openProductDetails(productId) {
    const product = window.productStore.getById(productId);
    if (!product) return;
    this.selectedProduct = product;

    const modal = document.getElementById('productDetailsModal');
    const content = document.getElementById('productDetailsModalContent');
    if (!modal || !content) return;

    let selectedColor = product.colors && product.colors.length ? product.colors[0] : 'Standard';
    let currentQty = 1;

    const rawGallery = product.gallery && product.gallery.length ? product.gallery : [product.image];
    const gallery = rawGallery.map(img => this.resolveImageUrl(img));
    const inStock = product.inStock !== false;

    content.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <!-- Gallery Section -->
        <div>
          <div class="rounded-2xl overflow-hidden aspect-square bg-pink-50 border border-pink-100 shadow-inner mb-3">
            <img id="mainProductGalleryImg" src="${gallery[0]}" alt="${product.name}" onerror="this.onerror=null;this.src='images/pink-purple-lily-bouquet.jpg'" class="w-full h-full object-cover transition-all duration-300" />
          </div>
          <div class="flex gap-2 overflow-x-auto pb-1">
            ${gallery.map((img, idx) => `
              <button onclick="document.getElementById('mainProductGalleryImg').src = '${img}'" 
                class="w-16 h-16 rounded-xl overflow-hidden border-2 border-pink-200 hover:border-pink-600 flex-shrink-0 transition-colors">
                <img src="${img}" alt="Thumbnail" onerror="this.onerror=null;this.src='images/pink-purple-lily-bouquet.jpg'" class="w-full h-full object-cover" />
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Info Section -->
        <div class="flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between">
              <span class="craft-tag">🌸 ${product.category}</span>
              ${inStock 
                ? '<span class="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">In Stock • Handmade</span>' 
                : '<span class="text-xs text-rose-600 font-semibold bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">Out of Stock</span>'}
            </div>

            <h2 class="font-serif text-2xl font-bold text-gray-900 mt-2">${product.name}</h2>
            
            <div class="flex items-center gap-3 mt-2">
              <div class="flex items-center text-amber-500 text-sm">
                ★★★★★ <span class="ml-1 text-gray-600 font-medium">(${product.reviewsCount || 24} reviews)</span>
              </div>
              <span class="text-gray-300">|</span>
              <span class="text-xs text-pink-600 font-semibold">100% Handcrafted</span>
            </div>

            <div class="flex items-baseline gap-3 mt-3">
              <span class="text-3xl font-bold text-gray-900 font-sans">₹${product.price}</span>
              ${product.originalPrice ? `<span class="text-lg text-gray-400 line-through">₹${product.originalPrice}</span>` : ''}
              ${product.originalPrice ? `<span class="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF</span>` : ''}
            </div>

            <p class="text-sm text-gray-600 mt-3 leading-relaxed">
              ${product.fullDescription}
            </p>

            ${product.materials ? `
              <div class="mt-3 p-3 bg-pink-50/60 rounded-xl text-xs text-gray-700">
                <span class="font-bold text-pink-700">Craft Materials:</span> ${product.materials}
                ${product.dimensions ? `<br/><span class="font-bold text-pink-700">Dimensions:</span> ${product.dimensions}` : ''}
              </div>
            ` : ''}

            <!-- Color Options -->
            ${product.colors && product.colors.length ? `
              <div class="mt-4">
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Available Colors:</label>
                <div class="flex flex-wrap gap-2" id="detailColorOptions">
                  ${product.colors.map((c, i) => `
                    <button type="button" onclick="app.selectDetailColor('${c}', this)" 
                      class="color-chip px-3 py-1.5 text-xs rounded-full border transition-all ${i === 0 ? 'bg-pink-600 text-white border-pink-600 shadow-sm' : 'bg-white border-gray-300 text-gray-700 hover:border-pink-500'}">
                      ${c}
                    </button>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Custom Message / Personalization -->
            <div class="mt-4">
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Custom Requirements / Message (Optional):
              </label>
              <input type="text" id="detailCustomNote" placeholder="e.g., Add name 'Aarohi' on tag, gift wrap" 
                class="w-full text-xs px-3 py-2 border border-pink-200 rounded-lg focus:outline-none focus:border-pink-500" />
            </div>

            <!-- Quantity Selector -->
            <div class="flex items-center gap-4 mt-4">
              <span class="text-xs font-bold text-gray-700 uppercase tracking-wider">Quantity:</span>
              <div class="flex items-center border border-pink-300 rounded-full overflow-hidden bg-white">
                <button type="button" onclick="app.changeDetailQty(-1)" class="w-8 h-8 flex items-center justify-center text-pink-600 hover:bg-pink-50 font-bold">-</button>
                <span id="detailQtyDisplay" class="w-10 text-center text-sm font-bold text-gray-800">1</span>
                <button type="button" onclick="app.changeDetailQty(1)" class="w-8 h-8 flex items-center justify-center text-pink-600 hover:bg-pink-50 font-bold">+</button>
              </div>
            </div>
          </div>

          <!-- Buttons -->
          <div class="mt-6 flex flex-col gap-2 pt-4 border-t border-gray-100">
            <div class="grid grid-cols-2 gap-3">
              ${inStock ? `
                <button onclick="app.addCurrentDetailToCart()" class="btn-primary w-full py-3 text-sm">
                  Add to Cart
                </button>
                <button onclick="app.buyNowDetail()" class="bg-gray-900 hover:bg-black text-white font-semibold py-3 px-4 rounded-full transition-all text-sm flex items-center justify-center shadow-md">
                  Buy Now ⚡
                </button>
              ` : `
                <button disabled class="btn-primary w-full py-3 text-sm opacity-50 cursor-not-allowed">
                  Sold Out
                </button>
                <button disabled class="bg-gray-400 text-white font-semibold py-3 px-4 rounded-full transition-all text-sm flex items-center justify-center opacity-60 cursor-not-allowed">
                  Unavailable
                </button>
              `}
            </div>

            <!-- Order via Instagram DM Button -->
            <button onclick="app.orderViaInstagramFromDetail()" class="btn-instagram w-full py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-2 shadow-md">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              <span>Order this on Instagram DM</span>
            </button>

            <!-- Submit Custom Request -->
            <a href="#/custom-orders" onclick="app.closeQuickViewModal()" 
               class="w-full py-2.5 px-4 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-full font-medium text-xs flex items-center justify-center gap-2 transition-all">
              <span>Request Customization / Bespoke Order</span>
            </a>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('open');
  }

  selectDetailColor(color, btn) {
    document.querySelectorAll('#detailColorOptions .color-chip').forEach(c => {
      c.classList.remove('bg-pink-600', 'text-white', 'border-pink-600', 'shadow-sm');
      c.classList.add('bg-white', 'border-gray-300', 'text-gray-700');
    });
    btn.classList.add('bg-pink-600', 'text-white', 'border-pink-600', 'shadow-sm');
    btn.classList.remove('bg-white', 'border-gray-300', 'text-gray-700');
    this.currentSelectedColor = color;
  }

  changeDetailQty(delta) {
    const disp = document.getElementById('detailQtyDisplay');
    let qty = parseInt(disp.textContent) || 1;
    qty = Math.max(1, qty + delta);
    disp.textContent = qty;
  }

  closeProductModal() {
    const modal = document.getElementById('productDetailsModal');
    if (modal) modal.classList.remove('open');
  }

  addCurrentDetailToCart() {
    if (!this.selectedProduct) return;
    const qty = parseInt(document.getElementById('detailQtyDisplay')?.textContent) || 1;
    const note = document.getElementById('detailCustomNote')?.value || '';
    const activeChip = document.querySelector('#detailColorOptions .color-chip.bg-pink-600');
    const color = activeChip ? activeChip.textContent.trim() : (this.selectedProduct.colors ? this.selectedProduct.colors[0] : 'Standard');

    this.addToCart(this.selectedProduct.id, qty, color, note);
    this.closeProductModal();
  }

  buyNowDetail() {
    if (!this.selectedProduct) return;
    const qty = parseInt(document.getElementById('detailQtyDisplay')?.textContent) || 1;
    const note = document.getElementById('detailCustomNote')?.value || '';
    const activeChip = document.querySelector('#detailColorOptions .color-chip.bg-pink-600');
    const color = activeChip ? activeChip.textContent.trim() : (this.selectedProduct.colors ? this.selectedProduct.colors[0] : 'Standard');

    this.buyNowItem = {
      product: this.selectedProduct,
      quantity: qty,
      selectedColor: color,
      customNote: note
    };
    this.closeProductModal();
    this.closeCartDrawer();
    this.navigateTo('#/checkout');
    this.renderCheckoutSummary();
  }

  /* -------------------------------------------------------------
     Cart Drawer (Slide-Over)
  ------------------------------------------------------------- */
  openCartDrawer() {
    this.buyNowItem = null;
    this.renderCartDrawer();
    document.getElementById('cartDrawerBackdrop')?.classList.add('open');
  }

  closeCartDrawer() {
    document.getElementById('cartDrawerBackdrop')?.classList.remove('open');
  }

  renderCartDrawer() {
    const container = document.getElementById('cartDrawerItems');
    const subtotalEl = document.getElementById('cartDrawerSubtotal');
    const deliveryEl = document.getElementById('cartDrawerDelivery');
    const totalEl = document.getElementById('cartDrawerTotal');
    const freeShippingBar = document.getElementById('cartFreeShippingProgress');
    const freeShippingText = document.getElementById('cartFreeShippingText');

    if (!container) return;

    if (this.cart.length === 0) {
      container.innerHTML = `
        <div class="py-16 text-center px-4">
          <div class="w-20 h-20 mx-auto rounded-full bg-pink-50 flex items-center justify-center text-4xl mb-3 shadow-inner">
            🛍️
          </div>
          <h4 class="font-serif font-bold text-gray-800 text-lg">Your Cart is Empty</h4>
          <p class="text-xs text-gray-500 mt-1 max-w-xs mx-auto">Fill it with lovely handmade craft treasures made with care!</p>
          <button onclick="app.closeCartDrawer(); app.navigateTo('#/shop')" class="btn-primary mt-5 text-xs py-2 px-5">
            Explore Handcrafted Shop
          </button>
        </div>
      `;
      if (subtotalEl) subtotalEl.textContent = '₹0';
      if (totalEl) totalEl.textContent = '₹0';
      return;
    }

    const subtotal = this.getCartSubtotal();
    const delivery = this.getDeliveryCharge();
    const total = this.getCartTotal();

    // Free shipping bar removed

    container.innerHTML = this.cart.map((item, idx) => `
      <div class="flex items-center gap-3 p-3 bg-white border border-pink-100 rounded-xl shadow-sm">
        <img src="${item.product.image}" alt="${item.product.name}" class="w-16 h-16 rounded-lg object-cover bg-pink-50 flex-shrink-0" />
        <div class="flex-grow min-w-0">
          <h5 class="text-xs md:text-sm font-semibold text-gray-800 truncate">${item.product.name}</h5>
          <p class="text-[11px] text-pink-600 font-medium">Color: ${item.selectedColor}</p>
          ${item.customNote ? `<p class="text-[10px] text-gray-500 truncate italic">"${item.customNote}"</p>` : ''}
          <div class="flex items-center justify-between mt-2">
            <span class="text-xs font-bold text-gray-900">₹${item.product.price}</span>
            <div class="flex items-center border border-pink-200 rounded-md bg-pink-50/50">
              <button onclick="app.updateQuantity(${idx}, -1)" class="w-6 h-6 flex items-center justify-center text-pink-600 font-bold hover:bg-pink-100 rounded-l">-</button>
              <span class="w-6 text-center text-xs font-semibold">${item.quantity}</span>
              <button onclick="app.updateQuantity(${idx}, 1)" class="w-6 h-6 flex items-center justify-center text-pink-600 font-bold hover:bg-pink-100 rounded-r">+</button>
            </div>
          </div>
        </div>
        <button onclick="app.removeFromCart(${idx})" class="text-gray-400 hover:text-rose-500 p-1 transition-colors" title="Remove">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>
    `).join('');

    if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
    if (totalEl) totalEl.textContent = `₹${subtotal}`;
  }

  /* -------------------------------------------------------------
     Full Cart Page (#/cart)
  ------------------------------------------------------------- */
  renderFullCartPage() {
    this.buyNowItem = null;
    const container = document.getElementById('fullCartItemsContainer');
    const summaryContainer = document.getElementById('fullCartSummary');
    if (!container) return;

    if (this.cart.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-20 text-center">
          <div class="w-24 h-24 mx-auto rounded-full bg-pink-100 flex items-center justify-center text-5xl mb-4">
            🧺
          </div>
          <h3 class="font-serif text-2xl font-bold text-gray-800">Your Basket is Empty</h3>
          <p class="text-sm text-gray-500 mt-2 max-w-md mx-auto">Looks like you haven't added any handcrafted flowers, hair accessories, or bouquets yet.</p>
          <a href="#/shop" class="btn-primary mt-6 inline-flex text-sm">Explore Collection</a>
        </div>
      `;
      if (summaryContainer) summaryContainer.classList.add('hidden');
      return;
    }

    if (summaryContainer) summaryContainer.classList.remove('hidden');

    container.innerHTML = `
      <div class="space-y-4">
        ${this.cart.map((item, idx) => `
          <div class="flex flex-col sm:flex-row items-center justify-between p-4 bg-white border border-pink-100 rounded-2xl shadow-sm gap-4">
            <div class="flex items-center gap-4 w-full sm:w-auto">
              <img src="${item.product.image}" alt="${item.product.name}" class="w-20 h-20 rounded-xl object-cover bg-pink-50" />
              <div>
                <span class="text-[10px] font-bold text-pink-600 uppercase tracking-wider">${item.product.category}</span>
                <h4 class="font-serif font-bold text-gray-900 text-base">${item.product.name}</h4>
                <p class="text-xs text-gray-600 mt-0.5">Selected Color: <span class="font-semibold text-pink-600">${item.selectedColor}</span></p>
                ${item.customNote ? `<p class="text-xs text-gray-500 italic mt-0.5">Note: "${item.customNote}"</p>` : ''}
              </div>
            </div>

            <div class="flex items-center justify-between w-full sm:w-auto sm:gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
              <div class="flex items-center border border-pink-300 rounded-full overflow-hidden bg-white">
                <button onclick="app.updateQuantity(${idx}, -1)" class="w-8 h-8 flex items-center justify-center text-pink-600 font-bold hover:bg-pink-50">-</button>
                <span class="w-8 text-center text-sm font-semibold">${item.quantity}</span>
                <button onclick="app.updateQuantity(${idx}, 1)" class="w-8 h-8 flex items-center justify-center text-pink-600 font-bold hover:bg-pink-50">+</button>
              </div>

              <div class="text-right">
                <div class="text-base font-bold text-gray-900 font-sans">₹${item.product.price * item.quantity}</div>
                <div class="text-[11px] text-gray-400">₹${item.product.price} each</div>
              </div>

              <button onclick="app.removeFromCart(${idx})" class="text-gray-400 hover:text-rose-500 p-2 transition-colors" title="Delete">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Render Summary
    const subtotal = this.getCartSubtotal();
    const delivery = this.getDeliveryCharge();
    const discount = this.getDiscount();
    const total = this.getCartTotal();

    const sumEl = document.getElementById('fullCartSubtotal');
    const delEl = document.getElementById('fullCartDelivery');
    const discEl = document.getElementById('fullCartDiscount');
    const totEl = document.getElementById('fullCartTotal');

    if (sumEl) sumEl.textContent = `₹${subtotal}`;
    if (discEl) discEl.textContent = `-₹${discount}`;
    if (totEl) totEl.textContent = `₹${total}`;
  }

  async applyCoupon() {
    const input = document.getElementById('couponCodeInput');
    if (!input) return;
    const code = input.value.trim().toUpperCase();
    if (!code) return;

    // Check with backend MySQL coupons table
    try {
      const res = await fetch(`${this.apiBase}/validate-coupon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal: this.getCartSubtotal() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.type === 'percentage') {
          this.appliedCoupon = { code: code, discountPercent: parseFloat(data.value) };
        } else {
          this.appliedCoupon = { code: code, flatDiscount: parseFloat(data.value) };
        }
        this.showToast(data.message || `🎉 Coupon "${code}" applied!`);
        this.renderFullCartPage();
        this.renderCheckoutSummary();
        return;
      } else if (!res.ok && data.message) {
        this.showToast(`⚠️ ${data.message}`);
        return;
      }
    } catch (e) {
      // Backend offline fallback
    }

    if (code === 'VISION10' || code === 'HANDMADE10') {
      this.appliedCoupon = { code: code, discountPercent: 10 };
      this.showToast(`🎉 Coupon "${code}" applied! 10% discount added.`);
      this.renderFullCartPage();
      this.renderCheckoutSummary();
    } else {
      this.showToast('⚠️ Invalid coupon code. Try HANDMADE10 or VISION10');
    }
  }

  /* -------------------------------------------------------------
     Wishlist Drawer
  ------------------------------------------------------------- */
  openWishlistDrawer() {
    this.renderWishlistDrawer();
    document.getElementById('wishlistDrawerBackdrop')?.classList.add('open');
  }

  closeWishlistDrawer() {
    document.getElementById('wishlistDrawerBackdrop')?.classList.remove('open');
  }

  renderWishlistDrawer() {
    const container = document.getElementById('wishlistDrawerItems');
    if (!container) return;

    if (this.wishlist.length === 0) {
      container.innerHTML = `
        <div class="py-16 text-center px-4">
          <div class="w-16 h-16 mx-auto rounded-full bg-pink-50 flex items-center justify-center text-3xl mb-3 shadow-inner">
            ❤️
          </div>
          <h4 class="font-serif font-bold text-gray-800 text-lg">Your Wishlist is Empty</h4>
          <p class="text-xs text-gray-500 mt-1 max-w-xs mx-auto">Tap the heart icon on any craft product you love to save it for later!</p>
        </div>
      `;
      return;
    }

    const items = this.wishlist.map(id => window.productStore.getById(id)).filter(Boolean);

    container.innerHTML = items.map(p => `
      <div class="flex items-center gap-3 p-3 bg-white border border-pink-100 rounded-xl shadow-sm">
        <img src="${p.image}" alt="${p.name}" class="w-16 h-16 rounded-lg object-cover bg-pink-50 flex-shrink-0" />
        <div class="flex-grow min-w-0">
          <h5 class="text-xs md:text-sm font-semibold text-gray-800 truncate">${p.name}</h5>
          <span class="text-xs font-bold text-pink-600">₹${p.price}</span>
          <div class="mt-2 flex gap-2">
            <button onclick="app.addToCart('${p.id}'); app.toggleWishlist('${p.id}');" class="text-[11px] font-semibold text-white bg-pink-600 hover:bg-pink-700 px-2.5 py-1 rounded-md transition-colors shadow-xs">
              Move to Cart
            </button>
            <button onclick="app.toggleWishlist('${p.id}')" class="text-[11px] text-gray-500 hover:text-rose-600 px-2 py-1">
              Remove
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  /* -------------------------------------------------------------
     Simple Order Form & Direct Instagram DM Ordering
  ------------------------------------------------------------- */
  getOrderItems() {
    if (this.buyNowItem) return [this.buyNowItem];
    return this.cart;
  }

  getOrderSubtotal() {
    const items = this.getOrderItems();
    return items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }

  renderCheckoutSummary() {
    const itemsEl = document.getElementById('checkoutOrderItems');
    const subtotalEl = document.getElementById('checkoutSubtotal');
    const deliveryEl = document.getElementById('checkoutDelivery');
    const totalEl = document.getElementById('checkoutTotal');
    const countBadge = document.getElementById('orderItemCountBadge');

    if (!itemsEl) return;

    const items = this.getOrderItems();
    if (items.length === 0) {
      itemsEl.innerHTML = `
        <div class="py-6 text-center text-xs text-gray-500 italic">
          No products selected.<br>
          <a href="#/shop" class="text-pink-600 font-semibold underline mt-2 inline-block">Browse Handcrafted Shop</a>
        </div>
      `;
      if (subtotalEl) subtotalEl.textContent = '₹0';
      if (deliveryEl) deliveryEl.textContent = 'FREE';
      if (totalEl) totalEl.textContent = '₹0';
      if (countBadge) countBadge.textContent = '0 items';
      return;
    }

    const totalQty = items.reduce((s, i) => s + i.quantity, 0);
    if (countBadge) countBadge.textContent = `${totalQty} item${totalQty > 1 ? 's' : ''}`;

    itemsEl.innerHTML = items.map(item => `
      <div class="flex items-center justify-between text-xs py-2">
        <div class="flex items-center gap-2.5 max-w-[70%]">
          <img src="${item.product.image || 'images/logo.png'}" alt="${item.product.name}" class="w-10 h-10 rounded-xl object-cover border border-pink-100 flex-shrink-0" />
          <div class="truncate">
            <span class="font-medium text-gray-900 truncate block">${item.product.name}</span>
            <span class="text-[11px] text-gray-500">Qty: ${item.quantity} • ₹${item.product.price} each</span>
            ${item.selectedColor ? `<span class="text-[10px] text-pink-600 block font-medium">Color: ${item.selectedColor}</span>` : ''}
          </div>
        </div>
        <span class="font-bold text-gray-900 font-sans">₹${item.product.price * item.quantity}</span>
      </div>
    `).join('');

    const subtotal = this.getOrderSubtotal();
    if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
    if (totalEl) totalEl.textContent = `₹${subtotal}`;
  }

  async handleSimpleOrderSubmit(e) {
    e.preventDefault();

    const items = this.getOrderItems();
    if (items.length === 0) {
      this.showToast('Please select a product or add items to cart first!');
      return;
    }

    const form = e.target;
    const name = (form.customerName?.value || '').trim();
    const phone = (form.customerPhone?.value || '').trim();
    const address = (form.customerAddress?.value || '').trim();
    const pincode = (form.customerPincode?.value || '').trim();

    if (!name || !phone || !address || !pincode) {
      this.showToast('Please fill in all 4 delivery fields.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      this.showToast('Please enter a valid 10-digit phone number.');
      return;
    }

    if (!/^\d{6}$/.test(pincode)) {
      this.showToast('Please enter a valid 6-digit PIN code.');
      return;
    }

    const submitBtn = document.getElementById('submitOrderBtn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Saving Order & Preparing Instagram DM...</span>`;
    }

    const total = this.getOrderSubtotal();
    let orderId = '#VT-' + Math.floor(10000 + Math.random() * 90000);
    let orderSynced = false;

    // Save directly to database via Instagram-order API endpoint (shows in Admin Panel)
    try {
      const apiRes = await fetch(`${this.apiBase}/instagram-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderId,
          customerName: name,
          customerMobile: cleanPhone.slice(-10),
          address: address,
          pincode: pincode,
          paymentMethod: 'Instagram DM (@vision_thread00)',
          subtotal: total,
          deliveryCharge: 0,
          discount: 0,
          grandTotal: total,
          items: items.map(item => ({
            productCode: item.product.id || '',
            name: item.product.name,
            category: item.product.category || 'Handmade',
            price: item.product.price,
            quantity: item.quantity,
            color: item.selectedColor || 'Standard',
            customNote: item.customNote || '',
            image: item.product.image || ''
          }))
        })
      });

      const resData = await apiRes.json();
      if (resData && resData.success) {
        if (resData.orderId) orderId = resData.orderId;
        orderSynced = true;
      }
    } catch (err) {
      // Fallback: try /orders endpoint
      try {
        const fallbackRes = await fetch(`${this.apiBase}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderId,
            customerName: name,
            customerMobile: cleanPhone.slice(-10),
            address: address,
            pincode: pincode,
            paymentMethod: 'Instagram DM (@vision_thread00)',
            subtotal: total,
            deliveryCharge: 0,
            discount: 0,
            grandTotal: total,
            items: items.map(item => ({
              productCode: item.product.id || '',
              name: item.product.name,
              category: item.product.category || 'Handmade',
              price: item.product.price,
              quantity: item.quantity,
              color: item.selectedColor || 'Standard',
              customNote: item.customNote || '',
              image: item.product.image || ''
            }))
          })
        });
        const fbData = await fallbackRes.json();
        if (fbData && fbData.success) {
          if (fbData.orderId) orderId = fbData.orderId;
          orderSynced = true;
        }
      } catch (fbErr) {
        console.warn('Backend order sync fallback:', fbErr.message);
      }
    }

    // Build Instagram DM order text with selected product info & customer details
    const siteUrl = window.location.origin + window.location.pathname;
    const itemsText = items.map((item, idx) => {
      const prodUrl = `${siteUrl}#/shop?product=${item.product.id}`;
      const lines = [
        `${idx + 1}. *${item.product.name}*`,
        `   • Qty: ${item.quantity} × ₹${item.product.price} = ₹${item.product.price * item.quantity}`,
        `   • Color: ${item.selectedColor || 'Standard'}`
      ];
      if (item.customNote && item.customNote.trim()) {
        lines.push(`   • Note: "${item.customNote.trim()}"`);
      }
      lines.push(`   • Link: ${prodUrl}`);
      return lines.join('\n');
    }).join('\n\n');

    const igMessage = [
      `🌸 *New Order for Vision Thread (@vision_thread00)* 🌸`,
      `Order ID: ${orderId}`,
      ``,
      `🛍️ *Selected Products:*`,
      itemsText,
      ``,
      `💰 *Total Amount: ₹${total}*`,
      ``,
      `👤 *Customer & Delivery Details:*`,
      `• Name: ${name}`,
      `• Phone: ${phone}`,
      `• Delivery Address: ${address}`,
      `• PIN Code: ${pincode}`,
      ``,
      `✨ I have submitted my order details on your website. Please confirm availability and shipping details. Thank you! ❤️`
    ].join('\n');

    // Save order in local history
    const orderRecord = {
      orderId,
      date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      customer: { name, phone: cleanPhone.slice(-10), address, pincode },
      items: [...items],
      total,
      status: 'Pending',
      synced: orderSynced
    };
    const savedOrders = JSON.parse(localStorage.getItem(this.ordersKey) || '[]');
    savedOrders.unshift(orderRecord);
    localStorage.setItem(this.ordersKey, JSON.stringify(savedOrders));

    // Clear cart & buyNowItem
    this.cart = [];
    this.buyNowItem = null;
    this.saveCart();

    // Trigger celebration
    this.launchConfetti();

    // Reset button
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
        <span>Place Order & Open Instagram DM</span>
      `;
    }

    // Auto copy and open Instagram modal
    this.openInstagramOrderModal(igMessage, `Order ${orderId}`);
  }

  handleCheckoutSubmit(e) {
    return this.handleSimpleOrderSubmit(e);
  }

  /* -------------------------------------------------------------
     Sync Offline/Locally Stored Orders to MySQL Backend
  ------------------------------------------------------------- */
  async syncOfflineOrders() {
    try {
      const raw = localStorage.getItem(this.ordersKey);
      if (!raw) return;
      const orders = JSON.parse(raw);
      if (!Array.isArray(orders) || orders.length === 0) return;

      let changed = false;
      for (const ord of orders) {
        if (ord.synced) continue; // Already confirmed in MySQL

        try {
          const apiRes = await fetch(`${this.apiBase}/instagram-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: ord.orderId,
              customerName: ord.customer?.name || ord.customerName || 'Customer',
              customerMobile: ((ord.customer?.phone || ord.customerPhone || '').replace(/\D/g, '')).slice(-10) || '9876543210',
              address: ord.customer?.address || ord.address || 'Address',
              pincode: ord.customer?.pincode || ord.pincode || '400001',
              paymentMethod: ord.paymentMethod || 'Instagram DM (@vision_thread00)',
              subtotal: ord.total || ord.subtotal || 0,
              deliveryCharge: 0,
              discount: 0,
              grandTotal: ord.total || ord.grandTotal || 0,
              items: (ord.items || []).map(i => ({
                productCode: (i.product && i.product.id) || i.productCode || '',
                name: (i.product && i.product.name) || i.name || 'Product',
                category: (i.product && i.product.category) || i.category || 'Handmade',
                price: (i.product && i.product.price) || i.price || 0,
                quantity: i.quantity || 1,
                color: i.selectedColor || i.color || 'Standard',
                customNote: i.customNote || '',
                image: (i.product && i.product.image) || i.image || ''
              }))
            })
          });

          if (apiRes.ok) {
            const resData = await apiRes.json();
            if (resData && resData.success) {
              ord.synced = true;
              changed = true;
            }
          }
        } catch (postErr) {
          // Will retry next time
        }
      }

      if (changed) {
        localStorage.setItem(this.ordersKey, JSON.stringify(orders));
      }
    } catch (e) {
      console.warn('Sync offline orders error:', e);
    }
  }

  /* -------------------------------------------------------------
     Order Confirmation Page
  ------------------------------------------------------------- */
  renderOrderConfirmation() {
    const order = this.latestOrder;
    const detailsContainer = document.getElementById('confirmationDetails');
    const printableReceipt = document.getElementById('printableReceipt');

    if (!detailsContainer) return;

    if (!order) {
      detailsContainer.innerHTML = `
        <div class="py-12 text-center">
          <p class="text-sm text-gray-500">No recent order found.</p>
          <a href="#/shop" class="btn-primary mt-4 inline-block text-xs">Browse Shop</a>
        </div>
      `;
      return;
    }

    detailsContainer.innerHTML = `
      <div class="bg-white border border-pink-200 rounded-3xl p-6 md:p-8 shadow-sm">
        <div class="text-center pb-6 border-b border-pink-100">
          <div class="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mb-3 shadow-inner">
            ✓
          </div>
          <span class="craft-tag">Order Placed Successfully! 🎉</span>
          <h2 class="font-serif text-2xl md:text-3xl font-bold text-gray-900 mt-2">Thank you, ${order.customer.name}!</h2>
          <p class="text-sm text-gray-600 mt-1">Your handmade craft package is being prepared with immense love and care.</p>
          
          <div class="inline-flex items-center gap-3 bg-pink-50 border border-pink-200 px-4 py-2 rounded-xl mt-4">
            <span class="text-xs text-gray-600">Order ID:</span>
            <span class="text-sm font-bold text-pink-600 tracking-wider font-mono">${order.orderId}</span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-b border-pink-100">
          <div>
            <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Delivery Address</h4>
            <p class="text-sm font-semibold text-gray-800">${order.customer.name}</p>
            <p class="text-xs text-gray-600 mt-1 leading-relaxed">
              ${order.customer.address},<br/>
              ${order.customer.city}, ${order.customer.state} - ${order.customer.pincode}<br/>
              📱 ${order.customer.mobile}
            </p>
          </div>

          <div>
            <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Payment & Delivery Info</h4>
            <p class="text-xs text-gray-600">
              <span class="font-semibold text-gray-800">Method:</span> ${order.paymentMethod}<br/>
              <span class="font-semibold text-gray-800">Status:</span> <span class="text-emerald-600 font-bold">Confirmed</span><br/>
              <span class="font-semibold text-gray-800">Estimated Delivery:</span> 3 - 5 Business Days (Handmade)
            </p>
          </div>
        </div>

        <!-- Ordered Items Summary -->
        <div class="py-6 border-b border-pink-100">
          <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Items in This Package</h4>
          <div class="space-y-3">
            ${order.items.map(it => `
              <div class="flex items-center justify-between text-sm">
                <div class="flex items-center gap-3">
                  <img src="${it.product.image}" class="w-12 h-12 rounded-lg object-cover bg-pink-50" />
                  <div>
                    <span class="font-semibold text-gray-800 block">${it.product.name}</span>
                    <span class="text-xs text-pink-600">Color: ${it.selectedColor} • Qty: ${it.quantity}</span>
                  </div>
                </div>
                <span class="font-bold text-gray-900">₹${it.product.price * it.quantity}</span>
              </div>
            `).join('')}
          </div>

          <div class="mt-4 pt-3 border-t border-pink-50 text-sm space-y-1">
            <div class="flex justify-between text-gray-600 text-xs">
              <span>Subtotal</span>
              <span>₹${order.subtotal}</span>
            </div>
            ${order.discount ? `
              <div class="flex justify-between text-emerald-600 text-xs">
                <span>Discount</span>
                <span>-₹${order.discount}</span>
              </div>
            ` : ''}
            <div class="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-pink-100">
              <span>Total Paid</span>
              <span class="text-pink-600 font-sans">₹${order.total}</span>
            </div>
          </div>
        </div>

        <!-- Action Callouts -->
        <div class="pt-6 flex flex-col sm:flex-row gap-3">
          <a href="https://wa.me/${this.contactPhone}?text=Hello%20Vision%20Thread!%20I%20just%20placed%20Order%20%23${order.orderId}%20for%20₹${order.total}.%20Looking%20forward%20to%20my%20handmade%20creations!" 
             target="_blank" rel="noopener noreferrer" 
             class="btn-primary flex-1 text-center text-xs py-3">
            📱 Send Order Details to WhatsApp
          </a>

          <button onclick="window.print()" class="btn-secondary flex-1 text-center text-xs py-3">
            🖨️ Print / Save Receipt
          </button>
        </div>
      </div>
    `;

    // Also populate printable receipt layout
    if (printableReceipt) {
      printableReceipt.innerHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #ec4899; margin-bottom: 2px;">Vision Thread (@vision_thread00)</h2>
          <p style="font-size: 12px; color: #666; margin-top: 0;">Handmade With Love ❤️</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;" />
          <p><strong>Order ID:</strong> ${order.orderId}</p>
          <p><strong>Date:</strong> ${order.date}</p>
          <p><strong>Customer:</strong> ${order.customer.name} (${order.customer.mobile})</p>
          <p><strong>Shipping Address:</strong> ${order.customer.address}, ${order.customer.city}, ${order.customer.state} - ${order.customer.pincode}</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px;">
            <thead>
              <tr style="background: #fdf2f8; text-align: left;">
                <th style="padding: 8px;">Item</th>
                <th style="padding: 8px;">Color</th>
                <th style="padding: 8px;">Qty</th>
                <th style="padding: 8px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(it => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 8px;">${it.product.name}</td>
                  <td style="padding: 8px;">${it.selectedColor}</td>
                  <td style="padding: 8px;">${it.quantity}</td>
                  <td style="padding: 8px;">₹${it.product.price * it.quantity}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="text-align: right; margin-top: 20px; font-size: 14px;">
            <p>Subtotal: ₹${order.subtotal}</p>
            <p><strong>Total Amount: ₹${order.total}</strong></p>
          </div>
          <p style="text-align: center; font-size: 12px; color: #999; margin-top: 30px;">Thank you for supporting small handmade businesses! Follow us on Instagram @vision_thread00</p>
        </div>
      `;
    }
  }

  /* -------------------------------------------------------------
     Custom Order Form Handling ("Made Just For You 💕")
  ------------------------------------------------------------- */
  async handleCustomOrderSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const name = form.customName.value.trim();
    const mobile = form.customMobile.value.trim();
    const productType = form.customProduct.value;
    const color = form.customColor.value.trim();
    const qty = form.customQty.value || 1;
    const requirements = form.customReq.value.trim();

    if (!name || !mobile || !requirements) {
      this.showToast('Please fill in your name, mobile, and custom requirements.');
      return;
    }

    // Save custom order to MySQL database via Backend API
    try {
      await fetch(`${this.apiBase}/custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          mobile: mobile,
          productType: productType,
          preferredColor: color,
          quantity: parseInt(qty) || 1,
          requirements: requirements
        })
      });
    } catch (err) {
      console.warn('Backend custom order sync note:', err.message);
    }

    // Format WhatsApp message
    const msg = `Hello Vision Thread! 💕%0A%0A*New Custom Order Request:*%0A• *Name:* ${encodeURIComponent(name)}%0A• *Mobile:* ${encodeURIComponent(mobile)}%0A• *Product/Design:* ${encodeURIComponent(productType)}%0A• *Preferred Color:* ${encodeURIComponent(color || 'Open to suggestions')}%0A• *Quantity:* ${qty}%0A• *Custom Requirements:* ${encodeURIComponent(requirements)}%0A%0APlease let me know the price quote and timeline!`;

    // Show success dialog
    alert(`Thank you, ${name}! Your custom craft request has been saved and prepared. Clicking OK will open WhatsApp directly with your request details.`);

    // Open WhatsApp
    window.open(`https://wa.me/${this.contactPhone}?text=${msg}`, '_blank');
    form.reset();
  }

  /* -------------------------------------------------------------
     Contact Form Handling
  ------------------------------------------------------------- */
  async handleContactSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const name = (form.contactName ? form.contactName.value : form.querySelector('input[type="text"]').value).trim();
    const mobile = (form.contactMobile ? form.contactMobile.value : form.querySelector('input[type="tel"]').value).trim();
    const message = (form.contactMessage ? form.contactMessage.value : form.querySelector('textarea').value).trim();

    if (!name || !mobile || !message) {
      this.showToast('Please fill in your name, mobile number, and message.');
      return;
    }

    try {
      const res = await fetch(`${this.apiBase}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mobile, message })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        this.showToast('✨ Thank you! Your message has been sent to Vision Thread.');
      } else {
        this.showToast(data.message || 'Message sent! We will reply soon.');
      }
    } catch (err) {
      this.showToast('✨ Thank you! Your message has been received.');
    }

    form.reset();
  }

  previewCustomImage(input) {
    const preview = document.getElementById('customImagePreview');
    const container = document.getElementById('customImagePreviewContainer');
    if (!input.files || !input.files[0]) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (preview && container) {
        preview.src = e.target.result;
        container.classList.remove('hidden');
      }
    };
    reader.readAsDataURL(input.files[0]);
  }

  /* -------------------------------------------------------------
     Instagram Feed Showcase
  ------------------------------------------------------------- */
  renderInstagramGrid() {
    const container = document.getElementById('instagramPostsGrid');
    if (!container) return;

    const posts = [
      {
        img: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80',
        caption: 'Handcrafted Lily bouquets freshly wrapped for today’s dispatch 🌸✨',
        likes: '342'
      },
      {
        img: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=600&q=80',
        caption: 'Aesthetic pastel hair ties with soft plush charms 🎀 handmade happiness',
        likes: '284'
      },
      {
        img: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80',
        caption: 'Sunflowers that never wither 🌻 Bring sunshine into someone’s room',
        likes: '519'
      },
      {
        img: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=600&q=80',
        caption: 'Festive torans & garlands for your auspicious celebrations 🪔✨',
        likes: '410'
      }
    ];

    container.innerHTML = posts.map(post => `
      <a href="https://instagram.com/${this.instagramHandle}" target="_blank" rel="noopener noreferrer" 
         class="group relative overflow-hidden rounded-2xl aspect-square shadow-sm bg-pink-100 block">
        <img src="${post.img}" alt="Instagram Post" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div class="absolute inset-0 bg-pink-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 text-white">
          <div class="flex items-center gap-1.5 text-xs font-semibold mb-1">
            ❤️ ${post.likes} likes
          </div>
          <p class="text-xs line-clamp-2 text-pink-100">${post.caption}</p>
          <span class="text-[11px] font-bold text-pink-300 mt-2 flex items-center gap-1">
            View on Instagram →
          </span>
        </div>
      </a>
    `).join('');
  }

  /* -------------------------------------------------------------
     Instagram Ordering Methods (@vision_thread00)
  ------------------------------------------------------------- */
  generateProductOrderText(product, quantity = 1, color = 'Standard', note = '') {
    const siteUrl = window.location.origin + window.location.pathname;
    const prodUrl = `${siteUrl}#/shop?product=${product.id}`;
    const total = (product.price * quantity);

    const lines = [
      `🌸 *Order Inquiry for Vision Thread (@vision_thread00)* 🌸`,
      ``,
      `Hello! I would like to order this handcrafted item:`,
      `✨ *Product:* ${product.name}`,
      `💰 *Price:* ₹${product.price} each (Total: ₹${total})`,
      `🔢 *Quantity:* ${quantity}`,
      `🎨 *Color:* ${color || 'Standard'}`,
    ];
    if (note && note.trim()) {
      lines.push(`📝 *Custom Note:* ${note.trim()}`);
    }
    lines.push(`🔗 *Product Link:* ${prodUrl}`);
    lines.push(``);
    lines.push(`Please confirm availability, crafting time, and payment details. Thank you! ❤️`);
    return lines.join('\n');
  }

  generateCartOrderText() {
    if (this.cart.length === 0) return '';
    const siteUrl = window.location.origin + window.location.pathname;
    const subtotal = this.getCartSubtotal();
    const delivery = this.getDeliveryCharge();
    const discount = this.getDiscount();
    const total = this.getCartTotal();

    const itemsText = this.cart.map((item, idx) => {
      const prodUrl = `${siteUrl}#/shop?product=${item.product.id}`;
      const itemLines = [
        `${idx + 1}. *${item.product.name}*`,
        `   • Price: ₹${item.product.price} × ${item.quantity} = ₹${item.product.price * item.quantity}`,
        `   • Color: ${item.selectedColor || 'Standard'}`
      ];
      if (item.customNote && item.customNote.trim()) {
        itemLines.push(`   • Note: "${item.customNote.trim()}"`);
      }
      itemLines.push(`   • Link: ${prodUrl}`);
      return itemLines.join('\n');
    }).join('\n\n');

    const lines = [
      `🌸 *Cart Order Inquiry - Vision Thread (@vision_thread00)* 🌸`,
      ``,
      `Hello! I would like to place an order for the items in my craft basket:`,
      ``,
      itemsText,
      ``,
      `📊 *Order Summary:*`,
      `• Subtotal: ₹${subtotal}`,
    ];
    if (discount > 0) {
      lines.push(`• Discount: -₹${discount}`);
    }
    lines.push(`• *Grand Total: ₹${total}*`);
    lines.push(``);
    lines.push(`Please let me know how to proceed with payment and delivery. Thank you! ❤️`);
    return lines.join('\n');
  }

  orderViaInstagramFromCart() {
    if (this.cart.length === 0) {
      this.showToast('Your craft basket is empty! Please add products first.');
      return;
    }
    this.buyNowItem = null;
    this.closeCartDrawer();
    this.navigateTo('#/checkout');
    this.renderCheckoutSummary();
  }

  orderViaInstagramFromDetail() {
    this.buyNowDetail();
  }

  openInstagramOrderModal(message, title = '') {
    const modal = document.getElementById('instagramOrderModal');
    const textarea = document.getElementById('igOrderMessageText');
    const copyStatus = document.getElementById('igCopyStatusText');
    if (textarea) textarea.value = message;

    // Try auto-copying to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(message)
        .then(() => {
          if (copyStatus) copyStatus.textContent = '✅ Order details copied to clipboard!';
          this.showToast('📋 Order details copied! Opening Instagram DM (@vision_thread00)...');
        })
        .catch(() => {
          if (copyStatus) copyStatus.textContent = 'Click "Copy Again" below to copy your message.';
        });
    }

    if (modal) modal.classList.add('open');

    // Open Instagram DM in new window or redirect
    try {
      const igWin = window.open('https://ig.me/m/vision_thread00', '_blank');
      if (!igWin) {
        // Popups blocked, user can click the button in modal
      }
    } catch (e) {
      // Fallback
    }
  }

  closeInstagramOrderModal() {
    document.getElementById('instagramOrderModal')?.classList.remove('open');
  }

  copyInstagramMessage() {
    const textarea = document.getElementById('igOrderMessageText');
    if (!textarea) return;
    textarea.select();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textarea.value);
    } else {
      document.execCommand('copy');
    }
    const copyStatus = document.getElementById('igCopyStatusText');
    if (copyStatus) copyStatus.textContent = '✅ Copied to clipboard! Ready to paste into Instagram DM.';
    this.showToast('📋 Copied! Paste into Instagram DM (@vision_thread00)');
  }

  /* -------------------------------------------------------------
     Toast Notification System
  ------------------------------------------------------------- */
  showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span class="text-pink-600 font-bold">🌸</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  /* -------------------------------------------------------------
     Confetti Animation
  ------------------------------------------------------------- */
  launchConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ec4899', '#f472b6', '#fb7185', '#fce7f3', '#f59e0b']
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#ec4899', '#f472b6', '#34d399']
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#ec4899', '#f472b6', '#34d399']
        });
      }, 250);
    }
  }

  /* -------------------------------------------------------------
     DOM Event Bindings
  ------------------------------------------------------------- */
  bindEvents() {
    // Header search
    const headerSearch = document.getElementById('headerSearchInput');
    if (headerSearch) {
      headerSearch.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        if (window.location.hash !== '#/shop') {
          this.navigateTo('#/shop');
        }
        this.renderShopProducts();
      });
    }

    // Shop search
    const shopSearch = document.getElementById('shopSearchInput');
    if (shopSearch) {
      shopSearch.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.renderShopProducts();
      });
    }

    // Filters
    const priceFilter = document.getElementById('priceFilterSelect');
    if (priceFilter) {
      priceFilter.addEventListener('change', (e) => {
        this.priceFilter = e.target.value;
        this.renderShopProducts();
      });
    }

    const sortFilter = document.getElementById('sortFilterSelect');
    if (sortFilter) {
      sortFilter.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.renderShopProducts();
      });
    }

    // Mobile Navigation Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenuDrawer');
    if (mobileMenuBtn && mobileMenu) {
      mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
      });
    }

    // Close drawers on backdrop click
    document.getElementById('cartDrawerBackdrop')?.addEventListener('click', (e) => {
      if (e.target.id === 'cartDrawerBackdrop') this.closeCartDrawer();
    });

    document.getElementById('wishlistDrawerBackdrop')?.addEventListener('click', (e) => {
      if (e.target.id === 'wishlistDrawerBackdrop') this.closeWishlistDrawer();
    });

    document.getElementById('productDetailsModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'productDetailsModal') this.closeProductModal();
    });

    document.getElementById('adminModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'adminModal') this.closeAdminModal();
    });
  }
}

// Instantiate App when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new VisionThreadApp();
});
