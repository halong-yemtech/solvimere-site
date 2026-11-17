import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import { getPayloadClient } from "@/lib/site";
import LoginForm from "@/components/auth/LoginForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in" };

type Props = { searchParams: Promise<{ redirect?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const payload = await getPayloadClient();
  // Fresh install: create the first admin instead.
  if ((await payload.count({ collection: "users" })).totalDocs === 0) redirect("/setup");
  const { redirect: to } = await searchParams;
  if (await getAdminUser()) redirect(to?.startsWith("/") && !to.startsWith("//") ? to : "/dashboard");
  return <LoginForm redirect={to ?? null} />;
}
