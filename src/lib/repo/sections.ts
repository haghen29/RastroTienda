import { all, get } from "@/lib/db";
import type { Section } from "@/lib/types";

interface SectionRow {
  id: number;
  title: string;
  kicker: string;
  text: string;
  cta_label: string;
  cta_href: string;
  image: string;
  position: number;
}

function hydrate(r: SectionRow): Section {
  return {
    id: r.id,
    title: r.title,
    kicker: r.kicker,
    text: r.text,
    ctaLabel: r.cta_label,
    ctaHref: r.cta_href,
    image: r.image,
    position: r.position,
  };
}

export function listSections(): Section[] {
  return all<SectionRow>(`SELECT * FROM sections ORDER BY position, id`).map(hydrate);
}

export function getSection(id: number): Section | undefined {
  const row = get<SectionRow>(`SELECT * FROM sections WHERE id = ?`, id);
  return row ? hydrate(row) : undefined;
}
