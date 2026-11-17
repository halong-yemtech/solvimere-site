// Shared (client + server) types for on-site editing.

export const EDITABLE_COLLECTIONS = [
  "profiles",
  "services",
  "pricing-plans",
  "clients",
  "testimonials",
  "facts",
  "statistics",
  "resume-entries",
  "works",
  "work-categories",
  "blog-posts",
] as const;
export type EditableCollection = (typeof EDITABLE_COLLECTIONS)[number];

export const EDITABLE_GLOBALS = ["site-settings"] as const;
export type EditableGlobal = (typeof EDITABLE_GLOBALS)[number];

export type EditTarget =
  | { kind: "collection"; slug: EditableCollection; id: number }
  | { kind: "global"; slug: EditableGlobal };

/** What the drawer is editing: an existing doc/global, or a new collection item. */
export type DrawerTarget =
  | (EditTarget & { tab?: string; title?: string })
  | { kind: "new"; slug: EditableCollection; title?: string; defaults?: Record<string, unknown>; profileId?: number };

/** Trimmed, serializable description of a Payload field, enough to render a form. */
export type FieldSchema =
  | (BaseField<"text" | "textarea" | "email" | "markdown" | "color" | "url"> & { maxLength?: number })
  | (BaseField<"number"> & { min?: number; max?: number })
  | BaseField<"checkbox">
  | (BaseField<"date"> & { monthOnly?: boolean })
  | (BaseField<"select" | "radio"> & { options: { label: string; value: string }[] })
  | (BaseField<"upload"> & { hasMany: boolean; mimeTypes?: string[] })
  | (BaseField<"relationship"> & { hasMany: boolean; options: { label: string; value: number | string }[] })
  | (BaseField<"array"> & { fields: FieldSchema[]; labels?: { singular: string; plural: string } })
  | (BaseField<"group"> & { fields: FieldSchema[] })
  | { type: "row"; fields: FieldSchema[]; name?: undefined; width?: undefined }
  | {
      type: "tabs";
      tabs: { label: string; description?: string; fields: FieldSchema[] }[];
      name?: undefined;
      width?: undefined;
    };

interface BaseField<T extends string> {
  type: T;
  name: string;
  label: string;
  required?: boolean;
  description?: string;
  width?: string;
  defaultValue?: unknown;
}

export interface MediaItem {
  id: number;
  url: string;
  alt: string;
  filename: string;
  mimeType: string;
}

export interface VersionItem {
  id: string | number;
  status: "draft" | "published";
  updatedAt: string;
  latest: boolean;
}

export interface PendingChange {
  target: EditTarget | { kind: "collection"; slug: EditableCollection; id: number };
  label: string;
  group: string;
  isNew: boolean;
  /** Profile this change belongs to (none for site settings). */
  profileId?: number;
}

export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };
