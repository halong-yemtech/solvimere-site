// A profile's links & accounts are the ONE place external links are stored.
// Everything else (hire button, pricing "order", stats cards, blog posts, the
// blog button…) refers to an account by its platform key and is resolved here.
// No server-only imports: used by the CMS config, the site, the migration and tests.

import type { IconName } from "./iconNames";

export const PLATFORMS = [
  { key: "upwork", label: "Upwork", icon: "SiUpwork", color: "#14a800", hosts: ["upwork.com"] },
  { key: "github", label: "GitHub", icon: "FaGithub", color: "#ffffff", hosts: ["github.com"] },
  { key: "linkedin", label: "LinkedIn", icon: "FaLinkedin", color: "#0A66C2", hosts: ["linkedin.com"] },
  { key: "whatsapp", label: "WhatsApp", icon: "FaWhatsapp", color: "#25D366", hosts: ["wa.me", "whatsapp.com"] },
  { key: "fiverr", label: "Fiverr", icon: "SiFiverr", color: "#1DBF73", hosts: ["fiverr.com"] },
  { key: "x", label: "X / Twitter", icon: "FaTwitter", color: "#ffffff", hosts: ["x.com", "twitter.com"] },
  { key: "facebook", label: "Facebook", icon: "FaFacebook", color: "#1877F2", hosts: ["facebook.com", "fb.com"] },
  { key: "instagram", label: "Instagram", icon: "FaInstagram", color: "#E4405F", hosts: ["instagram.com"] },
  { key: "youtube", label: "YouTube", icon: "FaYoutube", color: "#FF0000", hosts: ["youtube.com", "youtu.be"] },
  { key: "telegram", label: "Telegram", icon: "FaTelegram", color: "#26A5E4", hosts: ["t.me", "telegram.me"] },
  { key: "medium", label: "Medium", icon: "FaMedium", color: "#ffffff", hosts: ["medium.com"] },
  {
    key: "stackoverflow",
    label: "Stack Overflow",
    icon: "FaStackOverflow",
    color: "#F58025",
    hosts: ["stackoverflow.com"],
  },
  { key: "devto", label: "DEV", icon: "FaDev", color: "#ffffff", hosts: ["dev.to"] },
  { key: "website", label: "Website", icon: "FaGlobe", color: "#ffffff", hosts: [] },
  { key: "other", label: "Other", icon: "FaLink", color: "#ffffff", hosts: [] },
] as const satisfies readonly { key: string; label: string; icon: IconName; color: string; hosts: readonly string[] }[];

export type PlatformKey = (typeof PLATFORMS)[number]["key"];
export const PLATFORM_KEYS = PLATFORMS.map((p) => p.key) as PlatformKey[];
/** Platforms that can be referenced by key (each at most once per profile). */
export const REFERENCEABLE = PLATFORM_KEYS.filter((k) => k !== "other");

export const platformOf = (key: string | null | undefined) =>
  PLATFORMS.find((p) => p.key === key) ?? PLATFORMS[PLATFORMS.length - 1];

/** Special values of an account reference besides a platform key. */
export const CUSTOM = "custom";
export const NONE = "none";

export interface ProfileLink {
  platform: PlatformKey;
  label: string;
  url: string;
  icon: string;
  showInIcons: boolean;
  color: string;
  info: string;
}

/** Best guess of the platform behind a URL (and, as a hint, a react-icons name). */
export function guessPlatform(url: string | null | undefined, icon?: string | null): PlatformKey {
  const byIcon = icon ? PLATFORMS.find((p) => p.key !== "other" && p.key !== "website" && p.icon === icon) : undefined;
  let host = "";
  try {
    host = new URL(String(url ?? "")).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    /* not a URL */
  }
  const byHost = host ? PLATFORMS.find((p) => p.hosts.some((h) => host === h || host.endsWith(`.${h}`))) : undefined;
  if (byHost) return byHost.key;
  if (byIcon) return byIcon.key;
  return /^https?:\/\//.test(String(url ?? "")) ? "website" : "other";
}

/** Same address, ignoring protocol, "www.", case, trailing slashes and invisible characters. */
export function sameUrl(a: string | null | undefined, b: string | null | undefined) {
  const norm = (u: string | null | undefined) =>
    String(u ?? "")
      .replace(/[​-‏‪-‮⁦-⁩﻿]/g, "")
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/+$/, "");
  return norm(a) !== "" && norm(a) === norm(b);
}

export function accountFor(links: ProfileLink[], key: string | null | undefined): ProfileLink | null {
  if (!key || key === CUSTOM || key === NONE) return null;
  return links.find((l) => l.platform === key && l.url) ?? null;
}

export interface LinkRef {
  account?: string | null;
  customUrl?: string | null;
}

/** URL of a reference: a profile account, a custom URL, or nothing. */
export function resolveLink(links: ProfileLink[], ref: LinkRef | null | undefined): string | null {
  if (!ref?.account || ref.account === NONE) return null;
  if (ref.account === CUSTOM) return ref.customUrl?.trim() || null;
  return accountFor(links, ref.account)?.url ?? null;
}

/** Normalize the raw `links` array of a profile document. */
export function toProfileLinks(raw: unknown): ProfileLink[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((r: Record<string, unknown>) => {
      const p = platformOf(String(r.platform ?? "other"));
      return {
        platform: p.key,
        label: String(r.label || p.label),
        url: String(r.url ?? ""),
        icon: String(r.icon || p.icon),
        showInIcons: r.showInIcons !== false,
        color: String(r.color || p.color),
        info: String(r.info ?? ""),
      };
    })
    .filter((l) => l.url);
}

/** Problems with a links array: duplicate platforms (except "other"). */
export function duplicatePlatforms(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const dups = new Set<string>();
  for (const r of raw as { platform?: string }[]) {
    const k = r?.platform;
    if (!k || k === "other") continue;
    if (seen.has(k)) dups.add(platformOf(k).label);
    seen.add(k);
  }
  return [...dups];
}

/** Select options for "which account does this point to?" fields. */
export const accountOptions = (opts: { custom?: boolean; none?: boolean } = {}) => [
  ...(opts.none ? [{ label: "No link", value: NONE }] : []),
  ...REFERENCEABLE.map((k) => ({ label: `${platformOf(k).label} account`, value: k })),
  ...(opts.custom ? [{ label: "Custom URL…", value: CUSTOM }] : []),
];
