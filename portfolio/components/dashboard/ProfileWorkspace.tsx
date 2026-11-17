"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  FiAlertCircle, FiArrowLeft, FiCheck, FiCheckCircle, FiCopy, FiEdit2, FiExternalLink, FiEye, FiEyeOff, FiRotateCcw,
  FiTrash2, FiUploadCloud,
} from "react-icons/fi";
import {
  deleteItem, discard, duplicateProfile, getPendingChanges, listProfileItems, publish, setActiveProfile,
  type ProfileItemList, type ProfileSummary,
} from "@/lib/edit/actions";
import type { EditTarget, PendingChange } from "@/lib/edit/types";
import { useEdit } from "../edit/EditProvider";
import { SectionTools } from "../edit/Editable";
import DocForm from "../edit/DocForm";
import CvStudio from "./CvStudio";
import Card from "./Card";
import { profilePath, withBase } from "@/lib/basePath";

type ListSlug = ProfileItemList["slug"];

/** Sections of a profile: which of its own tabs to edit inline, and which item lists it owns. */
const SECTIONS: { key: string; label: string; tabs?: string[]; lists?: ListSlug[]; hint?: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "identity", label: "Identity", tabs: ["Profile", "Profile card"], hint: "Name, photo, titles, the hire button and how the profile is shared." },
  { key: "links", label: "Links & accounts", tabs: ["Links & accounts"], hint: "The only place external links are stored. Everything else picks one of these accounts." },
  { key: "about", label: "About", tabs: ["About me", "Quote"], lists: ["facts", "services", "pricing-plans", "clients", "testimonials"] },
  { key: "contact", label: "Contact", tabs: ["Contact"] },
  { key: "resume", label: "Resume & skills", tabs: ["Skills"], lists: ["resume-entries"] },
  { key: "works", label: "Works", lists: ["works", "work-categories"] },
  { key: "blog", label: "Blog", tabs: ["Blog section"], lists: ["blog-posts"] },
  { key: "stats", label: "Stats", lists: ["statistics"] },
  { key: "cv", label: "CV", tabs: ["CV"] },
  { key: "seo", label: "SEO", tabs: ["SEO"] },
];

export interface WorkspaceProps {
  summary: ProfileSummary;
  checklist: { label: string; ok: boolean; section: string }[];
  cv: {
    profile: { id: number; slug: string; name: string; isActive: boolean; mode: "generated" | "uploaded"; cvUrl: string | null };
    resume: { id: number; type: "experience" | "education"; title: string; subtitle: string; period: string }[];
  } | null;
  initialTab: string;
}

export default function ProfileWorkspace({ summary: p, checklist, cv, initialTab }: WorkspaceProps) {
  const router = useRouter();
  const { openDrawer, refresh, pending: allPending } = useEdit();
  const [tab, setTab] = useState(SECTIONS.some((s) => s.key === initialTab) ? initialTab : "overview");
  const [lists, setLists] = useState<ProfileItemList[] | null>(null);
  const [pending, setPending] = useState<PendingChange[]>([]);
  const [busy, setBusy] = useState(false);
  const target = useMemo<EditTarget>(() => ({ kind: "collection", slug: "profiles", id: p.id }), [p.id]);
  const section = SECTIONS.find((s) => s.key === tab)!;

  const load = useCallback(async () => {
    const [l, pc] = await Promise.all([listProfileItems(p.id), getPendingChanges(p.id)]);
    if (l.ok) setLists(l.data);
    else toast.error(l.error);
    if (pc.ok) setPending(pc.data);
  }, [p.id]);
  // Reload whenever drafts change anywhere (forms, drawers, publish, discard).
  useEffect(() => void load(), [load, allPending]);

  const go = (key: string) => {
    setTab(key);
    window.history.replaceState(null, "", `?tab=${key}`);
  };

  async function act<T>(fn: () => Promise<{ ok: true; data: T } | { ok: false; error: string }>, ok: string, after?: (data: T) => void) {
    setBusy(true);
    const res = await fn();
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    toast.success(ok);
    refresh();
    void load();
    after?.(res.data);
  }

  const liveUrl = withBase(profilePath(p.slug));
  const btn = "flex items-center gap-2 rounded-lg px-4 py-2 text-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40";
  const counts = new Map(lists?.map((l) => [l.slug, l.items.length]));

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="rounded-2xl bg-gray-900 border border-gray-800 p-6">
        <Link href="/dashboard/profiles" className="inline-flex items-center gap-2 text-lg text-gray-500 hover:text-main-orange">
          <FiArrowLeft /> All profiles
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-5">
          {p.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.avatarUrl} alt="" className="w-20 h-20 rounded-full object-cover bg-gray-800" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-800" />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[2.8rem] leading-tight font-semibold text-gray-100 truncate">{p.name || p.internalName}</h1>
              {p.isActive && <span className="rounded-full bg-main-orange text-gray-900 px-3 py-0.5 text-base font-semibold">Active · shown at /</span>}
              <span className="rounded-full border border-gray-700 px-3 py-0.5 text-base text-gray-400 flex items-center gap-1.5">
                {p.visibility === "public" ? <FiEye /> : <FiEyeOff />} {p.visibility}
              </span>
              {pending.length > 0 && (
                <span className="rounded-full border border-main-orange text-main-orange px-3 py-0.5 text-base">{pending.length} unpublished</span>
              )}
            </div>
            <p className="text-xl text-gray-500">{p.internalName} · {liveUrl}</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <a className={btn} href={liveUrl} target="_blank" rel="noreferrer"><FiExternalLink /> View site</a>
          <button className={`${btn} ${pending.length ? "!bg-green-700 hover:!bg-green-600 text-white" : ""}`} disabled={busy || !pending.length}
            onClick={() => act(() => publish(undefined, p.id), "Profile published")}>
            <FiUploadCloud /> Publish profile{pending.length ? ` (${pending.length})` : ""}
          </button>
          <button className={btn} disabled={busy || !pending.length}
            onClick={() => confirm("Discard this profile's unpublished changes?") && act(() => discard(undefined, p.id), "Changes discarded")}>
            <FiRotateCcw /> Discard
          </button>
          {!p.isActive && (
            <button className={btn} disabled={busy}
              onClick={() => act(() => setActiveProfile(p.id), "Now shown at /", () => router.refresh())}>
              <FiCheckCircle /> Make active
            </button>
          )}
          <button className={btn} disabled={busy}
            onClick={() => act(() => duplicateProfile(p.id), "Copied as a private draft", (d) => router.push(`/dashboard/profiles/${d.id}`))}>
            <FiCopy /> Duplicate
          </button>
          {!p.isActive && (
            <button className={`${btn} text-red-400 hover:!bg-red-950/60`} disabled={busy}
              onClick={() =>
                confirm(`Delete “${p.internalName}” and the ${p.items} item(s) it owns? This cannot be undone.`) &&
                act(() => deleteItem("profiles", p.id), "Profile deleted", () => router.push("/dashboard/profiles"))}>
              <FiTrash2 /> Delete
            </button>
          )}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        {/* ── Section nav ─────────────────────────────────── */}
        <nav aria-label="Profile sections" className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible lg:sticky lg:top-6 self-start -mx-1 px-1 pb-1">
          {SECTIONS.map((s) => {
            const n = s.lists?.reduce((sum, l) => sum + (counts.get(l) ?? 0), 0);
            const dirty = pending.some((c) =>
              s.lists?.includes(c.target.slug as ListSlug) || (s.key === "overview" ? false : c.target.slug === "profiles" && !!s.tabs));
            return (
              <button key={s.key} onClick={() => go(s.key)} aria-current={tab === s.key ? "page" : undefined}
                className={`shrink-0 flex items-center justify-between gap-3 rounded-lg px-4 py-3 text-xl text-left whitespace-nowrap ${
                  tab === s.key ? "bg-gray-800 text-main-orange" : "text-gray-300 hover:bg-gray-900"}`}>
                <span>{s.label}</span>
                <span className="flex items-center gap-2 text-base text-gray-500">
                  {n !== undefined && n > 0 && n}
                  {dirty && <span className="h-2 w-2 rounded-full bg-main-orange" title="Unpublished changes" />}
                </span>
              </button>
            );
          })}
        </nav>

        {/* ── Section body ────────────────────────────────── */}
        <div className="min-w-0 space-y-6">
          {section.hint && <p className="text-xl text-gray-500">{section.hint}</p>}

          {tab === "overview" && (
            <Overview checklist={checklist} lists={lists} pending={pending} go={go} sections={SECTIONS} openDrawer={openDrawer} />
          )}

          {tab === "cv" && cv && <CvStudio profile={cv.profile} resume={cv.resume} />}

          {section.tabs && (
            <Card title={section.key === "cv" ? "CV settings" : section.label}>
              <DocForm key={`${p.id}-${section.key}`} target={target} tabs={section.tabs} />
            </Card>
          )}

          {section.lists?.map((slug) => {
            const list = lists?.find((l) => l.slug === slug);
            return (
              <Card key={slug} title={`${list?.label ?? slug} (${list?.items.length ?? "…"})`}
                actions={list && <SectionTools slug={slug} title={list.singular.toLowerCase()} items={list.items} profileId={p.id} />}>
                {!list ? (
                  <p className="text-xl text-gray-500">Loading…</p>
                ) : list.items.length === 0 ? (
                  <p className="text-xl text-gray-500">Nothing yet — use Add.</p>
                ) : (
                  <ul className="divide-y divide-gray-800">
                    {list.items.map((i) => (
                      <li key={i.id}>
                        <button onClick={() => openDrawer({ kind: "collection", slug, id: i.id })}
                          className="w-full flex items-center justify-between gap-4 py-3 text-xl text-left hover:text-main-orange">
                          <span className="truncate">{i.label}</span>
                          <span className="flex shrink-0 items-center gap-3 text-base">
                            {i.status === "draft" && <span className="text-main-orange">draft</span>}
                            <FiEdit2 className="text-gray-500" />
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Overview({ checklist, lists, pending, go, sections, openDrawer }: {
  checklist: WorkspaceProps["checklist"];
  lists: ProfileItemList[] | null;
  pending: PendingChange[];
  go: (key: string) => void;
  sections: typeof SECTIONS;
  openDrawer: ReturnType<typeof useEdit>["openDrawer"];
}) {
  const done = checklist.filter((c) => c.ok).length;
  const sectionOf = (slug: string) => sections.find((s) => s.lists?.includes(slug as ListSlug))?.key ?? "overview";
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card title={`Checklist (${done}/${checklist.length})`}>
        <ul className="space-y-2">
          {checklist.map((c) => (
            <li key={c.label}>
              <button onClick={() => go(c.section)} className="flex w-full items-center gap-3 text-left text-xl hover:text-main-orange">
                {c.ok ? <FiCheck className="text-green-400 shrink-0" /> : <FiAlertCircle className="text-main-orange shrink-0" />}
                <span className={c.ok ? "text-gray-400" : "text-gray-200"}>{c.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Content">
        {!lists ? (
          <p className="text-xl text-gray-500">Loading…</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3">
            {lists.map((l) => (
              <li key={l.slug}>
                <button onClick={() => go(sectionOf(l.slug))}
                  className="w-full rounded-xl bg-gray-800/60 px-4 py-3 text-left hover:bg-gray-800">
                  <span className="block text-[2.2rem] leading-none font-semibold text-gray-100">{l.items.length}</span>
                  <span className="mt-1 block text-lg text-gray-400">{l.label}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title={`Unpublished changes (${pending.length})`} className="xl:col-span-2">
        {pending.length === 0 ? (
          <p className="text-xl text-gray-500">Everything on this profile is published.</p>
        ) : (
          <ul className="divide-y divide-gray-800">
            {pending.map((c) => (
              <li key={JSON.stringify(c.target)}>
                <button onClick={() => openDrawer(c.target as EditTarget)}
                  className="w-full flex items-center justify-between gap-4 py-3 text-xl text-left hover:text-main-orange">
                  <span className="truncate">{c.label}</span>
                  <span className="shrink-0 text-base text-gray-500">{c.group}{c.isNew ? " · new" : ""}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
