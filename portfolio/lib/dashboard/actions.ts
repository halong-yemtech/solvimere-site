"use server";

import { revalidatePath } from "next/cache";
import type { TypedUser } from "payload";
import { isAdminUser } from "@/cms/access";
import { getCurrentUser } from "@/lib/auth";
import { getPayloadClient } from "@/lib/site";
import type { ActionResult } from "@/lib/edit/types";

async function admin() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Your session has expired. Please sign in again.");
  if (!isAdminUser(user)) throw new Error("Only administrators can do this.");
  return { payload: await getPayloadClient(), user: user as TypedUser };
}

async function run<T>(fn: () => Promise<T>, paths: string[] = []): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    for (const p of paths) revalidatePath(p);
    return { ok: true, data };
  } catch (e) {
    console.error("[dashboard]", e);
    const err = e as { message?: string; data?: { errors?: { message: string; path?: string }[] } };
    return { ok: false, error: err.data?.errors?.map((x) => x.message).join("; ") || err.message || "Something went wrong" };
  }
}

const ids = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is number => Number.isInteger(x)) : []);

// ── Inbox ────────────────────────────────────────────────────

export async function setMessagesHandled(messageIds: number[], handled: boolean): Promise<ActionResult<void>> {
  return run(async () => {
    const { payload, user } = await admin();
    for (const id of ids(messageIds)) {
      await payload.update({ collection: "contact-messages", id, data: { handled }, user, overrideAccess: false });
    }
  }, ["/dashboard", "/dashboard/inbox"]);
}

export async function deleteMessages(messageIds: number[]): Promise<ActionResult<void>> {
  return run(async () => {
    const { payload, user } = await admin();
    for (const id of ids(messageIds)) await payload.delete({ collection: "contact-messages", id, user, overrideAccess: false });
  }, ["/dashboard", "/dashboard/inbox"]);
}

export async function setCommentsApproved(commentIds: number[], approved: boolean): Promise<ActionResult<void>> {
  return run(async () => {
    const { payload, user } = await admin();
    for (const id of ids(commentIds)) {
      await payload.update({ collection: "guestbook-entries", id, data: { approved }, user, overrideAccess: false });
    }
  }, ["/", "/dashboard", "/dashboard/inbox"]);
}

export async function deleteComments(commentIds: number[]): Promise<ActionResult<void>> {
  return run(async () => {
    const { payload, user } = await admin();
    for (const id of ids(commentIds)) await payload.delete({ collection: "guestbook-entries", id, user, overrideAccess: false });
  }, ["/", "/dashboard", "/dashboard/inbox"]);
}

// ── Media ────────────────────────────────────────────────────

export async function updateMediaAlt(id: number, alt: string): Promise<ActionResult<void>> {
  return run(async () => {
    const { payload, user } = await admin();
    await payload.update({ collection: "media", id, data: { alt: alt.slice(0, 300) }, user, overrideAccess: false });
  }, ["/", "/dashboard/media"]);
}

/** Where a media file is used, so deleting it isn't a surprise. */
export async function mediaUsage(id: number): Promise<ActionResult<string[]>> {
  return run(async () => {
    const { payload, user } = await admin();
    const uses: string[] = [];
    const checks: [Parameters<typeof payload.find>[0]["collection"], string, string][] = [
      ["profiles", "avatar", "internalName"], ["profiles", "backgroundImages", "internalName"], ["profiles", "cv", "internalName"],
      ["profiles", "quote.image", "internalName"], ["works", "images", "title"], ["clients", "logo", "name"],
      ["testimonials", "photo", "name"],
    ];
    for (const [collection, field, title] of checks) {
      const res = await payload.find({
        collection, where: { [field]: { in: [id] } }, depth: 0, limit: 50, draft: true, user, overrideAccess: false,
      });
      for (const d of res.docs as unknown as Record<string, unknown>[]) uses.push(`${collection}: ${String(d[title] ?? d.id)}`);
    }
    return [...new Set(uses)];
  });
}

export async function deleteMedia(id: number): Promise<ActionResult<void>> {
  return run(async () => {
    const { payload, user } = await admin();
    await payload.delete({ collection: "media", id, user, overrideAccess: false });
  }, ["/", "/dashboard/media"]);
}

// ── Users ────────────────────────────────────────────────────

const PASSWORD_MIN = 8;

async function adminCount(payload: Awaited<ReturnType<typeof getPayloadClient>>) {
  return (await payload.count({ collection: "users", where: { role: { equals: "admin" } } })).totalDocs;
}

export async function createUser(input: { email: string; password: string; name?: string; role: "admin" | "user" }): Promise<ActionResult<void>> {
  return run(async () => {
    const { payload, user } = await admin();
    if ((input.password ?? "").length < PASSWORD_MIN) throw new Error(`Password must be at least ${PASSWORD_MIN} characters.`);
    await payload.create({
      collection: "users",
      data: { email: input.email.trim(), password: input.password, name: input.name?.trim() || undefined, role: input.role === "admin" ? "admin" : "user" },
      user, overrideAccess: false,
    });
  }, ["/dashboard/users"]);
}

export async function setUserRole(id: number, role: "admin" | "user"): Promise<ActionResult<void>> {
  return run(async () => {
    const { payload, user } = await admin();
    if (id === user.id && role !== "admin") throw new Error("You can't remove your own admin role.");
    if (role !== "admin") {
      const target = await payload.findByID({ collection: "users", id, depth: 0, user, overrideAccess: false });
      if (target.role === "admin" && (await adminCount(payload)) <= 1) throw new Error("There must always be at least one admin.");
    }
    await payload.update({ collection: "users", id, data: { role }, user, overrideAccess: false });
  }, ["/dashboard/users"]);
}

export async function setUserPassword(id: number, password: string): Promise<ActionResult<void>> {
  return run(async () => {
    const { payload, user } = await admin();
    if ((password ?? "").length < PASSWORD_MIN) throw new Error(`Password must be at least ${PASSWORD_MIN} characters.`);
    await payload.update({ collection: "users", id, data: { password }, user, overrideAccess: false });
  });
}

export async function deleteUser(id: number): Promise<ActionResult<void>> {
  return run(async () => {
    const { payload, user } = await admin();
    if (id === user.id) throw new Error("You can't delete your own account.");
    const target = await payload.findByID({ collection: "users", id, depth: 0, user, overrideAccess: false });
    if (target.role === "admin" && (await adminCount(payload)) <= 1) throw new Error("There must always be at least one admin.");
    await payload.delete({ collection: "users", id, user, overrideAccess: false });
  }, ["/dashboard/users"]);
}

// ── Own account ──────────────────────────────────────────────

export async function updateAccount(input: { name?: string; email?: string; currentPassword?: string; newPassword?: string }): Promise<ActionResult<void>> {
  return run(async () => {
    const { payload, user } = await admin();
    const data: Record<string, unknown> = {};
    if (input.name !== undefined) data.name = input.name.trim();
    if (input.email && input.email.trim() !== user.email) data.email = input.email.trim();
    if (input.newPassword) {
      if (input.newPassword.length < PASSWORD_MIN) throw new Error(`Password must be at least ${PASSWORD_MIN} characters.`);
      // Confirm the current password before changing it.
      await payload.login({ collection: "users", data: { email: user.email, password: input.currentPassword ?? "" } }).catch(() => {
        throw new Error("Your current password is incorrect.");
      });
      data.password = input.newPassword;
    }
    if (!Object.keys(data).length) return;
    await payload.update({ collection: "users", id: user.id, data, user, overrideAccess: false });
  }, ["/dashboard/account"]);
}
