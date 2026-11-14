import { createContext, useContext, useEffect, useState } from "react";
import { supabase, supabaseConfigured } from "../lib/supabase";

const ContentContext = createContext({});

function mergeContent(fallback, remote) {
  if (remote == null) return fallback;
  if (Array.isArray(fallback)) return Array.isArray(remote) ? remote : fallback;
  if (!fallback || typeof fallback !== "object" || Array.isArray(fallback)) return remote;
  if (typeof remote !== "object" || Array.isArray(remote)) return remote;
  const next = { ...fallback };
  Object.keys(remote).forEach((key) => {
    next[key] = key in fallback ? mergeContent(fallback[key], remote[key]) : remote[key];
  });
  return next;
}

export function ContentProvider({ children }) {
  const [pages, setPages] = useState({});

  useEffect(() => {
    if (!supabaseConfigured) return undefined;
    let cancelled = false;
    supabase
      .from("pages")
      .select("slug, content")
      .eq("status", "published")
      .then(({ data }) => {
        if (cancelled || !data) return;
        const map = {};
        data.forEach((row) => {
          map[row.slug] = row.content;
        });
        setPages(map);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return <ContentContext.Provider value={pages}>{children}</ContentContext.Provider>;
}

export function usePageContent(slug, fallback) {
  const pages = useContext(ContentContext);
  if (!pages[slug]) return fallback;
  return mergeContent(fallback, pages[slug]);
}
