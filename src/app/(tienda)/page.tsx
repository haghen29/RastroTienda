import { CategoryStrip } from "@/components/home/CategoryStrip";
import { BannerGrid } from "@/components/home/BannerGrid";
import { ModuleCarousel } from "@/components/home/ModuleCarousel";
import { ProductCard } from "@/components/product/ProductCard";
import { listCategories, listProducts } from "@/lib/repo/products";
import { listSections } from "@/lib/repo/sections";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function Home() {
  const categories = listCategories();
  const genderCats = categories.filter((c) =>
    ["masculino", "femenino", "unisex"].includes(c.slug),
  );

  const sections = listSections();
  const featured = listProducts({ sort: "best", limit: 4 }).items;
  const arabes = listProducts({ category: "arabes", limit: 1 }).items[0];
  const disenador = listProducts({ category: "disenador", limit: 1 }).items[0];

  return (
    <>
      <CategoryStrip categories={genderCats} />

      <BannerGrid
        title="Accesibles Y Premium"
        banners={[
          {
            href: "/arabes",
            title: "Decants Árabes",
            kicker: "COLECCIÓN",
            image: arabes?.images[1],
            tone: "dark",
          },
          {
            href: "/disenador",
            title: "Decants de Diseñador",
            kicker: "COLECCIÓN",
            image: disenador?.images[1],
            tone: "dark",
          },
        ]}
      />

      {/* Sección nueva: productos destacados. Hoy la home no muestra
          ni un precio, y es la mejora de conversión más barata. */}
      {featured.length > 0 && (
        <section className="py-10">
          <div className="container-rastro">
            <h2 className="text-center font-heading text-[20px] mb-8">Más vendidos</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/productos" className="btn-link-rastro">
                Ver todos los productos
              </Link>
            </div>
          </div>
        </section>
      )}

      {sections.length > 0 && <ModuleCarousel slides={sections} />}
    </>
  );
}
