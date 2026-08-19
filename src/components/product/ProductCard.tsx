import Link from "next/link";
import Image from "next/image";
import { formatARS } from "@/lib/config";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  // Tiendanube muestra el precio de la PRIMERA variante, no el más barato.
  const price = product.variants[0]?.price ?? 0;
  const compare = product.variants.find((v) => v.compareAt)?.compareAt ?? null;
  const [main, hover] = product.images;

  return (
    <article className="group">
      <Link href={`/productos/${product.slug}`} className="block">
        <div className="relative aspect-square bg-white overflow-hidden">
          {main ? (
            <>
              <Image
                src={main}
                alt={product.name}
                fill
                sizes="(max-width: 767px) 50vw, 25vw"
                className="object-contain transition-opacity duration-300 group-hover:opacity-0"
              />
              {hover && (
                <Image
                  src={hover}
                  alt=""
                  fill
                  sizes="(max-width: 767px) 50vw, 25vw"
                  className="object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full bg-[var(--fg-05)] grid place-items-center">
              <span className="font-heading text-[18px] text-[var(--fg-40)] px-4 text-center">
                {product.name}
              </span>
            </div>
          )}

          {compare && compare > price && (
            <div className="absolute top-2 left-2 bg-[var(--accent-color)] text-[11px] px-2 py-1">
              {Math.round((1 - price / compare) * 100)}% OFF
            </div>
          )}
        </div>

        <div className="text-center pt-3">
          <p className="text-[12px] opacity-80 leading-snug">{product.name}</p>
          <p className="text-[12px] mt-1">
            {compare && compare > price && (
              <span className="line-through text-[var(--fg-40)] mr-2">
                {formatARS(compare)}
              </span>
            )}
            {formatARS(price)}
          </p>
        </div>
      </Link>
    </article>
  );
}
