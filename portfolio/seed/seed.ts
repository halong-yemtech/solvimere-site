/**
 * Loads the starter content (seed/profile.ts, seed/works.ts, seed/assets/*)
 * into the CMS database.
 *
 *   bun run seed              # only runs on an empty database
 *   SEED_FORCE=1 bun run seed # wipes site content + media first, then re-seeds
 *
 * Admin users and inbox messages are never touched. Create your admin user by
 * opening /setup (or /login) after seeding.
 */
import path from "path";
import { fileURLToPath } from "url";
import { getPayload, type CollectionSlug } from "payload";
import config from "../payload.config";
import {
  bio,
  clients,
  facts,
  prices,
  profile,
  quoteData,
  resumeEducation,
  resumeExperience,
  services,
  skills,
  socialMedia,
  statistics,
  testimonials,
  upworkProfileUrl,
} from "./profile";
import { workDetails, works, workTabs } from "./works";
import type { IconName } from "@/lib/iconNames";
import { guessPlatform } from "@/lib/profileLinks";

const assetsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "assets");

const CONTENT_COLLECTIONS: CollectionSlug[] = [
  "profiles",
  "works",
  "work-categories",
  "services",
  "pricing-plans",
  "clients",
  "testimonials",
  "facts",
  "statistics",
  "resume-entries",
  "media",
];

const payload = await getPayload({ config });

const existing = await payload.count({ collection: "profiles" });
if (existing.totalDocs > 0 && !process.env.SEED_FORCE) {
  payload.logger.info(
    "The database already has content — nothing to do. Run with SEED_FORCE=1 to wipe site content and re-seed.",
  );
  process.exit(0);
}

if (process.env.SEED_FORCE) {
  for (const collection of CONTENT_COLLECTIONS) {
    await payload.delete({ collection, where: { id: { exists: true } } });
  }
  payload.logger.info("Cleared existing site content and media.");
}

// ── Media ─────────────────────────────────────────────────────
// Seed data refers to files by their old public URL (e.g. "/images/avatar.jpg");
// they now live under seed/assets with the same relative path.
const mediaIds = new Map<string, number>();

async function media(publicUrl: string, alt: string): Promise<number> {
  const cached = mediaIds.get(publicUrl);
  if (cached) return cached;
  const doc = await payload.create({
    collection: "media",
    data: { alt },
    filePath: path.join(assetsDir, publicUrl),
  });
  mediaIds.set(publicUrl, doc.id);
  return doc.id;
}

const avatar = await media(profile.avatar, profile.name);
const backgrounds = await Promise.all(
  ["/images/b-1.jpg", "/images/b-2.jpg", "/images/b-3.jpg"].map((u, i) => media(u, `Background ${i + 1}`)),
);
const cv = await media(profile.cv, `${profile.name} — CV`);

// ── Profile (identity + skills) ──────────────────────────────
const mainProfile = await payload.create({
  collection: "profiles",
  data: {
    internalName: "Main profile",
    slug: "main",
    visibility: "public",
    _status: "published",
    name: profile.name,
    jobTitle: profile.title,
    typingTitles: profile.typingTitles.map((title) => ({ title })),
    avatar,
    backgroundImages: backgrounds,
    cv,
    // Every external link is stored once, here; buttons etc. point to these accounts.
    links: [
      ...socialMedia.map((s) => ({
        platform: guessPlatform(s.mediaUrl, s.icon),
        url: s.mediaUrl,
        label: s.label,
        info: s.info,
        color: s.logoColor.hex,
        showInIcons: true,
      })),
      ...(socialMedia.some((s) => guessPlatform(s.mediaUrl, s.icon) === "upwork")
        ? []
        : [{ platform: "upwork" as const, url: upworkProfileUrl, showInIcons: false }]),
    ],
    hireLink: { account: "upwork", label: "my upwork" },
    copyright: profile.copyright,
    bio,
    age: profile.age,
    residence: profile.residence,
    status: profile.status,
    hourlyRate: profile.hourlyRate,
    address: profile.address,
    email: profile.email,
    phone: profile.phone,
    quote: {
      text: quoteData.quote,
      author: quoteData.userName,
      role: quoteData.userProfession,
    },
    blog: {
      intro:
        "Technical articles and write-ups are available on my Upwork profile. Connect with me to discuss backend architecture, Go microservices, and cloud infrastructure projects.",
      buttonLabel: "view upwork profile",
      account: "upwork",
    },
    metaDescription:
      "Senior GoLang Developer and Backend Architect with 10+ years of experience delivering robust, scalable, cloud-native solutions.",
    coding: skills.coding.map((s) => ({ name: s.field, percent: Number(s.value) })),
    knowledge: skills.knowledge.map((item) => ({ item })),
    development: skills.development.map((s) => ({ name: s.field, percent: Number(s.value) })),
    languages: skills.languages.map((s) => ({ name: s.field, level: Number(s.value) })),
  },
});

await payload.updateGlobal({ slug: "site-settings", data: { activeProfile: mainProfile.id, _status: "published" } });

// ── Collections (created in display order) ────────────────────
// Every list item belongs to the profile.
const profile_ = mainProfile.id;

for (const s of services) {
  await payload.create({
    collection: "services",
    data: { title: s.title, icon: s.icon as IconName, description: s.description, profile: profile_ },
  });
}

const planIcons: IconName[] = ["DiCodeigniter", "GiCondorEmblem"];
for (const [i, p] of prices.entries()) {
  await payload.create({
    collection: "pricing-plans",
    data: {
      name: p.packageName,
      icon: planIcons[i % planIcons.length],
      price: p.packagePrice,
      period: p.priceType,
      orderLink:
        guessPlatform(p.freelanceUrl) === "upwork"
          ? { account: "upwork" }
          : { account: "custom", customUrl: p.freelanceUrl },
      profile: profile_,
      features: p.packageServices.map((f) => ({ feature: f.packageService, included: f.isIncluded })),
    },
  });
}

// Clients are real companies; the platform links above are accounts, not clients.
for (const c of clients.filter((c) => guessPlatform(c.link) === "website")) {
  await payload.create({
    collection: "clients",
    data: {
      name: new URL(c.link).hostname.replace(/^www\./, ""),
      url: c.link,
      icon: c.icon as IconName,
      profile: profile_,
    },
  });
}

for (const t of testimonials) {
  await payload.create({
    collection: "testimonials",
    data: { quote: t.quote, name: t.userName, role: t.userProfession, photo: avatar, profile: profile_ },
  });
}

for (const f of facts) {
  await payload.create({
    collection: "facts",
    data: { icon: f.icon as IconName, description: f.description, profile: profile_ },
  });
}

for (const s of statistics) {
  await payload.create({
    collection: "statistics",
    data: {
      title: s.title,
      value: s.info,
      link:
        "externalLink" in s && s.externalLink
          ? guessPlatform(s.externalLink) === "upwork"
            ? { account: "upwork" }
            : { account: "custom", customUrl: s.externalLink }
          : { account: "none" },
      profile: profile_,
    },
  });
}

for (const r of [...resumeExperience, ...resumeEducation]) {
  await payload.create({
    collection: "resume-entries",
    data: {
      type: r.isExperience ? "experience" : "education",
      period: r.badge,
      title: r.title,
      subtitle: r.subTitle,
      description: r.description,
      profile: profile_,
    },
  });
}

const categoryIds = new Map<string, number>();
for (const name of workTabs.filter((t) => t !== "All")) {
  const doc = await payload.create({ collection: "work-categories", data: { name, profile: profile_ } });
  categoryIds.set(name, doc.id);
}

for (const w of works) {
  const d = workDetails[w.id as keyof typeof workDetails];
  const images: number[] = [];
  for (const [i, img] of d.images.entries()) {
    images.push(await media(img.url, `${d.title} — screenshot ${i + 1}`));
  }
  await payload.create({
    collection: "works",
    data: {
      title: d.title,
      images,
      categories: w.workTabs.map((t) => categoryIds.get(t.tab)).filter((id): id is number => id !== undefined),
      description: d.description,
      client: d.clientName,
      owner: d.ownerName,
      date: d.date.toISOString(),
      projectUrl: d.workUrl,
      githubUrl: d.githubUrl,
      techStack: d.techStack.map((name) => ({ name })),
      highlights: d.userActions.map((item) => ({ item })),
      profile: profile_,
    },
  });
}

payload.logger.info(
  `Seed complete: ${mediaIds.size} media files, ${works.length} works. Open /setup to create your admin account (or /login if you have one).`,
);
process.exit(0);
