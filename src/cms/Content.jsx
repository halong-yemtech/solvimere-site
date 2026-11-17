import { createContext, useContext, useEffect, useState } from "react";
import { supabase, supabaseConfigured } from "../lib/supabase";
import { mergeContent } from "./merge";

const ContentContext = createContext({});

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
