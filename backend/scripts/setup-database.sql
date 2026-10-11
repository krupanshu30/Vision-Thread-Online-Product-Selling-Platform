-- ============================================================
-- Vision Thread (@vision_thread00) - MySQL Database Schema
-- ============================================================
-- Run this file in MySQL Workbench or CLI:
--   mysql -u root -p < setup-database.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS vision_thread_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE vision_thread_db;

-- ============================================================
-- Table: admin_users
-- Only the store owner can log in as admin (no public signup)
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  email       VARCHAR(255) NOT NULL UNIQUE,
  username    VARCHAR(100) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,  -- bcrypt hashed
  full_name   VARCHAR(255),
  role        ENUM("admin", "superadmin") DEFAULT "admin",
  is_active   TINYINT(1) DEFAULT 1,
  last_login  DATETIME,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- Table: products
-- All handmade product catalog items
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  product_code    VARCHAR(50) NOT NULL UNIQUE,
  name            VARCHAR(255) NOT NULL,
  category        VARCHAR(100) NOT NULL,
  price           DECIMAL(10,2) NOT NULL,
  original_price  DECIMAL(10,2),
  rating          DECIMAL(3,1) DEFAULT 5.0,
  reviews_count   INT DEFAULT 0,
  badge           VARCHAR(100),
  short_desc      TEXT,
  full_desc       TEXT,
  image_url       TEXT,
  gallery_json    JSON,
  colors_json     JSON,
  materials       TEXT,
  dimensions      VARCHAR(255),
  customizable    TINYINT(1) DEFAULT 1,
  in_stock        TINYINT(1) DEFAULT 1,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_in_stock (in_stock)
) ENGINE=InnoDB;

-- ============================================================
-- Table: custom_orders
-- Submissions from the "Made Just For You" custom order form
-- ============================================================
CREATE TABLE IF NOT EXISTS custom_orders (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  order_ref       VARCHAR(50) NOT NULL UNIQUE,
  customer_name   VARCHAR(255) NOT NULL,
  mobile          VARCHAR(20) NOT NULL,
  product_type    VARCHAR(255) NOT NULL,
  preferred_color VARCHAR(255),
  quantity        INT DEFAULT 1,
  requirements    TEXT NOT NULL,
  image_ref_url   VARCHAR(500),
  status          ENUM("new","in_review","approved","in_progress","completed","cancelled") DEFAULT "new",
  admin_notes     TEXT,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_mobile (mobile)
) ENGINE=InnoDB;

-- ============================================================
-- Table: orders
-- Checkout orders placed on the website
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  order_id          VARCHAR(50) NOT NULL UNIQUE,
  customer_name     VARCHAR(255) NOT NULL,
  customer_mobile   VARCHAR(20) NOT NULL,
  customer_email    VARCHAR(255),
  address           TEXT,
  city              VARCHAR(100),
  state             VARCHAR(100),
  pincode           VARCHAR(10),
  payment_method    VARCHAR(100),
  subtotal          DECIMAL(10,2),
  delivery_charge   DECIMAL(10,2) DEFAULT 0,
  discount          DECIMAL(10,2) DEFAULT 0,
  grand_total       DECIMAL(10,2),
  coupon_code       VARCHAR(50),
  status            ENUM("pending","confirmed","processing","shipped","delivered","cancelled","refunded") DEFAULT "pending",
  notes             TEXT,
  admin_notes       TEXT,
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_order_status (status),
  INDEX idx_customer_mobile (customer_mobile)
) ENGINE=InnoDB;

-- ============================================================
-- Table: order_items
-- Line items for each order
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  order_id      VARCHAR(50) NOT NULL,
  product_code  VARCHAR(50),
  product_name  VARCHAR(255) NOT NULL,
  category      VARCHAR(100),
  price         DECIMAL(10,2) NOT NULL,
  quantity      INT NOT NULL,
  color         VARCHAR(100),
  custom_note   TEXT,
  image_url     VARCHAR(500),
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  INDEX idx_order_id (order_id)
) ENGINE=InnoDB;

-- ============================================================
-- Table: contact_messages
-- Messages from the contact us form
-- ============================================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  mobile      VARCHAR(20) NOT NULL,
  message     TEXT NOT NULL,
  is_read     TINYINT(1) DEFAULT 0,
  admin_notes TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_is_read (is_read)
) ENGINE=InnoDB;

-- ============================================================
-- Table: coupons
-- Discount coupon codes
-- ============================================================
CREATE TABLE IF NOT EXISTS coupons (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  code            VARCHAR(50) NOT NULL UNIQUE,
  discount_type   ENUM("percentage","flat") DEFAULT "percentage",
  discount_value  DECIMAL(10,2) NOT NULL,
  min_order       DECIMAL(10,2) DEFAULT 0,
  max_uses        INT,
  used_count      INT DEFAULT 0,
  is_active       TINYINT(1) DEFAULT 1,
  expires_at      DATETIME,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- Seed default coupon codes
-- ============================================================
INSERT IGNORE INTO coupons (code, discount_type, discount_value, min_order, is_active)
VALUES
  ("HANDMADE10", "percentage", 10.00, 0, 1),
  ("VISION10", "percentage", 10.00, 0, 1),
  ("WELCOME50", "flat", 50.00, 299, 1);

SELECT "Database setup complete! Tables created successfully." AS result;
