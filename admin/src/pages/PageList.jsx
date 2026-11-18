import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CircleDashed, CircleCheck, ExternalLink, FileText, Layers, Pencil, Clock } from "lucide-react";
import { supabase } from "../lib/supabase";
import { pageInfo, siteUrlFor } from "../lib/pages";
import { Spinner } from "../components/Spinner";
import { Empty } from "../components/Empty";
import { PageHead, SearchBox, Stat, Tabs, Toolbar, matches, timeAgo } from "../components/ui";

export default function PageList() {
  const [pages, setPages] = useState(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    supabase
      .from("pages")
      .select("slug, title, status, updated_at")
      .order("title")
      .then(({ data, error: queryError }) => {
        if (queryError) setError(queryError.message);
        setPages(data || []);
      });
  }, []);

  const shown = useMemo(
    () =>
      (pages || []).filter(
        (p) => (filter === "all" || p.status === filter) && matches(query, p.title, p.slug, pageInfo(p.slug).about),
      ),
    [pages, filter, query],
  );

  if (!pages) return <Spinner label="Loading pages…" />;

  const published = pages.filter((p) => p.status === "published").length;

  return (
    <div className="ui-page">
      <PageHead
        icon={FileText}
        title="Pages"
        description="The public site's copy. Published pages replace the built-in text; drafts stay off the site."
        stats={
          <>
            <Stat icon={Layers} value={pages.length} label="pages" />
            <Stat icon={CircleCheck} value={published} label="published" tone="good" />
            <Stat icon={CircleDashed} value={pages.length - published} label="drafts" />
          </>
        }
      />
      {error ? <p className="error">{error}</p> : null}

      {pages.length === 0 && !error ? (
        <Empty icon={FileText} title="No pages yet">
          Pages are created by the database migrations. Apply them to start editing the site.
        </Empty>
      ) : (
        <>
          <Toolbar>
            <SearchBox value={query} onChange={setQuery} placeholder="Search pages" />
            <Tabs
              value={filter}
              onChange={setFilter}
              options={[
                { value: "all", label: "All", count: pages.length },
                { value: "published", label: "Published", count: published },
                { value: "draft", label: "Drafts", count: pages.length - published },
              ]}
            />
          </Toolbar>
          {shown.length === 0 ? (
            <Empty compact icon={FileText} title="No matching pages">
              Try another search or filter.
            </Empty>
          ) : (
            <div className="page-cards">
              {shown.map((page) => {
                const info = pageInfo(page.slug);
                const Icon = info.icon;
                const live = siteUrlFor(page.slug);
                return (
                  <article key={page.slug} className="page-card">
                    <Link to={`/pages/${page.slug}`} className="page-card-hit">
                      <span className="page-card-icon">
                        <Icon />
                      </span>
                      <span className="page-card-text">
                        <strong>{page.title}</strong>
                        <span>{info.about}</span>
                      </span>
                    </Link>
                    <footer>
                      <span className={`ui-badge ${page.status === "published" ? "is-green" : "is-gray"}`}>
                        {page.status === "published" ? "Published" : "Draft"}
                      </span>
                      <span
                        className="ui-muted page-card-time"
                        title={`Last edited ${new Date(page.updated_at).toLocaleString()}`}
                      >
                        <Clock aria-hidden="true" />
                        {timeAgo(page.updated_at)}
                      </span>
                      <span className="page-card-actions">
                        {live ? (
                          <a
                            className="ghost icon-btn"
                            href={live}
                            target="_blank"
                            rel="noreferrer"
                            title="View on site"
                            aria-label={`View ${page.title} on the site`}
                          >
                            <ExternalLink />
                          </a>
                        ) : null}
                        <Link
                          className="primary icon-btn"
                          to={`/pages/${page.slug}`}
                          title="Edit"
                          aria-label={`Edit ${page.title}`}
                        >
                          <Pencil />
                        </Link>
                      </span>
                    </footer>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
