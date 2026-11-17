import { ValidationError, type CollectionBeforeChangeHook, type CollectionConfig, type Field } from "payload";
import { accountRefField } from "../fields/profileTabs";
import { isAdmin, publishedOrAdmin } from "../access";
import { iconField } from "../fields/icon";

const url = (value: unknown) =>
  !value || /^(https?:\/\/|mailto:|tel:|\/)/.test(String(value)) || "Must be a full URL (https://…)";

/**
 * The profile this item belongs to. Every item has exactly one owner; to show
 * the same thing on another profile, duplicate it there (dashboard → item → Duplicate).
 */
const profileField: Field = {
  name: "profile",
  type: "relationship",
  relationTo: "profiles",
  required: true,
  index: true,
  maxDepth: 0,
  admin: { position: "sidebar", readOnly: false, description: "The profile this item belongs to." },
};

const idOf = (v: unknown) => (v && typeof v === "object" ? (v as { id: unknown }).id : v);

/** An item can't silently move to another profile (it would vanish from the one being edited). */
const keepOwner: CollectionBeforeChangeHook = ({ data, originalDoc, operation }) => {
  if (operation === "update" && originalDoc?.profile != null && data && "profile" in data) {
    data.profile = idOf(originalDoc.profile);
  }
  return data;
};

/** Public-read, admin-write, drag-to-reorder list shown on the site. */
function contentCollection(
  config: Omit<CollectionConfig, "access" | "fields"> & { fields: Field[] }
): CollectionConfig {
  return {
    orderable: true,
    // Edits made on the site are saved as drafts and go live on "Publish".
    versions: { drafts: true, maxPerDoc: 50 },
    access: { read: publishedOrAdmin, create: isAdmin, update: isAdmin, delete: isAdmin },
    ...config,
    admin: { pagination: { defaultLimit: 50 }, ...config.admin },
    hooks: { ...config.hooks, beforeChange: [keepOwner, ...(config.hooks?.beforeChange ?? [])] },
    fields: [...config.fields, profileField],
  };
}

export const Services = contentCollection({
  slug: "services",
  admin: { group: "Profile & About", useAsTitle: "title", defaultColumns: ["title", "icon"] },
  fields: [
    { name: "title", type: "text", required: true },
    iconField(),
    { name: "description", type: "textarea", required: true },
  ],
});

export const PricingPlans = contentCollection({
  slug: "pricing-plans",
  labels: { singular: "Pricing plan", plural: "Pricing plans" },
  admin: { group: "Profile & About", useAsTitle: "name", defaultColumns: ["name", "price", "period"] },
  fields: [
    { name: "name", type: "text", required: true },
    iconField({ defaultValue: "DiCodeigniter" }),
    {
      type: "row",
      fields: [
        { name: "price", type: "number", required: true, admin: { width: "50%" } },
        { name: "period", type: "text", defaultValue: "hour", admin: { width: "50%", description: "e.g. hour, month, project" } },
      ],
    },
    {
      name: "orderLink",
      type: "group",
      label: "“Order now” link",
      fields: [
        {
          type: "row",
          fields: [
            accountRefField("account", { custom: true, width: "40%", description: "One of the profile's accounts, or a custom URL." }),
            { name: "customUrl", type: "text", validate: url, admin: { width: "60%", description: "Only for “Custom URL”." } },
          ],
        },
      ],
    },
    {
      name: "features",
      type: "array",
      fields: [
        {
          type: "row",
          fields: [
            { name: "feature", type: "text", required: true, admin: { width: "75%" } },
            { name: "included", type: "checkbox", defaultValue: true, admin: { width: "25%" } },
          ],
        },
      ],
    },
  ],
});

export const Clients = contentCollection({
  slug: "clients",
  admin: { group: "Profile & About", useAsTitle: "name", defaultColumns: ["name", "url"] },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "url", type: "text", required: true, validate: url },
    iconField({ required: false, admin: { description: "Used when no logo image is uploaded." } }),
    { name: "logo", type: "upload", relationTo: "media", admin: { description: "Optional logo (overrides the icon)." } },
  ],
});

export const Testimonials = contentCollection({
  slug: "testimonials",
  admin: { group: "Profile & About", useAsTitle: "name", defaultColumns: ["name", "role"] },
  fields: [
    { name: "quote", type: "textarea", required: true },
    {
      type: "row",
      fields: [
        { name: "name", type: "text", required: true, admin: { width: "50%" } },
        { name: "role", type: "text", admin: { width: "50%" } },
      ],
    },
    { name: "photo", type: "upload", relationTo: "media" },
  ],
});

export const Facts = contentCollection({
  slug: "facts",
  labels: { singular: "Fun fact", plural: "Fun facts" },
  admin: { group: "Profile & About", useAsTitle: "description" },
  fields: [iconField(), { name: "description", type: "text", required: true }],
});

export const ResumeEntries = contentCollection({
  slug: "resume-entries",
  labels: { singular: "Resume entry", plural: "Resume entries" },
  admin: { group: "Resume", useAsTitle: "title", defaultColumns: ["title", "type", "period", "subtitle"] },
  fields: [
    {
      name: "type",
      type: "radio",
      required: true,
      defaultValue: "experience",
      options: [
        { label: "Experience", value: "experience" },
        { label: "Education", value: "education" },
      ],
      admin: { layout: "horizontal" },
    },
    {
      name: "period",
      type: "text",
      required: true,
      admin: { description: "e.g. 2019 - Present (entries ending in “Present” are highlighted)." },
    },
    { name: "title", type: "text", required: true, admin: { description: "Experience: job title / role. Education: school." } },
    {
      type: "row",
      fields: [
        { name: "subtitle", type: "text", admin: { width: "60%", description: "Experience: company. Education: degree / field." } },
        { name: "location", type: "text", admin: { width: "40%", description: "Shown on the CV, e.g. “Boston, MA, USA”." } },
      ],
    },
    {
      name: "description",
      type: "textarea",
      admin: { rows: 6, description: "One achievement per line — each line becomes a bullet point on the CV." },
    },
  ],
});

export const Statistics = contentCollection({
  slug: "statistics",
  labels: { singular: "Statistic", plural: "Statistics" },
  admin: { group: "Profile & About", useAsTitle: "title", defaultColumns: ["title", "value"], description: "Cards on the Stats page." },
  fields: [
    {
      type: "row",
      fields: [
        { name: "title", type: "text", required: true, admin: { width: "50%" } },
        { name: "value", type: "text", required: true, admin: { width: "50%" } },
      ],
    },
    {
      name: "link",
      type: "group",
      fields: [
        {
          type: "row",
          fields: [
            accountRefField("account", { custom: true, none: true, width: "40%" }),
            { name: "customUrl", type: "text", validate: url, admin: { width: "60%", description: "Only for “Custom URL”." } },
          ],
        },
      ],
    },
  ],
});

export const WorkCategories = contentCollection({
  slug: "work-categories",
  labels: { singular: "Work category", plural: "Work categories" },
  admin: { group: "Portfolio", useAsTitle: "name", description: "Filter tabs on the Works page (“All” is added automatically)." },
  hooks: {
    beforeValidate: [
      async ({ data, req, originalDoc }) => {
        const profile = idOf(data?.profile ?? originalDoc?.profile);
        const name = String(data?.name ?? originalDoc?.name ?? "").trim();
        if (!profile || !name) return data;
        const clash = await req.payload.find({
          collection: "work-categories",
          where: {
            and: [
              { profile: { equals: profile } },
              { name: { equals: name } },
              ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
            ],
          },
          draft: true,
          limit: 1,
          depth: 0,
          req,
        });
        if (clash.totalDocs) throw new ValidationError({ errors: [{ message: `This profile already has a “${name}” category.`, path: "name" }] });
        return data;
      },
    ],
  },
  fields: [{ name: "name", type: "text", required: true }],
});

export const Works = contentCollection({
  slug: "works",
  labels: { singular: "Work", plural: "Works" },
  admin: { group: "Portfolio", useAsTitle: "title", defaultColumns: ["title", "client", "date", "categories"] },
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "images",
      type: "upload",
      relationTo: "media",
      hasMany: true,
      required: true,
      minRows: 1,
      admin: { description: "The first image is the thumbnail and the header in the details popup." },
    },
    {
      name: "categories",
      type: "relationship",
      relationTo: "work-categories",
      hasMany: true,
      // Only this profile's categories.
      filterOptions: ({ data }) => (data?.profile ? { profile: { equals: idOf(data.profile) } } : true),
    },
    {
      name: "description",
      type: "textarea",
      required: true,
      admin: { rows: 12, description: "Supports Markdown: **bold**, lists, links." },
    },
    {
      type: "row",
      fields: [
        { name: "client", type: "text", admin: { width: "33%" } },
        { name: "owner", type: "text", admin: { width: "33%" } },
        { name: "date", type: "date", admin: { width: "33%", date: { pickerAppearance: "monthOnly", displayFormat: "MMM yyyy" } } },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "projectUrl", label: "Project URL", type: "text", validate: url, admin: { width: "50%" } },
        { name: "githubUrl", label: "GitHub URL", type: "text", validate: url, admin: { width: "50%" } },
      ],
    },
    { name: "techStack", type: "array", fields: [{ name: "name", type: "text", required: true }] },
    {
      name: "highlights",
      type: "array",
      admin: { description: "Bullet list at the bottom of the details popup." },
      fields: [{ name: "item", type: "text", required: true }],
    },
  ],
});

export const BLOG_PLATFORMS = [
  { label: "Upwork", value: "upwork" },
  { label: "GitHub", value: "github" },
  { label: "LinkedIn", value: "linkedin" },
  { label: "Other", value: "other" },
] as const;

/** Casual write-ups shown in the Blog section, e.g. "what I'm up to on Upwork / GitHub / LinkedIn". */
export const BlogPosts = contentCollection({
  slug: "blog-posts",
  labels: { singular: "Blog post", plural: "Blog posts" },
  admin: {
    group: "Blog",
    useAsTitle: "title",
    defaultColumns: ["title", "platform"],
    description: "Cards in the Blog section — a casual overview of each place people can find you.",
  },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "platform",
          type: "select",
          required: true,
          defaultValue: "other",
          options: [...BLOG_PLATFORMS],
          admin: { width: "35%", description: "Sets the card's icon, color and button link (from Links & accounts)." },
        },
        { name: "title", type: "text", required: true, admin: { width: "65%" } },
      ],
    },
    { name: "headline", type: "text", admin: { description: "e.g. your title on that platform." } },
    {
      name: "badges",
      type: "array",
      labels: { singular: "Badge", plural: "Badges" },
      admin: { description: "Small pills, e.g. “Top Rated Plus”." },
      fields: [{ name: "label", type: "text", required: true }],
    },
    {
      name: "stats",
      type: "array",
      labels: { singular: "Stat", plural: "Stats" },
      admin: { description: "Big numbers, e.g. 36 / Jobs done." },
      fields: [
        {
          type: "row",
          fields: [
            { name: "value", type: "text", required: true, admin: { width: "40%" } },
            { name: "label", type: "text", required: true, admin: { width: "60%" } },
          ],
        },
      ],
    },
    {
      name: "githubUsername",
      type: "text",
      validate: (v: unknown) =>
        !v || /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/.test(String(v)) || "Just the username, e.g. aliabbas12",
      admin: { description: "Shows your live GitHub contribution graph on this post (updated every few hours)." },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      admin: { description: "Optional picture under the stats, e.g. a screenshot of your contribution graph." },
    },
    { name: "imageCaption", type: "text", admin: { description: "Small caption under the picture." } },
    {
      name: "body",
      type: "textarea",
      required: true,
      admin: { rows: 10, description: "The write-up. Markdown supported (**bold**, *italic*, lists, links)." },
    },
    {
      name: "tags",
      type: "array",
      labels: { singular: "Tag", plural: "Tags" },
      admin: { description: "Skills, tools or services shown as chips." },
      fields: [{ name: "tag", type: "text", required: true }],
    },
    {
      name: "buttonLabel",
      type: "text",
      admin: { description: "The button links to this profile's account for the platform above. Default: “Visit profile”." },
    },
  ],
});
