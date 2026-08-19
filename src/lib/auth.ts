import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE = "rastro_admin";

function secret() {
  return process.env.ADMIN_SECRET ?? process.env.ADMIN_PASSWORD ?? "cambiame";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

export function makeToken() {
  const payload = String(Date.now());
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string | undefined) {
  if (!token) return false;
  const [payload, mac] = token.split(".");
  if (!payload || !mac) return false;
  const expected = sign(payload);
  if (expected.length !== mac.length) return false;
  if (!timingSafeEqual(Buffer.from(expected), Buffer.from(mac))) return false;
  // 7 días de validez
  return Date.now() - Number(payload) < 7 * 24 * 60 * 60 * 1000;
}

export async function isAdmin() {
  const jar = await cookies();
  return verifyToken(jar.get(COOKIE)?.value);
}

export async function login(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return { ok: false, error: "Falta configurar ADMIN_PASSWORD en el .env" };
  if (password !== expected) return { ok: false, error: "Contraseña incorrecta" };
  const jar = await cookies();
  jar.set(COOKIE, makeToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
  return { ok: true };
}

export async function logout() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
