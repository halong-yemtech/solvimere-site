import "server-only";

import type { ContributionCalendar, ContributionDay } from "./githubCalendar";
import { parseContributionsHtml } from "./githubCalendar";

export type { ContributionCalendar, ContributionDay };

export const GITHUB_USERNAME = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
const REVALIDATE = 6 * 60 * 60; // GitHub data is refreshed at most every 6 hours.

const LEVELS: Record<string, ContributionDay["level"]> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

/** Official GraphQL API — used when GITHUB_TOKEN is set (any token with read:user / public access). */
async function fromApi(username: string, token: string): Promise<ContributionCalendar> {
  const query = `query($login: String!) { user(login: $login) { contributionsCollection { contributionCalendar {
    totalContributions weeks { contributionDays { date contributionCount contributionLevel } } } } } }`;
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { login: username } }),
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  const json = await res.json();
  const cal = json?.data?.user?.contributionsCollection?.contributionCalendar;
  if (!cal) throw new Error(json?.errors?.[0]?.message || "GitHub user not found");
  const days: ContributionDay[] = cal.weeks.flatMap(
    (w: { contributionDays: { date: string; contributionCount: number; contributionLevel: string }[] }) =>
      w.contributionDays.map((d) => ({
        date: d.date,
        count: d.contributionCount,
        level: LEVELS[d.contributionLevel] ?? 0,
      })),
  );
  return { username, total: cal.totalContributions, days };
}

/** Public profile calendar (the same HTML github.com shows) — no token needed. */
async function fromProfilePage(username: string): Promise<ContributionCalendar> {
  const res = await fetch(`https://github.com/users/${username}/contributions`, {
    headers: { "User-Agent": "Mozilla/5.0 (portfolio contribution graph)", Accept: "text/html" },
    next: { revalidate: REVALIDATE },
  });
  if (res.status === 404) throw new Error("GitHub user not found");
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
  return parseContributionsHtml(username, await res.text());
}

export async function getContributions(username: string): Promise<ContributionCalendar> {
  if (!GITHUB_USERNAME.test(username)) throw new Error("Invalid GitHub username");
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    try {
      return await fromApi(username, token);
    } catch (e) {
      console.warn("[github] API failed, falling back to the public page:", (e as Error).message);
    }
  }
  return fromProfilePage(username);
}
