import { cvResponse } from "@/lib/cv/render";

export const dynamic = "force-dynamic";

/** PDF résumé of the active profile. */
export function GET(req: Request) {
  return cvResponse(req);
}
