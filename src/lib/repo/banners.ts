import { all } from "@/lib/db";
import type { Banner } from "@/lib/types";

export function listBanners(): Banner[] {
  return all<Banner>(`SELECT * FROM banners ORDER BY position, id`);
}
