import "server-only";
import type { Field, Payload } from "payload";
import type { EditableCollection, EditableGlobal, FieldSchema } from "./types";

const titleCase = (s: string) =>
  s
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/^./, (c) => c.toUpperCase());

function text(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "en" in value) return String((value as { en: unknown }).en);
  return undefined;
}

const HIDDEN_NAMES = new Set(["createdAt", "updatedAt", "_status", "_order", "prefix", "_objectKey"]);

/**
 * Convert Payload's (sanitized) field config into the plain schema the on-site
 * editor renders. Relationship options are resolved up front so the client
 * never needs to query collections it doesn't know about.
 */
export interface SchemaContext {
  /** Profile the edited item belongs to: relationship options are limited to its items. */
  profileId?: number;
  /** Platforms of that profile's Links & accounts: account pickers only offer these. */
  platforms?: string[];
}

export async function serializeFields(
  payload: Payload,
  fields: Field[],
  ctx: SchemaContext = {},
): Promise<FieldSchema[]> {
  const out: FieldSchema[] = [];
  for (const field of fields) {
    const s = await serializeField(payload, field, ctx);
    if (s) out.push(s);
  }
  return out;
}

async function serializeField(payload: Payload, field: Field, ctx: SchemaContext): Promise<FieldSchema | null> {
  const admin = (field as { admin?: Record<string, unknown> }).admin ?? {};
  if (admin.hidden || admin.readOnly || admin.disabled) return null;

  if (field.type === "row" || field.type === "collapsible") {
    const fields = await serializeFields(payload, field.fields, ctx);
    return fields.length ? { type: "row", fields } : null;
  }
  if (field.type === "tabs") {
    const tabs = [];
    for (const tab of field.tabs) {
      const inner = await serializeFields(payload, tab.fields, ctx);
      if (!inner.length) continue;
      const label = text(tab.label) ?? ("name" in tab && tab.name ? titleCase(tab.name) : "Tab");
      // Named tabs store their fields under a key, like a group.
      const fields: FieldSchema[] =
        "name" in tab && tab.name ? [{ type: "group", name: tab.name, label, fields: inner }] : inner;
      tabs.push({ label, description: text(tab.description), fields });
    }
    return tabs.length ? { type: "tabs", tabs } : null;
  }

  if (!("name" in field) || !field.name || HIDDEN_NAMES.has(field.name)) return null;
  // The owner of a list item is set where it's created (workspace / on-site), never edited.
  if (field.type === "relationship" && field.name === "profile" && field.relationTo === "profiles") return null;

  const base = {
    name: field.name,
    label: text((field as { label?: unknown }).label) ?? titleCase(field.name),
    required: Boolean((field as { required?: boolean }).required),
    description: text(admin.description),
    width: typeof admin.width === "string" ? admin.width : undefined,
    defaultValue:
      typeof (field as { defaultValue?: unknown }).defaultValue === "function"
        ? undefined
        : (field as { defaultValue?: unknown }).defaultValue,
  };

  switch (field.type) {
    case "text": {
      const isColor = /color|accent/i.test(field.name);
      const isUrl = /url$|link$/i.test(field.name);
      return { ...base, type: isColor ? "color" : isUrl ? "url" : "text", maxLength: field.maxLength };
    }
    case "email":
      return { ...base, type: "email" };
    case "textarea":
      return {
        ...base,
        type: /markdown/i.test(base.description ?? "") ? "markdown" : "textarea",
        maxLength: field.maxLength,
      };
    case "number":
      return { ...base, type: "number", min: field.min, max: field.max };
    case "checkbox":
      return { ...base, type: "checkbox" };
    case "date": {
      const appearance = (admin.date as { pickerAppearance?: string } | undefined)?.pickerAppearance;
      return { ...base, type: "date", monthOnly: appearance === "monthOnly" };
    }
    case "select":
    case "radio": {
      let options = field.options.map((o) =>
        typeof o === "string" ? { label: o, value: o } : { label: text(o.label) ?? o.value, value: o.value },
      );
      // "Which account?" pickers: only the accounts this profile has (+ custom / none).
      if ((admin.custom as { accountRef?: boolean } | undefined)?.accountRef && ctx.platforms) {
        const have = new Set(ctx.platforms);
        options = options.filter((o) => o.value === "custom" || o.value === "none" || have.has(o.value));
      }
      return { ...base, type: field.type, options };
    }
    case "upload":
      return { ...base, type: "upload", hasMany: Boolean(field.hasMany) };
    case "relationship": {
      if (Array.isArray(field.relationTo)) return null; // polymorphic: not used on this site
      const related = payload.collections[field.relationTo]?.config;
      const titleField = related?.admin?.useAsTitle ?? "id";
      // Content collections are per profile: offer only the same profile's items.
      const perProfile = related?.fields.some((f) => "name" in f && f.name === "profile");
      const { docs } = await payload.find({
        collection: field.relationTo,
        limit: 500,
        depth: 0,
        pagination: false,
        draft: true,
        where: perProfile && ctx.profileId ? { profile: { equals: ctx.profileId } } : undefined,
      });
      return {
        ...base,
        type: "relationship",
        hasMany: Boolean(field.hasMany),
        options: docs.map((d) => ({
          label: String((d as unknown as Record<string, unknown>)[titleField] ?? d.id),
          value: d.id,
        })),
      };
    }
    case "array": {
      const fields = await serializeFields(payload, field.fields, ctx);
      const labels = field.labels
        ? { singular: text(field.labels.singular) ?? "Item", plural: text(field.labels.plural) ?? "Items" }
        : undefined;
      return { ...base, type: "array", fields, labels };
    }
    case "group": {
      const fields = await serializeFields(payload, field.fields, ctx);
      return fields.length ? { ...base, type: "group", fields } : null;
    }
    default:
      return null; // blocks, json, richText, point, join, ui: not edited on-site
  }
}

export function collectionFields(payload: Payload, slug: EditableCollection): Field[] {
  return payload.collections[slug].config.fields;
}

export function globalFields(payload: Payload, slug: EditableGlobal): Field[] {
  const g = payload.globals.config.find((c) => c.slug === slug);
  if (!g) throw new Error(`Unknown global ${slug}`);
  return g.fields;
}
