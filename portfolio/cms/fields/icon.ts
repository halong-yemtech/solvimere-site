import type { SelectField } from "payload";
import { iconOptions } from "@/lib/iconNames";

export const iconField = (overrides: Partial<SelectField> = {}): SelectField => ({
  name: "icon",
  type: "select",
  required: true,
  options: iconOptions.map((o) => ({ label: `${o.label} (${o.value})`, value: o.value })),
  admin: { description: "Icon shown on the website." },
  ...overrides,
} as SelectField);
