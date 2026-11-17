/**
 * Creates a portfolio profile for every Solvimere team member who doesn't have one yet,
 * using an existing, complete profile (default: Ali Abbas) as the template.
 *
 *   bun run seed:team                       (from portfolio/)
 *   TEMPLATE_SLUG=aliabbas bun run seed:team
 *
 * Team data is read from the site's Supabase `team_members` table (public data, anon key).
 * The URL and key come from SUPABASE_URL / SUPABASE_ANON_KEY, or from ../.env
 * (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).
 *
 * What is taken from the template: its structure and conventions (CV generated from the
 * profile, copyright line, hire/blog button labels). Nothing personal to the template's
 * owner is copied — no work history, contact details, links, CV file, works, testimonials
 * or blog posts — because that would describe the wrong person.
 *
 * Each new profile is a PRIVATE DRAFT: admins preview and complete it in the dashboard,
 * then publish it. Re-running skips members who already have a profile.
 */
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { getPayload } from "payload";
import config from "../payload.config";
import { compactSlug } from "../lib/basePath";

type TeamMember = {
  name: string;
  role: string;
  email: string;
  avatar_url: string;
  bio: string;
  highlight_label: string;
  highlight_text: string;
  expertise_label: string;
  expertise_text: string;
  quote: string;
};

const here = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(here, "../..");

function siteEnv(): Record<string, string> {
  const file = path.join(siteRoot, ".env");
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(file, "utf8")
      .split("\n")
      .map((line) => line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/))
      .filter((m): m is RegExpMatchArray => Boolean(m))
      .map((m) => [m[1], m[2].replace(/^["']|["']$/g, "")]),
  );
}

async function loadTeam(): Promise<TeamMember[]> {
  const env = siteEnv();
  const url = process.env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Set SUPABASE_URL and SUPABASE_ANON_KEY (or VITE_* in ../.env).");
  const res = await fetch(
    `${url}/rest/v1/team_members?select=name,role,email,avatar_url,bio,highlight_label,highlight_text,expertise_label,expertise_text,quote&order=sort_order`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } },
  );
  if (!res.ok) throw new Error(`Supabase team_members: ${res.status} ${await res.text()}`);
  return res.json();
}

/** "React, Next.js, and full-stack architecture." → ["React", "Next.js", "Full-stack architecture"] */
function splitList(text: string): string[] {
  return text
    .replace(/\.\s*$/, "")
    .split(/,\s*(?:and\s+)?|\s+and\s+/i)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1));
}

function composeBio(m: TeamMember): string {
  if (m.bio.trim()) return m.bio.trim();
  const parts = [`**${m.name}** is ${/^[aeiou]/i.test(m.role) ? "an" : "a"} **${m.role}** at Solvimere.`];
  if (m.highlight_text.trim()) parts.push(`**${m.highlight_label || "Highlights"}**\n\n${m.highlight_text.trim()}`);
  if (m.expertise_text.trim()) parts.push(`**${m.expertise_label || "Expertise"}**\n\n${m.expertise_text.trim()}`);
  return parts.join("\n\n");
}

function metaDescription(m: TeamMember): string {
  const text = `${m.name}, ${m.role} at Solvimere. ${m.expertise_text.trim()}`.replace(/\s+/g, " ");
  return text.length > 160 ? `${text.slice(0, 157).trimEnd()}…` : text;
}

/** The member's photo as a local file: site public/ for relative paths, downloaded otherwise. */
async function avatarFile(avatarUrl: string, slug: string): Promise<string | null> {
  if (!avatarUrl) return null;
  const clean = avatarUrl.split("?")[0];
  if (clean.startsWith("/")) {
    const file = path.join(siteRoot, "public", clean);
    return fs.existsSync(file) ? file : null;
  }
  const res = await fetch(avatarUrl);
  if (!res.ok) return null;
  const ext = path.extname(new URL(clean).pathname) || ".jpg";
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "team-avatar-")), `${slug}-avatar${ext}`);
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  return file;
}

const payload = await getPayload({ config });
const templateSlug = process.env.TEMPLATE_SLUG || "aliabbas";

const profiles = await payload.find({ collection: "profiles", draft: true, depth: 0, limit: 500, pagination: false });
const existing = new Set(profiles.docs.map((p) => compactSlug(p.slug)));
const template = profiles.docs.find((p) => compactSlug(p.slug) === compactSlug(templateSlug));
if (!template) throw new Error(`Template profile "${templateSlug}" not found.`);
payload.logger.info(`Template: ${template.name} (/${template.slug})`);

const year = new Date().getFullYear();
const created: string[] = [];
const skipped: string[] = [];

for (const m of await loadTeam()) {
  const slug = compactSlug(m.name);
  if (!slug || existing.has(slug)) {
    skipped.push(`${m.name} (profile exists)`);
    continue;
  }

  const file = await avatarFile(m.avatar_url, slug);
  if (!file) {
    skipped.push(`${m.name} (no usable photo; a profile needs an avatar)`);
    continue;
  }
  const avatar = await payload.create({ collection: "media", data: { alt: m.name }, filePath: file });

  const expertise = splitList(m.expertise_text);
  const doc = await payload.create({
    collection: "profiles",
    draft: true,
    data: {
      _status: "draft",
      internalName: m.name,
      slug,
      visibility: "private",
      name: m.name,
      jobTitle: m.role,
      typingTitles: [{ title: m.role }],
      avatar: avatar.id,
      bio: composeBio(m),
      email: m.email || undefined,
      copyright: `${m.name}'s portfolio © ${year}.`,
      quote: { text: m.quote || undefined, author: m.name, role: m.role },
      knowledge: expertise.map((item) => ({ item })),
      metaDescription: metaDescription(m),
      // Same conventions as the template; the accounts behind these buttons are added per person.
      hireLink: { label: template.hireLink?.label ?? undefined },
      blog: { buttonLabel: template.blog?.buttonLabel ?? undefined },
      cvSettings: { mode: "generated", headline: m.role },
    },
  });
  existing.add(slug);
  created.push(`${m.name} → /team/${doc.slug} (private draft, id ${doc.id})`);
}

payload.logger.info(`Created ${created.length}:\n  ${created.join("\n  ") || "-"}`);
payload.logger.info(`Skipped ${skipped.length}:\n  ${skipped.join("\n  ") || "-"}`);
process.exit(0);
