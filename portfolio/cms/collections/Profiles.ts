import type { Access, CollectionConfig, Where } from "payload";
import { isAdmin, isAdminUser } from "../access";
import { profileTabs } from "../fields/profileTabs";
import { skillFields } from "../fields/skillFields";
import { compactSlug, RESERVED_SLUGS } from "../../lib/basePath";

/**
 * Same rule as the Solvimere team page uses to link a member: "Ha Long" → "halong",
 * so the portfolio is at /team/halong.
 */
export const slugify = compactSlug;

/**
 * A complete identity for the portfolio (name, photo, bio, contact, skills, SEO).
 * Every public profile is reachable at /team/<slug> on the Solvimere site
 * (slug = the member's name without spaces, e.g. /team/halong). List items (works, services, …) can be
 * limited to specific profiles, or shared by all.
 */
export const Profiles: CollectionConfig = {
  slug: "profiles",
  labels: { singular: "Profile", plural: "Profiles" },
  orderable: true,
  admin: {
    group: "Profile & About",
    useAsTitle: "internalName",
    defaultColumns: ["internalName", "name", "slug", "visibility"],
    description: "Choose which profile the site shows in Site settings → Active profile.",
  },
  versions: { drafts: true, maxPerDoc: 50 },
  access: {
    // Visitors (and the REST API) only see published, public profiles.
    read: (({ req: { user } }) =>
      isAdminUser(user)
        ? true
        : ({ and: [{ _status: { equals: "published" } }, { visibility: { equals: "public" } }] } as Where)) as Access,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data && !data.slug) {
          const base = data.internalName || data.name;
          if (base) data.slug = slugify(String(base));
        } else if (data?.slug) {
          data.slug = slugify(String(data.slug));
        }
        return data;
      },
    ],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Profile",
          description: "How this profile is identified and shared.",
          fields: [
            {
              name: "internalName",
              type: "text",
              required: true,
              admin: { description: "Only shown in the CMS, e.g. “Backend focus” or “AI consultant”." },
            },
            {
              type: "row",
              fields: [
                {
                  name: "slug",
                  type: "text",
                  required: true,
                  unique: true,
                  index: true,
                  validate: (value: unknown) =>
                    typeof value === "string" && RESERVED_SLUGS.has(compactSlug(value))
                      ? `“${value}” is used by the portfolio itself; choose another slug.`
                      : true,
                  admin: {
                    width: "50%",
                    description:
                      "Public link: /team/<slug> on the Solvimere site. Use the member's name without spaces (e.g. halong) so their team card links here. Generated from the name if empty.",
                  },
                },
                {
                  name: "visibility",
                  type: "select",
                  required: true,
                  defaultValue: "public",
                  options: [
                    { label: "Public — anyone with the link", value: "public" },
                    { label: "Private — admins only", value: "private" },
                  ],
                  admin: { width: "50%", description: "The active profile is always shown at “/”." },
                },
              ],
            },
          ],
        },
        ...profileTabs,
        { label: "Skills", fields: skillFields },
        {
          label: "CV",
          description:
            "The PDF résumé generated from this profile (Resume entries + Skills). Leave a field empty to use the profile's own content.",
          fields: [
            {
              name: "cvSettings",
              type: "group",
              label: "CV / résumé",
              fields: [
                {
                  name: "mode",
                  type: "select",
                  defaultValue: "generated",
                  options: [
                    { label: "Generate the PDF from this profile", value: "generated" },
                    { label: "Use the uploaded file (Profile card → CV / Resume file)", value: "uploaded" },
                  ],
                  admin: { description: "What the “Download CV” buttons open." },
                },
                {
                  type: "row",
                  fields: [
                    {
                      name: "headline",
                      type: "text",
                      admin: { width: "50%", description: "Under your name. Default: job title." },
                    },
                    {
                      name: "location",
                      type: "text",
                      admin: { width: "50%", description: "Default: address, or residence." },
                    },
                  ],
                },
                {
                  name: "summary",
                  type: "textarea",
                  admin: {
                    rows: 6,
                    description: "“Profile” paragraph. Default: your bio without formatting or emoji.",
                  },
                },
                {
                  name: "skills",
                  type: "textarea",
                  admin: { rows: 3, description: "Comma-separated. Default: all skills from the Skills tab." },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
