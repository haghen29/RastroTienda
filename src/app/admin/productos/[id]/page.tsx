import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { all, get } from "@/lib/db";
import { listCategories } from "@/lib/repo/products";
import { updateProduct } from "../../actions";

export const dynamic = "force-dynamic";

interface Row {
  id: number; slug: string; name: string; description: string; occasions: string;
  gender: string; brand: string; images: string; featured: number; published: number;
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { id } = await params;
  const p = get<Row>(`SELECT * FROM products WHERE id = ?`, Number(id));
  if (!p) notFound();

  const variants = all<{ id: number; size: string; price: number; stock: number | null; weight_gr: number }>(
    `SELECT id, size, price, stock, weight_gr FROM variants WHERE product_id = ? ORDER BY position`,
    p.id,
  );
  const cats = all<{ category_slug: string }>(
    `SELECT category_slug FROM product_categories WHERE product_id = ?`, p.id,
  ).map((c) => c.category_slug);
  const categories = listCategories();
  const images = JSON.parse(p.images) as string[];

  return (
    <form action={updateProduct} className="max-w-[720px] space-y-6">
      <input type="hidden" name="id" value={p.id} />

      <div className="flex items-center justify-between">
        <h1 className="font-heading text-[22px]">{p.name}</h1>
        <Link href={`/productos/${p.slug}`} className="text-[13px] underline">Ver en la tienda ↗</Link>
      </div>

      <section className="bg-white border border-[var(--fg-10)] p-5 space-y-4">
        <label className="block">
          <span className="block text-[13px] mb-1">Nombre</span>
          <input name="name" defaultValue={p.name} className="input-rastro" />
        </label>
        <label className="block">
          <span className="block text-[13px] mb-1">Descripción</span>
          <textarea name="description" defaultValue={p.description} className="input-rastro h-32 py-2" />
        </label>
        <label className="block">
          <span className="block text-[13px] mb-1">Ocasiones para utilizarlo</span>
          <textarea name="occasions" defaultValue={p.occasions} className="input-rastro h-24 py-2" />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-[13px] mb-1">Género</span>
            <select name="gender" defaultValue={p.gender} className="input-rastro">
              <option value="masculino">masculino</option>
              <option value="femenino">femenino</option>
              <option value="unisex">unisex</option>
            </select>
          </label>
          <label className="block">
            <span className="block text-[13px] mb-1">Marca</span>
            <input name="brand" defaultValue={p.brand} className="input-rastro" />
          </label>
        </div>
      </section>

      <section className="bg-white border border-[var(--fg-10)] p-5">
        <h2 className="text-[14px] font-semibold mb-3">Fotos (una URL por línea)</h2>
        <textarea
          name="images"
          defaultValue={images.join("\n")}
          className="input-rastro h-36 py-2 font-mono text-[12px]"
          placeholder="https://…"
        />
        <p className="text-[12px] text-[var(--fg-40)] mt-2">
          Tamaño mínimo recomendado: 1280 px de lado. La primera foto es la de la grilla;
          la segunda aparece al pasar el mouse.
        </p>
      </section>

      <section className="bg-white border border-[var(--fg-10)] p-5">
        <h2 className="text-[14px] font-semibold mb-3">Variantes</h2>
        <table className="w-full text-[13px]">
          <thead className="text-left text-[var(--fg-40)]">
            <tr><th className="pb-2">Medida</th><th>Precio ($)</th><th>Stock</th><th>Peso (g)</th></tr>
          </thead>
          <tbody>
            {variants.map((v) => (
              <tr key={v.id}>
                <td className="py-2 pr-3">{v.size}</td>
                <td className="pr-3">
                  <input
                    name={`variant_${v.id}_price`}
                    defaultValue={(v.price / 100).toFixed(0)}
                    inputMode="numeric"
                    className="input-rastro h-9 w-28"
                  />
                </td>
                <td className="pr-3">
                  <input
                    name={`variant_${v.id}_stock`}
                    defaultValue={v.stock ?? ""}
                    placeholder="infinito"
                    inputMode="numeric"
                    className="input-rastro h-9 w-28"
                  />
                </td>
                <td>
                  <input
                    name={`variant_${v.id}_weight`}
                    defaultValue={v.weight_gr}
                    inputMode="numeric"
                    className="input-rastro h-9 w-24"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-[12px] text-[var(--fg-40)] mt-3">
          El peso se usa para cotizar el envío. Dejalo en 0 sólo si el envío es gratis.
        </p>
      </section>

      <section className="bg-white border border-[var(--fg-10)] p-5">
        <h2 className="text-[14px] font-semibold mb-3">Categorías</h2>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((c) => (
            <label key={c.slug} className="flex items-center gap-2 text-[13px]">
              <input
                type="checkbox"
                name="categories"
                value={c.slug}
                defaultChecked={cats.includes(c.slug)}
                className="accent-[#333]"
              />
              {c.name}
            </label>
          ))}
        </div>
      </section>

      <section className="bg-white border border-[var(--fg-10)] p-5 space-y-3">
        <label className="flex items-center gap-2 text-[13px]">
          <input type="checkbox" name="published" defaultChecked={!!p.published} className="accent-[#333]" />
          Visible en la tienda
        </label>
        <label className="flex items-center gap-2 text-[13px]">
          <input type="checkbox" name="featured" defaultChecked={!!p.featured} className="accent-[#333]" />
          Destacado en el inicio
        </label>
      </section>

      <div className="flex gap-3">
        <Link href="/admin/productos" className="btn-link-rastro">Cancelar</Link>
        <button type="submit" className="btn-rastro px-10">Guardar cambios</button>
      </div>
    </form>
  );
}
