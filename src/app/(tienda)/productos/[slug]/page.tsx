import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductGallery } from "@/components/product/ProductGallery";
import { BuyBox } from "@/components/product/BuyBox";
import { ProductCard } from "@/components/product/ProductCard";
import { getCategory, getProduct, relatedProducts } from "@/lib/repo/products";
import { MEDIDA_BOILERPLATE } from "@/../data/catalog";
import { store } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return { title: "Producto no encontrado" };
  return {
    title: `${p.name} - ${store.name}`,
    description: p.description.slice(0, 160),
    openGraph: { title: p.name, images: p.images.slice(0, 1) },
  };
}

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product || !product.published) notFound();

  const primary = product.categories[0];
  const category = primary ? getCategory(primary) : undefined;
  const related = relatedProducts(product);

  return (
    <div className="container-rastro py-8">
      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        <ProductGallery images={product.images} alt={product.name} />

        <div>
          <nav className="text-[12px] text-[var(--fg-40)] mb-4">
            <Link href="/" className="hover:underline">Inicio</Link>
            {category && (
              <>
                <span className="mx-2">.</span>
                <Link href={`/${category.slug}`} className="hover:underline">{category.name}</Link>
              </>
            )}
            <span className="mx-2">.</span>
            <span>{product.name}</span>
          </nav>

          <h1 className="font-heading text-[24px] mb-3">{product.name}</h1>

          <BuyBox product={product} />

          <div className="mt-10 space-y-4 text-[14px] leading-relaxed">
            <p>
              <span className="text-[12px] tracking-wide text-[var(--fg-40)]">DESCRIPCIÓN: </span>
              {product.description}
            </p>
            {product.occasions && (
              <p>
                <span className="text-[12px] tracking-wide text-[var(--fg-40)]">
                  OCASIONES PARA UTILIZARLO:{" "}
                </span>
                {product.occasions}
              </p>
            )}
            <p>
              <span className="text-[12px] tracking-wide text-[var(--fg-40)]">GÉNERO: </span>
              {product.gender}
            </p>
            <p>
              <span className="text-[12px] tracking-wide text-[var(--fg-40)]">MEDIDA: </span>
              {MEDIDA_BOILERPLATE}
            </p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-center font-heading text-[20px] mb-8">Productos similares</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
