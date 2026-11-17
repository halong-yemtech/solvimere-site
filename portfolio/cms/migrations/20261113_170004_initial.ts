import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`contact_messages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`full_name\` text NOT NULL,
  	\`email\` text NOT NULL,
  	\`message\` text NOT NULL,
  	\`handled\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`contact_messages_updated_at_idx\` ON \`contact_messages\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`contact_messages_created_at_idx\` ON \`contact_messages\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`guestbook_entries\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`comment\` text NOT NULL,
  	\`approved\` integer DEFAULT true,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`guestbook_entries_updated_at_idx\` ON \`guestbook_entries\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`guestbook_entries_created_at_idx\` ON \`guestbook_entries\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`social_links\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_order\` text,
  	\`label\` text NOT NULL,
  	\`url\` text NOT NULL,
  	\`icon\` text NOT NULL,
  	\`color\` text DEFAULT '#ffffff',
  	\`info\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`social_links__order_idx\` ON \`social_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`social_links_updated_at_idx\` ON \`social_links\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`social_links_created_at_idx\` ON \`social_links\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`services\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_order\` text,
  	\`title\` text NOT NULL,
  	\`icon\` text NOT NULL,
  	\`description\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`services__order_idx\` ON \`services\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`services_updated_at_idx\` ON \`services\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`services_created_at_idx\` ON \`services\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`pricing_plans_features\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`feature\` text NOT NULL,
  	\`included\` integer DEFAULT true,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_plans\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pricing_plans_features_order_idx\` ON \`pricing_plans_features\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pricing_plans_features_parent_id_idx\` ON \`pricing_plans_features\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pricing_plans\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_order\` text,
  	\`name\` text NOT NULL,
  	\`icon\` text DEFAULT 'DiCodeigniter' NOT NULL,
  	\`price\` numeric NOT NULL,
  	\`period\` text DEFAULT 'hour',
  	\`order_url\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`pricing_plans__order_idx\` ON \`pricing_plans\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pricing_plans_updated_at_idx\` ON \`pricing_plans\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`pricing_plans_created_at_idx\` ON \`pricing_plans\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`clients\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_order\` text,
  	\`name\` text NOT NULL,
  	\`url\` text NOT NULL,
  	\`icon\` text,
  	\`logo_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`clients__order_idx\` ON \`clients\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`clients_logo_idx\` ON \`clients\` (\`logo_id\`);`)
  await db.run(sql`CREATE INDEX \`clients_updated_at_idx\` ON \`clients\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`clients_created_at_idx\` ON \`clients\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`testimonials\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_order\` text,
  	\`quote\` text NOT NULL,
  	\`name\` text NOT NULL,
  	\`role\` text,
  	\`photo_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`testimonials__order_idx\` ON \`testimonials\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`testimonials_photo_idx\` ON \`testimonials\` (\`photo_id\`);`)
  await db.run(sql`CREATE INDEX \`testimonials_updated_at_idx\` ON \`testimonials\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`testimonials_created_at_idx\` ON \`testimonials\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`facts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_order\` text,
  	\`icon\` text NOT NULL,
  	\`description\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`facts__order_idx\` ON \`facts\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`facts_updated_at_idx\` ON \`facts\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`facts_created_at_idx\` ON \`facts\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`statistics\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_order\` text,
  	\`title\` text NOT NULL,
  	\`value\` text NOT NULL,
  	\`link\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`statistics__order_idx\` ON \`statistics\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`statistics_updated_at_idx\` ON \`statistics\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`statistics_created_at_idx\` ON \`statistics\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`resume_entries\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_order\` text,
  	\`type\` text DEFAULT 'experience' NOT NULL,
  	\`period\` text NOT NULL,
  	\`title\` text NOT NULL,
  	\`subtitle\` text,
  	\`description\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`resume_entries__order_idx\` ON \`resume_entries\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`resume_entries_updated_at_idx\` ON \`resume_entries\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`resume_entries_created_at_idx\` ON \`resume_entries\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`works_tech_stack\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`works\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`works_tech_stack_order_idx\` ON \`works_tech_stack\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`works_tech_stack_parent_id_idx\` ON \`works_tech_stack\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`works_highlights\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`item\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`works\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`works_highlights_order_idx\` ON \`works_highlights\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`works_highlights_parent_id_idx\` ON \`works_highlights\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`works\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_order\` text,
  	\`title\` text NOT NULL,
  	\`description\` text NOT NULL,
  	\`client\` text,
  	\`owner\` text,
  	\`date\` text,
  	\`project_url\` text,
  	\`github_url\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`works__order_idx\` ON \`works\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`works_updated_at_idx\` ON \`works\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`works_created_at_idx\` ON \`works\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`works_rels\` (
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
  await db.run(sql`CREATE INDEX \`works_rels_order_idx\` ON \`works_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`works_rels_parent_idx\` ON \`works_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`works_rels_path_idx\` ON \`works_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`works_rels_media_id_idx\` ON \`works_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`works_rels_work_categories_id_idx\` ON \`works_rels\` (\`work_categories_id\`);`)
  await db.run(sql`CREATE TABLE \`work_categories\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_order\` text,
  	\`name\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`work_categories__order_idx\` ON \`work_categories\` (\`_order\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`work_categories_name_idx\` ON \`work_categories\` (\`name\`);`)
  await db.run(sql`CREATE INDEX \`work_categories_updated_at_idx\` ON \`work_categories\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`work_categories_created_at_idx\` ON \`work_categories\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`media\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`alt\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric
  );
  `)
  await db.run(sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_filename_idx\` ON \`media\` (\`filename\`);`)
  await db.run(sql`CREATE TABLE \`users_sessions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`created_at\` text,
  	\`expires_at\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_sessions_order_idx\` ON \`users_sessions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`users_sessions_parent_id_idx\` ON \`users_sessions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`users\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`email\` text NOT NULL,
  	\`reset_password_token\` text,
  	\`reset_password_expiration\` text,
  	\`salt\` text,
  	\`hash\` text,
  	\`reset_password_requested_at\` text,
  	\`login_attempts\` numeric DEFAULT 0,
  	\`lock_until\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`users_updated_at_idx\` ON \`users\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`users_created_at_idx\` ON \`users\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`users_email_idx\` ON \`users\` (\`email\`);`)
  await db.run(sql`CREATE TABLE \`payload_kv\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	\`data\` text NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`global_slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_global_slug_idx\` ON \`payload_locked_documents\` (\`global_slug\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_updated_at_idx\` ON \`payload_locked_documents\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_created_at_idx\` ON \`payload_locked_documents\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents_rels\` (
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
  await db.run(sql`CREATE TABLE \`payload_preferences\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text,
  	\`value\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_key_idx\` ON \`payload_preferences\` (\`key\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_updated_at_idx\` ON \`payload_preferences\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_created_at_idx\` ON \`payload_preferences\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_migrations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`batch\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_migrations_updated_at_idx\` ON \`payload_migrations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_migrations_created_at_idx\` ON \`payload_migrations\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`profile_typing_titles\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`profile\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`profile_typing_titles_order_idx\` ON \`profile_typing_titles\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`profile_typing_titles_parent_id_idx\` ON \`profile_typing_titles\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`profile\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`job_title\` text NOT NULL,
  	\`avatar_id\` integer NOT NULL,
  	\`cv_id\` integer,
  	\`hire_link_label\` text DEFAULT 'my upwork',
  	\`hire_link_url\` text,
  	\`hire_link_icon\` text DEFAULT 'SiUpwork',
  	\`copyright\` text,
  	\`bio\` text NOT NULL,
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
  await db.run(sql`CREATE TABLE \`skills_coding\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`percent\` numeric NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`skills\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`skills_coding_order_idx\` ON \`skills_coding\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`skills_coding_parent_id_idx\` ON \`skills_coding\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`skills_knowledge\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`item\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`skills\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`skills_knowledge_order_idx\` ON \`skills_knowledge\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`skills_knowledge_parent_id_idx\` ON \`skills_knowledge\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`skills_development\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`percent\` numeric NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`skills\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`skills_development_order_idx\` ON \`skills_development\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`skills_development_parent_id_idx\` ON \`skills_development\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`skills_languages\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`level\` numeric NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`skills\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`skills_languages_order_idx\` ON \`skills_languages\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`skills_languages_parent_id_idx\` ON \`skills_languages\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`skills\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`contact_messages\`;`)
  await db.run(sql`DROP TABLE \`guestbook_entries\`;`)
  await db.run(sql`DROP TABLE \`social_links\`;`)
  await db.run(sql`DROP TABLE \`services\`;`)
  await db.run(sql`DROP TABLE \`pricing_plans_features\`;`)
  await db.run(sql`DROP TABLE \`pricing_plans\`;`)
  await db.run(sql`DROP TABLE \`clients\`;`)
  await db.run(sql`DROP TABLE \`testimonials\`;`)
  await db.run(sql`DROP TABLE \`facts\`;`)
  await db.run(sql`DROP TABLE \`statistics\`;`)
  await db.run(sql`DROP TABLE \`resume_entries\`;`)
  await db.run(sql`DROP TABLE \`works_tech_stack\`;`)
  await db.run(sql`DROP TABLE \`works_highlights\`;`)
  await db.run(sql`DROP TABLE \`works\`;`)
  await db.run(sql`DROP TABLE \`works_rels\`;`)
  await db.run(sql`DROP TABLE \`work_categories\`;`)
  await db.run(sql`DROP TABLE \`media\`;`)
  await db.run(sql`DROP TABLE \`users_sessions\`;`)
  await db.run(sql`DROP TABLE \`users\`;`)
  await db.run(sql`DROP TABLE \`payload_kv\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_migrations\`;`)
  await db.run(sql`DROP TABLE \`profile_typing_titles\`;`)
  await db.run(sql`DROP TABLE \`profile\`;`)
  await db.run(sql`DROP TABLE \`profile_rels\`;`)
  await db.run(sql`DROP TABLE \`skills_coding\`;`)
  await db.run(sql`DROP TABLE \`skills_knowledge\`;`)
  await db.run(sql`DROP TABLE \`skills_development\`;`)
  await db.run(sql`DROP TABLE \`skills_languages\`;`)
  await db.run(sql`DROP TABLE \`skills\`;`)
}
