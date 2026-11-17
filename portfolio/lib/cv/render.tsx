import "server-only";
import { verifyPreviewToken } from "@/lib/preview";
import { renderToBuffer } from "@react-pdf/renderer";
import { getAdminUser } from "@/lib/auth";
import { getSiteData } from "@/lib/site";
import CvDocument from "./CvDocument";
import { buildCvData, cvFileName } from "./data";

/**
 * GET handler body for /cv (active profile) and /cv/<slug>.
 * ?draft=1 renders unpublished changes (admins only) — used by the dashboard preview.
 * ?download=1 sends it as an attachment instead of opening inline.
 */
export async function cvResponse(req: Request, slug?: string): Promise<Response> {
  const url = new URL(req.url);
  const wantsDraft = url.searchParams.get("draft") === "1";
  const draft =
    wantsDraft && (Boolean(await getAdminUser()) || verifyPreviewToken(url.searchParams.get("preview"), slug));
  if (wantsDraft && !draft) return new Response("Not allowed", { status: 403 });

  const site = await getSiteData(draft, slug);
  if (!site) return new Response("Not found", { status: 404 });

  const pdf = await renderToBuffer(<CvDocument data={buildCvData(site)} />);
  const name = cvFileName(site.profile.name);
  const disposition = url.searchParams.get("download") === "1" ? "attachment" : "inline";

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${disposition}; filename="${name.replace(/[^\x20-\x7e]/g, "_")}"; filename*=UTF-8''${encodeURIComponent(name)}`,
      // Drafts are private; published CVs may be cached briefly at the edge.
      "Cache-Control": draft ? "private, no-store" : "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
      "X-Robots-Tag": site.profile.visibility === "private" ? "noindex" : "all",
    },
  });
}
