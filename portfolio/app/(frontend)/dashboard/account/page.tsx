import { requireAdmin } from "@/lib/auth";
import AccountForm from "@/components/dashboard/AccountForm";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const me = await requireAdmin();
  return (
    <div className="max-w-[70rem] space-y-6">
      <header>
        <h1 className="text-[3.2rem] font-semibold text-gray-100">Your account</h1>
      </header>
      <AccountForm name={me.name ?? ""} email={me.email} />
    </div>
  );
}
