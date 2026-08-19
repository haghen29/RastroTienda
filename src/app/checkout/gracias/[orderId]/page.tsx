import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrder } from "@/lib/repo/orders";
import { formatARS, store } from "@/lib/config";
import { transferProofMessage, waLink } from "@/lib/whatsapp";
import { Logo } from "@/components/ui/Logo";
import { IconWhatsApp } from "@/components/ui/Icon";

export const dynamic = "force-dynamic";

export default async function GraciasPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = getOrder(orderId);
  if (!order) notFound();

  const isTransfer = order.paymentMethod === "transfer";
  const t = store.transfer;

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[var(--header-background)] py-4">
        <div className="container-rastro flex justify-center">
          <Link href="/"><Logo width={140} /></Link>
        </div>
      </div>

      <div className="container-rastro py-12 max-w-[620px]">
        <h1 className="font-heading text-[26px] mb-2">
          {isTransfer ? "Reservamos tu pedido" : "¡Gracias por tu compra!"}
        </h1>
        <p className="text-[14px] text-[var(--fg-40)] mb-8">
          Pedido <strong className="text-[var(--main-foreground)]">{order.id}</strong> ·{" "}
          {new Date(order.createdAt + "Z").toLocaleDateString("es-AR")}
        </p>

        {isTransfer && (
          <section className="bg-[var(--fg-03)] p-6 mb-8">
            <h2 className="font-heading text-[18px] mb-4">Datos para transferir</h2>
            <dl className="text-[14px] space-y-2">
              <div className="flex justify-between gap-4"><dt>Alias</dt><dd className="font-semibold">{t.alias}</dd></div>
              {t.cbu && <div className="flex justify-between gap-4"><dt>CBU</dt><dd className="font-semibold">{t.cbu}</dd></div>}
              <div className="flex justify-between gap-4"><dt>Titular</dt><dd>{t.holder}</dd></div>
              {t.bank && <div className="flex justify-between gap-4"><dt>Banco</dt><dd>{t.bank}</dd></div>}
              <div className="flex justify-between gap-4 pt-2 border-t border-[var(--fg-10)]">
                <dt className="font-heading text-[18px]">Importe</dt>
                <dd className="font-heading text-[18px]">{formatARS(order.total)}</dd>
              </div>
            </dl>

            <p className="text-[13px] mt-5 mb-4">
              Cuando transfieras, mandanos el comprobante por WhatsApp y preparamos el pedido.
              Guardamos el stock por 24 horas.
            </p>
            <a
              href={waLink(transferProofMessage(order))}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white px-5 h-11 text-[13px]"
            >
              <IconWhatsApp size={20} /> Enviar comprobante por WhatsApp
            </a>
          </section>
        )}

        <section className="mb-8">
          <h2 className="font-heading text-[18px] mb-4">Tu pedido</h2>
          <ul className="divide-y divide-[var(--fg-10)]">
            {order.items.map((i, idx) => (
              <li key={idx} className="flex justify-between gap-4 py-3 text-[14px]">
                <span>{i.name} <span className="text-[var(--fg-40)]">({i.size})</span> × {i.quantity}</span>
                <span>{formatARS(i.unitPrice * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="text-[14px] space-y-2 pt-4">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatARS(order.subtotal)}</span></div>
            {order.discount > 0 && (
              <div className="flex justify-between"><span>Descuento</span><span>-{formatARS(order.discount)}</span></div>
            )}
            <div className="flex justify-between"><span>{order.shippingLabel}</span><span>{formatARS(order.shippingCost)}</span></div>
            <div className="flex justify-between font-heading text-[22px] pt-2">
              <span>Total</span><span>{formatARS(order.total)}</span>
            </div>
          </div>
        </section>

        <section className="text-[14px] text-[var(--fg-40)] mb-10">
          <p>{order.shippingEta}</p>
          {order.shippingMethod === "domicilio" && (
            <p className="mt-1">
              {order.address.street} {order.address.number} {order.address.extra} — {order.address.city}, CP {order.address.zip}
            </p>
          )}
        </section>

        <Link href="/productos" className="btn-rastro px-8 inline-flex">Seguir comprando</Link>
      </div>
    </div>
  );
}
