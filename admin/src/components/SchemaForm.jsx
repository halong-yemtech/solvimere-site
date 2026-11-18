import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  ChevronsDown,
  Images,
  Loader2,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { isImage, listMedia, uploadMedia } from "../portfolio/api";
import { Spinner } from "./Spinner";
import { Empty } from "./Empty";
import { toast } from "./Toast";

/*
 * Renders portfolio documents from their field schemas (admin/src/portfolio/schemas.json):
 * text, numbers, dates, selects, uploads (portfolio_media), relationships, arrays, groups, tabs.
 */

const idOf = (v) => (v && typeof v === "object" && "id" in v ? v.id : (v ?? null));

/** Fields that live directly on `values` (rows and unnamed tabs are flattened). */
export function flatFields(schema) {
  return schema.flatMap((f) =>
    f.type === "row" ? flatFields(f.fields) : f.type === "tabs" ? f.tabs.flatMap((t) => flatFields(t.fields)) : [f],
  );
}

/** Form values -> what Payload expects (ids for relations, numbers, ISO dates). */
export function normalize(schema, values) {
  const out = {};
  for (const f of flatFields(schema)) {
    if (!f.name) continue;
    const v = values?.[f.name];
    switch (f.type) {
      case "upload":
      case "relationship":
        out[f.name] = f.hasMany ? (Array.isArray(v) ? v : []).map(idOf).filter((x) => x !== null) : idOf(v);
        break;
      case "number":
        out[f.name] = v === "" || v === null || v === undefined ? null : Number(v);
        break;
      case "date":
        out[f.name] = v ? new Date(String(v)).toISOString() : null;
        break;
      case "group":
        out[f.name] = normalize(f.fields, v ?? {});
        break;
      case "array":
        out[f.name] = (Array.isArray(v) ? v : []).map((row) => ({
          ...(row.id ? { id: row.id } : {}),
          ...normalize(f.fields, row),
        }));
        break;
      default:
        out[f.name] = v ?? null;
    }
  }
  return out;
}

/** Required fields that are empty (drafts skip Payload's own check, the database doesn't). */
export function missingRequired(schema, values, prefix = "") {
  const missing = [];
  for (const f of flatFields(schema)) {
    if (!f.name) continue;
    const v = values?.[f.name];
    const label = prefix + f.label;
    if (f.type === "group") {
      missing.push(...missingRequired(f.fields, v ?? {}, `${label} › `));
      continue;
    }
    if (f.type === "array") {
      (Array.isArray(v) ? v : []).forEach((row, i) =>
        missing.push(...missingRequired(f.fields, row, `${label} #${i + 1} › `)),
      );
      continue;
    }
    if (!f.required || f.type === "checkbox") continue;
    if (
      v === null ||
      v === undefined ||
      v === "" ||
      (Array.isArray(v) && v.length === 0) ||
      (typeof v === "number" && Number.isNaN(v))
    ) {
      missing.push(label);
    }
  }
  return missing;
}

/** Initial values for a new document, from schema defaults. */
export function defaultsFor(schema) {
  const out = {};
  for (const f of flatFields(schema)) {
    if (!f.name) continue;
    if (f.type === "group") out[f.name] = defaultsFor(f.fields);
    else if (f.type === "array") out[f.name] = Array.isArray(f.defaultValue) ? f.defaultValue : [];
    else if (f.defaultValue !== undefined) out[f.name] = f.defaultValue;
    else if (f.type === "checkbox") out[f.name] = false;
    else if ((f.type === "upload" || f.type === "relationship") && f.hasMany) out[f.name] = [];
  }
  return out;
}

function Label({ field }) {
  if (!field.label && !field.description) return null;
  return (
    <span className="sf-label">
      <span>
        {field.label}
        {field.required ? <b className="sf-req"> *</b> : null}
      </span>
      {field.description ? <small>{field.description}</small> : null}
    </span>
  );
}

/** A list of fields bound to one object level. */
export function Fields({ schema, values, onChange }) {
  return (
    <div className="sf-fields">
      {schema.map((f, i) => (
        <Field key={f.name ?? `${f.type}-${i}`} field={f} values={values} onChange={onChange} />
      ))}
    </div>
  );
}

function Field({ field, values, onChange }) {
  if (field.type === "row") {
    return (
      <div className="sf-row">
        {field.fields.map((f, i) => (
          <div key={f.name ?? i} style={{ flex: f.width ? `1 1 calc(${f.width} - 16px)` : "1 1 0" }}>
            <Field field={f} values={values} onChange={onChange} />
          </div>
        ))}
      </div>
    );
  }
  if (field.type === "tabs") {
    return (
      <div className="sf-sections">
        {field.tabs.map((t) => (
          <section key={t.label}>
            <h3>{t.label}</h3>
            {t.description ? <p className="sf-help">{t.description}</p> : null}
            <Fields schema={t.fields} values={values} onChange={onChange} />
          </section>
        ))}
      </div>
    );
  }

  const value = values?.[field.name];
  const set = (v) => onChange({ ...values, [field.name]: v });
  const wrap = (node, asLabel = true) => {
    const Tag = asLabel ? "label" : "div";
    return (
      <Tag className="sf-field">
        <Label field={field} />
        {node}
      </Tag>
    );
  };

  switch (field.type) {
    case "text":
    case "email":
    case "url":
      return wrap(
        <input
          type={field.type === "email" ? "email" : "text"}
          inputMode={field.type === "url" ? "url" : undefined}
          value={String(value ?? "")}
          maxLength={field.maxLength}
          placeholder={field.type === "url" ? "https://…" : undefined}
          onChange={(e) => set(e.target.value)}
        />,
      );
    case "color":
      return wrap(
        <span className="sf-color">
          <input
            type="color"
            aria-label={`${field.label} picker`}
            value={/^#[0-9a-f]{6}$/i.test(String(value)) ? String(value) : "#000000"}
            onChange={(e) => set(e.target.value)}
          />
          <input value={String(value ?? "")} onChange={(e) => set(e.target.value)} placeholder="#f59e0b" />
        </span>,
      );
    case "textarea":
      return wrap(
        <textarea
          rows={4}
          value={String(value ?? "")}
          maxLength={field.maxLength}
          onChange={(e) => set(e.target.value)}
        />,
      );
    case "markdown":
      return wrap(
        <textarea
          className="sf-markdown"
          rows={9}
          value={String(value ?? "")}
          onChange={(e) => set(e.target.value)}
          placeholder="Markdown: **bold**, *italic*, - lists, [links](https://…)"
        />,
      );
    case "number":
      return wrap(
        <input
          type="number"
          min={field.min}
          max={field.max}
          value={value === null || value === undefined ? "" : String(value)}
          onChange={(e) => set(e.target.value === "" ? null : Number(e.target.value))}
        />,
      );
    case "checkbox":
      return (
        <label className="sf-check">
          <input type="checkbox" checked={Boolean(value)} onChange={(e) => set(e.target.checked)} />
          <span>{field.label}</span>
          {field.description ? <small>{field.description}</small> : null}
        </label>
      );
    case "date": {
      const d = value ? new Date(String(value)) : null;
      const str =
        d && !Number.isNaN(d.getTime())
          ? field.monthOnly
            ? d.toISOString().slice(0, 7)
            : d.toISOString().slice(0, 10)
          : "";
      return wrap(
        <input
          type={field.monthOnly ? "month" : "date"}
          value={str}
          onChange={(e) =>
            set(e.target.value ? `${e.target.value}${field.monthOnly ? "-01" : ""}T00:00:00.000Z` : null)
          }
        />,
      );
    }
    case "select":
    case "radio":
      return wrap(
        <select value={String(value ?? "")} onChange={(e) => set(e.target.value || null)}>
          {!field.required ? <option value="">-</option> : null}
          {field.required && !value ? <option value="">Choose…</option> : null}
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>,
      );
    case "upload":
      return wrap(<MediaField value={value} hasMany={field.hasMany} onChange={set} />, false);
    case "relationship": {
      if (field.hasMany) {
        const ids = (Array.isArray(value) ? value : []).map(idOf);
        return wrap(
          <span className="sf-chips">
            {field.options.map((o) => {
              const on = ids.includes(o.value);
              return (
                <button
                  type="button"
                  key={o.value}
                  className={on ? "is-on" : ""}
                  aria-pressed={on}
                  onClick={() => set(on ? ids.filter((x) => x !== o.value) : [...ids, o.value])}
                >
                  {o.label}
                </button>
              );
            })}
            {field.options.length === 0 ? <em>Nothing to choose from yet.</em> : null}
          </span>,
          false,
        );
      }
      return wrap(
        <select value={String(idOf(value) ?? "")} onChange={(e) => set(e.target.value ? Number(e.target.value) : null)}>
          <option value="">-</option>
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>,
      );
    }
    case "group":
      return (
        <fieldset className="sf-group">
          <legend>{field.label}</legend>
          {field.description ? <p className="sf-help">{field.description}</p> : null}
          <Fields schema={field.fields} values={value ?? {}} onChange={set} />
        </fieldset>
      );
    case "array":
      return <ArrayField field={field} rows={Array.isArray(value) ? value : []} onChange={set} />;
    default:
      return null;
  }
}

function ArrayField({ field, rows, onChange }) {
  const singular = field.labels?.singular ?? "item";
  const simple = field.fields.length === 1 && !["array", "group", "upload"].includes(field.fields[0].type);
  const move = (i, d) => {
    const next = [...rows];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  return (
    <div className="sf-field">
      <Label field={field} />
      <ul className="sf-array">
        {rows.map((row, i) => (
          <li key={row.id ?? i}>
            <div className="sf-array-body">
              <Fields
                schema={simple ? [{ ...field.fields[0], label: "", description: undefined }] : field.fields}
                values={row}
                onChange={(v) => onChange(rows.map((r, j) => (j === i ? v : r)))}
              />
            </div>
            <div className="sf-array-tools">
              <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up" title="Move up">
                <ArrowUp />
              </button>
              <button
                type="button"
                disabled={i === rows.length - 1}
                onClick={() => move(i, 1)}
                aria-label="Move down"
                title="Move down"
              >
                <ArrowDown />
              </button>
              <button
                type="button"
                className="is-danger"
                onClick={() => onChange(rows.filter((_, j) => j !== i))}
                aria-label="Remove"
                title="Remove"
              >
                <Trash2 />
              </button>
            </div>
          </li>
        ))}
      </ul>
      <button type="button" className="ghost sf-add" onClick={() => onChange([...rows, defaultsFor(field.fields)])}>
        <Plus />
        Add {String(singular).toLowerCase()}
      </button>
    </div>
  );
}

function Thumb({ item }) {
  if (!item || typeof item !== "object") return <span className="sf-thumb is-empty">#{String(item ?? "")}</span>;
  return isImage(item) ? (
    <img className="sf-thumb" src={item.url} alt={item.alt || ""} />
  ) : (
    <span className="sf-thumb is-file">{item.filename || "File"}</span>
  );
}

/** Upload or pick media for an `upload` field (single or many). */
export function MediaField({ value, hasMany, onChange }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [picking, setPicking] = useState(false);
  const list = hasMany ? (Array.isArray(value) ? value : []) : value ? [value] : [];

  const add = (items) => {
    if (!items.length) return;
    onChange(hasMany ? [...list, ...items] : items[0]);
  };

  async function onFiles(files) {
    if (!files?.length) return;
    setBusy(true);
    const uploaded = [];
    for (const file of Array.from(hasMany ? files : [files[0]])) {
      try {
        uploaded.push(await uploadMedia(file));
      } catch (err) {
        toast.error(`${file.name}: ${err.message}`);
      }
    }
    setBusy(false);
    add(uploaded);
    if (uploaded.length) {
      toast.success(
        `Uploaded ${uploaded.length} file${uploaded.length === 1 ? "" : "s"}. Save to publish ${uploaded.length === 1 ? "it" : "them"}.`,
      );
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  const move = (i, d) => {
    const next = [...list];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  const remove = (i) => (hasMany ? onChange(list.filter((_, j) => j !== i)) : onChange(null));

  return (
    <div
      className="sf-media"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onFiles(e.dataTransfer.files);
      }}
    >
      {list.length ? (
        <ul>
          {list.map((item, i) => (
            <li key={`${idOf(item)}-${i}`}>
              <Thumb item={item} />
              <span className="sf-media-tools">
                {hasMany && i > 0 ? (
                  <button type="button" onClick={() => move(i, -1)} aria-label="Move left" title="Move left">
                    <ArrowLeft />
                  </button>
                ) : null}
                {hasMany && i < list.length - 1 ? (
                  <button type="button" onClick={() => move(i, 1)} aria-label="Move right" title="Move right">
                    <ArrowRight />
                  </button>
                ) : null}
                <button
                  type="button"
                  className="is-danger"
                  onClick={() => remove(i)}
                  aria-label="Remove"
                  title="Remove"
                >
                  <X />
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      <span className="actions">
        <button type="button" className="ghost" disabled={busy} onClick={() => fileRef.current?.click()}>
          {busy ? <Loader2 className="spin" /> : <Upload />}
          {busy ? "Uploading…" : hasMany ? "Upload files" : list.length ? "Replace" : "Upload"}
        </button>
        <button type="button" className="ghost" onClick={() => setPicking(true)}>
          <Images />
          Choose from library
        </button>
      </span>
      <input
        ref={fileRef}
        type="file"
        hidden
        multiple={hasMany}
        accept="image/*,application/pdf"
        onChange={(e) => onFiles(e.target.files)}
      />
      {picking ? (
        <MediaPicker
          multiple={hasMany}
          onClose={() => setPicking(false)}
          onPick={(items) => {
            add(items);
            setPicking(false);
          }}
        />
      ) : null}
    </div>
  );
}

function MediaPicker({ multiple, onPick, onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [more, setMore] = useState(false);
  const [chosen, setChosen] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    listMedia(page)
      .then((res) => {
        setItems((current) => (page === 1 ? res.items : [...current, ...res.items]));
        setMore(res.hasNextPage);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page]);

  const toggle = (item) => {
    if (!multiple) return onPick([item]);
    setChosen((c) => (c.some((x) => x.id === item.id) ? c.filter((x) => x.id !== item.id) : [...c, item]));
  };

  return (
    <div className="editor-modal" role="dialog" aria-modal="true" aria-label="Media library" onClick={onClose}>
      <div className="editor-sheet sf-picker" onClick={(e) => e.stopPropagation()}>
        <header>
          <h2>Media library</h2>
          <button type="button" className="ghost icon-btn" onClick={onClose} aria-label="Close" title="Close">
            <X />
          </button>
        </header>
        {error ? <p className="error">{error}</p> : null}
        {!loading && !error && items.length === 0 ? (
          <Empty icon={Images} title="The library is empty">
            Close this and use Upload to add the first file.
          </Empty>
        ) : null}
        <div className="sf-picker-grid">
          {items.map((item) => (
            <button
              type="button"
              key={item.id}
              className={chosen.some((x) => x.id === item.id) ? "is-on" : ""}
              onClick={() => toggle(item)}
              title={item.filename}
            >
              <Thumb item={item} />
            </button>
          ))}
        </div>
        <div className="actions">
          {loading ? <Spinner inline size="sm" label="" /> : null}
          {more && !loading ? (
            <button type="button" className="ghost" onClick={() => setPage((p) => p + 1)}>
              <ChevronsDown />
              Load more
            </button>
          ) : null}
          {multiple ? (
            <button type="button" className="primary" disabled={!chosen.length} onClick={() => onPick(chosen)}>
              <Check />
              Add {chosen.length || ""} selected
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
