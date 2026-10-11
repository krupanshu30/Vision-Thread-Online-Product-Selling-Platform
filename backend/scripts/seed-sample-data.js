// scripts/seed-sample-data.js - Populate realistic sample orders, custom orders & messages
const db = require("../config/database");

async function seedSampleData() {
  console.log("[SEED-DATA] Seeding sample orders, custom requests, and messages into MySQL...");

  try {
    // 1. Sample Orders
    const sampleOrders = [
      {
        orderId: "#VT-84920",
        customerName: "Aaradhya Sharma",
        customerMobile: "9820123456",
        customerEmail: "aaradhya.sharma@gmail.com",
        address: "Flat 402, Sunshine Towers, MG Road",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
        paymentMethod: "UPI (Google Pay)",
        subtotal: 650.00,
        deliveryCharge: 0.00,
        discount: 65.00,
        grandTotal: 585.00,
        couponCode: "HANDMADE10",
        status: "delivered",
        notes: "Please write 'Happy Birthday Diya' on gift tag",
        adminNotes: "Delivered via Bluedart on 07 Oct",
        items: [
          {
            productCode: "vt-01",
            productName: "Pink & Purple Lily Bouquet",
            category: "Bouquets",
            price: 350.00,
            quantity: 1,
            color: "Pink & Purple",
            customNote: "Happy Birthday tag",
            imageUrl: "images/products/lily_bouquet.png"
          },
          {
            productCode: "vt-03",
            productName: "Sunflower & Daisy Bouquet",
            category: "Bouquets",
            price: 300.00,
            quantity: 1,
            color: "Sunny Yellow",
            customNote: "",
            imageUrl: "images/products/sunflower_daisy.png"
          }
        ]
      },
      {
        orderId: "#VT-78214",
        customerName: "Rohan Kulkarni",
        customerMobile: "9876543210",
        customerEmail: "rohan.kulkarni@yahoo.com",
        address: "Row House 12, Green Acres, Baner",
        city: "Pune",
        state: "Maharashtra",
        pincode: "411045",
        paymentMethod: "Cash on Delivery (COD)",
        subtotal: 850.00,
        deliveryCharge: 0.00,
        discount: 0.00,
        grandTotal: 850.00,
        couponCode: null,
        status: "shipped",
        notes: "Call before delivering",
        adminNotes: "Tracking ID: DTDC984210",
        items: [
          {
            productCode: "vt-12",
            productName: "Handmade Gift Hamper",
            category: "Gifts & Hampers",
            price: 850.00,
            quantity: 1,
            color: "Festive Crimson",
            customNote: "Anniversary gift wrap",
            imageUrl: "images/products/gift_hamper.png"
          }
        ]
      },
      {
        orderId: "#VT-63912",
        customerName: "Pooja Mehta",
        customerMobile: "9167234890",
        customerEmail: "pooja.mehta@outlook.com",
        address: "B-201, Shanti Niketan, Satellite Road",
        city: "Ahmedabad",
        state: "Gujarat",
        pincode: "380015",
        paymentMethod: "UPI (PhonePe)",
        subtotal: 499.00,
        deliveryCharge: 0.00,
        discount: 49.90,
        grandTotal: 449.10,
        couponCode: "VISION10",
        status: "processing",
        notes: "For Diwali entrance decoration",
        adminNotes: "Making fresh piece today",
        items: [
          {
            productCode: "vt-11",
            productName: "Handmade Festive Toran",
            category: "Festive Crafts",
            price: 499.00,
            quantity: 1,
            color: "Marigold & Gold",
            customNote: "Door frame size standard 3 ft",
            imageUrl: "images/products/festive_toran.png"
          }
        ]
      },
      {
        orderId: "#VT-51204",
        customerName: "Sneha Patel",
        customerMobile: "9825019283",
        customerEmail: "sneha.p@gmail.com",
        address: "Plot 89, Alkapuri",
        city: "Vadodara",
        state: "Gujarat",
        pincode: "390007",
        paymentMethod: "UPI (Paytm)",
        subtotal: 400.00,
        deliveryCharge: 50.00,
        discount: 0.00,
        grandTotal: 450.00,
        couponCode: null,
        status: "confirmed",
        notes: "Soft colors preferred",
        adminNotes: "Payment verified",
        items: [
          {
            productCode: "vt-08",
            productName: "Handmade Hair Clip",
            category: "Hair Accessories",
            price: 99.00,
            quantity: 2,
            color: "Pastel Pink",
            customNote: "",
            imageUrl: "images/products/hair_clip.png"
          },
          {
            productCode: "vt-09",
            productName: "Pipe Cleaner Hair Band",
            category: "Hair Accessories",
            price: 150.00,
            quantity: 1,
            color: "Lavender Lilac",
            customNote: "",
            imageUrl: "images/products/hair_band.png"
          }
        ]
      },
      {
        orderId: "#VT-42091",
        customerName: "Ananya Iyer",
        customerMobile: "9840192834",
        customerEmail: "ananya.iyer@gmail.com",
        address: "No. 45, TTK Road, Alwarpet",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600018",
        paymentMethod: "Credit Card",
        subtotal: 280.00,
        deliveryCharge: 50.00,
        discount: 0.00,
        grandTotal: 330.00,
        couponCode: null,
        status: "pending",
        notes: "Gifting to my sister",
        adminNotes: "",
        items: [
          {
            productCode: "vt-06",
            productName: "Handmade Pipe Cleaner Haar",
            category: "Festive Crafts",
            price: 280.00,
            quantity: 1,
            color: "Rose & Pearl",
            customNote: "Small deity size",
            imageUrl: "images/products/chenille_garland.png"
          }
        ]
      }
    ];

    for (const o of sampleOrders) {
      const [existing] = await db.execute("SELECT id FROM orders WHERE order_id = ?", [o.orderId]);
      if (existing.length === 0) {
        await db.execute(
          `INSERT INTO orders (order_id, customer_name, customer_mobile, customer_email, address, city, state, pincode, payment_method, subtotal, delivery_charge, discount, grand_total, coupon_code, status, notes, admin_notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            o.orderId, o.customerName, o.customerMobile, o.customerEmail, o.address, o.city, o.state, o.pincode,
            o.paymentMethod, o.subtotal, o.deliveryCharge, o.discount, o.grandTotal, o.couponCode, o.status, o.notes, o.adminNotes
          ]
        );

        for (const item of o.items) {
          await db.execute(
            `INSERT INTO order_items (order_id, product_code, product_name, category, price, quantity, color, custom_note, image_url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [o.orderId, item.productCode, item.productName, item.category, item.price, item.quantity, item.color, item.customNote, item.imageUrl]
          );
        }
        console.log(`  ➕ Added Order: ${o.orderId} (${o.customerName})`);
      } else {
        console.log(`  ⏭ Order ${o.orderId} already exists`);
      }
    }

    // 2. Sample Custom Orders
    const sampleCustomOrders = [
      {
        orderRef: "CUST-VT-101",
        customerName: "Kavita Singhania",
        mobile: "9819876543",
        productType: "Bouquets",
        preferredColor: "Peach & Cream Roses with White Gypsophila",
        quantity: 2,
        requirements: "Need custom bridal pastel bouquet matching wedding lehenga with personalized ribbon print.",
        status: "new",
        adminNotes: "Shared photos on WhatsApp. Need delivery by 15th."
      },
      {
        orderRef: "CUST-VT-102",
        customerName: "Vikram Rathore",
        mobile: "9890123456",
        productType: "Keychains",
        preferredColor: "Royal Blue & Metallic Gold",
        quantity: 25,
        requirements: "Bulk peacock keychains for housewarming return gifts with custom thank you tags.",
        status: "in_progress",
        adminNotes: "50% advance received. 15 pieces crafted."
      },
      {
        orderRef: "CUST-VT-103",
        customerName: "Neha Verma",
        mobile: "9920192837",
        productType: "Hair Accessories",
        preferredColor: "Baby Pink and Mint Green",
        quantity: 5,
        requirements: "Custom flower clips and matching tiara for 5-year-old birthday party.",
        status: "completed",
        adminNotes: "Delivered and customer gave 5-star review on Instagram!"
      }
    ];

    for (const co of sampleCustomOrders) {
      const [existing] = await db.execute("SELECT id FROM custom_orders WHERE order_ref = ?", [co.orderRef]);
      if (existing.length === 0) {
        await db.execute(
          `INSERT INTO custom_orders (order_ref, customer_name, mobile, product_type, preferred_color, quantity, requirements, status, admin_notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [co.orderRef, co.customerName, co.mobile, co.productType, co.preferredColor, co.quantity, co.requirements, co.status, co.adminNotes]
        );
        console.log(`  ➕ Added Custom Order: ${co.orderRef} (${co.customerName})`);
      } else {
        console.log(`  ⏭ Custom Order ${co.orderRef} already exists`);
      }
    }

    // 3. Sample Contact Messages
    const sampleMessages = [
      {
        name: "Meera Joshi",
        mobile: "9769012345",
        message: "Hello! Do you deliver bouquets to Bangalore? Also how many days does delivery take?",
        isRead: 0,
        adminNotes: ""
      },
      {
        name: "Deepak Soni",
        mobile: "9820098765",
        message: "Can you provide bulk wedding torans (around 10 pieces) by next weekend?",
        isRead: 1,
        adminNotes: "Called customer on WhatsApp, quote shared."
      },
      {
        name: "Tanvi Deshmukh",
        mobile: "9819011223",
        message: "Loved your Instagram page @vision_thread00! Do you teach craft workshops too?",
        isRead: 0,
        adminNotes: ""
      }
    ];

    for (const m of sampleMessages) {
      const [existing] = await db.execute("SELECT id FROM contact_messages WHERE mobile = ? AND message = ?", [m.mobile, m.message]);
      if (existing.length === 0) {
        await db.execute(
          `INSERT INTO contact_messages (name, mobile, message, is_read, admin_notes) VALUES (?, ?, ?, ?, ?)`,
          [m.name, m.mobile, m.message, m.isRead, m.adminNotes]
        );
        console.log(`  ➕ Added Message from: ${m.name}`);
      } else {
        console.log(`  ⏭ Message from ${m.name} already exists`);
      }
    }

    console.log("\n[SEED-DATA] ✅ All sample data populated successfully into MySQL!");
    process.exit(0);
  } catch (err) {
    console.error("[SEED-DATA] ❌ Error:", err.message);
    process.exit(1);
  }
}

seedSampleData();
