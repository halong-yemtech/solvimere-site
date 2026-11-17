"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FiChevronDown, FiChevronUp, FiPlus, FiTrash2 } from "react-icons/fi";
import type { FieldSchema } from "@/lib/edit/types";
import { iconRegistry } from "../icons";
import MediaField from "./MediaField";
import { defaultsFor } from "./formUtils";

type Values = Record<string, unknown>;

export const inputCls =
  "w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-xl text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-main-orange";

function Label({ field }: { field: { label: string; required?: boolean; description?: string } }) {
  if (!field.label && !field.description) return null;
  return (
    <div className="mb-2">
      <span className="text-lg font-medium uppercase tracking-wider text-gray-400">
        {field.label}
        {field.required && <span className="text-main-orange"> *</span>}
      </span>
      {field.description && <p className="text-base text-gray-500 mt-0.5">{field.description}</p>}
    </div>
  );
}

/** Renders a list of fields bound to `values` (one object level). */
export function Fields({ schema, values, onChange }: { schema: FieldSchema[]; values: Values; onChange: (v: Values) => void }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-6">
      {schema.map((f, i) => (
        <FieldRenderer key={f.name ?? `${f.type}-${i}`} field={f} values={values} onChange={onChange} />
      ))}
    </div>
  );
}

function FieldRenderer({ field, values, onChange }: { field: FieldSchema; values: Values; onChange: (v: Values) => void }) {
  if (field.type === "row") {
    return (
      <div className="w-full flex flex-wrap sm:flex-nowrap gap-4">
        {field.fields.map((f, i) => (
          <div key={f.name ?? i} style={{ flex: f.width ? `0 1 ${f.width}` : "1 1 0" }} className="min-w-0 w-full">
            <FieldRenderer field={f} values={values} onChange={onChange} />
          </div>
        ))}
      </div>
    );
  }
  if (field.type === "tabs") {
    return (
      <div className="w-full space-y-8">
        {field.tabs.map((t) => (
          <section key={t.label}>
            <h4 className="text-xl text-main-orange mb-3">{t.label}</h4>
            <Fields schema={t.fields} values={values} onChange={onChange} />
          </section>
        ))}
      </div>
    );
  }

  const value = values[field.name];
  const set = (v: unknown) => onChange({ ...values, [field.name]: v });
  // A <label> forwards clicks to its first control, which would double-toggle
  // composite controls (icon picker, media, chips), so those get a plain <div>.
  const wrap = (node: React.ReactNode, asLabel = true) => {
    const Tag = asLabel ? "label" : "div";
    return (
      <Tag className="block w-full">
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
          className={inputCls}
          type={field.type === "email" ? "email" : "text"}
          inputMode={field.type === "url" ? "url" : undefined}
          value={String(value ?? "")}
          maxLength={field.maxLength}
          placeholder={field.type === "url" ? "https://…" : undefined}
          onChange={(e) => set(e.target.value)}
        />
      );
    case "color":
      return wrap(
        <div className="flex gap-3 items-center">
          <input aria-label={`${field.label} picker`} type="color" value={/^#[0-9a-f]{6}$/i.test(String(value)) ? String(value) : "#000000"}
            onChange={(e) => set(e.target.value)} className="h-14 w-16 rounded-lg bg-transparent cursor-pointer" />
          <input className={inputCls} value={String(value ?? "")} onChange={(e) => set(e.target.value)} placeholder="#f59e0b" />
        </div>
      );
    case "textarea":
      return wrap(
        <textarea className={`${inputCls} min-h-[9rem]`} value={String(value ?? "")} maxLength={field.maxLength}
          onChange={(e) => set(e.target.value)} />
      );
    case "markdown":
      return <MarkdownInput field={field} value={String(value ?? "")} onChange={set} />;
    case "number":
      return wrap(
        <input className={inputCls} type="number" min={field.min} max={field.max}
          value={value === null || value === undefined ? "" : String(value)}
          onChange={(e) => set(e.target.value === "" ? null : Number(e.target.value))} />
      );
    case "checkbox":
      return (
        <label className="flex items-center gap-3 w-full cursor-pointer select-none">
          <input type="checkbox" checked={Boolean(value)} onChange={(e) => set(e.target.checked)}
            className="h-6 w-6 accent-[rgb(var(--accent))]" />
          <span className="text-xl text-gray-300">{field.label}</span>
          {field.description && <span className="text-base text-gray-500">— {field.description}</span>}
        </label>
      );
    case "date": {
      const iso = value ? new Date(String(value)) : null;
      const str = iso && !Number.isNaN(iso.getTime())
        ? field.monthOnly ? iso.toISOString().slice(0, 7) : iso.toISOString().slice(0, 10)
        : "";
      return wrap(
        <input className={inputCls} type={field.monthOnly ? "month" : "date"} value={str}
          onChange={(e) => set(e.target.value ? `${e.target.value}${field.monthOnly ? "-01" : ""}T00:00:00.000Z` : null)} />
      );
    }
    case "select":
    case "radio":
      if (field.name === "icon") return wrap(<IconPicker value={String(value ?? "")} options={field.options} onChange={set} />, false);
      return wrap(
        <select className={inputCls} value={String(value ?? "")} onChange={(e) => set(e.target.value || null)}>
          {!field.required && <option value="">—</option>}
          {field.required && !value && <option value="">Choose…</option>}
          {field.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
    case "upload":
      return wrap(<MediaField value={value as never} hasMany={field.hasMany} onChange={set} />, false);
    case "relationship": {
      const idOf = (v: unknown) => (v && typeof v === "object" ? (v as { id: unknown }).id : v);
      if (field.hasMany) {
        const ids = (Array.isArray(value) ? value : []).map(idOf);
        return wrap(
          <div className="flex flex-wrap gap-2">
            {field.options.map((o) => {
              const on = ids.includes(o.value);
              return (
                <button type="button" key={o.value}
                  onClick={() => set(on ? ids.filter((x) => x !== o.value) : [...ids, o.value])}
                  className={`rounded-full px-4 py-1.5 border ${on ? "bg-main-orange text-gray-900 border-main-orange" : "border-gray-600 text-gray-300 hover:border-gray-400"}`}>
                  {o.label}
                </button>
              );
            })}
            {field.options.length === 0 && <span className="text-gray-500">Nothing to choose from yet.</span>}
          </div>,
          false
        );
      }
      return wrap(
        <select className={inputCls} value={String(idOf(value) ?? "")} onChange={(e) => set(e.target.value ? Number(e.target.value) : null)}>
          <option value="">—</option>
          {field.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
    }
    case "group":
      return (
        <fieldset className="w-full rounded-xl border border-gray-800 p-4">
          <legend className="px-2 text-lg uppercase tracking-wider text-gray-400">{field.label}</legend>
          <Fields schema={field.fields} values={(value as Values) ?? {}} onChange={set} />
        </fieldset>
      );
    case "array":
      return <ArrayInput field={field} rows={(Array.isArray(value) ? value : []) as Values[]} onChange={set} />;
  }
}

function MarkdownInput({ field, value, onChange }: { field: FieldSchema & { label: string }; value: string; onChange: (v: string) => void }) {
  const [preview, setPreview] = useState(false);
  return (
    <div className="w-full">
      <div className="flex items-end justify-between">
        <Label field={field} />
        <button type="button" onClick={() => setPreview((p) => !p)} className="mb-2 text-lg text-main-orange hover:underline">
          {preview ? "Edit" : "Preview"}
        </button>
      </div>
      {preview ? (
        <article className="prose max-w-none rounded-lg bg-gray-800/50 p-4 prose-p:text-xl prose-strong:text-main-orange">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{value || "_Nothing yet_"}</ReactMarkdown>
        </article>
      ) : (
        <textarea className={`${inputCls} min-h-[16rem] font-mono text-lg`} value={value} onChange={(e) => onChange(e.target.value)}
          placeholder="Markdown: **bold**, *italic*, - lists, [links](https://…)" />
      )}
    </div>
  );
}

function ArrayInput({ field, rows, onChange }: {
  field: Extract<FieldSchema, { type: "array" }>;
  rows: Values[];
  onChange: (rows: Values[]) => void;
}) {
  const singular = field.labels?.singular ?? "item";
  const simple = field.fields.length === 1 && !["array", "group", "upload"].includes(field.fields[0].type);
  const move = (i: number, d: -1 | 1) => {
    const next = [...rows];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  return (
    <div className="w-full">
      <Label field={field} />
      <ul className="space-y-3">
        {rows.map((row, i) => (
          <li key={(row.id as string) ?? i} className="flex gap-2 items-start rounded-xl bg-gray-800/40 p-3">
            <div className="flex-1 min-w-0">
              <Fields
                schema={simple ? [{ ...field.fields[0], label: "", description: undefined } as FieldSchema] : field.fields}
                values={row}
                onChange={(v) => onChange(rows.map((r, j) => (j === i ? v : r)))}
              />
            </div>
            <div className="flex flex-col gap-1 text-gray-400">
              <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="p-1.5 rounded hover:bg-gray-700 disabled:opacity-30" title="Move up"><FiChevronUp /></button>
              <button type="button" disabled={i === rows.length - 1} onClick={() => move(i, 1)} className="p-1.5 rounded hover:bg-gray-700 disabled:opacity-30" title="Move down"><FiChevronDown /></button>
              <button type="button" onClick={() => onChange(rows.filter((_, j) => j !== i))} className="p-1.5 rounded hover:bg-red-900/60 hover:text-red-300" title="Remove"><FiTrash2 /></button>
            </div>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => onChange([...rows, defaultsFor(field.fields)])}
        className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-gray-600 px-4 py-2 text-gray-300 hover:border-main-orange hover:text-main-orange">
        <FiPlus /> Add {singular.toLowerCase()}
      </button>
    </div>
  );
}

function IconPicker({ value, options, onChange }: { value: string; options: { label: string; value: string }[]; onChange: (v: string) => void }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const Current = iconRegistry[value as keyof typeof iconRegistry];
  const shown = options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <button type="button" onClick={() => setOpen((o) => !o)} className={`${inputCls} flex items-center gap-3 text-left`}>
        {Current ? <Current className="text-3xl text-main-orange" /> : <span className="text-gray-500">No icon</span>}
        <span className="truncate">{options.find((o) => o.value === value)?.label ?? "Choose an icon"}</span>
      </button>
      {open && (
        <div className="mt-2 rounded-xl border border-gray-700 bg-gray-900 p-3">
          <input autoFocus className={inputCls} placeholder="Search icons…" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="mt-3 max-h-64 overflow-y-auto grid grid-cols-[repeat(auto-fill,minmax(4.4rem,1fr))] gap-2">
            {shown.map((o) => {
              const I = iconRegistry[o.value as keyof typeof iconRegistry];
              return (
                <button type="button" key={o.value} title={o.label} onClick={() => { onChange(o.value); setOpen(false); }}
                  className={`aspect-square rounded-lg grid place-items-center text-3xl ${o.value === value ? "bg-main-orange text-gray-900" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}>
                  {I ? <I /> : "?"}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
