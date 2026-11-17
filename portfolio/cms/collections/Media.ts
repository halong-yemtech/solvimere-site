import type { CollectionConfig } from "payload";
import { anyone, isAdmin } from "../access";

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Media file", plural: "Media library" },
  admin: { group: "Settings", description: "Images and files (e.g. your CV PDF) used on the site." },
  access: {
    read: anyone,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  upload: {
    // Local disk when Supabase Storage is not configured. With SUPABASE_S3_* set,
    // files go to the Supabase Storage bucket (payload.config.ts → s3Storage).
    staticDir: "media",
    mimeTypes: ["image/*", "application/pdf"],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      admin: { description: "Short description for screen readers and SEO." },
    },
  ],
};
