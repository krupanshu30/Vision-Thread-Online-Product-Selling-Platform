// scripts/seed-products.js - Seed all 12 default products into MySQL
// Run: node scripts/seed-products.js
const mysql = require("mysql2/promise");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const DEFAULT_PRODUCTS = [
  { code: "vt-01", name: "Pink & Purple Lily Bouquet", category: "Bouquets", price: 200, originalPrice: 350, rating: 4.9, reviewsCount: 38, badge: "Bestseller", shortDesc: "Delicate handmade lilies crafted with velvety chenille pipe cleaners and ribbon wraps.", fullDesc: "Handcrafted with intricate love and patience, this Pink & Purple Lily Bouquet is an everlasting floral treasure.", image: "images/pink-purple-lily-bouquet.jpg", colors: ["Pink & Lilac", "Blush Pink", "Pure Purple", "Pastel Mix"], materials: "High density velvet pipe cleaners, floral wire stem", dimensions: "Height: 30cm, Width: 18cm" },
  { code: "vt-02", name: "Single Handmade Flower Bouquet", category: "Bouquets", price: 250, originalPrice: 320, rating: 4.8, reviewsCount: 24, badge: "Popular Gift", shortDesc: "Charming single-stem handmade rose or tulip wrapped with Korean aesthetic paper.", fullDesc: "A minimalist yet profoundly sweet token of affection.", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80", colors: ["Cherry Red", "Soft Pink", "Baby Blue", "Sunshine Yellow", "Lavender"], materials: "Chenille craft stem, floral tape, cellophane wrap", dimensions: "Height: 28cm, Width: 12cm" },
  { code: "vt-03", name: "Sunflower & Daisy Bouquet", category: "Bouquets", price: 300, originalPrice: 399, rating: 5.0, reviewsCount: 42, badge: "Trending", shortDesc: "Radiant handcrafted sunflower paired with fresh white daisies for a cheerful vibe.", fullDesc: "Bring eternal sunshine into any room!", image: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80", colors: ["Golden Yellow & White", "Rustic Orange & Cream", "Pastel Daisy Mix"], materials: "Chenille pipe cleaners, wool pom-pom core", dimensions: "Height: 32cm, Width: 20cm" },
  { code: "vt-04", name: "Sunflower Bouquet", category: "Bouquets", price: 350, originalPrice: 480, rating: 4.9, reviewsCount: 31, badge: "Handmade Special", shortDesc: "A fuller arrangement of plush handmade sunflowers that symbolize warmth and adoration.", fullDesc: "Carefully woven with multiple layers of bright yellow petals.", image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80", colors: ["Classic Sun Yellow", "Deep Ochre Golden"], materials: "Velvet wire craft, jute twine", dimensions: "Height: 34cm, Width: 22cm" },
  { code: "vt-05", name: "Handmade Chafa Flower", category: "Handmade Flowers", price: 30, originalPrice: 45, rating: 4.9, reviewsCount: 65, badge: "Affordable Gem", shortDesc: "Traditional fragrant-looking Frangipani / Chafa flower, perfect for hair buns & puja decor.", fullDesc: "Lovingly styled after the revered Indian Champa / Chafa (Plumeria) flower.", image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80", colors: ["Classic White & Yellow", "Blush Pink & Peach"], materials: "Craft foam & chenille petal blend", dimensions: "Diameter: 6.5cm" },
  { code: "vt-06", name: "Handmade Pipe Cleaner Haar", category: "Festive Crafts", price: 280, originalPrice: 380, rating: 5.0, reviewsCount: 19, badge: "Festive Special", shortDesc: "Graceful floral garland (haar) crafted for home mandirs, photo frames, or Ganpati decor.", fullDesc: "An everlasting, eco-friendly garland crafted with soft colorful pipe cleaner blossoms.", image: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80", colors: ["Marigold Orange & Red", "Rose Pink & White"], materials: "Premium chenille pipe cleaners, golden spacer beads", dimensions: "Length: 45cm (adjustable)" },
  { code: "vt-07", name: "Handmade Hair Tie", category: "Hair Accessories", price: 80, originalPrice: 120, rating: 4.8, reviewsCount: 45, badge: "Everyday Cute", shortDesc: "Snag-free elastic scrunchie hair tie adorned with handmade miniature floral or bow charm.", fullDesc: "Treat your hair to soft, stylish luxury!", image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=800&q=80", colors: ["Dusty Rose Pink", "Mint Green", "Lilac Dream"], materials: "Seamless stretch elastic band, chenille floral accent", dimensions: "Diameter: 8cm" },
  { code: "vt-08", name: "Handmade Hair Clip", category: "Hair Accessories", price: 99, originalPrice: 150, rating: 4.9, reviewsCount: 52, badge: "Top Pick", shortDesc: "Aesthetic alligator hair clip decorated with handcrafted fluffy blooms and pearls.", fullDesc: "Step up your aesthetic hairdo!", image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=800&q=80", colors: ["Blush Pink Blossom", "Sky Blue Daisy", "Vintage Mauve"], materials: "Gold-finish alloy clip, grosgrain ribbon", dimensions: "Length: 6cm, Width: 3.5cm" },
  { code: "vt-09", name: "Pipe Cleaner Hair Band", category: "Hair Accessories", price: 150, originalPrice: 220, rating: 4.9, reviewsCount: 29, badge: "Kids & Teens Love", shortDesc: "Comfortable flexible headband wrapped in satin and adorned with vibrant 3D flowers.", fullDesc: "Designed for painless all-day wear!", image: "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&w=800&q=80", colors: ["Pastel Multi-Flower", "Princess Pink & Pearls"], materials: "Flexible resin headband, satin wrap", dimensions: "One size fits all (flexible)" },
  { code: "vt-10", name: "Peacock Keychain", category: "Keychains", price: 120, originalPrice: 180, rating: 5.0, reviewsCount: 37, badge: "Artisan Favorite", shortDesc: "Regal handcrafted peacock charm with emerald and royal blue feather plumes.", fullDesc: "A dazzling miniature masterpiece for your keys, handbag, or backpack.", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80", colors: ["Royal Peacock (Blue & Green)", "Rose Gold Peacock"], materials: "Metallic craft thread, chenille wire, brass keyring", dimensions: "Length: 11cm including chain" },
  { code: "vt-11", name: "Handmade Festive Toran", category: "Festive Crafts", price: 499, originalPrice: 699, rating: 5.0, reviewsCount: 48, badge: "Diwali & Housewarming", shortDesc: "Traditional handcrafted door hanging with marigolds, mango leaves, and brass bells.", fullDesc: "Welcome prosperity and warmth into your home!", image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80", colors: ["Marigold Yellow & Orange", "Festive Red & Gold"], materials: "Hand-shaped chenille floral accents, golden gota patti", dimensions: "Standard 3-foot doorway width (90cm)" },
  { code: "vt-12", name: "Handmade Gift Hamper", category: "Gifts & Hampers", price: 850, originalPrice: 1200, rating: 5.0, reviewsCount: 60, badge: "Ultimate Gift", shortDesc: "Curated luxury craft box: mini bouquet, hair accessories, custom keychain & sweet note.", fullDesc: "The ultimate bespoke gifting experience!", image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80", colors: ["Pastel Pink Blossom", "Royal Lavender", "Golden Sunflower"], materials: "Rigid kraft gift box, shredded wood bedding, satin ribbon", dimensions: "Box: 25cm x 20cm x 10cm" }
];

async function seedProducts() {
  if (!process.env.DB_PASSWORD || process.env.DB_PASSWORD === "your_mysql_password_here") {
    console.error("\n[SEED-PRODUCTS] ❌ Set your MySQL DB_PASSWORD in backend/.env first.");
    process.exit(1);
  }

  console.log("\n[SEED-PRODUCTS] Seeding products into MySQL...");
  let conn;
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || "vision_thread_db",
    });

    let added = 0, skipped = 0;
    for (const p of DEFAULT_PRODUCTS) {
      try {
        await conn.execute(
          `INSERT INTO products (product_code, name, category, price, original_price, rating, reviews_count, badge, short_desc, full_desc, image_url, gallery_json, colors_json, materials, dimensions, customizable, in_stock)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)`,
          [
            p.code, p.name, p.category, p.price, p.originalPrice || null,
            p.rating || 5.0, p.reviewsCount || 0, p.badge || null,
            p.shortDesc, p.fullDesc, p.image,
            JSON.stringify([p.image]),
            JSON.stringify(p.colors || []),
            p.materials || "", p.dimensions || ""
          ]
        );
        added++;
        console.log("[SEED-PRODUCTS]   ✅ " + p.name);
      } catch (err) {
        if (err.code === "ER_DUP_ENTRY") { skipped++; console.log("[SEED-PRODUCTS]   ⏭  " + p.name + " (already exists)"); }
        else throw err;
      }
    }
    console.log("\n[SEED-PRODUCTS] Done! Added: " + added + " | Skipped (existing): " + skipped);
  } catch (err) {
    console.error("[SEED-PRODUCTS] ❌ Error:", err.message);
    process.exit(1);
  } finally {
    if (conn) conn.end();
  }
}

seedProducts();
