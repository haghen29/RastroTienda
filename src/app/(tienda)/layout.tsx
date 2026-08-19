import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { listCategories } from "@/lib/repo/products";

export const dynamic = "force-dynamic";

/** Layout de la tienda pública. El checkout y el admin tienen el suyo. */
export default function TiendaLayout({ children }: { children: React.ReactNode }) {
  const categories = listCategories();
  return (
    <>
      <Header categories={categories} />
      <main className="min-h-[50vh]">{children}</main>
      <Footer />
      <CartDrawer />
      <WhatsAppButton />
      <CookieBanner />
    </>
  );
}
