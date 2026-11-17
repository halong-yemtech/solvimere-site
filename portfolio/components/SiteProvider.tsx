"use client";

import { createContext, useContext } from "react";
import type { SiteData } from "@/lib/siteTypes";

const SiteContext = createContext<SiteData | null>(null);

export function SiteProvider({ data, children }: { data: SiteData; children: React.ReactNode }) {
  return <SiteContext.Provider value={data}>{children}</SiteContext.Provider>;
}

/** CMS content for the current page (see lib/site.ts). */
export function useSite(): SiteData {
  const data = useContext(SiteContext);
  if (!data) throw new Error("useSite() must be used inside <SiteProvider>");
  return data;
}

/** Like useSite(), but returns null outside a <SiteProvider> (e.g. on the dashboard). */
export function useSiteOptional(): SiteData | null {
  return useContext(SiteContext);
}
