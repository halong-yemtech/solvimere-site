"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ContributionCalendar, ContributionDay } from "@/lib/githubCalendar";
import { withBase } from "@/lib/basePath";

// GitHub's dark-theme greens; level 0 is a faint cell that sits well on the card.
const LEVEL_COLORS = ["rgba(255,255,255,0.06)", "#0e4429", "#006d32", "#26a641", "#39d353"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

const parse = (d: string) => new Date(`${d}T00:00:00Z`);

function describe(day: ContributionDay) {
  const date = parse(day.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  const what = day.count === 0 ? "No contributions" : `${day.count} contribution${day.count === 1 ? "" : "s"}`;
  return `${what} on ${date}`;
}

/** Columns of 7 (Sun→Sat), like github.com. */
function toWeeks(days: ContributionDay[]) {
  const weeks: (ContributionDay | null)[][] = [];
  if (!days.length) return weeks;
  const offset = parse(days[0].date).getUTCDay();
  days.forEach((day, i) => {
    const slot = i + offset;
    const w = Math.floor(slot / 7);
    (weeks[w] ??= Array(7).fill(null))[slot % 7] = day;
  });
  return weeks;
}

/** Month label above the first week that starts in a new month (skipped if too close to the previous label). */
function monthLabels(weeks: (ContributionDay | null)[][]) {
  const labels: { col: number; label: string }[] = [];
  let last = -1;
  weeks.forEach((week, col) => {
    const first = week.find(Boolean);
    if (!first) return;
    const m = parse(first.date).getUTCMonth();
    if (m !== last) {
      const roomy = (!labels.length || col - labels[labels.length - 1].col >= 3) && weeks.length - col >= 2;
      if (roomy) labels.push({ col, label: MONTHS[m] });
      last = m;
    }
  });
  return labels;
}

export default function GithubCalendar({ username }: { username: string }) {
  const [data, setData] = useState<ContributionCalendar | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tip, setTip] = useState<{ text: string; x: number; y: number } | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    setData(null);
    setError(null);
    fetch(withBase(`/api/github/contributions/${encodeURIComponent(username)}`))
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.error || "Couldn't load contributions");
        if (alive) setData(json);
      })
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [username]);

  const weeks = useMemo(() => (data ? toWeeks(data.days) : []), [data]);
  const months = useMemo(() => monthLabels(weeks), [weeks]);

  // On narrow screens the graph scrolls; start at the most recent weeks.
  useEffect(() => {
    if (data && scroller.current) scroller.current.scrollLeft = scroller.current.scrollWidth;
  }, [data]);

  if (error) {
    return (
      <p className="rounded-xl border border-gray-700/60 bg-gray-900/60 px-5 py-4 text-lg text-gray-500">
        GitHub activity isn&apos;t available right now.
      </p>
    );
  }

  const cols = weeks.length || 53;
  const showTip = (e: React.MouseEvent<HTMLElement> | React.FocusEvent<HTMLElement>, day: ContributionDay) => {
    const cell = e.currentTarget.getBoundingClientRect();
    const outer = box.current!.getBoundingClientRect();
    setTip({ text: describe(day), x: cell.left - outer.left + cell.width / 2, y: cell.top - outer.top });
  };

  return (
    <div ref={box} className="relative rounded-xl border border-gray-700/60 bg-gray-900/70 px-5 pt-4 pb-3">
      <p className="mb-3 text-xl text-gray-300">
        {data ? (
          <>
            <span className="font-semibold text-gray-100">{data.total.toLocaleString("en-US")}</span> contributions in
            the last year
          </>
        ) : (
          <span className="inline-block h-5 w-64 animate-pulse rounded bg-gray-700/60 align-middle" />
        )}
      </p>

      <div ref={scroller} className="overflow-x-auto myScroll pb-1" onScroll={() => setTip(null)}>
        <div
          role="grid"
          aria-label={data ? `${data.total} GitHub contributions in the last year` : "Loading GitHub contributions"}
          className="grid min-w-[560px] gap-[3px]"
          style={{ gridTemplateColumns: `2.6rem repeat(${cols}, minmax(0, 1fr))` }}
          onMouseLeave={() => setTip(null)}
        >
          {/* Month row */}
          <span />
          {Array.from({ length: cols }, (_, col) => {
            const m = months.find((x) => x.col === col);
            return (
              <span key={`m${col}`} className="relative h-5 text-[1.05rem] text-gray-400">
                {m && <span className="absolute left-0 top-0 whitespace-nowrap">{m.label}</span>}
              </span>
            );
          })}

          {/* 7 rows: label + one cell per week */}
          {DAY_LABELS.map((label, row) => (
            <div key={`r${row}`} role="row" className="contents">
              <span className="pr-1 text-[1.05rem] leading-none text-gray-400 self-center">{label}</span>
              {Array.from({ length: cols }, (_, col) => {
                const day = weeks[col]?.[row];
                if (!data)
                  return <span key={col} className="aspect-square rounded-[2px] bg-gray-700/40 animate-pulse" />;
                if (!day) return <span key={col} className="aspect-square" />;
                return (
                  <span
                    key={col}
                    role="gridcell"
                    tabIndex={-1}
                    aria-label={describe(day)}
                    className="aspect-square rounded-[2px] outline-none ring-white/60 hover:ring-1 focus:ring-1"
                    style={{ background: LEVEL_COLORS[day.level] }}
                    onMouseEnter={(e) => showTip(e, day)}
                    onFocus={(e) => showTip(e, day)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-4 text-[1.1rem] text-gray-500">
        <a href={`https://github.com/${username}`} target="_blank" rel="noreferrer" className="hover:text-main-orange">
          github.com/{username}
        </a>
        <span className="flex items-center gap-1">
          Less
          {LEVEL_COLORS.map((c) => (
            <span key={c} className="inline-block h-[10px] w-[10px] rounded-[2px]" style={{ background: c }} />
          ))}
          More
        </span>
      </div>

      {tip && (
        <span
          role="tooltip"
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-gray-700 px-2.5 py-1 text-[1.1rem] text-gray-100 shadow-lg"
          style={{ left: tip.x, top: tip.y - 6 }}
        >
          {tip.text}
        </span>
      )}
    </div>
  );
}
