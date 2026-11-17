import { useCallback, useEffect, useState } from "react";
import { call } from "../lib/portfolio";
import { defaultsFor, Fields, missingRequired, normalize } from "./SchemaForm";

const fmt = (iso) =>
  new Date(iso).toLocaleString(undefined, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

/**
 * Edit one portfolio document: a profile, a list item, or Site settings.
 * `target`: { kind: "collection", slug, id } | { kind: "global", slug } | { kind: "new", slug, profileId }.
 * Saves are drafts; publishing happens from the workspace's "Publish" bar.
 */
export function DocEditor({ target, onSaved, onCancel, compact = false }) {
  const [schema, setSchema] = useState(null);
  const [values, setValues] = useState({});
  const [initial, setInitial] = useState("{}");
  const [tab, setTab] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState(null);
  const isNew = target.kind === "new";
  const dirty = schema !== null && JSON.stringify(values) !== initial;
  const key = JSON.stringify(target);

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await call("loadForEdit", target);
      const doc = res.doc ?? defaultsFor(res.schema);
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
    setHistory(null);
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
      setError(`Please fill in: ${missing.slice(0, 5).join(", ")}${missing.length > 5 ? "…" : ""}`);
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const data = normalize(schema, values);
      if (isNew) {
        const created = await call("createItem", target.slug, data, target.profileId);
        onSaved?.(created.id);
        return;
      }
      await call("saveDoc", target, data);
      setInitial(JSON.stringify(values));
      setNotice("Saved as draft. Publish to make it live.");
      onSaved?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function showHistory() {
    if (history) return setHistory(null);
    try {
      setHistory(await call("listVersions", target));
    } catch (err) {
      setError(err.message);
    }
  }

  async function restore(version) {
    if (!window.confirm(`Restore the version from ${fmt(version.updatedAt)} as a new draft?`)) return;
    try {
      await call("restoreVersion", target, version.id);
      setHistory(null);
      await load();
      setNotice("Version restored as a draft. Publish to make it live.");
      onSaved?.();
    } catch (err) {
      setError(err.message);
    }
  }

  if (error && !schema) return <p className="error">{error}</p>;
  if (!schema) return <p className="empty">Loading…</p>;

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
              {t.label}
            </button>
          ))}
        </div>
      ) : null}
      {shown.description ? <p className="sf-help">{shown.description}</p> : null}
      <Fields schema={shown.fields} values={values} onChange={setValues} />

      {history ? (
        <div className="panel doc-history">
          <h2>Version history</h2>
          {history.length === 0 ? <p>No earlier versions.</p> : null}
          <ul>
            {history.map((v) => (
              <li key={v.id}>
                <span>
                  {fmt(v.updatedAt)} · <em className={`pill is-${v.status}`}>{v.status}</em>
                  {v.latest ? " · current" : ""}
                </span>
                {!v.latest ? (
                  <button type="button" className="ghost" onClick={() => restore(v)}>
                    Restore
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className={`doc-bar ${dirty ? "is-dirty" : ""}`}>
        <span>
          {error ? (
            <b className="error">{error}</b>
          ) : (
            notice || (dirty ? "Unsaved changes" : isNew ? "New item" : "All changes saved")
          )}
        </span>
        {!isNew ? (
          <button type="button" className="ghost" onClick={showHistory}>
            {history ? "Hide history" : "History"}
          </button>
        ) : null}
        {dirty && !isNew ? (
          <button type="button" className="ghost" onClick={() => setValues(JSON.parse(initial))}>
            Undo
          </button>
        ) : null}
        {onCancel ? (
          <button type="button" className="ghost" onClick={onCancel}>
            {isNew || !dirty ? "Close" : "Cancel"}
          </button>
        ) : null}
        <button type="submit" className="primary" disabled={saving || (!dirty && !isNew)}>
          {saving ? "Saving…" : isNew ? "Create draft" : "Save draft"}
        </button>
      </div>
    </form>
  );
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
