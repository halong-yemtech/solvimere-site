import { describe, expect, test } from "bun:test";
import { accountFor, duplicatePlatforms, guessPlatform, resolveLink, sameUrl, toProfileLinks } from "../lib/profileLinks";

const links = toProfileLinks([
  { platform: "upwork", url: "https://www.upwork.com/freelancers/~01be", showInIcons: true },
  { platform: "github", url: "https://github.com/someone", label: "Code", showInIcons: false },
  { platform: "linkedin", url: "" }, // incomplete rows are ignored
]);

describe("toProfileLinks", () => {
  test("fills label, icon and color from the platform; drops rows without a URL", () => {
    expect(links).toHaveLength(2);
    expect(links[0]).toMatchObject({ platform: "upwork", label: "Upwork", icon: "SiUpwork", showInIcons: true });
    expect(links[1]).toMatchObject({ platform: "github", label: "Code", showInIcons: false });
  });
});

describe("resolveLink", () => {
  test("an account reference resolves to that account's URL", () => {
    expect(resolveLink(links, { account: "upwork" })).toBe("https://www.upwork.com/freelancers/~01be");
  });
  test("custom URL, none, and missing accounts", () => {
    expect(resolveLink(links, { account: "custom", customUrl: " https://example.com " })).toBe("https://example.com");
    expect(resolveLink(links, { account: "custom", customUrl: "" })).toBeNull();
    expect(resolveLink(links, { account: "none" })).toBeNull();
    expect(resolveLink(links, { account: "linkedin" })).toBeNull();
    expect(resolveLink(links, null)).toBeNull();
  });
  test("accountFor ignores special values", () => {
    expect(accountFor(links, "custom")).toBeNull();
    expect(accountFor(links, "github")?.url).toBe("https://github.com/someone");
  });
});

describe("guessPlatform", () => {
  test("by host, including subdomains", () => {
    expect(guessPlatform("https://ca.linkedin.com/in/x")).toBe("linkedin");
    expect(guessPlatform("https://wa.me/123")).toBe("whatsapp");
    expect(guessPlatform("https://www.upwork.com/freelancers/~1")).toBe("upwork");
  });
  test("falls back to the icon, then website/other", () => {
    expect(guessPlatform("https://my.site/p", "FaGithub")).toBe("github");
    expect(guessPlatform("https://my.site/p")).toBe("website");
    expect(guessPlatform("mailto:a@b.c")).toBe("other");
  });
});

describe("sameUrl", () => {
  test("ignores protocol, www, case, trailing slash and invisible characters", () => {
    expect(sameUrl("https://www.GitHub.com/x/", "http://github.com/x")).toBe(true);
    expect(sameUrl("https://wa.me/‪15412835485‬", "https://wa.me/15412835485")).toBe(true);
    expect(sameUrl("https://github.com/x", "https://github.com/y")).toBe(false);
    expect(sameUrl("", "")).toBe(false);
  });
});

describe("duplicatePlatforms", () => {
  test("each platform once, except Other", () => {
    expect(duplicatePlatforms([{ platform: "upwork" }, { platform: "upwork" }, { platform: "other" }, { platform: "other" }])).toEqual(["Upwork"]);
    expect(duplicatePlatforms([{ platform: "github" }, { platform: "linkedin" }])).toEqual([]);
  });
});
