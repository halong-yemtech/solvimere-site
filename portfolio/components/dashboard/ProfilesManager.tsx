"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FiCheckCircle,
  FiCopy,
  FiEdit2,
  FiExternalLink,
  FiEye,
  FiEyeOff,
  FiFileText,
  FiLink,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import {
  deleteItem,
  duplicateProfile,
  listProfiles,
  saveDoc,
  setActiveProfile,
  type ProfileSummary,
} from "@/lib/edit/actions";
import Link from "next/link";
import { useEdit } from "../edit/EditProvider";
import { profilePath, withBase } from "@/lib/basePath";

export default function ProfilesManager() {
  const { openDrawer, refresh, pending } = useEdit();
  const [profiles, setProfiles] = useState<ProfileSummary[] | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(async () => {
    const res = await listProfiles();
    if (res.ok) setProfiles(res.data);
    else toast.error(res.error);
  }, []);
  // Reload whenever drafts change (drawer saves, publish, discard).
  useEffect(() => void load(), [load, pending]);

  async function act(id: number, fn: () => Promise<{ ok: boolean; error?: string }>, ok: string) {
    setBusy(id);
    const res = await fn();
    setBusy(null);
    if (!res.ok) return toast.error(res.error ?? "Failed");
    toast.success(ok);
    refresh();
    void load();
  }

  const link = (p: ProfileSummary) => `${window.location.origin}${withBase(profilePath(p.slug))}`;
  const btn = "flex items-center gap-2 rounded-lg px-3 py-2 text-lg hover:bg-gray-800 disabled:opacity-40";

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() =>
            openDrawer({ kind: "new", slug: "profiles", title: "New profile", defaults: { visibility: "private" } })
          }
          className="flex items-center gap-2 rounded-full px-6 py-3 bg-main-orange text-gray-900 font-semibold text-xl"
        >
          <FiPlus /> New profile
        </button>
      </div>

      {!profiles && <p className="text-xl text-gray-500">Loading…</p>}
      <ul className="grid gap-5 xl:grid-cols-2">
        {profiles?.map((p) => (
          <li
            key={p.id}
            className={`rounded-2xl bg-gray-900 border p-6 ${p.isActive ? "border-main-orange" : "border-gray-800"}`}
          >
            <div className="flex items-start gap-5">
              {p.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.avatarUrl} alt="" className="w-20 h-20 rounded-full object-cover bg-gray-800" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-800" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-2xl font-semibold text-gray-100 truncate">{p.internalName}</h3>
                  {p.isActive && (
                    <span className="rounded-full bg-main-orange text-gray-900 px-3 py-0.5 text-base font-semibold">
                      Active · shown at /
                    </span>
                  )}
                  {p.status === "draft" && (
                    <span className="rounded-full border border-main-orange text-main-orange px-3 py-0.5 text-base">
                      unpublished changes
                    </span>
                  )}
                </div>
                <p className="text-xl text-gray-400">{p.name}</p>
                <p className="mt-1 text-lg text-gray-500 flex items-center gap-2">
                  {p.visibility === "public" ? <FiEye /> : <FiEyeOff />}
                  {p.visibility === "public" ? "Public" : "Private (admins only)"} · {withBase(profilePath(p.slug))}
                </p>
                <p className="mt-1 text-lg text-gray-500">{p.items} item(s) — works, services, resume, posts…</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-1 border-t border-gray-800 pt-4 text-gray-300">
              <Link
                className={`${btn} !bg-main-orange !text-gray-900 font-semibold hover:!opacity-90`}
                href={`/dashboard/profiles/${p.id}`}
              >
                <FiEdit2 /> Open workspace
              </Link>
              <a className={btn} href={withBase(profilePath(p.slug))} target="_blank" rel="noreferrer">
                <FiExternalLink /> View
              </a>
              <a className={btn} href={`/dashboard/profiles/${p.id}?tab=cv`}>
                <FiFileText /> CV
              </a>
              <button
                className={btn}
                onClick={() => navigator.clipboard.writeText(link(p)).then(() => toast.success("Link copied"))}
              >
                <FiLink /> Copy link
              </button>
              {!p.isActive && (
                <button
                  className={btn}
                  disabled={busy === p.id}
                  onClick={() => act(p.id, () => setActiveProfile(p.id), `“${p.internalName}” is now shown at /`)}
                >
                  <FiCheckCircle /> Make active
                </button>
              )}
              <button
                className={btn}
                disabled={busy === p.id}
                onClick={() =>
                  act(
                    p.id,
                    () =>
                      saveDoc(
                        { kind: "collection", slug: "profiles", id: p.id },
                        { visibility: p.visibility === "public" ? "private" : "public" },
                      ),
                    "Visibility saved as draft — publish to apply",
                  )
                }
              >
                {p.visibility === "public" ? <FiEyeOff /> : <FiEye />} Make{" "}
                {p.visibility === "public" ? "private" : "public"}
              </button>
              <button
                className={btn}
                disabled={busy === p.id}
                onClick={() =>
                  act(p.id, () => duplicateProfile(p.id), "Copy (with all its content) created as a private draft")
                }
              >
                <FiCopy /> Duplicate
              </button>
              {!p.isActive && (
                <button
                  className={`${btn} text-red-400 hover:bg-red-950/50`}
                  disabled={busy === p.id}
                  onClick={() =>
                    confirm(`Delete “${p.internalName}” and the ${p.items} item(s) it owns? This cannot be undone.`) &&
                    act(p.id, () => deleteItem("profiles", p.id), "Profile deleted")
                  }
                >
                  <FiTrash2 /> Delete
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      <p className="text-lg text-gray-500">
        Each profile owns all of its content and links. Open a profile&apos;s workspace to manage everything for it in
        one place.
      </p>
    </div>
  );
}
