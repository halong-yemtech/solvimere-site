import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { s3Storage } from "@payloadcms/storage-s3";
import sharp from "sharp";
import { resendAdapter } from "@payloadcms/email-resend";

import { Users } from "./cms/collections/Users";
import { Media } from "./cms/collections/Media";
import {
  BlogPosts,
  Clients,
  Facts,
  PricingPlans,
  ResumeEntries,
  Services,
  Statistics,
  Testimonials,
  WorkCategories,
  Works,
} from "./cms/collections/content";
import { ContactMessages, GuestbookEntries } from "./cms/collections/inbox";
import { Profiles } from "./cms/collections/Profiles";
import { SiteSettings } from "./cms/globals/SiteSettings";
import { migrations as sqliteMigrations } from "./cms/migrations";
import { migrations as postgresMigrations } from "./cms/migrations-postgres";
import { ensureVersions } from "./cms/hooks/ensureVersions";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Content lives in the Solvimere Supabase project:
 * - DATABASE_URI = Supabase Postgres connection string → tables in the `payload` schema
 *   (kept apart from the site's `public` tables).
 * - SUPABASE_S3_* = Supabase Storage (S3 protocol) → uploads in the `portfolio` bucket.
 * Without a postgres:// URI the old local SQLite file is used (only as the source for
 * `bun run migrate:supabase`, or for offline work).
 */
const databaseUri = process.env.DATABASE_URI || "";
export const usePostgres = /^postgres(ql)?:\/\//.test(databaseUri);
const storageEnabled = Boolean(
  process.env.SUPABASE_S3_ENDPOINT &&
    process.env.SUPABASE_S3_ACCESS_KEY_ID &&
    process.env.SUPABASE_S3_SECRET_ACCESS_KEY,
);

if (!process.env.PAYLOAD_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("PAYLOAD_SECRET is not set. See .env.example.");
}

export default buildConfig({
  // The Payload admin UI is not used: editing happens on the site and in /dashboard
  // (app/(payload)/admin was removed; only the REST/GraphQL API under /api remains).
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname), autoGenerate: false },
  },
  collections: [
    // Inbox
    ContactMessages,
    GuestbookEntries,
    // Profile & About
    Profiles,
    Services,
    PricingPlans,
    Clients,
    Testimonials,
    Facts,
    Statistics,
    // Blog
    BlogPosts,
    // Resume
    ResumeEntries,
    // Portfolio
    Works,
    WorkCategories,
    // Settings
    Media,
    Users,
  ],
  globals: [SiteSettings],
  secret: process.env.PAYLOAD_SECRET || "dev-only-insecure-secret",
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  db: usePostgres
    ? postgresAdapter({
        pool: { connectionString: databaseUri },
        schemaName: "payload",
        // Schema changes go through migrations (cms/migrations-postgres), never `push`.
        push: false,
        migrationDir: path.resolve(dirname, "cms/migrations-postgres"),
        // Applied automatically when the production server starts.
        prodMigrations: postgresMigrations,
      })
    : sqliteAdapter({
        client: {
          url: databaseUri || process.env.TURSO_DATABASE_URL || "file:./portfolio.db",
          authToken: process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || undefined,
        },
        push: false,
        migrationDir: path.resolve(dirname, "cms/migrations"),
        prodMigrations: sqliteMigrations,
      }),
  sharp,
  // Runs after prodMigrations on every server start; a no-op once all documents have versions.
  onInit: ensureVersions,
  // Transactional email (password reset, inbox notifications). Without a key,
  // Payload falls back to logging emails to the console.
  email: process.env.RESEND_API_KEY
    ? resendAdapter({
        apiKey: process.env.RESEND_API_KEY,
        defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || "onboarding@resend.dev",
        defaultFromName: process.env.EMAIL_FROM_NAME || "Portfolio",
      })
    : undefined,
  plugins: [
    s3Storage({
      enabled: storageEnabled,
      // Keep the plugin's DB fields even when disabled, so the schema — and generated
      // migrations — don't depend on env vars.
      alwaysInsertFields: true,
      collections: { media: true },
      bucket: process.env.SUPABASE_S3_BUCKET || "portfolio",
      config: {
        endpoint: process.env.SUPABASE_S3_ENDPOINT,
        region: process.env.SUPABASE_S3_REGION || "us-east-1",
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY_ID || "",
          secretAccessKey: process.env.SUPABASE_S3_SECRET_ACCESS_KEY || "",
        },
      },
    }),
  ],
});
