import type { GlobalConfig } from "payload";
import { anyone, isAdmin } from "../access";
import { SECTION_KEYS, DEFAULT_SECTIONS, FONT_OPTIONS, DEFAULT_ACCENT, DEFAULT_FONT } from "@/lib/settingsDefaults";

const hex = (v: unknown) => !v || /^#[0-9a-fA-F]{6}$/.test(String(v)) || "6-digit hex color like #f59e0b";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Site settings",
  admin: { group: "Settings" },
  access: { read: anyone, update: isAdmin },
  versions: { drafts: true, max: 50 },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Profile",
          fields: [
            {
              name: "activeProfile",
              type: "relationship",
              relationTo: "profiles",
              maxDepth: 0,
              admin: {
                description:
                  "The profile shown at “/”. Every public profile is at /team/<slug>. Empty = the first profile.",
              },
            },
          ],
        },
        {
          label: "Sections",
          description: "Menu sections of the site, in order. Use the arrows to reorder; untick Visible to hide one.",
          fields: [
            {
              name: "sections",
              type: "array",
              labels: { singular: "Section", plural: "Sections" },
              defaultValue: DEFAULT_SECTIONS,
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "key",
                      type: "select",
                      required: true,
                      options: SECTION_KEYS.map((k) => ({ label: k, value: k })),
                      admin: { width: "35%" },
                    },
                    { name: "label", type: "text", required: true, admin: { width: "40%" } },
                    { name: "visible", type: "checkbox", defaultValue: true, admin: { width: "25%" } },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "Appearance",
          fields: [
            {
              name: "theme",
              type: "group",
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "accent",
                      type: "text",
                      defaultValue: DEFAULT_ACCENT,
                      validate: hex,
                      admin: { width: "50%", description: "Highlight color used across the site." },
                    },
                    {
                      name: "font",
                      type: "select",
                      defaultValue: DEFAULT_FONT,
                      options: FONT_OPTIONS.map((f) => ({ label: f.label, value: f.value })),
                      admin: { width: "50%" },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "Maintenance",
          fields: [
            {
              name: "maintenance",
              type: "group",
              fields: [
                {
                  name: "enabled",
                  type: "checkbox",
                  defaultValue: false,
                  admin: { description: "Visitors see a maintenance page. Logged-in editors still see the site." },
                },
                {
                  name: "message",
                  type: "textarea",
                  defaultValue: "The site is being updated. Please check back soon.",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
