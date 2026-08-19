"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { Logo } from "@/components/ui/Logo";
import type { Category } from "@/lib/types";
import {
  IconBag, IconBars, IconSearch, IconUser, IconTimes,
  IconArrowRight, IconChevronLeft,
} from "@/components/ui/Icon";

const NAV = [
  { label: "Productos", href: "/productos" },
  { label: "Contacto", href: "/contacto" },
  { label: "Inicio", href: "/" },
];

export function Header({ categories }: { categories: Category[] }) {
  const { itemCount, setOpen } = useCart();
  const [menu, setMenu] = useState(false);
  const [submenu, setSubmenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [term, setTerm] = useState("");
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!term.trim()) return;
    setSearch(false);
    setMenu(false);
    router.push(`/productos?q=${encodeURIComponent(term.trim())}`);
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-[var(--header-background)] text-[var(--header-foreground)]">
        <div className="container-rastro">
          {/* ---------- fila 1 ---------- */}
          <div className="relative flex items-center justify-between gap-4 py-4 md:py-0 md:h-[128px]">
            {/* mobile: hamburguesa */}
            <button
              type="button"
              onClick={() => setMenu(true)}
              className="md:hidden p-1 -ml-1"
              aria-label="Abrir menú"
            >
              <IconBars size={26} />
            </button>

            {/* desktop: buscador abierto */}
            <form
              onSubmit={submit}
              className="hidden md:flex items-center bg-white border border-[var(--fg-10)] h-[37px] w-[210px] px-3"
            >
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Buscar"
                aria-label="Buscar productos"
                className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-[var(--fg-40)]"
              />
              <button type="submit" aria-label="Buscar" className="text-[var(--fg-40)]">
                <IconSearch size={20} />
              </button>
            </form>

            {/* logo */}
            <Link
              href="/"
              className="md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2"
            >
              <Logo width={160} className="md:hidden" />
              <Logo width={250} className="hidden md:block" />
            </Link>

            {/* acciones */}
            <div className="flex items-center gap-4 md:gap-5">
              <button
                type="button"
                onClick={() => setSearch(true)}
                className="md:hidden p-1"
                aria-label="Buscar"
              >
                <IconSearch size={24} />
              </button>
              <Link href="/cuenta" className="hidden md:block p-1" aria-label="Mi cuenta">
                <IconUser size={26} />
              </Link>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="relative p-1"
                aria-label={`Carrito, ${itemCount} productos`}
              >
                <IconBag size={26} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 text-[11px] leading-none">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ---------- fila 2: nav desktop ---------- */}
          <nav className="hidden md:flex justify-center gap-10 pb-6 -mt-2">
            {NAV.map((n) => (
              <div key={n.href} className="group relative">
                <Link href={n.href} className="text-[14px] py-2 inline-block hover:opacity-70">
                  {n.label}
                </Link>
                {n.label === "Productos" && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full hidden group-hover:block bg-white shadow-[0_0_5px_var(--fg-10)] min-w-[220px] py-2 z-50">
                    <Link href="/productos" className="block px-5 py-2 text-[13px] hover:bg-[var(--fg-05)]">
                      Ver todos los productos
                    </Link>
                    {categories.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/${c.slug}`}
                        className="block px-5 py-2 text-[13px] hover:bg-[var(--fg-05)]"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </header>

      {/* ---------- drawer hamburguesa (mobile) ---------- */}
      {menu && (
        <div className="fixed inset-0 z-[10000] md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => { setMenu(false); setSubmenu(false); }}
          />
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-[360px] bg-white flex flex-col animate-[slideIn_.3s_ease]">
            <button
              type="button"
              onClick={() => { setMenu(false); setSubmenu(false); }}
              className="absolute -right-12 top-4 text-white"
              aria-label="Cerrar menú"
            >
              <IconTimes size={26} />
            </button>

            {submenu ? (
              <>
                <div className="flex items-center gap-3 px-5 h-[64px] bg-[var(--fg-03)] border-b border-[var(--fg-10)]">
                  <button type="button" onClick={() => setSubmenu(false)} aria-label="Volver">
                    <IconChevronLeft size={22} />
                  </button>
                  <span className="flex-1 text-center pr-6 text-[16px]">Productos</span>
                </div>
                <nav className="flex-1 overflow-auto py-3">
                  <Link href="/productos" onClick={() => setMenu(false)} className="block px-5 py-3 text-[15px]">
                    Ver todos los productos
                  </Link>
                  {categories.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/${c.slug}`}
                      onClick={() => setMenu(false)}
                      className="block px-5 py-3 text-[15px]"
                    >
                      {c.name}
                    </Link>
                  ))}
                </nav>
              </>
            ) : (
              <nav className="flex-1 overflow-auto py-3">
                <button
                  type="button"
                  onClick={() => setSubmenu(true)}
                  className="w-full flex items-center justify-between px-5 py-3 text-[15px]"
                >
                  Productos <IconArrowRight size={20} />
                </button>
                <Link href="/contacto" onClick={() => setMenu(false)} className="block px-5 py-3 text-[15px]">
                  Contacto
                </Link>
                <Link href="/" onClick={() => setMenu(false)} className="block px-5 py-3 text-[15px]">
                  Inicio
                </Link>
              </nav>
            )}

            <div className="border-t border-[var(--fg-10)] px-5 py-4 flex items-center gap-3 text-[13px]">
              <IconUser size={20} />
              <Link href="/cuenta" onClick={() => setMenu(false)} className="underline">Iniciar sesión</Link>
              <span>·</span>
              <Link href="/cuenta/registro" onClick={() => setMenu(false)} className="underline">Crear cuenta</Link>
            </div>
          </div>
        </div>
      )}

      {/* ---------- modal de búsqueda (mobile) ---------- */}
      {search && (
        <div className="fixed inset-0 z-[10000] bg-white md:hidden flex flex-col">
          <div className="flex items-center justify-end p-4">
            <button type="button" onClick={() => setSearch(false)} aria-label="Cerrar búsqueda">
              <IconTimes size={26} />
            </button>
          </div>
          <form onSubmit={submit} className="px-6">
            <p className="font-heading text-[20px] mb-4">¿Qué estás buscando?</p>
            <div className="flex items-center border-b border-[var(--fg-20)] py-2">
              <input
                autoFocus
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Buscar"
                className="flex-1 outline-none text-[16px]"
              />
              <button type="submit" aria-label="Buscar"><IconSearch size={22} /></button>
            </div>
          </form>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideIn { from { transform: translateX(-100%) } to { transform: translateX(0) } }
      `}</style>
    </>
  );
}
