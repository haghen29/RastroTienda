import { NextResponse } from "next/server";
import { z } from "zod";
import { saveMessage } from "@/lib/repo/products";
import { sendContactMessage } from "@/lib/mail";

export const runtime = "nodejs";

const Body = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(40).default(""),
  body: z.string().min(5).max(4000),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Revisá los datos del formulario" }, { status: 400 });
  }
  saveMessage(parsed.data);
  await sendContactMessage(parsed.data);
  return NextResponse.json({ ok: true });
}
