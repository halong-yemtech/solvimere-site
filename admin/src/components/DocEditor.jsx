import { useCallback, useEffect, useState } from "react";
import {
  CircleDot,
  Contact,
  FileText,
  IdCard,
  LayoutList,
  Link2,
  Loader2,
  Mail,
  Newspaper,
  Palette,
  Plus,
  Quote,
  Save,
  Search,
  Sparkles,
  Undo2,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import { loadDoc, saveDoc } from "../portfolio/api";
import { Fields, defaultsFor, missingRequired, normalize } from "./SchemaForm";
import { Spinner } from "./Spinner";
import { toast } from "./Toast";

/** Icons for the editor tabs (labels come from portfolio/schemas.json). */
const TAB_ICONS = {
  "About me": UserRound,
  Appearance: Palette,
  "Blog section": Newspaper,
  CV: FileText,
  Contact: Mail,
  "Links & accounts": Link2,
  Maintenance: Wrench,
  Profile: IdCard,
  "Profile card": Contact,
  Quote: Quote,
  SEO: Search,
  Sections: LayoutList,
  Skills: Sparkles,
};

/**
 * Edit one portfolio document. `target`:
 *   { kind: "profile", id? }                      a profile (no id: new)
 *   { kind: "item", itemKind, profileId, id? }    a work, résumé entry, … (no id: new)
 *   { kind: "settings" }                          portfolio settings
 * Saving publishes immediately.
 */
export function DocEditor({
  target,
  onSaved,
  onCancel,
  compact = false,
  savedNotice = "Saved. Changes are live.",
  createdNotice,
}) {
  const [schema, setSchema] = useState(null);
  const [values, setValues] = useState({});
  const [initial, setInitial] = useState("{}");
  const [tab, setTab] = useState(0);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const isNew = target.kind !== "settings" && target.id == null;
  const dirty = schema !== null && JSON.stringify(values) !== initial;
  const key = JSON.stringify(target);

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await loadDoc(target);
      const doc = isNew ? { ...defaultsFor(res.schema), ...res.values } : res.values;
      setSchema(res.schema);
      setValues(doc);
      setInitial(JSON.stringify(doc));
    } catch (err) {
      setError(err.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    setSchema(null);
    setTab(0);
    load();
  }, [load]);

  // Don't lose unsaved edits on reload / tab close.
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  async function save(event) {
    event?.preventDefault();
    if (!schema || saving) return;
    const missing = missingRequired(schema, values);
    if (missing.length) {
      toast.error(`Please fill in: ${missing.slice(0, 5).join(", ")}${missing.length > 5 ? "…" : ""}`);
      return;
    }
    setSaving(true);
    try {
      const id = await saveDoc(target, normalize(schema, values));
      setInitial(JSON.stringify(values));
      toast.success(isNew ? createdNotice || (target.kind === "profile" ? "Profile created." : "Added.") : savedNotice);
      onSaved?.(id);
    } catch (err) {
      toast.error(/duplicate key.*slug/i.test(err.message) ? "Another profile already uses that address." : err);
    } finally {
      setSaving(false);
    }
  }

  if (error && !schema) return <p className="error">{error}</p>;
  if (!schema) return compact ? <Spinner inline size="sm" /> : <Spinner label="Loading editor…" />;

  const tabs = schema.length === 1 && schema[0].type === "tabs" ? schema[0].tabs : null;
  const shown = tabs ? tabs[Math.min(tab, tabs.length - 1)] : { label: "", fields: schema };

  return (
    <form className={`doc-editor ${compact ? "is-compact" : ""}`} onSubmit={save}>
      {tabs ? (
        <div className="doc-tabs" role="tablist">
          {tabs.map((t, i) => (
            <button
              key={t.label}
              type="button"
              role="tab"
              aria-selected={i === tab}
              className={i === tab ? "is-on" : ""}
              onClick={() => setTab(i)}
            >
              <TabIcon label={t.label} />
              {t.label}
            </button>
          ))}
        </div>
      ) : null}
      {shown.description ? <p className="sf-help">{shown.description}</p> : null}
      <Fields schema={shown.fields} values={values} onChange={setValues} />

      <div className={`doc-bar ${dirty ? "is-dirty" : ""}`}>
        <span>{dirty ? "Unsaved changes" : isNew ? "New" : "All changes saved"}</span>
        {dirty && !isNew ? (
          <button
            type="button"
            className="ghost"
            onClick={() => {
              setValues(JSON.parse(initial));
              toast.info("Changes undone.");
            }}
          >
            <Undo2 />
            Undo
          </button>
        ) : null}
        {onCancel ? (
          <button type="button" className="ghost" onClick={onCancel}>
            <X />
            {dirty ? "Cancel" : "Close"}
          </button>
        ) : null}
        <button type="submit" className="primary" disabled={saving || (!dirty && !isNew)}>
          {saving ? <Loader2 className="spin" /> : isNew ? <Plus /> : <Save />}
          {saving ? "Saving…" : isNew ? "Create" : "Save"}
        </button>
      </div>
    </form>
  );
}

function TabIcon({ label }) {
  const Icon = TAB_ICONS[label] || CircleDot;
  return <Icon />;
}

/** A DocEditor in a modal sheet (list items, new profiles). */
export function DocEditorModal({ title, target, onClose, onSaved }) {
  return (
    <div className="editor-modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="editor-sheet doc-sheet">
        <header>
          <h2>{title}</h2>
        </header>
        <DocEditor target={target} compact onCancel={onClose} onSaved={onSaved} />
      </div>
    </div>
  );
}
