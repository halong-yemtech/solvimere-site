import { cache } from "react";
import { getPayload, type Payload } from "payload";
import config from "@payload-config";
import type { Media, Profile } from "@/payload-types";
import type { BlogPostData, SiteData, SiteImage, TestimonialData } from "./siteTypes";
import { accountFor, resolveLink, toProfileLinks } from "./profileLinks";
import { DEFAULT_ACCENT, DEFAULT_FONT, DEFAULT_SECTIONS, type FontKey, type SectionKey } from "./settingsDefaults";
import { compactSlug, withBase } from "@/lib/basePath";

export const getPayloadClient = () => getPayload({ config });

function image(value: number | Media | null | undefined): SiteImage | null {
  if (!value || typeof value !== "object" || !value.url) return null;
  return { url: value.url, alt: value.alt || "" };
}

function images(values: (number | Media)[] | null | undefined): SiteImage[] {
  return (values ?? []).map(image).filter((i): i is SiteImage => i !== null);
}

const str = (v: string | null | undefined) => v ?? "";

type ProfileDoc = Profile;

/**
 * Pick the profile to render.
 * - `slug` given: that profile (visitors: only if published and public).
 * - otherwise: Site settings → Active profile, falling back to the first profile.
 * The active profile is always shown at "/" even when private.
 */
async function resolveProfile(
  payload: Payload,
  draft: boolean,
  activeId: number | null,
  slug?: string,
): Promise<ProfileDoc | null> {
  if (slug) {
    const { docs } = await payload.find({
      collection: "profiles",
      where: draft
        ? { slug: { equals: slug } }
        : {
            and: [
              { slug: { equals: slug } },
              { _status: { equals: "published" } },
              { visibility: { equals: "public" } },
            ],
          },
      depth: 1,
      limit: 1,
      draft,
    });
    if (docs[0]) return docs[0];
    // Links from the team page use the name without separators ("halong"),
    // so also match slugs that differ only by hyphens ("ha-long").
    const wanted = compactSlug(slug);
    if (!wanted) return null;
    const { docs: all } = await payload.find({
      collection: "profiles",
      where: draft ? undefined : { and: [{ _status: { equals: "published" } }, { visibility: { equals: "public" } }] },
      depth: 0,
      limit: 500,
      draft,
      select: { slug: true },
    });
    const match = all.find((doc) => compactSlug(doc.slug) === wanted);
    if (!match) return null;
    return payload
      .findByID({ collection: "profiles", id: match.id, depth: 1, draft, disableErrors: true })
      .catch(() => null);
  }
  if (activeId) {
    const doc = await payload
      .findByID({ collection: "profiles", id: activeId, depth: 1, draft, disableErrors: true })
      .catch(() => null);
    if (doc && (draft || doc._status !== "draft")) return doc;
  }
  const { docs } = await payload.find({
    collection: "profiles",
    sort: "_order",
    depth: 1,
    limit: 1,
    draft,
    where: draft ? undefined : { _status: { equals: "published" } },
  });
  return docs[0] ?? null;
}

const idOf = (v: unknown) => (v && typeof v === "object" ? (v as { id: number }).id : (v as number));

/**
 * Everything the public site renders, read from the CMS in one go.
 * Returns null when no profile exists (fresh database) or `profileSlug` isn't available.
 *
 * `draft: true` (admins only) returns the latest saved drafts; otherwise only
 * published content is returned.
 */
export const getSiteData = cache(async (draft: boolean = false, profileSlug?: string): Promise<SiteData | null> => {
  const payload = await getPayloadClient();
  const published = draft ? undefined : { _status: { equals: "published" as const } };

  const settings = await payload.findGlobal({ slug: "site-settings", depth: 0, draft });
  const profile = await resolveProfile(payload, draft, (idOf(settings.activeProfile) as number) ?? null, profileSlug);
  if (!profile?.name) return null;
  // Each list item belongs to exactly one profile.
  const mine = { profile: { equals: profile.id } };
  const where = published ? { and: [published, mine] } : mine;
  // The ONE place external links are stored; everything else is resolved from it.
  const links = toProfileLinks(profile.links);

  const list = async <S extends Parameters<typeof payload.find>[0]["collection"]>(collection: S) => {
    const res = await payload.find({
      collection,
      sort: "_order",
      limit: 500,
      depth: 1,
      pagination: false,
      draft,
      where,
    });
    return { docs: res.docs };
  };

  const [services, pricingPlans, clients, testimonials, facts, statistics, resume, workCategories, works, blogPosts] =
    await Promise.all([
      list("services"),
      list("pricing-plans"),
      list("clients"),
      list("testimonials"),
      list("facts"),
      list("statistics"),
      list("resume-entries"),
      list("work-categories"),
      list("works"),
      list("blog-posts"),
    ]);
  const skills = profile;

  // Is this the profile shown at "/"? (Active profile, or the first one when none is set.)
  const activeId = (idOf(settings.activeProfile) as number) || null;
  const isActive = activeId
    ? activeId === profile.id
    : (await payload.find({ collection: "profiles", sort: "_order", limit: 1, depth: 0, draft })).docs[0]?.id ===
      profile.id;

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
    .filter((sec) => sec.visible !== false)
    .map((sec) => ({ key: sec.key as SectionKey, label: sec.label || sec.key }));

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
      isActive,
      visibility: profile.visibility === "private" ? "private" : "public",
      name: profile.name,
      jobTitle: profile.jobTitle,
      typingTitles: (profile.typingTitles ?? []).map((t) => t.title),
      avatar,
      backgroundImages: images(profile.backgroundImages),
      cvUrl:
        profile.cvSettings?.mode === "uploaded" && image(profile.cv)
          ? image(profile.cv)!.url
          : withBase(`/cv/${profile.slug}`),
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
      bio: profile.bio,
      age: str(profile.age),
      residence: str(profile.residence),
      status: str(profile.status),
      address: str(profile.address),
      email: str(profile.email),
      phone: str(profile.phone),
      phoneLink:
        accountFor(links, "whatsapp")?.url ?? (profile.phone ? `tel:${profile.phone.replace(/[^\d+]/g, "")}` : null),
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
    services: services.docs.map((d) => ({
      id: d.id,
      title: d.title,
      icon: d.icon,
      description: d.description,
    })),
    pricingPlans: pricingPlans.docs.map((d) => ({
      id: d.id,
      name: d.name,
      icon: d.icon,
      price: d.price,
      period: str(d.period),
      orderUrl: resolveLink(links, d.orderLink),
      features: (d.features ?? []).map((f, i) => ({
        id: f.id ?? String(i),
        feature: f.feature,
        included: Boolean(f.included),
      })),
    })),
    clients: clients.docs.map((d) => ({
      id: d.id,
      name: d.name,
      url: d.url,
      icon: d.icon ?? null,
      logo: image(d.logo),
    })),
    testimonials: testimonials.docs.map((d) => ({
      id: d.id,
      quote: d.quote,
      name: d.name,
      role: str(d.role),
      photo: image(d.photo) ?? avatar,
    })),
    facts: facts.docs.map((d) => ({ id: d.id, icon: d.icon, description: d.description })),
    statistics: statistics.docs.map((d) => ({
      id: d.id,
      title: d.title,
      value: d.value,
      link: resolveLink(links, d.link),
    })),
    blogPosts: blogPosts.docs.map((d) => ({
      id: d.id,
      platform: (["upwork", "github", "linkedin"].includes(d.platform ?? "")
        ? d.platform
        : "other") as BlogPostData["platform"],
      title: d.title,
      headline: str(d.headline),
      location: str(profile.address),
      badges: (d.badges ?? []).map((b) => b.label).filter(Boolean),
      stats: (d.stats ?? []).map((x) => ({ value: x.value, label: x.label })),
      githubUsername: d.githubUsername || null,
      image: image(d.image),
      imageCaption: str(d.imageCaption),
      body: d.body,
      tags: (d.tags ?? []).map((t) => t.tag).filter(Boolean),
      url: accountFor(links, d.platform)?.url ?? null,
      buttonLabel: d.buttonLabel || "Visit profile",
    })),
    resume: resume.docs.map((d) => ({
      id: d.id,
      type: d.type,
      period: d.period,
      title: d.title,
      subtitle: str(d.subtitle),
      location: str(d.location),
      description: str(d.description),
    })),
    skills: {
      coding: (skills.coding ?? []).map((s, i) => ({
        id: s.id ?? String(i),
        name: s.name,
        percent: s.percent,
      })),
      knowledge: (skills.knowledge ?? []).map((k) => k.item),
      development: (skills.development ?? []).map((s, i) => ({
        id: s.id ?? String(i),
        name: s.name,
        percent: s.percent,
      })),
      languages: (skills.languages ?? []).map((l, i) => ({
        id: l.id ?? String(i),
        name: l.name,
        level: l.level,
      })),
    },
    workCategories: workCategories.docs.map((d) => d.name),
    works: works.docs.map((d) => ({
      id: d.id,
      title: d.title,
      images: images(d.images),
      categories: (d.categories ?? [])
        .map((c) => (typeof c === "object" ? c.name : null))
        .filter((c): c is string => Boolean(c)),
      description: d.description,
      client: str(d.client),
      owner: str(d.owner),
      date: d.date || null,
      projectUrl: d.projectUrl || null,
      githubUrl: d.githubUrl || null,
      techStack: (d.techStack ?? []).map((t) => t.name),
      highlights: (d.highlights ?? []).map((h) => h.item),
    })),
  };
});
