import { redirect } from "next/navigation";
import { getPayloadClient } from "@/lib/site";
import SetupForm from "@/components/auth/SetupForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Set up" };

/** Only available while there are no users at all. */
export default async function SetupPage() {
  const payload = await getPayloadClient();
  if ((await payload.count({ collection: "users" })).totalDocs > 0) redirect("/login");
  return <SetupForm />;
}
