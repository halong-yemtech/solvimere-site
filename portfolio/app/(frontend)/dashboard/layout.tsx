import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { requireAdmin } from "@/lib/auth";
import { getInboxCounts } from "@/lib/dashboard";
import { EditProvider } from "@/components/edit/EditProvider";
import DashNav from "@/components/dashboard/DashNav";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Logged in without admin rights → home; not logged in → login.
  const user = await requireAdmin();

  return (
    <EditProvider canEdit surface="dashboard">
      <div className="min-h-screen bg-[#0b0f17] text-gray-300 lg:flex">
        <DashNav email={user.email} unread={(await getInboxCounts(user)).unhandledMessages} />
        <main className="flex-1 min-w-0 p-6 sm:p-10 pb-40">{children}</main>
      </div>
      <Toaster />
    </EditProvider>
  );
}
