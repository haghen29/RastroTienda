import type { ShippingOption } from "@/lib/types";

/**
 * Tarifario propio de respaldo. Se usa cuando no hay credenciales de
 * Andreani cargadas, o cuando su API falla. Los valores replican el orden
 * de magnitud que cotiza hoy la tienda (CP 1884: domicilio ~$9.914,80,
 * retiro ~$6.178,20) y se pueden ajustar sin tocar código desde .env.
 */

interface Zone {
  id: string;
  name: string;
  /** rangos de CP numéricos [desde, hasta] */
  ranges: [number, number][];
  home: number;   // centavos, hasta 1 kg
  pickup: number; // centavos, hasta 1 kg
  etaDays: [number, number];
}

const ZONES: Zone[] = [
  {
    id: "caba",
    name: "CABA",
    ranges: [[1000, 1499]],
    home: 890_000,
    pickup: 560_000,
    etaDays: [1, 3],
  },
  {
    id: "gba",
    name: "Gran Buenos Aires",
    ranges: [[1600, 1900], [1901, 1999], [1500, 1599]],
    home: 991_480,
    pickup: 617_820,
    etaDays: [2, 4],
  },
  {
    id: "bsas",
    name: "Provincia de Buenos Aires",
    ranges: [[2000, 2999], [6000, 6999], [7000, 8999]],
    home: 1_150_000,
    pickup: 720_000,
    etaDays: [3, 6],
  },
  {
    id: "interior",
    name: "Interior del país",
    ranges: [[3000, 5999], [9000, 9999]],
    home: 1_390_000,
    pickup: 860_000,
    etaDays: [4, 8],
  },
];

const DEFAULT_ZONE = ZONES[3];

/** Recargo por cada 500 g por encima del primer kilo. */
const EXTRA_PER_HALF_KG = 120_000;

export function zoneForZip(zip: string): Zone {
  const n = Number(zip);
  if (!Number.isFinite(n)) return DEFAULT_ZONE;
  for (const z of ZONES) {
    if (z.ranges.some(([lo, hi]) => n >= lo && n <= hi)) return z;
  }
  return DEFAULT_ZONE;
}

function surcharge(weightGr: number) {
  const over = Math.max(0, weightGr - 1000);
  return Math.ceil(over / 500) * EXTRA_PER_HALF_KG;
}

export function formatEta(minDays: number, maxDays: number, from = new Date()) {
  // "jueves 20/08" — mismo formato que usa la tienda actual
  const fmt = (d: Date) => {
    const weekday = new Intl.DateTimeFormat("es-AR", { weekday: "long" }).format(d);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${weekday} ${day}/${month}`;
  };
  const a = new Date(from);
  a.setDate(a.getDate() + minDays);
  const b = new Date(from);
  b.setDate(b.getDate() + maxDays);
  return { from: fmt(a), to: fmt(b) };
}

export function tableQuote(zip: string, weightGr: number): ShippingOption[] {
  const z = zoneForZip(zip);
  const extra = surcharge(weightGr);
  const { from, to } = formatEta(z.etaDays[0], z.etaDays[1]);
  return [
    {
      id: "andreani-domicilio",
      kind: "domicilio",
      label: "Envío a domicilio",
      carrier: "Andreani",
      cost: z.home + extra,
      eta: `Llega entre el ${from} y el ${to}`,
    },
    {
      id: "andreani-sucursal",
      kind: "retiro",
      label: "Punto de retiro",
      carrier: "Andreani",
      cost: z.pickup + extra,
      eta: `Retiras entre el ${from} y el ${to}`,
    },
  ];
}
