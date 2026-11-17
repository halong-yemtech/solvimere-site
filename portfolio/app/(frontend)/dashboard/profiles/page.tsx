import { requireAdmin } from "@/lib/auth";
import ProfilesManager from "@/components/dashboard/ProfilesManager";

export default async function ProfilesPage() {
  await requireAdmin();
  return (
    <div className="max-w-[130rem] space-y-8">
      <header>
        <h1 className="text-[3.2rem] font-semibold text-gray-100">Profiles</h1>
        <p className="text-xl text-gray-500">
          Each profile is a complete identity for the site. The active one is shown at “/”; public ones also have their own link.
        </p>
      </header>
      <ProfilesManager />
    </div>
  );
}
