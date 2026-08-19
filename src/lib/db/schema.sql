PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS categories (
  slug        TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image       TEXT NOT NULL DEFAULT '',
  position    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  occasions   TEXT NOT NULL DEFAULT '',
  gender      TEXT NOT NULL DEFAULT 'unisex',
  brand       TEXT NOT NULL DEFAULT '',
  images      TEXT NOT NULL DEFAULT '[]',   -- JSON: array de URLs
  featured    INTEGER NOT NULL DEFAULT 0,
  published   INTEGER NOT NULL DEFAULT 1,
  position    INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS variants (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size       TEXT NOT NULL,
  price      INTEGER NOT NULL,              -- centavos
  compare_at INTEGER,                       -- precio tachado, centavos
  stock      INTEGER,                       -- NULL = infinito
  sku        TEXT NOT NULL DEFAULT '',
  weight_gr  INTEGER NOT NULL DEFAULT 60,
  position   INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_variants_product ON variants(product_id);

CREATE TABLE IF NOT EXISTS product_categories (
  product_id    INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_slug TEXT NOT NULL REFERENCES categories(slug) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_slug)
);

CREATE TABLE IF NOT EXISTS orders (
  id              TEXT PRIMARY KEY,          -- RP-000123
  status          TEXT NOT NULL,             -- pending | awaiting_transfer | paid | shipped | delivered | cancelled
  payment_method  TEXT NOT NULL,             -- mercadopago | transfer
  payment_ref     TEXT NOT NULL DEFAULT '',  -- id de pago de MP
  customer_name   TEXT NOT NULL,
  customer_email  TEXT NOT NULL,
  customer_phone  TEXT NOT NULL,
  customer_doc    TEXT NOT NULL DEFAULT '',
  shipping_method TEXT NOT NULL,             -- domicilio | retiro
  shipping_label  TEXT NOT NULL DEFAULT '',
  shipping_cost   INTEGER NOT NULL DEFAULT 0,
  shipping_eta    TEXT NOT NULL DEFAULT '',
  address_street  TEXT NOT NULL DEFAULT '',
  address_number  TEXT NOT NULL DEFAULT '',
  address_extra   TEXT NOT NULL DEFAULT '',
  address_city    TEXT NOT NULL DEFAULT '',
  address_state   TEXT NOT NULL DEFAULT '',
  address_zip     TEXT NOT NULL DEFAULT '',
  note            TEXT NOT NULL DEFAULT '',
  subtotal        INTEGER NOT NULL,
  discount        INTEGER NOT NULL DEFAULT 0,
  coupon_code     TEXT NOT NULL DEFAULT '',
  total           INTEGER NOT NULL,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  paid_at         TEXT
);

CREATE TABLE IF NOT EXISTS order_items (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id     TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_slug TEXT NOT NULL,
  name         TEXT NOT NULL,
  size         TEXT NOT NULL,
  image        TEXT NOT NULL DEFAULT '',
  unit_price   INTEGER NOT NULL,
  quantity     INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_items_order ON order_items(order_id);

CREATE TABLE IF NOT EXISTS coupons (
  code        TEXT PRIMARY KEY,
  kind        TEXT NOT NULL DEFAULT 'percent', -- percent | amount | free_shipping
  value       INTEGER NOT NULL DEFAULT 0,
  min_total   INTEGER NOT NULL DEFAULT 0,
  uses_left   INTEGER,
  active      INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS newsletter (
  email      TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sections (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  title      TEXT NOT NULL DEFAULT '',
  kicker     TEXT NOT NULL DEFAULT '',
  text       TEXT NOT NULL DEFAULT '',
  cta_label  TEXT NOT NULL DEFAULT '',
  cta_href   TEXT NOT NULL DEFAULT '',
  image      TEXT NOT NULL DEFAULT '',
  position   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS messages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT NOT NULL DEFAULT '',
  body       TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
