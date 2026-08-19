import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import type { Order } from "@/lib/types";
import { store } from "@/lib/config";

export function mpConfigured() {
  return Boolean(process.env.MP_ACCESS_TOKEN);
}

function client() {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) throw new Error("Falta MP_ACCESS_TOKEN");
  return new MercadoPagoConfig({ accessToken, options: { timeout: 8000 } });
}

export function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}

/**
 * Crea una preferencia de Checkout Pro y devuelve el link de pago.
 * Los importes van en pesos (MP no usa centavos).
 */
export async function createPreference(order: Order): Promise<{ id: string; initPoint: string }> {
  const pref = new Preference(client());
  const base = siteUrl();

  const items = order.items.map((it) => ({
    id: `${it.productSlug}-${it.size}`,
    title: `${it.name} (${it.size})`,
    quantity: it.quantity,
    unit_price: it.unitPrice / 100,
    currency_id: "ARS",
    picture_url: it.image || undefined,
  }));

  if (order.shippingCost > 0) {
    items.push({
      id: "envio",
      title: order.shippingLabel || "Envío",
      quantity: 1,
      unit_price: order.shippingCost / 100,
      currency_id: "ARS",
      picture_url: undefined,
    });
  }

  const [firstName, ...rest] = order.customerName.split(" ");

  const res = await pref.create({
    body: {
      items,
      external_reference: order.id,
      statement_descriptor: store.name.toUpperCase().slice(0, 22),
      payer: {
        name: firstName,
        surname: rest.join(" ") || undefined,
        email: order.customerEmail,
        phone: { area_code: "", number: order.customerPhone },
        identification: order.customerDoc
          ? { type: "DNI", number: order.customerDoc }
          : undefined,
      },
      back_urls: {
        success: `${base}/checkout/gracias/${order.id}`,
        pending: `${base}/checkout/gracias/${order.id}`,
        failure: `${base}/checkout/error/${order.id}`,
      },
      auto_return: "approved",
      notification_url: `${base}/api/webhooks/mercadopago`,
      metadata: { order_id: order.id },
    },
  });

  if (!res.id || !res.init_point) throw new Error("Mercado Pago no devolvió init_point");
  return { id: res.id, initPoint: res.init_point };
}

export async function getPayment(paymentId: string) {
  const payment = new Payment(client());
  return payment.get({ id: paymentId });
}
