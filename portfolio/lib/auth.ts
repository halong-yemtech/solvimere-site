import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getPayloadClient, getSiteData } from "./site";
import { isAdminUser } from "@/cms/access";
import { bridge } from "./adminBridge";
import { verifyPreviewToken } from "./preview";

/**
 * The staff member behind this request: set by the admin bridge (/team/api/admin,
 * Supabase sign-in on the Solvimere admin panel), else Payload's own session cookie.
 * Null for visitors.
 */
export const getCurrentUser = cache(async () => {
  const bridged = bridge.getStore();
  if (bridged) return bridged;
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
 * Visitors see published content only. A valid preview token (issued to staff by the
 * admin panel) shows that profile's latest drafts.
 */
export const getPageData = cache(async (profileSlug?: string, previewToken?: string) => {
  const admin = await getAdminUser();
  const preview = verifyPreviewToken(previewToken, profileSlug);
  return { admin, preview, site: await getSiteData(Boolean(admin) || preview, profileSlug) };
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
