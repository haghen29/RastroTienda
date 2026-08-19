/** Configuración del negocio. Todo lo editable vive acá o en .env */
export const store = {
  name: "Rastro Perfumeria",
  legalName: "Rastro Perfumeria",
  cuit: "20484605190",
  email: "rastro.fragances@gmail.com",
  phoneWhatsapp: "5491168487444",
  phoneLandline: "01162847444",
  instagram: "rastroperfumeria",
  instagramUrl: "https://instagram.com/rastroperfumeria",
  currency: "ARS",
  locale: "es-AR",
  /** Alias / CBU para el pago por transferencia */
  transfer: {
    alias: process.env.TRANSFER_ALIAS ?? "rastro.perfumeria",
    cbu: process.env.TRANSFER_CBU ?? "",
    holder: process.env.TRANSFER_HOLDER ?? "Rastro Perfumeria",
    bank: process.env.TRANSFER_BANK ?? "",
    /** Descuento por pagar con transferencia (0 = sin descuento) */
    discountPct: Number(process.env.TRANSFER_DISCOUNT_PCT ?? 0),
  },
  /** Monto mínimo de compra sin incluir envío. 0 = sin mínimo */
  minimumOrder: Number(process.env.MINIMUM_ORDER ?? 0),
  /** Envío gratis a partir de este monto. 0 = desactivado */
  freeShippingFrom: Number(process.env.FREE_SHIPPING_FROM ?? 0),
  checkoutNote:
    "Combo de decants: indicá perfume y medida en orden de preferencia. Ej: Le Male EDT - 10ml. Si faltan nombres, se repiten desde el primero. Ante cualquier duda te contactamos por WhatsApp.",
} as const;

export const CDN =
  "https://dcdn-us.mitiendanube.com/stores/007/273/379/products";

/** Construye la URL de una imagen del catálogo en el tamaño pedido. */
export function img(base: string, size: 320 | 480 | 640 | 1024 = 640) {
  const suffix = size === 1024 ? "1024-1024" : `${size}-0`;
  return `${CDN}/${base}-${suffix}.webp`;
}

/** "$38.000,00" — igual que la tienda actual (sin espacio después del signo). */
export function formatARS(cents: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  })
    .format(cents / 100)
    .replace(/\u00a0/g, "")
    .replace(/^\$\s*/, "$");
}

/** "$ 47.914,80" — variante con espacio que el tema usa sólo en el total del carrito. */
export function formatARSWide(cents: number) {
  return formatARS(cents).replace("$", "$ ");
}
