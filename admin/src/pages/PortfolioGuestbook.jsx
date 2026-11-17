import { useEffect, useState } from "react";
import { deleteComment, listGuestbook, setCommentApproved } from "../portfolio/api";

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
      .then(setRows)
      .catch((err) => setError(err.message));
  }
  useEffect(load, []);

  async function run(fn) {
    setError("");
    try {
      await fn();
      load();
    } catch (err) {
      setError(err.message);
    }
  }

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
      {!rows && !error ? <p className="empty">Loading…</p> : null}
      {rows && rows.length === 0 ? <p className="empty">No comments yet.</p> : null}
      <div className="appt-list">
        {(rows || []).map((c) => (
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
              <button type="button" className="ghost" onClick={() => run(() => setCommentApproved(c.id, !c.approved))}>
                {c.approved ? "Hide" : "Show"}
              </button>
              <button
                type="button"
                className="danger"
                onClick={() => window.confirm(`Delete the comment from ${c.name}?`) && run(() => deleteComment(c.id))}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
