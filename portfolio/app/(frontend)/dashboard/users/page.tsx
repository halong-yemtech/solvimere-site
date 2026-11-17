import { requireAdmin } from "@/lib/auth";
import { getPayloadClient } from "@/lib/site";
import UsersManager from "@/components/dashboard/UsersManager";

export const metadata = { title: "Users" };

export default async function UsersPage() {
  const me = await requireAdmin();
  const payload = await getPayloadClient();
  const res = await payload.find({
    collection: "users",
    sort: "email",
    limit: 500,
    pagination: false,
    depth: 0,
    user: me,
    overrideAccess: false,
  });
  return (
    <div className="max-w-[110rem] space-y-6">
      <header>
        <h1 className="text-[3.2rem] font-semibold text-gray-100">Users</h1>
        <p className="text-xl text-gray-500">
          Admins can sign in and edit the site. Users with the “user” role have no access to editing.
        </p>
      </header>
      <UsersManager
        meId={me.id}
        users={res.docs.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.name ?? "",
          role: u.role === "admin" ? "admin" : "user",
          locked: Boolean(u.lockUntil && new Date(u.lockUntil) > new Date()),
          createdAt: u.createdAt,
        }))}
      />
    </div>
  );
}
