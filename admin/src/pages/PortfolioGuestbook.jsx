import { useEffect, useMemo, useState } from "react";
import { BookOpen, Eye, EyeOff, MessagesSquare, Trash2 } from "lucide-react";
import { deleteComment, listGuestbook, setCommentApproved } from "../portfolio/api";
import { Avatar } from "../components/Avatar";
import { Empty } from "../components/Empty";
import { Spinner } from "../components/Spinner";
import { toast } from "../components/Toast";
import { PageHead, SearchBox, Stat, Tabs, Toolbar, matches, timeAgo } from "../components/ui";

const fullDate = (iso) =>
  new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

/** Comments visitors left in the portfolios' guest book. Messages from contact forms are in Messages. */
export default function PortfolioGuestbook() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [view, setView] = useState("all");
  const [query, setQuery] = useState("");

  function load() {
    listGuestbook()
      .then((list) => {
        setError("");
        setRows(list);
      })
      .catch((err) => {
        setError(err.message);
        setRows((current) => current || []);
      });
  }
  useEffect(load, []);

  const shown = useMemo(
    () =>
      (rows || []).filter(
        (c) => (view === "all" || (view === "shown" ? c.approved : !c.approved)) && matches(query, c.name, c.comment),
      ),
    [rows, view, query],
  );

  async function toggle(c) {
    setRows((all) => all.map((r) => (r.id === c.id ? { ...r, approved: !c.approved } : r)));
    try {
      await setCommentApproved(c.id, !c.approved);
      toast.success(c.approved ? `Comment from ${c.name} hidden.` : `Comment from ${c.name} shown.`);
    } catch (err) {
      setRows((all) => all.map((r) => (r.id === c.id ? { ...r, approved: c.approved } : r)));
      toast.error(err);
    }
  }

  async function remove(c) {
    if (!window.confirm(`Delete the comment from ${c.name}? This can't be undone.`)) return;
    try {
      await deleteComment(c.id);
      setRows((all) => all.filter((r) => r.id !== c.id));
      toast.success(`Comment from ${c.name} deleted.`);
    } catch (err) {
      toast.error(err);
    }
  }

  if (!rows) return <Spinner label="Loading comments…" />;

  const shownCount = rows.filter((c) => c.approved).length;

  return (
    <div className="ui-page">
      <PageHead
        icon={BookOpen}
        title="Guest book"
        description="Comments appear on portfolios right away. Hide or delete any that shouldn't be there."
        stats={
          <>
            <Stat icon={MessagesSquare} value={rows.length} label="comments" />
            <Stat icon={EyeOff} value={rows.length - shownCount} label="hidden" />
          </>
        }
      />
      {error ? <p className="error">{error}</p> : null}

      {rows.length === 0 && !error ? (
        <Empty icon={BookOpen} title="No comments yet">
          Comments visitors leave in a portfolio&apos;s guest book will appear here.
        </Empty>
      ) : (
        <>
          <Toolbar>
            <SearchBox value={query} onChange={setQuery} placeholder="Search name or comment" />
            <Tabs
              value={view}
              onChange={setView}
              options={[
                { value: "all", label: "All", count: rows.length },
                { value: "shown", label: "Shown", icon: Eye, count: shownCount },
                { value: "hidden", label: "Hidden", icon: EyeOff, count: rows.length - shownCount },
              ]}
            />
          </Toolbar>
          {shown.length === 0 ? (
            <Empty compact icon={BookOpen} title="No matching comments">
              Try another search or filter.
            </Empty>
          ) : (
            <ul className="msg-list">
              {shown.map((c) => (
                <li key={c.id} className={`msg-card${c.approved ? "" : " is-hidden"}`}>
                  <Avatar name={c.name} size={40} />
                  <div className="msg-body">
                    <header>
                      <strong>{c.name}</strong>
                      <span className={`ui-badge ${c.approved ? "is-green" : "is-gray"}`}>
                        {c.approved ? "Shown" : "Hidden"}
                      </span>
                      <time dateTime={c.created_at} title={fullDate(c.created_at)}>
                        {timeAgo(c.created_at)}
                      </time>
                    </header>
                    <p>{c.comment}</p>
                  </div>
                  <div className="msg-actions">
                    <button
                      type="button"
                      className="ghost icon-btn"
                      aria-label={`${c.approved ? "Hide" : "Show"} the comment from ${c.name}`}
                      title={c.approved ? "Hide from portfolios" : "Show on portfolios"}
                      onClick={() => toggle(c)}
                    >
                      {c.approved ? <EyeOff /> : <Eye />}
                    </button>
                    <button
                      type="button"
                      className="danger icon-btn"
                      aria-label={`Delete the comment from ${c.name}`}
                      title="Delete"
                      onClick={() => remove(c)}
                    >
                      <Trash2 />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
