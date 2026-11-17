import type { CollectionConfig } from "payload";
import { adminOrSelf, isAdmin, isAdminField } from "../access";

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "User", plural: "Users" },
  admin: { useAsTitle: "email", group: "Settings", defaultColumns: ["email", "name", "role"] },
  auth: {
    // Brute-force protection for the /login page.
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    forgotPassword: {
      // Our own reset page (the Payload admin UI is not used).
      generateEmailSubject: () => "Reset your password",
      generateEmailHTML: (args) => {
        const token = args?.token ?? "";
        const host = args?.req?.headers?.get("host");
        const proto = args?.req?.headers?.get("x-forwarded-proto") ?? "https";
        const base = process.env.NEXT_PUBLIC_SITE_URL || (host ? `${proto}://${host}` : "");
        const url = `${base}/reset-password?token=${encodeURIComponent(token)}`;
        return `<p>Someone asked to reset the password for your portfolio account.</p>
<p><a href="${url}">Choose a new password</a> (the link is valid for one hour).</p>
<p>If this wasn't you, ignore this email.</p>`;
      },
    },
  },
  access: {
    read: adminOrSelf,
    create: isAdmin,
    update: adminOrSelf,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      // The very first account (created from /admin on a fresh install) is always an admin.
      async ({ data, operation, req }) => {
        if (operation === "create") {
          const { totalDocs } = await req.payload.count({ collection: "users", req, overrideAccess: true });
          if (totalDocs === 0) data.role = "admin";
        }
        return data;
      },
    ],
  },
  fields: [
    { name: "name", type: "text" },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "user",
      saveToJWT: true,
      options: [
        { label: "Admin — can edit the site and use /admin", value: "admin" },
        { label: "User — no editing rights", value: "user" },
      ],
      // Only admins can grant or remove the admin role.
      access: { create: isAdminField, update: isAdminField },
      admin: { position: "sidebar" },
    },
  ],
};
