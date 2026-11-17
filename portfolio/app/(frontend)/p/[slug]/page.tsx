import { permanentRedirect } from "next/navigation";
import { profilePath } from "@/lib/basePath";

type Props = { params: Promise<{ slug: string }> };

/** Old profile links (/p/<slug>) now live at /<slug>. */
export default async function LegacyProfilePage({ params }: Props) {
  const { slug } = await params;
  permanentRedirect(profilePath(slug));
}
