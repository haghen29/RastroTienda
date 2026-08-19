import { NextResponse } from "next/server";
import { z } from "zod";
import { all } from "@/lib/db";
import { createOrder, getCoupon } from "@/lib/repo/orders";
import { quoteShipping } from "@/lib/shipping";
import { sendMerchantNotification, sendTransferInstructions } from "@/lib/mail";
import { newOrderMessage, sendWhatsApp, transferProofMessage, waLink } from "@/lib/whatsapp";
import { store } from "@/lib/config";
import type { NewOrder } from "@/lib/repo/orders";

export const runtime = "nodejs";

const Body = z.object({
  items: z
    .array(
      z.object({
        productSlug: z.string(),
        size: z.string(),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1, "El carrito está vacío"),
  customer: z.object({
    name: z.string().min(2, "Ingresá tu nombre y apellido").max(120),
    email: z.string().email("Revisá el email"),
    phone: z.string().min(6, "Ingresá un teléfono").max(40),
    doc: z.string().max(20).optional().default(""),
  }),
  shipping: z.object({
    optionId: z.string(),
    zip: z.string().regex(/^\d{4}$/),
    street: z.string().max(160).optional().default(""),
    number: z.string().max(20).optional().default(""),
    extra: z.string().max(120).optional().default(""),
    city: z.string().max(120).optional().default(""),
    state: z.string().max(120).optional().default(""),
  }),
  paymentMethod: z.literal("transfer"),
  couponCode: z.string().max(40).optional().default(""),
  note: z.string().max(1000).optional().default(""),
});

interface PriceRow {
  slug: string;
  name: string;
  size: string;
  price: number;
  stock: number | null;
  images: string;
  published: number;
}

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 },
    );
  }
  const input = parsed.data;

  // ---- 1. Precios y stock SIEMPRE desde la base, nunca desde el cliente ----
  const rows = all<PriceRow>(
    `SELECT p.slug AS slug, p.name AS name, p.images AS images, p.published AS published,
            v.size AS size, v.price AS price, v.stock AS stock
     FROM variants v JOIN products p ON p.id = v.product_id`,
  );

  const items: NewOrder["items"] = [];
  for (const it of input.items) {
    const row = rows.find((r) => r.slug === it.productSlug && r.size === it.size);
    if (!row || !row.published) {
      return NextResponse.json(
        { error: `"${it.productSlug}" ya no está disponible` },
        { status: 409 },
      );
    }
    if (row.stock != null && row.stock < it.quantity) {
      return NextResponse.json(
        { error: `Nos quedan ${row.stock} unidades de ${row.name} (${row.size})` },
        { status: 409 },
      );
    }
    const images = JSON.parse(row.images) as string[];
    items.push({
      productSlug: row.slug,
      name: row.name,
      size: row.size,
      image: images[0] ?? "",
      unitPrice: row.price,
      quantity: it.quantity,
    });
  }

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  if (store.minimumOrder > 0 && subtotal < store.minimumOrder * 100) {
    return NextResponse.json(
      { error: `El monto mínimo de compra es de $${store.minimumOrder}` },
      { status: 400 },
    );
  }

  // ---- 2. Envío recotizado en el servidor ----
  const options = await quoteShipping(input.shipping.zip, input.items, subtotal);
  const option = options.find((o) => o.id === input.shipping.optionId) ?? options[0];
  if (!option) {
    return NextResponse.json({ error: "No hay envíos disponibles para ese CP" }, { status: 409 });
  }
  if (option.kind === "domicilio" && (!input.shipping.street || !input.shipping.city)) {
    return NextResponse.json({ error: "Completá la dirección de entrega" }, { status: 400 });
  }

  // ---- 3. Cupón ----
  let discount = 0;
  let couponCode = "";
  let shippingCost = option.cost;
  if (input.couponCode) {
    const c = getCoupon(input.couponCode);
    if (c && subtotal >= c.min_total) {
      couponCode = c.code;
      if (c.kind === "percent") discount = Math.round((subtotal * c.value) / 100);
      else if (c.kind === "amount") discount = Math.min(c.value, subtotal);
      else if (c.kind === "free_shipping") shippingCost = 0;
    }
  }

  // Descuento por transferencia
  if (store.transfer.discountPct > 0) {
    discount += Math.round(((subtotal - discount) * store.transfer.discountPct) / 100);
  }

  const total = Math.max(0, subtotal - discount) + shippingCost;

  // ---- 4. Crear la orden ----
  const order = createOrder({
    status: "awaiting_transfer",
    paymentMethod: "transfer",
    paymentRef: "",
    customerName: input.customer.name,
    customerEmail: input.customer.email,
    customerPhone: input.customer.phone,
    customerDoc: input.customer.doc ?? "",
    shippingMethod: option.kind,
    shippingLabel:
      option.kind === "domicilio"
        ? `Envío ${option.carrier} a domicilio`
        : `Punto de retiro ${option.carrier}`,
    shippingCost,
    shippingEta: option.eta,
    address: {
      street: input.shipping.street ?? "",
      number: input.shipping.number ?? "",
      extra: input.shipping.extra ?? "",
      city: input.shipping.city ?? "",
      state: input.shipping.state ?? "",
      zip: input.shipping.zip,
    },
    note: input.note ?? "",
    subtotal,
    discount,
    couponCode,
    total,
    items,
  });

  // ---- 5. Notificaciones (no bloquean la respuesta si fallan) ----
  void sendMerchantNotification(order).catch(() => {});
  void sendWhatsApp(store.phoneWhatsapp, newOrderMessage(order)).catch(() => {});

  // ---- 6. Transferencia (único medio de pago disponible) ----
  void sendTransferInstructions(order).catch(() => {});
  return NextResponse.json({
    orderId: order.id,
    method: "transfer",
    redirect: `/checkout/gracias/${order.id}`,
    whatsapp: waLink(transferProofMessage(order)),
    transfer: store.transfer,
    total: order.total,
  });
}
