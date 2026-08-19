import { NextResponse } from "next/server";
import { z } from "zod";
import { getCoupon } from "@/lib/repo/orders";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const parsed = z
    .object({ code: z.string().min(2), subtotal: z.number().int().min(0) })
    .safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Código inválido" }, { status: 400 });

  const c = getCoupon(parsed.data.code);
  if (!c) return NextResponse.json({ error: "El cupón no existe o venció" }, { status: 404 });
  if (parsed.data.subtotal < c.min_total) {
    return NextResponse.json({ error: "No llegás al mínimo para este cupón" }, { status: 400 });
  }

  const discount =
    c.kind === "percent"
      ? Math.round((parsed.data.subtotal * c.value) / 100)
      : c.kind === "amount"
        ? Math.min(c.value, parsed.data.subtotal)
        : 0;

  return NextResponse.json({
    code: c.code,
    kind: c.kind,
    discount,
    freeShipping: c.kind === "free_shipping",
  });
}
