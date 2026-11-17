// Loads a portfolio from Supabase (public.portfolio_*) and turns it into the plain
// SiteData the components render. Visitors only ever see public profiles (RLS).
import { supabase as client } from "../../lib/supabase";
import { portfolioSlug } from "../../lib/slug";
import type { BlogPostData, SiteData, SiteImage, TestimonialData } from "./siteTypes";
import { accountFor, resolveLink, toProfileLinks } from "./profileLinks";
import { DEFAULT_ACCENT, DEFAULT_FONT, DEFAULT_SECTIONS, type FontKey, type SectionKey } from "./settingsDefaults";

/* eslint-disable @typescript-eslint/no-explicit-any -- documents are free-form JSON */
type Doc = Record<string, any> & { id: number };
type Media = { id: number; url: string; alt: string; mime_type: string };

const str = (v: unknown) => (typeof v === "string" ? v : "");

/** URL of a profile's generated CV page in this app. */
export const cvPath = (slug: string) => `/team/${slug}/cv`;

/** Media ids a document refers to (single uploads and lists of uploads). */
function mediaIds(doc: Doc, fields: string[]): number[] {
  return fields.flatMap((f) => {
    const v = f.includes(".") ? f.split(".").reduce<any>((o, k) => o?.[k], doc) : doc[f];
    return (Array.isArray(v) ? v : [v]).filter((x): x is number => Number.isInteger(x));
  });
}

const MEDIA_FIELDS: Record<string, string[]> = {
  profile: ["avatar", "backgroundImages", "cv", "quote.image"],
  clients: ["logo"],
  testimonials: ["photo"],
  works: ["images"],
  "blog-posts": ["image"],
};

/**
 * Everything a portfolio page shows, or null when the profile doesn't exist or isn't public.
 * `slug` may be "halong" or the older "ha-long" form.
 */
export async function getSiteData(slug: string): Promise<SiteData | null> {
  const supabase = client;
  if (!supabase) return null;
  const wanted = portfolioSlug(slug);
  if (!wanted) return null;

  const [{ data: profileRow }, { data: settingsRow }] = await Promise.all([
    supabase.from("portfolio_profiles").select("id, slug, visibility, data").eq("slug", wanted).maybeSingle(),
    supabase.from("portfolio_settings").select("data").eq("id", 1).maybeSingle(),
  ]);
  if (!profileRow) return null;

  const { data: itemRows } = await supabase
    .from("portfolio_items")
    .select("id, kind, data")
    .eq("profile_id", profileRow.id)
    .order("sort_order", { ascending: true });

  const profile: Doc = {
    ...profileRow.data,
    id: profileRow.id,
    slug: profileRow.slug,
    visibility: profileRow.visibility,
  };
  const byKind = new Map<string, Doc[]>();
  for (const row of itemRows ?? []) {
    if (!byKind.has(row.kind)) byKind.set(row.kind, []);
    byKind.get(row.kind)!.push({ ...row.data, id: row.id });
  }
  const list = (kind: string) => byKind.get(kind) ?? [];

  // Resolve every referenced image in one request.
  const ids = new Set<number>(mediaIds(profile, MEDIA_FIELDS.profile));
  for (const [kind, fields] of Object.entries(MEDIA_FIELDS)) {
    if (kind !== "profile") list(kind).forEach((d) => mediaIds(d, fields).forEach((id) => ids.add(id)));
  }
  const media = new Map<number, Media>();
  if (ids.size) {
    const { data } = await supabase
      .from("portfolio_media")
      .select("id, url, alt, mime_type")
      .in("id", [...ids]);
    (data ?? []).forEach((m: Media) => media.set(m.id, m));
  }
  const image = (v: unknown): SiteImage | null => {
    const m = Number.isInteger(v) ? media.get(v as number) : null;
    return m ? { url: m.url, alt: m.alt || "" } : null;
  };
  const images = (v: unknown): SiteImage[] =>
    (Array.isArray(v) ? v : []).map(image).filter((i): i is SiteImage => i !== null);
  const categoryName = new Map(list("work-categories").map((c) => [c.id, str(c.name)]));

  const settings = settingsRow?.data ?? {};
  const links = toProfileLinks(profile.links);
  const avatar = image(profile.avatar);

  const quote: TestimonialData | null = profile.quote?.text
    ? {
        id: "quote",
        quote: profile.quote.text,
        name: profile.quote.author || profile.name,
        role: profile.quote.role || profile.jobTitle,
        photo: image(profile.quote.image) ?? avatar,
      }
    : null;

  const sections = (settings.sections?.length ? settings.sections : DEFAULT_SECTIONS)
    .filter((sec: { visible?: boolean }) => sec.visible !== false)
    .map((sec: { key: string; label?: string }) => ({ key: sec.key as SectionKey, label: sec.label || sec.key }));

  const uploadedCv = profile.cvSettings?.mode === "uploaded" ? image(profile.cv) : null;

  return {
    settings: {
      sections,
      theme: {
        accent: settings.theme?.accent || DEFAULT_ACCENT,
        font: (settings.theme?.font as FontKey) || DEFAULT_FONT,
      },
      maintenance: {
        enabled: Boolean(settings.maintenance?.enabled),
        message: str(settings.maintenance?.message),
      },
    },
    profile: {
      id: profile.id,
      slug: profile.slug,
      isActive: false,
      visibility: profile.visibility === "private" ? "private" : "public",
      name: str(profile.name),
      jobTitle: str(profile.jobTitle),
      typingTitles: (profile.typingTitles ?? []).map((t: { title: string }) => t.title),
      avatar,
      backgroundImages: images(profile.backgroundImages),
      cvUrl: uploadedCv ? uploadedCv.url : cvPath(profile.slug),
      cv: {
        mode: profile.cvSettings?.mode === "uploaded" ? "uploaded" : "generated",
        headline: str(profile.cvSettings?.headline),
        location: str(profile.cvSettings?.location),
        summary: str(profile.cvSettings?.summary),
        skills: str(profile.cvSettings?.skills),
      },
      hireLink: (() => {
        const account = accountFor(links, profile.hireLink?.account);
        return account
          ? { label: profile.hireLink?.label || account.label, url: account.url, icon: account.icon }
          : null;
      })(),
      copyright: str(profile.copyright),
      bio: str(profile.bio),
      age: str(profile.age),
      residence: str(profile.residence),
      status: str(profile.status),
      address: str(profile.address),
      email: str(profile.email),
      phone: str(profile.phone),
      phoneLink:
        accountFor(links, "whatsapp")?.url ??
        (profile.phone ? `tel:${String(profile.phone).replace(/[^\d+]/g, "")}` : null),
      // The map pins the address (stored once); a custom embed URL only overrides it.
      mapEmbedUrl:
        profile.mapEmbedUrl ||
        (profile.address
          ? `https://maps.google.com/maps?q=${encodeURIComponent(profile.address)}&z=12&output=embed`
          : null),
      quote,
      blog: {
        intro: str(profile.blog?.intro),
        buttonLabel: profile.blog?.buttonLabel || "view profile",
        buttonUrl: resolveLink(links, { account: profile.blog?.account }),
      },
      metaDescription: str(profile.metaDescription),
    },
    links,
    socialLinks: links
      .map((l, i) => ({
        id: i,
        label: l.label,
        url: l.url,
        icon: l.icon,
        color: l.color,
        info: l.info,
        show: l.showInIcons,
      }))
      .filter((l) => l.show)
      .map(({ show: _s, ...l }) => l),
    services: list("services").map((d) => ({ id: d.id, title: d.title, icon: d.icon, description: d.description })),
    pricingPlans: list("pricing-plans").map((d) => ({
      id: d.id,
      name: d.name,
      icon: d.icon,
      price: d.price,
      period: str(d.period),
      orderUrl: resolveLink(links, d.orderLink),
      features: (d.features ?? []).map((f: Doc, i: number) => ({
        id: f.id ?? String(i),
        feature: f.feature,
        included: Boolean(f.included),
      })),
    })),
    clients: list("clients").map((d) => ({
      id: d.id,
      name: d.name,
      url: d.url,
      icon: d.icon ?? null,
      logo: image(d.logo),
    })),
    testimonials: list("testimonials").map((d) => ({
      id: d.id,
      quote: d.quote,
      name: d.name,
      role: str(d.role),
      photo: image(d.photo) ?? avatar,
    })),
    facts: list("facts").map((d) => ({ id: d.id, icon: d.icon, description: d.description })),
    statistics: list("statistics").map((d) => ({
      id: d.id,
      title: d.title,
      value: d.value,
      link: resolveLink(links, d.link),
    })),
    blogPosts: list("blog-posts").map((d) => ({
      id: d.id,
      platform: (["upwork", "github", "linkedin"].includes(d.platform ?? "")
        ? d.platform
        : "other") as BlogPostData["platform"],
      title: d.title,
      headline: str(d.headline),
      location: str(profile.address),
      badges: (d.badges ?? []).map((b: { label: string }) => b.label).filter(Boolean),
      stats: (d.stats ?? []).map((x: { value: string; label: string }) => ({ value: x.value, label: x.label })),
      githubUsername: d.githubUsername || null,
      image: image(d.image),
      imageCaption: str(d.imageCaption),
      body: str(d.body),
      tags: (d.tags ?? []).map((t: { tag: string }) => t.tag).filter(Boolean),
      url: accountFor(links, d.platform)?.url ?? null,
      buttonLabel: d.buttonLabel || "Visit profile",
    })),
    resume: list("resume-entries").map((d) => ({
      id: d.id,
      type: d.type,
      period: d.period,
      title: d.title,
      subtitle: str(d.subtitle),
      location: str(d.location),
      description: str(d.description),
    })),
    skills: {
      coding: (profile.coding ?? []).map((s: Doc, i: number) => ({
        id: s.id ?? String(i),
        name: s.name,
        percent: s.percent,
      })),
      knowledge: (profile.knowledge ?? []).map((k: { item: string }) => k.item),
      development: (profile.development ?? []).map((s: Doc, i: number) => ({
        id: s.id ?? String(i),
        name: s.name,
        percent: s.percent,
      })),
      languages: (profile.languages ?? []).map((l: Doc, i: number) => ({
        id: l.id ?? String(i),
        name: l.name,
        level: l.level,
      })),
    },
    workCategories: list("work-categories").map((d) => str(d.name)),
    works: list("works").map((d) => ({
      id: d.id,
      title: d.title,
      images: images(d.images),
      categories: (d.categories ?? [])
        .map((c: number) => categoryName.get(c))
        .filter((c: string | undefined): c is string => Boolean(c)),
      description: str(d.description),
      client: str(d.client),
      owner: str(d.owner),
      date: d.date || null,
      projectUrl: d.projectUrl || null,
      githubUrl: d.githubUrl || null,
      techStack: (d.techStack ?? []).map((t: { name: string }) => t.name),
      highlights: (d.highlights ?? []).map((h: { item: string }) => h.item),
    })),
  };
}
