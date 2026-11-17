"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { FiCheck, FiEdit3, FiEye, FiGrid, FiLayout, FiRotateCcw, FiSettings, FiX } from "react-icons/fi";
import { useSiteOptional } from "../SiteProvider";
import { discard, publish } from "@/lib/edit/actions";
import { useEdit } from "./EditProvider";
import ProfileSwitcher from "./ProfileSwitcher";

/** Floating toolbar shown to logged-in editors. */
export default function EditBar() {
  const { editing, setEditing, pending, refresh, openDrawer, busy, surface } = useEdit();
  const [open, setOpen] = useState(false);
  const site = useSiteOptional();
  const [working, setWorking] = useState<null | "publish" | "discard">(null);

  async function onPublish() {
    setWorking("publish");
    const res = await publish();
    setWorking(null);
    if (!res.ok) return toast.error(res.error);
    toast.success(`Published ${res.data.published} change${res.data.published === 1 ? "" : "s"}`);
    setOpen(false);
    refresh();
  }

  async function onDiscard() {
    if (!confirm("Discard all unpublished changes? New items that were never published will be deleted.")) return;
    setWorking("discard");
    const res = await discard();
    setWorking(null);
    if (!res.ok) return toast.error(res.error);
    toast.success("Unpublished changes discarded");
    setOpen(false);
    refresh();
  }

  const count = pending.length;

  return (
    <div className="fixed z-[60] bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-xl">
      {open && count > 0 && (
        <div className="w-[34rem] max-w-[92vw] max-h-[40vh] overflow-y-auto rounded-xl bg-gray-900/95 border border-gray-700 shadow-2xl p-4 text-gray-300">
          <p className="mb-3 text-lg uppercase tracking-wider text-gray-500">Unpublished changes</p>
          <ul className="space-y-1">
            {pending.map((p) => (
              <li key={JSON.stringify(p.target)}>
                <button
                  onClick={() => openDrawer(p.target)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-800 flex justify-between gap-4"
                >
                  <span className="truncate">{p.label}</span>
                  <span className="shrink-0 text-gray-500">
                    {p.group}
                    {p.isNew && <span className="ml-2 text-main-orange">new</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center gap-1 rounded-full bg-gray-900/95 border border-gray-700 shadow-2xl px-2 py-2 text-gray-300 backdrop-blur">
        {surface === "dashboard" ? (
          <Link href="/" className="flex items-center gap-2 rounded-full px-5 py-3 hover:bg-gray-800">
            <FiEye /> View site
          </Link>
        ) : (
        <button
          onClick={() => setEditing(!editing)}
          className={`flex items-center gap-2 rounded-full px-5 py-3 transition-colors ${
            editing ? "bg-main-orange text-gray-900 font-semibold" : "hover:bg-gray-800"
          }`}
          title="Toggle edit mode (shows edit controls on the page)"
        >
          {editing ? <FiEdit3 /> : <FiEye />}
          {editing ? "Editing" : "Edit page"}
        </button>
        )}

        <button
          onClick={() => setOpen((o) => !o)}
          disabled={count === 0}
          className="rounded-full px-4 py-3 hover:bg-gray-800 disabled:opacity-50 disabled:hover:bg-transparent"
          title="Unpublished changes"
        >
          {busy ? "Saving…" : count === 0 ? "All published" : `${count} unpublished`}
        </button>

        {count > 0 && (
          <>
            <button
              onClick={onPublish}
              disabled={working !== null}
              className="flex items-center gap-2 rounded-full px-5 py-3 bg-green-600/90 text-white hover:bg-green-500 disabled:opacity-60"
            >
              <FiCheck /> {working === "publish" ? "Publishing…" : "Publish"}
            </button>
            <button
              onClick={onDiscard}
              disabled={working !== null}
              className="rounded-full p-3 hover:bg-gray-800 disabled:opacity-60"
              title="Discard unpublished changes"
            >
              <FiRotateCcw />
            </button>
          </>
        )}

        <span className="w-px h-8 bg-gray-700 mx-1" />
        <ProfileSwitcher />
        <button
          onClick={() => openDrawer({ kind: "global", slug: "site-settings", title: "Site settings" })}
          className="rounded-full p-3 hover:bg-gray-800"
          title="Site settings (sections, colors, maintenance)"
        >
          <FiSettings />
        </button>
        {surface === "site" && site && (
          <Link href={`/dashboard/profiles/${site.profile.id}`} className="rounded-full p-3 hover:bg-gray-800"
            title={`Open the workspace of “${site.profile.name}” (everything for this profile)`}>
            <FiLayout />
          </Link>
        )}
        <Link href="/dashboard" className="rounded-full p-3 hover:bg-gray-800" title="Dashboard">
          <FiGrid />
        </Link>
        {open && (
          <button onClick={() => setOpen(false)} className="rounded-full p-3 hover:bg-gray-800" title="Close">
            <FiX />
          </button>
        )}
      </div>
    </div>
  );
}
