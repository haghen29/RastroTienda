import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { logoutAction } from "./actions";

export const metadata = { title: "Administrador — Rastro Perfumería" };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAdmin();
  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {authed && (
        <header className="bg-white border-b border-[var(--fg-10)]">
          <div className="max-w-[1100px] mx-auto px-6 h-14 flex items-center gap-6">
            <span className="font-heading text-[16px]">Administrador</span>
            <nav className="flex gap-5 text-[13px] flex-1">
              <Link href="/admin" className="hover:underline">Pedidos</Link>
              <Link href="/admin/productos" className="hover:underline">Productos</Link>
              <Link href="/admin/secciones" className="hover:underline">Secciones</Link>
              <Link href="/" className="hover:underline">Ver tienda ↗</Link>
            </nav>
            <form action={logoutAction}>
              <button type="submit" className="text-[13px] underline">Salir</button>
            </form>
          </div>
        </header>
      )}
      <div className="max-w-[1100px] mx-auto px-6 py-8">{children}</div>
    </div>
  );
}
