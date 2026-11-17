/**
 * One-time move of the portfolio's content from the local SQLite file to Supabase.
 *
 *   1. bun x payload migrate          (creates the empty `payload` schema in Supabase)
 *   2. bun run migrate:supabase       (copies every row + uploads media files)
 *
 * Needs in .env: DATABASE_URI=postgres://… (Supabase) and SUPABASE_S3_* (Storage).
 * Optional: SQLITE_FILE (default ./portfolio.db), MEDIA_DIR (default ./media).
 * `--media-only` skips the row copy and only (re)uploads the media files.
 *
 * Rows keep their ids, so relationships, versions/drafts, users (with their password
 * hashes) and inbox messages all carry over unchanged. Runs in one transaction and
 * refuses to write into tables that already contain data.
 */
import fs from "fs";
import path from "path";
import { Database } from "bun:sqlite";
import pg from "pg";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const SCHEMA = "payload";
const SKIP_TABLES = new Set(["payload_migrations"]); // written by `payload migrate`
const mediaOnly = process.argv.includes("--media-only");

const uri = process.env.DATABASE_URI || "";
if (!/^postgres(ql)?:\/\//.test(uri))
  throw new Error("DATABASE_URI must be the Supabase postgres:// connection string.");
const sqliteFile = path.resolve(process.env.SQLITE_FILE || "portfolio.db");
const mediaDir = path.resolve(process.env.MEDIA_DIR || "media");
if (!fs.existsSync(sqliteFile)) throw new Error(`SQLite file not found: ${sqliteFile}`);

const src = new Database(sqliteFile, { readonly: true });
const client = new pg.Client({ connectionString: uri });
await client.connect();

type Column = { name: string; type: string };
const q = async <T = Record<string, unknown>>(text: string, values?: unknown[]) =>
  (await client.query(text, values as never[])).rows as T[];

// ── target tables, columns and foreign-key order ─────────────────────────────
const cols = await q<{ table_name: string; column_name: string; data_type: string }>(
  `select table_name, column_name, data_type from information_schema.columns
   where table_schema = $1 order by table_name, ordinal_position`,
  [SCHEMA],
);
if (!cols.length) throw new Error(`Schema "${SCHEMA}" has no tables. Run \`bun x payload migrate\` first.`);
const tables = new Map<string, Column[]>();
for (const c of cols) {
  if (!tables.has(c.table_name)) tables.set(c.table_name, []);
  tables.get(c.table_name)!.push({ name: c.column_name, type: c.data_type });
}

const fks = await q<{ child: string; parent: string }>(
  `select distinct c.relname as child, p.relname as parent
   from pg_constraint k
   join pg_class c on c.oid = k.conrelid
   join pg_class p on p.oid = k.confrelid
   join pg_namespace n on n.oid = c.relnamespace
   where k.contype = 'f' and n.nspname = $1 and c.relname <> p.relname`,
  [SCHEMA],
);
const order: string[] = [];
{
  const deps = new Map([...tables.keys()].map((t) => [t, new Set<string>()]));
  for (const { child, parent } of fks) deps.get(child)?.add(parent);
  const done = new Set<string>();
  while (done.size < deps.size) {
    const ready = [...deps].filter(([t, d]) => !done.has(t) && [...d].every((p) => done.has(p))).map(([t]) => t);
    if (!ready.length) throw new Error("Foreign-key cycle between tables; cannot order the copy.");
    for (const t of ready.sort()) done.add(t), order.push(t);
  }
}

const srcTables = new Set(
  src
    .query("select name from sqlite_master where type = 'table'")
    .all()
    .map((r) => (r as { name: string }).name),
);

// ── refuse to overwrite ───────────────────────────────────────────────────────
for (const t of mediaOnly ? [] : order) {
  if (SKIP_TABLES.has(t)) continue;
  const [{ n }] = await q<{ n: string }>(`select count(*) as n from "${SCHEMA}"."${t}"`);
  if (Number(n) > 0)
    throw new Error(`"${SCHEMA}"."${t}" already has ${n} row(s); refusing to copy over existing data.`);
}

function convert(value: unknown, type: string): unknown {
  if (value === null || value === undefined) return null;
  if (type === "boolean") return value === 1 || value === "1" || value === true;
  if (type === "jsonb" || type === "json") return typeof value === "string" ? value : JSON.stringify(value);
  return value;
}

// ── copy rows ─────────────────────────────────────────────────────────────────
const report: string[] = [];
if (!mediaOnly) {
  await client.query("begin");
  try {
    for (const t of order) {
      if (SKIP_TABLES.has(t)) continue;
      if (!srcTables.has(t)) {
        report.push(`${t.padEnd(44)} (not in SQLite, left empty)`);
        continue;
      }
      const srcCols = new Set(
        src
          .query(`pragma table_info("${t}")`)
          .all()
          .map((r) => (r as { name: string }).name),
      );
      const target = tables.get(t)!.filter((c) => srcCols.has(c.name));
      const missing = [...srcCols].filter((c) => !target.some((x) => x.name === c));
      const rows = src.query(`select * from "${t}"`).all() as Record<string, unknown>[];
      const BATCH = 200;
      for (let i = 0; i < rows.length; i += BATCH) {
        const chunk = rows.slice(i, i + BATCH);
        const values: unknown[] = [];
        const tuples = chunk.map((row) => {
          const ph = target.map((c) => {
            values.push(convert(row[c.name], c.type));
            return `$${values.length}`;
          });
          return `(${ph.join(", ")})`;
        });
        await client.query(
          `insert into "${SCHEMA}"."${t}" (${target.map((c) => `"${c.name}"`).join(", ")}) values ${tuples.join(", ")}`,
          values as never[],
        );
      }
      report.push(
        `${t.padEnd(44)} ${String(rows.length).padStart(5)} rows${missing.length ? `  (dropped columns: ${missing.join(", ")})` : ""}`,
      );
    }

    // Serial ids continue after the copied rows.
    const serials = await q<{ table_name: string; column_name: string }>(
      `select table_name, column_name from information_schema.columns
     where table_schema = $1 and column_default like 'nextval(%'`,
      [SCHEMA],
    );
    for (const { table_name, column_name } of serials) {
      await client.query(
        `select setval(pg_get_serial_sequence('"${SCHEMA}"."${table_name}"', '${column_name}'),
                     coalesce((select max("${column_name}") from "${SCHEMA}"."${table_name}"), 0) + 1, false)`,
      );
    }
    await client.query("commit");
  } catch (err) {
    await client.query("rollback");
    throw err;
  }
  console.log(`Copied ${sqliteFile} → Supabase schema "${SCHEMA}":\n  ${report.join("\n  ")}`);
}

// ── media files → Supabase Storage ───────────────────────────────────────────
const { SUPABASE_S3_ENDPOINT, SUPABASE_S3_ACCESS_KEY_ID, SUPABASE_S3_SECRET_ACCESS_KEY } = process.env;
if (SUPABASE_S3_ENDPOINT && SUPABASE_S3_ACCESS_KEY_ID && SUPABASE_S3_SECRET_ACCESS_KEY) {
  const bucket = process.env.SUPABASE_S3_BUCKET || "portfolio";
  const s3 = new S3Client({
    endpoint: SUPABASE_S3_ENDPOINT,
    region: process.env.SUPABASE_S3_REGION || "us-east-1",
    forcePathStyle: true,
    credentials: { accessKeyId: SUPABASE_S3_ACCESS_KEY_ID, secretAccessKey: SUPABASE_S3_SECRET_ACCESS_KEY },
  });
  const media = await q<{ filename: string | null; mime_type: string | null; prefix: string | null }>(
    `select filename, mime_type, prefix from "${SCHEMA}"."media"`,
  );
  let uploaded = 0;
  const missing: string[] = [];
  for (const m of media) {
    if (!m.filename) continue;
    const file = path.join(mediaDir, m.filename);
    if (!fs.existsSync(file)) {
      missing.push(m.filename);
      continue;
    }
    const key = m.prefix ? `${m.prefix}/${m.filename}` : m.filename;
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: fs.readFileSync(file),
        ContentType: m.mime_type || undefined,
      }),
    );
    uploaded++;
  }
  console.log(`Uploaded ${uploaded} media file(s) to Supabase Storage bucket "${bucket}".`);
  if (missing.length) console.log(`Not found in ${mediaDir}: ${missing.join(", ")}`);
} else {
  console.log(
    "SUPABASE_S3_* not set: media files were NOT uploaded. Set them, then run `bun run migrate:supabase --media-only`.",
  );
}

await client.end();
