import type { Field, Tab } from "payload";
import { iconOptions } from "@/lib/iconNames";
import { accountOptions, duplicatePlatforms, PLATFORMS } from "@/lib/profileLinks";

const url = (value: unknown) =>
  !value || /^(https?:\/\/|mailto:|tel:|\/)/.test(String(value)) || "Must be a full URL (https://…)";

/**
 * "Which account does this point to?" — a platform key resolved against the
 * profile's Links & accounts (lib/profileLinks.ts), so each URL is stored once.
 * `admin.custom.accountRef` lets the editor list only accounts the profile has.
 */
export const accountRefField = (
  name: string,
  opts: { custom?: boolean; none?: boolean; description?: string; width?: string } = {},
): Field => ({
  name,
  type: "select",
  options: accountOptions(opts),
  admin: {
    description: opts.description ?? "Which of this profile's Links & accounts to link to.",
    ...(opts.width ? { width: opts.width } : {}),
    custom: { accountRef: true },
  },
});

const linksTab: Tab = {
  label: "Links & accounts",
  description:
    "Every external link of this profile, stored once. Buttons, pricing plans, stats and blog posts point to these accounts.",
  fields: [
    {
      name: "links",
      type: "array",
      labels: { singular: "Account", plural: "Accounts" },
      validate: (value: unknown) => {
        const dups = duplicatePlatforms(value);
        return dups.length ? `Only one account per platform: ${dups.join(", ")} appears more than once.` : true;
      },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "platform",
              type: "select",
              required: true,
              defaultValue: "website",
              options: PLATFORMS.map((p) => ({ label: p.label, value: p.key })),
              admin: { width: "35%" },
            },
            { name: "url", type: "text", required: true, validate: url, admin: { width: "65%" } },
          ],
        },
        {
          type: "row",
          fields: [
            { name: "label", type: "text", admin: { width: "35%", description: "Default: the platform name." } },
            { name: "info", type: "text", admin: { width: "65%", description: "Subtitle on the Stats page." } },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "showInIcons",
              type: "checkbox",
              defaultValue: true,
              admin: { width: "35%", description: "Show as an icon under the name, in the menu and in Stats → Links." },
            },
            {
              name: "icon",
              type: "select",
              options: iconOptions.map((o) => ({ label: `${o.label} (${o.value})`, value: o.value })),
              admin: { width: "35%", description: "Default: the platform's icon." },
            },
            {
              name: "color",
              type: "text",
              validate: (v: unknown) => !v || /^#[0-9a-fA-F]{3,8}$/.test(String(v)) || "Hex color like #0A66C2",
              admin: { width: "30%", description: "Default: brand color." },
            },
          ],
        },
      ],
    },
  ],
};

/** Identity tabs of a profile (card, links, about, contact, quote, blog, SEO). */
export const profileTabs: Tab[] = [
  {
    label: "Profile card",
    fields: [
      { name: "name", type: "text", required: true },
      {
        name: "jobTitle",
        type: "text",
        required: true,
        admin: { description: "Used in the browser tab title and under the quote." },
      },
      {
        name: "typingTitles",
        type: "array",
        labels: { singular: "Title", plural: "Titles" },
        admin: { description: "Animated titles typed under your name." },
        minRows: 1,
        fields: [{ name: "title", type: "text", required: true }],
      },
      { name: "avatar", type: "upload", relationTo: "media", required: true },
      {
        name: "backgroundImages",
        type: "upload",
        relationTo: "media",
        hasMany: true,
        minRows: 1,
        admin: { description: "Slideshow behind the profile photo." },
      },
      {
        name: "cv",
        label: "CV / Resume file",
        type: "upload",
        relationTo: "media",
        admin: { description: "PDF opened by the “Download CV” buttons." },
      },
      {
        name: "hireLink",
        type: "group",
        label: "Hire button",
        admin: { description: "The second button on the profile card, e.g. “my upwork”." },
        fields: [
          {
            type: "row",
            fields: [
              accountRefField("account", { none: true, width: "60%" }),
              { name: "label", type: "text", defaultValue: "my upwork", admin: { width: "40%" } },
            ],
          },
        ],
      },
      { name: "copyright", type: "text", admin: { description: "Shown at the bottom of the mobile menu." } },
    ],
  },
  linksTab,
  {
    label: "About me",
    fields: [
      {
        name: "bio",
        type: "textarea",
        required: true,
        admin: { rows: 8, description: "Supports Markdown: **bold**, *italic*, lists, links." },
      },
      {
        type: "row",
        fields: [
          { name: "age", type: "text", admin: { width: "25%" } },
          { name: "residence", type: "text", admin: { width: "25%" } },
          { name: "status", type: "text", admin: { width: "25%" } },
          { name: "hourlyRate", type: "number", admin: { width: "25%" } },
        ],
      },
      { name: "address", type: "text" },
    ],
  },
  {
    label: "Contact",
    fields: [
      { name: "email", type: "email" },
      {
        name: "phone",
        type: "text",
        admin: {
          description: "Shown as written; links to WhatsApp when the profile has a WhatsApp account, else calls.",
        },
      },
      {
        name: "mapEmbedUrl",
        type: "text",
        validate: (v: unknown) =>
          !v ||
          String(v).startsWith("https://www.google.com/maps/embed") ||
          "Use Google Maps → Share → Embed a map, and paste the src URL",
        label: "Custom map (optional)",
        admin: {
          description:
            'Leave empty to pin the profile’s address (About tab) on the map. Only to override: Google Maps → Share → Embed a map → copy the src="…" URL.',
        },
      },
    ],
  },
  {
    label: "Quote",
    description: "The quote at the bottom of the Resume section.",
    fields: [
      {
        name: "quote",
        type: "group",
        fields: [
          { name: "text", type: "textarea" },
          {
            type: "row",
            fields: [
              { name: "author", type: "text", admin: { width: "50%", description: "Defaults to your name." } },
              { name: "role", type: "text", admin: { width: "50%", description: "Defaults to your job title." } },
            ],
          },
          { name: "image", type: "upload", relationTo: "media", admin: { description: "Defaults to your avatar." } },
        ],
      },
    ],
  },
  {
    label: "Blog section",
    fields: [
      {
        name: "blog",
        type: "group",
        fields: [
          { name: "intro", type: "textarea" },
          {
            type: "row",
            fields: [
              accountRefField("account", {
                none: true,
                width: "60%",
                description: "Button under the intro (shown when there are no posts).",
              }),
              { name: "buttonLabel", type: "text", defaultValue: "view upwork profile", admin: { width: "40%" } },
            ],
          },
        ],
      },
    ],
  },
  {
    label: "SEO",
    fields: [
      {
        name: "metaDescription",
        type: "textarea",
        admin: { description: "Shown by search engines under your site title." },
      },
    ],
  },
];
