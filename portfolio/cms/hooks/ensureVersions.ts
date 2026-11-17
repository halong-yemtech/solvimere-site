import type { Payload } from "payload";
import { sql } from "@payloadcms/db-postgres";

type Db = {
  name: string;
  schemaName?: string;
  drizzle: {
    all?: (q: unknown) => Promise<Record<string, unknown>[]>;
    execute?: (q: unknown) => Promise<{ rows: Record<string, unknown>[] }>;
  };
};

/**
 * Draft queries read the version tables (`_<table>_v`), so a document with no
 * version at all would be invisible to editors. Documents can exist without
 * versions when they predate drafts or were written by a migration (which must
 * use plain SQL). This runs once per server start, after migrations: one SQL
 * query finds them, and each gets a baseline published version.
 */
export async function ensureVersions(payload: Payload) {
  try {
    const collections = payload.config.collections
      .filter((c) => c.versions && typeof c.versions === "object" && c.versions.drafts)
      .map((c) => c.slug);
    const globals = payload.config.globals
      .filter((g) => g.versions && typeof g.versions === "object" && g.versions.drafts)
      .map((g) => g.slug);
    if (!collections.length && !globals.length) return;

    const db = payload.db as unknown as Db;
    // Postgres (Supabase) keeps Payload's tables in their own schema.
    const prefix = db.name === "postgres" && db.schemaName ? `"${db.schemaName}".` : "";
    const table = (slug: string, version = false) => `${prefix}"${version ? "_" : ""}${slug.replace(/-/g, "_")}${version ? "_v" : ""}"`;

    const parts = [
      ...collections.map(
        (s) => `SELECT '${s}' AS slug, 'c' AS kind, id FROM ${table(s)} WHERE id NOT IN (SELECT parent_id FROM ${table(s, true)} WHERE parent_id IS NOT NULL)`
      ),
      ...globals.map(
        (s) => `SELECT '${s}' AS slug, 'g' AS kind, id FROM ${table(s)} WHERE NOT EXISTS (SELECT 1 FROM ${table(s, true)})`
      ),
    ];
    const query = sql.raw(parts.join(" UNION ALL "));
    const rows = db.name === "postgres" ? (await db.drizzle.execute!(query)).rows : await db.drizzle.all!(query);
    if (!rows.length) return;

    for (const r of rows) {
      const slug = String(r.slug);
      if (r.kind === "c") {
        await payload.update({ collection: slug as never, id: Number(r.id), data: { _status: "published" } as never, depth: 0 });
      } else {
        await payload.updateGlobal({ slug: slug as never, data: { _status: "published" } as never, depth: 0 });
      }
    }
    payload.logger.info(`ensureVersions: created baseline versions for ${rows.length} document(s)`);
  } catch (err) {
    // Never block startup; the site still works, only drafts of these docs are affected.
    payload.logger.warn({ err, msg: "ensureVersions: skipped" });
  }
}
