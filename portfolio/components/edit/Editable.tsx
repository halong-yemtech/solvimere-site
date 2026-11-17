"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { FiEdit2, FiList, FiPlus } from "react-icons/fi";
import { saveField } from "@/lib/edit/actions";
import type { EditableCollection, EditableGlobal, EditTarget } from "@/lib/edit/types";
import { useEdit } from "./EditProvider";
import { useSite, useSiteOptional } from "../SiteProvider";

const ring = "outline outline-2 outline-dashed outline-transparent hover:outline-main-orange/70 outline-offset-4 rounded";

function PencilButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className="absolute top-1 right-1 z-[55] flex items-center gap-1.5 rounded-full bg-main-orange text-gray-900 px-3 py-1.5 text-base font-semibold shadow-lg opacity-0 group-hover/edit:opacity-100 focus:opacity-100 transition-opacity"
      title={label}
    >
      <FiEdit2 /> {label}
    </button>
  );
}

/** Wraps one collection item. In edit mode: dashed outline on hover + "Edit" button. */
export function EditableItem({
  slug,
  id,
  title,
  children,
  className = "",
}: {
  slug: EditableCollection;
  /** Omit for items not backed by a CMS document (renders children as-is). */
  id?: number;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { editing, openDrawer } = useEdit();
  if (!editing || id === undefined) return <>{children}</>;
  return (
    <div className={`relative group/edit ${ring} ${className}`}>
      {children}
      <PencilButton label="Edit" onClick={() => openDrawer({ kind: "collection", slug, id, title })} />
    </div>
  );
}

/** Wraps a region backed by a global (profile, skills, …), opening it on a given tab. */
export function EditableGlobalArea({
  slug,
  tab,
  title,
  label = "Edit",
  children,
  className = "",
}: {
  slug: EditableGlobal;
  tab?: string;
  title?: string;
  label?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { editing, openDrawer } = useEdit();
  if (!editing) return <>{children}</>;
  return (
    <div className={`relative group/edit ${ring} ${className}`}>
      {children}
      <PencilButton label={label} onClick={() => openDrawer({ kind: "global", slug, tab, title })} />
    </div>
  );
}

/** Wraps a region backed by the profile being displayed, opening it on a given tab. */
export function EditableProfileArea({
  tab,
  label = "Edit",
  children,
  className = "",
}: {
  tab?: string;
  label?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { editing, openDrawer } = useEdit();
  const { profile } = useSite();
  if (!editing) return <>{children}</>;
  return (
    <div className={`relative group/edit ${ring} ${className}`}>
      {children}
      <PencilButton
        label={label}
        onClick={() => openDrawer({ kind: "collection", slug: "profiles", id: profile.id, tab, title: `Profile: ${profile.name}` })}
      />
    </div>
  );
}

/** "Add" / "Reorder" buttons for a list section header. */
export function SectionTools({
  slug,
  title,
  items,
  defaults,
  profileId,
}: {
  slug: EditableCollection;
  title: string;
  items: { id: number; label: string }[];
  defaults?: Record<string, unknown>;
  /** Owner of new items. Defaults to the profile being viewed on the site. */
  profileId?: number;
}) {
  const { editing, openDrawer, openReorder } = useEdit();
  const site = useSiteOptional();
  if (!editing) return null;
  const owner = profileId ?? site?.profile.id;
  const newDefaults = owner ? { ...defaults, profile: owner } : defaults;
  const btn = "flex items-center gap-1.5 rounded-full border border-gray-600 px-4 py-1.5 text-lg text-gray-300 hover:border-main-orange hover:text-main-orange";
  return (
    <div className="flex gap-2">
      <button type="button" className={btn} onClick={() => openDrawer({ kind: "new", slug, title: `New ${title}`, defaults: newDefaults })}>
        <FiPlus /> Add
      </button>
      {items.length > 1 && (
        <button type="button" className={btn} onClick={() => openReorder({ slug, title, items })}>
          <FiList /> Reorder
        </button>
      )}
    </div>
  );
}

/**
 * Text edited in place: click, type, press Enter (or click away) to save as a
 * draft; Esc cancels. Renders as a plain element when not editing.
 */
export function EditText({
  target,
  field,
  value,
  as: Tag = "span",
  className,
  multiline = false,
  placeholder = "Click to add text",
}: {
  target: EditTarget;
  field: string;
  value: string;
  as?: "span" | "h1" | "h2" | "h3" | "p" | "div";
  className?: string;
  multiline?: boolean;
  placeholder?: string;
}) {
  const { editing, refresh } = useEdit();
  const ref = useRef<HTMLElement>(null);
  const [saving, setSaving] = useState(false);

  if (!editing) return <Tag className={className}>{value}</Tag>;

  async function commit() {
    const el = ref.current;
    if (!el) return;
    const next = (el.innerText ?? "").replace(/ /g, " ").trim();
    if (next === value.trim()) return;
    setSaving(true);
    const res = await saveField(target, field, next);
    setSaving(false);
    if (!res.ok) {
      el.innerText = value;
      return toast.error(res.error);
    }
    toast.success("Saved as draft", { id: "inline-save" });
    refresh();
  }

  return (
    <Tag
      ref={ref as never}
      contentEditable={saving ? false : "plaintext-only"}
      suppressContentEditableWarning
      data-placeholder={placeholder}
      onBlur={commit}
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === "Enter" && (!multiline || e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          (e.target as HTMLElement).blur();
        }
        if (e.key === "Escape") {
          (e.target as HTMLElement).innerText = value;
          (e.target as HTMLElement).blur();
        }
      }}
      className={`${className ?? ""} cursor-text outline-none rounded px-1 -mx-1 hover:bg-main-orange/10 focus:bg-main-orange/15 focus:ring-2 focus:ring-main-orange empty:before:content-[attr(data-placeholder)] empty:before:text-gray-600 ${saving ? "opacity-60" : ""}`}
      title="Click to edit"
    >
      {value}
    </Tag>
  );
}

/** "Edit links" button: opens the profile's Links & accounts (the one place links are stored). */
export function EditLinksButton({ label = "Edit links & accounts" }: { label?: string }) {
  const { editing, openDrawer } = useEdit();
  const { profile } = useSite();
  if (!editing) return null;
  return (
    <button
      type="button"
      onClick={() => openDrawer({ kind: "collection", slug: "profiles", id: profile.id, tab: "Links & accounts", title: `Profile: ${profile.name}` })}
      className="flex items-center gap-1.5 rounded-full border border-gray-600 px-4 py-1.5 text-lg text-gray-300 hover:border-main-orange hover:text-main-orange"
    >
      <FiEdit2 /> {label}
    </button>
  );
}
