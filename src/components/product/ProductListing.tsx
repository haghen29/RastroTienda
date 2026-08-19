import Link from "next/link";
import { ProductCard } from "./ProductCard";
import { FilterDrawer } from "./FilterDrawer";
import { facets as getFacets, listCategories, listProducts, type ProductQuery } from "@/lib/repo/products";

const PER_PAGE = 12;

export interface ListingParams {
  sort?: string;
  size?: string | string[];
  brand?: string | string[];
  min?: string;
  max?: string;
  q?: string;
  page?: string;
}

const asArray = (v?: string | string[]) => (v ? (Array.isArray(v) ? v : [v]) : undefined);

export function ProductListing({
  title,
  category,
  breadcrumb,
  params,
}: {
  title: string;
  category?: string;
  breadcrumb: { label: string; href?: string }[];
  params: ListingParams;
}) {
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const query: ProductQuery = {
    category,
    sort: (params.sort as ProductQuery["sort"]) ?? "best",
    sizes: asArray(params.size),
    brands: asArray(params.brand),
    minPrice: params.min ? Number(params.min) * 100 : undefined,
    maxPrice: params.max ? Number(params.max) * 100 : undefined,
    search: params.q,
    limit: PER_PAGE * page,
    offset: 0,
  };
  const { items, total } = listProducts(query);
  const facets = getFacets(category);
  const categories = listCategories();
  const hasMore = items.length < total;

  const nextParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (k === "page" || v == null) return;
    (Array.isArray(v) ? v : [v]).forEach((x) => nextParams.append(k, x));
  });
  nextParams.set("page", String(page + 1));

  return (
    <div className="container-rastro pb-16">
      <nav className="text-[12px] text-center pt-6 pb-2 text-[var(--fg-40)]">
        {breadcrumb.map((b, i) => (
          <span key={b.label}>
            {i > 0 && <span className="mx-2">.</span>}
            {b.href ? (
              <Link href={b.href} className="hover:underline">{b.label}</Link>
            ) : (
              <span>{b.label}</span>
            )}
          </span>
        ))}
      </nav>

      <h1 className="text-center font-heading text-[24px] mb-2">{title}</h1>

      <FilterDrawer facets={facets} categories={categories} />

      {items.length === 0 ? (
        <p className="text-center text-[14px] py-16 opacity-70">
          No tenemos resultados para tu búsqueda. Por favor, intentá con otros filtros.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 mt-4">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {hasMore && (
            <div className="text-center mt-12">
              <Link href={`?${nextParams.toString()}`} className="btn-rastro px-10 inline-flex">
                Ver más productos
              </Link>
            </div>
          )}

          <p className="text-center text-[12px] text-[var(--fg-40)] mt-6">
            {items.length} de {total} productos
          </p>
        </>
      )}
    </div>
  );
}
