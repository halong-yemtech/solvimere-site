import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`profiles_typing_titles\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`profiles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`profiles_typing_titles_order_idx\` ON \`profiles_typing_titles\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`profiles_typing_titles_parent_id_idx\` ON \`profiles_typing_titles\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`profiles_coding\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`percent\` numeric,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`profiles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`profiles_coding_order_idx\` ON \`profiles_coding\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`profiles_coding_parent_id_idx\` ON \`profiles_coding\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`profiles_knowledge\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`item\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`profiles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`profiles_knowledge_order_idx\` ON \`profiles_knowledge\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`profiles_knowledge_parent_id_idx\` ON \`profiles_knowledge\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`profiles_development\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`percent\` numeric,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`profiles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`profiles_development_order_idx\` ON \`profiles_development\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`profiles_development_parent_id_idx\` ON \`profiles_development\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`profiles_languages\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`level\` numeric,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`profiles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`profiles_languages_order_idx\` ON \`profiles_languages\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`profiles_languages_parent_id_idx\` ON \`profiles_languages\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`profiles\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_order\` text,
  	\`internal_name\` text,
  	\`slug\` text,
  	\`visibility\` text DEFAULT 'public',
  	\`name\` text,
  	\`job_title\` text,
  	\`avatar_id\` integer,
  	\`cv_id\` integer,
  	\`hire_link_label\` text DEFAULT 'my upwork',
  	\`hire_link_url\` text,
  	\`hire_link_icon\` text DEFAULT 'SiUpwork',
  	\`copyright\` text,
  	\`bio\` text,
  	\`age\` text,
  	\`residence\` text,
  	\`status\` text,
  	\`hourly_rate\` numeric,
  	\`address\` text,
  	\`email\` text,
  	\`phone\` text,
  	\`phone_link\` text,
  	\`map_embed_url\` text,
  	\`quote_text\` text,
  	\`quote_author\` text,
  	\`quote_role\` text,
  	\`quote_image_id\` integer,
  	\`blog_intro\` text,
  	\`blog_button_label\` text DEFAULT 'view upwork profile',
  	\`blog_button_url\` text,
  	\`meta_description\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`avatar_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`cv_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`quote_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`profiles__order_idx\` ON \`profiles\` (\`_order\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`profiles_slug_idx\` ON \`profiles\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`profiles_avatar_idx\` ON \`profiles\` (\`avatar_id\`);`)
  await db.run(sql`CREATE INDEX \`profiles_cv_idx\` ON \`profiles\` (\`cv_id\`);`)
  await db.run(sql`CREATE INDEX \`profiles_quote_quote_image_idx\` ON \`profiles\` (\`quote_image_id\`);`)
  await db.run(sql`CREATE INDEX \`profiles_updated_at_idx\` ON \`profiles\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`profiles_created_at_idx\` ON \`profiles\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`profiles__status_idx\` ON \`profiles\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`profiles_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`profiles\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`profiles_rels_order_idx\` ON \`profiles_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`profiles_rels_parent_idx\` ON \`profiles_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`profiles_rels_path_idx\` ON \`profiles_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`profiles_rels_media_id_idx\` ON \`profiles_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`_profiles_v_version_typing_titles\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_profiles_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_profiles_v_version_typing_titles_order_idx\` ON \`_profiles_v_version_typing_titles\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_profiles_v_version_typing_titles_parent_id_idx\` ON \`_profiles_v_version_typing_titles\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_profiles_v_version_coding\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`percent\` numeric,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_profiles_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_profiles_v_version_coding_order_idx\` ON \`_profiles_v_version_coding\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_profiles_v_version_coding_parent_id_idx\` ON \`_profiles_v_version_coding\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_profiles_v_version_knowledge\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`item\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_profiles_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_profiles_v_version_knowledge_order_idx\` ON \`_profiles_v_version_knowledge\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_profiles_v_version_knowledge_parent_id_idx\` ON \`_profiles_v_version_knowledge\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_profiles_v_version_development\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`percent\` numeric,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_profiles_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_profiles_v_version_development_order_idx\` ON \`_profiles_v_version_development\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_profiles_v_version_development_parent_id_idx\` ON \`_profiles_v_version_development\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_profiles_v_version_languages\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`level\` numeric,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_profiles_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_profiles_v_version_languages_order_idx\` ON \`_profiles_v_version_languages\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_profiles_v_version_languages_parent_id_idx\` ON \`_profiles_v_version_languages\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_profiles_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version__order\` text,
  	\`version_internal_name\` text,
  	\`version_slug\` text,
  	\`version_visibility\` text DEFAULT 'public',
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
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`profiles\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_avatar_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_cv_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_quote_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_profiles_v_parent_idx\` ON \`_profiles_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_profiles_v_version_version__order_idx\` ON \`_profiles_v\` (\`version__order\`);`)
  await db.run(sql`CREATE INDEX \`_profiles_v_version_version_slug_idx\` ON \`_profiles_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_profiles_v_version_version_avatar_idx\` ON \`_profiles_v\` (\`version_avatar_id\`);`)
  await db.run(sql`CREATE INDEX \`_profiles_v_version_version_cv_idx\` ON \`_profiles_v\` (\`version_cv_id\`);`)
  await db.run(sql`CREATE INDEX \`_profiles_v_version_quote_version_quote_image_idx\` ON \`_profiles_v\` (\`version_quote_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_profiles_v_version_version_updated_at_idx\` ON \`_profiles_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_profiles_v_version_version_created_at_idx\` ON \`_profiles_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_profiles_v_version_version__status_idx\` ON \`_profiles_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_profiles_v_created_at_idx\` ON \`_profiles_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_profiles_v_updated_at_idx\` ON \`_profiles_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_profiles_v_latest_idx\` ON \`_profiles_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_profiles_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_profiles_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_profiles_v_rels_order_idx\` ON \`_profiles_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_profiles_v_rels_parent_idx\` ON \`_profiles_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_profiles_v_rels_path_idx\` ON \`_profiles_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_profiles_v_rels_media_id_idx\` ON \`_profiles_v_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`social_links_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`profiles_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`social_links\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`profiles_id\`) REFERENCES \`profiles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`social_links_rels_order_idx\` ON \`social_links_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`social_links_rels_parent_idx\` ON \`social_links_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`social_links_rels_path_idx\` ON \`social_links_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`social_links_rels_profiles_id_idx\` ON \`social_links_rels\` (\`profiles_id\`);`)
  await db.run(sql`CREATE TABLE \`_social_links_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`profiles_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_social_links_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`profiles_id\`) REFERENCES \`profiles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_social_links_v_rels_order_idx\` ON \`_social_links_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_social_links_v_rels_parent_idx\` ON \`_social_links_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_social_links_v_rels_path_idx\` ON \`_social_links_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_social_links_v_rels_profiles_id_idx\` ON \`_social_links_v_rels\` (\`profiles_id\`);`)
  await db.run(sql`CREATE TABLE \`services_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`profiles_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`services\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`profiles_id\`) REFERENCES \`profiles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`services_rels_order_idx\` ON \`services_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`services_rels_parent_idx\` ON \`services_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`services_rels_path_idx\` ON \`services_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`services_rels_profiles_id_idx\` ON \`services_rels\` (\`profiles_id\`);`)
  await db.run(sql`CREATE TABLE \`_services_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`profiles_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_services_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`profiles_id\`) REFERENCES \`profiles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_services_v_rels_order_idx\` ON \`_services_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_services_v_rels_parent_idx\` ON \`_services_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_services_v_rels_path_idx\` ON \`_services_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_services_v_rels_profiles_id_idx\` ON \`_services_v_rels\` (\`profiles_id\`);`)
  await db.run(sql`CREATE TABLE \`pricing_plans_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`profiles_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`pricing_plans\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`profiles_id\`) REFERENCES \`profiles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pricing_plans_rels_order_idx\` ON \`pricing_plans_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`pricing_plans_rels_parent_idx\` ON \`pricing_plans_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pricing_plans_rels_path_idx\` ON \`pricing_plans_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`pricing_plans_rels_profiles_id_idx\` ON \`pricing_plans_rels\` (\`profiles_id\`);`)
  await db.run(sql`CREATE TABLE \`_pricing_plans_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`profiles_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_pricing_plans_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`profiles_id\`) REFERENCES \`profiles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pricing_plans_v_rels_order_idx\` ON \`_pricing_plans_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_plans_v_rels_parent_idx\` ON \`_pricing_plans_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_plans_v_rels_path_idx\` ON \`_pricing_plans_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_plans_v_rels_profiles_id_idx\` ON \`_pricing_plans_v_rels\` (\`profiles_id\`);`)
  await db.run(sql`CREATE TABLE \`clients_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`profiles_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`clients\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`profiles_id\`) REFERENCES \`profiles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`clients_rels_order_idx\` ON \`clients_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`clients_rels_parent_idx\` ON \`clients_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`clients_rels_path_idx\` ON \`clients_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`clients_rels_profiles_id_idx\` ON \`clients_rels\` (\`profiles_id\`);`)
  await db.run(sql`CREATE TABLE \`_clients_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`profiles_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_clients_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`profiles_id\`) REFERENCES \`profiles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_clients_v_rels_order_idx\` ON \`_clients_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_clients_v_rels_parent_idx\` ON \`_clients_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_clients_v_rels_path_idx\` ON \`_clients_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_clients_v_rels_profiles_id_idx\` ON \`_clients_v_rels\` (\`profiles_id\`);`)
  await db.run(sql`CREATE TABLE \`testimonials_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`profiles_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`testimonials\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`profiles_id\`) REFERENCES \`profiles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`testimonials_rels_order_idx\` ON \`testimonials_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`testimonials_rels_parent_idx\` ON \`testimonials_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`testimonials_rels_path_idx\` ON \`testimonials_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`testimonials_rels_profiles_id_idx\` ON \`testimonials_rels\` (\`profiles_id\`);`)
  await db.run(sql`CREATE TABLE \`_testimonials_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`profiles_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_testimonials_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`profiles_id\`) REFERENCES \`profiles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_testimonials_v_rels_order_idx\` ON \`_testimonials_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_testimonials_v_rels_parent_idx\` ON \`_testimonials_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_testimonials_v_rels_path_idx\` ON \`_testimonials_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_testimonials_v_rels_profiles_id_idx\` ON \`_testimonials_v_rels\` (\`profiles_id\`);`)
  await db.run(sql`CREATE TABLE \`facts_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`profiles_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`facts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`profiles_id\`) REFERENCES \`profiles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`facts_rels_order_idx\` ON \`facts_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`facts_rels_parent_idx\` ON \`facts_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`facts_rels_path_idx\` ON \`facts_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`facts_rels_profiles_id_idx\` ON \`facts_rels\` (\`profiles_id\`);`)
  await db.run(sql`CREATE TABLE \`_facts_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`profiles_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_facts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`profiles_id\`) REFERENCES \`profiles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_facts_v_rels_order_idx\` ON \`_facts_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_facts_v_rels_parent_idx\` ON \`_facts_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_facts_v_rels_path_idx\` ON \`_facts_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_facts_v_rels_profiles_id_idx\` ON \`_facts_v_rels\` (\`profiles_id\`);`)
  await db.run(sql`CREATE TABLE \`statistics_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`profiles_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`statistics\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`profiles_id\`) REFERENCES \`profiles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`statistics_rels_order_idx\` ON \`statistics_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`statistics_rels_parent_idx\` ON \`statistics_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`statistics_rels_path_idx\` ON \`statistics_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`statistics_rels_profiles_id_idx\` ON \`statistics_rels\` (\`profiles_id\`);`)
  await db.run(sql`CREATE TABLE \`_statistics_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`profiles_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_statistics_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`profiles_id\`) REFERENCES \`profiles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_statistics_v_rels_order_idx\` ON \`_statistics_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_statistics_v_rels_parent_idx\` ON \`_statistics_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_statistics_v_rels_path_idx\` ON \`_statistics_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_statistics_v_rels_profiles_id_idx\` ON \`_statistics_v_rels\` (\`profiles_id\`);`)
  await db.run(sql`CREATE TABLE \`resume_entries_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`profiles_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`resume_entries\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`profiles_id\`) REFERENCES \`profiles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`resume_entries_rels_order_idx\` ON \`resume_entries_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`resume_entries_rels_parent_idx\` ON \`resume_entries_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`resume_entries_rels_path_idx\` ON \`resume_entries_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`resume_entries_rels_profiles_id_idx\` ON \`resume_entries_rels\` (\`profiles_id\`);`)
  await db.run(sql`CREATE TABLE \`_resume_entries_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`profiles_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_resume_entries_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`profiles_id\`) REFERENCES \`profiles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_resume_entries_v_rels_order_idx\` ON \`_resume_entries_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_resume_entries_v_rels_parent_idx\` ON \`_resume_entries_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_resume_entries_v_rels_path_idx\` ON \`_resume_entries_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_resume_entries_v_rels_profiles_id_idx\` ON \`_resume_entries_v_rels\` (\`profiles_id\`);`)
  await db.run(sql`CREATE TABLE \`work_categories_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`profiles_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`work_categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`profiles_id\`) REFERENCES \`profiles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`work_categories_rels_order_idx\` ON \`work_categories_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`work_categories_rels_parent_idx\` ON \`work_categories_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`work_categories_rels_path_idx\` ON \`work_categories_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`work_categories_rels_profiles_id_idx\` ON \`work_categories_rels\` (\`profiles_id\`);`)
  await db.run(sql`CREATE TABLE \`_work_categories_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`profiles_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_work_categories_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`profiles_id\`) REFERENCES \`profiles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_work_categories_v_rels_order_idx\` ON \`_work_categories_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_work_categories_v_rels_parent_idx\` ON \`_work_categories_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_work_categories_v_rels_path_idx\` ON \`_work_categories_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_work_categories_v_rels_profiles_id_idx\` ON \`_work_categories_v_rels\` (\`profiles_id\`);`)
  // drizzle-kit omits ON DELETE on ALTER … ADD COLUMN; restored here to match the schema.
  await db.run(sql`ALTER TABLE \`works_rels\` ADD \`profiles_id\` integer REFERENCES profiles(id) ON DELETE cascade;`)
  await db.run(sql`CREATE INDEX \`works_rels_profiles_id_idx\` ON \`works_rels\` (\`profiles_id\`);`)
  await db.run(sql`ALTER TABLE \`_works_v_rels\` ADD \`profiles_id\` integer REFERENCES profiles(id) ON DELETE cascade;`)
  await db.run(sql`CREATE INDEX \`_works_v_rels_profiles_id_idx\` ON \`_works_v_rels\` (\`profiles_id\`);`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`prefix\` text DEFAULT '';`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`role\` text DEFAULT 'user' NOT NULL;`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`profiles_id\` integer REFERENCES profiles(id) ON DELETE cascade;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_profiles_id_idx\` ON \`payload_locked_documents_rels\` (\`profiles_id\`);`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`active_profile_id\` integer REFERENCES profiles(id) ON DELETE set null;`)
  await db.run(sql`CREATE INDEX \`site_settings_active_profile_idx\` ON \`site_settings\` (\`active_profile_id\`);`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_active_profile_id\` integer REFERENCES profiles(id) ON DELETE set null;`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_version_active_profile_idx\` ON \`_site_settings_v\` (\`version_active_profile_id\`);`)

  // ── Hand-written data migration ───────────────────────────────────────────
  // The Profile and Skills globals become the first document of the new
  // `profiles` collection. Column names are identical, so rows are copied with
  // INSERT … SELECT using the column lists read from the database itself.
  type Row = Record<string, unknown>
  const all = async (q: ReturnType<typeof sql>) => (await db.all(q)) as Row[]
  const columns = async (table: string) =>
    (await all(sql.raw(`PRAGMA table_info("${table}")`))).map((r) => String(r.name))
  const copy = async (from: string, to: string, overrides: Record<string, string> = {}) => {
    const target = new Set(await columns(to))
    const cols = (await columns(from)).filter((c) => target.has(c) && !(c in overrides))
    const dest = [...cols, ...Object.keys(overrides)].map((c) => `"${c}"`).join(", ")
    const src = [...cols.map((c) => `"${c}"`), ...Object.values(overrides)].join(", ")
    await db.run(sql.raw(`INSERT INTO "${to}" (${dest}) SELECT ${src} FROM "${from}"`))
  }

  const [old] = await all(sql`SELECT id, name FROM profile LIMIT 1`)
  if (old) {
    const id = Number(old.id)
    const slug =
      String(old.name ?? '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'main'
    const q = (v: string) => `'${v.replace(/'/g, "''")}'`
    await copy('profile', 'profiles', {
      _order: q('a0'),
      internal_name: q('Main profile'),
      slug: q(slug),
      visibility: q('public'),
      _status: q('published'),
    })
    await copy('profile_typing_titles', 'profiles_typing_titles')
    await copy('profile_rels', 'profiles_rels')
    // Skills lived on their own global; re-parent them onto the profile.
    for (const list of ['coding', 'knowledge', 'development', 'languages']) {
      await copy(`skills_${list}`, `profiles_${list}`, { _parent_id: String(id) })
    }
    // Make it the profile shown at "/" (plain SQL: migrations must not use the
    // Payload API, which always reflects the *latest* schema).
    const [settings] = await all(sql`SELECT id FROM site_settings LIMIT 1`)
    if (settings) {
      await db.run(sql`UPDATE site_settings SET active_profile_id = ${id}, _status = 'published' WHERE id = ${settings.id}`)
    } else {
      await db.run(sql`INSERT INTO site_settings (active_profile_id, _status) VALUES (${id}, 'published')`)
    }
  }

  // Existing accounts were all created as administrators.
  await db.run(sql`UPDATE \`users\` SET \`role\` = 'admin';`)

  // Baseline versions for existing documents are created at startup by
  // cms/hooks/ensureVersions.ts (payload.config.ts → onInit), after all migrations.

  // Drop the old global tables, children before parents.
  await db.run(sql`DROP TABLE \`profile_rels\`;`)
  await db.run(sql`DROP TABLE \`profile_typing_titles\`;`)
  await db.run(sql`DROP TABLE \`_profile_v_rels\`;`)
  await db.run(sql`DROP TABLE \`_profile_v_version_typing_titles\`;`)
  await db.run(sql`DROP TABLE \`_profile_v\`;`)
  await db.run(sql`DROP TABLE \`profile\`;`)
  await db.run(sql`DROP TABLE \`skills_coding\`;`)
  await db.run(sql`DROP TABLE \`skills_knowledge\`;`)
  await db.run(sql`DROP TABLE \`skills_development\`;`)
  await db.run(sql`DROP TABLE \`skills_languages\`;`)
  await db.run(sql`DROP TABLE \`_skills_v_version_coding\`;`)
  await db.run(sql`DROP TABLE \`_skills_v_version_knowledge\`;`)
  await db.run(sql`DROP TABLE \`_skills_v_version_development\`;`)
  await db.run(sql`DROP TABLE \`_skills_v_version_languages\`;`)
  await db.run(sql`DROP TABLE \`_skills_v\`;`)
  await db.run(sql`DROP TABLE \`skills\`;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`profile_typing_titles\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`profile\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`profile_typing_titles_order_idx\` ON \`profile_typing_titles\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`profile_typing_titles_parent_id_idx\` ON \`profile_typing_titles\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`profile\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`job_title\` text,
  	\`avatar_id\` integer,
  	\`cv_id\` integer,
  	\`hire_link_label\` text DEFAULT 'my upwork',
  	\`hire_link_url\` text,
  	\`hire_link_icon\` text DEFAULT 'SiUpwork',
  	\`copyright\` text,
  	\`bio\` text,
  	\`age\` text,
  	\`residence\` text,
  	\`status\` text,
  	\`hourly_rate\` numeric,
  	\`address\` text,
  	\`email\` text,
  	\`phone\` text,
  	\`phone_link\` text,
  	\`map_embed_url\` text,
  	\`quote_text\` text,
  	\`quote_author\` text,
  	\`quote_role\` text,
  	\`quote_image_id\` integer,
  	\`blog_intro\` text,
  	\`blog_button_label\` text DEFAULT 'view upwork profile',
  	\`blog_button_url\` text,
  	\`meta_description\` text,
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`avatar_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`cv_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`quote_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`profile_avatar_idx\` ON \`profile\` (\`avatar_id\`);`)
  await db.run(sql`CREATE INDEX \`profile_cv_idx\` ON \`profile\` (\`cv_id\`);`)
  await db.run(sql`CREATE INDEX \`profile_quote_quote_image_idx\` ON \`profile\` (\`quote_image_id\`);`)
  await db.run(sql`CREATE INDEX \`profile__status_idx\` ON \`profile\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`profile_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`profile\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`profile_rels_order_idx\` ON \`profile_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`profile_rels_parent_idx\` ON \`profile_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`profile_rels_path_idx\` ON \`profile_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`profile_rels_media_id_idx\` ON \`profile_rels\` (\`media_id\`);`)
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
  await db.run(sql`CREATE TABLE \`skills_coding\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`percent\` numeric,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`skills\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`skills_coding_order_idx\` ON \`skills_coding\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`skills_coding_parent_id_idx\` ON \`skills_coding\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`skills_knowledge\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`item\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`skills\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`skills_knowledge_order_idx\` ON \`skills_knowledge\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`skills_knowledge_parent_id_idx\` ON \`skills_knowledge\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`skills_development\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`percent\` numeric,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`skills\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`skills_development_order_idx\` ON \`skills_development\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`skills_development_parent_id_idx\` ON \`skills_development\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`skills_languages\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`level\` numeric,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`skills\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`skills_languages_order_idx\` ON \`skills_languages\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`skills_languages_parent_id_idx\` ON \`skills_languages\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`skills\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`skills__status_idx\` ON \`skills\` (\`_status\`);`)
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
  await db.run(sql`DROP TABLE \`profiles_typing_titles\`;`)
  await db.run(sql`DROP TABLE \`profiles_coding\`;`)
  await db.run(sql`DROP TABLE \`profiles_knowledge\`;`)
  await db.run(sql`DROP TABLE \`profiles_development\`;`)
  await db.run(sql`DROP TABLE \`profiles_languages\`;`)
  await db.run(sql`DROP TABLE \`profiles\`;`)
  await db.run(sql`DROP TABLE \`profiles_rels\`;`)
  await db.run(sql`DROP TABLE \`_profiles_v_version_typing_titles\`;`)
  await db.run(sql`DROP TABLE \`_profiles_v_version_coding\`;`)
  await db.run(sql`DROP TABLE \`_profiles_v_version_knowledge\`;`)
  await db.run(sql`DROP TABLE \`_profiles_v_version_development\`;`)
  await db.run(sql`DROP TABLE \`_profiles_v_version_languages\`;`)
  await db.run(sql`DROP TABLE \`_profiles_v\`;`)
  await db.run(sql`DROP TABLE \`_profiles_v_rels\`;`)
  await db.run(sql`DROP TABLE \`social_links_rels\`;`)
  await db.run(sql`DROP TABLE \`_social_links_v_rels\`;`)
  await db.run(sql`DROP TABLE \`services_rels\`;`)
  await db.run(sql`DROP TABLE \`_services_v_rels\`;`)
  await db.run(sql`DROP TABLE \`pricing_plans_rels\`;`)
  await db.run(sql`DROP TABLE \`_pricing_plans_v_rels\`;`)
  await db.run(sql`DROP TABLE \`clients_rels\`;`)
  await db.run(sql`DROP TABLE \`_clients_v_rels\`;`)
  await db.run(sql`DROP TABLE \`testimonials_rels\`;`)
  await db.run(sql`DROP TABLE \`_testimonials_v_rels\`;`)
  await db.run(sql`DROP TABLE \`facts_rels\`;`)
  await db.run(sql`DROP TABLE \`_facts_v_rels\`;`)
  await db.run(sql`DROP TABLE \`statistics_rels\`;`)
  await db.run(sql`DROP TABLE \`_statistics_v_rels\`;`)
  await db.run(sql`DROP TABLE \`resume_entries_rels\`;`)
  await db.run(sql`DROP TABLE \`_resume_entries_v_rels\`;`)
  await db.run(sql`DROP TABLE \`work_categories_rels\`;`)
  await db.run(sql`DROP TABLE \`_work_categories_v_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_works_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`media_id\` integer,
  	\`work_categories_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`works\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`work_categories_id\`) REFERENCES \`work_categories\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_works_rels\`("id", "order", "parent_id", "path", "media_id", "work_categories_id") SELECT "id", "order", "parent_id", "path", "media_id", "work_categories_id" FROM \`works_rels\`;`)
  await db.run(sql`DROP TABLE \`works_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_works_rels\` RENAME TO \`works_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`works_rels_order_idx\` ON \`works_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`works_rels_parent_idx\` ON \`works_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`works_rels_path_idx\` ON \`works_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`works_rels_media_id_idx\` ON \`works_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`works_rels_work_categories_id_idx\` ON \`works_rels\` (\`work_categories_id\`);`)
  await db.run(sql`CREATE TABLE \`__new__works_v_rels\` (
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
  await db.run(sql`INSERT INTO \`__new__works_v_rels\`("id", "order", "parent_id", "path", "media_id", "work_categories_id") SELECT "id", "order", "parent_id", "path", "media_id", "work_categories_id" FROM \`_works_v_rels\`;`)
  await db.run(sql`DROP TABLE \`_works_v_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new__works_v_rels\` RENAME TO \`_works_v_rels\`;`)
  await db.run(sql`CREATE INDEX \`_works_v_rels_order_idx\` ON \`_works_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_works_v_rels_parent_idx\` ON \`_works_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_works_v_rels_path_idx\` ON \`_works_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_works_v_rels_media_id_idx\` ON \`_works_v_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`_works_v_rels_work_categories_id_idx\` ON \`_works_v_rels\` (\`work_categories_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`contact_messages_id\` integer,
  	\`guestbook_entries_id\` integer,
  	\`social_links_id\` integer,
  	\`services_id\` integer,
  	\`pricing_plans_id\` integer,
  	\`clients_id\` integer,
  	\`testimonials_id\` integer,
  	\`facts_id\` integer,
  	\`statistics_id\` integer,
  	\`resume_entries_id\` integer,
  	\`works_id\` integer,
  	\`work_categories_id\` integer,
  	\`media_id\` integer,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`contact_messages_id\`) REFERENCES \`contact_messages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`guestbook_entries_id\`) REFERENCES \`guestbook_entries\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`social_links_id\`) REFERENCES \`social_links\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`services_id\`) REFERENCES \`services\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pricing_plans_id\`) REFERENCES \`pricing_plans\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`clients_id\`) REFERENCES \`clients\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`testimonials_id\`) REFERENCES \`testimonials\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`facts_id\`) REFERENCES \`facts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`statistics_id\`) REFERENCES \`statistics\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`resume_entries_id\`) REFERENCES \`resume_entries\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`works_id\`) REFERENCES \`works\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`work_categories_id\`) REFERENCES \`work_categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "contact_messages_id", "guestbook_entries_id", "social_links_id", "services_id", "pricing_plans_id", "clients_id", "testimonials_id", "facts_id", "statistics_id", "resume_entries_id", "works_id", "work_categories_id", "media_id", "users_id") SELECT "id", "order", "parent_id", "path", "contact_messages_id", "guestbook_entries_id", "social_links_id", "services_id", "pricing_plans_id", "clients_id", "testimonials_id", "facts_id", "statistics_id", "resume_entries_id", "works_id", "work_categories_id", "media_id", "users_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_contact_messages_id_idx\` ON \`payload_locked_documents_rels\` (\`contact_messages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_guestbook_entries_id_idx\` ON \`payload_locked_documents_rels\` (\`guestbook_entries_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_social_links_id_idx\` ON \`payload_locked_documents_rels\` (\`social_links_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_services_id_idx\` ON \`payload_locked_documents_rels\` (\`services_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_pricing_plans_id_idx\` ON \`payload_locked_documents_rels\` (\`pricing_plans_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_clients_id_idx\` ON \`payload_locked_documents_rels\` (\`clients_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_testimonials_id_idx\` ON \`payload_locked_documents_rels\` (\`testimonials_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_facts_id_idx\` ON \`payload_locked_documents_rels\` (\`facts_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_statistics_id_idx\` ON \`payload_locked_documents_rels\` (\`statistics_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_resume_entries_id_idx\` ON \`payload_locked_documents_rels\` (\`resume_entries_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_works_id_idx\` ON \`payload_locked_documents_rels\` (\`works_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_work_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`work_categories_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_site_settings\` (
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
  await db.run(sql`INSERT INTO \`__new_site_settings\`("id", "theme_accent", "theme_font", "maintenance_enabled", "maintenance_message", "_status", "updated_at", "created_at") SELECT "id", "theme_accent", "theme_font", "maintenance_enabled", "maintenance_message", "_status", "updated_at", "created_at" FROM \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`ALTER TABLE \`__new_site_settings\` RENAME TO \`site_settings\`;`)
  await db.run(sql`CREATE INDEX \`site_settings__status_idx\` ON \`site_settings\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`__new__site_settings_v\` (
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
  await db.run(sql`INSERT INTO \`__new__site_settings_v\`("id", "version_theme_accent", "version_theme_font", "version_maintenance_enabled", "version_maintenance_message", "version__status", "version_updated_at", "version_created_at", "created_at", "updated_at", "latest") SELECT "id", "version_theme_accent", "version_theme_font", "version_maintenance_enabled", "version_maintenance_message", "version__status", "version_updated_at", "version_created_at", "created_at", "updated_at", "latest" FROM \`_site_settings_v\`;`)
  await db.run(sql`DROP TABLE \`_site_settings_v\`;`)
  await db.run(sql`ALTER TABLE \`__new__site_settings_v\` RENAME TO \`_site_settings_v\`;`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_version__status_idx\` ON \`_site_settings_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_created_at_idx\` ON \`_site_settings_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_updated_at_idx\` ON \`_site_settings_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_latest_idx\` ON \`_site_settings_v\` (\`latest\`);`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`prefix\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`role\`;`)
}
