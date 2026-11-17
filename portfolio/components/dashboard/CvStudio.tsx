"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiDownload, FiEdit2, FiExternalLink, FiFileText, FiPlus, FiRefreshCw } from "react-icons/fi";
import { useEdit } from "../edit/EditProvider";
import Card from "./Card";
import { withBase } from "@/lib/basePath";

interface Props {
  /** When given (and more than one), a profile switcher is shown. */
  profiles?: { id: number; slug: string; internalName: string }[];
  profile: {
    id: number;
    slug: string;
    name: string;
    isActive: boolean;
    mode: "generated" | "uploaded";
    cvUrl: string | null;
  };
  resume: { id: number; type: "experience" | "education"; title: string; subtitle: string; period: string }[];
}

/** Live preview of a profile's generated PDF, with shortcuts to everything that feeds it. */
export default function CvStudio({ profiles, profile, resume }: Props) {
  const router = useRouter();
  const { openDrawer, pending } = useEdit();
  const [version, setVersion] = useState<"draft" | "published">("draft");
  const [nonce, setNonce] = useState(0);

  // Reload the preview whenever drafts change (drawer saves, publish, discard).
  useEffect(() => setNonce((n) => n + 1), [pending]);

  const base = withBase(`/cv/${profile.slug}`);
  const src = `${base}?${version === "draft" ? "draft=1&" : ""}v=${nonce}`;
  const publicUrl = base;
  const editProfile = (tab: string) =>
    openDrawer({ kind: "collection", slug: "profiles", id: profile.id, tab, title: `Profile: ${profile.name}` });
  const btn = "flex items-center gap-2 rounded-lg px-4 py-2 text-lg bg-gray-800 hover:bg-gray-700";

  return (
    <div className="grid gap-6 2xl:grid-cols-[1fr_44rem]">
      <section className="rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden flex flex-col min-h-[80vh]">
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-gray-800">
          {profiles && profiles.length > 1 && (
            <select
              value={profile.slug}
              onChange={(e) => {
                const p = profiles.find((x) => x.slug === e.target.value);
                if (p) router.push(`/dashboard/profiles/${p.id}?tab=cv`);
              }}
              className="rounded-lg bg-gray-800 border border-gray-700 px-4 py-2 text-xl text-gray-200"
              aria-label="Profile"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.slug}>
                  {p.internalName}
                </option>
              ))}
            </select>
          )}
          <div className="flex rounded-lg bg-gray-800 p-1 text-lg" role="tablist" aria-label="Version">
            {(["draft", "published"] as const).map((v) => (
              <button
                key={v}
                role="tab"
                aria-selected={version === v}
                onClick={() => setVersion(v)}
                className={`px-4 py-1.5 rounded-md capitalize ${version === v ? "bg-main-orange text-gray-900 font-semibold" : "text-gray-300"}`}
              >
                {v === "draft" ? "Latest (with drafts)" : "Published"}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 ml-auto">
            <button className={btn} onClick={() => setNonce((n) => n + 1)} title="Reload preview">
              <FiRefreshCw /> Refresh
            </button>
            <a className={btn} href={src} target="_blank" rel="noreferrer">
              <FiExternalLink /> Open
            </a>
            <a className={btn} href={`${src}&download=1`}>
              <FiDownload /> Download
            </a>
          </div>
        </div>
        <iframe key={src} src={src} title={`CV preview — ${profile.name}`} className="flex-1 w-full bg-gray-700" />
      </section>

      <div className="space-y-6">
        <Card title="Download CV button">
          <p className="text-xl text-gray-400">
            {profile.mode === "generated"
              ? "Visitors get this generated PDF."
              : "Visitors get the uploaded file (Profile card → CV / Resume file), not this PDF."}
          </p>
          <p className="mt-2 text-lg text-gray-500 break-all">
            Public link:{" "}
            <a
              href={profile.mode === "generated" ? publicUrl : (profile.cvUrl ?? "#")}
              target="_blank"
              rel="noreferrer"
              className="text-main-orange hover:underline"
            >
              {profile.mode === "generated" ? publicUrl : "uploaded file"}
            </a>
          </p>
          <button className={`${btn} mt-4`} onClick={() => editProfile("CV")}>
            <FiEdit2 /> Change in CV settings
          </button>
        </Card>

        <Card title="What's on the CV">
          <ul className="space-y-2 text-xl">
            <li>
              <button onClick={() => editProfile("CV")} className="flex items-center gap-2 hover:text-main-orange">
                <FiFileText /> Headline, location, summary & skills line
              </button>
            </li>
            <li>
              <button
                onClick={() => editProfile("Profile card")}
                className="flex items-center gap-2 hover:text-main-orange"
              >
                <FiFileText /> Name & job title
              </button>
            </li>
            <li>
              <button onClick={() => editProfile("Contact")} className="flex items-center gap-2 hover:text-main-orange">
                <FiFileText /> Email, phone, address
              </button>
            </li>
            <li>
              <button
                onClick={() => editProfile("Links & accounts")}
                className="flex items-center gap-2 hover:text-main-orange"
              >
                <FiFileText /> Links & accounts
              </button>
            </li>
            <li>
              <button onClick={() => editProfile("Skills")} className="flex items-center gap-2 hover:text-main-orange">
                <FiFileText /> Skills (when the skills line is empty)
              </button>
            </li>
          </ul>
        </Card>

        <Card
          title="Experience & education"
          actions={
            <button
              className="flex items-center gap-1.5 rounded-full border border-gray-600 px-4 py-1.5 text-lg hover:border-main-orange hover:text-main-orange"
              onClick={() =>
                openDrawer({
                  kind: "new",
                  slug: "resume-entries",
                  title: "New resume entry",
                  defaults: { type: "experience" },
                  profileId: profile.id,
                })
              }
            >
              <FiPlus /> Add
            </button>
          }
        >
          <ul className="divide-y divide-gray-800">
            {resume.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => openDrawer({ kind: "collection", slug: "resume-entries", id: r.id })}
                  className="w-full flex items-center justify-between gap-4 py-3 text-left hover:text-main-orange"
                >
                  <span className="min-w-0">
                    <span className="block text-xl truncate">
                      {r.type === "experience" ? r.subtitle || r.title : r.title}
                    </span>
                    <span className="block text-lg text-gray-500 truncate">
                      {r.type === "experience" ? r.title : r.subtitle} · {r.period}
                    </span>
                  </span>
                  <span className="shrink-0 text-base uppercase text-gray-500">{r.type}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-lg text-gray-500">
            Each line of a description becomes a bullet point. Entries belong to this profile.
          </p>
        </Card>
      </div>
    </div>
  );
}
