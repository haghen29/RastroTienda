import type { ShippingOption } from "@/lib/types";
import { formatEta } from "./table";

/**
 * Adaptador de la API de Andreani (B2B "Cotización de envíos").
 * Se activa solo si están cargadas las credenciales en .env:
 *
 *   ANDREANI_USER, ANDREANI_PASSWORD, ANDREANI_CLIENTE,
 *   ANDREANI_CONTRATO_DOMICILIO, ANDREANI_CONTRATO_SUCURSAL,
 *   ANDREANI_CP_ORIGEN, ANDREANI_BASE_URL (opcional)
 *
 * Si algo falla, el llamador cae automáticamente al tarifario propio.
 */

const BASE = process.env.ANDREANI_BASE_URL ?? "https://apis.andreani.com";

let tokenCache: { token: string; exp: number } | null = null;

export function andreaniConfigured() {
  return Boolean(
    process.env.ANDREANI_USER &&
      process.env.ANDREANI_PASSWORD &&
      process.env.ANDREANI_CLIENTE &&
      process.env.ANDREANI_CP_ORIGEN,
  );
}

async function getToken(): Promise<string> {
  if (tokenCache && tokenCache.exp > Date.now()) return tokenCache.token;
  const basic = Buffer.from(
    `${process.env.ANDREANI_USER}:${process.env.ANDREANI_PASSWORD}`,
  ).toString("base64");
  const res = await fetch(`${BASE}/login`, {
    headers: { Authorization: `Basic ${basic}` },
  });
  if (!res.ok) throw new Error(`Andreani login ${res.status}`);
  const token = res.headers.get("x-authorization-token") ?? "";
  if (!token) throw new Error("Andreani no devolvió token");
  tokenCache = { token, exp: Date.now() + 50 * 60 * 1000 };
  return token;
}

async function quoteOne(
  contrato: string,
  zip: string,
  weightGr: number,
  volumeCm3: number,
): Promise<number> {
  const token = await getToken();
  const params = new URLSearchParams({
    cpDestino: zip,
    contrato,
    cliente: process.env.ANDREANI_CLIENTE!,
    "bultos[0][valorDeclarado]": "1000",
    "bultos[0][volumen]": String(volumeCm3),
    "bultos[0][kilos]": (weightGr / 1000).toFixed(3),
  });
  const res = await fetch(`${BASE}/v1/tarifas?${params}`, {
    headers: { "x-authorization-token": token },
  });
  if (!res.ok) throw new Error(`Andreani tarifas ${res.status}`);
  const data = (await res.json()) as {
    tarifaConIva?: { total?: string | number };
    tarifaSinIva?: { total?: string | number };
  };
  const total = Number(data.tarifaConIva?.total ?? data.tarifaSinIva?.total ?? 0);
  if (!Number.isFinite(total) || total <= 0) throw new Error("Andreani sin tarifa");
  return Math.round(total * 100); // a centavos
}

export async function andreaniQuote(
  zip: string,
  weightGr: number,
): Promise<ShippingOption[]> {
  const volume = Math.max(1000, weightGr * 3); // cm³ estimados
  const out: ShippingOption[] = [];
  const { from, to } = formatEta(2, 4);

  const domicilio = process.env.ANDREANI_CONTRATO_DOMICILIO;
  const sucursal = process.env.ANDREANI_CONTRATO_SUCURSAL;

  if (domicilio) {
    out.push({
      id: "andreani-domicilio",
      kind: "domicilio",
      label: "Envío a domicilio",
      carrier: "Andreani",
      cost: await quoteOne(domicilio, zip, weightGr, volume),
      eta: `Llega entre el ${from} y el ${to}`,
    });
  }
  if (sucursal) {
    out.push({
      id: "andreani-sucursal",
      kind: "retiro",
      label: "Punto de retiro",
      carrier: "Andreani",
      cost: await quoteOne(sucursal, zip, weightGr, volume),
      eta: `Retiras entre el ${from} y el ${to}`,
    });
  }
  if (!out.length) throw new Error("Andreani sin contratos configurados");
  return out;
}
