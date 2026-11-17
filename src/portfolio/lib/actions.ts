// Contact form and guest book, written straight to Supabase as the anonymous visitor
// (row-level security limits what visitors can do; see supabase/migrations/*_portfolio.sql).
import { supabase as client } from "../../lib/supabase";
import type { GuestbookComment } from "./siteTypes";

type Result<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PAGE_SIZE = 10;

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const unavailable = { ok: false as const, error: "This isn't available right now. Try again later." };

/** Sends the message to the same inbox as the rest of the site (Admin → Messages). */
export async function sendContactMessage(input: {
  fullName: string;
  email: string;
  message: string;
}): Promise<Result<{ fullName: string }>> {
  const fullName = clean(input.fullName, 120);
  const email = clean(input.email, 254);
  const message = clean(input.message, 4000);
  if (!fullName || !message) return { ok: false, error: "Please fill in your name, email and message." };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Invalid Email" };
  const supabase = client;
  if (!supabase) return unavailable;
  const page = typeof window === "undefined" ? "/team" : window.location.pathname;
  const { error } = await supabase.from("contact_messages").insert({ name: fullName, email, message, page });
  return error ? { ok: false, error: "Server error. Try again later" } : { ok: true, data: { fullName } };
}

type Row = { id: number; name: string; comment: string; created_at: string };
const toComment = (r: Row): GuestbookComment => ({
  id: r.id,
  name: r.name,
  comment: r.comment,
  createdAt: r.created_at,
});

export async function getGuestbookComments(
  page: number,
): Promise<Result<{ comments: GuestbookComment[]; hasNextPage: boolean }>> {
  const supabase = client;
  if (!supabase) return unavailable;
  const from = (Math.max(1, Math.floor(page) || 1) - 1) * PAGE_SIZE;
  // One extra row tells us whether another page exists.
  const { data, error } = await supabase
    .from("portfolio_guestbook")
    .select("id, name, comment, created_at")
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE);
  if (error || !data) return { ok: false, error: "Comments are unavailable right now." };
  return {
    ok: true,
    data: { comments: data.slice(0, PAGE_SIZE).map(toComment), hasNextPage: data.length > PAGE_SIZE },
  };
}

export async function createGuestbookComment(input: {
  name: string;
  comment: string;
}): Promise<Result<GuestbookComment>> {
  const name = clean(input.name, 80);
  const comment = clean(input.comment, 2000);
  if (!name || !comment) return { ok: false, error: "Please enter both a comment and your name." };
  const supabase = client;
  if (!supabase) return unavailable;
  const { data, error } = await supabase
    .from("portfolio_guestbook")
    .insert({ name, comment })
    .select("id, name, comment, created_at")
    .single();
  return error || !data ? { ok: false, error: "Server error. Try again later" } : { ok: true, data: toComment(data) };
}
