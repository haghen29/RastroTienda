"use client";

import { store } from "@/lib/config";
import { IconWhatsApp } from "@/components/ui/Icon";

export function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${store.phoneWhatsapp}`}
      target="_blank"
      rel="noreferrer noopener"
      aria-label="Escribinos por WhatsApp"
      className="fixed bottom-5 right-5 z-30 w-14 h-14 rounded-full bg-[#25D366] text-white grid place-items-center shadow-lg hover:brightness-95 transition"
    >
      <IconWhatsApp size={30} />
    </a>
  );
}
