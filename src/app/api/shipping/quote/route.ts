import { NextResponse } from "next/server";
import { z } from "zod";
import { quoteShipping } from "@/lib/shipping";

export const runtime = "nodejs";

const Body = z.object({
  zip: z.string().regex(/^\d{4}$/, "El código postal debe tener 4 dígitos"),
  items: z
    .array(
      z.object({
        productSlug: z.string(),
        size: z.string(),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1),
  subtotal: z.number().int().min(0).optional(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }
  const { zip, items, subtotal } = parsed.data;
  try {
    const options = await quoteShipping(zip, items, subtotal ?? 0);
    return NextResponse.json({ options });
  } catch (e) {
    console.error("[api/shipping] ", e);
    return NextResponse.json({ error: "No pudimos cotizar el envío" }, { status: 502 });
  }
}
