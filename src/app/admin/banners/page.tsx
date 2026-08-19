import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { listBanners } from "@/lib/repo/banners";
import { createBanner, deleteBanner, updateBanner } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const banners = listBanners();

  return (
    <>
      <div className="flex items-center justify-between mb-2 gap-4 flex-wrap">
        <h1 className="font-heading text-[24px]">Banners (Accesibles Y Premium)</h1>
        <form action={createBanner} className="flex gap-2">
          <input name="href" placeholder="Link de destino (ej. /arabes)" className="input-rastro h-10 w-[260px]" />
          <button type="submit" className="btn-rastro h-10 px-5">Agregar</button>
        </form>
      </div>

      <p className="text-[13px] text-[var(--fg-40)] mb-6 max-w-[640px]">
        Son los dos banners chicos debajo de las categorías. Usá imágenes de 1920×900 px para que
        no se recorten. Si dejás &quot;Título&quot; vacío, se muestra sólo la imagen a botón
        completo (ideal si el texto ya viene dibujado en la foto).
      </p>

      <div className="space-y-4">
        {banners.map((b) => (
          <form
            key={b.id}
            action={updateBanner}
            className="bg-white border border-[var(--fg-10)] p-5 space-y-3"
          >
            <input type="hidden" name="id" value={b.id} />
            <div className="grid md:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-[13px] mb-1">Link de destino</span>
                <input name="href" defaultValue={b.href} placeholder="/arabes" className="input-rastro" />
              </label>
              <label className="block">
                <span className="block text-[13px] mb-1">Tono (si hay texto)</span>
                <select name="tone" defaultValue={b.tone} className="input-rastro">
                  <option value="dark">Oscuro</option>
                  <option value="light">Claro</option>
                </select>
              </label>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-[13px] mb-1">Título (opcional)</span>
                <input name="title" defaultValue={b.title} className="input-rastro" />
              </label>
              <label className="block">
                <span className="block text-[13px] mb-1">Texto chico arriba (opcional)</span>
                <input name="kicker" defaultValue={b.kicker} className="input-rastro" />
              </label>
            </div>
            <label className="block">
              <span className="block text-[13px] mb-1">Imagen (URL, 1920×900 px)</span>
              <input
                name="image"
                defaultValue={b.image}
                placeholder="https://…"
                className="input-rastro font-mono text-[12px]"
              />
            </label>

            <div className="flex items-center justify-between pt-2">
              <button type="submit" className="btn-rastro px-8">Guardar</button>
              <button
                type="submit"
                formAction={deleteBanner}
                className="text-[13px] underline text-[var(--danger)]"
              >
                Eliminar
              </button>
            </div>
          </form>
        ))}
        {banners.length === 0 && (
          <p className="text-[13px] text-[var(--fg-40)]">Todavía no hay banners creados.</p>
        )}
      </div>
    </>
  );
}
