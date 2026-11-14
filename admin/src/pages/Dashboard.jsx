import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../auth";

export default function Dashboard() {
  const { profile } = useAuth();
  const [pages, setPages] = useState([]);
  const [people, setPeople] = useState(0);
  const [teamCount, setTeamCount] = useState(0);

  useEffect(() => {
    supabase
      .from("pages")
      .select("slug, title, status, updated_at")
      .order("title")
      .then(({ data }) => setPages(data || []));
    supabase
      .from("team_members")
      .select("id", { count: "exact", head: true })
      .then(({ count }) => setTeamCount(count || 0));
    if (profile?.role === "admin") {
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .then(({ count }) => setPeople(count || 0));
    }
  }, [profile?.role]);

  const published = pages.filter((page) => page.status === "published").length;

  return (
    <>
      <header className="top">
        <p className="eyebrow">Solvimere</p>
        <h1>Overview</h1>
        <p>Manage the public pages, the team, and the people who can edit them.</p>
      </header>
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
