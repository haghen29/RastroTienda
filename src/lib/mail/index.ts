import { Resend } from "resend";
import type { Order } from "@/lib/types";
import { store, formatARS } from "@/lib/config";
import { siteUrl } from "@/lib/payments/mercadopago";

/**
 * Emails transaccionales. Si no hay RESEND_API_KEY, los mensajes se
 * loguean por consola y el flujo sigue igual (útil en desarrollo).
 */

function resend() {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

const FROM = process.env.MAIL_FROM ?? `${store.name} <onboarding@resend.dev>`;

async function send(to: string | string[], subject: string, html: string) {
  const client = resend();
  if (!client) {
    console.log(`[mail:dev] Para: ${to} — ${subject}`);
    return { sent: false };
  }
  try {
    await client.emails.send({ from: FROM, to, subject, html });
    return { sent: true };
  } catch (e) {
    console.error("[mail] error al enviar:", e);
    return { sent: false };
  }
}

function layout(title: string, body: string) {
  return `<!doctype html><html lang="es"><body style="margin:0;background:#f6f6f4;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#333">
  <div style="max-width:560px;margin:0 auto;background:#fff">
    <div style="background:#e8e8e3;padding:24px;text-align:center">
      <div style="font-size:20px;letter-spacing:4px;font-family:Georgia,serif">RASTRO</div>
      <div style="font-size:10px;letter-spacing:3px;color:#7a6a55">PERFUMERÍA</div>
    </div>
    <div style="padding:28px">
      <h1 style="font-family:Georgia,serif;font-weight:400;font-size:22px;margin:0 0 16px">${title}</h1>
      ${body}
    </div>
    <div style="padding:20px;background:#e8e8e3;font-size:12px;text-align:center;color:#555">
      ${store.name} · <a href="https://wa.me/${store.phoneWhatsapp}" style="color:#555">WhatsApp</a> ·
      <a href="${store.instagramUrl}" style="color:#555">Instagram</a>
    </div>
  </div></body></html>`;
}

function itemsTable(order: Order) {
  const rows = order.items
    .map(
      (i) => `<tr>
        <td style="padding:8px 0;font-size:13px">${i.name} <span style="color:#888">(${i.size})</span> × ${i.quantity}</td>
        <td style="padding:8px 0;font-size:13px;text-align:right">${formatARS(i.unitPrice * i.quantity)}</td>
      </tr>`,
    )
    .join("");
  return `<table style="width:100%;border-collapse:collapse;margin:16px 0">
    ${rows}
    <tr><td colspan="2" style="border-top:1px solid #eee"></td></tr>
    <tr><td style="padding:6px 0;font-size:13px">Subtotal</td><td style="text-align:right;font-size:13px">${formatARS(order.subtotal)}</td></tr>
    ${order.discount > 0 ? `<tr><td style="padding:6px 0;font-size:13px">Descuento</td><td style="text-align:right;font-size:13px">-${formatARS(order.discount)}</td></tr>` : ""}
    <tr><td style="padding:6px 0;font-size:13px">Envío</td><td style="text-align:right;font-size:13px">${formatARS(order.shippingCost)}</td></tr>
    <tr><td style="padding:10px 0;font-size:17px;font-family:Georgia,serif">Total</td><td style="text-align:right;font-size:17px;font-family:Georgia,serif">${formatARS(order.total)}</td></tr>
  </table>`;
}

export async function sendOrderConfirmation(order: Order) {
  const body = `
    <p style="font-size:14px">¡Gracias por tu compra, ${order.customerName.split(" ")[0]}!</p>
    <p style="font-size:14px">Tu pedido <strong>${order.id}</strong> quedó confirmado.</p>
    ${itemsTable(order)}
    <p style="font-size:13px;color:#666">${order.shippingLabel} — ${order.shippingEta}</p>
    <p style="margin-top:24px"><a href="${siteUrl()}/checkout/gracias/${order.id}"
      style="background:#e8e8e3;color:#2c3e50;padding:13px 24px;text-decoration:none;display:inline-block;font-size:12px">Ver mi pedido</a></p>`;
  return send(order.customerEmail, `Pedido ${order.id} confirmado — ${store.name}`, layout("Compra confirmada", body));
}

export async function sendTransferInstructions(order: Order) {
  const t = store.transfer;
  const body = `
    <p style="font-size:14px">Reservamos tu pedido <strong>${order.id}</strong>. Para confirmarlo, transferí:</p>
    <div style="background:#f6f6f4;padding:16px;margin:16px 0;font-size:14px">
      <div><strong>Alias:</strong> ${t.alias}</div>
      ${t.cbu ? `<div><strong>CBU:</strong> ${t.cbu}</div>` : ""}
      <div><strong>Titular:</strong> ${t.holder}</div>
      ${t.bank ? `<div><strong>Banco:</strong> ${t.bank}</div>` : ""}
      <div style="margin-top:8px"><strong>Importe:</strong> ${formatARS(order.total)}</div>
    </div>
    ${itemsTable(order)}
    <p style="font-size:14px">Después mandanos el comprobante por WhatsApp así lo preparamos:</p>
    <p><a href="https://wa.me/${store.phoneWhatsapp}"
      style="background:#25D366;color:#fff;padding:13px 24px;text-decoration:none;display:inline-block;font-size:12px">Enviar comprobante</a></p>`;
  return send(order.customerEmail, `Datos para transferir — Pedido ${order.id}`, layout("Falta un paso", body));
}

export async function sendMerchantNotification(order: Order) {
  const body = `
    <p style="font-size:14px">Entró el pedido <strong>${order.id}</strong> (${order.paymentMethod === "transfer" ? "transferencia" : "Mercado Pago"}).</p>
    <p style="font-size:13px">${order.customerName} — ${order.customerPhone} — ${order.customerEmail}</p>
    ${itemsTable(order)}
    <p style="font-size:13px">${order.shippingLabel}<br>
    ${order.address.street} ${order.address.number} ${order.address.extra}<br>
    ${order.address.city}, ${order.address.state} — CP ${order.address.zip}</p>
    ${order.note ? `<p style="font-size:13px;background:#fff8e6;padding:12px"><strong>Nota:</strong> ${order.note}</p>` : ""}`;
  return send(process.env.MERCHANT_EMAIL ?? store.email, `Pedido nuevo ${order.id}`, layout("Pedido nuevo", body));
}

export async function sendContactMessage(m: { name: string; email: string; phone: string; body: string }) {
  const body = `<p style="font-size:14px"><strong>${m.name}</strong> — ${m.email} — ${m.phone}</p>
    <p style="font-size:14px;white-space:pre-wrap">${m.body.replace(/</g, "&lt;")}</p>`;
  return send(process.env.MERCHANT_EMAIL ?? store.email, `Consulta de ${m.name}`, layout("Nueva consulta", body));
}
