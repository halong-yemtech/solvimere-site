import type { Field } from "payload";

const percentList = (name: string, label: string, description: string): Field => ({
  name,
  label,
  type: "array",
  admin: { description },
  fields: [
    {
      type: "row",
      fields: [
        { name: "name", type: "text", required: true, admin: { width: "60%" } },
        { name: "percent", type: "number", required: true, min: 0, max: 100, admin: { width: "40%" } },
      ],
    },
  ],
});

/** Skill lists of a profile. */
export const skillFields: Field[] = [
  percentList("coding", "Coding (circles)", "Shown as circular progress meters."),
  {
    name: "knowledge",
    type: "array",
    admin: { description: "Shown as a checklist." },
    fields: [{ name: "item", type: "text", required: true }],
  },
  percentList("development", "AI & Cloud (bars)", "Shown as progress bars."),
  {
    name: "languages",
    type: "array",
    admin: { description: "Spoken languages, rated 1–10 (dots)." },
    fields: [
      {
        type: "row",
        fields: [
          { name: "name", type: "text", required: true, admin: { width: "60%" } },
          { name: "level", type: "number", required: true, min: 1, max: 10, admin: { width: "40%" } },
        ],
      },
    ],
  },
];
