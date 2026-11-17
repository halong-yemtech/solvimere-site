import type { Metadata } from "next";
import PortfolioView from "../components/PortfolioView";
import { getPageData } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ preview?: string }> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { preview } = await searchParams;
  const { site } = await getPageData(slug, preview);
  if (!site) return { title: "Not found" };
  return {
    title: `${site.profile.name} | ${site.profile.jobTitle}`,
    description: site.profile.metaDescription || undefined,
    // Private profiles are only ever rendered for admins; never index them.
    robots: site.profile.visibility === "private" || preview ? { index: false, follow: false } : undefined,
  };
}

/**
 * A team member's portfolio: /team/<slug> on the Solvimere site, e.g. /team/halong.
 * Public profiles for everyone, private ones for admins only.
 */
export default async function ProfilePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { preview } = await searchParams;
  return <PortfolioView profileSlug={slug} previewToken={preview} />;
}
