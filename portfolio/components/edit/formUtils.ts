import type { FieldSchema, MediaItem } from "@/lib/edit/types";

type Values = Record<string, unknown>;

const idOf = (v: unknown): number | string | null =>
  v && typeof v === "object" && "id" in v ? (v as { id: number | string }).id : (v as number | string | null) ?? null;

/** Fields that live directly on `values` (rows and unnamed tabs are flattened). */
export function flatFields(schema: FieldSchema[]): FieldSchema[] {
  return schema.flatMap((f) =>
    f.type === "row" ? flatFields(f.fields) : f.type === "tabs" ? f.tabs.flatMap((t) => flatFields(t.fields)) : [f]
  );
}

/** Convert form values into what Payload expects (ids for relations, numbers, ISO dates). */
export function normalize(schema: FieldSchema[], values: Values): Values {
  const out: Values = {};
  for (const f of flatFields(schema)) {
    if (!f.name) continue;
    const v = values[f.name];
    switch (f.type) {
      case "upload":
      case "relationship":
        out[f.name] = f.hasMany
          ? (Array.isArray(v) ? v : []).map(idOf).filter((x) => x !== null)
          : idOf(v);
        break;
      case "number":
        out[f.name] = v === "" || v === null || v === undefined ? null : Number(v);
        break;
      case "date":
        out[f.name] = v ? new Date(String(v)).toISOString() : null;
        break;
      case "group":
        out[f.name] = normalize(f.fields, (v as Values) ?? {});
        break;
      case "array":
        out[f.name] = (Array.isArray(v) ? v : []).map((row: Values) => ({
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

/** Client-side required check (drafts skip Payload validation, but the DB still needs values). */
export function missingRequired(schema: FieldSchema[], values: Values, prefix = ""): string[] {
  const missing: string[] = [];
  for (const f of flatFields(schema)) {
    if (!f.name) continue;
    const v = values[f.name];
    const label = prefix + f.label;
    if (f.type === "group") {
      missing.push(...missingRequired(f.fields, (v as Values) ?? {}, `${label} › `));
      continue;
    }
    if (f.type === "array") {
      (Array.isArray(v) ? v : []).forEach((row: Values, i: number) =>
        missing.push(...missingRequired(f.fields, row, `${label} #${i + 1} › `))
      );
      continue;
    }
    if (!f.required || f.type === "checkbox") continue;
    const empty =
      v === null || v === undefined || v === "" || (Array.isArray(v) && v.length === 0) ||
      (typeof v === "number" && Number.isNaN(v));
    if (empty) missing.push(label);
  }
  return missing;
}

/** Initial values for a new item, from schema defaults. */
export function defaultsFor(schema: FieldSchema[]): Values {
  const out: Values = {};
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

export const isImage = (m: Pick<MediaItem, "mimeType" | "url">) =>
  m.mimeType ? m.mimeType.startsWith("image/") : /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(m.url);

/** Downscale large photos in the browser so uploads stay under the 4 MB request limit. */
export async function prepareUpload(file: File): Promise<File> {
  const LIMIT = 3.5 * 1024 * 1024;
  if (file.size <= LIMIT || !/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 2560 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.86));
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" });
}
