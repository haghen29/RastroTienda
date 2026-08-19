import { all, get, run } from "@/lib/db";
import type { Category, Product, Variant } from "@/lib/types";

interface ProductRow {
  id: number; slug: string; name: string; description: string; occasions: string;
  gender: string; brand: string; images: string; featured: number; published: number;
}
interface VariantRow {
  id: number; product_id: number; size: string; price: number;
  compare_at: number | null; stock: number | null; sku: string; weight_gr: number;
}

function hydrate(rows: ProductRow[]): Product[] {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const ph = ids.map(() => "?").join(",");
  const variants = all<VariantRow>(
    `SELECT * FROM variants WHERE product_id IN (${ph}) ORDER BY position, id`,
    ...ids,
  );
  const cats = all<{ product_id: number; category_slug: string }>(
    `SELECT * FROM product_categories WHERE product_id IN (${ph})`,
    ...ids,
  );
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    occasions: r.occasions,
    gender: r.gender as Product["gender"],
    brand: r.brand,
    images: JSON.parse(r.images) as string[],
    featured: !!r.featured,
    published: !!r.published,
    categories: cats.filter((c) => c.product_id === r.id).map((c) => c.category_slug),
    variants: variants
      .filter((v) => v.product_id === r.id)
      .map<Variant>((v) => ({
        id: v.id,
        size: v.size,
        price: v.price,
        compareAt: v.compare_at,
        stock: v.stock,
        sku: v.sku,
        weightGr: v.weight_gr,
      })),
  }));
}

export function listCategories(): Category[] {
  return all<Category & { position: number }>(
    `SELECT slug, name, description, image, position FROM categories ORDER BY position, name`,
  );
}

export function getCategory(slug: string): Category | undefined {
  return get<Category>(`SELECT * FROM categories WHERE slug = ?`, slug);
}

export interface ProductQuery {
  category?: string;
  sizes?: string[];
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: "price_asc" | "price_desc" | "az" | "za" | "newest" | "oldest" | "best";
  search?: string;
  limit?: number;
  offset?: number;
  includeUnpublished?: boolean;
}

export function listProducts(q: ProductQuery = {}): { items: Product[]; total: number } {
  const where: string[] = [];
  const params: unknown[] = [];
  if (!q.includeUnpublished) where.push("p.published = 1");
  if (q.category) {
    where.push(
      "p.id IN (SELECT product_id FROM product_categories WHERE category_slug = ?)",
    );
    params.push(q.category);
  }
  if (q.search) {
    where.push("(p.name LIKE ? OR p.description LIKE ?)");
    params.push(`%${q.search}%`, `%${q.search}%`);
  }
  if (q.sizes?.length) {
    const ph = q.sizes.map(() => "?").join(",");
    where.push(`p.id IN (SELECT product_id FROM variants WHERE size IN (${ph}))`);
    params.push(...q.sizes);
  }
  if (q.brands?.length) {
    const ph = q.brands.map(() => "?").join(",");
    where.push(`p.brand IN (${ph})`);
    params.push(...q.brands);
  }
  if (q.minPrice != null) {
    where.push(`p.id IN (SELECT product_id FROM variants WHERE price >= ?)`);
    params.push(q.minPrice);
  }
  if (q.maxPrice != null) {
    where.push(`p.id IN (SELECT product_id FROM variants WHERE price <= ?)`);
    params.push(q.maxPrice);
  }
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const order =
    {
      price_asc: "(SELECT MIN(price) FROM variants WHERE product_id = p.id) ASC",
      price_desc: "(SELECT MIN(price) FROM variants WHERE product_id = p.id) DESC",
      az: "p.name COLLATE NOCASE ASC",
      za: "p.name COLLATE NOCASE DESC",
      newest: "p.created_at DESC, p.id DESC",
      oldest: "p.created_at ASC, p.id ASC",
      best: "p.featured DESC, p.position ASC, p.id ASC",
    }[q.sort ?? "best"] ?? "p.featured DESC, p.position ASC, p.id ASC";

  const total = get<{ c: number }>(
    `SELECT COUNT(*) AS c FROM products p ${clause}`,
    ...params,
  )!.c;

  const rows = all<ProductRow>(
    `SELECT p.* FROM products p ${clause} ORDER BY ${order} LIMIT ? OFFSET ?`,
    ...params,
    q.limit ?? 12,
    q.offset ?? 0,
  );
  return { items: hydrate(rows), total };
}

export function getProduct(slug: string): Product | undefined {
  const row = get<ProductRow>(`SELECT * FROM products WHERE slug = ?`, slug);
  return row ? hydrate([row])[0] : undefined;
}

export function getVariant(id: number) {
  return get<VariantRow>(`SELECT * FROM variants WHERE id = ?`, id);
}

/** Valores disponibles para el panel de filtros de una categoría. */
export function facets(category?: string) {
  const catFilter = category
    ? `WHERE p.published = 1 AND p.id IN (SELECT product_id FROM product_categories WHERE category_slug = ?)`
    : `WHERE p.published = 1`;
  const params = category ? [category] : [];

  const sizes = all<{ size: string; c: number }>(
    `SELECT v.size AS size, COUNT(DISTINCT p.id) AS c
     FROM products p JOIN variants v ON v.product_id = p.id ${catFilter}
     GROUP BY v.size ORDER BY v.size DESC`,
    ...params,
  );
  const brands = all<{ brand: string; c: number }>(
    `SELECT p.brand AS brand, COUNT(*) AS c FROM products p ${catFilter} AND p.brand <> ''
     GROUP BY p.brand ORDER BY p.brand`,
    ...params,
  );
  const range = get<{ lo: number; hi: number }>(
    `SELECT MIN(v.price) AS lo, MAX(v.price) AS hi
     FROM products p JOIN variants v ON v.product_id = p.id ${catFilter}`,
    ...params,
  );
  return { sizes, brands, minPrice: range?.lo ?? 0, maxPrice: range?.hi ?? 0 };
}

export function relatedProducts(product: Product, limit = 4): Product[] {
  const cat = product.categories[0];
  if (!cat) return [];
  const rows = all<ProductRow>(
    `SELECT p.* FROM products p
     WHERE p.published = 1 AND p.id <> ?
       AND p.id IN (SELECT product_id FROM product_categories WHERE category_slug = ?)
     ORDER BY p.featured DESC, p.id LIMIT ?`,
    product.id,
    cat,
    limit,
  );
  return hydrate(rows);
}

export function saveNewsletter(email: string) {
  run(`INSERT OR IGNORE INTO newsletter (email) VALUES (?)`, email.toLowerCase());
}

export function saveMessage(m: { name: string; email: string; phone: string; body: string }) {
  run(
    `INSERT INTO messages (name, email, phone, body) VALUES (?, ?, ?, ?)`,
    m.name, m.email, m.phone, m.body,
  );
}
