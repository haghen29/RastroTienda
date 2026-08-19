import { get, run } from "@/lib/db";

export const CHECKOUT_NOTE_KEY = "checkout_note";

export function getSetting(key: string, fallback = ""): string {
  const row = get<{ value: string }>(`SELECT value FROM settings WHERE key = ?`, key);
  return row?.value ?? fallback;
}

export function setSetting(key: string, value: string) {
  run(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    key, value,
  );
}
