import { bridge, bridgeConfigured, payloadUserFor, verifyStaff } from "@/lib/adminBridge";
import * as edit from "@/lib/edit/actions";
import * as dashboard from "@/lib/dashboard/actions";
import * as reads from "@/lib/admin/reads";

export const dynamic = "force-dynamic";

/**
 * The Solvimere admin panel's door into the portfolio CMS (served at /team/api/admin).
 *
 *   POST { op, args: [...] }        with  Authorization: Bearer <Supabase access token>
 *   POST multipart (op=uploadMedia) for file uploads
 *
 * The token must belong to staff (public.profiles role admin/editor). The operation then
 * runs as an admin through the same functions the portfolio used, so Payload keeps
 * validating, drafting and versioning, and all data stays in Supabase.
 */
const OPS = {
  // documents & list items
  loadForEdit: edit.loadForEdit,
  saveDoc: edit.saveDoc,
  createItem: edit.createItem,
  deleteItem: edit.deleteItem,
  reorderItems: edit.reorderItems,
  duplicateItemToProfile: edit.duplicateItemToProfile,
  // drafts & history
  getPendingChanges: edit.getPendingChanges,
  publish: edit.publish,
  discard: edit.discard,
  listVersions: edit.listVersions,
  restoreVersion: edit.restoreVersion,
  // profiles
  listProfiles: edit.listProfiles,
  listProfileItems: edit.listProfileItems,
  setActiveProfile: edit.setActiveProfile,
  duplicateProfile: edit.duplicateProfile,
  previewLinks: reads.previewLinks,
  // media
  listMedia: edit.listMedia,
  listMediaLibrary: reads.listMediaLibrary,
  updateMediaAlt: dashboard.updateMediaAlt,
  mediaUsage: dashboard.mediaUsage,
  deleteMedia: dashboard.deleteMedia,
  // inbox
  overview: reads.overview,
  listInbox: reads.listInbox,
  setMessagesHandled: dashboard.setMessagesHandled,
  deleteMessages: dashboard.deleteMessages,
  setCommentsApproved: dashboard.setCommentsApproved,
  deleteComments: dashboard.deleteComments,
} as const satisfies Record<string, (...args: never[]) => Promise<unknown>>;

type Op = keyof typeof OPS;

// Browsers may call this cross-origin when the admin panel is hosted elsewhere.
const allowedOrigins = (process.env.ADMIN_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin");
  if (!origin || !allowedOrigins.includes(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "600",
    Vary: "Origin",
  };
}

const json = (req: Request, body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store", ...corsHeaders(req) } });

export function OPTIONS(req: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(req) });
}

export async function POST(req: Request) {
  if (!bridgeConfigured) {
    return json(
      req,
      { ok: false, error: "The portfolio isn't connected to the admin panel (SUPABASE_URL / SUPABASE_ANON_KEY)." },
      503,
    );
  }
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const staff = await verifyStaff(token);
  if (!staff) return json(req, { ok: false, error: "Please sign in to the admin panel again." }, 401);

  let op: string;
  let args: unknown[];
  if ((req.headers.get("content-type") || "").startsWith("multipart/form-data")) {
    const form = await req.formData();
    op = String(form.get("op") || "");
    if (op !== "uploadMedia") return json(req, { ok: false, error: "Unknown operation" }, 400);
    return json(req, await bridge.run(payloadUserFor(staff), () => edit.uploadMedia(form)));
  }
  try {
    const body = (await req.json()) as { op?: string; args?: unknown[] };
    op = String(body.op || "");
    args = Array.isArray(body.args) ? body.args : [];
  } catch {
    return json(req, { ok: false, error: "Invalid request" }, 400);
  }
  if (!Object.hasOwn(OPS, op)) return json(req, { ok: false, error: "Unknown operation" }, 400);

  const fn = OPS[op as Op] as (...a: unknown[]) => Promise<unknown>;
  return json(req, await bridge.run(payloadUserFor(staff), () => fn(...args)));
}
