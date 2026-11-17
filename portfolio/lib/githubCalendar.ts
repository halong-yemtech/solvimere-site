// GitHub contribution calendar: shared types and the HTML parser (no server-only deps, so it is testable).

export interface ContributionDay {
  date: string; // YYYY-MM-DD
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionCalendar {
  username: string;
  total: number;
  days: ContributionDay[];
}

/** Reads the calendar github.com renders at /users/<name>/contributions. */
export function parseContributionsHtml(username: string, html: string): ContributionCalendar {
  // Counts live in <tool-tip for="contribution-day-component-x-y">N contributions on …</tool-tip>.
  const counts = new Map<string, number>();
  for (const m of html.matchAll(/<tool-tip\b[^>]*\bfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
    const n = /^\s*([\d,]+)\s+contribution/i.exec(m[2]);
    counts.set(m[1], n ? Number(n[1].replace(/,/g, "")) : 0);
  }
  const days: ContributionDay[] = [];
  for (const m of html.matchAll(/<td\b[^>]*\bdata-date="[^"]+"[^>]*>/g)) {
    const tag = m[0];
    const date = /data-date="(\d{4}-\d{2}-\d{2})"/.exec(tag)?.[1];
    const id = /\bid="([^"]+)"/.exec(tag)?.[1];
    const level = Number(/data-level="(\d)"/.exec(tag)?.[1] ?? 0);
    if (!date) continue;
    days.push({
      date,
      count: (id && counts.get(id)) || 0,
      level: Math.min(4, Math.max(0, level)) as ContributionDay["level"],
    });
  }
  if (!days.length) throw new Error("Couldn't read the contribution calendar");
  days.sort((a, b) => a.date.localeCompare(b.date));
  const heading = /([\d,]+)\s+contributions?\s+in the last year/i.exec(html.replace(/\s+/g, " "));
  const total = heading ? Number(heading[1].replace(/,/g, "")) : days.reduce((s, d) => s + d.count, 0);
  return { username, total, days };
}
