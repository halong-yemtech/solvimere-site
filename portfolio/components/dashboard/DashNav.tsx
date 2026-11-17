"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiGrid, FiImage, FiInbox, FiLogOut, FiSliders, FiUser, FiUsers } from "react-icons/fi";
import { BsPersonVcard } from "react-icons/bs";
import { useEdit } from "../edit/EditProvider";
import { withBase } from "@/lib/basePath";

const links = [
  { href: "/dashboard", label: "Overview", Icon: FiGrid },
  { href: "/dashboard/inbox", label: "Inbox", Icon: FiInbox, badge: "inbox" as const },
  { href: "/dashboard/profiles", label: "Profiles", Icon: BsPersonVcard },
  { href: "/dashboard/media", label: "Media", Icon: FiImage },
  { href: "/dashboard/users", label: "Users", Icon: FiUsers },
];

async function logout() {
  await fetch(withBase("/api/users/logout"), { method: "POST", credentials: "include" }).catch(() => {});
  window.location.assign(withBase("/login"));
}

export default function DashNav({ email, unread }: { email: string; unread: number }) {
  const path = usePathname();
  const { openDrawer } = useEdit();
  const item = "relative flex lg:flex-col items-center justify-center gap-2 lg:gap-1.5 h-20 lg:h-[6.6rem] px-4 rounded-lg bg-gray-900 transition-colors shrink-0";
  const active = (href: string) => (href === "/dashboard" ? path === href : path.startsWith(href));

  return (
    <aside className="lg:w-[11rem] shrink-0 p-4 lg:p-6 lg:sticky lg:top-0 lg:h-screen flex lg:flex-col gap-2.5 overflow-x-auto lg:overflow-y-auto">
      <Link href="/" className={`${item} hover:text-main-orange`} title="Back to the site">
        <span className="grid place-items-center w-12 h-12 rounded-xl bg-main-orange text-gray-900 text-2xl font-bold">P</span>
      </Link>
      {links.map(({ href, label, Icon, badge }) => (
        <Link key={href} href={href} className={`${item} ${active(href) ? "text-main-orange" : "hover:text-main-orange"}`}
          aria-current={active(href) ? "page" : undefined}>
          <Icon className="text-[2rem]" />
          <span className="uppercase text-base font-medium">{label}</span>
          {badge && unread > 0 && (
            <span className="absolute top-2 right-2 min-w-6 h-6 px-1.5 grid place-items-center rounded-full bg-main-orange text-gray-900 text-sm font-bold">
              {unread}
            </span>
          )}
        </Link>
      ))}
      <button className={`${item} hover:text-main-orange`} onClick={() => openDrawer({ kind: "global", slug: "site-settings" })}>
        <FiSliders className="text-[2rem]" />
        <span className="uppercase text-base font-medium">Site</span>
      </button>
      <div className="lg:mt-auto flex lg:flex-col gap-2.5">
        <Link href="/dashboard/account" className={`${item} ${active("/dashboard/account") ? "text-main-orange" : "hover:text-main-orange"}`} title={email}>
          <FiUser className="text-[2rem]" />
          <span className="uppercase text-base font-medium">Account</span>
        </Link>
        <button onClick={logout} className={`${item} hover:text-red-400`}>
          <FiLogOut className="text-[2rem]" />
          <span className="uppercase text-base font-medium">Log out</span>
        </button>
      </div>
    </aside>
  );
}
