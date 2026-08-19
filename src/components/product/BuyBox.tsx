"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatARS } from "@/lib/config";
import type { Product, ShippingOption } from "@/lib/types";
import { IconMinus, IconPlus } from "@/components/ui/Icon";

export function BuyBox({ product }: { product: Product }) {
  const { add, zip, setZip } = useCart();
  const [variantId, setVariantId] = useState(product.variants[0]?.id);
  const [qty, setQty] = useState(1);
  const [zipDraft, setZipDraft] = useState(zip);
  const [editing, setEditing] = useState(!zip);
  const [options, setOptions] = useState<ShippingOption[]>([]);
  const [loading, setLoading] = useState(false);

  const variant = useMemo(
    () => product.variants.find((v) => v.id === variantId) ?? product.variants[0],
    [product.variants, variantId],
  );

  const outOfStock = variant?.stock != null && variant.stock <= 0;

  async function quote(z: string) {
    if (!/^\d{4}$/.test(z) || !variant) return;
    setLoading(true);
    try {
      const res = await fetch("/api/shipping/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zip: z,
          items: [{ productSlug: product.slug, size: variant.size, quantity: qty }],
        }),
      });
      const data = (await res.json()) as { options: ShippingOption[] };
      setOptions(data.options ?? []);
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }

  // Cotizar automáticamente si ya había un CP guardado
  useMemo(() => {
    if (zip && options.length === 0 && !loading) void quote(zip);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zip]);

  if (!variant) return null;

  return (
    <div>
      <p className="text-[14px] mb-4">{formatARS(variant.price)}</p>

      {product.variants.length > 1 && (
        <div className="mb-5">
          <p className="text-[13px] mb-2">
            Medida: <span className="text-[var(--fg-40)]">{variant.size}</span>
          </p>
          <div className="flex gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVariantId(v.id)}
                className={`px-3 h-8 text-[12px] border ${
                  v.id === variantId
                    ? "border-[var(--main-foreground)]"
                    : "border-[var(--fg-20)] hover:border-[var(--fg-40)]"
                }`}
              >
                {v.size}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 mb-6">
        <div className="inline-flex items-center border border-[var(--fg-10)] h-11">
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 h-full" aria-label="Quitar uno">
            <IconMinus size={16} />
          </button>
          <input
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value.replace(/\D/g, "")) || 1))}
            className="w-10 text-center outline-none text-[14px]"
            aria-label="Cantidad"
          />
          <button type="button" onClick={() => setQty((q) => q + 1)} className="px-3 h-full" aria-label="Agregar uno">
            <IconPlus size={16} />
          </button>
        </div>

        <button
          type="button"
          disabled={outOfStock}
          onClick={() =>
            add(
              {
                productSlug: product.slug,
                variantId: variant.id,
                name: product.name,
                size: variant.size,
                image: product.images[0] ?? "",
                unitPrice: variant.price,
                stock: variant.stock,
              },
              qty,
            )
          }
          className="btn-rastro flex-1 md:w-[260px] md:flex-none"
        >
          {outOfStock ? "Sin stock" : "Agregar al carrito"}
        </button>
      </div>

      {/* calculador de envío */}
      <div className="text-[13px]">
        {editing ? (
          <form
            className="flex gap-2 max-w-[380px]"
            onSubmit={(e) => {
              e.preventDefault();
              void setZip(zipDraft);
              void quote(zipDraft);
              setEditing(false);
            }}
          >
            <input
              value={zipDraft}
              onChange={(e) => setZipDraft(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="Tu código postal"
              inputMode="numeric"
              className="input-rastro flex-1"
              aria-label="Código postal"
            />
            <button type="submit" className="btn-rastro px-6">Calcular</button>
          </form>
        ) : (
          <div className="flex items-center justify-between">
            <span>Entregas para el CP: <strong>{zip}</strong></span>
            <button type="button" onClick={() => setEditing(true)} className="underline">
              Cambiar CP
            </button>
          </div>
        )}

        {loading && <p className="mt-4 text-[var(--fg-40)]">Calculando envío…</p>}

        {!loading && options.length > 0 && (
          <>
            <p className="mt-4 mb-3">
              Opciones para tu compra <strong>si sumás este producto</strong>.
            </p>
            {(["domicilio", "retiro"] as const).map((kind) => {
              const opts = options.filter((o) => o.kind === kind);
              if (!opts.length) return null;
              return (
                <div key={kind} className="mb-4">
                  <p className="mb-2">{kind === "domicilio" ? "Envío a domicilio" : "Retirar por"}</p>
                  {opts.map((o) => (
                    <div key={o.id} className="bg-[var(--fg-03)] p-4">
                      <div className="flex justify-between gap-3">
                        <span>
                          {kind === "domicilio" ? `Envío ${o.carrier} a domicilio` : "Punto de retiro"}
                        </span>
                        <span className="shrink-0">
                          {o.cost === 0 ? "Gratis" : formatARS(o.cost)}
                        </span>
                      </div>
                      <p className="text-[12px] text-[var(--fg-40)] mt-1">{o.eta}</p>
                      {kind === "retiro" && (
                        <Link href="/contacto" className="underline text-[12px] mt-2 inline-block">
                          Ver direcciones
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
            <p className="text-[12px] text-[var(--fg-40)]">
              El tiempo de entrega <strong className="text-[var(--main-foreground)]">no considera feriados</strong>.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
