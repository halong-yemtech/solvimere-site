"use server";

import { revalidatePath } from "next/cache";
import { generateNKeysBetween } from "payload/shared";
import type { Payload, TypedUser, Where } from "payload";
import { getCurrentUser } from "@/lib/auth";
import { isAdminUser } from "@/cms/access";
import { getPayloadClient } from "@/lib/site";
import { collectionFields, globalFields, serializeFields, type SchemaContext } from "./schema";
import {
  EDITABLE_COLLECTIONS,
  EDITABLE_GLOBALS,
  type ActionResult,
  type EditableCollection,
  type EditableGlobal,
  type EditTarget,
  type FieldSchema,
  type MediaItem,
  type PendingChange,
  type VersionItem,
} from "./types";

// ── helpers ──────────────────────────────────────────────────

async function ctx() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Your session has expired. Please log in again.");
  // Editing is for administrators only; regular accounts get nothing here.
  if (!isAdminUser(user)) throw new Error("Only administrators can edit the site.");
  return { payload: await getPayloadClient(), user: user as TypedUser };
}

function assertCollection(slug: string): asserts slug is EditableCollection {
  if (!(EDITABLE_COLLECTIONS as readonly string[]).includes(slug)) throw new Error(`Not editable: ${slug}`);
}
function assertGlobal(slug: string): asserts slug is EditableGlobal {
  if (!(EDITABLE_GLOBALS as readonly string[]).includes(slug)) throw new Error(`Not editable: ${slug}`);
}
function assertTarget(t: EditTarget) {
  if (t.kind === "collection") {
    assertCollection(t.slug);
    if (!Number.isInteger(t.id)) throw new Error("Invalid id");
  } else assertGlobal(t.slug);
}

async function run<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    console.error("[edit]", e);
    const err = e as { message?: string; data?: { errors?: { message: string; path?: string }[] } };
    const details = err.data?.errors?.map((x) => (x.path ? `${x.path}: ${x.message}` : x.message)).join("; ");
    return { ok: false, error: details || err.message || "Something went wrong" };
  }
}

const refresh = () => revalidatePath("/", "layout");

/** Fields that must never be written from the editor. */
function cleanData(data: Record<string, unknown>) {
  const { id: _id, createdAt: _c, updatedAt: _u, _status: _s, globalType: _g, ...rest } = data;
  return rest;
}

function toMedia(d: Record<string, unknown>): MediaItem {
  return {
    id: d.id as number,
    url: String(d.url ?? ""),
    alt: String(d.alt ?? ""),
    filename: String(d.filename ?? ""),
    mimeType: String(d.mimeType ?? ""),
  };
}

// ── profile ownership ────────────────────────────────────────

/** Every list collection (everything editable except the profiles themselves). */
const CONTENT_SLUGS = EDITABLE_COLLECTIONS.filter((c) => c !== "profiles") as Exclude<EditableCollection, "profiles">[];

const ownerOf = (doc: Record<string, unknown>) => {
  const v = doc.profile;
  return (v && typeof v === "object" ? (v as { id: number }).id : v) as number | undefined;
};

/** Editor context for an item owned by `profileId`: its accounts and related items. */
async function schemaContext(payload: Payload, user: TypedUser, profileId: number | undefined): Promise<SchemaContext> {
  if (!profileId) return {};
  const p = await payload
    .findByID({ collection: "profiles", id: profileId, draft: true, depth: 0, user, overrideAccess: false })
    .catch(() => null);
  const platforms = ((p?.links ?? []) as { platform?: string; url?: string }[])
    .filter((l) => l.url)
    .map((l) => String(l.platform));
  return { profileId, platforms };
}

async function assertProfile(payload: Payload, user: TypedUser, profileId: unknown): Promise<number> {
  const id = Number(profileId);
  if (!Number.isInteger(id)) throw new Error("Choose the profile this item belongs to.");
  const found = await payload.count({
    collection: "profiles",
    where: { id: { equals: id } },
    user,
    overrideAccess: false,
  });
  if (!found.totalDocs) throw new Error("That profile doesn't exist.");
  return id;
}

// ── load ─────────────────────────────────────────────────────

export async function loadForEdit(
  target: EditTarget | { kind: "new"; slug: EditableCollection; profileId?: number },
): Promise<ActionResult<{ schema: FieldSchema[]; doc: Record<string, unknown> | null }>> {
  return run(async () => {
    const { payload, user } = await ctx();
    if (target.kind === "new") {
      assertCollection(target.slug);
      const sc = target.slug === "profiles" ? {} : await schemaContext(payload, user, target.profileId);
      return { schema: await serializeFields(payload, collectionFields(payload, target.slug), sc), doc: null };
    }
    assertTarget(target);
    if (target.kind === "collection") {
      const doc = await payload.findByID({
        collection: target.slug,
        id: target.id,
        draft: true,
        depth: 1,
        user,
        overrideAccess: false,
      });
      // A profile's own account pickers list every platform (accounts may be added in the same form).
      const sc =
        target.slug === "profiles"
          ? { profileId: target.id }
          : await schemaContext(payload, user, ownerOf(doc as unknown as Record<string, unknown>));
      return { schema: await serializeFields(payload, collectionFields(payload, target.slug), sc), doc: doc as never };
    }
    const doc = await payload.findGlobal({ slug: target.slug, draft: true, depth: 1, user, overrideAccess: false });
    return { schema: await serializeFields(payload, globalFields(payload, target.slug)), doc: doc as never };
  });
}

// ── write (always as drafts; "Publish" makes them live) ──────

export async function saveDoc(target: EditTarget, data: Record<string, unknown>): Promise<ActionResult> {
  return run(async () => {
    const { payload, user } = await ctx();
    assertTarget(target);
    const clean = cleanData(data);
    if (target.kind === "collection") {
      await payload.update({
        collection: target.slug,
        id: target.id,
        data: clean as never,
        draft: true,
        user,
        overrideAccess: false,
        depth: 0,
      });
    } else {
      await payload.updateGlobal({
        slug: target.slug,
        data: clean as never,
        draft: true,
        user,
        overrideAccess: false,
        depth: 0,
      });
    }
    refresh();
    return undefined;
  });
}

/** Update one top-level (or dotted group) field, e.g. "name" or "quote.text". */
export async function saveField(target: EditTarget, path: string, value: unknown): Promise<ActionResult> {
  if (!/^[a-zA-Z][\w]*(\.[a-zA-Z][\w]*)?$/.test(path)) return { ok: false, error: "Invalid field" };
  const [head, sub] = path.split(".");
  if (!sub) return saveDoc(target, { [head]: value });
  return run(async () => {
    const { payload, user } = await ctx();
    assertTarget(target);
    const current = (target.kind === "collection"
      ? await payload.findByID({
          collection: target.slug,
          id: target.id,
          draft: true,
          depth: 0,
          user,
          overrideAccess: false,
        })
      : await payload.findGlobal({
          slug: target.slug,
          draft: true,
          depth: 0,
          user,
          overrideAccess: false,
        })) as unknown as Record<string, unknown>;
    const group = { ...((current[head] as unknown as Record<string, unknown>) ?? {}), [sub]: value };
    const res = await saveDoc(target, { [head]: group });
    if (!res.ok) throw new Error(res.error);
    return undefined;
  });
}

/** Create a list item (owned by `profileId`) or a profile. Always a draft. */
export async function createItem(
  slug: EditableCollection,
  data: Record<string, unknown>,
  profileId?: number,
): Promise<ActionResult<{ id: number }>> {
  return run(async () => {
    const { payload, user } = await ctx();
    assertCollection(slug);
    const clean = cleanData(data);
    if (slug === "profiles") delete clean.profile;
    else clean.profile = await assertProfile(payload, user, profileId ?? clean.profile);
    const doc = await payload.create({
      collection: slug,
      data: clean as never,
      draft: true,
      user,
      overrideAccess: false,
      depth: 0,
    });
    refresh();
    return { id: doc.id as number };
  });
}

export async function deleteItem(slug: EditableCollection, id: number): Promise<ActionResult> {
  return run(async () => {
    const { payload, user } = await ctx();
    assertCollection(slug);
    if (slug === "profiles") {
      const [activeLive, activeDraft] = await Promise.all([
        activeProfileId(payload, user, false),
        activeProfileId(payload, user, true),
      ]);
      if (activeLive === id || activeDraft === id)
        throw new Error("This is the active profile. Make another profile active first.");
      // A profile owns its content: delete it with the profile. Categories last (works refer to them).
      for (const c of [...CONTENT_SLUGS.filter((x) => x !== "work-categories"), "work-categories" as const]) {
        await payload.delete({ collection: c, where: { profile: { equals: id } }, user, overrideAccess: false });
      }
    }
    await payload.delete({ collection: slug, id, user, overrideAccess: false });
    refresh();
    return undefined;
  });
}

/** Save a new order (ids first → last). Stored as drafts like any other edit. */
export async function reorderItems(slug: EditableCollection, ids: number[]): Promise<ActionResult> {
  return run(async () => {
    const { payload, user } = await ctx();
    assertCollection(slug);
    const keys = generateNKeysBetween(null, null, ids.length);
    for (const [i, id] of ids.entries()) {
      await payload.update({
        collection: slug,
        id,
        data: { _order: keys[i] } as never,
        draft: true,
        user,
        overrideAccess: false,
        depth: 0,
      });
    }
    refresh();
    return undefined;
  });
}

// ── media ────────────────────────────────────────────────────

export async function uploadMedia(form: FormData): Promise<ActionResult<MediaItem>> {
  return run(async () => {
    const { payload, user } = await ctx();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) throw new Error("No file received");
    const doc = await payload.create({
      collection: "media",
      data: { alt: String(form.get("alt") || file.name.replace(/\.[^.]+$/, "")) },
      file: { data: Buffer.from(await file.arrayBuffer()), mimetype: file.type, name: file.name, size: file.size },
      user,
      overrideAccess: false,
    });
    return toMedia(doc as never);
  });
}

export async function listMedia(page = 1): Promise<ActionResult<{ items: MediaItem[]; hasNextPage: boolean }>> {
  return run(async () => {
    const { payload, user } = await ctx();
    const res = await payload.find({
      collection: "media",
      sort: "-createdAt",
      limit: 40,
      page,
      depth: 0,
      user,
      overrideAccess: false,
    });
    return { items: res.docs.map((d) => toMedia(d as never)), hasNextPage: res.hasNextPage };
  });
}

// ── drafts: status, publish, discard ─────────────────────────

/** Unpublished drafts — everything, or only one profile and the items it owns. */
async function pendingChanges(payload: Payload, user: TypedUser, profileId?: number): Promise<PendingChange[]> {
  const out: PendingChange[] = [];
  for (const slug of EDITABLE_COLLECTIONS) {
    const cfg = payload.collections[slug].config;
    const scope: Where[] =
      profileId === undefined
        ? []
        : [slug === "profiles" ? { id: { equals: profileId } } : { profile: { equals: profileId } }];
    const res = await payload.find({
      collection: slug,
      draft: true,
      where: { and: [{ _status: { equals: "draft" } }, ...scope] },
      depth: 0,
      limit: 500,
      pagination: false,
      user,
      overrideAccess: false,
    });
    for (const d of res.docs as unknown as Record<string, unknown>[]) {
      const published = await payload.count({
        collection: slug,
        where: { and: [{ id: { equals: d.id } }, { _status: { equals: "published" } }] },
      });
      out.push({
        target: { kind: "collection", slug, id: d.id as number },
        label: String(d[cfg.admin?.useAsTitle ?? "id"] ?? d.id),
        group: String(cfg.labels?.plural ?? slug),
        isNew: published.totalDocs === 0,
        profileId: slug === "profiles" ? (d.id as number) : ownerOf(d),
      });
    }
  }
  if (profileId !== undefined) return out; // site settings aren't part of a profile
  for (const slug of EDITABLE_GLOBALS) {
    // A global's row may not exist yet (status defaults to "draft"), so look at
    // its newest saved version instead.
    const latest = await payload.findGlobalVersions({
      slug,
      sort: "-updatedAt",
      limit: 1,
      depth: 0,
      user,
      overrideAccess: false,
    });
    if ((latest.docs[0]?.version as { _status?: string } | undefined)?._status === "draft") {
      const cfg = payload.globals.config.find((c) => c.slug === slug);
      out.push({
        target: { kind: "global", slug },
        label: String(cfg?.label ?? slug),
        group: "Settings",
        isNew: false,
      });
    }
  }
  return out;
}

export async function getPendingChanges(profileId?: number): Promise<ActionResult<PendingChange[]>> {
  return run(async () => {
    const { payload, user } = await ctx();
    return pendingChanges(payload, user, profileId);
  });
}

async function publishOne(payload: Payload, user: TypedUser, t: EditTarget) {
  if (t.kind === "collection") {
    await payload.update({
      collection: t.slug,
      id: t.id,
      data: { _status: "published" } as never,
      user,
      overrideAccess: false,
      depth: 0,
    });
  } else {
    await payload.updateGlobal({
      slug: t.slug,
      data: { _status: "published" } as never,
      user,
      overrideAccess: false,
      depth: 0,
    });
  }
}

/** Publish every pending draft (or only `targets`, or only one profile's). */
export async function publish(
  targets?: EditTarget[],
  profileId?: number,
): Promise<ActionResult<{ published: number }>> {
  return run(async () => {
    const { payload, user } = await ctx();
    const list = targets ?? (await pendingChanges(payload, user, profileId)).map((p) => p.target);
    for (const t of list) {
      assertTarget(t);
      await publishOne(payload, user, t);
    }
    refresh();
    return { published: list.length };
  });
}

/** Throw away drafts: restore the last published version, or delete never-published items. */
export async function discard(
  targets?: EditTarget[],
  profileId?: number,
): Promise<ActionResult<{ discarded: number }>> {
  return run(async () => {
    const { payload, user } = await ctx();
    const all = await pendingChanges(payload, user, profileId);
    const list = targets ? all.filter((p) => targets.some((t) => JSON.stringify(t) === JSON.stringify(p.target))) : all;
    for (const p of list) {
      const t = p.target;
      if (t.kind === "collection") {
        if (p.isNew) {
          await payload.delete({ collection: t.slug, id: t.id, user, overrideAccess: false });
          continue;
        }
        const v = await payload.findVersions({
          collection: t.slug,
          where: { and: [{ parent: { equals: t.id } }, { "version._status": { equals: "published" } }] },
          sort: "-updatedAt",
          limit: 1,
          depth: 0,
          user,
          overrideAccess: false,
        });
        if (v.docs[0])
          await payload.restoreVersion({ collection: t.slug, id: v.docs[0].id, user, overrideAccess: false, depth: 0 });
      } else {
        const v = await payload.findGlobalVersions({
          slug: t.slug,
          where: { "version._status": { equals: "published" } },
          sort: "-updatedAt",
          limit: 1,
          depth: 0,
          user,
          overrideAccess: false,
        });
        if (v.docs[0])
          await payload.restoreGlobalVersion({
            slug: t.slug,
            id: String(v.docs[0].id),
            user,
            overrideAccess: false,
            depth: 0,
          });
      }
    }
    refresh();
    return { discarded: list.length };
  });
}

// ── history ──────────────────────────────────────────────────

export async function listVersions(target: EditTarget): Promise<ActionResult<VersionItem[]>> {
  return run(async () => {
    const { payload, user } = await ctx();
    assertTarget(target);
    const res =
      target.kind === "collection"
        ? await payload.findVersions({
            collection: target.slug,
            where: { parent: { equals: target.id } },
            sort: "-updatedAt",
            limit: 30,
            depth: 0,
            user,
            overrideAccess: false,
          })
        : await payload.findGlobalVersions({
            slug: target.slug,
            sort: "-updatedAt",
            limit: 30,
            depth: 0,
            user,
            overrideAccess: false,
          });
    return res.docs.map((v) => ({
      id: v.id,
      status: ((v.version as { _status?: string })._status === "published"
        ? "published"
        : "draft") as VersionItem["status"],
      updatedAt: String(v.updatedAt),
      latest: Boolean((v as { latest?: boolean }).latest),
    }));
  });
}

/** Restore an old version as a new draft (publish to make it live). */
export async function restoreVersion(target: EditTarget, versionId: string | number): Promise<ActionResult> {
  return run(async () => {
    const { payload, user } = await ctx();
    assertTarget(target);
    if (target.kind === "collection") {
      await payload.restoreVersion({
        collection: target.slug,
        id: versionId as never,
        draft: true,
        user,
        overrideAccess: false,
        depth: 0,
      });
    } else {
      // `draft` is supported by the operation but missing from the local API type.
      await payload.restoreGlobalVersion({
        slug: target.slug,
        id: String(versionId),
        draft: true,
        user,
        overrideAccess: false,
        depth: 0,
      } as never);
    }
    refresh();
    return undefined;
  });
}

// ── profiles ─────────────────────────────────────────────────

export interface ProfileSummary {
  id: number;
  internalName: string;
  name: string;
  slug: string;
  visibility: "public" | "private";
  status: "published" | "draft";
  isActive: boolean;
  avatarUrl: string | null;
  /** Number of list items this profile owns. */
  items: number;
}

async function ownedCount(payload: Payload, user: TypedUser, profileId: number) {
  let n = 0;
  for (const slug of CONTENT_SLUGS) {
    n += (
      await payload.count({ collection: slug, where: { profile: { equals: profileId } }, user, overrideAccess: false })
    ).totalDocs;
  }
  return n;
}

async function activeProfileId(payload: Payload, user: TypedUser, draft: boolean) {
  const s = await payload.findGlobal({ slug: "site-settings", draft, depth: 0, user, overrideAccess: false });
  const v = s.activeProfile;
  return v && typeof v === "object" ? v.id : (v ?? null);
}

export async function listProfiles(): Promise<ActionResult<ProfileSummary[]>> {
  return run(async () => {
    const { payload, user } = await ctx();
    const [res, active] = await Promise.all([
      payload.find({
        collection: "profiles",
        draft: true,
        sort: "_order",
        depth: 1,
        limit: 200,
        pagination: false,
        user,
        overrideAccess: false,
      }),
      activeProfileId(payload, user, false),
    ]);
    const firstId = res.docs[0]?.id;
    return Promise.all(
      res.docs.map(async (p) => ({
        id: p.id,
        internalName: p.internalName,
        name: p.name,
        slug: p.slug,
        visibility: p.visibility === "private" ? ("private" as const) : ("public" as const),
        status: p._status === "draft" ? ("draft" as const) : ("published" as const),
        isActive: active ? active === p.id : p.id === firstId,
        avatarUrl: p.avatar && typeof p.avatar === "object" ? (p.avatar.url ?? null) : null,
        items: await ownedCount(payload, user, p.id),
      })),
    );
  });
}

/**
 * Make a profile the one shown at "/". This is published right away (it's a
 * selection, not content); other pending Site settings drafts are kept as drafts.
 */
export async function setActiveProfile(id: number): Promise<ActionResult> {
  return run(async () => {
    const { payload, user } = await ctx();
    const profile = await payload.findByID({
      collection: "profiles",
      id,
      draft: true,
      depth: 0,
      user,
      overrideAccess: false,
    });
    if (profile._status === "draft") {
      const everPublished = await payload.count({
        collection: "profiles",
        where: { and: [{ id: { equals: id } }, { _status: { equals: "published" } }] },
      });
      if (!everPublished.totalDocs) throw new Error("Publish this profile before making it active.");
    }
    const live = await payload.findGlobal({
      slug: "site-settings",
      draft: false,
      depth: 0,
      user,
      overrideAccess: false,
    });
    const latest = await payload.findGlobalVersions({
      slug: "site-settings",
      sort: "-updatedAt",
      limit: 1,
      depth: 0,
      user,
      overrideAccess: false,
    });
    const pendingDraft =
      (latest.docs[0]?.version as { _status?: string } | undefined)?._status === "draft"
        ? (latest.docs[0].version as unknown as Record<string, unknown>)
        : null;
    const {
      id: _i,
      createdAt: _c,
      updatedAt: _u,
      globalType: _g,
      ...liveData
    } = live as unknown as Record<string, unknown>;
    // Publish the live settings with only the active profile changed …
    await payload.updateGlobal({
      slug: "site-settings",
      data: { ...liveData, activeProfile: id, _status: "published" } as never,
      user,
      overrideAccess: false,
      depth: 0,
    });
    // … then put any pending draft back on top, with the new selection.
    if (pendingDraft) {
      const { id: _a, createdAt: _b, updatedAt: _d, globalType: _e, ...draftData } = pendingDraft;
      await payload.updateGlobal({
        slug: "site-settings",
        data: { ...draftData, activeProfile: id } as never,
        draft: true,
        user,
        overrideAccess: false,
        depth: 0,
      });
    }
    refresh();
    return undefined;
  });
}

/** Strip ids so arrays and nested groups get fresh rows when copied. */
const stripIds = (v: unknown): unknown =>
  Array.isArray(v)
    ? v.map(stripIds)
    : v && typeof v === "object"
      ? Object.fromEntries(
          Object.entries(v)
            .filter(([k]) => k !== "id")
            .map(([k, x]) => [k, stripIds(x)]),
        )
      : v;

/** Data of an item ready to be created again under `profileId`. */
function copyData(doc: Record<string, unknown>, profileId: number, categoryMap?: Map<number, number>) {
  const { id: _i, createdAt: _c, updatedAt: _u, _status: _s, profile: _p, ...rest } = doc;
  const data = stripIds(rest) as Record<string, unknown>;
  if (Array.isArray(data.categories)) {
    data.categories = (data.categories as (number | { id: number })[])
      .map((c) => (typeof c === "object" ? c.id : c))
      .map((c) => (categoryMap ? categoryMap.get(c) : c))
      .filter((c): c is number => typeof c === "number");
  }
  return { ...data, profile: profileId };
}

/** Copy every item owned by `fromId` to `toId` (as drafts). Categories first, so works can point to the copies. */
async function copyItems(payload: Payload, user: TypedUser, fromId: number, toId: number) {
  const categoryMap = new Map<number, number>();
  for (const slug of ["work-categories" as const, ...CONTENT_SLUGS.filter((c) => c !== "work-categories")]) {
    const res = await payload.find({
      collection: slug,
      draft: true,
      where: { profile: { equals: fromId } },
      sort: "_order",
      depth: 0,
      limit: 1000,
      pagination: false,
      user,
      overrideAccess: false,
    });
    for (const d of res.docs as unknown as Record<string, unknown>[]) {
      const created = await payload.create({
        collection: slug,
        data: copyData(d, toId, categoryMap) as never,
        draft: true,
        user,
        overrideAccess: false,
        depth: 0,
      });
      if (slug === "work-categories") categoryMap.set(d.id as number, created.id as number);
    }
  }
}

/** Copy a profile (as a private draft) together with all of its content. */
export async function duplicateProfile(id: number): Promise<ActionResult<{ id: number }>> {
  return run(async () => {
    const { payload, user } = await ctx();
    const src = await payload.findByID({
      collection: "profiles",
      id,
      draft: true,
      depth: 0,
      user,
      overrideAccess: false,
    });
    const {
      id: _i,
      createdAt: _c,
      updatedAt: _u,
      _status: _s,
      _order: _o,
      ...data
    } = src as unknown as Record<string, unknown>;
    let slug = `${src.slug}-copy`;
    for (
      let n = 2;
      (await payload.count({ collection: "profiles", where: { slug: { equals: slug } } })).totalDocs;
      n++
    ) {
      slug = `${src.slug}-copy-${n}`;
    }
    const copy = await payload.create({
      collection: "profiles",
      data: {
        ...(stripIds(data) as object),
        internalName: `${src.internalName} (copy)`,
        slug,
        visibility: "private",
      } as never,
      draft: true,
      user,
      overrideAccess: false,
      depth: 0,
    });
    await copyItems(payload, user, id, copy.id as number);
    refresh();
    return { id: copy.id as number };
  });
}

/** Put a copy of one item on another profile (instead of sharing it). */
export async function duplicateItemToProfile(
  slug: EditableCollection,
  id: number,
  targetProfileId: number,
): Promise<ActionResult<{ id: number }>> {
  return run(async () => {
    const { payload, user } = await ctx();
    assertCollection(slug);
    if (slug === "profiles") throw new Error("Use Duplicate profile instead.");
    const to = await assertProfile(payload, user, targetProfileId);
    const doc = await payload.findByID({ collection: slug, id, draft: true, depth: 0, user, overrideAccess: false });
    let categoryMap: Map<number, number> | undefined;
    if (slug === "works") {
      // Map categories by name onto the target profile's categories.
      const [mine, theirs] = await Promise.all([
        payload.find({
          collection: "work-categories",
          draft: true,
          where: { profile: { equals: ownerOf(doc as never) } },
          depth: 0,
          limit: 500,
          pagination: false,
          user,
          overrideAccess: false,
        }),
        payload.find({
          collection: "work-categories",
          draft: true,
          where: { profile: { equals: to } },
          depth: 0,
          limit: 500,
          pagination: false,
          user,
          overrideAccess: false,
        }),
      ]);
      const byName = new Map(theirs.docs.map((c) => [c.name, c.id as number]));
      categoryMap = new Map(
        mine.docs.filter((c) => byName.has(c.name)).map((c) => [c.id as number, byName.get(c.name)!]),
      );
    }
    const created = await payload.create({
      collection: slug,
      data: copyData(doc as never, to, categoryMap) as never,
      draft: true,
      user,
      overrideAccess: false,
      depth: 0,
    });
    refresh();
    return { id: created.id as number };
  });
}

// ── profile workspace ────────────────────────────────────────

export interface ProfileItemList {
  slug: Exclude<EditableCollection, "profiles">;
  label: string;
  singular: string;
  items: { id: number; label: string; status: "published" | "draft" }[];
}

/** Every list item this profile owns, grouped by collection (drafts included). */
export async function listProfileItems(profileId: number): Promise<ActionResult<ProfileItemList[]>> {
  return run(async () => {
    const { payload, user } = await ctx();
    const text = (v: unknown) =>
      typeof v === "string"
        ? v
        : v && typeof v === "object" && "en" in v
          ? String((v as { en: string }).en)
          : undefined;
    return Promise.all(
      CONTENT_SLUGS.map(async (slug) => {
        const cfg = payload.collections[slug].config;
        const titleField = cfg.admin?.useAsTitle ?? "id";
        const res = await payload.find({
          collection: slug,
          draft: true,
          where: { profile: { equals: profileId } },
          sort: "_order",
          depth: 0,
          limit: 1000,
          pagination: false,
          user,
          overrideAccess: false,
        });
        return {
          slug,
          label: text(cfg.labels?.plural) ?? slug,
          singular: text(cfg.labels?.singular) ?? slug,
          items: res.docs.map((d) => {
            const doc = d as unknown as Record<string, unknown>;
            return {
              id: doc.id as number,
              label: String(doc[titleField] ?? doc.id),
              status: doc._status === "draft" ? ("draft" as const) : ("published" as const),
            };
          }),
        };
      }),
    );
  });
}
