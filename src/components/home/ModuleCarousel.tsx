"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { IconArrowLeft, IconArrowRight } from "@/components/ui/Icon";

export interface ModuleSlide {
  title: string;
  text: string;
  ctaLabel?: string;
  ctaHref?: string;
  image?: string;
  kicker?: string;
}

/**
 * Carrusel de módulos "imagen + texto" del inicio.
 * Desktop: imagen 50% a la izquierda, texto centrado a la derecha.
 * Mobile: imagen arriba, texto abajo.
 */
export function ModuleCarousel({ slides }: { slides: ModuleSlide[] }) {
  const [i, setI] = useState(0);
  const s = slides[i];
  const go = (d: -1 | 1) => setI((p) => (p + d + slides.length) % slides.length);

  return (
    <section className="py-6">
      <div className="grid md:grid-cols-2 items-stretch">
        <div className="relative h-[240px] md:h-[380px] bg-[#f3f1eb] overflow-hidden">
          {s.image ? (
            <Image
              src={s.image}
              alt=""
              fill
              sizes="(max-width: 767px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center px-8 text-center">
              <span>
                <span className="block font-heading text-[11px] tracking-[0.4em] text-[#a08d6d] mb-3">
                  {s.kicker ?? "LISTADO DE"}
                </span>
                <span className="block font-heading text-[26px] md:text-[34px] tracking-[0.08em] text-[#8a7355] leading-tight">
                  {s.title.toUpperCase()}
                </span>
                <span className="block mt-4 text-[#a08d6d]">✦</span>
              </span>
            </div>
          )}
        </div>

        <div className="grid place-items-center text-center px-8 py-10 md:py-0">
          <div>
            <h2 className="font-heading text-[20px] md:text-[22px] mb-3">{s.title}</h2>
            <p className="text-[13px] opacity-80 max-w-[340px] mx-auto">{s.text}</p>
            {s.ctaHref && (
              <Link href={s.ctaHref} className="btn-rastro mt-6 px-8 inline-flex">
                {s.ctaLabel ?? "Ver más"}
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-8 mt-6 text-[var(--fg-40)]">
        <button type="button" onClick={() => go(-1)} aria-label="Anterior">
          <IconArrowLeft size={22} />
        </button>
        <span className="text-[14px] text-[var(--main-foreground)]">
          {i + 1} / {slides.length}
        </span>
        <button type="button" onClick={() => go(1)} aria-label="Siguiente">
          <IconArrowRight size={22} />
        </button>
      </div>
    </section>
  );
}
