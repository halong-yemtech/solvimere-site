import { useEffect, useMemo, useState } from "react";
import { Archive, ArchiveRestore, Inbox, Mail, MailOpen, Reply, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Avatar } from "../components/Avatar";
import { Empty } from "../components/Empty";
import { Spinner } from "../components/Spinner";
import { toast } from "../components/Toast";
import { PageHead, SearchBox, Stat, Tabs, Toolbar, matches, timeAgo } from "../components/ui";

const fullDate = (iso) =>
  new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

/** Messages visitors sent from the site's and the portfolios' contact forms. */
export default function Messages() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [view, setView] = useState("inbox"); // inbox (new + read) | unread | archived
  const [query, setQuery] = useState("");

  useEffect(() => {
    supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500)
      .then(({ data, error: queryError }) => {
        if (queryError) {
          setError(
            /contact_messages/.test(queryError.message) && /exist|schema cache/.test(queryError.message)
              ? "The messages table isn't set up yet. Apply supabase/migrations/20261117160000_contact_messages.sql."
              : queryError.message,
          );
        }
        setRows(data || []);
      });
  }, []);

  const counts = useMemo(() => {
    const all = rows || [];
    return {
      inbox: all.filter((r) => r.status !== "archived").length,
      unread: all.filter((r) => r.status === "new").length,
      archived: all.filter((r) => r.status === "archived").length,
    };
  }, [rows]);

  const shown = useMemo(
    () =>
      (rows || []).filter((r) => {
        const inView =
          view === "archived"
            ? r.status === "archived"
            : view === "unread"
              ? r.status === "new"
              : r.status !== "archived";
        return inView && matches(query, r.name, r.email, r.message, r.page);
      }),
    [rows, view, query],
  );

  async function setStatus(row, status, quiet = false) {
    const before = row.status;
    setRows((all) => all.map((r) => (r.id === row.id ? { ...r, status } : r)));
    const { error: saveError } = await supabase.from("contact_messages").update({ status }).eq("id", row.id);
    if (saveError) {
      setRows((all) => all.map((r) => (r.id === row.id ? { ...r, status: before } : r)));
      toast.error(saveError);
      return;
    }
    if (!quiet) {
      toast.success(
        status === "archived"
          ? `Message from ${row.name} archived.`
          : status === "new"
            ? `Marked as unread.`
            : before === "archived"
              ? `Message from ${row.name} moved to the inbox.`
              : `Marked as read.`,
      );
    }
  }

  async function remove(row) {
    if (!window.confirm(`Delete the message from ${row.name}? This can't be undone.`)) return;
    const { error: deleteError } = await supabase.from("contact_messages").delete().eq("id", row.id);
    if (deleteError) {
      toast.error(deleteError);
      return;
    }
    setRows((all) => all.filter((r) => r.id !== row.id));
    toast.success(`Message from ${row.name} deleted.`);
  }

  if (!rows) return <Spinner label="Loading messages…" />;

  return (
    <div className="ui-page">
      <PageHead
        icon={Mail}
        title="Messages"
        description="Sent from the site's “Send us a message” widget and the portfolio contact forms."
        stats={
          <>
            <Stat icon={Inbox} value={counts.inbox} label="in inbox" />
            <Stat icon={Mail} value={counts.unread} label="unread" tone={counts.unread ? "warn" : undefined} />
          </>
        }
      />
      {error ? <p className="error">{error}</p> : null}

      <Toolbar>
        <SearchBox value={query} onChange={setQuery} placeholder="Search name, email or text" />
        <Tabs
          value={view}
          onChange={setView}
          label="Folder"
          options={[
            { value: "inbox", label: "Inbox", icon: Inbox, count: counts.inbox },
            { value: "unread", label: "Unread", icon: Mail, count: counts.unread },
            { value: "archived", label: "Archived", icon: Archive, count: counts.archived },
          ]}
        />
      </Toolbar>

      {!error && shown.length === 0 ? (
        query ? (
          <Empty compact icon={Mail} title="No matching messages">
            Nothing matches “{query}”.
          </Empty>
        ) : (
          <Empty
            icon={view === "archived" ? Archive : Inbox}
            title={
              view === "archived" ? "No archived messages" : view === "unread" ? "All caught up" : "Inbox is empty"
            }
          >
            {view === "archived"
              ? "Messages you archive are kept here."
              : view === "unread"
                ? "Every message has been read."
                : "Messages visitors send from the site and the portfolios will appear here."}
          </Empty>
        )
      ) : (
        <ul className="msg-list">
          {shown.map((row) => {
            const unread = row.status === "new";
            return (
              <li key={row.id} className={`msg-card${unread ? " is-unread" : ""}`}>
                <Avatar name={row.name} size={32} />
                <div className="msg-body">
                  <header>
                    <strong>{row.name}</strong>
                    <a href={`mailto:${row.email}`} className="msg-email">
                      {row.email}
                    </a>
                    {unread ? <span className="ui-badge is-blue">New</span> : null}
                    <time dateTime={row.created_at} title={fullDate(row.created_at)}>
                      {timeAgo(row.created_at)}
                    </time>
                  </header>
                  <p>{row.message}</p>
                  {row.page ? (
                    <span className="ui-muted">Sent from {row.page === "/" ? "the home page" : row.page}</span>
                  ) : null}
                </div>
                <div className="msg-actions">
                  <a
                    className="primary icon-btn"
                    href={`mailto:${row.email}?subject=${encodeURIComponent("Re: your message to Solvimere")}`}
                    title="Reply by email"
                    aria-label={`Reply to ${row.name}`}
                    onClick={() => unread && setStatus(row, "read", true)}
                  >
                    <Reply />
                  </a>
                  {row.status !== "archived" ? (
                    <button
                      type="button"
                      className="ghost icon-btn"
                      title={unread ? "Mark as read" : "Mark as unread"}
                      aria-label={unread ? "Mark as read" : "Mark as unread"}
                      onClick={() => setStatus(row, unread ? "read" : "new")}
                    >
                      {unread ? <MailOpen /> : <Mail />}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="ghost icon-btn"
                    title={row.status === "archived" ? "Move to inbox" : "Archive"}
                    aria-label={row.status === "archived" ? "Move to inbox" : "Archive"}
                    onClick={() => setStatus(row, row.status === "archived" ? "read" : "archived")}
                  >
                    {row.status === "archived" ? <ArchiveRestore /> : <Archive />}
                  </button>
                  <button
                    type="button"
                    className="danger icon-btn"
                    title="Delete"
                    aria-label={`Delete the message from ${row.name}`}
                    onClick={() => remove(row)}
                  >
                    <Trash2 />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
