import { supabase } from "./supabase";

/**
 * Client for the portfolio CMS (Payload, data in Supabase), reached through the
 * portfolio app's admin bridge at /team/api/admin. Requests carry the staff member's
 * Supabase access token; the bridge checks it and runs the operation.
 *
 * VITE_PORTFOLIO_BASE: where the portfolio app lives. Default "/team" (same origin:
 * the dev proxy in vite.config.js, or the site's /team rewrite in production).
 */
export const PORTFOLIO_BASE = (import.meta.env.VITE_PORTFOLIO_BASE || "/team").replace(/\/$/, "");
const ORIGIN = PORTFOLIO_BASE.startsWith("http") ? new URL(PORTFOLIO_BASE).origin : "";

/** Absolute URL for a path the portfolio returns (media, previews: "/team/..."). */
export function portfolioUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  return `${ORIGIN}${path}`;
}

async function token() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || "";
}

async function send(body, isForm = false) {
  let res;
  try {
    res = await fetch(`${PORTFOLIO_BASE}/api/admin`, {
      method: "POST",
      headers: { Authorization: `Bearer ${await token()}`, ...(isForm ? {} : { "Content-Type": "application/json" }) },
      body: isForm ? body : JSON.stringify(body),
    });
  } catch {
    throw new Error("Can't reach the portfolio app. Is it running?");
  }
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(
      res.status === 404 ? "The portfolio app isn't reachable at /team." : `Portfolio error (${res.status}).`,
    );
  }
  if (!data.ok) throw new Error(data.error || "Something went wrong");
  return data.data;
}

/** Run a portfolio operation, e.g. call("listProfiles") or call("saveDoc", target, data). */
export function call(op, ...args) {
  return send({ op, args });
}

/** Downscale large photos so uploads stay under the 4 MB request limit. */
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

/** Upload a file to the portfolio media library. Returns { id, url, alt, filename, mimeType }. */
export async function uploadMedia(file, alt) {
  const form = new FormData();
  form.append("op", "uploadMedia");
  form.append("file", await prepareUpload(file));
  if (alt) form.append("alt", alt);
  return send(form, true);
}

export const isImage = (m) =>
  m?.mimeType ? m.mimeType.startsWith("image/") : /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(m?.url || "");
