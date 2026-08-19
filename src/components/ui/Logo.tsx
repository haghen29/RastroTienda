/** Logo de Rastro Perfumería reconstruido en SVG (nítido en cualquier tamaño). */
export function Logo({ width = 250, className = "" }: { width?: number; className?: string }) {
  const height = Math.round((width * 100) / 250);
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 250 100"
      className={className}
      role="img"
      aria-label="Rastro Perfumería"
    >
      <circle cx="125" cy="14" r="2.6" fill="#8a7355" />
      <path
        d="M125 21c-8 6-11 12-8 17s10 7 11 12c1 5-4 8-9 8"
        fill="none"
        stroke="#8a7355"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <text
        x="125"
        y="76"
        textAnchor="middle"
        fill="#8a7355"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="27"
        letterSpacing="6.5"
      >
        RASTRO
      </text>
      <text
        x="125"
        y="90"
        textAnchor="middle"
        fill="#a8967d"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="8"
        letterSpacing="4.5"
      >
        PERFUMERÍA
      </text>
    </svg>
  );
}
