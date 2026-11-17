import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`_social_links_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version__order\` text,
  	\`version_label\` text,
  	\`version_url\` text,
  	\`version_icon\` text,
  	\`version_color\` text DEFAULT '#ffffff',
  	\`version_info\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`social_links\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_social_links_v_parent_idx\` ON \`_social_links_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_social_links_v_version_version__order_idx\` ON \`_social_links_v\` (\`version__order\`);`)
  await db.run(sql`CREATE INDEX \`_social_links_v_version_version_updated_at_idx\` ON \`_social_links_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_social_links_v_version_version_created_at_idx\` ON \`_social_links_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_social_links_v_version_version__status_idx\` ON \`_social_links_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_social_links_v_created_at_idx\` ON \`_social_links_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_social_links_v_updated_at_idx\` ON \`_social_links_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_social_links_v_latest_idx\` ON \`_social_links_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_services_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version__order\` text,
  	\`version_title\` text,
  	\`version_icon\` text,
  	\`version_description\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`services\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_services_v_parent_idx\` ON \`_services_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_services_v_version_version__order_idx\` ON \`_services_v\` (\`version__order\`);`)
  await db.run(sql`CREATE INDEX \`_services_v_version_version_updated_at_idx\` ON \`_services_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_services_v_version_version_created_at_idx\` ON \`_services_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_services_v_version_version__status_idx\` ON \`_services_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_services_v_created_at_idx\` ON \`_services_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_services_v_updated_at_idx\` ON \`_services_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_services_v_latest_idx\` ON \`_services_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_pricing_plans_v_version_features\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`feature\` text,
  	\`included\` integer DEFAULT true,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pricing_plans_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pricing_plans_v_version_features_order_idx\` ON \`_pricing_plans_v_version_features\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_plans_v_version_features_parent_id_idx\` ON \`_pricing_plans_v_version_features\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pricing_plans_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version__order\` text,
  	\`version_name\` text,
  	\`version_icon\` text DEFAULT 'DiCodeigniter',
  	\`version_price\` numeric,
  	\`version_period\` text DEFAULT 'hour',
  	\`version_order_url\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`pricing_plans\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_pricing_plans_v_parent_idx\` ON \`_pricing_plans_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_plans_v_version_version__order_idx\` ON \`_pricing_plans_v\` (\`version__order\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_plans_v_version_version_updated_at_idx\` ON \`_pricing_plans_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_plans_v_version_version_created_at_idx\` ON \`_pricing_plans_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_plans_v_version_version__status_idx\` ON \`_pricing_plans_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_plans_v_created_at_idx\` ON \`_pricing_plans_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_plans_v_updated_at_idx\` ON \`_pricing_plans_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_plans_v_latest_idx\` ON \`_pricing_plans_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_clients_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version__order\` text,
  	\`version_name\` text,
  	\`version_url\` text,
  	\`version_icon\` text,
  	\`version_logo_id\` integer,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`clients\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_clients_v_parent_idx\` ON \`_clients_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_clients_v_version_version__order_idx\` ON \`_clients_v\` (\`version__order\`);`)
  await db.run(sql`CREATE INDEX \`_clients_v_version_version_logo_idx\` ON \`_clients_v\` (\`version_logo_id\`);`)
  await db.run(sql`CREATE INDEX \`_clients_v_version_version_updated_at_idx\` ON \`_clients_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_clients_v_version_version_created_at_idx\` ON \`_clients_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_clients_v_version_version__status_idx\` ON \`_clients_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_clients_v_created_at_idx\` ON \`_clients_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_clients_v_updated_at_idx\` ON \`_clients_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_clients_v_latest_idx\` ON \`_clients_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_testimonials_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version__order\` text,
  	\`version_quote\` text,
  	\`version_name\` text,
  	\`version_role\` text,
  	\`version_photo_id\` integer,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`testimonials\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_testimonials_v_parent_idx\` ON \`_testimonials_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_testimonials_v_version_version__order_idx\` ON \`_testimonials_v\` (\`version__order\`);`)
  await db.run(sql`CREATE INDEX \`_testimonials_v_version_version_photo_idx\` ON \`_testimonials_v\` (\`version_photo_id\`);`)
  await db.run(sql`CREATE INDEX \`_testimonials_v_version_version_updated_at_idx\` ON \`_testimonials_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_testimonials_v_version_version_created_at_idx\` ON \`_testimonials_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_testimonials_v_version_version__status_idx\` ON \`_testimonials_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_testimonials_v_created_at_idx\` ON \`_testimonials_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_testimonials_v_updated_at_idx\` ON \`_testimonials_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_testimonials_v_latest_idx\` ON \`_testimonials_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_facts_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version__order\` text,
  	\`version_icon\` text,
  	\`version_description\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`facts\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_facts_v_parent_idx\` ON \`_facts_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_facts_v_version_version__order_idx\` ON \`_facts_v\` (\`version__order\`);`)
  await db.run(sql`CREATE INDEX \`_facts_v_version_version_updated_at_idx\` ON \`_facts_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_facts_v_version_version_created_at_idx\` ON \`_facts_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_facts_v_version_version__status_idx\` ON \`_facts_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_facts_v_created_at_idx\` ON \`_facts_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_facts_v_updated_at_idx\` ON \`_facts_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_facts_v_latest_idx\` ON \`_facts_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_statistics_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version__order\` text,
  	\`version_title\` text,
  	\`version_value\` text,
  	\`version_link\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`statistics\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_statistics_v_parent_idx\` ON \`_statistics_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_statistics_v_version_version__order_idx\` ON \`_statistics_v\` (\`version__order\`);`)
  await db.run(sql`CREATE INDEX \`_statistics_v_version_version_updated_at_idx\` ON \`_statistics_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_statistics_v_version_version_created_at_idx\` ON \`_statistics_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_statistics_v_version_version__status_idx\` ON \`_statistics_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_statistics_v_created_at_idx\` ON \`_statistics_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_statistics_v_updated_at_idx\` ON \`_statistics_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_statistics_v_latest_idx\` ON \`_statistics_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_resume_entries_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version__order\` text,
  	\`version_type\` text DEFAULT 'experience',
  	\`version_period\` text,
  	\`version_title\` text,
  	\`version_subtitle\` text,
  	\`version_description\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`resume_entries\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_resume_entries_v_parent_idx\` ON \`_resume_entries_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_resume_entries_v_version_version__order_idx\` ON \`_resume_entries_v\` (\`version__order\`);`)
  await db.run(sql`CREATE INDEX \`_resume_entries_v_version_version_updated_at_idx\` ON \`_resume_entries_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_resume_entries_v_version_version_created_at_idx\` ON \`_resume_entries_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_resume_entries_v_version_version__status_idx\` ON \`_resume_entries_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_resume_entries_v_created_at_idx\` ON \`_resume_entries_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_resume_entries_v_updated_at_idx\` ON \`_resume_entries_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_resume_entries_v_latest_idx\` ON \`_resume_entries_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_works_v_version_tech_stack\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_works_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_works_v_version_tech_stack_order_idx\` ON \`_works_v_version_tech_stack\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_works_v_version_tech_stack_parent_id_idx\` ON \`_works_v_version_tech_stack\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_works_v_version_highlights\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`item\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_works_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_works_v_version_highlights_order_idx\` ON \`_works_v_version_highlights\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_works_v_version_highlights_parent_id_idx\` ON \`_works_v_version_highlights\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_works_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version__order\` text,
  	\`version_title\` text,
  	\`version_description\` text,
  	\`version_client\` text,
  	\`version_owner\` text,
  	\`version_date\` text,
  	\`version_project_url\` text,
  	\`version_github_url\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`works\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_works_v_parent_idx\` ON \`_works_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_works_v_version_version__order_idx\` ON \`_works_v\` (\`version__order\`);`)
  await db.run(sql`CREATE INDEX \`_works_v_version_version_updated_at_idx\` ON \`_works_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_works_v_version_version_created_at_idx\` ON \`_works_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_works_v_version_version__status_idx\` ON \`_works_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_works_v_created_at_idx\` ON \`_works_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_works_v_updated_at_idx\` ON \`_works_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_works_v_latest_idx\` ON \`_works_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_works_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`media_id\` integer,
  	\`work_categories_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_works_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`work_categories_id\`) REFERENCES \`work_categories\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_works_v_rels_order_idx\` ON \`_works_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_works_v_rels_parent_idx\` ON \`_works_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_works_v_rels_path_idx\` ON \`_works_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_works_v_rels_media_id_idx\` ON \`_works_v_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`_works_v_rels_work_categories_id_idx\` ON \`_works_v_rels\` (\`work_categories_id\`);`)
  await db.run(sql`CREATE TABLE \`_work_categories_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version__order\` text,
  	\`version_name\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`work_categories\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_work_categories_v_parent_idx\` ON \`_work_categories_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_work_categories_v_version_version__order_idx\` ON \`_work_categories_v\` (\`version__order\`);`)
  await db.run(sql`CREATE INDEX \`_work_categories_v_version_version_name_idx\` ON \`_work_categories_v\` (\`version_name\`);`)
  await db.run(sql`CREATE INDEX \`_work_categories_v_version_version_updated_at_idx\` ON \`_work_categories_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_work_categories_v_version_version_created_at_idx\` ON \`_work_categories_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_work_categories_v_version_version__status_idx\` ON \`_work_categories_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_work_categories_v_created_at_idx\` ON \`_work_categories_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_work_categories_v_updated_at_idx\` ON \`_work_categories_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_work_categories_v_latest_idx\` ON \`_work_categories_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_profile_v_version_typing_titles\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_profile_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_profile_v_version_typing_titles_order_idx\` ON \`_profile_v_version_typing_titles\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_profile_v_version_typing_titles_parent_id_idx\` ON \`_profile_v_version_typing_titles\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_profile_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_name\` text,
  	\`version_job_title\` text,
  	\`version_avatar_id\` integer,
  	\`version_cv_id\` integer,
  	\`version_hire_link_label\` text DEFAULT 'my upwork',
  	\`version_hire_link_url\` text,
  	\`version_hire_link_icon\` text DEFAULT 'SiUpwork',
  	\`version_copyright\` text,
  	\`version_bio\` text,
  	\`version_age\` text,
  	\`version_residence\` text,
  	\`version_status\` text,
  	\`version_hourly_rate\` numeric,
  	\`version_address\` text,
  	\`version_email\` text,
  	\`version_phone\` text,
  	\`version_phone_link\` text,
  	\`version_map_embed_url\` text,
  	\`version_quote_text\` text,
  	\`version_quote_author\` text,
  	\`version_quote_role\` text,
  	\`version_quote_image_id\` integer,
  	\`version_blog_intro\` text,
  	\`version_blog_button_label\` text DEFAULT 'view upwork profile',
  	\`version_blog_button_url\` text,
  	\`version_meta_description\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`version_avatar_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_cv_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_quote_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_profile_v_version_version_avatar_idx\` ON \`_profile_v\` (\`version_avatar_id\`);`)
  await db.run(sql`CREATE INDEX \`_profile_v_version_version_cv_idx\` ON \`_profile_v\` (\`version_cv_id\`);`)
  await db.run(sql`CREATE INDEX \`_profile_v_version_quote_version_quote_image_idx\` ON \`_profile_v\` (\`version_quote_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_profile_v_version_version__status_idx\` ON \`_profile_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_profile_v_created_at_idx\` ON \`_profile_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_profile_v_updated_at_idx\` ON \`_profile_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_profile_v_latest_idx\` ON \`_profile_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_profile_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_profile_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_profile_v_rels_order_idx\` ON \`_profile_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_profile_v_rels_parent_idx\` ON \`_profile_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_profile_v_rels_path_idx\` ON \`_profile_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_profile_v_rels_media_id_idx\` ON \`_profile_v_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`_skills_v_version_coding\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`percent\` numeric,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_skills_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_skills_v_version_coding_order_idx\` ON \`_skills_v_version_coding\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_skills_v_version_coding_parent_id_idx\` ON \`_skills_v_version_coding\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_skills_v_version_knowledge\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`item\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_skills_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_skills_v_version_knowledge_order_idx\` ON \`_skills_v_version_knowledge\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_skills_v_version_knowledge_parent_id_idx\` ON \`_skills_v_version_knowledge\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_skills_v_version_development\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`percent\` numeric,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_skills_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_skills_v_version_development_order_idx\` ON \`_skills_v_version_development\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_skills_v_version_development_parent_id_idx\` ON \`_skills_v_version_development\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_skills_v_version_languages\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`level\` numeric,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_skills_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_skills_v_version_languages_order_idx\` ON \`_skills_v_version_languages\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_skills_v_version_languages_parent_id_idx\` ON \`_skills_v_version_languages\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_skills_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version__status\` text DEFAULT 'draft',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer
  );
  `)
  await db.run(sql`CREATE INDEX \`_skills_v_version_version__status_idx\` ON \`_skills_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_skills_v_created_at_idx\` ON \`_skills_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_skills_v_updated_at_idx\` ON \`_skills_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_skills_v_latest_idx\` ON \`_skills_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`key\` text,
  	\`label\` text,
  	\`visible\` integer DEFAULT true,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_sections_order_idx\` ON \`site_settings_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_sections_parent_id_idx\` ON \`site_settings_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`site_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`theme_accent\` text DEFAULT '#f59e0b',
  	\`theme_font\` text DEFAULT 'poppins',
  	\`maintenance_enabled\` integer DEFAULT false,
  	\`maintenance_message\` text DEFAULT 'The site is being updated. Please check back soon.',
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings__status_idx\` ON \`site_settings\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_site_settings_v_version_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text,
  	\`label\` text,
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_site_settings_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_sections_order_idx\` ON \`_site_settings_v_version_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_sections_parent_id_idx\` ON \`_site_settings_v_version_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_site_settings_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_theme_accent\` text DEFAULT '#f59e0b',
  	\`version_theme_font\` text DEFAULT 'poppins',
  	\`version_maintenance_enabled\` integer DEFAULT false,
  	\`version_maintenance_message\` text DEFAULT 'The site is being updated. Please check back soon.',
  	\`version__status\` text DEFAULT 'draft',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer
  );
  `)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_version__status_idx\` ON \`_site_settings_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_created_at_idx\` ON \`_site_settings_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_updated_at_idx\` ON \`_site_settings_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_latest_idx\` ON \`_site_settings_v\` (\`latest\`);`)
  // ── Hand-edited ────────────────────────────────────────────────────────────
  // drizzle-kit generated a drop-and-rebuild of every content table here (to add
  // _status and relax NOT NULL for drafts). On Turso each statement runs over its
  // own HTTP request, so "PRAGMA foreign_keys=OFF" does not persist and DROP TABLE
  // would cascade-delete child rows (pricing features, work images, …). Instead we
  // only ADD the _status column and mark every existing row as published.
  // NOT NULL constraints on required fields are kept, so drafts must have their
  // required fields filled (the on-site editor always does).
  await db.run(sql`ALTER TABLE \`social_links\` ADD \`_status\` text DEFAULT 'draft';`)
  await db.run(sql`UPDATE \`social_links\` SET \`_status\` = 'published';`)
  await db.run(sql`CREATE INDEX \`social_links__status_idx\` ON \`social_links\` (\`_status\`);`)
  await db.run(sql`ALTER TABLE \`services\` ADD \`_status\` text DEFAULT 'draft';`)
  await db.run(sql`UPDATE \`services\` SET \`_status\` = 'published';`)
  await db.run(sql`CREATE INDEX \`services__status_idx\` ON \`services\` (\`_status\`);`)
  await db.run(sql`ALTER TABLE \`pricing_plans\` ADD \`_status\` text DEFAULT 'draft';`)
  await db.run(sql`UPDATE \`pricing_plans\` SET \`_status\` = 'published';`)
  await db.run(sql`CREATE INDEX \`pricing_plans__status_idx\` ON \`pricing_plans\` (\`_status\`);`)
  await db.run(sql`ALTER TABLE \`clients\` ADD \`_status\` text DEFAULT 'draft';`)
  await db.run(sql`UPDATE \`clients\` SET \`_status\` = 'published';`)
  await db.run(sql`CREATE INDEX \`clients__status_idx\` ON \`clients\` (\`_status\`);`)
  await db.run(sql`ALTER TABLE \`testimonials\` ADD \`_status\` text DEFAULT 'draft';`)
  await db.run(sql`UPDATE \`testimonials\` SET \`_status\` = 'published';`)
  await db.run(sql`CREATE INDEX \`testimonials__status_idx\` ON \`testimonials\` (\`_status\`);`)
  await db.run(sql`ALTER TABLE \`facts\` ADD \`_status\` text DEFAULT 'draft';`)
  await db.run(sql`UPDATE \`facts\` SET \`_status\` = 'published';`)
  await db.run(sql`CREATE INDEX \`facts__status_idx\` ON \`facts\` (\`_status\`);`)
  await db.run(sql`ALTER TABLE \`statistics\` ADD \`_status\` text DEFAULT 'draft';`)
  await db.run(sql`UPDATE \`statistics\` SET \`_status\` = 'published';`)
  await db.run(sql`CREATE INDEX \`statistics__status_idx\` ON \`statistics\` (\`_status\`);`)
  await db.run(sql`ALTER TABLE \`resume_entries\` ADD \`_status\` text DEFAULT 'draft';`)
  await db.run(sql`UPDATE \`resume_entries\` SET \`_status\` = 'published';`)
  await db.run(sql`CREATE INDEX \`resume_entries__status_idx\` ON \`resume_entries\` (\`_status\`);`)
  await db.run(sql`ALTER TABLE \`works\` ADD \`_status\` text DEFAULT 'draft';`)
  await db.run(sql`UPDATE \`works\` SET \`_status\` = 'published';`)
  await db.run(sql`CREATE INDEX \`works__status_idx\` ON \`works\` (\`_status\`);`)
  await db.run(sql`ALTER TABLE \`work_categories\` ADD \`_status\` text DEFAULT 'draft';`)
  await db.run(sql`UPDATE \`work_categories\` SET \`_status\` = 'published';`)
  await db.run(sql`CREATE INDEX \`work_categories__status_idx\` ON \`work_categories\` (\`_status\`);`)
  await db.run(sql`ALTER TABLE \`profile\` ADD \`_status\` text DEFAULT 'draft';`)
  await db.run(sql`UPDATE \`profile\` SET \`_status\` = 'published';`)
  await db.run(sql`CREATE INDEX \`profile__status_idx\` ON \`profile\` (\`_status\`);`)
  await db.run(sql`ALTER TABLE \`skills\` ADD \`_status\` text DEFAULT 'draft';`)
  await db.run(sql`UPDATE \`skills\` SET \`_status\` = 'published';`)
  await db.run(sql`CREATE INDEX \`skills__status_idx\` ON \`skills\` (\`_status\`);`)

  // Baseline versions for existing documents are created at startup by
  // cms/hooks/ensureVersions.ts (payload.config.ts → onInit), after all migrations.
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`_social_links_v\`;`)
  await db.run(sql`DROP TABLE \`_services_v\`;`)
  await db.run(sql`DROP TABLE \`_pricing_plans_v_version_features\`;`)
  await db.run(sql`DROP TABLE \`_pricing_plans_v\`;`)
  await db.run(sql`DROP TABLE \`_clients_v\`;`)
  await db.run(sql`DROP TABLE \`_testimonials_v\`;`)
  await db.run(sql`DROP TABLE \`_facts_v\`;`)
  await db.run(sql`DROP TABLE \`_statistics_v\`;`)
  await db.run(sql`DROP TABLE \`_resume_entries_v\`;`)
  await db.run(sql`DROP TABLE \`_works_v_version_tech_stack\`;`)
  await db.run(sql`DROP TABLE \`_works_v_version_highlights\`;`)
  await db.run(sql`DROP TABLE \`_works_v\`;`)
  await db.run(sql`DROP TABLE \`_works_v_rels\`;`)
  await db.run(sql`DROP TABLE \`_work_categories_v\`;`)
  await db.run(sql`DROP TABLE \`_profile_v_version_typing_titles\`;`)
  await db.run(sql`DROP TABLE \`_profile_v\`;`)
  await db.run(sql`DROP TABLE \`_profile_v_rels\`;`)
  await db.run(sql`DROP TABLE \`_skills_v_version_coding\`;`)
  await db.run(sql`DROP TABLE \`_skills_v_version_knowledge\`;`)
  await db.run(sql`DROP TABLE \`_skills_v_version_development\`;`)
  await db.run(sql`DROP TABLE \`_skills_v_version_languages\`;`)
  await db.run(sql`DROP TABLE \`_skills_v\`;`)
  await db.run(sql`DROP TABLE \`site_settings_sections\`;`)
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`_site_settings_v_version_sections\`;`)
  await db.run(sql`DROP TABLE \`_site_settings_v\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`social_links__status_idx\`;`)
  await db.run(sql`ALTER TABLE \`social_links\` DROP COLUMN \`_status\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`services__status_idx\`;`)
  await db.run(sql`ALTER TABLE \`services\` DROP COLUMN \`_status\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`pricing_plans__status_idx\`;`)
  await db.run(sql`ALTER TABLE \`pricing_plans\` DROP COLUMN \`_status\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`clients__status_idx\`;`)
  await db.run(sql`ALTER TABLE \`clients\` DROP COLUMN \`_status\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`testimonials__status_idx\`;`)
  await db.run(sql`ALTER TABLE \`testimonials\` DROP COLUMN \`_status\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`facts__status_idx\`;`)
  await db.run(sql`ALTER TABLE \`facts\` DROP COLUMN \`_status\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`statistics__status_idx\`;`)
  await db.run(sql`ALTER TABLE \`statistics\` DROP COLUMN \`_status\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`resume_entries__status_idx\`;`)
  await db.run(sql`ALTER TABLE \`resume_entries\` DROP COLUMN \`_status\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`works__status_idx\`;`)
  await db.run(sql`ALTER TABLE \`works\` DROP COLUMN \`_status\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`work_categories__status_idx\`;`)
  await db.run(sql`ALTER TABLE \`work_categories\` DROP COLUMN \`_status\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`profile__status_idx\`;`)
  await db.run(sql`ALTER TABLE \`profile\` DROP COLUMN \`_status\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`skills__status_idx\`;`)
  await db.run(sql`ALTER TABLE \`skills\` DROP COLUMN \`_status\`;`)
}
