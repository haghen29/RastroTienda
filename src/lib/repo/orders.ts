import { all, get, run, db } from "@/lib/db";
import type { Order, OrderStatus } from "@/lib/types";

interface OrderRow {
  id: string; status: string; payment_method: string; payment_ref: string;
  customer_name: string; customer_email: string; customer_phone: string; customer_doc: string;
  shipping_method: string; shipping_label: string; shipping_cost: number; shipping_eta: string;
  address_street: string; address_number: string; address_extra: string;
  address_city: string; address_state: string; address_zip: string;
  note: string; subtotal: number; discount: number; coupon_code: string; total: number;
  created_at: string; paid_at: string | null;
}
interface ItemRow {
  order_id: string; product_slug: string; name: string; size: string;
  image: string; unit_price: number; quantity: number;
}

function toOrder(r: OrderRow, items: ItemRow[]): Order {
  return {
    id: r.id,
    status: r.status as OrderStatus,
    paymentMethod: r.payment_method as Order["paymentMethod"],
    paymentRef: r.payment_ref,
    customerName: r.customer_name,
    customerEmail: r.customer_email,
    customerPhone: r.customer_phone,
    customerDoc: r.customer_doc,
    shippingMethod: r.shipping_method as Order["shippingMethod"],
    shippingLabel: r.shipping_label,
    shippingCost: r.shipping_cost,
    shippingEta: r.shipping_eta,
    address: {
      street: r.address_street, number: r.address_number, extra: r.address_extra,
      city: r.address_city, state: r.address_state, zip: r.address_zip,
    },
    note: r.note,
    subtotal: r.subtotal,
    discount: r.discount,
    couponCode: r.coupon_code,
    total: r.total,
    createdAt: r.created_at,
    paidAt: r.paid_at,
    items: items
      .filter((i) => i.order_id === r.id)
      .map((i) => ({
        productSlug: i.product_slug, name: i.name, size: i.size,
        image: i.image, unitPrice: i.unit_price, quantity: i.quantity,
      })),
  };
}

export function nextOrderId(): string {
  const row = get<{ c: number }>(`SELECT COUNT(*) AS c FROM orders`)!;
  return `RP-${String(row.c + 1).padStart(6, "0")}`;
}

export type NewOrder = Omit<Order, "createdAt" | "paidAt" | "id"> & { id?: string };

export function createOrder(o: NewOrder): Order {
  const id = o.id ?? nextOrderId();
  const conn = db();
  conn.exec("BEGIN");
  try {
    run(
      `INSERT INTO orders (id, status, payment_method, payment_ref,
        customer_name, customer_email, customer_phone, customer_doc,
        shipping_method, shipping_label, shipping_cost, shipping_eta,
        address_street, address_number, address_extra, address_city, address_state, address_zip,
        note, subtotal, discount, coupon_code, total)
       VALUES (?,?,?,?, ?,?,?,?, ?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?)`,
      id, o.status, o.paymentMethod, o.paymentRef,
      o.customerName, o.customerEmail, o.customerPhone, o.customerDoc,
      o.shippingMethod, o.shippingLabel, o.shippingCost, o.shippingEta,
      o.address.street, o.address.number, o.address.extra,
      o.address.city, o.address.state, o.address.zip,
      o.note, o.subtotal, o.discount, o.couponCode, o.total,
    );
    for (const it of o.items) {
      run(
        `INSERT INTO order_items (order_id, product_slug, name, size, image, unit_price, quantity)
         VALUES (?,?,?,?,?,?,?)`,
        id, it.productSlug, it.name, it.size, it.image, it.unitPrice, it.quantity,
      );
    }
    conn.exec("COMMIT");
  } catch (e) {
    conn.exec("ROLLBACK");
    throw e;
  }
  return getOrder(id)!;
}

export function getOrder(id: string): Order | undefined {
  const r = get<OrderRow>(`SELECT * FROM orders WHERE id = ?`, id);
  if (!r) return undefined;
  const items = all<ItemRow>(`SELECT * FROM order_items WHERE order_id = ?`, id);
  return toOrder(r, items);
}

export function listOrders(limit = 100): Order[] {
  const rows = all<OrderRow>(`SELECT * FROM orders ORDER BY created_at DESC LIMIT ?`, limit);
  if (!rows.length) return [];
  const ph = rows.map(() => "?").join(",");
  const items = all<ItemRow>(
    `SELECT * FROM order_items WHERE order_id IN (${ph})`,
    ...rows.map((r) => r.id),
  );
  return rows.map((r) => toOrder(r, items));
}

export function setOrderStatus(id: string, status: OrderStatus, paymentRef?: string) {
  if (status === "paid") {
    run(
      `UPDATE orders SET status = ?, paid_at = datetime('now'), payment_ref = COALESCE(?, payment_ref) WHERE id = ?`,
      status, paymentRef ?? null, id,
    );
  } else {
    run(
      `UPDATE orders SET status = ?, payment_ref = COALESCE(?, payment_ref) WHERE id = ?`,
      status, paymentRef ?? null, id,
    );
  }
}

export function findOrderByPaymentRef(ref: string): Order | undefined {
  const r = get<OrderRow>(`SELECT * FROM orders WHERE payment_ref = ?`, ref);
  return r ? getOrder(r.id) : undefined;
}

/** Descuenta stock de las variantes con stock limitado. */
export function decrementStock(items: { productSlug: string; size: string; quantity: number }[]) {
  for (const it of items) {
    run(
      `UPDATE variants SET stock = MAX(0, stock - ?)
       WHERE stock IS NOT NULL AND size = ?
         AND product_id = (SELECT id FROM products WHERE slug = ?)`,
      it.quantity, it.size, it.productSlug,
    );
  }
}

export interface CouponRow {
  code: string; kind: "percent" | "amount" | "free_shipping";
  value: number; min_total: number; uses_left: number | null; active: number;
}

export function getCoupon(code: string): CouponRow | undefined {
  return get<CouponRow>(
    `SELECT * FROM coupons WHERE code = ? AND active = 1`,
    code.trim().toUpperCase(),
  );
}
