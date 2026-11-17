"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiRotateCcw, FiSave } from "react-icons/fi";
import { loadForEdit, saveDoc } from "@/lib/edit/actions";
import type { EditTarget, FieldSchema } from "@/lib/edit/types";
import { useEdit } from "./EditProvider";
import { Fields } from "./FieldRenderer";
import { missingRequired, normalize } from "./formUtils";

type Values = Record<string, unknown>;

/**
 * The same editor as the drawer (FieldRenderer + the same validation and
 * save action), rendered inline. `tabs` picks which of the document's tabs to
 * show, so one form can cover a single section of a profile.
 */
export default function DocForm({
  target,
  tabs: only,
  compact = false,
}: {
  target: EditTarget;
  tabs?: string[];
  compact?: boolean;
}) {
  const { refresh, pending } = useEdit();
  const [schema, setSchema] = useState<FieldSchema[] | null>(null);
  const [values, setValues] = useState<Values>({});
  const [initial, setInitial] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const dirty = schema !== null && JSON.stringify(values) !== initial;

  const load = useCallback(async () => {
    const res = await loadForEdit(target);
    if (!res.ok) return setError(res.error);
    setSchema(res.data.schema);
    const v = res.data.doc ?? {};
    setValues(v);
    setInitial(JSON.stringify(v));
  }, [target]);

  useEffect(() => void load(), [load]);
  // Changes saved elsewhere (drawer, publish, discard): reload unless there are unsaved edits here.
  useEffect(() => {
    if (!dirty) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  // Warn before leaving the page with unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  async function save() {
    if (!schema || saving) return;
    const missing = missingRequired(schema, values);
    if (missing.length)
      return toast.error(`Please fill in: ${missing.slice(0, 4).join(", ")}${missing.length > 4 ? "…" : ""}`);
    setSaving(true);
    const res = await saveDoc(target, normalize(schema, values));
    setSaving(false);
    if (!res.ok) return toast.error(res.error);
    toast.success("Saved as draft");
    setInitial(JSON.stringify(values));
    refresh();
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (dirty && (e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        void save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (error) return <p className="text-xl text-red-400">{error}</p>;
  if (!schema) return <p className="text-xl text-gray-500">Loading…</p>;

  const allTabs = schema.length === 1 && schema[0].type === "tabs" ? schema[0].tabs : null;
  const sections = allTabs
    ? allTabs.filter((t) => !only || only.some((o) => o.toLowerCase() === t.label.toLowerCase()))
    : [{ label: "", description: undefined, fields: schema }];

  return (
    <div className="space-y-8">
      {sections.map((t) => (
        <section key={t.label}>
          {!compact && sections.length > 1 && <h3 className="mb-1 text-2xl font-semibold text-gray-200">{t.label}</h3>}
          {t.description && <p className="mb-5 text-lg text-gray-500">{t.description}</p>}
          <Fields schema={t.fields} values={values} onChange={setValues} />
        </section>
      ))}

      <div
        className={`sticky bottom-28 z-10 flex items-center justify-end gap-3 rounded-xl border px-4 py-3 transition-colors ${dirty ? "border-main-orange/60 bg-gray-900/95 shadow-xl" : "border-gray-800 bg-gray-900/80"}`}
      >
        <span className="mr-auto text-lg text-gray-500">{dirty ? "Unsaved changes" : "All changes saved"}</span>
        {dirty && (
          <button
            onClick={() => {
              setValues(JSON.parse(initial));
            }}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-lg hover:bg-gray-800"
          >
            <FiRotateCcw /> Undo
          </button>
        )}
        <button
          onClick={save}
          disabled={!dirty || saving}
          className="flex items-center gap-2 rounded-lg bg-main-orange px-5 py-2 text-lg font-semibold text-gray-900 disabled:opacity-40"
        >
          <FiSave /> {saving ? "Saving…" : "Save draft"}
        </button>
      </div>
    </div>
  );
}
