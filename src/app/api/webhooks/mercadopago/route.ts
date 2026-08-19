import { NextResponse } from "next/server";
import { getPayment } from "@/lib/payments/mercadopago";
import { getOrder, setOrderStatus, decrementStock } from "@/lib/repo/orders";
import { sendOrderConfirmation } from "@/lib/mail";
import { sendWhatsApp } from "@/lib/whatsapp";
import { store, formatARS } from "@/lib/config";

export const runtime = "nodejs";

/**
 * Webhook de Mercado Pago. Configuralo en el panel de MP apuntando a
 * https://TU-DOMINIO/api/webhooks/mercadopago
 *
 * Nunca confiamos en el body: con el id del pago volvemos a consultar
 * la API de MP para saber el estado real.
 */
export async function POST(req: Request) {
  let body: { type?: string; action?: string; data?: { id?: string } } = {};
  try {
    body = await req.json();
  } catch {
    /* MP a veces manda el id por query string */
  }

  const url = new URL(req.url);
  const paymentId =
    body.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id");
  const topic = body.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic");

  if (topic !== "payment" || !paymentId) {
    return NextResponse.json({ ignored: true });
  }

  try {
    const payment = await getPayment(String(paymentId));
    const orderId = payment.external_reference ?? "";
    const order = orderId ? getOrder(orderId) : undefined;
    if (!order) return NextResponse.json({ ignored: true });

    if (payment.status === "approved" && order.status !== "paid") {
      setOrderStatus(order.id, "paid", String(paymentId));
      decrementStock(order.items);
      const fresh = getOrder(order.id)!;
      void sendOrderConfirmation(fresh).catch(() => {});
      void sendWhatsApp(
        store.phoneWhatsapp,
        `✅ Pago aprobado del pedido ${fresh.id} — ${formatARS(fresh.total)}`,
      ).catch(() => {});
    } else if (
      payment.status === "rejected" ||
      payment.status === "cancelled"
    ) {
      setOrderStatus(order.id, "cancelled", String(paymentId));
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[webhook mp]", e);
    // Devolvemos 200 para que MP no reintente en loop por un error nuestro
    return NextResponse.json({ ok: false });
  }
}
