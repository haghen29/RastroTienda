import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { listSections } from "@/lib/repo/sections";
import { createSection, deleteSection, updateSection } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminSectionsPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const sections = listSections();

  return (
    <>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="font-heading text-[24px]">Secciones</h1>
        <form action={createSection} className="flex gap-2">
          <input name="title" placeholder="Nombre de la sección nueva" className="input-rastro h-10 w-[260px]" />
          <button type="submit" className="btn-rastro h-10 px-5">Agregar</button>
        </form>
      </div>

      <p className="text-[13px] text-[var(--fg-40)] mb-6 max-w-[640px]">
        Son los botones grandes con imagen que aparecen en el inicio (ej. &quot;Perfumes de
        Diseñador 100ml&quot;). Cada uno tiene su propia imagen y lleva a la página que elijas
        (por ejemplo <code>/disenador</code>, <code>/arabes</code> o cualquier otra categoría).
      </p>

      <div className="space-y-4">
        {sections.map((s) => (
          <form
            key={s.id}
            action={updateSection}
            className="bg-white border border-[var(--fg-10)] p-5 space-y-3"
          >
            <input type="hidden" name="id" value={s.id} />
            <div className="grid md:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-[13px] mb-1">Título</span>
                <input name="title" defaultValue={s.title} className="input-rastro" />
              </label>
              <label className="block">
                <span className="block text-[13px] mb-1">Texto pequeño arriba del título</span>
                <input name="kicker" defaultValue={s.kicker} className="input-rastro" />
              </label>
            </div>
            <label className="block">
              <span className="block text-[13px] mb-1">Texto</span>
              <input name="text" defaultValue={s.text} className="input-rastro" />
            </label>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-[13px] mb-1">Texto del botón</span>
                <input name="ctaLabel" defaultValue={s.ctaLabel} className="input-rastro" />
              </label>
              <label className="block">
                <span className="block text-[13px] mb-1">Link de destino</span>
                <input
                  name="ctaHref"
                  defaultValue={s.ctaHref}
                  placeholder="/disenador"
                  className="input-rastro"
                />
              </label>
            </div>
            <label className="block">
              <span className="block text-[13px] mb-1">Imagen (URL)</span>
              <input
                name="image"
                defaultValue={s.image}
                placeholder="https://…"
                className="input-rastro font-mono text-[12px]"
              />
            </label>

            <div className="flex items-center justify-between pt-2">
              <button type="submit" className="btn-rastro px-8">Guardar</button>
              <button
                type="submit"
                formAction={deleteSection}
                className="text-[13px] underline text-[var(--danger)]"
              >
                Eliminar
              </button>
            </div>
          </form>
        ))}
        {sections.length === 0 && (
          <p className="text-[13px] text-[var(--fg-40)]">Todavía no hay secciones creadas.</p>
        )}
      </div>
    </>
  );
}
