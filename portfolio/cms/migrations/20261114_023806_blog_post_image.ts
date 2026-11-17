import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`blog_posts\` ADD \`image_id\` integer REFERENCES media(id) ON DELETE set null;`)
  await db.run(sql`ALTER TABLE \`blog_posts\` ADD \`image_caption\` text;`)
  await db.run(sql`CREATE INDEX \`blog_posts_image_idx\` ON \`blog_posts\` (\`image_id\`);`)
  await db.run(sql`ALTER TABLE \`_blog_posts_v\` ADD \`version_image_id\` integer REFERENCES media(id) ON DELETE set null;`)
  await db.run(sql`ALTER TABLE \`_blog_posts_v\` ADD \`version_image_caption\` text;`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_version_version_image_idx\` ON \`_blog_posts_v\` (\`version_image_id\`);`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // No table rebuild (on Turso it would cascade-delete child rows). SQLite can't drop
  // FK columns in place, so the image columns stay; only the extras are removed.
  await db.run(sql`DROP INDEX IF EXISTS \`blog_posts_image_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`_blog_posts_v_version_version_image_idx\`;`)
  await db.run(sql`ALTER TABLE \`blog_posts\` DROP COLUMN \`image_caption\`;`)
  await db.run(sql`ALTER TABLE \`_blog_posts_v\` DROP COLUMN \`version_image_caption\`;`)
}
