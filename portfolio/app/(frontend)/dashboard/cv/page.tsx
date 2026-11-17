import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { activeProfileWorkspace } from "@/lib/dashboard";

type Props = { searchParams: Promise<{ profile?: string }> };

/** The CV lives in each profile's workspace now. */
export default async function CvPage({ searchParams }: Props) {
  const user = await requireAdmin();
  redirect(await activeProfileWorkspace(user, (await searchParams).profile, "cv"));
}
