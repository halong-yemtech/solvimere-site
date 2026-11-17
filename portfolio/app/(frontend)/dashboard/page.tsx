import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { activeProfileWorkspace, getInboxCounts } from "@/lib/dashboard";
import { getSiteData } from "@/lib/site";
import Card from "@/components/dashboard/Card";
import PendingCard from "@/components/dashboard/PendingCard";

export default async function DashboardOverview() {
  const user = await requireAdmin();
  const [counts, site, workspace] = await Promise.all([getInboxCounts(user), getSiteData(true), activeProfileWorkspace(user)]);

  const stats = [
    { label: "New messages", value: counts.unhandledMessages, href: "/dashboard/inbox" },
    { label: "Guestbook comments", value: counts.guestbook, href: "/dashboard/inbox?tab=guestbook" },
    { label: "Works (active profile)", value: site?.works.length ?? 0, href: `${workspace}?tab=works` },
    { label: "Media files", value: counts.media, href: "/dashboard/media" },
  ];

  return (
    <div className="max-w-[110rem] space-y-8">
      <header>
        <p className="text-xl text-gray-500">Welcome back{site?.profile.name ? `, ${site.profile.name.split(" ")[0]}` : ""}</p>
        <h1 className="text-[3.2rem] font-semibold text-gray-100">Dashboard</h1>
      </header>

      <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <li key={s.label}>
            <Link href={s.href} className="block rounded-2xl bg-gray-800 px-8 py-6 hover:ring-2 hover:ring-main-orange/60">
              <p className="text-[3rem] font-semibold text-white">{s.value}</p>
              <p className="text-xl text-gray-400 capitalize">{s.label}</p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="grid gap-8 xl:grid-cols-[2fr_1fr]">
        <PendingCard />
        <Card title="Quick links">
          <ul className="space-y-3 text-xl">
            <li><Link href="/" className="hover:text-main-orange">Edit the site in place →</Link></li>
            <li><Link href={workspace} className="hover:text-main-orange">Open the active profile&apos;s workspace →</Link></li>
            <li><Link href="/dashboard/profiles" className="hover:text-main-orange">All profiles →</Link></li>
            <li><Link href={`${workspace}?tab=cv`} className="hover:text-main-orange">Preview the CV →</Link></li>
            <li><Link href="/dashboard/users" className="hover:text-main-orange">Manage users →</Link></li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
