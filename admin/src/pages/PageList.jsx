import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Spinner } from "../components/Spinner";
import { Empty } from "../components/Empty";

export default function PageList() {
  const [pages, setPages] = useState(null);
  const [error, setError] = useState("");

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

  if (!pages) return <Spinner label="Loading pages…" />;

  return (
    <>
      <header className="top">
        <h1>Pages</h1>
        <p>Published pages replace the built-in copy on the public site. Drafts stay off the site.</p>
      </header>
      {error ? <p className="error">{error}</p> : null}
      {pages.length === 0 && !error ? (
        <Empty icon={FileText} title="No pages yet">
          Pages are created by the database migrations. Apply them to start editing the site.
        </Empty>
      ) : (
        <section className="list">
          {pages.map((page) => (
            <Link key={page.slug} to={`/pages/${page.slug}`}>
              <strong>{page.title}</strong>
              <span className={`pill ${page.status}`}>{page.status}</span>
            </Link>
          ))}
        </section>
      )}
    </>
  );
}
