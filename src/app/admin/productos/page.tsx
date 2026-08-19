import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { listProducts } from "@/lib/repo/products";
import { formatARS } from "@/lib/config";
import { createProduct, deleteProduct } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const { items, total } = listProducts({ limit: 500, includeUnpublished: true, sort: "oldest" });

  const sinFoto = items.filter((p) => p.images.length === 0).length;
  const sinPrecio = items.filter((p) => p.variants.some((v) => v.price === 0)).length;

  return (
    <>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="font-heading text-[24px]">Productos ({total})</h1>
        <form action={createProduct} className="flex gap-2">
          <input name="name" placeholder="Nombre del producto nuevo" className="input-rastro h-10 w-[260px]" />
          <input type="hidden" name="slug" value="" />
          <button type="submit" className="btn-rastro h-10 px-5">Agregar</button>
        </form>
      </div>

      {(sinFoto > 0 || sinPrecio > 0) && (
        <div className="bg-[#fdf3e3] text-[#8a5a12] text-[13px] p-3 mb-6">
          {sinFoto > 0 && <p>{sinFoto} producto(s) sin fotos cargadas.</p>}
          {sinPrecio > 0 && <p>{sinPrecio} producto(s) con alguna variante en $0.</p>}
        </div>
      )}

      <table className="w-full bg-white border border-[var(--fg-10)] text-[13px]">
        <thead className="bg-[var(--fg-03)] text-left">
          <tr>
            <th className="p-3">Producto</th>
            <th className="p-3">Precios</th>
            <th className="p-3">Categorías</th>
            <th className="p-3">Visible</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id} className="border-t border-[var(--fg-10)]">
              <td className="p-3">
                <Link href={`/admin/productos/${p.id}`} className="underline">{p.name}</Link>
                <span className="block text-[var(--fg-40)] text-[12px]">/{p.slug}</span>
              </td>
              <td className="p-3">
                {p.variants.map((v) => (
                  <span key={v.id} className="block">
                    {v.size}: {v.price === 0 ? <em className="text-[var(--danger)]">sin precio</em> : formatARS(v.price)}
                  </span>
                ))}
              </td>
              <td className="p-3 text-[var(--fg-40)]">{p.categories.join(", ") || "—"}</td>
              <td className="p-3">{p.published ? "Sí" : <span className="text-[var(--danger)]">No</span>}</td>
              <td className="p-3 text-right">
                <form action={deleteProduct}>
                  <input type="hidden" name="id" value={p.id} />
                  <button type="submit" className="underline text-[var(--danger)]">Eliminar</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
