import "server-only";
import type { TypedUser } from "payload";
import { isAdminUser } from "@/cms/access";
import { getCurrentUser } from "@/lib/auth";
import { getPayloadClient } from "@/lib/site";
import { createPreviewToken } from "@/lib/preview";
import { withBase, profilePath } from "@/lib/basePath";
import type { ActionResult } from "@/lib/edit/types";

// Reads the old portfolio dashboard did inside its pages, as operations the
// admin bridge (app/api/admin/route.ts) can call.

async function admin() {
  const user = await getCurrentUser();
  if (!user || !isAdminUser(user)) throw new Error("Only administrators can do this.");
  return { payload: await getPayloadClient(), user: user as TypedUser };
}

async function run<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    console.error("[admin]", e);
    return { ok: false, error: (e as Error).message || "Something went wrong" };
  }
}

/** Numbers for the admin overview. */
export function overview() {
  return run(async () => {
    const { payload, user } = await admin();
    const count = (collection: "contact-messages" | "guestbook-entries" | "media" | "profiles", where?: object) =>
      payload.count({ collection, where: where as never, user, overrideAccess: false }).then((r) => r.totalDocs);
    const [profiles, unhandledMessages, messages, guestbook, media] = await Promise.all([
      count("profiles"),
      count("contact-messages", { handled: { not_equals: true } }),
      count("contact-messages"),
      count("guestbook-entries"),
      count("media"),
    ]);
    return { profiles, unhandledMessages, messages, guestbook, media };
  });
}

/** Contact-form messages and guest-book comments from the portfolio pages. */
export function listInbox() {
  return run(async () => {
    const { payload, user } = await admin();
    const [messages, comments] = await Promise.all([
      payload.find({
        collection: "contact-messages",
        sort: "-createdAt",
        limit: 500,
        pagination: false,
        depth: 0,
        user,
        overrideAccess: false,
      }),
      payload.find({
        collection: "guestbook-entries",
        sort: "-createdAt",
        limit: 500,
        pagination: false,
        depth: 0,
        user,
        overrideAccess: false,
      }),
    ]);
    return {
      messages: messages.docs.map((m) => ({
        id: m.id,
        name: m.fullName,
        email: m.email,
        message: m.message,
        handled: Boolean(m.handled),
        createdAt: m.createdAt,
      })),
      comments: comments.docs.map((c) => ({
        id: c.id,
        name: c.name,
        comment: c.comment,
        approved: c.approved !== false,
        createdAt: c.createdAt,
      })),
    };
  });
}

/** Every media file, newest first, with size details. */
export function listMediaLibrary() {
  return run(async () => {
    const { payload, user } = await admin();
    const res = await payload.find({
      collection: "media",
      sort: "-createdAt",
      limit: 1000,
      pagination: false,
      depth: 0,
      user,
      overrideAccess: false,
    });
    return res.docs.map((m) => ({
      id: m.id,
      url: m.url ?? "",
      alt: m.alt ?? "",
      filename: m.filename ?? "",
      mimeType: m.mimeType ?? "",
      filesize: m.filesize ?? 0,
      width: m.width ?? null,
      height: m.height ?? null,
      createdAt: m.createdAt,
    }));
  });
}

/** Signed links (30 min) that show a profile's drafts: the page and its CV. */
export function previewLinks(profileId: number) {
  return run(async () => {
    const { payload, user } = await admin();
    const p = await payload.findByID({
      collection: "profiles",
      id: profileId,
      draft: true,
      depth: 0,
      user,
      overrideAccess: false,
    });
    const token = createPreviewToken(p.slug);
    const q = `preview=${encodeURIComponent(token)}`;
    return {
      page: `${withBase(profilePath(p.slug))}?${q}`,
      cv: `${withBase(`/cv/${p.slug}`)}?draft=1&${q}`,
      live: withBase(profilePath(p.slug)),
    };
  });
}
