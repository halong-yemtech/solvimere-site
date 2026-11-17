import { useEffect, useState } from "react";
import { BookOpen, Eye, EyeOff, Trash2 } from "lucide-react";
import { deleteComment, listGuestbook, setCommentApproved } from "../portfolio/api";
import { Spinner } from "../components/Spinner";
import { Empty } from "../components/Empty";
import { toast } from "../components/Toast";

const fmt = (iso) =>
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

  async function run(fn, done) {
    try {
      await fn();
      toast.success(done);
      load();
    } catch (err) {
      toast.error(err);
    }
  }

  if (!rows) return <Spinner label="Loading comments…" />;

  return (
    <>
      <header className="top row">
        <div>
          <p className="eyebrow">Portfolio</p>
          <h1>Guest book</h1>
          <p>Comments appear on portfolios right away; hide or delete any that shouldn&apos;t be there.</p>
        </div>
      </header>
      {error ? <p className="error">{error}</p> : null}
      {rows.length === 0 && !error ? (
        <Empty icon={BookOpen} title="No comments yet">
          Comments visitors leave in a portfolio&apos;s guest book will appear here.
        </Empty>
      ) : null}
      <div className="appt-list">
        {rows.map((c) => (
          <article key={c.id} className={`panel appt msg ${c.approved ? "" : "is-cancelled"}`}>
            <div className="appt-who">
              <strong>{c.name}</strong>
              <span>{c.approved ? "Shown" : "Hidden"}</span>
            </div>
            <div className="appt-when">
              <span>{fmt(c.created_at)}</span>
            </div>
            <p className="appt-topic">{c.comment}</p>
            <div className="appt-actions">
              <button
                type="button"
                className="ghost icon-btn"
                aria-label={`${c.approved ? "Hide" : "Show"} the comment from ${c.name}`}
                title={c.approved ? "Hide from portfolios" : "Show on portfolios"}
                onClick={() =>
                  run(
                    () => setCommentApproved(c.id, !c.approved),
                    c.approved ? `Comment from ${c.name} hidden.` : `Comment from ${c.name} shown.`,
                  )
                }
              >
                {c.approved ? <EyeOff /> : <Eye />}
              </button>
              <button
                type="button"
                className="danger icon-btn"
                aria-label={`Delete the comment from ${c.name}`}
                title="Delete"
                onClick={() =>
                  window.confirm(`Delete the comment from ${c.name}?`) &&
                  run(() => deleteComment(c.id), `Comment from ${c.name} deleted.`)
                }
              >
                <Trash2 />
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
