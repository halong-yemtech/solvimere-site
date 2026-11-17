import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getPayloadClient, getSiteData } from "./site";
import { isAdminUser } from "@/cms/access";

/**
 * The logged-in CMS user for this request (from Payload's `payload-token`
 * cookie, shared with /admin), or null for visitors.
 */
export const getCurrentUser = cache(async () => {
  const payload = await getPayloadClient();
  try {
    const { user } = await payload.auth({ headers: await headers() });
    return user ?? null;
  } catch {
    return null;
  }
});

/** The current user if they are an administrator, otherwise null. */
export const getAdminUser = cache(async () => {
  const user = await getCurrentUser();
  return isAdminUser(user) ? user : null;
});

/**
 * Admins see the latest drafts and get the editing UI; everyone else (visitors
 * and non-admin accounts) sees published content only.
 */
export const getPageData = cache(async (profileSlug?: string) => {
  const admin = await getAdminUser();
  return { admin, site: await getSiteData(Boolean(admin), profileSlug) };
});

/** For admin-only pages: the admin user, or a redirect (login, or home for non-admins). */
export async function requireAdmin() {
  const admin = await getAdminUser();
  if (admin) return admin;
  if (await getCurrentUser()) return redirect("/");
  // Set by proxy.ts for /dashboard routes.
  const from = (await headers()).get("x-pathname");
  const back = from && from.startsWith("/dashboard") ? from : "/dashboard";
  return redirect(`/login?redirect=${encodeURIComponent(back)}`);
}
