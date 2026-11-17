import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`blog_posts\` ADD \`github_username\` text;`)
  await db.run(sql`ALTER TABLE \`_blog_posts_v\` ADD \`version_github_username\` text;`)
  // Starter GitHub post (if present): show the live contribution graph.
  await db.run(sql`UPDATE \`blog_posts\` SET \`github_username\` = 'aliabbas12' WHERE \`url\` = 'https://github.com/aliabbas12';`)
  await db.run(sql`UPDATE \`_blog_posts_v\` SET \`version_github_username\` = 'aliabbas12' WHERE \`version_url\` = 'https://github.com/aliabbas12';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`blog_posts\` DROP COLUMN \`github_username\`;`)
  await db.run(sql`ALTER TABLE \`_blog_posts_v\` DROP COLUMN \`version_github_username\`;`)
}
