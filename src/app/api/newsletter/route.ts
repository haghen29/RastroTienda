import { NextResponse } from "next/server";
import { z } from "zod";
import { saveNewsletter } from "@/lib/repo/products";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const parsed = z
    .object({ email: z.string().email() })
    .safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  saveNewsletter(parsed.data.email);
  return NextResponse.json({ ok: true });
}
