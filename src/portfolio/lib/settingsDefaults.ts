// Shared between the CMS schema (server) and the site (client) - keep it dependency-free.

export const SECTION_KEYS = ["about", "resume", "works", "blog", "stats", "contact", "guestbook"] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

export const DEFAULT_SECTIONS: { key: SectionKey; label: string; visible: boolean }[] = [
  { key: "about", label: "about", visible: true },
  { key: "resume", label: "resume", visible: true },
  { key: "works", label: "works", visible: true },
  { key: "blog", label: "blog", visible: true },
  { key: "stats", label: "stats", visible: true },
  { key: "contact", label: "contact", visible: true },
  { key: "guestbook", label: "guest book", visible: true },
];

export const DEFAULT_ACCENT = "#f59e0b";

export const FONT_OPTIONS = [
  { value: "poppins", label: "Poppins", css: '"Poppins"' },
  { value: "rubik", label: "Rubik", css: '"Rubik"' },
  { value: "geist", label: "Geist", css: '"Geist"' },
  { value: "inter", label: "Inter", css: '"Inter"' },
] as const;
export const DEFAULT_FONT: FontKey = "poppins";
export type FontKey = (typeof FONT_OPTIONS)[number]["value"];

/** "#f59e0b" -> "245 158 11" (space-separated, for rgb(var(--accent) / α)). */
export function hexToRgbChannels(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  const n = parseInt(m ? m[1] : DEFAULT_ACCENT.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}
