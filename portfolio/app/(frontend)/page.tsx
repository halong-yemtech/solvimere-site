import { redirect } from "next/navigation";
import PortfolioView from "./components/PortfolioView";
import { getPageData } from "@/lib/auth";
import { profilePath } from "@/lib/basePath";

// Content is edited live in the CMS, so render on each request.
export const dynamic = "force-dynamic";

/**
 * The portfolio's root (/team) is the Solvimere site's team page in production,
 * so here it only forwards to the active profile (used by "Back to the site" links).
 */
export default async function Home() {
  const { site } = await getPageData();
  if (site) redirect(profilePath(site.profile.slug));
  return <PortfolioView />;
}
