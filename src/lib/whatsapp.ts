import { store } from "@/lib/config";
import type { Order } from "@/lib/types";
import { formatARS } from "@/lib/config";

/** Link wa.me con mensaje prellenado. Funciona sin API ni credenciales. */
export function waLink(text: string, phone = store.phoneWhatsapp) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

/** Mensaje que el cliente manda con el comprobante de la transferencia. */
export function transferProofMessage(order: Order) {
  const lines = order.items
    .map((i) => `• ${i.name} (${i.size}) x${i.quantity}`)
    .join("\n");
  return [
    `¡Hola ${store.name}! Acabo de hacer la transferencia del pedido ${order.id}.`,
    "",
    lines,
    "",
    `Total: ${formatARS(order.total)}`,
    `A nombre de: ${order.customerName}`,
    "",
    "Adjunto el comprobante 📎",
  ].join("\n");
}

/** Aviso interno al vendedor cuando entra un pedido nuevo. */
export function newOrderMessage(order: Order) {
  return [
    `🧾 Pedido nuevo ${order.id}`,
    `${order.customerName} — ${order.customerPhone}`,
    order.items.map((i) => `• ${i.name} (${i.size}) x${i.quantity}`).join("\n"),
    `Envío: ${order.shippingLabel}`,
    `Total: ${formatARS(order.total)}`,
    order.note ? `Nota: ${order.note}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Envío automático por WhatsApp Cloud API (opcional).
 * Requiere WHATSAPP_TOKEN y WHATSAPP_PHONE_ID. Si no están, no hace nada
 * y el flujo sigue funcionando con los links wa.me.
 */
export async function sendWhatsApp(to: string, body: string) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  if (!token || !phoneId) return { sent: false, reason: "no configurado" };
  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body },
      }),
    });
    return { sent: res.ok, reason: res.ok ? "" : `HTTP ${res.status}` };
  } catch (e) {
    return { sent: false, reason: String(e) };
  }
}
