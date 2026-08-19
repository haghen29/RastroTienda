"use client";

import Image from "next/image";
import { useState } from "react";
import { IconArrowLeft, IconArrowRight, IconChevronDown, IconChevronUp } from "@/components/ui/Icon";

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [i, setI] = useState(0);
  const [thumbStart, setThumbStart] = useState(0);
  const visible = images.slice(thumbStart, thumbStart + 4);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-[var(--fg-05)] grid place-items-center">
        <span className="font-heading text-[22px] text-[var(--fg-40)] px-8 text-center">{alt}</span>
      </div>
    );
  }

  const go = (d: -1 | 1) => setI((p) => (p + d + images.length) % images.length);

  return (
    <div className="md:flex md:gap-4">
      {/* miniaturas verticales (desktop) */}
      <div className="hidden md:flex flex-col items-center gap-2 w-[86px] shrink-0">
        <button
          type="button"
          onClick={() => setThumbStart((s) => Math.max(0, s - 1))}
          disabled={thumbStart === 0}
          className="disabled:opacity-25"
          aria-label="Ver miniaturas anteriores"
        >
          <IconChevronUp size={20} />
        </button>
        {visible.map((src, idx) => {
          const real = thumbStart + idx;
          return (
            <button
              key={src}
              type="button"
              onClick={() => setI(real)}
              className={`relative w-[84px] h-[84px] border ${
                real === i ? "border-[var(--fg-40)]" : "border-transparent"
              }`}
              aria-label={`Ver imagen ${real + 1}`}
            >
              <Image src={src} alt="" fill sizes="84px" className="object-contain" />
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setThumbStart((s) => Math.min(images.length - 4, s + 1))}
          disabled={thumbStart >= images.length - 4}
          className="disabled:opacity-25"
          aria-label="Ver más miniaturas"
        >
          <IconChevronDown size={20} />
        </button>
      </div>

      {/* imagen principal */}
      <div className="flex-1">
        <div className="relative aspect-square bg-white">
          <Image
            src={images[i]}
            alt={alt}
            fill
            priority
            sizes="(max-width: 767px) 100vw, 520px"
            className="object-contain"
          />
        </div>

        {/* paginador mobile */}
        <div className="flex md:hidden items-center justify-center gap-8 mt-4 text-[var(--fg-40)]">
          <button type="button" onClick={() => go(-1)} aria-label="Imagen anterior">
            <IconArrowLeft size={22} />
          </button>
          <span className="text-[14px] text-[var(--main-foreground)]">
            {i + 1} / {images.length}
          </span>
          <button type="button" onClick={() => go(1)} aria-label="Imagen siguiente">
            <IconArrowRight size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}
