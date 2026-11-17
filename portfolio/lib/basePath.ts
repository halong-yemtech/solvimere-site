/**
 * The portfolio is served under the Solvimere site's /team path (next.config.ts → basePath).
 *
 * next/link, router.push, redirect() and revalidatePath() add the base path themselves.
 * Plain <a href>, <iframe src>, fetch() and window.location do not: wrap those paths
 * with `withBase`.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** "/dashboard" → "/team/dashboard". Absolute URLs and already-prefixed paths are returned unchanged. */
export function withBase(path: string): string {
  if (!BASE_PATH || !path.startsWith("/") || path.startsWith("//")) return path;
  if (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`) || path.startsWith(`${BASE_PATH}?`)) return path;
  return `${BASE_PATH}${path}`;
}

/**
 * The URL segment for a profile, shared with the Solvimere team page:
 * "Ha Long" → "halong", "ali-abbas" → "aliabbas". Lowercase letters and digits only.
 */
export function compactSlug(value: string): string {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 60);
}

/** Path (without the base path) of a profile's public page: "/halong". */
export const profilePath = (slug: string) => `/${compactSlug(slug)}`;

/** Segments used by the portfolio's own pages; a profile can't take these as its slug. */
export const RESERVED_SLUGS = new Set([
  "api",
  "cv",
  "dashboard",
  "login",
  "setup",
  "forgotpassword",
  "resetpassword",
  "admin",
  "p",
  "images",
  "media",
]);
