"use client";

import { useEffect, useState } from "react";
import { IconTimes } from "@/components/ui/Icon";

const KEY = "rastro.cookies";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch { /* ignorar */ }
  }, []);

  if (!show) return null;

  function accept() {
    try { localStorage.setItem(KEY, "1"); } catch { /* ignorar */ }
    setShow(false);
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-[9000] bg-white border-t border-[var(--fg-10)] shadow-[0_-2px_10px_var(--fg-05)]">
      <div className="container-rastro py-3 flex items-center gap-4 text-[13px]">
        <p className="flex-1">
          Al navegar por este sitio aceptás el uso de cookies para agilizar tu experiencia de compra.
        </p>
        <button type="button" onClick={accept} className="btn-rastro px-5 h-9 shrink-0">
          Entendido
        </button>
        <button type="button" onClick={accept} aria-label="Cerrar" className="shrink-0">
          <IconTimes size={18} />
        </button>
      </div>
    </div>
  );
}
