import { cvResponse } from "@/lib/cv/render";

export const dynamic = "force-dynamic";

/** PDF résumé of a public profile (private ones: admins with ?draft=1). */
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  return cvResponse(req, (await params).slug);
}
