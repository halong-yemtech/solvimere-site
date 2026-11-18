import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  FileText,
  IdCard,
  Images,
  LayoutDashboard,
  Mail,
  MailOpen,
  Plus,
  UserPlus,
  Users,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../auth";
import { Avatar } from "../components/Avatar";
import { Empty } from "../components/Empty";
import { Spinner } from "../components/Spinner";
import { PageHead, timeAgo } from "../components/ui";

const when = (iso) =>
  new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

// A query whose table may not exist yet (migration not applied) counts as empty, not as an error.
const safe = (promise) => promise.then((res) => (res.error ? { data: [], count: 0 } : res));

export default function Dashboard() {
  const { profile } = useAuth();
  const [data, setData] = useState(null);

  // Everything loads together, so the page appears once, complete.
  useEffect(() => {
    let alive = true;
    const now = new Date().toISOString();
    Promise.all([
      safe(supabase.from("pages").select("slug, title, status, updated_at").order("updated_at", { ascending: false })),
      safe(supabase.from("team_members").select("id", { count: "exact", head: true })),
      safe(supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "new")),
      safe(
        supabase
          .from("contact_messages")
          .select("id, name, email, message, status, created_at")
          .neq("status", "archived")
          .order("created_at", { ascending: false })
          .limit(5),
      ),
      safe(
        supabase
          .from("appointments")
          .select("id, name, email, topic, starts_at, status")
          .gte("starts_at", now)
          .neq("status", "cancelled")
          .order("starts_at")
          .limit(5),
      ),
      safe(supabase.from("portfolio_profiles").select("id, visibility")),
    ]).then(([pages, team, unread, messages, meetings, portfolios]) => {
      if (!alive) return;
      setData({
        pages: pages.data || [],
        team: team.count || 0,
        unread: unread.count || 0,
        messages: messages.data || [],
        meetings: meetings.data || [],
        portfolios: portfolios.data || [],
      });
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!data) return <Spinner label="Loading overview…" />;

  const published = data.pages.filter((p) => p.status === "published").length;
  const publicPortfolios = data.portfolios.filter((p) => p.visibility === "public").length;
  const firstName = (profile?.full_name || "").split(" ")[0];

  const cards = [
    {
      to: "/pages",
      icon: FileText,
      value: data.pages.length,
      label: "Pages",
      hint: `${published} published`,
    },
    { to: "/team", icon: Users, value: data.team, label: "Team members", hint: "On the team page" },
    {
      to: "/messages",
      icon: Mail,
      value: data.unread,
      label: "Unread messages",
      hint: data.unread ? "Waiting for a reply" : "All caught up",
      tone: data.unread ? "blue" : "",
    },
    {
      to: "/appointments",
      icon: CalendarDays,
      value: data.meetings.length,
      label: "Upcoming meetings",
      hint: data.meetings[0] ? `Next: ${when(data.meetings[0].starts_at)}` : "None booked",
    },
    {
      to: "/portfolio",
      icon: IdCard,
      value: data.portfolios.length,
      label: "Portfolios",
      hint: `${publicPortfolios} public`,
    },
  ];

  return (
    <div className="ui-page">
      <PageHead
        icon={LayoutDashboard}
        title={firstName ? `Welcome back, ${firstName}` : "Overview"}
        description="What's happening on the Solvimere site and portfolios."
      />

      <section className="dash-cards" aria-label="Summary">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.to} to={card.to} className={`dash-card${card.tone ? ` is-${card.tone}` : ""}`}>
              <span className="dash-card-icon">
                <Icon />
              </span>
              <strong>{card.value}</strong>
              <span className="dash-card-label">{card.label}</span>
              <span className="dash-card-hint">{card.hint}</span>
            </Link>
          );
        })}
      </section>

      <section className="dash-quick" aria-label="Quick actions">
        <Link className="ghost" to="/team">
          <UserPlus />
          Add team member
        </Link>
        <Link className="ghost" to="/portfolio">
          <Plus />
          New portfolio
        </Link>
        <Link className="ghost" to="/portfolio/media">
          <Images />
          Upload media
        </Link>
        <Link className="ghost" to="/pages/home">
          <FileText />
          Edit home page
        </Link>
      </section>

      <div className="dash-grid">
        <section className="ui-card">
          <div className="ui-card-title">
            <h2>
              <MailOpen />
              Latest messages
            </h2>
            <Link to="/messages">
              Inbox <ArrowRight />
            </Link>
          </div>
          {data.messages.length === 0 ? (
            <Empty compact icon={Mail} title="No messages">
              New messages from the site appear here.
            </Empty>
          ) : (
            <ul className="ui-rows">
              {data.messages.map((m) => (
                <li key={m.id}>
                  <Link className="ui-row" to="/messages">
                    <Avatar name={m.name} size={28} />
                    <span className="ui-row-main">
                      <strong>
                        {m.name}
                        {m.status === "new" ? <em className="dash-dot" aria-label="Unread" /> : null}
                      </strong>
                      <span>{m.message}</span>
                    </span>
                    <span className="ui-muted">{timeAgo(m.created_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="ui-card">
          <div className="ui-card-title">
            <h2>
              <CalendarDays />
              Upcoming meetings
            </h2>
            <Link to="/appointments">
              All bookings <ArrowRight />
            </Link>
          </div>
          {data.meetings.length === 0 ? (
            <Empty compact icon={CalendarDays} title="Nothing booked">
              Meetings booked from the site&apos;s assistant appear here.
            </Empty>
          ) : (
            <ul className="ui-rows">
              {data.meetings.map((m) => {
                const d = new Date(m.starts_at);
                return (
                  <li key={m.id}>
                    <Link className="ui-row" to="/appointments">
                      <span className="dash-date">
                        <b>{d.getDate()}</b>
                        {d.toLocaleString(undefined, { month: "short" })}
                      </span>
                      <span className="ui-row-main">
                        <strong>{m.name}</strong>
                        <span>
                          {d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                          {m.topic ? ` · ${m.topic}` : ""}
                        </span>
                      </span>
                      <span className={`ui-badge ${m.status === "confirmed" ? "is-green" : "is-amber"}`}>
                        {m.status === "confirmed" ? "Confirmed" : "Pending"}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="ui-card dash-pages">
          <div className="ui-card-title">
            <h2>
              <FileText />
              Recently edited pages
            </h2>
            <Link to="/pages">
              All pages <ArrowRight />
            </Link>
          </div>
          {data.pages.length === 0 ? (
            <Empty compact icon={FileText} title="No pages yet">
              Apply the database migrations to create the site&apos;s pages.
            </Empty>
          ) : (
            <ul className="ui-rows dash-page-rows">
              {data.pages.slice(0, 6).map((page) => (
                <li key={page.slug}>
                  <Link className="ui-row" to={`/pages/${page.slug}`}>
                    <span className="ui-row-icon">
                      <FileText />
                    </span>
                    <span className="ui-row-main">
                      <strong>{page.title}</strong>
                      <span>Edited {timeAgo(page.updated_at)}</span>
                    </span>
                    <span className={`ui-badge ${page.status === "published" ? "is-green" : "is-gray"}`}>
                      {page.status === "published" ? "Published" : "Draft"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
