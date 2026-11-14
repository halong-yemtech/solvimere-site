import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function PageList() {
  const [pages, setPages] = useState([]);
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

  return (
    <>
      <header className="top">
        <h1>Pages</h1>
        <p>Published pages replace the built-in copy on the public site. Drafts stay off the site.</p>
      </header>
      {error ? <p className="error">{error}</p> : null}
      <section className="list">
        {pages.map((page) => (
          <Link key={page.slug} to={`/pages/${page.slug}`}>
            <strong>{page.title}</strong>
            <span className={`pill ${page.status}`}>{page.status}</span>
          </Link>
        ))}
      </section>
    </>
  );
}
