import { supabase } from "../lib/supabase";
import { portfolioSlug } from "../../../src/lib/slug.js";
import schemas from "./schemas.json";

/*
 * Portfolio content in Supabase (supabase/migrations/20261118100000_portfolio.sql):
 *   portfolio_profiles  one row per member: slug, visibility, data (JSON document)
 *   portfolio_items     works, résumé entries, services, … (kind + data), per profile
 *   portfolio_media     files in the public `portfolio` bucket
 *   portfolio_settings  sections, theme, maintenance (one row)
 *   portfolio_guestbook guest-book comments
 * Staff-only writes are enforced by row-level security.
 */

export { schemas };
export const ITEM_KINDS = [
  "services",
  "pricing-plans",
  "clients",
  "testimonials",
  "facts",
  "statistics",
  "resume-entries",
  "works",
  "work-categories",
  "blog-posts",
];
const BUCKET = "portfolio";

function check({ data, error }) {
  if (error) throw new Error(error.message);
  return data;
}

/** Display title of a document of `kind`. */
export function titleOf(kind, data) {
  const field = schemas[kind]?.titleField;
  const value = data?.[field];
  return typeof value === "string" && value.trim() ? value : data?.name || data?.title || "Untitled";
}

/* ── media ─────────────────────────────────────────────────────────────── */

export const isImage = (m) =>
  m?.mimeType ? m.mimeType.startsWith("image/") : /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(m?.url || "");

const toMedia = (row) => ({
  id: row.id,
  url: row.url,
  alt: row.alt,
  filename: row.filename,
  mimeType: row.mime_type,
  filesize: row.filesize,
  width: row.width,
  height: row.height,
  path: row.path,
  createdAt: row.created_at,
});

export async function listMedia(page = 1, pageSize = 40) {
  const from = (page - 1) * pageSize;
  const rows = check(
    await supabase
      .from("portfolio_media")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, from + pageSize),
  );
  return { items: rows.slice(0, pageSize).map(toMedia), hasNextPage: rows.length > pageSize };
}

export async function listAllMedia() {
  return check(await supabase.from("portfolio_media").select("*").order("created_at", { ascending: false })).map(
    toMedia,
  );
}

async function mediaByIds(ids) {
  const unique = [...new Set(ids.filter(Number.isInteger))];
  if (!unique.length) return new Map();
  const rows = check(await supabase.from("portfolio_media").select("*").in("id", unique));
  return new Map(rows.map((r) => [r.id, toMedia(r)]));
}

/** Image size of a file, for images (null otherwise). */
function imageSize(file) {
  if (!file.type.startsWith("image/")) return Promise.resolve(null);
  return createImageBitmap(file)
    .then((b) => ({ width: b.width, height: b.height }))
    .catch(() => null);
}

/** Downscale very large photos in the browser before uploading. */
async function prepareUpload(file) {
  const LIMIT = 3.5 * 1024 * 1024;
  if (file.size <= LIMIT || !/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 2560 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.86));
  return blob ? new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }) : file;
}

export async function uploadMedia(original, alt) {
  const file = await prepareUpload(original);
  const safe =
    file.name
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, "-")
      .replace(/^-+|-+$/g, "") || "file";
  const path = `${crypto.randomUUID().slice(0, 8)}-${safe}`;
  check(await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false }));
  const url = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  const size = await imageSize(file);
  const row = check(
    await supabase
      .from("portfolio_media")
      .insert({
        path,
        url,
        alt: alt || original.name.replace(/\.[^.]+$/, ""),
        filename: file.name,
        mime_type: file.type,
        filesize: file.size,
        width: size?.width ?? null,
        height: size?.height ?? null,
      })
      .select("*")
      .single(),
  );
  return toMedia(row);
}

export async function updateMediaAlt(id, alt) {
  check(
    await supabase
      .from("portfolio_media")
      .update({ alt: String(alt).slice(0, 300) })
      .eq("id", id),
  );
}

export async function deleteMedia(media) {
  check(await supabase.storage.from(BUCKET).remove([media.path]));
  check(await supabase.from("portfolio_media").delete().eq("id", media.id));
}

/* ── schema helpers ────────────────────────────────────────────────────── */

function flat(fields) {
  return fields.flatMap((f) =>
    f.type === "row" ? flat(f.fields) : f.type === "tabs" ? f.tabs.flatMap((t) => flat(t.fields)) : [f],
  );
}

/** Media ids referenced by a document (any depth). */
function collectMediaIds(fields, values, out = []) {
  for (const f of flat(fields)) {
    const v = values?.[f.name];
    if (f.type === "upload") (Array.isArray(v) ? v : [v]).forEach((x) => Number.isInteger(x) && out.push(x));
    else if (f.type === "group") collectMediaIds(f.fields, v, out);
    else if (f.type === "array") (Array.isArray(v) ? v : []).forEach((row) => collectMediaIds(f.fields, row, out));
  }
  return out;
}

/** Replace media ids with media objects (for the form's thumbnails). */
function expandMedia(fields, values, media) {
  const out = { ...values };
  for (const f of flat(fields)) {
    const v = out[f.name];
    if (f.type === "upload")
      out[f.name] = Array.isArray(v) ? v.map((x) => media.get(x) ?? x) : (media.get(v) ?? v ?? null);
    else if (f.type === "group") out[f.name] = expandMedia(f.fields, v ?? {}, media);
    else if (f.type === "array")
      out[f.name] = (Array.isArray(v) ? v : []).map((row) => expandMedia(f.fields, row, media));
  }
  return out;
}

/** Fill relationship options (e.g. a work's categories: this profile's categories). */
async function withOptions(fields, profileId) {
  const resolve = async (list) =>
    Promise.all(
      list.map(async (f) => {
        if (f.type === "relationship" && f.relationTo && profileId) {
          const rows = check(
            await supabase
              .from("portfolio_items")
              .select("id, data")
              .eq("profile_id", profileId)
              .eq("kind", f.relationTo)
              .order("sort_order"),
          );
          return { ...f, options: rows.map((r) => ({ label: titleOf(f.relationTo, r.data), value: r.id })) };
        }
        if (f.type === "tabs")
          return {
            ...f,
            tabs: await Promise.all(f.tabs.map(async (t) => ({ ...t, fields: await resolve(t.fields) }))),
          };
        if (f.fields) return { ...f, fields: await resolve(f.fields) };
        return f;
      }),
    );
  return resolve(fields);
}

/* ── profiles ──────────────────────────────────────────────────────────── */

/** Profile form: the CMS fields plus the address (/team/<slug>) and visibility. */
function profileSchema() {
  const [tabs] = schemas.profiles.fields;
  const access = {
    type: "row",
    fields: [
      {
        type: "text",
        name: "slug",
        label: "Address",
        required: true,
        description: "/team/<address>. The member's name in lowercase letters and digits, e.g. halong.",
        width: "50%",
      },
      {
        type: "select",
        name: "visibility",
        label: "Visibility",
        required: true,
        description: "Private profiles aren't shown on the site.",
        width: "50%",
        options: [
          { label: "Public — anyone with the link", value: "public" },
          { label: "Private — hidden", value: "private" },
        ],
      },
    ],
  };
  return [{ ...tabs, tabs: tabs.tabs.map((t, i) => (i === 0 ? { ...t, fields: [access, ...t.fields] } : t)) }];
}

export async function listProfiles() {
  const rows = check(
    await supabase
      .from("portfolio_profiles")
      .select("id, slug, visibility, sort_order, updated_at, data, portfolio_items(count)")
      .order("sort_order")
      .order("id"),
  );
  const media = await mediaByIds(rows.map((r) => r.data?.avatar));
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    visibility: r.visibility,
    name: r.data?.name || r.data?.internalName || r.slug,
    internalName: r.data?.internalName || "",
    avatarUrl: media.get(r.data?.avatar)?.url || null,
    items: r.portfolio_items?.[0]?.count ?? 0,
    updatedAt: r.updated_at,
  }));
}

/** Everything a form needs: { schema, values, title }. */
export async function loadDoc(target) {
  if (target.kind === "settings") {
    const row = check(await supabase.from("portfolio_settings").select("data").eq("id", 1).maybeSingle());
    const fields = schemas["site-settings"].fields;
    const values = row?.data ?? {};
    return { schema: fields, values: expandMedia(fields, values, await mediaByIds(collectMediaIds(fields, values))) };
  }
  if (target.kind === "profile") {
    const fields = await withOptions(profileSchema(), target.id);
    if (target.id == null) return { schema: fields, values: { visibility: "private" } };
    const row = check(await supabase.from("portfolio_profiles").select("*").eq("id", target.id).single());
    const values = { ...row.data, slug: row.slug, visibility: row.visibility };
    return { schema: fields, values: expandMedia(fields, values, await mediaByIds(collectMediaIds(fields, values))) };
  }
  // list item
  const fields = await withOptions(schemas[target.itemKind].fields, target.profileId);
  if (target.id == null) return { schema: fields, values: {} };
  const row = check(await supabase.from("portfolio_items").select("*").eq("id", target.id).single());
  return { schema: fields, values: expandMedia(fields, row.data, await mediaByIds(collectMediaIds(fields, row.data))) };
}

/** Save normalized form data; returns the row id (new documents are created). */
export async function saveDoc(target, data) {
  if (target.kind === "settings") {
    check(await supabase.from("portfolio_settings").update({ data }).eq("id", 1));
    return 1;
  }
  if (target.kind === "profile") {
    const { slug, visibility, ...rest } = data;
    const clean = portfolioSlug(slug);
    if (!clean) throw new Error("Enter an address (letters and digits).");
    const columns = { slug: clean, visibility: visibility === "public" ? "public" : "private", data: rest };
    if (target.id == null) {
      const { count } = await supabase.from("portfolio_profiles").select("id", { count: "exact", head: true });
      return check(
        await supabase
          .from("portfolio_profiles")
          .insert({ ...columns, sort_order: count ?? 0 })
          .select("id")
          .single(),
      ).id;
    }
    check(await supabase.from("portfolio_profiles").update(columns).eq("id", target.id));
    return target.id;
  }
  if (target.id == null) {
    const { count } = await supabase
      .from("portfolio_items")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", target.profileId)
      .eq("kind", target.itemKind);
    return check(
      await supabase
        .from("portfolio_items")
        .insert({ profile_id: target.profileId, kind: target.itemKind, sort_order: count ?? 0, data })
        .select("id")
        .single(),
    ).id;
  }
  check(await supabase.from("portfolio_items").update({ data }).eq("id", target.id));
  return target.id;
}

export async function deleteProfile(id) {
  check(await supabase.from("portfolio_profiles").delete().eq("id", id)); // items cascade
}

/** Copy a profile (private) and all of its items; work categories are remapped. */
export async function duplicateProfile(id) {
  const src = check(await supabase.from("portfolio_profiles").select("*").eq("id", id).single());
  const all = check(await supabase.from("portfolio_profiles").select("slug"));
  const taken = new Set(all.map((r) => r.slug));
  let slug = `${src.slug}copy`;
  for (let n = 2; taken.has(slug); n += 1) slug = `${src.slug}copy${n}`;
  const copy = check(
    await supabase
      .from("portfolio_profiles")
      .insert({
        slug,
        visibility: "private",
        sort_order: all.length,
        data: { ...src.data, internalName: `${src.data?.internalName || src.slug} (copy)` },
      })
      .select("id")
      .single(),
  );
  const items = check(
    await supabase.from("portfolio_items").select("*").eq("profile_id", id).order("kind").order("sort_order"),
  );
  const categoryIds = new Map();
  for (const item of [
    ...items.filter((i) => i.kind === "work-categories"),
    ...items.filter((i) => i.kind !== "work-categories"),
  ]) {
    const data = { ...item.data };
    if (item.kind === "works" && Array.isArray(data.categories)) {
      data.categories = data.categories.map((c) => categoryIds.get(c)).filter((c) => c !== undefined);
    }
    const created = check(
      await supabase
        .from("portfolio_items")
        .insert({ profile_id: copy.id, kind: item.kind, sort_order: item.sort_order, data })
        .select("id")
        .single(),
    );
    if (item.kind === "work-categories") categoryIds.set(item.id, created.id);
  }
  return copy.id;
}

/* ── items ─────────────────────────────────────────────────────────────── */

/** A profile's items, grouped by kind in display order. */
export async function listItems(profileId) {
  const rows = check(
    await supabase
      .from("portfolio_items")
      .select("id, kind, sort_order, data")
      .eq("profile_id", profileId)
      .order("sort_order"),
  );
  return ITEM_KINDS.map((kind) => ({
    kind,
    label: schemas[kind].label,
    singular: schemas[kind].singular,
    items: rows.filter((r) => r.kind === kind).map((r) => ({ id: r.id, label: titleOf(kind, r.data) })),
  }));
}

export async function deleteItem(id) {
  check(await supabase.from("portfolio_items").delete().eq("id", id));
}

export async function reorderItems(ids) {
  for (const [i, id] of ids.entries()) {
    check(await supabase.from("portfolio_items").update({ sort_order: i }).eq("id", id));
  }
}

/* ── where a file is used ──────────────────────────────────────────────── */

export async function mediaUsage(mediaId) {
  const [profiles, items, settings] = await Promise.all([
    supabase.from("portfolio_profiles").select("slug, data").then(check),
    supabase.from("portfolio_items").select("kind, data, portfolio_profiles(slug)").then(check),
    supabase.from("portfolio_settings").select("data").then(check),
  ]);
  const uses = [];
  for (const p of profiles) {
    if (collectMediaIds(profileSchema(), p.data).includes(mediaId)) uses.push(`/team/${p.slug} profile`);
  }
  for (const i of items) {
    if (collectMediaIds(schemas[i.kind].fields, i.data).includes(mediaId)) {
      uses.push(
        `/team/${i.portfolio_profiles?.slug}: ${schemas[i.kind].singular.toLowerCase()} “${titleOf(i.kind, i.data)}”`,
      );
    }
  }
  for (const s of settings) {
    if (collectMediaIds(schemas["site-settings"].fields, s.data).includes(mediaId)) uses.push("Portfolio settings");
  }
  return uses;
}

/* ── guest book ────────────────────────────────────────────────────────── */

export async function listGuestbook() {
  return check(
    await supabase.from("portfolio_guestbook").select("*").order("created_at", { ascending: false }).limit(500),
  );
}

export async function setCommentApproved(id, approved) {
  check(await supabase.from("portfolio_guestbook").update({ approved }).eq("id", id));
}

export async function deleteComment(id) {
  check(await supabase.from("portfolio_guestbook").delete().eq("id", id));
}

export async function counts() {
  const head = (q) => q.then(({ count }) => count ?? 0);
  const [profiles, media, comments] = await Promise.all([
    head(supabase.from("portfolio_profiles").select("id", { count: "exact", head: true })),
    head(supabase.from("portfolio_media").select("id", { count: "exact", head: true })),
    head(supabase.from("portfolio_guestbook").select("id", { count: "exact", head: true })),
  ]);
  return { profiles, media, comments };
}

/** The public site (for "View" links): VITE_SITE_URL, or the local site in development. */
export const SITE_URL = (import.meta.env.VITE_SITE_URL || (import.meta.env.DEV ? "http://localhost:5173" : "")).replace(
  /\/$/,
  "",
);
