import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { store } from "@/lib/config";

export const metadata: Metadata = {
  title: `Tienda Online de ${store.name}`,
  description:
    "Comprá productos de Rastro Perfumeria por internet. Tenemos decants arabes, decants de diseñador y más.",
  openGraph: {
    siteName: store.name,
    type: "website",
    title: `Tienda Online de ${store.name}`,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        {/* Tipografías del sistema de diseño. Si preferís self-hosting,
            reemplazá esto por next/font/local con los .woff2 en /public/fonts. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&family=Piazzolla:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
