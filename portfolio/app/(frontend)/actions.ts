"use server";

import { getPayloadClient } from "@/lib/site";
import type { GuestbookComment } from "@/lib/siteTypes";

type Result<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export async function sendContactMessage(input: {
  fullName: string;
  email: string;
  message: string;
}): Promise<Result<{ fullName: string }>> {
  const fullName = clean(input.fullName, 120);
  const email = clean(input.email, 200);
  const message = clean(input.message, 5000);

  if (!fullName || !message) return { ok: false, error: "Please fill in your name, email and message." };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Invalid Email" };

  try {
    const payload = await getPayloadClient();
    await payload.create({ collection: "contact-messages", data: { fullName, email, message } });
    return { ok: true, data: { fullName } };
  } catch (error) {
    console.error("Contact form submit failed:", error);
    return { ok: false, error: "Server error. Try again later" };
  }
}

const toComment = (d: { id: number; name: string; comment: string; createdAt: string }): GuestbookComment => ({
  id: d.id,
  name: d.name,
  comment: d.comment,
  createdAt: d.createdAt,
});

export async function getGuestbookComments(
  page: number
): Promise<Result<{ comments: GuestbookComment[]; hasNextPage: boolean }>> {
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: "guestbook-entries",
      where: { approved: { equals: true } },
      sort: "-createdAt",
      limit: 10,
      page: Math.max(1, Math.floor(page) || 1),
      depth: 0,
    });
    return { ok: true, data: { comments: res.docs.map(toComment), hasNextPage: res.hasNextPage } };
  } catch (error) {
    console.error("Guestbook query failed:", error);
    return { ok: false, error: "Comments are unavailable right now." };
  }
}

export async function createGuestbookComment(input: {
  name: string;
  comment: string;
}): Promise<Result<GuestbookComment>> {
  const name = clean(input.name, 80);
  const comment = clean(input.comment, 2000);
  if (!name || !comment) return { ok: false, error: "Please enter both a comment and your name." };

  try {
    const payload = await getPayloadClient();
    const doc = await payload.create({
      collection: "guestbook-entries",
      data: { name, comment, approved: true },
    });
    return { ok: true, data: toComment(doc) };
  } catch (error) {
    console.error("Guestbook submit failed:", error);
    return { ok: false, error: "Server error. Try again later" };
  }
}
