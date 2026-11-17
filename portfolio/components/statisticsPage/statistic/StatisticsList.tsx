"use client";

import { useEffect, useState } from "react";
import Statistic from "./Statistic";
import { useSite } from "../../SiteProvider";
import { withBase } from "@/lib/basePath";

async function fetchData(url: string) {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch {
    return null;
  }
}

export default function StatisticsList() {
  const { statistics } = useSite();
  const [pageViews, setPageViews] = useState<number | null>(null);

  useEffect(() => {
    async function fetchApiData(): Promise<void> {
      const pageViewData = await fetchData(withBase("/api/analytics/traffics"));
      if (typeof pageViewData === "number") {
        setPageViews(pageViewData);
      }
    }
    fetchApiData();
  }, []);

  return (
    <ul className="grid grid-cols-1 gap-5 px-12 py-8 sm:grid-cols-2 md:grid-cols-3">
      {pageViews !== null && <Statistic title="page views" info={pageViews} />}
      {statistics.map((s) => (
        <Statistic
          key={s.id}
          id={s.id}
          title={s.title}
          info={s.value}
          externalLink={s.link ?? undefined}
        />
      ))}
    </ul>
  );
}
