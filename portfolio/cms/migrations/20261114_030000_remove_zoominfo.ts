import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

/**
 * Removes the ZoomInfo social link and client (and their drafts/versions).
 * Data-only, plain SQL; child rows are deleted explicitly rather than relying on
 * FK cascades. Matched by URL or name, so it is a no-op where they don't exist.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const [table, nameCol] of [
    ['social_links', 'label'],
    ['clients', 'name'],
  ] as const) {
    const exists = await db.all(sql.raw(`SELECT 1 FROM sqlite_master WHERE type='table' AND name='${table}'`))
    if (!exists.length) continue
    const ids = (await db.all(
      sql.raw(
        `SELECT id FROM "${table}" WHERE lower(url) LIKE '%zoominfo.com%' OR lower("${nameCol}") = 'zoominfo'`,
      ),
    )) as { id: number }[]
    const versionIds = (await db.all(
      sql.raw(
        `SELECT id FROM "_${table}_v" WHERE lower(version_url) LIKE '%zoominfo.com%' OR lower("version_${nameCol}") = 'zoominfo'` +
          (ids.length ? ` OR parent_id IN (${ids.map((r) => Number(r.id)).join(',')})` : ''),
      ),
    )) as { id: number }[]

    if (versionIds.length) {
      const v = versionIds.map((r) => Number(r.id)).join(',')
      await db.run(sql.raw(`DELETE FROM "_${table}_v_rels" WHERE parent_id IN (${v})`))
      await db.run(sql.raw(`DELETE FROM "_${table}_v" WHERE id IN (${v})`))
    }
    if (ids.length) {
      const d = ids.map((r) => Number(r.id)).join(',')
      await db.run(sql.raw(`DELETE FROM "${table}_rels" WHERE parent_id IN (${d})`))
      await db.run(sql.raw(`DELETE FROM payload_locked_documents_rels WHERE "${table}_id" IN (${d})`))
      await db.run(sql.raw(`DELETE FROM "${table}" WHERE id IN (${d})`))
    }
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Deleted content is not restored.
}
