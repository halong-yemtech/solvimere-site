import "server-only";
import { AsyncLocalStorage } from "node:async_hooks";
import type { TypedUser } from "payload";

/**
 * The Solvimere admin panel (admin/, a separate app) manages the portfolio through
 * /team/api/admin. Staff sign in there with Supabase; each request carries their
 * Supabase access token. After checking it, the request runs inside `bridge.run(user)`,
 * and getCurrentUser() (lib/auth.ts) returns that user, so every existing editing
 * operation works unchanged, with Payload doing validation, drafts and versions.
 */
export const bridge = new AsyncLocalStorage<TypedUser>();

const SUPABASE_URL = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";

export const bridgeConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export interface Staff {
  id: string;
  email: string;
  name: string;
  role: "admin" | "editor";
}

// Short cache so a burst of admin requests doesn't re-verify the same token.
const cache = new Map<string, { staff: Staff | null; until: number }>();

/** The staff member behind a Supabase access token, or null (invalid, expired, not staff). */
export async function verifyStaff(token: string): Promise<Staff | null> {
  if (!bridgeConfigured || !token) return null;
  const hit = cache.get(token);
  if (hit && hit.until > Date.now()) return hit.staff;

  const headers = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` };
  let staff: Staff | null = null;
  try {
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers, cache: "no-store" });
    if (userRes.ok) {
      const user = (await userRes.json()) as { id?: string; email?: string };
      // RLS lets a signed-in user read their own profile row (role lives there).
      const profRes = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(String(user.id))}&select=role,full_name,email`,
        { headers, cache: "no-store" },
      );
      const [profile] = profRes.ok
        ? ((await profRes.json()) as { role?: string; full_name?: string; email?: string }[])
        : [];
      if (user.id && (profile?.role === "admin" || profile?.role === "editor")) {
        staff = {
          id: user.id,
          email: String(profile.email || user.email || ""),
          name: String(profile.full_name || ""),
          role: profile.role,
        };
      }
    }
  } catch {
    staff = null;
  }
  cache.set(token, { staff, until: Date.now() + 60_000 });
  if (cache.size > 500) cache.delete(cache.keys().next().value as string);
  return staff;
}

/** A Payload user object for a staff member: admin rights for the editing operations. */
export function payloadUserFor(staff: Staff): TypedUser {
  return {
    id: 0,
    email: staff.email,
    name: staff.name || staff.email,
    role: "admin",
    collection: "users",
  } as unknown as TypedUser;
}
