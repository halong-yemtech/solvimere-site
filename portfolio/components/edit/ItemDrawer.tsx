"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FiClock, FiRotateCcw, FiSave, FiTrash2, FiX } from "react-icons/fi";
import { createItem, deleteItem, listVersions, loadForEdit, restoreVersion, saveDoc } from "@/lib/edit/actions";
import type { DrawerTarget, EditTarget, FieldSchema, VersionItem } from "@/lib/edit/types";
import { useEdit } from "./EditProvider";
import { Fields } from "./FieldRenderer";
import { defaultsFor, missingRequired, normalize } from "./formUtils";

type Values = Record<string, unknown>;

const TITLES: Record<string, string> = {
  profile: "Profile & site",
  skills: "Skills",
  "site-settings": "Site settings",
};

export default function ItemDrawer({ target, onClose }: { target: DrawerTarget; onClose: () => void }) {
  const { refresh } = useEdit();
  const [schema, setSchema] = useState<FieldSchema[] | null>(null);
  const [values, setValues] = useState<Values>({});
  const [initial, setInitial] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState(0);
  const [showHistory, setShowHistory] = useState(false);

  const editTarget: EditTarget | null = target.kind === "new" ? null : (target as EditTarget);
  // Owner of a new list item: given explicitly, or via the `profile` default.
  const newOwner =
    target.kind === "new" ? (target.profileId ?? (Number(target.defaults?.profile) || undefined)) : undefined;
  const singular = (slug: string) => slug.replace(/-/g, " ").replace(/ies$/, "y").replace(/s$/, "");
  const title =
    target.title ??
    (target.kind === "global"
      ? TITLES[target.slug]
      : target.kind === "new"
        ? `New ${singular(target.slug)}`
        : singular(target.slug));

  useEffect(() => {
    const load =
      target.kind === "new"
        ? loadForEdit({ kind: "new", slug: target.slug, profileId: newOwner })
        : loadForEdit(
            target.kind === "collection"
              ? { kind: "collection", slug: target.slug, id: target.id }
              : { kind: "global", slug: target.slug },
          );
    void load.then((res) => {
      if (!res.ok) return setError(res.error);
      const v = res.data.doc ?? { ...defaultsFor(res.data.schema), ...(target.kind === "new" ? target.defaults : {}) };
      setSchema(res.data.schema);
      setValues(v);
      setInitial(JSON.stringify(v));
      const tabs = res.data.schema.length === 1 && res.data.schema[0].type === "tabs" ? res.data.schema[0].tabs : null;
      if (tabs && "tab" in target && target.tab) {
        const idx = tabs.findIndex((t) => t.label.toLowerCase() === target.tab!.toLowerCase());
        if (idx >= 0) setTab(idx);
      }
    });
  }, [target]);

  const dirty = schema !== null && JSON.stringify(values) !== initial;
  const tabs = schema && schema.length === 1 && schema[0].type === "tabs" ? schema[0].tabs : null;

  const close = () => {
    if (dirty && !confirm("Close without saving your changes?")) return;
    onClose();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        void save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  async function save() {
    if (!schema || saving) return;
    const missing = missingRequired(schema, values);
    if (missing.length)
      return toast.error(`Please fill in: ${missing.slice(0, 4).join(", ")}${missing.length > 4 ? "…" : ""}`);
    setSaving(true);
    const data = normalize(schema, values);
    const res =
      target.kind === "new" ? await createItem(target.slug, data, newOwner) : await saveDoc(editTarget!, data);
    setSaving(false);
    if (!res.ok) return toast.error(res.error);
    toast.success(target.kind === "new" ? "Added as a draft — publish to make it live" : "Saved as draft");
    refresh();
    onClose();
  }

  async function remove() {
    if (!editTarget || editTarget.kind !== "collection") return;
    if (!confirm("Delete this item? This takes effect immediately and cannot be undone.")) return;
    const res = await deleteItem(editTarget.slug, editTarget.id);
    if (!res.ok) return toast.error(res.error);
    toast.success("Deleted");
    refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[70] flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60" onClick={close} />
      <aside className="relative w-[60rem] max-w-full h-full flex flex-col bg-gray-900 border-l border-gray-700 shadow-2xl text-gray-300">
        <header className="flex items-center justify-between gap-4 px-8 py-6 border-b border-gray-800">
          <div className="min-w-0">
            <p className="text-base uppercase tracking-widest text-gray-500">
              {target.kind === "new" ? "Create" : "Edit"}
            </p>
            <h2 className="text-3xl font-semibold text-gray-100 truncate capitalize">{title}</h2>
          </div>
          <div className="flex items-center gap-1">
            {editTarget && (
              <button
                onClick={() => setShowHistory((h) => !h)}
                title="Version history"
                className={`p-3 rounded-full ${showHistory ? "bg-gray-800 text-main-orange" : "hover:bg-gray-800"}`}
              >
                <FiClock className="text-2xl" />
              </button>
            )}
            <button onClick={close} className="p-3 rounded-full hover:bg-gray-800" title="Close (Esc)">
              <FiX className="text-2xl" />
            </button>
          </div>
        </header>

        {tabs && !showHistory && (
          <nav className="flex gap-1 overflow-x-auto px-6 pt-4 border-b border-gray-800">
            {tabs.map((t, i) => (
              <button
                key={t.label}
                onClick={() => setTab(i)}
                className={`whitespace-nowrap px-4 py-3 text-xl border-b-2 -mb-px ${i === tab ? "border-main-orange text-main-orange" : "border-transparent text-gray-400 hover:text-gray-200"}`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        )}

        <div className="flex-1 overflow-y-auto px-8 py-6">
          {error && <p className="text-red-400 text-xl">{error}</p>}
          {!schema && !error && <p className="text-xl text-gray-500">Loading…</p>}
          {schema && showHistory && editTarget && (
            <History
              target={editTarget}
              onRestored={() => {
                refresh();
                onClose();
              }}
            />
          )}
          {schema &&
            !showHistory &&
            (tabs ? (
              <>
                {tabs[tab].description && <p className="mb-6 text-lg text-gray-500">{tabs[tab].description}</p>}
                <Fields schema={tabs[tab].fields} values={values} onChange={setValues} />
              </>
            ) : (
              <Fields schema={schema} values={values} onChange={setValues} />
            ))}
        </div>

        {!showHistory && (
          <footer className="flex items-center justify-between gap-4 px-8 py-5 border-t border-gray-800">
            {editTarget?.kind === "collection" ? (
              <button
                onClick={remove}
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-red-400 hover:bg-red-950/50"
              >
                <FiTrash2 /> Delete
              </button>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-3">
              <span className="text-base text-gray-500 hidden sm:inline">⌘/Ctrl + S</span>
              <button onClick={close} className="px-5 py-3 rounded-lg hover:bg-gray-800">
                Cancel
              </button>
              <button
                onClick={save}
                disabled={!schema || saving || (!dirty && target.kind !== "new")}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-main-orange text-gray-900 font-semibold disabled:opacity-50"
              >
                <FiSave /> {saving ? "Saving…" : target.kind === "new" ? "Add" : "Save draft"}
              </button>
            </div>
          </footer>
        )}
      </aside>
    </div>
  );
}

function History({ target, onRestored }: { target: EditTarget; onRestored: () => void }) {
  const [versions, setVersions] = useState<VersionItem[] | null>(null);
  const fmt = useMemo(() => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }), []);

  useEffect(() => {
    void listVersions(target).then((res) => (res.ok ? setVersions(res.data) : toast.error(res.error)));
  }, [target]);

  async function restore(v: VersionItem) {
    if (!confirm("Restore this version? It becomes a draft; publish to make it live.")) return;
    const res = await restoreVersion(target, v.id);
    if (!res.ok) return toast.error(res.error);
    toast.success("Version restored as a draft");
    onRestored();
  }

  if (!versions) return <p className="text-xl text-gray-500">Loading history…</p>;
  if (!versions.length) return <p className="text-xl text-gray-500">No history yet.</p>;
  return (
    <ul className="space-y-2">
      {versions.map((v, i) => (
        <li key={v.id} className="flex items-center justify-between gap-4 rounded-xl bg-gray-800/50 px-5 py-4">
          <div>
            <p className="text-xl text-gray-200">{fmt.format(new Date(v.updatedAt))}</p>
            <p className="text-base">
              <span className={v.status === "published" ? "text-green-400" : "text-main-orange"}>{v.status}</span>
              {i === 0 && <span className="ml-2 text-gray-500">current</span>}
            </p>
          </div>
          {i > 0 && (
            <button
              onClick={() => restore(v)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              <FiRotateCcw /> Restore
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
