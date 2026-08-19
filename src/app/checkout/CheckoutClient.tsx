"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { formatARS, store } from "@/lib/config";
import { Logo } from "@/components/ui/Logo";
import { IconCard, IconCheck, IconChat, IconMail, IconPin, IconTruck } from "@/components/ui/Icon";

type Step = 1 | 2 | 3;

const STEPS: { n: Step; label: string }[] = [
  { n: 1, label: "Carrito" },
  { n: 2, label: "Entrega" },
  { n: 3, label: "Pago" },
];

export function CheckoutClient({ checkoutNote }: { checkoutNote: string }) {
  const {
    lines, subtotal, zip, setZip, shippingOptions, selectedShipping,
    selectShipping, loadingShipping, hydrated, clear,
  } = useCart();
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "", doc: "" });
  const [addr, setAddr] = useState({ street: "", number: "", extra: "", city: "", state: "" });
  const [zipDraft, setZipDraft] = useState(zip);
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [couponState, setCouponState] = useState<{ code: string; discount: number } | null>(null);
  const [couponOpen, setCouponOpen] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  /** Evita que el redirect de "carrito vacío" pise la navegación al comprobante. */
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => setZipDraft(zip), [zip]);

  useEffect(() => {
    if (hydrated && lines.length === 0 && !submitted) router.replace("/productos");
  }, [hydrated, lines.length, router, submitted]);

  const discount = couponState?.discount ?? 0;
  const shippingCost = selectedShipping?.cost ?? 0;
  const total = Math.max(0, subtotal - discount) + shippingCost;

  async function applyCoupon() {
    setError("");
    const res = await fetch("/api/coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: coupon, subtotal }),
    });
    const data = await res.json();
    if (!res.ok) { setCouponState(null); setError(data.error ?? "Cupón inválido"); return; }
    setCouponState({ code: data.code, discount: data.discount });
  }

  async function submit() {
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({
            productSlug: l.productSlug, size: l.size, quantity: l.quantity,
          })),
          customer,
          shipping: { optionId: selectedShipping?.id ?? "", zip, ...addr },
          paymentMethod: "transfer",
          couponCode: couponState?.code ?? "",
          note,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "No pudimos procesar el pedido"); return; }
      setSubmitted(true);
      clear();
      router.push(data.redirect);
    } catch {
      setError("Hubo un problema de conexión. Probá de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  const canStep2 =
    customer.name.trim().length > 2 &&
    /\S+@\S+\.\S+/.test(customer.email) &&
    customer.phone.trim().length > 5;

  const needsAddress = selectedShipping?.kind === "domicilio";
  const canStep3 =
    !!selectedShipping &&
    (!needsAddress || (addr.street.trim() && addr.number.trim() && addr.city.trim()));

  if (!hydrated) return null;

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-[var(--header-background)] py-4">
        <div className="container-rastro flex justify-center">
          <Link href="/"><Logo width={140} /></Link>
        </div>
      </header>

      <div className="container-rastro py-8 grid md:grid-cols-[1fr_360px] gap-10 md:gap-16 items-start">
        {/* ---------------- columna izquierda ---------------- */}
        <div>
          {/* stepper */}
          <ol className="flex items-center justify-between max-w-[560px] mx-auto mb-10">
            {STEPS.map((s, i) => (
              <li key={s.n} className="flex-1 flex items-center last:flex-none">
                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => s.n < step && setStep(s.n)}
                    className={`w-7 h-7 rounded-full border grid place-items-center ${
                      s.n <= step ? "border-[var(--main-foreground)]" : "border-[var(--fg-20)]"
                    }`}
                    aria-label={s.label}
                  >
                    {s.n < step ? <IconCheck size={16} /> : s.n === 3 ? <IconCard size={15} /> : <span className="text-[11px]">{s.n}</span>}
                  </button>
                  <span className={`text-[12px] ${s.n === step ? "" : "text-[var(--fg-40)]"}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <span className={`flex-1 h-px mx-2 -mt-6 ${s.n < step ? "bg-[var(--main-foreground)]" : "bg-[var(--fg-20)]"}`} />
                )}
              </li>
            ))}
          </ol>

          {/* ---- paso 1: datos ---- */}
          {step === 1 && (
            <section className="space-y-4 max-w-[560px]">
              <h2 className="font-heading text-[20px]">Tus datos</h2>
              <input
                className="input-rastro" placeholder="Nombre y apellido"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              />
              <input
                className="input-rastro" type="email" placeholder="Email"
                value={customer.email}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  className="input-rastro" placeholder="Teléfono / WhatsApp"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                />
                <input
                  className="input-rastro" placeholder="DNI (opcional)"
                  value={customer.doc}
                  onChange={(e) => setCustomer({ ...customer, doc: e.target.value })}
                />
              </div>
              <button
                type="button" disabled={!canStep2}
                onClick={() => setStep(2)} className="btn-rastro w-full"
              >
                Continuar
              </button>
            </section>
          )}

          {/* ---- paso 2: entrega ---- */}
          {step === 2 && (
            <section className="space-y-5 max-w-[560px]">
              <h2 className="font-heading text-[20px]">Entrega</h2>

              <form
                className="flex gap-2"
                onSubmit={(e) => { e.preventDefault(); void setZip(zipDraft); }}
              >
                <input
                  className="input-rastro flex-1" placeholder="Código postal"
                  inputMode="numeric" value={zipDraft}
                  onChange={(e) => setZipDraft(e.target.value.replace(/\D/g, "").slice(0, 4))}
                />
                <button type="submit" className="btn-rastro px-6">Calcular</button>
              </form>

              {loadingShipping && <p className="text-[13px] text-[var(--fg-40)]">Calculando…</p>}

              {shippingOptions.map((o) => (
                <label key={o.id} className="flex gap-3 bg-[var(--fg-03)] p-4 cursor-pointer">
                  <input
                    type="radio" name="ship" className="mt-1 accent-[#333]"
                    checked={selectedShipping?.id === o.id}
                    onChange={() => selectShipping(o.id)}
                  />
                  <span className="flex-1">
                    <span className="flex justify-between gap-3 text-[14px]">
                      <span>{o.kind === "domicilio" ? `Envío ${o.carrier} a domicilio` : "Punto de retiro"}</span>
                      <span>{o.cost === 0 ? "Gratis" : formatARS(o.cost)}</span>
                    </span>
                    <span className="block text-[12px] text-[var(--fg-40)] mt-1">{o.eta}</span>
                  </span>
                </label>
              ))}

              {needsAddress && (
                <div className="space-y-4">
                  <div className="grid grid-cols-[1fr_120px] gap-4">
                    <input className="input-rastro" placeholder="Calle"
                      value={addr.street} onChange={(e) => setAddr({ ...addr, street: e.target.value })} />
                    <input className="input-rastro" placeholder="Número"
                      value={addr.number} onChange={(e) => setAddr({ ...addr, number: e.target.value })} />
                  </div>
                  <input className="input-rastro" placeholder="Piso / depto / referencias (opcional)"
                    value={addr.extra} onChange={(e) => setAddr({ ...addr, extra: e.target.value })} />
                  <div className="grid grid-cols-2 gap-4">
                    <input className="input-rastro" placeholder="Localidad"
                      value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} />
                    <input className="input-rastro" placeholder="Provincia"
                      value={addr.state} onChange={(e) => setAddr({ ...addr, state: e.target.value })} />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-link-rastro">Volver</button>
                <button type="button" disabled={!canStep3} onClick={() => setStep(3)} className="btn-rastro flex-1">
                  Continuar al pago
                </button>
              </div>
            </section>
          )}

          {/* ---- paso 3: pago ---- */}
          {step === 3 && (
            <section className="space-y-6 max-w-[560px]">
              <div className="space-y-4 text-[14px]">
                <div className="flex gap-3">
                  <IconMail size={18} className="mt-0.5 shrink-0 text-[var(--fg-40)]" />
                  <span className="flex-1">{customer.email}</span>
                  <button type="button" onClick={() => setStep(1)} className="underline text-[13px]">Cambiar</button>
                </div>
                <div className="flex gap-3">
                  <IconPin size={18} className="mt-0.5 shrink-0 text-[var(--fg-40)]" />
                  <span className="flex-1">
                    {needsAddress ? (
                      <>
                        {addr.street} {addr.number} {addr.extra}<br />
                        CP {zip}<br />
                        {addr.city}{addr.state ? `, ${addr.state}` : ""} — {customer.phone}
                      </>
                    ) : (
                      <>Retiro en punto Andreani — CP {zip}</>
                    )}
                  </span>
                  <button type="button" onClick={() => setStep(2)} className="underline text-[13px]">Cambiar</button>
                </div>
                <div className="flex gap-3">
                  <IconTruck size={18} className="mt-0.5 shrink-0 text-[var(--fg-40)]" />
                  <span className="flex-1">
                    <strong>
                      {selectedShipping?.kind === "domicilio"
                        ? `Envío ${selectedShipping.carrier} a domicilio`
                        : "Punto de retiro"}{" "}
                      · {shippingCost === 0 ? "Gratis" : formatARS(shippingCost)}
                    </strong>
                    <span className="block text-[13px] text-[var(--fg-40)]">{selectedShipping?.eta}</span>
                  </span>
                  <button type="button" onClick={() => setStep(2)} className="underline text-[13px]">Cambiar</button>
                </div>
                <div className="flex gap-3">
                  <IconChat size={18} className="mt-0.5 shrink-0 text-[var(--fg-40)]" />
                  <span className="flex-1">
                    <strong className="block mb-1">{checkoutNote}</strong>
                    {showNote ? (
                      <textarea
                        className="input-rastro h-24 py-2 mt-2" value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Escribí acá los perfumes y medidas"
                      />
                    ) : null}
                  </span>
                  {!showNote && (
                    <button type="button" onClick={() => setShowNote(true)} className="underline text-[13px]">
                      Agregar
                    </button>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-[13px] tracking-wide text-[var(--fg-40)] mb-3">MEDIO DE PAGO</h2>
                <div className="flex gap-3 border border-[var(--fg-40)] p-4">
                  <span>
                    <span className="block text-[14px]">Transferencia o depósito</span>
                    <span className="block text-[12px] text-[var(--fg-40)] mt-1">
                      Te damos el alias y nos mandás el comprobante por WhatsApp.
                      {store.transfer.discountPct > 0 && ` ${store.transfer.discountPct}% de descuento.`}
                    </span>
                  </span>
                </div>
              </div>

              {error && (
                <p className="bg-[#fdecea] text-[#a33] text-[13px] p-3">{error}</p>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="btn-link-rastro">Volver</button>
                <button type="button" disabled={busy} onClick={submit} className="btn-rastro flex-1">
                  {busy ? "Procesando…" : "Confirmar pedido"}
                </button>
              </div>
            </section>
          )}
        </div>

        {/* ---------------- resumen ---------------- */}
        <aside className="md:sticky md:top-8 border-t md:border-t-0 border-[var(--fg-10)] pt-6 md:pt-0">
          <ul className="space-y-4 mb-6">
            {lines.map((l) => (
              <li key={l.variantId} className="flex gap-3">
                <div className="relative w-12 h-16 shrink-0">
                  {l.image ? (
                    <Image src={l.image} alt="" fill sizes="48px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[var(--fg-05)]" />
                  )}
                </div>
                <p className="flex-1 text-[13px] leading-snug">
                  {l.name} <span className="text-[var(--fg-40)]">({l.size})</span>
                  <span className="block text-[var(--fg-40)]">× {l.quantity}</span>
                </p>
                <span className="text-[13px]">{formatARS(l.unitPrice * l.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="space-y-2 text-[14px] border-t border-[var(--fg-10)] pt-4">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatARS(subtotal)}</span></div>
            {discount > 0 && (
              <div className="flex justify-between text-[var(--success)]">
                <span>Descuento {couponState?.code}</span><span>-{formatARS(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Costo de envío</span>
              <span className={selectedShipping ? "" : "opacity-40"}>
                {selectedShipping ? (shippingCost === 0 ? "Gratis" : formatARS(shippingCost)) : "A calcular"}
              </span>
            </div>
            <div className="flex justify-between font-heading text-[20px] pt-2">
              <span>Total</span><span>{formatARS(total)}</span>
            </div>
          </div>

          <div className="mt-5">
            {couponOpen ? (
              <div className="flex gap-2">
                <input
                  className="input-rastro flex-1 h-10" placeholder="Código"
                  value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                />
                <button type="button" onClick={applyCoupon} className="btn-rastro h-10 px-4">Aplicar</button>
              </div>
            ) : (
              <button type="button" onClick={() => setCouponOpen(true)} className="btn-link-rastro">
                Agregar cupón de descuento
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
