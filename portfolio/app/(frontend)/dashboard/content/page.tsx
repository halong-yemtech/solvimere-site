import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { activeProfileWorkspace } from "@/lib/dashboard";

/** Content is managed per profile now: open the active profile's workspace. */
export default async function ContentPage() {
  const user = await requireAdmin();
  redirect(await activeProfileWorkspace(user));
}
