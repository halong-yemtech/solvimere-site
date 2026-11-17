"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FiCheck, FiCornerUpLeft, FiEye, FiEyeOff, FiInbox, FiTrash2 } from "react-icons/fi";
import { deleteComments, deleteMessages, setCommentsApproved, setMessagesHandled } from "@/lib/dashboard/actions";

interface Message { id: number; name: string; email: string; message: string; handled: boolean; createdAt: string }
interface Comment { id: number; name: string; comment: string; approved: boolean; createdAt: string }

const fmt = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

export default function Inbox({ tab, messages, comments }: { tab: "messages" | "guestbook"; messages: Message[]; comments: Comment[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [selected, setSelected] = useState<number[]>([]);
  const [filter, setFilter] = useState<"all" | "open">("open");
  const [openId, setOpenId] = useState<number | null>(null);

  const act = (fn: () => Promise<{ ok: boolean; error?: string }>, ok: string) =>
    start(async () => {
      const res = await fn();
      if (!res.ok) return void toast.error(res.error ?? "Failed");
      toast.success(ok);
      setSelected([]);
      router.refresh();
    });

  const shownMessages = useMemo(() => (filter === "open" ? messages.filter((m) => !m.handled) : messages), [filter, messages]);
  const list = tab === "messages" ? shownMessages : comments;
  const allIds = list.map((x) => x.id);
  const toggle = (id: number) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const btn = "flex items-center gap-2 rounded-lg px-4 py-2 text-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40";
  const unread = messages.filter((m) => !m.handled).length;

  return (
    <div className="space-y-5">
      <nav className="flex gap-2" aria-label="Inbox">
        {([["messages", `Contact messages${unread ? ` (${unread} new)` : ""}`], ["guestbook", `Guest book (${comments.length})`]] as const).map(([key, label]) => (
          <Link key={key} href={`/dashboard/inbox?tab=${key}`} onClick={() => setSelected([])}
            className={`rounded-full px-5 py-2 text-xl ${tab === key ? "bg-main-orange text-gray-900 font-semibold" : "bg-gray-900 border border-gray-800 hover:border-gray-600"}`}>
            {label}
          </Link>
        ))}
      </nav>

      <div className="rounded-2xl bg-gray-900 border border-gray-800">
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-gray-800">
          <label className="flex items-center gap-2 text-lg">
            <input type="checkbox" className="h-5 w-5 accent-[rgb(var(--accent))]"
              checked={selected.length > 0 && selected.length === allIds.length}
              onChange={(e) => setSelected(e.target.checked ? allIds : [])} />
            {selected.length ? `${selected.length} selected` : "Select all"}
          </label>
          {tab === "messages" ? (
            <>
              <div className="flex rounded-lg bg-gray-800 p-1 text-lg">
                {(["open", "all"] as const).map((f) => (
                  <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-md ${filter === f ? "bg-gray-600 text-white" : "text-gray-400"}`}>
                    {f === "open" ? "Not handled" : "All"}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 ml-auto">
                <button className={btn} disabled={!selected.length || pending} onClick={() => act(() => setMessagesHandled(selected, true), "Marked as handled")}><FiCheck /> Mark handled</button>
                <button className={btn} disabled={!selected.length || pending} onClick={() => act(() => setMessagesHandled(selected, false), "Marked as not handled")}><FiInbox /> Mark new</button>
                <button className={`${btn} text-red-400`} disabled={!selected.length || pending}
                  onClick={() => confirm(`Delete ${selected.length} message(s)?`) && act(() => deleteMessages(selected), "Deleted")}><FiTrash2 /> Delete</button>
              </div>
            </>
          ) : (
            <div className="flex flex-wrap gap-2 ml-auto">
              <button className={btn} disabled={!selected.length || pending} onClick={() => act(() => setCommentsApproved(selected, true), "Shown on the site")}><FiEye /> Show</button>
              <button className={btn} disabled={!selected.length || pending} onClick={() => act(() => setCommentsApproved(selected, false), "Hidden from the site")}><FiEyeOff /> Hide</button>
              <button className={`${btn} text-red-400`} disabled={!selected.length || pending}
                onClick={() => confirm(`Delete ${selected.length} comment(s)?`) && act(() => deleteComments(selected), "Deleted")}><FiTrash2 /> Delete</button>
            </div>
          )}
        </div>

        {list.length === 0 && <p className="px-6 py-10 text-xl text-gray-500 text-center">Nothing here.</p>}
        <ul className="divide-y divide-gray-800">
          {tab === "messages" && shownMessages.map((m) => (
            <li key={m.id} className={`px-5 py-4 ${m.handled ? "" : "bg-main-orange/[0.04]"}`}>
              <div className="flex items-start gap-4">
                <input type="checkbox" aria-label={`Select message from ${m.name}`} checked={selected.includes(m.id)} onChange={() => toggle(m.id)}
                  className="mt-1.5 h-5 w-5 accent-[rgb(var(--accent))]" />
                <button className="flex-1 min-w-0 text-left" onClick={() => setOpenId(openId === m.id ? null : m.id)}>
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <span className={`text-xl ${m.handled ? "text-gray-300" : "text-white font-semibold"}`}>{m.name}</span>
                    <span className="text-lg text-gray-500">{m.email}</span>
                    {!m.handled && <span className="text-base text-main-orange">new</span>}
                    <span className="ml-auto text-lg text-gray-500">{fmt.format(new Date(m.createdAt))}</span>
                  </div>
                  <p className={`mt-1 text-xl text-gray-400 ${openId === m.id ? "whitespace-pre-wrap" : "truncate"}`}>{m.message}</p>
                </button>
              </div>
              {openId === m.id && (
                <div className="mt-3 ml-9 flex flex-wrap gap-2">
                  <a className={btn} href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message")}`}><FiCornerUpLeft /> Reply by email</a>
                  <button className={btn} disabled={pending} onClick={() => act(() => setMessagesHandled([m.id], !m.handled), m.handled ? "Marked as new" : "Marked as handled")}>
                    <FiCheck /> {m.handled ? "Mark new" : "Mark handled"}
                  </button>
                </div>
              )}
            </li>
          ))}
          {tab === "guestbook" && comments.map((c) => (
            <li key={c.id} className="px-5 py-4 flex items-start gap-4">
              <input type="checkbox" aria-label={`Select comment from ${c.name}`} checked={selected.includes(c.id)} onChange={() => toggle(c.id)}
                className="mt-1.5 h-5 w-5 accent-[rgb(var(--accent))]" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <span className="text-xl text-gray-200">{c.name}</span>
                  <span className={`text-base ${c.approved ? "text-green-400" : "text-gray-500"}`}>{c.approved ? "shown" : "hidden"}</span>
                  <span className="ml-auto text-lg text-gray-500">{fmt.format(new Date(c.createdAt))}</span>
                </div>
                <p className="mt-1 text-xl text-gray-400 whitespace-pre-wrap">{c.comment}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
