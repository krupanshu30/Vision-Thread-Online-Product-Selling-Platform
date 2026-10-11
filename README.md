# 🌸 Vision Thread (@vision_thread00) — E-Commerce Website

> **“Handmade With Love ❤️”**  
> *“Something Handmade. Something Unique. Something You.”*

A modern, attractive, mobile-responsive e-commerce website designed specifically for **Vision Thread** (@vision_thread00), specializing in handmade crafts, flower bouquets, customized gifts, festive torans, and hair accessories.

---

## 🚀 How to Run in VS Code

You can run this project in **Visual Studio Code** using any of these 3 easy methods:

### Method 1: Using VS Code "Live Server" (Recommended ⭐)
1. Open this project folder in **Visual Studio Code** (`File > Open Folder...`).
2. If you don't have the **Live Server** extension installed yet:
   - Click the **Extensions** icon on the left sidebar (or press `Ctrl + Shift + X`).
   - Search for **"Live Server"** by *Ritwick Dey* and click **Install**.
3. Right-click on [`index.html`](file:///c:/Users/manasi/OneDrive/Documents/krupanshu/index.html) in the file explorer.
4. Click **"Open with Live Server"** (or click the **"Go Live"** button in the bottom-right status bar).
5. Your browser will automatically open at `http://127.0.0.1:5500` with live reloading!

### Method 2: Press F5 (VS Code Debugger)
1. Open [`index.html`](file:///c:/Users/manasi/OneDrive/Documents/krupanshu/index.html) in VS Code.
2. Press **`F5`** on your keyboard (or click **Run > Start Debugging**).
3. Select **"Launch Vision Thread Website (Chrome)"** or **"Launch Vision Thread Website (Edge)"**.

### Method 3: Using VS Code Integrated Terminal
Open the terminal in VS Code (`Ctrl + ~`) and run:
```bash
npx serve .
```
or
```bash
npx live-server .
```

### Method 4: Direct Browser Open (No server needed!)
Double-click [`index.html`](file:///c:/Users/manasi/OneDrive/Documents/krupanshu/index.html) in your Windows File Explorer to open it immediately in Google Chrome, Microsoft Edge, or Firefox.

---

## 📱 Pages & Features Included

1. **Home (`#/`)**:
   - Hero banner with **“Handmade With Love ❤️”**, subtitle, shop and custom order CTAs, and featured bouquet showcase.
   - **Trust Badges Strip**: Handmade With Love, Custom Designs Available, Carefully Packed, Unique & Creative, Made With Care.
   - **8 Product Categories**:
     - 🌸 Handmade Flowers
     - 🎀 Hair Accessories
     - 🔑 Keychains
     - 💐 Bouquets
     - 🎁 Gifts & Hampers
     - 🪔 Festive Crafts
     - 🏠 Home Decor
     - ✨ Other Crafts
   - **Handmade Highlights Grid**: 4 cards per row on desktop, 2 equal cards per row on mobile.
   - **Bespoke Custom Order Banner**: “Made Just For You 💕”
   - **Instagram Integration**: “Follow Our Handmade Journey ✨” featuring [@vision_thread00](https://instagram.com/vision_thread00) with photo gallery and follow button.

2. **Shop / Collection (`#/shop`)**:
   - Interactive category pills with icons
   - Real-time product search
   - Price filters (< ₹200, ₹200 - ₹400, > ₹400)
   - Sorting (Featured, Price: Low to High, Price: High to Low, Top Rated, Alphabetical)
   - Responsive grid with **₹ INR** pricing, wishlist heart, "View" and "Add to Cart" buttons.

3. **Product Details View & Modal**:
   - High-res image gallery with interactive thumbnail switcher
   - Full product description, craft materials, dimensions
   - Color swatch selector
   - Custom requirements / message field (e.g. gift tag message)
   - Quantity selector (+ / -)
   - Add to Cart & Buy Now buttons
   - **“DM us on WhatsApp for Customization”** button with pre-filled message.

4. **Custom Orders (`#/custom-orders`)**:
   - **“Made Just For You 💕”**
   - Interactive form: Name, WhatsApp Mobile, Product type, Preferred Color, Quantity, Requirements, and Reference Image upload with live preview.
   - Auto-generates a formatted WhatsApp message to start the custom order directly.

5. **About Us (`#/about`)**:
   - Artisan story, craftsmanship values, slow-crafted philosophy, and Indian heritage.

6. **Contact Us (`#/contact`)**:
   - Direct Instagram link ([@vision_thread00](https://instagram.com/vision_thread00)), WhatsApp link, email, contact inquiry form, and shipping FAQ.

7. **Cart Drawer & Full Cart Page (`#/cart`)**:
   - Slide-over drawer and dedicated cart view
   - Increment, decrement, or remove items
   - Free shipping progress bar (Free delivery over ₹499!)
   - Coupon discount code box (Try code: `HANDMADE10` or `VISION10` for 10% off)

8. **Secure Checkout (`#/checkout`)**:
   - Customer details, shipping address, Indian state selector, pincode
   - Live order summary and delivery charge calculation
   - Payment method placeholders: UPI (GPay/PhonePe/Paytm with QR code placeholder), Cash on Delivery (COD), Online Cards/Netbanking.

9. **Order Confirmation (`#/order-confirmation`)**:
   - Colorful celebration confetti animation
   - Generated Order ID (e.g., `#VT-84920`)
   - Itemized package breakdown
   - Estimated delivery timeline (3-5 business days)
   - **"Send Order Details to WhatsApp"** button
   - **"Print / Save Receipt"** button with dedicated printable invoice layout.

---

## 🛍️ 12 Sample Products Pre-Loaded

1. **Pink & Purple Lily Bouquet** — ₹350
2. **Single Handmade Flower Bouquet** — ₹250
3. **Sunflower & Daisy Bouquet** — ₹300
4. **Sunflower Bouquet** — ₹350
5. **Handmade Chafa Flower** — ₹30
6. **Handmade Pipe Cleaner Haar** — ₹280
7. **Handmade Hair Tie** — ₹80
8. **Handmade Hair Clip** — ₹99
9. **Pipe Cleaner Hair Band** — ₹150
10. **Peacock Keychain** — ₹120
11. **Handmade Festive Toran** — ₹499
12. **Handmade Gift Hamper** — ₹850

---

## 🛠️ Easy Product Management (Add, Edit, Remove)

You have **two ways** to manage products:

### Option A: Built-in Store Admin Tool (No coding needed!)
1. Scroll down to the website footer on any page.
2. Click **“⚙️ Manage Products (Store Admin)”**.
3. Fill in the title, category, price, and description, then click **"+ Add Product to Store"**.
4. You can also delete items or reset back to default with one click!

### Option B: Direct in Code (`js/products.js`)
Open [`js/products.js`](file:///c:/Users/manasi/OneDrive/Documents/krupanshu/js/products.js) and add a new product object to `DEFAULT_PRODUCTS`:

```javascript
{
  id: 'vt-13',
  name: 'Handmade Tulip Pot',
  category: 'Handmade Flowers',
  price: 220,
  originalPrice: 280,
  rating: 5.0,
  reviewsCount: 15,
  badge: 'New Arrival',
  shortDescription: 'Charming mini potted tulip for office and study desks.',
  fullDescription: 'Crafted with soft pink and green chenille stems in a mini ceramic pot.',
  image: 'https://images.unsplash.com/...',
  colors: ['Blush Pink', 'Lilac', 'Butter Yellow'],
  customizable: true,
  inStock: true
}
```

---

## 📞 Updating Your Contact Details

To change your official WhatsApp number or Instagram username:
1. Open [`js/app.js`](file:///c:/Users/manasi/OneDrive/Documents/krupanshu/js/app.js).
2. Look at lines 10-12:
   ```javascript
   this.contactPhone = '919876543210'; // Replace with your 10-digit WhatsApp number with country code (91)
   this.instagramHandle = 'vision_thread00'; // Replace if your handle changes
   ```

---

## 🎨 Brand Identity Specifications

- **Brand Name**: Vision Thread
- **Instagram**: [@vision_thread00](https://instagram.com/vision_thread00)
- **Primary Color**: `#ec4899` (Handmade Pink)
- **Secondary Colors**: `#fce7f3`, `#fbcfe8`, `#db2777`
- **Fonts**: *Playfair Display* (headings) & *Outfit* (body)

---

## 🌐 Direct Links to Open Google

1. **On the Website**:
   - In the top pink announcement banner: click **"🌐 Open Google"**.
   - In the footer under Customer Care: click **"🌐 Direct Link: Open Google ↗"**.
2. **From File Explorer / VS Code**:
   - Double-click [`Google.url`](file:///c:/Users/manasi/OneDrive/Documents/krupanshu/Google.url) to directly open Google in your default web browser.
   - Open [`open_google.html`](file:///c:/Users/manasi/OneDrive/Documents/krupanshu/open_google.html) to instantly redirect to Google.
   - Double-click [`open_website_in_chrome.bat`](file:///c:/Users/manasi/OneDrive/Documents/krupanshu/open_website_in_chrome.bat) to open the Vision Thread website directly in Google Chrome!

---

## 🗄️ MySQL Database & Secure Owner Admin Panel

The website is integrated with a secure Node.js + Express backend and MySQL database.

### 1. Database Architecture & Tables

| Table | Purpose | Key Attributes |
|---|---|---|
| `admin_users` | Store owner admin accounts | `email`, `username`, `password` (bcrypt), `role`, `last_login` |
| `products` | Handmade product catalog items | `product_code`, `name`, `category`, `price`, `in_stock`, `badge` |
| `orders` | Customer checkout orders | `order_id`, `customer_name`, `customer_mobile`, `grand_total`, `status` |
| `order_items` | Line items in each order | `order_id`, `product_name`, `price`, `quantity`, `color` |
| `custom_orders` | "Made Just For You" bespoke requests | `order_ref`, `customer_name`, `mobile`, `product_type`, `requirements` |
| `contact_messages` | Contact Us inquiries | `name`, `mobile`, `message`, `is_read`, `admin_notes` |
| `coupons` | Discount coupon codes | `code`, `discount_type`, `discount_value`, `min_order`, `used_count` |

### 2. Quick Setup Instructions

1. **Configure your MySQL Password**:
   - Open [`backend/.env`](file:///c:/Users/manasi/OneDrive/Documents/krupanshu/backend/.env) in VS Code.
   - Set your MySQL root password:
     ```env
     DB_PASSWORD=your_actual_mysql_password
     ```
2. **Initialize Database & Seed Data**:
   - Double-click [`setup_database.bat`](file:///c:/Users/manasi/OneDrive/Documents/krupanshu/setup_database.bat), or in terminal run:
     ```bash
     npm run setup-db
     npm run seed-admin
     npm run seed-products
     ```
3. **Start the Backend Server**:
   - Double-click [`start_backend.bat`](file:///c:/Users/manasi/OneDrive/Documents/krupanshu/start_backend.bat), or in terminal run:
     ```bash
     npm run backend
     ```
4. **Access the Secure Admin Panel**:
   - Open your browser at: **`http://localhost:5000/admin`**
   - **Login**: `admin@visionthread.in` (or username: `visionthread_admin`)
   - **Default Password**: `Admin@123` (Change this in Admin Settings > Change Password)

