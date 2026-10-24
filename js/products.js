const DATA_VERSION = '1792852720592'; // bumped for real-time mobile sync

/**
 * Vision Thread (@vision_thread00) - Product Catalog
 * 
 * HOW TO ADD A NEW PRODUCT:
 * Simply add a new object to the defaultProducts array below, or use the 
 * "Admin Product Manager" in the website footer/menu!
 * 
 * Required fields:
 * - id: unique string (e.g. 'vt-13')
 * - name: Title of your handmade craft
 * - category: One of ['Handmade Flowers', 'Hair Accessories', 'Keychains', 'Bouquets', 'Gifts & Hampers', 'Festive Crafts', 'Home Decor', 'Other Crafts']
 * - price: Current selling price in INR (₹)
 * - originalPrice: (Optional) Higher MRP to show a discount badge
 * - shortDescription: 1-line summary for cards
 * - fullDescription: Full story, materials, craft technique
 * - image: URL of main product image
 * - gallery: Array of image URLs for gallery preview
 * - colors: Available color options
 * - badge: Badge to display ('Bestseller', 'Handmade', 'Trending', etc.)
 * - customizable: true / false
 * - inStock: true / false
 */

const CATEGORIES = [
  { id: 'all', name: 'All Crafts', icon: '✨', count: 12 },
  { id: 'Handmade Flowers', name: 'Handmade Flowers', icon: '🌸', count: 2, image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80' },
  { id: 'Hair Accessories', name: 'Hair Accessories', icon: '🎀', count: 3, image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=600&q=80' },
  { id: 'Keychains', name: 'Keychains', icon: '🔑', count: 1, image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80' },
  { id: 'Bouquets', name: 'Bouquets', icon: '💐', count: 4, image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80' },
  { id: 'Gifts & Hampers', name: 'Gifts & Hampers', icon: '🎁', count: 1, image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80' },
  { id: 'Festive Crafts', name: 'Festive Crafts', icon: '🪔', count: 2, image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=600&q=80' },
  { id: 'Home Decor', name: 'Home Decor', icon: '🏠', count: 1, image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80' },
  { id: 'Other Crafts', name: 'Other Crafts', icon: '✨', count: 1, image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=600&q=80' }
];

const DEFAULT_PRODUCTS = [
  {
    "id": "vt-mvi95c88",
    "dbId": 27,
    "productCode": "vt-mvi95c88",
    "name": "Hair Tie",
    "category": "Hair Accessories",
    "price": 70,
    "originalPrice": 100,
    "rating": 5,
    "reviewsCount": 0,
    "badge": null,
    "shortDescription": "handmade",
    "fullDescription": "",
    "image": "/uploads/prod_1792595588943_WhatsApp_Image_2026-10-20_at_2_40_07_PM__2_.jpeg",
    "relativeImage": "/uploads/prod_1792595588943_WhatsApp_Image_2026-10-20_at_2_40_07_PM__2_.jpeg",
    "gallery": [
      "/uploads/prod_1792595588943_WhatsApp_Image_2026-10-20_at_2_40_07_PM__2_.jpeg"
    ],
    "colors": [
      "Pink",
      "White"
    ],
    "materials": "",
    "dimensions": "",
    "customizable": true,
    "inStock": true,
    "createdAt": "2026-10-21T15:13:39.000Z",
    "updatedAt": "2026-10-24T14:38:40.000Z"
  },
  {
    "id": "vt-mvi8mc5l",
    "dbId": 26,
    "productCode": "vt-mvi8mc5l",
    "name": "lily keychain",
    "category": "Keychains",
    "price": 50,
    "originalPrice": 80,
    "rating": 5,
    "reviewsCount": 0,
    "badge": null,
    "shortDescription": "handmade",
    "fullDescription": "",
    "image": "/uploads/prod_1792594686194_WhatsApp_Image_2026-10-20_at_2_40_02_PM.jpeg",
    "relativeImage": "/uploads/prod_1792594686194_WhatsApp_Image_2026-10-20_at_2_40_02_PM.jpeg",
    "gallery": [
      "/uploads/prod_1792594686194_WhatsApp_Image_2026-10-20_at_2_40_02_PM.jpeg"
    ],
    "colors": [
      "Pink",
      "White"
    ],
    "materials": "",
    "dimensions": "",
    "customizable": true,
    "inStock": true,
    "createdAt": "2026-10-21T14:58:52.000Z",
    "updatedAt": "2026-10-21T14:58:52.000Z"
  },
  {
    "id": "vt-mvi7oc0n",
    "dbId": 25,
    "productCode": "vt-mvi7oc0n",
    "name": "handmade flower",
    "category": "Handmade Flowers",
    "price": 100,
    "originalPrice": 120,
    "rating": 5,
    "reviewsCount": 0,
    "badge": null,
    "shortDescription": "handmade",
    "fullDescription": "",
    "image": "/uploads/prod_1792593114329_WhatsApp_Image_2026-10-20_at_2_40_09_PM.jpeg",
    "relativeImage": "/uploads/prod_1792593114329_WhatsApp_Image_2026-10-20_at_2_40_09_PM.jpeg",
    "gallery": [
      "/uploads/prod_1792593114329_WhatsApp_Image_2026-10-20_at_2_40_09_PM.jpeg"
    ],
    "colors": [
      "Pink",
      "White"
    ],
    "materials": "",
    "dimensions": "",
    "customizable": false,
    "inStock": true,
    "createdAt": "2026-10-21T14:32:26.000Z",
    "updatedAt": "2026-10-21T14:47:14.000Z"
  },
  {
    "id": "vt-01",
    "dbId": 1,
    "productCode": "vt-01",
    "name": "sunflower Bouquet",
    "category": "Bouquets",
    "price": 50,
    "originalPrice": 350,
    "rating": 4.9,
    "reviewsCount": 38,
    "badge": "Bestseller",
    "shortDescription": "Delicate handmade lilies crafted with velvety chenille pipe cleaners and ribbon wraps.",
    "fullDescription": "Handcrafted with intricate love and patience, this Pink & Purple Lily Bouquet is an everlasting floral treasure.",
    "image": "/uploads/prod_1791566944633_WhatsApp_Image_2026-08-15_at_12_28_43_PM__2_.jpeg",
    "relativeImage": "/uploads/prod_1791566944633_WhatsApp_Image_2026-08-15_at_12_28_43_PM__2_.jpeg",
    "gallery": [
      "/uploads/prod_1791566944633_WhatsApp_Image_2026-08-15_at_12_28_43_PM__2_.jpeg"
    ],
    "colors": [
      "Pink & Lilac",
      "Blush Pink",
      "Pure Purple",
      "Pastel Mix"
    ],
    "materials": "High density velvet pipe cleaners, floral wire stem",
    "dimensions": "Height: 30cm, Width: 18cm",
    "customizable": true,
    "inStock": true,
    "createdAt": "2026-10-09T15:49:37.000Z",
    "updatedAt": "2026-10-20T11:00:10.000Z"
  },
  {
    "id": "vt-02",
    "dbId": 2,
    "productCode": "vt-02",
    "name": "tulip keychain",
    "category": "Keychains",
    "price": 50,
    "originalPrice": 80,
    "rating": 4.8,
    "reviewsCount": 24,
    "badge": "Popular Gift",
    "shortDescription": "Charming single-stem handmade rose or tulip wrapped with Korean aesthetic paper.",
    "fullDescription": "A minimalist yet profoundly sweet token of affection.",
    "image": "/uploads/prod_1792489207816_WhatsApp_Image_2026-10-20_at_2_39_54_PM.jpeg",
    "relativeImage": "/uploads/prod_1792489207816_WhatsApp_Image_2026-10-20_at_2_39_54_PM.jpeg",
    "gallery": [
      "/uploads/prod_1792489207816_WhatsApp_Image_2026-10-20_at_2_39_54_PM.jpeg"
    ],
    "colors": [],
    "materials": "Chenille craft stem, floral tape, cellophane wrap",
    "dimensions": "Height: 28cm, Width: 12cm",
    "customizable": true,
    "inStock": true,
    "createdAt": "2026-10-09T15:49:37.000Z",
    "updatedAt": "2026-10-20T11:00:10.000Z"
  },
  {
    "id": "vt-05",
    "dbId": 5,
    "productCode": "vt-05",
    "name": "lotus Flower",
    "category": "Handmade Flowers",
    "price": 100,
    "originalPrice": 120,
    "rating": 4.9,
    "reviewsCount": 65,
    "badge": "Affordable Gem",
    "shortDescription": "Traditional fragrant-looking Frangipani / Chafa flower, perfect for hair buns & puja decor.",
    "fullDescription": "Lovingly styled after the revered Indian Champa / Chafa (Plumeria) flower.",
    "image": "/uploads/prod_1792489385502_WhatsApp_Image_2026-10-20_at_2_40_17_PM.jpeg",
    "relativeImage": "/uploads/prod_1792489385502_WhatsApp_Image_2026-10-20_at_2_40_17_PM.jpeg",
    "gallery": [
      "/uploads/prod_1792489385502_WhatsApp_Image_2026-10-20_at_2_40_17_PM.jpeg"
    ],
    "colors": [
      "Classic White & Yellow",
      "Blush Pink & Peach"
    ],
    "materials": "Craft foam & chenille petal blend",
    "dimensions": "Diameter: 6.5cm",
    "customizable": true,
    "inStock": true,
    "createdAt": "2026-10-09T15:49:37.000Z",
    "updatedAt": "2026-10-20T11:00:10.000Z"
  },
  {
    "id": "vt-06",
    "dbId": 6,
    "productCode": "vt-06",
    "name": "Rangoli Mat",
    "category": "Festive Crafts",
    "price": 200,
    "originalPrice": 220,
    "rating": 5,
    "reviewsCount": 19,
    "badge": "Festive Special",
    "shortDescription": "Graceful floral garland (haar) crafted for home mandirs, photo frames, or Ganpati decor.",
    "fullDescription": "An everlasting, eco-friendly garland crafted with soft colorful pipe cleaner blossoms.",
    "image": "/uploads/prod_1792489483786_WhatsApp_Image_2026-10-20_at_2_40_15_PM__1_.jpeg",
    "relativeImage": "/uploads/prod_1792489483786_WhatsApp_Image_2026-10-20_at_2_40_15_PM__1_.jpeg",
    "gallery": [
      "/uploads/prod_1792489483786_WhatsApp_Image_2026-10-20_at_2_40_15_PM__1_.jpeg"
    ],
    "colors": [
      "Marigold Orange & Red",
      "Rose Pink & White"
    ],
    "materials": "Premium chenille pipe cleaners, golden spacer beads/ all available in all colours",
    "dimensions": "Length: 45cm (adjustable)",
    "customizable": true,
    "inStock": true,
    "createdAt": "2026-10-09T15:49:37.000Z",
    "updatedAt": "2026-10-20T11:00:10.000Z"
  },
  {
    "id": "vt-07",
    "dbId": 7,
    "productCode": "vt-07",
    "name": "Handmade diya holder pair",
    "category": "Festive Crafts",
    "price": 100,
    "originalPrice": 120,
    "rating": 4.8,
    "reviewsCount": 45,
    "badge": "Everyday Cute",
    "shortDescription": "Snag-free elastic scrunchie hair tie adorned with handmade miniature floral or bow charm.",
    "fullDescription": "Treat your hair to soft, stylish luxury!",
    "image": "/uploads/prod_1792490041199_WhatsApp_Image_2026-10-20_at_2_40_14_PM.jpeg",
    "relativeImage": "/uploads/prod_1792490041199_WhatsApp_Image_2026-10-20_at_2_40_14_PM.jpeg",
    "gallery": [
      "/uploads/prod_1792490041199_WhatsApp_Image_2026-10-20_at_2_40_14_PM.jpeg"
    ],
    "colors": [
      "Dusty Rose Pink",
      "Mint Green",
      "Lilac Dream"
    ],
    "materials": "Seamless stretch elastic band, chenille floral accent",
    "dimensions": "Diameter: 8cm",
    "customizable": true,
    "inStock": true,
    "createdAt": "2026-10-09T15:49:37.000Z",
    "updatedAt": "2026-10-20T11:00:10.000Z"
  },
  {
    "id": "vt-08",
    "dbId": 8,
    "productCode": "vt-08",
    "name": "Handmade Hair Tie",
    "category": "Hair Accessories",
    "price": 100,
    "originalPrice": 150,
    "rating": 4.9,
    "reviewsCount": 52,
    "badge": "Top Pick",
    "shortDescription": "Aesthetic alligator hair clip decorated with handcrafted fluffy blooms and pearls.",
    "fullDescription": "Step up your aesthetic hairdo!",
    "image": "/uploads/prod_1792490176747_WhatsApp_Image_2026-10-20_at_2_40_08_PM.jpeg",
    "relativeImage": "/uploads/prod_1792490176747_WhatsApp_Image_2026-10-20_at_2_40_08_PM.jpeg",
    "gallery": [
      "/uploads/prod_1792490176747_WhatsApp_Image_2026-10-20_at_2_40_08_PM.jpeg"
    ],
    "colors": [
      "Blush Pink Blossom",
      "Sky Blue Daisy",
      "Vintage Mauve"
    ],
    "materials": "Gold-finish alloy clip, grosgrain ribbon",
    "dimensions": "Length: 6cm, Width: 3.5cm",
    "customizable": true,
    "inStock": true,
    "createdAt": "2026-10-09T15:49:37.000Z",
    "updatedAt": "2026-10-20T11:00:10.000Z"
  },
  {
    "id": "vt-09",
    "dbId": 9,
    "productCode": "vt-09",
    "name": "Butterfly hair tie",
    "category": "Hair Accessories",
    "price": 100,
    "originalPrice": 120,
    "rating": 4.9,
    "reviewsCount": 29,
    "badge": "Kids & Teens Love",
    "shortDescription": "Comfortable flexible headband wrapped in satin and adorned with vibrant 3D flowers.",
    "fullDescription": "Designed for painless all-day wear!",
    "image": "/uploads/prod_1792490230105_WhatsApp_Image_2026-10-20_at_2_40_08_PM__1_.jpeg",
    "relativeImage": "/uploads/prod_1792490230105_WhatsApp_Image_2026-10-20_at_2_40_08_PM__1_.jpeg",
    "gallery": [
      "/uploads/prod_1792490230105_WhatsApp_Image_2026-10-20_at_2_40_08_PM__1_.jpeg"
    ],
    "colors": [
      "Pastel Multi-Flower",
      "Princess Pink & Pearls"
    ],
    "materials": "Flexible resin headband, satin wrap",
    "dimensions": "One size fits all (flexible)",
    "customizable": true,
    "inStock": true,
    "createdAt": "2026-10-09T15:49:37.000Z",
    "updatedAt": "2026-10-20T11:00:10.000Z"
  },
  {
    "id": "vt-10",
    "dbId": 10,
    "productCode": "vt-10",
    "name": "Hibiscus flower",
    "category": "Handmade Flowers",
    "price": 80,
    "originalPrice": 100,
    "rating": 5,
    "reviewsCount": 37,
    "badge": "Artisan Favorite",
    "shortDescription": "Regal handcrafted peacock charm with emerald and royal blue feather plumes.",
    "fullDescription": "A dazzling miniature masterpiece for your keys, handbag, or backpack.",
    "image": "/uploads/prod_1792490324018_WhatsApp_Image_2026-10-20_at_2_40_07_PM__1_.jpeg",
    "relativeImage": "/uploads/prod_1792490324018_WhatsApp_Image_2026-10-20_at_2_40_07_PM__1_.jpeg",
    "gallery": [
      "/uploads/prod_1792490324018_WhatsApp_Image_2026-10-20_at_2_40_07_PM__1_.jpeg"
    ],
    "colors": [
      "Royal Peacock (Blue & Green)",
      "Rose Gold Peacock"
    ],
    "materials": "Metallic craft thread, chenille wire, brass keyring",
    "dimensions": "Length: 11cm including chain",
    "customizable": true,
    "inStock": true,
    "createdAt": "2026-10-09T15:49:37.000Z",
    "updatedAt": "2026-10-20T11:00:10.000Z"
  },
  {
    "id": "vt-11",
    "dbId": 11,
    "productCode": "vt-11",
    "name": "Handmade Rangoli mat",
    "category": "Festive Crafts",
    "price": 200,
    "originalPrice": 220,
    "rating": 5,
    "reviewsCount": 48,
    "badge": "Diwali & Housewarming",
    "shortDescription": "Traditional handcrafted door hanging with marigolds, mango leaves, and brass bells.",
    "fullDescription": "Welcome prosperity and warmth into your home!",
    "image": "/uploads/prod_1792489619212_WhatsApp_Image_2026-10-20_at_2_40_16_PM.jpeg",
    "relativeImage": "/uploads/prod_1792489619212_WhatsApp_Image_2026-10-20_at_2_40_16_PM.jpeg",
    "gallery": [
      "/uploads/prod_1792489619212_WhatsApp_Image_2026-10-20_at_2_40_16_PM.jpeg"
    ],
    "colors": [
      "Marigold Yellow & Orange",
      "Festive Red & Gold"
    ],
    "materials": "Hand-shaped chenille floral accents, golden gota patti",
    "dimensions": "Standard 3-foot doorway width (90cm)",
    "customizable": true,
    "inStock": true,
    "createdAt": "2026-10-09T15:49:37.000Z",
    "updatedAt": "2026-10-20T11:00:10.000Z"
  },
  {
    "id": "vt-12",
    "dbId": 12,
    "productCode": "vt-12",
    "name": "Handmade Gift Hamper",
    "category": "Gifts & Hampers",
    "price": 850,
    "originalPrice": 1200,
    "rating": 5,
    "reviewsCount": 60,
    "badge": "Ultimate Gift",
    "shortDescription": "Curated luxury craft box: mini bouquet, hair accessories, custom keychain & sweet note.",
    "fullDescription": "The ultimate bespoke gifting experience!",
    "image": "/uploads/prod_1792594088784_WhatsApp_Image_2026-10-20_at_2_39_58_PM.jpeg",
    "relativeImage": "/uploads/prod_1792594088784_WhatsApp_Image_2026-10-20_at_2_39_58_PM.jpeg",
    "gallery": [
      "/uploads/prod_1792594088784_WhatsApp_Image_2026-10-20_at_2_39_58_PM.jpeg"
    ],
    "colors": [
      "Pastel Pink Blossom",
      "Royal Lavender",
      "Golden Sunflower"
    ],
    "materials": "Rigid kraft gift box, shredded wood bedding, satin ribbon",
    "dimensions": "Box: 25cm x 20cm x 10cm",
    "customizable": true,
    "inStock": true,
    "createdAt": "2026-10-09T15:49:37.000Z",
    "updatedAt": "2026-10-21T14:48:11.000Z"
  }
];

window.getVtApiBase = function() {
  if (typeof window === 'undefined' || !window.location) return 'http://localhost:5000/api';
  if (window.VISION_THREAD_API_BASE) return window.VISION_THREAD_API_BASE;
  const customBase = localStorage.getItem('vt_api_base');
  if (customBase) return customBase.replace(/\/+$/, '');

  const proto = window.location.protocol;
  const host = window.location.hostname;
  const port = window.location.port;

  if (proto === 'file:') return 'http://localhost:5000/api';
  if (port === '5000') return '/api';
  if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') return `http://${host}:5000/api`;
  if (/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(host)) return `${proto}//${host}:5000/api`;
  return `${window.location.origin}/api`;
};

class ProductStore {
  constructor() {
    this.storageKey = 'vision_thread_products';
    this.catalogVersion = '';
    this.lastSyncedAt = 0;
    this.isSyncing = false;
    this.init();
  }

  init() {
    const savedVersion = localStorage.getItem(this.storageKey + '_version');
    const saved = localStorage.getItem(this.storageKey);
    this.catalogVersion = localStorage.getItem(this.storageKey + '_catalog_version') || '';

    // If data version changed or cache is empty, refresh from latest defaults
    if (saved && savedVersion === DATA_VERSION) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.products = parsed;
        } else {
          this.products = [...DEFAULT_PRODUCTS];
        }
      } catch (e) {
        this.products = [...DEFAULT_PRODUCTS];
      }
    } else {
      this.products = [...DEFAULT_PRODUCTS];
      this.save();
    }

    // Immediately sync with database on startup
    this.syncWithBackend(true);
  }

  hasCatalogChanged(prev, next) {
    if (!Array.isArray(prev) || !Array.isArray(next)) return true;
    if (prev.length !== next.length) return true;
    for (let i = 0; i < prev.length; i++) {
      const p = prev[i];
      const n = next[i];
      if (!p || !n) return true;
      if (p.id !== n.id || p.price !== n.price || p.inStock !== n.inStock || p.image !== n.image || p.name !== n.name) {
        return true;
      }
    }
    return false;
  }

  async syncWithBackend(forceRefresh = false) {
    if (this.isSyncing && !forceRefresh) return;
    this.isSyncing = true;

    try {
      const apiBase = window.getVtApiBase();
      const res = await fetch(`${apiBase}/products?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Bypass-Tunnel-Reminder': '1',
          'bypass-tunnel-reminder': '1',
        },
      });

      if (!res.ok) {
        this.isSyncing = false;
        return false;
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        const incomingVersion = data.catalogVersion || this.catalogVersion || `v${data.products.length}`;
        const changed = this.hasCatalogChanged(this.products, data.products);

        this.products = data.products;
        this.catalogVersion = incomingVersion;
        this.lastSyncedAt = Date.now();
        this.save();

        if (changed || forceRefresh) {
          try {
            window.dispatchEvent(new CustomEvent('vt:products-synced', { detail: { products: this.products, changed } }));
          } catch (evErr) {}

          // Only trigger UI re-renders if products actually changed
          if (changed) {
            if (window.app && typeof window.app.onProductsSynced === 'function') {
              window.app.onProductsSynced(true);
            }
          }
        }
        this.isSyncing = false;
        return true;
      }
    } catch (e) {
      // Backend offline: gracefully keep local products
    } finally {
      this.isSyncing = false;
    }
    return false;
  }

  async checkCatalogVersion() {
    try {
      const apiBase = window.getVtApiBase();
      const res = await fetch(`${apiBase}/products/version?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Bypass-Tunnel-Reminder': '1',
          'bypass-tunnel-reminder': '1',
        },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && data.version) {
        if (this.catalogVersion && data.version === this.catalogVersion && (typeof data.total !== 'number' || data.total === this.products.length)) {
          return;
        }
        await this.syncWithBackend(false);
      }
    } catch (e) {}
  }

  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.products));
    localStorage.setItem(this.storageKey + '_version', DATA_VERSION);
    if (this.catalogVersion) {
      localStorage.setItem(this.storageKey + '_catalog_version', this.catalogVersion);
    }
  }

  getAll() {
    return [...this.products];
  }

  getById(id) {
    if (!id) return null;
    return this.products.find(p => p.id === id || p.productCode === id || (p.dbId && String(p.dbId) === String(id))) || null;
  }

  getByCategory(cat) {
    if (!cat || cat === 'all') return this.getAll();
    return this.products.filter(p => (p.category || '').toLowerCase() === cat.toLowerCase());
  }

  getCategories() {
    const all = this.getAll();
    return CATEGORIES.map(cat => {
      if (cat.id === 'all') {
        return { ...cat, count: all.length };
      }
      const count = all.filter(p => (p.category || '').toLowerCase() === cat.id.toLowerCase()).length;
      return { ...cat, count };
    });
  }

  add(product) {
    const newProduct = {
      id: 'vt-' + Date.now().toString(36),
      rating: 5.0,
      reviewsCount: 1,
      gallery: product.gallery && product.gallery.length ? product.gallery : [product.image],
      colors: product.colors || ['Pink', 'White'],
      customizable: true,
      inStock: true,
      ...product
    };
    this.products.unshift(newProduct);
    this.save();
    return newProduct;
  }

  update(id, updatedFields) {
    const index = this.products.findIndex(p => p.id === id || p.productCode === id || (p.dbId && String(p.dbId) === String(id)));
    if (index !== -1) {
      this.products[index] = { ...this.products[index], ...updatedFields };
      this.save();
      return this.products[index];
    }
    return null;
  }

  delete(id) {
    const index = this.products.findIndex(p => p.id === id || p.productCode === id || (p.dbId && String(p.dbId) === String(id)));
    if (index !== -1) {
      const removed = this.products.splice(index, 1)[0];
      this.save();
      return removed;
    }
    return null;
  }

  resetToDefaults() {
    this.products = [...DEFAULT_PRODUCTS];
    this.save();
    return this.products;
  }
}

// Global instance
window.productStore = new ProductStore();
window.PRODUCT_CATEGORIES = CATEGORIES;
