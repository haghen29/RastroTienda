import { db, run, get } from "../src/lib/db";
import { ALL_PRODUCTS, CATEGORIES, imageBase } from "../data/catalog";
import { img, store } from "../src/lib/config";
import { CHECKOUT_NOTE_KEY } from "../src/lib/repo/settings";

const conn = db();

// Limpieza para poder re-sembrar sin duplicar
conn.exec(`DELETE FROM product_categories;
           DELETE FROM variants;
           DELETE FROM products;
           DELETE FROM categories;`);

/**
 * Imagen destacada de cada categoría. Usamos una foto real de producto en
 * 1024 px en lugar de los banners de 240 px del tema actual, que se ven
 * borrosos en cualquier pantalla moderna.
 */
const CATEGORY_IMAGE_FROM: Record<string, string> = {
  masculino: "decant-bad-boy-cobalt-elixir",
  femenino: "decant-yara-candy",
  unisex: "decant-khamra",
  arabes: "decant-asad",
  disenador: "decant-le-male-edt",
  combo: "decant-9pm",
};

function categoryImage(slug: string): string {
  const from = CATEGORY_IMAGE_FROM[slug];
  const p = ALL_PRODUCTS.find((x) => x.slug === from);
  const code = p?.images[1] ?? p?.images[0];
  return code ? img(imageBase(code), 1024) : "";
}

// Imágenes propias (subidas a public/images) que reemplazan la foto de
// producto genérica para estas categorías puntuales.
const CATEGORY_IMAGE_OVERRIDE: Record<string, string> = {
  masculino: "/images/categoria-masculino.png",
  femenino: "/images/categoria-femenino.png",
};

// Categorías que arrancan visibles en la tira de imágenes del inicio.
const HOME_VISIBLE_DEFAULT = new Set(["masculino", "femenino", "unisex"]);

for (const c of CATEGORIES) {
  run(
    `INSERT INTO categories (slug, name, image, position, home_visible) VALUES (?,?,?,?,?)`,
    c.slug, c.name, CATEGORY_IMAGE_OVERRIDE[c.slug] ?? categoryImage(c.slug), c.order,
    HOME_VISIBLE_DEFAULT.has(c.slug) ? 1 : 0,
  );
}

let position = 0;
for (const p of ALL_PRODUCTS) {
  const images = p.images.map((code) => img(imageBase(code), 1024));
  run(
    `INSERT INTO products (slug, name, description, occasions, gender, brand, images, featured, published, position)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    p.slug, p.name, p.description, p.occasions, p.gender, "",
    JSON.stringify(images), p.featured ? 1 : 0, p.published === false ? 0 : 1, position++,
  );
  const id = get<{ id: number }>(`SELECT id FROM products WHERE slug = ?`, p.slug)!.id;
  let vpos = 0;
  for (const v of p.variants) {
    run(
      `INSERT INTO variants (product_id, size, price, stock, sku, weight_gr, position)
       VALUES (?,?,?,?,?,?,?)`,
      id, v.size, v.price, null, v.sku ?? "", v.weightGr, vpos++,
    );
  }
  for (const c of p.categories) {
    run(
      `INSERT OR IGNORE INTO product_categories (product_id, category_slug) VALUES (?,?)`,
      id, c,
    );
  }
}

// Un cupón de ejemplo para probar el flujo
run(
  `INSERT OR REPLACE INTO coupons (code, kind, value, min_total, uses_left, active)
   VALUES ('RASTRO10', 'percent', 10, 0, NULL, 1)`,
);

// Secciones del carrusel de inicio (editables después desde /admin/secciones).
// INSERT OR IGNORE con id fijo: si el admin ya las editó, un re-seed no las pisa.
const DEFAULT_SECTIONS = [
  {
    id: 1, title: "Perfumes de Diseñador 100ml", kicker: "LISTADO DE",
    text: "Escribinos al Instagram y te lo llevamos.",
    ctaLabel: "Ver decants de diseñador", ctaHref: "/disenador", position: 0,
    image: "/images/seccion-listado-disenador.png",
  },
  {
    id: 2, title: "Perfumes Árabes 100ml", kicker: "LISTADO DE",
    text: "Escribinos al Instagram y te lo llevamos.",
    ctaLabel: "Ver decants árabes", ctaHref: "/arabes", position: 1,
    image: "/images/seccion-listado-arabes.png",
  },
];
for (const s of DEFAULT_SECTIONS) {
  run(
    `INSERT OR IGNORE INTO sections (id, title, kicker, text, cta_label, cta_href, image, position)
     VALUES (?,?,?,?,?,?,?,?)`,
    s.id, s.title, s.kicker, s.text, s.ctaLabel, s.ctaHref, s.image, s.position,
  );
}

// Banners de "Accesibles Y Premium" (editables desde /admin/banners).
const DEFAULT_BANNERS = [
  { id: 1, href: "/arabes", image: "/images/banner-arabes.png", tone: "dark", position: 0 },
  { id: 2, href: "/disenador", image: "/images/banner-disenador.png", tone: "dark", position: 1 },
];
for (const b of DEFAULT_BANNERS) {
  run(
    `INSERT OR IGNORE INTO banners (id, href, title, kicker, image, tone, position)
     VALUES (?,?,?,?,?,?,?)`,
    b.id, b.href, "", "", b.image, b.tone, b.position,
  );
}

// Mensaje del paso de pago (editable después desde /admin/mensajes).
run(
  `INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`,
  CHECKOUT_NOTE_KEY, store.checkoutNote,
);

const count = get<{ c: number }>(`SELECT COUNT(*) AS c FROM products`)!.c;
const vcount = get<{ c: number }>(`SELECT COUNT(*) AS c FROM variants`)!.c;
console.log(`Sembrado: ${count} productos, ${vcount} variantes, ${CATEGORIES.length} categorías.`);
