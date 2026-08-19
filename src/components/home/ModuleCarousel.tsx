"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import { IconArrowLeft, IconArrowRight } from "@/components/ui/Icon";

export interface ModuleSlide {
  title: string;
  text: string;
  ctaLabel?: string;
  ctaHref?: string;
  image?: string;
  kicker?: string;
}

const SWIPE_THRESHOLD = 40;

/**
 * Carrusel de módulos "imagen + texto" del inicio.
 * Desktop: imagen 50% a la izquierda, texto centrado a la derecha.
 * Mobile: imagen arriba, texto abajo.
 * Se puede cambiar de slide arrastrando/deslizando el dedo, con los
 * botones, y hay una transición deslizante entre cada uno.
 */
export function ModuleCarousel({ slides }: { slides: ModuleSlide[] }) {
  const [i, setI] = useState(0);
  const go = (d: -1 | 1) => setI((p) => (p + d + slides.length) % slides.length);

  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  }
  function onTouchMove(e: React.TouchEvent) {
    if (touchStartX.current == null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  }
  function onTouchEnd() {
    if (touchDeltaX.current > SWIPE_THRESHOLD) go(-1);
    else if (touchDeltaX.current < -SWIPE_THRESHOLD) go(1);
    touchStartX.current = null;
    touchDeltaX.current = 0;
  }

  return (
    <section className="py-6">
      <div
        className="overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${i * 100}%)` }}
        >
          {slides.map((s, idx) => (
            <div key={idx} className="w-full shrink-0">
              {s.image ? (
                <Link
                  href={s.ctaHref || "#"}
                  className="relative block aspect-[1920/900] overflow-hidden group"
                >
                  <Image
                    src={s.image}
                    alt={s.title}
                    fill
                    sizes="100vw"
                    priority={idx === 0}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </Link>
              ) : (
                <div className="grid md:grid-cols-2 items-stretch">
                  <div className="relative h-[240px] md:h-[380px] bg-[#f3f1eb] overflow-hidden">
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
              )}
            </div>
          ))}
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
