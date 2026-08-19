import Image from "next/image";

/** Logo de Rastro Perfumería. */
export function Logo({ width = 250, className = "" }: { width?: number; className?: string }) {
  const height = Math.round((width * 230) / 575);
  return (
    <Image
      src="/images/logo.png"
      alt="Rastro Perfumería"
      width={575}
      height={230}
      style={{ width, height }}
      className={className}
      priority
    />
  );
}
