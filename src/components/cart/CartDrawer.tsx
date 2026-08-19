"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { formatARS, formatARSWide, store } from "@/lib/config";
import { IconMinus, IconPlus, IconTimes } from "@/components/ui/Icon";

export function CartDrawer() {
  const {
    lines, open, setOpen, zip, setZip, shippingOptions, selectedShipping,
    selectShipping, loadingShipping, setQty, remove, subtotal, total, hydrated,
  } = useCart();
  const [editingZip, setEditingZip] = useState(false);
  const [zipDraft, setZipDraft] = useState(zip);
  const router = useRouter();

  useEffect(() => setZipDraft(zip), [zip]);

  // Bloquear el scroll del fondo mientras el panel está abierto
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const empty = hydrated && lines.length === 0;
  const belowMinimum = store.minimumOrder > 0 && subtotal < store.minimumOrder * 100;

  return (
    <>
      {/* overlay */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-black/40 z-[19999] transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden
      />

      <aside
        role="dialog"
        aria-label="Carrito de compras"
        aria-modal="true"
        className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-white z-[20000]
          flex flex-col transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* header 64px */}
        <div className="h-16 shrink-0 bg-[var(--fg-03)] flex items-center px-5">
          <span className="flex-1 text-center text-[16px] pl-10">Carrito de compras</span>
          <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar carrito">
            <IconTimes size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {empty ? (
            <div className="bg-[#eaf4fb] text-[#2a6f97] text-center text-[13px] py-3 px-4">
              El carrito de compras está vacío.
            </div>
          ) : (
            <>
              {/* ítems */}
              <ul>
                {lines.map((l) => (
                  <li key={l.variantId} className="flex gap-3 mb-4">
                    <Link
                      href={`/productos/${l.productSlug}`}
                      onClick={() => setOpen(false)}
                      className="shrink-0 w-[60px] h-[81px] relative bg-white"
                    >
                      {l.image ? (
                        <Image
                          src={l.image}
                          alt={l.name}
                          fill
                          sizes="60px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[var(--fg-05)]" />
                      )}
                    </Link>

                    <div className="flex-1 flex items-center">
                      <div className="flex-1 pr-3">
                        <p className="text-[13px] leading-snug">
                          {l.name}{" "}
                          <span className="text-[11px] text-[var(--fg-40)]">({l.size})</span>
                        </p>
                        <p className="text-[14px] mt-1">{formatARS(l.unitPrice)}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <button
                          type="button"
                          onClick={() => remove(l.variantId)}
                          className="underline text-[13px] block ml-auto mb-2"
                        >
                          Borrar
                        </button>
                        <div className="inline-flex items-center border border-[var(--fg-10)] h-9">
                          <button
                            type="button"
                            onClick={() => setQty(l.variantId, l.quantity - 1)}
                            className="px-2 h-full"
                            aria-label="Quitar uno"
                          >
                            <IconMinus size={16} />
                          </button>
                          <input
                            value={l.quantity}
                            onChange={(e) =>
                              setQty(l.variantId, Math.max(1, Number(e.target.value) || 1))
                            }
                            className="w-8 text-center text-[13px] outline-none"
                            aria-label="Cantidad"
                          />
                          <button
                            type="button"
                            onClick={() => setQty(l.variantId, l.quantity + 1)}
                            className="px-2 h-full"
                            aria-label="Agregar uno"
                          >
                            <IconPlus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* código postal */}
              <div className="flex items-center justify-between text-[13px] mt-6">
                {editingZip || !zip ? (
                  <form
                    className="flex gap-2 w-full"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void setZip(zipDraft);
                      setEditingZip(false);
                    }}
                  >
                    <input
                      value={zipDraft}
                      onChange={(e) => setZipDraft(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="Tu código postal"
                      inputMode="numeric"
                      className="input-rastro h-10 flex-1"
                      aria-label="Código postal"
                    />
                    <button type="submit" className="btn-rastro h-10 px-5">Calcular</button>
                  </form>
                ) : (
                  <>
                    <span>
                      Entregas para el CP: <strong>{zip}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingZip(true)}
                      className="underline"
                    >
                      Cambiar CP
                    </button>
                  </>
                )}
              </div>

              {/* opciones de envío */}
              {loadingShipping && (
                <p className="text-[13px] text-[var(--fg-40)] mt-4">Calculando envío…</p>
              )}

              {!loadingShipping &&
                (["domicilio", "retiro"] as const).map((kind) => {
                  const opts = shippingOptions.filter((o) => o.kind === kind);
                  if (!opts.length) return null;
                  return (
                    <div key={kind} className="mt-5">
                      <p className="text-[13px] mb-2">
                        {kind === "domicilio" ? "Envío a domicilio" : "Retirar por"}
                      </p>
                      {opts.map((o) => (
                        <label
                          key={o.id}
                          className="flex gap-3 bg-[var(--fg-03)] p-4 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="shipping"
                            checked={selectedShipping?.id === o.id}
                            onChange={() => selectShipping(o.id)}
                            className="mt-1 accent-[#333]"
                          />
                          <span className="flex-1">
                            <span className="flex justify-between gap-3">
                              <span className="text-[13px]">
                                {kind === "domicilio"
                                  ? `Envío ${o.carrier} a domicilio`
                                  : `Punto de retiro`}
                              </span>
                              <span className="text-[13px] shrink-0">
                                {o.cost === 0 ? "Gratis" : formatARS(o.cost)}
                              </span>
                            </span>
                            <span className="block text-[12px] text-[var(--fg-40)] mt-1">
                              {o.eta}
                            </span>
                            {kind === "retiro" && (
                              <Link
                                href="/contacto"
                                onClick={() => setOpen(false)}
                                className="underline text-[12px] mt-2 inline-block"
                              >
                                Ver direcciones
                              </Link>
                            )}
                          </span>
                        </label>
                      ))}
                    </div>
                  );
                })}

              {shippingOptions.length > 0 && (
                <p className="text-[12px] text-[var(--fg-40)] mt-4">
                  El tiempo de entrega <strong className="text-[var(--main-foreground)]">no considera feriados</strong>.
                </p>
              )}

              {/* totales */}
              <div className="mt-10">
                <div className="flex justify-between font-heading text-[16px] mb-1">
                  <span>Subtotal (sin envío):</span>
                  <span>{formatARS(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[14px] mb-2">
                  <span>Envío:</span>
                  <span className={selectedShipping ? "" : "opacity-40"}>
                    {selectedShipping
                      ? selectedShipping.cost === 0
                        ? "Gratis"
                        : formatARS(selectedShipping.cost)
                      : "Calculalo para verlo"}
                  </span>
                </div>
                <div className="flex justify-between font-heading text-[24px] mb-2">
                  <span>Total:</span>
                  <span>{formatARSWide(total)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* pie fijo */}
        {!empty && (
          <div className="shrink-0 px-5 pb-5 pt-2 border-t border-[var(--fg-05)]">
            {belowMinimum && (
              <div className="bg-[#fdf3e3] text-[#8a5a12] text-center text-[12px] py-2 px-3 mb-2">
                El monto mínimo de compra es de {formatARS(store.minimumOrder * 100)} sin incluir el envío.
              </div>
            )}
            <button
              type="button"
              disabled={belowMinimum || lines.length === 0}
              onClick={() => { setOpen(false); router.push("/checkout"); }}
              className="btn-rastro w-full mb-2"
            >
              Iniciar Compra
            </button>
            <div className="text-center">
              <Link
                href="/productos"
                onClick={() => setOpen(false)}
                className="btn-link-rastro"
              >
                Ver más productos
              </Link>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
