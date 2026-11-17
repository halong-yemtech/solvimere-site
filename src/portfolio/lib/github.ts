import type { ContributionCalendar, ContributionDay } from "./githubCalendar";

export const GITHUB_USERNAME = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;

/**
 * A user's public contribution calendar for the last year.
 * GitHub's own page and API can't be called from a browser (no CORS / needs a token),
 * so this uses the public, read-only github-contributions-api.jogruber.de relay.
 */
export async function getContributions(username: string): Promise<ContributionCalendar> {
  if (!GITHUB_USERNAME.test(username)) throw new Error("Invalid GitHub username");
  const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`);
  if (res.status === 404) throw new Error("GitHub user not found");
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
  const json = (await res.json()) as {
    total?: { lastYear?: number };
    contributions?: { date: string; count: number; level: number }[];
  };
  const days: ContributionDay[] = (json.contributions ?? []).map((d) => ({
    date: d.date,
    count: d.count,
    level: Math.max(0, Math.min(4, d.level)) as ContributionDay["level"],
  }));
  return { username, total: json.total?.lastYear ?? days.reduce((n, d) => n + d.count, 0), days };
}
