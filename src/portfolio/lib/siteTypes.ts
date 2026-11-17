import type { ProfileLink } from "./profileLinks";
import type { FontKey, SectionKey } from "./settingsDefaults";

// Plain, serializable shapes the site renders. Built on the server from the
// CMS (lib/site.ts) and handed to client components through <SiteProvider>.

export interface SiteImage {
  url: string;
  alt: string;
}

export interface SocialLinkData {
  id: number;
  label: string;
  url: string;
  icon: string;
  color: string;
  info: string;
}

export interface ServiceData {
  id: number;
  title: string;
  icon: string;
  description: string;
}

export interface PricingPlanData {
  id: number;
  name: string;
  icon: string;
  price: number;
  period: string;
  orderUrl: string | null;
  features: { id: string; feature: string; included: boolean }[];
}

export interface ClientData {
  id: number;
  name: string;
  url: string;
  icon: string | null;
  logo: SiteImage | null;
}

export interface TestimonialData {
  id: number | string;
  quote: string;
  name: string;
  role: string;
  photo: SiteImage | null;
}

export interface FactData {
  id: number;
  icon: string;
  description: string;
}

export interface StatisticData {
  id: number;
  title: string;
  value: string;
  link: string | null;
}

export interface ResumeEntryData {
  id: number;
  type: "experience" | "education";
  period: string;
  title: string;
  subtitle: string;
  location: string;
  description: string;
}

export interface WorkData {
  id: number;
  title: string;
  images: SiteImage[];
  categories: string[];
  description: string;
  client: string;
  owner: string;
  date: string | null;
  projectUrl: string | null;
  githubUrl: string | null;
  techStack: string[];
  highlights: string[];
}

export interface PercentSkill {
  id: string;
  name: string;
  percent: number;
}

export interface SkillsData {
  coding: PercentSkill[];
  knowledge: string[];
  development: PercentSkill[];
  languages: { id: string; name: string; level: number }[];
}

export interface ProfileData {
  id: number;
  slug: string;
  /** This is the profile selected in Site settings (shown at "/"). */
  isActive: boolean;
  visibility: "public" | "private";
  name: string;
  jobTitle: string;
  typingTitles: string[];
  avatar: SiteImage | null;
  backgroundImages: SiteImage[];
  /** What “Download CV” opens: the generated PDF (/cv…) or the uploaded file. */
  cvUrl: string | null;
  /** CV overrides from the profile's CV tab (empty = derived from the profile). */
  cv: { mode: "generated" | "uploaded"; headline: string; location: string; summary: string; skills: string };
  hireLink: { label: string; url: string; icon: string } | null;
  copyright: string;
  bio: string;
  age: string;
  residence: string;
  status: string;
  address: string;
  email: string;
  phone: string;
  phoneLink: string | null;
  mapEmbedUrl: string | null;
  quote: TestimonialData | null;
  blog: { intro: string; buttonLabel: string; buttonUrl: string | null };
  metaDescription: string;
}

export interface SiteSettingsData {
  /** Visible sections, in menu order. */
  sections: { key: SectionKey; label: string }[];
  theme: { accent: string; font: FontKey };
  maintenance: { enabled: boolean; message: string };
}

export type BlogPlatform = "upwork" | "github" | "linkedin" | "other";

export interface BlogPostData {
  id: number;
  platform: BlogPlatform;
  title: string;
  headline: string;
  location: string;
  badges: string[];
  stats: { value: string; label: string }[];
  githubUsername: string | null;
  image: SiteImage | null;
  imageCaption: string;
  body: string;
  tags: string[];
  url: string | null;
  buttonLabel: string;
}

export interface SiteData {
  settings: SiteSettingsData;
  profile: ProfileData;
  /** All of the profile's links & accounts (the single source of every external link). */
  links: ProfileLink[];
  /** The accounts shown as icons (subset of `links`); `id` is the index in `links`. */
  socialLinks: SocialLinkData[];
  services: ServiceData[];
  pricingPlans: PricingPlanData[];
  clients: ClientData[];
  testimonials: TestimonialData[];
  facts: FactData[];
  statistics: StatisticData[];
  resume: ResumeEntryData[];
  skills: SkillsData;
  workCategories: string[];
  works: WorkData[];
  blogPosts: BlogPostData[];
}

export interface GuestbookComment {
  id: number;
  name: string;
  comment: string;
  createdAt: string;
}
