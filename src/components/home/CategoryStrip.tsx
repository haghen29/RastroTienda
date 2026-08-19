"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import type { Category } from "@/lib/types";
import { IconArrowLeft, IconArrowRight } from "@/components/ui/Icon";

/**
 * Sección "Categorías": 3 tarjetas en desktop, carrusel de 2 visibles en mobile.
 * Reproduce el bloque .section-categories-home del tema actual.
 */
export function CategoryStrip({ categories }: { categories: Category[] }) {
  const track = useRef<HTMLDivElement>(null);

  const scroll = (dir: -1 | 1) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.6, behavior: "smooth" });
  };

  return (
    <section className="pt-5 pb-10">
      <div className="container-rastro">
        <h2 className="text-center font-heading text-[20px] mb-8">Categorías</h2>

        <div
          ref={track}
          className="flex gap-4 overflow-x-auto no-scrollbar snap-x md:justify-center md:overflow-visible"
        >
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/${c.slug}`}
              className="shrink-0 w-[47%] md:w-[213px] snap-start group"
            >
              <div className="relative h-[100px] overflow-hidden">
                {c.image ? (
                  <Image
                    src={c.image}
                    alt=""
                    fill
                    sizes="(max-width: 767px) 47vw, 213px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[var(--accent-color)]" />
                )}
              </div>
              <span className="block text-center text-[14px] mt-2">{c.name}</span>
            </Link>
          ))}
        </div>

        <div className="flex md:hidden justify-center gap-10 mt-6 text-[var(--fg-40)]">
          <button type="button" onClick={() => scroll(-1)} aria-label="Anterior">
            <IconArrowLeft size={22} />
          </button>
          <button type="button" onClick={() => scroll(1)} aria-label="Siguiente">
            <IconArrowRight size={22} />
          </button>
        </div>
      </div>
    </section>
  );
}
