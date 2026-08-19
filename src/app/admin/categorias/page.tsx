import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { listCategories } from "@/lib/repo/products";
import { updateCategory } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const categories = listCategories();

  return (
    <>
      <h1 className="font-heading text-[24px] mb-2">Categorías</h1>
      <p className="text-[13px] text-[var(--fg-40)] mb-6 max-w-[640px]">
        Acá están todas las categorías de la tienda. Tildá &quot;Mostrar en el inicio&quot; para
        que aparezcan como tarjeta de imagen en la sección &quot;Categorías&quot; de la home (el
        texto queda debajo de la foto) — destildá para sacarlas de ahí. Estén o no en el inicio,
        cada una sigue llevando a su misma página de siempre (<code>/tuslug</code>).
      </p>

      <div className="space-y-4">
        {categories.map((c) => (
          <form
            key={c.slug}
            action={updateCategory}
            className="bg-white border border-[var(--fg-10)] p-5 space-y-3"
          >
            <input type="hidden" name="slug" value={c.slug} />
            <div className="grid md:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-[13px] mb-1">Nombre</span>
                <input name="name" defaultValue={c.name} className="input-rastro" />
              </label>
              <label className="block">
                <span className="block text-[13px] mb-1">Imagen (URL)</span>
                <input
                  name="image"
                  defaultValue={c.image}
                  placeholder="https://…"
                  className="input-rastro font-mono text-[12px]"
                />
              </label>
            </div>
            <label className="flex items-center gap-2 text-[13px]">
              <input
                type="checkbox"
                name="homeVisible"
                defaultChecked={c.homeVisible}
                className="accent-[#333]"
              />
              Mostrar en el inicio
            </label>
            <div className="flex items-center justify-between pt-2">
              <span className="text-[12px] text-[var(--fg-40)]">/{c.slug}</span>
              <button type="submit" className="btn-rastro px-8">Guardar</button>
            </div>
          </form>
        ))}
      </div>
    </>
  );
}
