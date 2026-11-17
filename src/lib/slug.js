/**
 * URL segment of a team member's portfolio: "Ha Long" → "halong" (/team/halong).
 * Same rule as the portfolio app's profile slugs (portfolio/lib/basePath.ts → compactSlug).
 * Shared by the site and the admin.
 */
export function portfolioSlug(name) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 60);
}
