import Link from "next/link";
import Image from "next/image";

export interface Banner {
  href: string;
  title: string;
  kicker?: string;
  image?: string;
  tone: "dark" | "light";
}

/**
 * Sección de banners ("Accesibles Y Premium"). A diferencia de la tienda
 * actual —donde los banners son imágenes de 218×102 px que se ven borrosas—
 * acá el texto es texto real y la foto es sólo el fondo, así queda nítido
 * en cualquier pantalla.
 */
export function BannerGrid({ title, banners }: { title: string; banners: Banner[] }) {
  return (
    <section className="py-10">
      <div className="container-rastro">
        <h2 className="text-center font-heading text-[20px] mb-8">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-[760px] mx-auto">
          {banners.map((b) => (
            <Link
              key={b.href}
              href={b.href}
              className="relative h-[150px] md:h-[130px] overflow-hidden group block"
            >
              <div
                className={`absolute inset-0 ${b.tone === "dark" ? "bg-[#171310]" : "bg-[#e9e4da]"}`}
              />
              {b.image && (
                <Image
                  src={b.image}
                  alt=""
                  fill
                  sizes="(max-width: 767px) 100vw, 380px"
                  className={`object-cover transition-transform duration-700 group-hover:scale-105 ${
                    b.tone === "dark" ? "opacity-45" : "opacity-70"
                  }`}
                />
              )}
              <div className="absolute inset-0 grid place-items-center text-center px-6">
                <span>
                  {b.kicker && (
                    <span
                      className={`block font-heading text-[10px] tracking-[0.35em] mb-2 ${
                        b.tone === "dark" ? "text-[#d8c9ad]" : "text-[#8a7355]"
                      }`}
                    >
                      {b.kicker}
                    </span>
                  )}
                  <span
                    className={`block font-heading text-[22px] md:text-[24px] tracking-[0.12em] ${
                      b.tone === "dark" ? "text-[#f1e6d0]" : "text-[#6b563c]"
                    }`}
                  >
                    {b.title}
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
