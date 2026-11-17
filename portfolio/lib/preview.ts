import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { compactSlug } from "./basePath";

/**
 * Signed, short-lived preview links: /team/<slug>?preview=<token> shows that profile's
 * unpublished drafts (and /team/cv/<slug>?draft=1&preview=<token> its draft CV).
 * Issued by the admin bridge to signed-in staff; anyone holding the link can view it
 * until it expires, so it's kept short.
 */
const TTL_MS = 30 * 60 * 1000;
const secret = () => process.env.PAYLOAD_SECRET || "dev-only-insecure-secret";

const sign = (body: string) => createHmac("sha256", secret()).update(body).digest("base64url");

export function createPreviewToken(slug: string, now = Date.now()): string {
  const body = `${compactSlug(slug)}.${now + TTL_MS}`;
  return `${Buffer.from(body).toString("base64url")}.${sign(body)}`;
}

export function verifyPreviewToken(token: string | null | undefined, slug: string | undefined): boolean {
  if (!token || !slug) return false;
  const [encoded, mac] = token.split(".");
  if (!encoded || !mac) return false;
  const body = Buffer.from(encoded, "base64url").toString();
  const expected = sign(body);
  if (mac.length !== expected.length || !timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return false;
  const [forSlug, exp] = body.split(".");
  return forSlug === compactSlug(slug) && Number(exp) > Date.now();
}
