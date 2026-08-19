"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IconTimes } from "@/components/ui/Icon";
import type { Category } from "@/lib/types";

const SORTS = [
  { id: "price_asc", label: "Precio: menor a mayor" },
  { id: "price_desc", label: "Precio: mayor a menor" },
  { id: "az", label: "A - Z" },
  { id: "za", label: "Z - A" },
  { id: "newest", label: "Más nuevo al más viejo" },
  { id: "oldest", label: "Más viejo al más nuevo" },
  { id: "best", label: "Más vendidos" },
];

export interface Facets {
  sizes: { size: string; c: number }[];
  brands: { brand: string; c: number }[];
  minPrice: number;
  maxPrice: number;
}

export function FilterDrawer({
  facets,
  categories,
}: {
  facets: Facets;
  categories: Category[];
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const sort = params.get("sort") ?? "best";
  const sizes = params.getAll("size");
  const brands = params.getAll("brand");
  const [min, setMin] = useState(params.get("min") ?? "");
  const [max, setMax] = useState(params.get("max") ?? "");

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function push(mutate: (p: URLSearchParams) => void) {
    const p = new URLSearchParams(params.toString());
    p.delete("page");
    mutate(p);
    router.push(`${pathname}?${p.toString()}`);
  }

  function toggle(key: string, value: string) {
    push((p) => {
      const current = p.getAll(key);
      p.delete(key);
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      next.forEach((v) => p.append(key, v));
    });
  }

  const active = sizes.length + brands.length + (min ? 1 : 0) + (max ? 1 : 0);

  return (
    <>
      <div className="sticky top-[76px] md:static z-20 bg-white py-3 text-center">
        <button type="button" onClick={() => setOpen(true)} className="btn-link-rastro">
          Filtrar{active > 0 ? ` (${active})` : ""}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[15000]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-full md:w-[371px] bg-white overflow-y-auto">
            <div className="flex items-center px-5 h-16">
              <span className="flex-1 text-center pl-8 text-[16px]">Filtrar</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar filtros">
                <IconTimes size={24} />
              </button>
            </div>

            <div className="px-5 pb-10">
              <h3 className="text-[14px] font-semibold mb-3">Ordenar</h3>
              <div className="space-y-2 mb-8">
                {SORTS.map((s) => (
                  <label key={s.id} className="flex items-center gap-3 text-[14px] cursor-pointer">
                    <input
                      type="radio"
                      name="sort"
                      checked={sort === s.id}
                      onChange={() => push((p) => p.set("sort", s.id))}
                      className="accent-[#333]"
                    />
                    {s.label}
                  </label>
                ))}
              </div>

              <h3 className="text-[14px] font-semibold mb-3">Categorías</h3>
              <div className="space-y-2 mb-8">
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/${c.slug}`}
                    onClick={() => setOpen(false)}
                    className="block text-[14px]"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>

              {facets.sizes.length > 0 && (
                <>
                  <h3 className="text-[14px] font-semibold mb-3">Medida</h3>
                  <div className="space-y-2 mb-8">
                    {facets.sizes.map((s) => (
                      <label key={s.size} className="flex items-center gap-3 text-[14px] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sizes.includes(s.size)}
                          onChange={() => toggle("size", s.size)}
                          className="accent-[#333]"
                        />
                        {s.size} <span className="text-[var(--fg-40)]">({s.c})</span>
                      </label>
                    ))}
                  </div>
                </>
              )}

              {facets.brands.length > 0 && (
                <>
                  <h3 className="text-[14px] font-semibold mb-3">Marca</h3>
                  <div className="space-y-2 mb-8">
                    {facets.brands.map((b) => (
                      <label key={b.brand} className="flex items-center gap-3 text-[14px] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={brands.includes(b.brand)}
                          onChange={() => toggle("brand", b.brand)}
                          className="accent-[#333]"
                        />
                        {b.brand} <span className="text-[var(--fg-40)]">({b.c})</span>
                      </label>
                    ))}
                  </div>
                </>
              )}

              <h3 className="text-[14px] font-semibold mb-3">Precio</h3>
              <form
                className="flex items-end gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  push((p) => {
                    if (min) p.set("min", min); else p.delete("min");
                    if (max) p.set("max", max); else p.delete("max");
                  });
                }}
              >
                <label className="flex-1">
                  <span className="block text-[13px] mb-1">Desde</span>
                  <input
                    value={min}
                    onChange={(e) => setMin(e.target.value.replace(/\D/g, ""))}
                    placeholder={String(Math.round(facets.minPrice / 100))}
                    inputMode="numeric"
                    className="input-rastro"
                  />
                </label>
                <label className="flex-1">
                  <span className="block text-[13px] mb-1">Hasta</span>
                  <input
                    value={max}
                    onChange={(e) => setMax(e.target.value.replace(/\D/g, ""))}
                    placeholder={String(Math.round(facets.maxPrice / 100))}
                    inputMode="numeric"
                    className="input-rastro"
                  />
                </label>
                <button type="submit" disabled={!min && !max} className="btn-rastro px-5">
                  Aplicar
                </button>
              </form>

              {active > 0 && (
                <button
                  type="button"
                  onClick={() => router.push(pathname)}
                  className="btn-link-rastro mt-6"
                >
                  Borrar filtros
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
