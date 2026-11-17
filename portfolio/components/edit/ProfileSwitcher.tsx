"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FiCheck, FiChevronUp, FiEyeOff, FiUser } from "react-icons/fi";
import { listProfiles, type ProfileSummary } from "@/lib/edit/actions";
import { useSiteOptional } from "../SiteProvider";
import { profilePath } from "@/lib/basePath";

/** Edit-bar menu: which profile is on screen, and links to view the others. */
export default function ProfileSwitcher() {
  const site = useSiteOptional();
  const [open, setOpen] = useState(false);
  const [profiles, setProfiles] = useState<ProfileSummary[] | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || profiles) return;
    void listProfiles().then((r) => r.ok && setProfiles(r.data));
  }, [open, profiles]);

  useEffect(() => {
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  if (!site) return null;
  const current = site.profile;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full px-4 py-3 hover:bg-gray-800 max-w-[18rem]"
        title="Profile shown on this page"
      >
        <FiUser className="shrink-0" />
        <span className="truncate">{current.name}</span>
        <FiChevronUp className={`shrink-0 transition-transform ${open ? "" : "rotate-180"}`} />
      </button>
      {open && (
        <div className="absolute bottom-full mb-3 left-0 w-[30rem] max-w-[90vw] rounded-xl bg-gray-900 border border-gray-700 shadow-2xl p-2">
          <p className="px-3 py-2 text-base uppercase tracking-wider text-gray-500">View profile</p>
          {!profiles && <p className="px-3 py-2 text-gray-500">Loading…</p>}
          {profiles?.map((p) => (
            <Link
              key={p.id}
              href={profilePath(p.slug)}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-gray-800"
            >
              <span className="truncate">
                {p.internalName}
                {p.isActive && <span className="ml-2 text-main-orange text-base">active</span>}
              </span>
              <span className="flex items-center gap-2 text-gray-500 shrink-0">
                {p.visibility === "private" && <FiEyeOff title="Private" />}
                {p.id === current.id && <FiCheck className="text-main-orange" />}
              </span>
            </Link>
          ))}
          <Link
            href="/dashboard/profiles"
            className="block mt-1 border-t border-gray-800 px-3 py-2 text-main-orange hover:underline"
          >
            Manage profiles →
          </Link>
        </div>
      )}
    </div>
  );
}
