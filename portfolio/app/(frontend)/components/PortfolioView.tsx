import "react-loading-skeleton/dist/skeleton.css";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPageData } from "@/lib/auth";
import { SiteProvider } from "@/components/SiteProvider";
import { EditProvider } from "@/components/edit/EditProvider";
import HomePage from "./HomePage";

/** Renders the portfolio for the active profile, or for `profileSlug` (/<slug>, e.g. /team/halong). */
export default async function PortfolioView({
  profileSlug,
  previewToken,
}: {
  profileSlug?: string;
  previewToken?: string;
}) {
  const { admin, preview, site } = await getPageData(profileSlug, previewToken);

  if (!site) {
    // A specific profile that doesn't exist or isn't public.
    if (profileSlug) notFound();
    return (
      <main className="flex items-center justify-center min-h-screen p-10 text-center bg-gray-900">
        <div className="max-w-2xl space-y-6 text-2xl text-gray-300">
          <h1 className="text-4xl font-semibold text-main-orange">No content yet</h1>
          <p>
            There is no profile yet. Load the starter content with{" "}
            <code className="text-main-orange">bun run seed</code>, or create a profile in the CMS.
          </p>
          <Link href="/login" className="inline-block underline hover:text-main-orange">
            Sign in to set it up →
          </Link>
        </div>
      </main>
    );
  }

  // Maintenance mode: visitors get a holding page, admins keep working.
  if (site.settings.maintenance.enabled && !admin && !preview) {
    return (
      <main className="flex items-center justify-center min-h-screen p-10 text-center bg-gray-900">
        <div className="max-w-2xl space-y-6 text-2xl text-gray-300">
          <h1 className="text-4xl font-semibold text-main-orange">{site.profile.name}</h1>
          <p className="whitespace-pre-line">{site.settings.maintenance.message}</p>
        </div>
      </main>
    );
  }

  return (
    <SiteProvider data={site}>
      <EditProvider canEdit={Boolean(admin)}>
        <HomePage />
      </EditProvider>
    </SiteProvider>
  );
}
