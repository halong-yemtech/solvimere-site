import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "react-loading-skeleton/dist/skeleton.css";
import "./portfolio.css";
import HomePage from "./components/HomePage";
import { SiteProvider } from "./components/SiteProvider";
import { getSiteData } from "./lib/site";
import type { SiteData } from "./lib/siteTypes";
import { DEFAULT_ACCENT, FONT_OPTIONS, hexToRgbChannels } from "./lib/settingsDefaults";

type State = { status: "loading" } | { status: "missing" } | { status: "ready"; site: SiteData };

/** The portfolio's sizes are in rem with 1rem = 8px (html font-size 50%) while it's open. */
export function usePortfolioDocument(title?: string, description?: string) {
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("pf-html");
    return () => html.classList.remove("pf-html");
  }, []);
  useEffect(() => {
    if (!title) return undefined;
    const previous = document.title;
    document.title = title;
    const meta = document.querySelector('meta[name="description"]');
    const previousDescription = meta?.getAttribute("content");
    if (meta && description) meta.setAttribute("content", description);
    return () => {
      document.title = previous;
      if (meta && previousDescription != null) meta.setAttribute("content", previousDescription);
    };
  }, [title, description]);
}

/** Theme from Portfolio settings, as the CSS variables the components use. */
export function themeStyle(site: SiteData | null): React.CSSProperties {
  const font = FONT_OPTIONS.find((f) => f.value === site?.settings.theme.font) ?? FONT_OPTIONS[0];
  return {
    "--accent": hexToRgbChannels(site?.settings.theme.accent || DEFAULT_ACCENT),
    "--site-font": font.css,
  } as React.CSSProperties;
}

/** /team/:slug — a team member's portfolio. */
export default function PortfolioPage() {
  const { slug = "" } = useParams();
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    getSiteData(slug)
      .then((site) => !cancelled && setState(site ? { status: "ready", site } : { status: "missing" }))
      .catch(() => !cancelled && setState({ status: "missing" }));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const site = state.status === "ready" ? state.site : null;
  usePortfolioDocument(
    site
      ? `${site.profile.name} | ${site.profile.jobTitle}`
      : state.status === "missing"
        ? "Portfolio coming soon"
        : undefined,
    site?.profile.metaDescription || undefined,
  );

  if (state.status === "loading") {
    return <div className="pf-root min-h-screen bg-gray-900" style={themeStyle(null)} aria-busy="true" />;
  }

  if (!site) {
    return (
      <main className="pf-root" style={themeStyle(null)}>
        <div className="flex items-center justify-center min-h-screen p-10 text-center bg-gray-900">
          <div className="max-w-2xl space-y-6 text-2xl text-gray-300">
            <h1 className="text-4xl font-semibold text-main-orange">Portfolio coming soon</h1>
            <p>This team member&apos;s portfolio isn&apos;t published yet.</p>
            <Link to="/team" className="inline-block underline hover:text-main-orange">
              ← Back to the team
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (site.settings.maintenance.enabled) {
    return (
      <main className="pf-root" style={themeStyle(site)}>
        <div className="flex items-center justify-center min-h-screen p-10 text-center bg-gray-900">
          <div className="max-w-2xl space-y-6 text-2xl text-gray-300">
            <h1 className="text-4xl font-semibold text-main-orange">{site.profile.name}</h1>
            <p className="whitespace-pre-line">{site.settings.maintenance.message}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="pf-root" style={themeStyle(site)}>
      <SiteProvider data={site}>
        <HomePage />
      </SiteProvider>
    </div>
  );
}
