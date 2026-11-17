import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`profiles\` ADD \`cv_settings_mode\` text DEFAULT 'generated';`)
  await db.run(sql`ALTER TABLE \`profiles\` ADD \`cv_settings_headline\` text;`)
  await db.run(sql`ALTER TABLE \`profiles\` ADD \`cv_settings_location\` text;`)
  await db.run(sql`ALTER TABLE \`profiles\` ADD \`cv_settings_summary\` text;`)
  await db.run(sql`ALTER TABLE \`profiles\` ADD \`cv_settings_skills\` text;`)
  await db.run(sql`ALTER TABLE \`_profiles_v\` ADD \`version_cv_settings_mode\` text DEFAULT 'generated';`)
  await db.run(sql`ALTER TABLE \`_profiles_v\` ADD \`version_cv_settings_headline\` text;`)
  await db.run(sql`ALTER TABLE \`_profiles_v\` ADD \`version_cv_settings_location\` text;`)
  await db.run(sql`ALTER TABLE \`_profiles_v\` ADD \`version_cv_settings_summary\` text;`)
  await db.run(sql`ALTER TABLE \`_profiles_v\` ADD \`version_cv_settings_skills\` text;`)
  await db.run(sql`ALTER TABLE \`resume_entries\` ADD \`location\` text;`)
  await db.run(sql`ALTER TABLE \`_resume_entries_v\` ADD \`version_location\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`profiles\` DROP COLUMN \`cv_settings_mode\`;`)
  await db.run(sql`ALTER TABLE \`profiles\` DROP COLUMN \`cv_settings_headline\`;`)
  await db.run(sql`ALTER TABLE \`profiles\` DROP COLUMN \`cv_settings_location\`;`)
  await db.run(sql`ALTER TABLE \`profiles\` DROP COLUMN \`cv_settings_summary\`;`)
  await db.run(sql`ALTER TABLE \`profiles\` DROP COLUMN \`cv_settings_skills\`;`)
  await db.run(sql`ALTER TABLE \`_profiles_v\` DROP COLUMN \`version_cv_settings_mode\`;`)
  await db.run(sql`ALTER TABLE \`_profiles_v\` DROP COLUMN \`version_cv_settings_headline\`;`)
  await db.run(sql`ALTER TABLE \`_profiles_v\` DROP COLUMN \`version_cv_settings_location\`;`)
  await db.run(sql`ALTER TABLE \`_profiles_v\` DROP COLUMN \`version_cv_settings_summary\`;`)
  await db.run(sql`ALTER TABLE \`_profiles_v\` DROP COLUMN \`version_cv_settings_skills\`;`)
  await db.run(sql`ALTER TABLE \`resume_entries\` DROP COLUMN \`location\`;`)
  await db.run(sql`ALTER TABLE \`_resume_entries_v\` DROP COLUMN \`version_location\`;`)
}
