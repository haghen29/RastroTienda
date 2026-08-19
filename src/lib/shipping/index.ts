import type { ShippingOption } from "@/lib/types";
import { all } from "@/lib/db";
import { store } from "@/lib/config";
import { tableQuote } from "./table";
import { andreaniConfigured, andreaniQuote } from "./andreani";

export interface QuoteItem {
  productSlug: string;
  size: string;
  quantity: number;
}

/** Peso total del pedido en gramos, leído de la base (nunca del cliente). */
export function weightFor(items: QuoteItem[]): number {
  if (!items.length) return 0;
  const rows = all<{ slug: string; size: string; weight_gr: number }>(
    `SELECT p.slug AS slug, v.size AS size, v.weight_gr AS weight_gr
     FROM variants v JOIN products p ON p.id = v.product_id`,
  );
  let total = 80; // packaging
  for (const it of items) {
    const row = rows.find((r) => r.slug === it.productSlug && r.size === it.size);
    total += (row?.weight_gr ?? 60) * Math.max(1, it.quantity);
  }
  return total;
}

export async function quoteShipping(
  zip: string,
  items: QuoteItem[],
  subtotal = 0,
): Promise<ShippingOption[]> {
  const weight = weightFor(items);

  let options: ShippingOption[];
  if (andreaniConfigured()) {
    try {
      options = await andreaniQuote(zip, weight);
    } catch (err) {
      console.warn("[envios] Andreani falló, uso tarifario propio:", err);
      options = tableQuote(zip, weight);
    }
  } else {
    options = tableQuote(zip, weight);
  }

  // Envío gratis por monto
  if (store.freeShippingFrom > 0 && subtotal >= store.freeShippingFrom * 100) {
    options = options.map((o) =>
      o.kind === "domicilio" ? { ...o, cost: 0, label: `${o.label} · gratis` } : o,
    );
  }
  return options;
}
