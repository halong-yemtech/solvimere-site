import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getSiteData } from "@/lib/site";
import { listProfiles } from "@/lib/edit/actions";
import ProfileWorkspace from "@/components/dashboard/ProfileWorkspace";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> };

/** Everything for one profile, in one place. */
export default async function ProfileWorkspacePage({ params, searchParams }: Props) {
  await requireAdmin();
  const id = Number((await params).id);
  const res = await listProfiles();
  const summary = res.ok ? res.data.find((p) => p.id === id) : undefined;
  if (!summary) notFound();

  // Latest drafts, as the site would render this profile.
  const site = await getSiteData(true, summary.slug);
  const pr = site?.profile;
  const checklist = [
    { label: "Name and job title", ok: Boolean(pr?.name && pr.jobTitle), section: "identity" },
    { label: "Profile photo", ok: Boolean(pr?.avatar), section: "identity" },
    { label: "At least one account under Links & accounts", ok: Boolean(site?.links.length), section: "links" },
    { label: "Hire button points to an account", ok: Boolean(pr?.hireLink), section: "identity" },
    { label: "Bio", ok: Boolean(pr?.bio?.trim()), section: "about" },
    { label: "Email address", ok: Boolean(pr?.email), section: "contact" },
    { label: "Resume entries", ok: Boolean(site?.resume.length), section: "resume" },
    { label: "Works", ok: Boolean(site?.works.length), section: "works" },
    { label: "Search description (SEO)", ok: Boolean(pr?.metaDescription), section: "seo" },
  ];

  return (
    <div className="max-w-[150rem]">
      <ProfileWorkspace
        summary={summary}
        checklist={checklist}
        initialTab={(await searchParams).tab ?? "overview"}
        cv={site ? {
          profile: { id: site.profile.id, slug: site.profile.slug, name: site.profile.name, isActive: site.profile.isActive, mode: site.profile.cv.mode, cvUrl: site.profile.cvUrl },
          resume: site.resume.map((r) => ({ id: r.id, type: r.type, title: r.title, subtitle: r.subtitle, period: r.period })),
        } : null}
      />
    </div>
  );
}
