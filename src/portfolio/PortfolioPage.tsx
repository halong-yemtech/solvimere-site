import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
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

/** /team/:slug - a team member's portfolio. */
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
    return (
      <main className="pf-loader" role="status" aria-live="polite">
        <img src="/favicon.png" alt="" width="56" height="56" />
        <span className="sr-only">Loading portfolio…</span>
      </main>
    );
  }

  if (!site) {
    return (
      <Notice
        site={null}
        eyebrow="Team"
        title={
          <>
            Portfolio <em>coming soon</em>
          </>
        }
        text="This team member's portfolio isn't published yet."
      />
    );
  }

  if (site.settings.maintenance.enabled) {
    return (
      <Notice
        site={site}
        eyebrow="Back soon"
        title={site.profile.name}
        text={site.settings.maintenance.message || "This portfolio is being updated. Please check back shortly."}
      />
    );
  }

  return (
    <div className="pf-root" style={themeStyle(site)}>
      <SiteProvider data={site}>
        {/* Remount when the slug changes so per-portfolio UI state starts fresh. */}
        <HomePage key={site.profile.slug} />
      </SiteProvider>
    </div>
  );
}

/** Full-page message (not published yet, or in maintenance), in the site's style. */
function Notice({
  site,
  eyebrow,
  title,
  text,
}: {
  site: SiteData | null;
  eyebrow: string;
  title: React.ReactNode;
  text: string;
}) {
  return (
    <main className="pf-root grid place-items-center px-8 text-center" style={themeStyle(site)}>
      <div className="pf-glow" aria-hidden />
      <div className="max-w-[60rem]">
        <span className="pf-eyebrow">{eyebrow}</span>
        <h1 className="pf-heading !text-[clamp(3.6rem,6vw,6.4rem)]">{title}</h1>
        <p className="mt-6 whitespace-pre-line text-[1.7rem] leading-relaxed text-gray-400">{text}</p>
        <Link to="/team" className="pf-btn pf-btn-ghost mt-10 !pl-2 !pr-6">
          <span className="pf-btn-ico">
            <FiArrowLeft aria-hidden />
          </span>
          Back to the team
        </Link>
      </div>
    </main>
  );
}
