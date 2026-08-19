"use client";

import {
  createContext, useContext, useEffect, useMemo, useState, useCallback, type ReactNode,
} from "react";
import type { CartLine, ShippingOption } from "@/lib/types";

const STORAGE_KEY = "rastro.cart.v1";
const ZIP_KEY = "rastro.zip";

interface CartState {
  lines: CartLine[];
  open: boolean;
  zip: string;
  shippingOptions: ShippingOption[];
  selectedShipping: ShippingOption | null;
  loadingShipping: boolean;
  hydrated: boolean;
  add: (line: Omit<CartLine, "quantity">, qty?: number) => void;
  setQty: (variantId: number, qty: number) => void;
  remove: (variantId: number) => void;
  clear: () => void;
  setOpen: (v: boolean) => void;
  setZip: (zip: string) => Promise<void>;
  selectShipping: (id: string) => void;
  subtotal: number;
  itemCount: number;
  total: number;
}

const Ctx = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [zip, setZipState] = useState("");
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Rehidratar desde localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
      const z = localStorage.getItem(ZIP_KEY);
      if (z) setZipState(z);
    } catch {
      /* storage no disponible: seguimos con carrito vacío */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch { /* ignorar */ }
  }, [lines, hydrated]);

  const quote = useCallback(async (z: string, currentLines: CartLine[]) => {
    if (!/^\d{4}$/.test(z) || currentLines.length === 0) {
      setShippingOptions([]);
      setSelectedId(null);
      return;
    }
    setLoadingShipping(true);
    try {
      const res = await fetch("/api/shipping/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zip: z,
          items: currentLines.map((l) => ({
            productSlug: l.productSlug,
            size: l.size,
            quantity: l.quantity,
          })),
        }),
      });
      if (!res.ok) throw new Error("quote failed");
      const data = (await res.json()) as { options: ShippingOption[] };
      setShippingOptions(data.options);
      setSelectedId((prev) =>
        prev && data.options.some((o) => o.id === prev) ? prev : (data.options[0]?.id ?? null),
      );
    } catch {
      setShippingOptions([]);
      setSelectedId(null);
    } finally {
      setLoadingShipping(false);
    }
  }, []);

  // Recotizar cuando cambian el CP o los ítems
  useEffect(() => {
    if (!hydrated) return;
    void quote(zip, lines);
  }, [zip, lines, hydrated, quote]);

  const setZip = useCallback(async (z: string) => {
    setZipState(z);
    try { localStorage.setItem(ZIP_KEY, z); } catch { /* ignorar */ }
  }, []);

  const add: CartState["add"] = useCallback((line, qty = 1) => {
    setLines((prev) => {
      const i = prev.findIndex((l) => l.variantId === line.variantId);
      if (i === -1) return [...prev, { ...line, quantity: qty }];
      const next = [...prev];
      const max = next[i].stock ?? Infinity;
      next[i] = { ...next[i], quantity: Math.min(next[i].quantity + qty, max) };
      return next;
    });
    setOpen(true);
  }, []);

  const setQty = useCallback((variantId: number, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.variantId !== variantId)
        : prev.map((l) =>
            l.variantId === variantId
              ? { ...l, quantity: Math.min(qty, l.stock ?? Infinity) }
              : l,
          ),
    );
  }, []);

  const remove = useCallback((variantId: number) => {
    setLines((prev) => prev.filter((l) => l.variantId !== variantId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const subtotal = useMemo(
    () => lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0),
    [lines],
  );
  const itemCount = useMemo(
    () => lines.reduce((s, l) => s + l.quantity, 0),
    [lines],
  );
  const selectedShipping = useMemo(
    () => shippingOptions.find((o) => o.id === selectedId) ?? null,
    [shippingOptions, selectedId],
  );
  const total = subtotal + (selectedShipping?.cost ?? 0);

  const value: CartState = {
    lines, open, zip, shippingOptions, selectedShipping, loadingShipping, hydrated,
    add, setQty, remove, clear, setOpen, setZip,
    selectShipping: setSelectedId,
    subtotal, itemCount, total,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return c;
}
