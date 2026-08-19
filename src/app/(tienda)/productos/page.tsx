import { ProductListing, type ListingParams } from "@/components/product/ProductListing";

export const dynamic = "force-dynamic";

export const metadata = { title: "Productos - Rastro Perfumeria" };

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<ListingParams>;
}) {
  const params = await searchParams;
  return (
    <ProductListing
      title={params.q ? `Resultados para "${params.q}"` : "Productos"}
      breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Productos" }]}
      params={params}
    />
  );
}
