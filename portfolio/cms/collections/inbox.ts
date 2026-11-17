import type { CollectionConfig } from "payload";
import { isAdmin, isAdminUser } from "../access";

// Submissions from the public site. They are created by server actions
// (app/(frontend)/actions.ts) via the Local API, so public REST create stays closed.

export const ContactMessages: CollectionConfig = {
  slug: "contact-messages",
  labels: { singular: "Contact message", plural: "Contact messages" },
  admin: {
    group: "Inbox",
    useAsTitle: "fullName",
    defaultColumns: ["fullName", "email", "handled", "createdAt"],
    description: "Messages sent through the contact form.",
  },
  defaultSort: "-createdAt",
  access: { read: isAdmin, create: isAdmin, update: isAdmin, delete: isAdmin },
  fields: [
    { name: "fullName", type: "text", required: true },
    { name: "email", type: "email", required: true },
    { name: "message", type: "textarea", required: true },
    { name: "handled", type: "checkbox", defaultValue: false, admin: { position: "sidebar" } },
  ],
};

export const GuestbookEntries: CollectionConfig = {
  slug: "guestbook-entries",
  labels: { singular: "Guestbook comment", plural: "Guestbook comments" },
  admin: {
    group: "Inbox",
    useAsTitle: "name",
    defaultColumns: ["name", "comment", "approved", "createdAt"],
    description: "Untick “approved” to hide a comment from the site, or delete it.",
  },
  defaultSort: "-createdAt",
  access: {
    // Public visitors only see approved comments.
    read: ({ req: { user } }) => (isAdminUser(user) ? true : { approved: { equals: true } }),
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: "name", type: "text", required: true, maxLength: 80 },
    { name: "comment", type: "textarea", required: true, maxLength: 2000 },
    { name: "approved", type: "checkbox", defaultValue: true, admin: { position: "sidebar" } },
  ],
};

