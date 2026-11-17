import { createContext, useContext, useEffect, useState } from "react";
import { supabase, supabaseConfigured } from "../lib/supabase";
import { mapTeamMember } from "../lib/team";
import { mergeContent } from "./merge";

/*
 * Site content comes from the database. Everything the marketing pages show (published page
 * content and the team) is loaded once, in parallel, before the site renders, so visitors
 * never see built-in copy that is then swapped for the real content.
 *
 * The built-in defaults (cms/defaults.js) are only used when the database can't be reached
 * (not configured, an error, or no answer within LOAD_TIMEOUT), so the site still works.
 */

const LOAD_TIMEOUT = 10000;

const ContentContext = createContext({ ready: false, pages: {}, team: null });

const TEAM_COLUMNS =
  "id, name, role, email, avatar_url, avatar_scale, bio, highlight_label, highlight_text, expertise_label, expertise_text, quote, sort_order";

async function loadSiteContent() {
  const [pagesRes, teamRes] = await Promise.all([
    supabase.from("pages").select("slug, content").eq("status", "published"),
    supabase
      .from("team_members")
      .select(TEAM_COLUMNS)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
  ]);
  const pages = {};
  (pagesRes.data || []).forEach((row) => {
    pages[row.slug] = row.content;
  });
  return {
    pages,
    // null = couldn't load: pages fall back to the built-in roster.
    team: teamRes.error || !teamRes.data ? null : teamRes.data.map(mapTeamMember),
  };
}

export function ContentProvider({ children }) {
  const [state, setState] = useState(() => ({ ready: !supabaseConfigured, pages: {}, team: null }));

  useEffect(() => {
    if (!supabaseConfigured) return undefined;
    let done = false;
    const finish = (value) => {
      if (done) return;
      done = true;
      setState({ ready: true, ...value });
    };
    const timer = window.setTimeout(() => finish({ pages: {}, team: null }), LOAD_TIMEOUT);
    loadSiteContent()
      .then(finish)
      .catch(() => finish({ pages: {}, team: null }))
      .finally(() => window.clearTimeout(timer));
    return () => {
      done = true;
      window.clearTimeout(timer);
    };
  }, []);

  return <ContentContext.Provider value={state}>{children}</ContentContext.Provider>;
}

/** True once the site content has loaded (or loading gave up). */
export function useContentReady() {
  return useContext(ContentContext).ready;
}

/** A page's content: the database version merged over its built-in defaults. */
export function usePageContent(slug, fallback) {
  const { pages } = useContext(ContentContext);
  if (!pages[slug]) return fallback;
  return mergeContent(fallback, pages[slug]);
}

/** The team from the database; `fallback` only if it couldn't be loaded. */
export function useTeamMembers(fallback) {
  const { team } = useContext(ContentContext);
  return team ?? fallback;
}
