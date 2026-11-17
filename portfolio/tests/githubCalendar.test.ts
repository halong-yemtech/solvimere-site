import { describe, expect, test } from "bun:test";
import { parseContributionsHtml } from "../lib/githubCalendar";

const cell = (id: string, date: string, level: number) =>
  `<td tabindex="0" style="width: 11px" data-date="${date}" id="${id}" data-level="${level}" role="gridcell" class="ContributionCalendar-day"></td>`;
const tip = (id: string, text: string) => `<tool-tip id="t-${id}" for="${id}" popover="manual" class="sr-only">${text}</tool-tip>`;

const html = `
  <h2 id="js-contribution-activity-description" class="f4">
    1,259 contributions
    in the last year
  </h2>
  <table>
    ${cell("c-1", "2026-03-02", 3)}${cell("c-0", "2026-03-01", 0)}${cell("c-2", "2026-03-03", 1)}
  </table>
  ${tip("c-0", "No contributions on March 1st.")}${tip("c-1", "6 contributions on March 2nd.")}${tip("c-2", "1 contribution on March 3rd.")}
`;

describe("parseContributionsHtml", () => {
  test("reads days, counts, levels and the total", () => {
    const cal = parseContributionsHtml("someone", html);
    expect(cal.total).toBe(1259);
    expect(cal.days).toEqual([
      { date: "2026-03-01", count: 0, level: 0 },
      { date: "2026-03-02", count: 6, level: 3 },
      { date: "2026-03-03", count: 1, level: 1 },
    ]);
  });

  test("sums the days when the heading is missing", () => {
    expect(parseContributionsHtml("someone", html.replace(/<h2[\s\S]*?<\/h2>/, "")).total).toBe(7);
  });

  test("fails clearly on an unexpected page", () => {
    expect(() => parseContributionsHtml("someone", "<html>rate limited</html>")).toThrow(/Couldn't read/);
  });
});
