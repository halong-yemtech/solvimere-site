import { BookMarked, Factory, File, House, Info, Library, Lightbulb, Package, Settings2, Users } from "lucide-react";
import { SITE_URL } from "../portfolio/api";

/** Each editable page: its icon, where it lives on the public site, and what it holds. */
const PAGES = {
  home: { icon: House, path: "/", about: "Hero, services, reviews, insights and contact" },
  about: { icon: Info, path: "/about", about: "Story, mission and values" },
  products: { icon: Package, path: "/products", about: "Product lines and features" },
  solutions: { icon: Lightbulb, path: "/solutions", about: "Services and how we deliver" },
  industries: { icon: Factory, path: "/industries", about: "Sectors we work in" },
  "case-studies": { icon: BookMarked, path: "/case-studies", about: "Client stories and results" },
  resources: { icon: Library, path: "/resources", about: "Guides, articles and downloads" },
  team: { icon: Users, path: "/team", about: "Team page copy (people are edited in Team)" },
  settings: { icon: Settings2, path: null, about: "Header, footer, contact details and the assistant" },
};

export function pageInfo(slug) {
  return PAGES[slug] || { icon: File, path: `/${slug}`, about: "" };
}

/** The page's address on the public site, or null for settings-only pages. */
export function siteUrlFor(slug) {
  const { path } = pageInfo(slug);
  return path && SITE_URL ? `${SITE_URL}${path}` : null;
}
