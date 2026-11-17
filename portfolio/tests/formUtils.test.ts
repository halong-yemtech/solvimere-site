import { describe, expect, test } from "bun:test";
import { defaultsFor, missingRequired, normalize } from "../components/edit/formUtils";
import type { FieldSchema } from "../lib/edit/types";

const schema: FieldSchema[] = [
  { type: "text", name: "title", label: "Title", required: true },
  { type: "row", fields: [
    { type: "number", name: "price", label: "Price", required: true },
    { type: "checkbox", name: "featured", label: "Featured" },
  ] },
  { type: "upload", name: "images", label: "Images", hasMany: true },
  { type: "upload", name: "cover", label: "Cover", hasMany: false },
  { type: "relationship", name: "categories", label: "Categories", hasMany: true, options: [] },
  { type: "date", name: "date", label: "Date", monthOnly: true },
  { type: "group", name: "quote", label: "Quote", fields: [{ type: "text", name: "text", label: "Text", required: true }] },
  { type: "array", name: "features", label: "Features", fields: [
    { type: "text", name: "feature", label: "Feature", required: true },
  ] },
];

describe("normalize", () => {
  test("turns populated relations into ids and coerces numbers/dates", () => {
    const out = normalize(schema, {
      title: "Hello",
      price: "42",
      featured: true,
      images: [{ id: 1, url: "/a.png" }, 2],
      cover: { id: 9, url: "/c.png" },
      categories: [{ id: 3, name: "Web" }],
      date: "2026-03-01T00:00:00.000Z",
      quote: { text: "Hi" },
      features: [{ id: "abc", feature: "Fast" }, { feature: "New" }],
      extra: "ignored",
    });
    expect(out).toEqual({
      title: "Hello",
      price: 42,
      featured: true,
      images: [1, 2],
      cover: 9,
      categories: [3],
      date: "2026-03-01T00:00:00.000Z",
      quote: { text: "Hi" },
      features: [{ id: "abc", feature: "Fast" }, { feature: "New" }],
    });
  });

  test("empty values become null / empty arrays", () => {
    const out = normalize(schema, { price: "", cover: null });
    expect(out.price).toBeNull();
    expect(out.cover).toBeNull();
    expect(out.images).toEqual([]);
    expect(out.date).toBeNull();
  });
});

describe("missingRequired", () => {
  test("reports top-level, group and array-row fields", () => {
    const missing = missingRequired(schema, { title: "", price: null, quote: {}, features: [{ feature: "" }] });
    expect(missing).toEqual(["Title", "Price", "Quote › Text", "Features #1 › Feature"]);
  });
  test("passes when everything required is filled", () => {
    expect(missingRequired(schema, { title: "a", price: 0, quote: { text: "x" }, features: [] })).toEqual([]);
  });
});

describe("defaultsFor", () => {
  test("seeds arrays, hasMany relations and checkboxes", () => {
    expect(defaultsFor(schema)).toEqual({
      featured: false, images: [], categories: [], quote: {}, features: [],
    });
  });
});
