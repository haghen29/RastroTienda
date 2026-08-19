import Link from "next/link";
import { OrderLookup } from "./OrderLookup";
import { store } from "@/lib/config";

export const metadata = { title: `Mi cuenta - ${store.name}` };

export default function CuentaPage() {
  return (
    <div className="container-rastro py-10 max-w-[560px]">
      <nav className="text-[12px] text-center text-[var(--fg-40)] mb-2">
        <Link href="/" className="hover:underline">Inicio</Link>
        <span className="mx-2">.</span>
        <span>Mi cuenta</span>
      </nav>
      <h1 className="text-center font-heading text-[24px] mb-8">Seguí tu pedido</h1>
      <OrderLookup />
      <p className="text-[13px] text-[var(--fg-40)] text-center mt-10">
        ¿Necesitás una mano? Escribinos por{" "}
        <a href={`https://wa.me/${store.phoneWhatsapp}`} className="underline">WhatsApp</a>.
      </p>
    </div>
  );
}
