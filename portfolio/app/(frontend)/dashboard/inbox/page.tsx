import { requireAdmin } from "@/lib/auth";
import { getPayloadClient } from "@/lib/site";
import Inbox from "@/components/dashboard/Inbox";

export const metadata = { title: "Inbox" };

type Props = { searchParams: Promise<{ tab?: string }> };

export default async function InboxPage({ searchParams }: Props) {
  const user = await requireAdmin();
  const payload = await getPayloadClient();
  const [messages, comments] = await Promise.all([
    payload.find({ collection: "contact-messages", sort: "-createdAt", limit: 500, pagination: false, depth: 0, user, overrideAccess: false }),
    payload.find({ collection: "guestbook-entries", sort: "-createdAt", limit: 500, pagination: false, depth: 0, user, overrideAccess: false }),
  ]);
  const tab = (await searchParams).tab === "guestbook" ? "guestbook" : "messages";
  return (
    <div className="max-w-[130rem] space-y-6">
      <header>
        <h1 className="text-[3.2rem] font-semibold text-gray-100">Inbox</h1>
        <p className="text-xl text-gray-500">Messages from the contact form and comments in the guest book.</p>
      </header>
      <Inbox
        tab={tab}
        messages={messages.docs.map((m) => ({ id: m.id, name: m.fullName, email: m.email, message: m.message, handled: Boolean(m.handled), createdAt: m.createdAt }))}
        comments={comments.docs.map((c) => ({ id: c.id, name: c.name, comment: c.comment, approved: c.approved !== false, createdAt: c.createdAt }))}
      />
    </div>
  );
}
