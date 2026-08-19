import { notFound } from "next/navigation";
import { ProductListing, type ListingParams } from "@/components/product/ProductListing";
import { getCategory, listCategories } from "@/lib/repo/products";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return listCategories().map((c) => ({ categoria: c.slug }));
}

export default async function CategoriaPage({
  params,
  searchParams,
}: {
  params: Promise<{ categoria: string }>;
  searchParams: Promise<ListingParams>;
}) {
  const { categoria } = await params;
  const category = getCategory(categoria);
  if (!category) notFound();
  const sp = await searchParams;

  return (
    <ProductListing
      title={category.name}
      category={category.slug}
      breadcrumb={[{ label: "Inicio", href: "/" }, { label: category.name }]}
      params={sp}
    />
  );
}
