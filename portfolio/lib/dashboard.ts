import "server-only";
import type { TypedUser } from "payload";
import { getPayloadClient } from "./site";

/** URL of a profile's workspace: the given slug, else the active profile, else the first. */
export async function activeProfileWorkspace(user: TypedUser, slug?: string, tab?: string): Promise<string> {
  const payload = await getPayloadClient();
  const q = tab ? `?tab=${tab}` : "";
  if (slug) {
    const found = await payload.find({ collection: "profiles", where: { slug: { equals: slug } }, draft: true, depth: 0, limit: 1, user, overrideAccess: false });
    if (found.docs[0]) return `/dashboard/profiles/${found.docs[0].id}${q}`;
  }
  const settings = await payload.findGlobal({ slug: "site-settings", depth: 0, user, overrideAccess: false });
  const active = settings.activeProfile;
  const activeId = active && typeof active === "object" ? active.id : active;
  if (activeId) return `/dashboard/profiles/${activeId}${q}`;
  const first = await payload.find({ collection: "profiles", sort: "_order", draft: true, depth: 0, limit: 1, user, overrideAccess: false });
  return first.docs[0] ? `/dashboard/profiles/${first.docs[0].id}${q}` : "/dashboard/profiles";
}

export async function getInboxCounts(user: TypedUser) {
  const payload = await getPayloadClient();
  const [unhandled, messages, guestbook, media] = await Promise.all([
    payload.count({ collection: "contact-messages", where: { handled: { not_equals: true } }, user, overrideAccess: false }),
    payload.count({ collection: "contact-messages", user, overrideAccess: false }),
    payload.count({ collection: "guestbook-entries", user, overrideAccess: false }),
    payload.count({ collection: "media", user, overrideAccess: false }),
  ]);
  return {
    unhandledMessages: unhandled.totalDocs,
    messages: messages.totalDocs,
    guestbook: guestbook.totalDocs,
    media: media.totalDocs,
  };
}
