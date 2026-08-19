"use client";

import Link from "next/link";
import { useState } from "react";
import { store } from "@/lib/config";
import { IconInstagram } from "@/components/ui/Icon";

export function Footer() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "ok" | "error">("idle");

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setState(res.ok ? "ok" : "error");
    if (res.ok) setEmail("");
  }

  return (
    <footer className="bg-[var(--footer-background)] text-[var(--footer-foreground)] mt-16">
      <div className="container-rastro py-12 text-center">
        <a
          href={store.instagramUrl}
          target="_blank"
          rel="noreferrer noopener"
          aria-label="Instagram"
          className="inline-block mb-8"
        >
          <IconInstagram size={22} />
        </a>

        <nav className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-7 mb-8 text-[14px]">
          <Link href="/productos">Productos</Link>
          <Link href="/contacto">Contacto</Link>
          <Link href="/">Inicio</Link>
        </nav>

        <form
          onSubmit={subscribe}
          className="mx-auto w-[300px] max-w-full h-10 border border-[var(--fg-20)] flex items-center px-3 mb-8 bg-transparent"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setState("idle"); }}
            placeholder="Suscribite al newsletter..."
            aria-label="Email para el newsletter"
            className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-[var(--fg-40)]"
          />
          <button type="submit" className="underline text-[14px] shrink-0">
            {state === "ok" ? "¡Listo!" : "Enviar"}
          </button>
        </form>

        <div className="space-y-3 text-[14px] mb-10">
          <div><a href={`https://wa.me/${store.phoneWhatsapp}`}>{store.phoneWhatsapp}</a></div>
          <div><a href={`tel:${store.phoneLandline}`}>{store.phoneLandline}</a></div>
          <div><a href={`mailto:${store.email}`}>{store.email}</a></div>
        </div>

        <p className="text-[12px] leading-relaxed opacity-80">
          Copyright {store.name} - {store.cuit} - {new Date().getFullYear()}. Todos los derechos
          reservados.{" "}
          <span className="inline-block">
            Defensa de las y los consumidores. Para reclamos{" "}
            <a
              href="https://autogestion.produccion.gob.ar/consumidores"
              target="_blank"
              rel="noreferrer noopener"
              className="underline"
            >
              ingresá acá.
            </a>{" "}
            /{" "}
            <Link href="/contacto?arrepentimiento=1" className="underline">
              Botón de arrepentimiento
            </Link>
          </span>
        </p>
      </div>
    </footer>
  );
}
