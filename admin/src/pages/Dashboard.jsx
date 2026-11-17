import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../auth";
import { Spinner } from "../components/Spinner";
import { Empty } from "../components/Empty";
import { FileText } from "lucide-react";

export default function Dashboard() {
  const { profile } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  // Load everything first, so the page appears once, complete.
  useEffect(() => {
    let alive = true;
    const isAdmin = profile?.role === "admin";
    Promise.all([
      supabase.from("pages").select("slug, title, status, updated_at").order("title"),
      supabase.from("team_members").select("id", { count: "exact", head: true }),
      isAdmin ? supabase.from("profiles").select("id", { count: "exact", head: true }) : { count: 0 },
    ]).then(([pagesRes, teamRes, peopleRes]) => {
      if (!alive) return;
      setError(pagesRes.error ? pagesRes.error.message : "");
      setData({ pages: pagesRes.data || [], teamCount: teamRes.count || 0, people: peopleRes.count || 0 });
    });
    return () => {
      alive = false;
    };
  }, [profile?.role]);

  if (!data) return <Spinner label="Loading overview…" />;
  const { pages, teamCount, people } = data;

  const published = pages.filter((page) => page.status === "published").length;

  return (
    <>
      <header className="top">
        <p className="eyebrow">Solvimere</p>
        <h1>Overview</h1>
        <p>Manage the public pages, the team, and the people who can edit them.</p>
      </header>
      {error ? <p className="error">{error}</p> : null}
      <section className="stats">
        <article>
          <strong>{pages.length}</strong>
          <span>Pages</span>
        </article>
        <article>
          <strong>{published}</strong>
          <span>Published</span>
        </article>
        <article>
          <strong>{teamCount}</strong>
          <span>Team members</span>
        </article>
        {profile?.role === "admin" ? (
          <article>
            <strong>{people}</strong>
            <span>Profiles</span>
          </article>
        ) : null}
      </section>
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
