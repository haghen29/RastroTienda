import { ContactForm } from "./ContactForm";
import { store } from "@/lib/config";
import { IconChat, IconMail } from "@/components/ui/Icon";
import Link from "next/link";

export const metadata = { title: `Contacto - ${store.name}` };

export default async function ContactoPage({
  searchParams,
}: {
  searchParams: Promise<{ arrepentimiento?: string }>;
}) {
  const sp = await searchParams;
  const arrepentimiento = sp.arrepentimiento === "1";

  return (
    <div className="container-rastro py-8 max-w-[620px]">
      <nav className="text-[12px] text-center text-[var(--fg-40)] mb-2">
        <Link href="/" className="hover:underline">Inicio</Link>
        <span className="mx-2">.</span>
        <span>Contacto</span>
      </nav>
      <h1 className="text-center font-heading text-[24px] mb-6">
        {arrepentimiento ? "Botón de arrepentimiento" : "Contacto"}
      </h1>

      {arrepentimiento ? (
        <p className="text-[14px] mb-8">
          Si te arrepentiste de tu compra tenés 10 días corridos desde que la recibiste para
          cancelarla sin costo (Ley 24.240, art. 34). Completá el formulario con tu número de
          pedido y lo gestionamos dentro de las 24 horas hábiles.
        </p>
      ) : (
        <p className="text-[14px] text-center mb-8">
          Escribinos al WhatsApp o a nuestro Instagram{" "}
          <a href={store.instagramUrl} className="underline">@{store.instagram}</a>
        </p>
      )}

      <div className="space-y-3 text-[14px] mb-10">
        <p className="flex items-center gap-3">
          <IconChat size={18} className="text-[var(--fg-40)]" />
          <a href={`https://wa.me/${store.phoneWhatsapp}`} className="hover:underline">
            {store.phoneWhatsapp}
          </a>
        </p>
        <p className="flex items-center gap-3">
          <IconChat size={18} className="text-[var(--fg-40)]" />
          <a href={`tel:${store.phoneLandline}`} className="hover:underline">{store.phoneLandline}</a>
        </p>
        <p className="flex items-center gap-3">
          <IconMail size={18} className="text-[var(--fg-40)]" />
          <a href={`mailto:${store.email}`} className="hover:underline">{store.email}</a>
        </p>
      </div>

      <ContactForm arrepentimiento={arrepentimiento} />
    </div>
  );
}
