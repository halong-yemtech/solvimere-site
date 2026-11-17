import { describe, expect, test } from "bun:test";
import { buildCvData, cleanText, cvFileName, stripMarkdown, toBullets } from "../lib/cv/data";
import type { SiteData } from "../lib/siteTypes";

function site(overrides: { cv?: Partial<SiteData["profile"]["cv"]>; resume?: SiteData["resume"] } = {}): SiteData {
  return {
    settings: {
      sections: [],
      theme: { accent: "#f59e0b", font: "poppins" },
      maintenance: { enabled: false, message: "" },
    },
    profile: {
      id: 1,
      slug: "main",
      isActive: true,
      visibility: "public",
      name: "Hạ Long",
      jobTitle: "Senior Software Engineer",
      typingTitles: [],
      avatar: null,
      backgroundImages: [],
      cvUrl: "/cv",
      cv: { mode: "generated", headline: "", location: "", summary: "", skills: "", ...overrides.cv },
      hireLink: null,
      copyright: "",
      bio: "👋 Hello! I am a **Senior Engineer**.\n\n⚙️ I build [APIs](https://x.dev) in *Go*.",
      age: "",
      residence: "VN",
      status: "",
      address: "Da Nang, Vietnam",
      email: "me@example.com",
      phone: "+1 ‪(541) 283-5485‬",
      phoneLink: null,
      mapEmbedUrl: null,
      quote: null,
      blog: { intro: "", buttonLabel: "", buttonUrl: null },
      metaDescription: "",
    },
    links: [],
    socialLinks: [],
    services: [],
    pricingPlans: [],
    clients: [],
    testimonials: [],
    facts: [],
    statistics: [],
    blogPosts: [],
    resume: overrides.resume ?? [
      {
        id: 1,
        type: "experience",
        period: "2019 - Present",
        title: "Backend Architect",
        subtitle: "Acme",
        location: "Remote",
        description: "- Built X\n• Shipped Y\n\n",
      },
      {
        id: 2,
        type: "education",
        period: "2010 - 2014",
        title: "Portland State University",
        subtitle: "Computer Science",
        location: "",
        description: "",
      },
    ],
    skills: {
      coding: [
        { id: "a", name: "Go", percent: 90 },
        { id: "b", name: "Docker", percent: 80 },
      ],
      knowledge: ["REST APIs", "go"],
      development: [{ id: "c", name: "AWS", percent: 70 }],
      languages: [],
    },
    workCategories: [],
    works: [],
  };
}

describe("text helpers", () => {
  test("cleanText drops emoji and invisible direction marks", () => {
    expect(cleanText("👋 Hi‪+1 (541)‬ ⚙️ there")).toBe("Hi+1 (541) there");
  });
  test("stripMarkdown keeps link text and removes emphasis", () => {
    expect(stripMarkdown("**Bold** and *it* [link](https://a.b) `code`")).toBe("Bold and it link code");
  });
  test("toBullets splits lines and strips markers", () => {
    expect(toBullets("- one\n• two\n\n3. three\nfour")).toEqual(["one", "two", "three", "four"]);
  });
  test("cvFileName", () => expect(cvFileName("Hạ Long")).toBe("Hạ Long - CV.pdf"));
});

describe("buildCvData", () => {
  test("derives everything from the profile", () => {
    const cv = buildCvData(site());
    expect(cv.name).toBe("Hạ Long");
    expect(cv.headline).toBe("Senior Software Engineer");
    expect(cv.contact).toEqual(["Da Nang, Vietnam", "+1 (541) 283-5485"]);
    expect(cv.email).toBe("me@example.com");
    expect(cv.summary).toBe("Hello! I am a Senior Engineer. I build APIs in Go.");
    // Experience: company bold / role italic; education: school bold / degree italic.
    expect(cv.experience).toEqual([
      {
        org: "Acme",
        role: "Backend Architect",
        period: "2019 - Present",
        location: "Remote",
        bullets: ["Built X", "Shipped Y"],
      },
    ]);
    expect(cv.education[0]).toMatchObject({ org: "Portland State University", role: "Computer Science", bullets: [] });
    // Skills: coding + development + knowledge, de-duplicated case-insensitively.
    expect(cv.skills).toEqual(["Go", "Docker", "AWS", "REST APIs"]);
  });

  test("CV tab values override the defaults", () => {
    const cv = buildCvData(
      site({
        cv: { headline: "Staff Engineer", location: "Remote", summary: "Short summary.", skills: "Go; Rust,\nSQL" },
      }),
    );
    expect(cv.headline).toBe("Staff Engineer");
    expect(cv.contact[0]).toBe("Remote");
    expect(cv.summary).toBe("Short summary.");
    expect(cv.skills).toEqual(["Go", "Rust", "SQL"]);
  });
});
