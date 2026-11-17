import type { SiteData } from "@/lib/siteTypes";

export interface CvEntry {
  /** Bold, left (company / school). */
  org: string;
  /** Italic, left (role / degree). */
  role: string;
  /** Bold, right. */
  period: string;
  /** Italic, right. */
  location: string;
  bullets: string[];
}

export interface CvData {
  name: string;
  headline: string;
  contact: string[];
  email: string;
  summary: string;
  experience: CvEntry[];
  education: CvEntry[];
  skills: string[];
}

// Invisible direction marks (e.g. "‪+1 (541)…‬" pasted from phones), zero-width chars.
const INVISIBLE = /[​-‏‪-‮⁠-⁯﻿]/g;
// Emoji and pictographs (plus their variation selectors / joiners).
const EMOJI = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{FE0E}\u{FE0F}\u{20E3}]/gu;

/** Plain, printable text: no emoji, invisible marks or doubled spaces. */
export function cleanText(s: string | null | undefined): string {
  return (s ?? "").replace(INVISIBLE, "").replace(EMOJI, "").replace(/[ \t]+/g, " ").trim();
}

/** Markdown → plain text (keeps link text, drops emphasis, headings, list markers). */
export function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, "")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/`([^`]+)`/g, "$1");
}

/** One bullet per non-empty line; leading "-", "*", "•" markers are removed. */
export function toBullets(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => cleanText(l.replace(/^\s*(?:[-*+•▪◦–]|\d+[.)])\s*/, "")))
    .filter(Boolean);
}

const splitList = (s: string) =>
  s.split(/[,;\n]/).map((x) => cleanText(x)).filter(Boolean);

const unique = (xs: string[]) => {
  const seen = new Set<string>();
  return xs.filter((x) => {
    const k = x.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

/**
 * Everything the CV PDF shows, derived from one profile's site data.
 * Values from the profile's CV tab override the derived defaults.
 */
export function buildCvData(site: SiteData): CvData {
  const p = site.profile;
  const cv = p.cv;

  const summary =
    cleanText(cv.summary) ||
    cleanText(
      stripMarkdown(p.bio)
        .split(/\n\s*\n/)
        .map((para) => para.replace(/\s*\n\s*/g, " "))
        .join(" ")
    );

  const skills = cv.skills.trim()
    ? splitList(cv.skills)
    : unique([
        ...site.skills.coding.map((s) => s.name),
        ...site.skills.development.map((s) => s.name),
        ...site.skills.knowledge,
      ].map(cleanText).filter(Boolean));

  const entry = (r: SiteData["resume"][number]): CvEntry =>
    r.type === "experience"
      ? { org: cleanText(r.subtitle), role: cleanText(r.title), period: cleanText(r.period), location: cleanText(r.location), bullets: toBullets(r.description) }
      : { org: cleanText(r.title), role: cleanText(r.subtitle), period: cleanText(r.period), location: cleanText(r.location), bullets: toBullets(r.description) };

  const location = cleanText(cv.location) || cleanText(p.address) || cleanText(p.residence);
  const phone = cleanText(p.phone);
  const email = cleanText(p.email);

  return {
    name: cleanText(p.name),
    headline: cleanText(cv.headline) || cleanText(p.jobTitle),
    contact: [location, phone].filter(Boolean),
    email,
    summary,
    experience: site.resume.filter((r) => r.type === "experience").map(entry),
    education: site.resume.filter((r) => r.type === "education").map(entry),
    skills,
  };
}

/** "Anthony Scott" → "Anthony Scott - CV.pdf" (safe for Content-Disposition). */
export function cvFileName(name: string) {
  return `${cleanText(name).replace(/[\\/:*?"<>|]+/g, "") || "CV"} - CV.pdf`;
}
