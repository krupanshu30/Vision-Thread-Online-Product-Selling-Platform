const DATA_VERSION = '2.1'; // bump this when product data changes

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
    id: 'vt-01',
    name: 'Pink & Purple Lily Bouquet',
    category: 'Bouquets',
    price: 200,
    originalPrice: 350,
    rating: 4.9,
    reviewsCount: 38,
    badge: 'Bestseller',
    shortDescription: 'Delicate handmade lilies crafted with velvety chenille pipe cleaners and ribbon wraps.',
    fullDescription: 'Handcrafted with intricate love and patience, this Pink & Purple Lily Bouquet is an everlasting floral treasure. Made with soft velvet chenille pipe cleaners, delicate stamen detailing, and wrapped in premium Korean waterproof floral wrapping with a satin pink ribbon. Perfect for birthdays, anniversaries, and desk decor that never wilts.',
    image: 'images/pink-purple-lily-bouquet.jpg',
    gallery: [
      'images/pink-purple-lily-bouquet.jpg',
      'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80'
    ],
    colors: ['Pink & Lilac', 'Blush Pink', 'Pure Purple', 'Pastel Mix'],
    customizable: true,
    inStock: true,
    materials: 'High density velvet pipe cleaners, floral wire stem, craft wrapping paper, double-faced satin ribbon',
    dimensions: 'Height: 30cm, Width: 18cm'
  },
  {
    id: 'vt-02',
    name: 'Single Handmade Flower Bouquet',
    category: 'Bouquets',
    price: 250,
    originalPrice: 320,
    rating: 4.8,
    reviewsCount: 24,
    badge: 'Popular Gift',
    shortDescription: 'Charming single-stem handmade rose or tulip wrapped with Korean aesthetic paper.',
    fullDescription: 'A minimalist yet profoundly sweet token of affection. Each single blossom is hand-shaped petal by petal using soft tactile craft materials, nestled in translucent mist wrapping paper with a sweet handwritten card tag. Ideal for school farewells, party favors, or romantic surprises.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508615070457-7baeba4003ab?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80'
    ],
    colors: ['Cherry Red', 'Soft Pink', 'Baby Blue', 'Sunshine Yellow', 'Lavender'],
    customizable: true,
    inStock: true,
    materials: 'Chenille craft stem, floral tape, cellophane wrap, gift ribbon',
    dimensions: 'Height: 28cm, Width: 12cm'
  },
  {
    id: 'vt-03',
    name: 'Sunflower & Daisy Bouquet',
    category: 'Bouquets',
    price: 300,
    originalPrice: 399,
    rating: 5.0,
    reviewsCount: 42,
    badge: 'Trending',
    shortDescription: 'Radiant handcrafted sunflower paired with fresh white daisies for a cheerful vibe.',
    fullDescription: 'Bring eternal sunshine into any room! This happy duo combines a vibrant, textured golden sunflower with pure white and yellow mini daisies. Hand-twisted leaves add rich natural contrast. An instant mood booster and our most gifted bouquet for graduations and birthdays.',
    image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80'
    ],
    colors: ['Golden Yellow & White', 'Rustic Orange & Cream', 'Pastel Daisy Mix'],
    customizable: true,
    inStock: true,
    materials: 'Chenille pipe cleaners, wool pom-pom core, Kraft wrapping sheet',
    dimensions: 'Height: 32cm, Width: 20cm'
  },
  {
    id: 'vt-04',
    name: 'Sunflower Bouquet',
    category: 'Bouquets',
    price: 350,
    originalPrice: 480,
    rating: 4.9,
    reviewsCount: 31,
    badge: 'Handmade Special',
    shortDescription: 'A fuller arrangement of plush handmade sunflowers that symbolize warmth and adoration.',
    fullDescription: 'Carefully woven with multiple layers of bright yellow petals and a textured dark chocolate center. Accompanied by decorative craft eucalyptus twigs and tied with rustic twine. It looks mesmerizing displayed in a bedside vase or as a photo-prop.',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80'
    ],
    colors: ['Classic Sun Yellow', 'Deep Ochre Golden', 'Warm Sunrise Blend'],
    customizable: true,
    inStock: true,
    materials: 'Velvet wire craft, jute twine, premium wrapping paper',
    dimensions: 'Height: 34cm, Width: 22cm'
  },
  {
    id: 'vt-05',
    name: 'Handmade Chafa Flower',
    category: 'Handmade Flowers',
    price: 30,
    originalPrice: 45,
    rating: 4.9,
    reviewsCount: 65,
    badge: 'Affordable Gem',
    shortDescription: 'Traditional fragrant-looking Frangipani / Chafa flower, perfect for hair buns & puja decor.',
    fullDescription: 'Lovingly styled after the revered Indian Champa / Chafa (Plumeria) flower. Creamy white curved petals blending into a warm gradient yellow center. Lightweight and waterproof, it comes with a tiny pin or loop backing so you can effortlessly tuck it into festive hairstyles, blouses, or festive thalis.',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80'
    ],
    colors: ['Classic White & Yellow', 'Blush Pink & Peach', 'Golden Yellow'],
    customizable: true,
    inStock: true,
    materials: 'Craft foam & chenille petal blend with soft core',
    dimensions: 'Diameter: 6.5cm'
  },
  {
    id: 'vt-06',
    name: 'Handmade Pipe Cleaner Haar',
    category: 'Festive Crafts',
    price: 280,
    originalPrice: 380,
    rating: 5.0,
    reviewsCount: 19,
    badge: 'Festive Special',
    shortDescription: 'Graceful floral garland (haar) crafted for home mandirs, photo frames, or Ganpati decor.',
    fullDescription: 'An everlasting, eco-friendly garland crafted with soft colorful pipe cleaner blossoms interspersed with golden metallic beads. Never rots or sheds petals, keeping your deities and sacred spaces adorned with pristine handmade devotion all year round.',
    image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=800&q=80'
    ],
    colors: ['Marigold Orange & Red', 'Rose Pink & White', 'Golden Yellow & Green'],
    customizable: true,
    inStock: true,
    materials: 'Premium chenille pipe cleaners, golden spacer beads, braided nylon thread',
    dimensions: 'Length: 45cm (adjustable)'
  },
  {
    id: 'vt-07',
    name: 'Handmade Hair Tie',
    category: 'Hair Accessories',
    price: 80,
    originalPrice: 120,
    rating: 4.8,
    reviewsCount: 45,
    badge: 'Everyday Cute',
    shortDescription: 'Snag-free elastic scrunchie hair tie adorned with handmade miniature floral or bow charm.',
    fullDescription: 'Treat your hair to soft, stylish luxury! Built on a durable, snag-free high-elastic band that won’t pull or damage delicate hair. Crowned with an adorable handmade flower or plush bow, lovingly crafted by Vision Thread artisans.',
    image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=800&q=80'
    ],
    colors: ['Dusty Rose Pink', 'Mint Green', 'Lilac Dream', 'Buttercup Yellow', 'Soft Beige'],
    customizable: true,
    inStock: true,
    materials: 'Seamless stretch elastic band, chenille floral accent, soft felt lining',
    dimensions: 'Diameter: 8cm'
  },
  {
    id: 'vt-08',
    name: 'Handmade Hair Clip',
    category: 'Hair Accessories',
    price: 99,
    originalPrice: 150,
    rating: 4.9,
    reviewsCount: 52,
    badge: 'Top Pick',
    shortDescription: 'Aesthetic alligator hair clip decorated with handcrafted fluffy blooms and pearls.',
    fullDescription: 'Step up your aesthetic hairdo! This salon-grade metal alligator clip is lined with soft grosgrain ribbon so it never slips, topped with handcrafted velvet petals, mini leaves, and a faux freshwater pearl accent. Light, gentle, and camera-ready.',
    image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=800&q=80'
    ],
    colors: ['Blush Pink Blossom', 'Sky Blue Daisy', 'Vintage Mauve', 'Daisy White'],
    customizable: true,
    inStock: true,
    materials: 'Gold-finish alloy clip, grosgrain ribbon lining, handmade chenille floral charm',
    dimensions: 'Length: 6cm, Width: 3.5cm'
  },
  {
    id: 'vt-09',
    name: 'Pipe Cleaner Hair Band',
    category: 'Hair Accessories',
    price: 150,
    originalPrice: 220,
    rating: 4.9,
    reviewsCount: 29,
    badge: 'Kids & Teens Love',
    shortDescription: 'Comfortable flexible headband wrapped in satin and adorned with vibrant 3D flowers.',
    fullDescription: 'Designed for painless all-day wear! The flexible headband base is padded with smooth ribbon, topped with a cascade of 3D handmade craft flowers, butterflies, or cute rabbit ears according to your choice. Gentle on ears and guaranteed to turn heads.',
    image: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=800&q=80'
    ],
    colors: ['Pastel Multi-Flower', 'Princess Pink & Pearls', 'Lavender Garden'],
    customizable: true,
    inStock: true,
    materials: 'Flexible resin headband, satin wrap, velvet chenille wire 3D shapes',
    dimensions: 'One size fits all (flexible)'
  },
  {
    id: 'vt-10',
    name: 'Peacock Keychain',
    category: 'Keychains',
    price: 120,
    originalPrice: 180,
    rating: 5.0,
    reviewsCount: 37,
    badge: 'Artisan Favorite',
    shortDescription: 'Regal handcrafted peacock charm with emerald and royal blue feather plumes.',
    fullDescription: 'A dazzling miniature masterpiece for your keys, handbag, or backpack. Woven carefully with rich sapphire blue, emerald green, and gold-flecked craft wire into an iconic Indian peacock motif with hanging bead tassel. Sealed for durability.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80'
    ],
    colors: ['Royal Peacock (Blue & Green)', 'Rose Gold Peacock', 'Silver Pearl Peacock'],
    customizable: true,
    inStock: true,
    materials: 'Metallic craft thread, chenille wire, brass keyring and lobster clasp',
    dimensions: 'Length: 11cm including chain'
  },
  {
    id: 'vt-11',
    name: 'Handmade Festive Toran',
    category: 'Festive Crafts',
    price: 499,
    originalPrice: 699,
    rating: 5.0,
    reviewsCount: 48,
    badge: 'Diwali & Housewarming',
    shortDescription: 'Traditional handcrafted door hanging with marigolds, mango leaves, and brass bells.',
    fullDescription: 'Welcome prosperity and warmth into your home! This grand festive toran features handmade saffron marigold florets, lush green mango leaf replicas, and melodic tiny brass bells that chime with every breeze. Durable and reusable season after season for Diwali, Navratri, weddings, and Griha Pravesh.',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80'
    ],
    colors: ['Marigold Yellow & Orange', 'Festive Red & Gold', 'Emerald Green & White'],
    customizable: true,
    inStock: true,
    materials: 'Hand-shaped chenille floral accents, golden gota patti, brass bells, hanging loops',
    dimensions: 'Standard 3-foot doorway width (90cm)'
  },
  {
    id: 'vt-12',
    name: 'Handmade Gift Hamper',
    category: 'Gifts & Hampers',
    price: 850,
    originalPrice: 1200,
    rating: 5.0,
    reviewsCount: 60,
    badge: 'Ultimate Gift',
    shortDescription: 'Curated luxury craft box: mini bouquet, hair accessories, custom keychain & sweet note.',
    fullDescription: 'The ultimate bespoke gifting experience! Arrives in an elegant eco-friendly craft basket with shredded wood filling and pink satin ribbon. Includes: 1 handmade mini bouquet, 2 matching hair clips, 1 personalized charm keychain, and a customized calligraphy greeting card with your message.',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'
    ],
    colors: ['Pastel Pink Blossom', 'Royal Lavender', 'Golden Sunflower', 'Aesthetic Ivory'],
    customizable: true,
    inStock: true,
    materials: 'Rigid kraft gift box, shredded wood bedding, satin ribbon, greeting card, assortment of 4 handmade items',
    dimensions: 'Box: 25cm x 20cm x 10cm'
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
  if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') return `${proto}//${host}:5000/api`;
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

    if (saved) {
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
        },
      });

      if (!res.ok) {
        this.isSyncing = false;
        return false;
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        this.products = data.products;
        this.catalogVersion = data.catalogVersion || Date.now().toString(36);
        this.lastSyncedAt = Date.now();
        this.save();

        // Broadcast global update event so any active component refreshes instantly
        try {
          window.dispatchEvent(new CustomEvent('vt:products-synced', { detail: this.products }));
          window.dispatchEvent(new CustomEvent('vt:catalog-updated', { detail: { count: this.products.length, version: this.catalogVersion } }));
        } catch (evErr) {}

        if (window.app && typeof window.app.onProductsSynced === 'function') {
          window.app.onProductsSynced();
        } else if (window.app && typeof window.app.renderProducts === 'function') {
          window.app.renderProducts();
          window.app.renderShopProducts();
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
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) {
        if (data.version !== this.catalogVersion || (typeof data.total === 'number' && data.total !== this.products.length)) {
          await this.syncWithBackend(true);
        }
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
