"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { run, get } from "@/lib/db";
import { setOrderStatus } from "@/lib/repo/orders";
import { isAdmin, login, logout } from "@/lib/auth";
import type { OrderStatus } from "@/lib/types";

async function guard() {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function loginAction(_prev: unknown, formData: FormData) {
  const res = await login(String(formData.get("password") ?? ""));
  if (!res.ok) return { error: res.error };
  redirect("/admin");
}

export async function logoutAction() {
  await logout();
  redirect("/admin/login");
}

export async function updateOrderStatus(formData: FormData) {
  await guard();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as OrderStatus;
  setOrderStatus(id, status);
  revalidatePath("/admin");
}

export async function updateProduct(formData: FormData) {
  await guard();
  const id = Number(formData.get("id"));
  run(
    `UPDATE products SET name = ?, description = ?, occasions = ?, gender = ?,
       brand = ?, images = ?, featured = ?, published = ? WHERE id = ?`,
    String(formData.get("name")),
    String(formData.get("description")),
    String(formData.get("occasions")),
    String(formData.get("gender")),
    String(formData.get("brand") ?? ""),
    JSON.stringify(
      String(formData.get("images") ?? "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    ),
    formData.get("featured") ? 1 : 0,
    formData.get("published") ? 1 : 0,
    id,
  );

  // Variantes
  for (const key of formData.keys()) {
    const m = key.match(/^variant_(\d+)_price$/);
    if (!m) continue;
    const vid = Number(m[1]);
    const price = Math.round(Number(formData.get(key)) * 100);
    const stockRaw = String(formData.get(`variant_${vid}_stock`) ?? "").trim();
    const weight = Number(formData.get(`variant_${vid}_weight`) ?? 60);
    run(
      `UPDATE variants SET price = ?, stock = ?, weight_gr = ? WHERE id = ? AND product_id = ?`,
      price,
      stockRaw === "" ? null : Number(stockRaw),
      weight,
      vid,
      id,
    );
  }

  // Categorías
  const cats = formData.getAll("categories").map(String);
  run(`DELETE FROM product_categories WHERE product_id = ?`, id);
  for (const c of cats) {
    run(
      `INSERT OR IGNORE INTO product_categories (product_id, category_slug) VALUES (?,?)`,
      id, c,
    );
  }

  revalidatePath("/admin/productos");
  revalidatePath("/");
  redirect("/admin/productos");
}

export async function createProduct(formData: FormData) {
  await guard();
  const slug = String(formData.get("slug"))
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  if (!slug) return;
  const exists = get<{ id: number }>(`SELECT id FROM products WHERE slug = ?`, slug);
  if (exists) redirect(`/admin/productos/${exists.id}`);

  run(
    `INSERT INTO products (slug, name, gender, images, published) VALUES (?,?,?,?,0)`,
    slug, String(formData.get("name") || slug), "unisex", "[]",
  );
  const row = get<{ id: number }>(`SELECT id FROM products WHERE slug = ?`, slug)!;
  for (const [size, price] of [["10ml", 0], ["5ml", 0]] as const) {
    run(
      `INSERT INTO variants (product_id, size, price, weight_gr) VALUES (?,?,?,?)`,
      row.id, size, price, size === "10ml" ? 60 : 42,
    );
  }
  redirect(`/admin/productos/${row.id}`);
}

export async function deleteProduct(formData: FormData) {
  await guard();
  run(`DELETE FROM products WHERE id = ?`, Number(formData.get("id")));
  revalidatePath("/admin/productos");
}

export async function updateSection(formData: FormData) {
  await guard();
  const id = Number(formData.get("id"));
  run(
    `UPDATE sections SET title = ?, kicker = ?, text = ?, cta_label = ?, cta_href = ?, image = ? WHERE id = ?`,
    String(formData.get("title") ?? ""),
    String(formData.get("kicker") ?? ""),
    String(formData.get("text") ?? ""),
    String(formData.get("ctaLabel") ?? ""),
    String(formData.get("ctaHref") ?? ""),
    String(formData.get("image") ?? ""),
    id,
  );
  revalidatePath("/admin/secciones");
  revalidatePath("/");
}

export async function createSection(formData: FormData) {
  await guard();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const maxPos = get<{ p: number }>(`SELECT COALESCE(MAX(position), -1) AS p FROM sections`)!.p;
  run(
    `INSERT INTO sections (title, kicker, text, cta_label, cta_href, image, position) VALUES (?,?,?,?,?,?,?)`,
    title, "LISTADO DE", "", "Ver más", "/", "", maxPos + 1,
  );
  revalidatePath("/admin/secciones");
  revalidatePath("/");
}

export async function deleteSection(formData: FormData) {
  await guard();
  run(`DELETE FROM sections WHERE id = ?`, Number(formData.get("id")));
  revalidatePath("/admin/secciones");
  revalidatePath("/");
}
