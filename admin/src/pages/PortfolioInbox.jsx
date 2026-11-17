import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { call } from "../lib/portfolio";

const fmt = (iso) =>
  new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

/** Contact-form messages and guest-book comments sent from portfolio pages. */
export default function PortfolioInbox() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "guestbook" ? "guestbook" : "messages";
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  function load() {
    call("listInbox")
      .then(setData)
      .catch((err) => setError(err.message));
  }
  useEffect(load, []);

  async function run(op, ids, ...rest) {
    setError("");
    try {
      await call(op, ids, ...rest);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  const unhandled = data?.messages.filter((m) => !m.handled).length ?? 0;

  return (
    <>
      <header className="top row">
        <div>
          <p className="eyebrow">Portfolio</p>
          <h1>Portfolio inbox</h1>
          <p>Messages from portfolio contact forms and comments in the guest book.</p>
        </div>
        <div className="appt-tabs">
          <button type="button" className={`ghost ${tab === "messages" ? "is-on" : ""}`} onClick={() => setParams({})}>
            Messages{unhandled ? ` (${unhandled})` : ""}
          </button>
          <button
            type="button"
            className={`ghost ${tab === "guestbook" ? "is-on" : ""}`}
            onClick={() => setParams({ tab: "guestbook" })}
          >
            Guest book
          </button>
        </div>
      </header>
      {error ? <p className="error">{error}</p> : null}
      {!data && !error ? <p className="empty">Loading…</p> : null}

      {data && tab === "messages" ? (
        <div className="appt-list">
          {data.messages.length === 0 ? <p className="empty">No messages.</p> : null}
          {data.messages.map((m) => (
            <article key={m.id} className={`panel appt msg ${m.handled ? "" : "is-new"}`}>
              <div className="appt-who">
                <strong>
                  {!m.handled ? <span className="msg-dot" aria-label="Not handled" /> : null}
                  {m.name}
                </strong>
                <a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message")}`}>{m.email}</a>
              </div>
              <div className="appt-when">
                <span>{fmt(m.createdAt)}</span>
              </div>
              <p className="appt-topic">{m.message}</p>
              <div className="appt-actions">
                <button type="button" className="ghost" onClick={() => run("setMessagesHandled", [m.id], !m.handled)}>
                  {m.handled ? "Mark as new" : "Mark handled"}
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={() => window.confirm(`Delete the message from ${m.name}?`) && run("deleteMessages", [m.id])}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {data && tab === "guestbook" ? (
        <div className="appt-list">
          {data.comments.length === 0 ? <p className="empty">No comments.</p> : null}
          {data.comments.map((c) => (
            <article key={c.id} className={`panel appt msg ${c.approved ? "" : "is-cancelled"}`}>
              <div className="appt-who">
                <strong>{c.name}</strong>
                <span>{c.approved ? "Shown on the site" : "Hidden"}</span>
              </div>
              <div className="appt-when">
                <span>{fmt(c.createdAt)}</span>
              </div>
              <p className="appt-topic">{c.comment}</p>
              <div className="appt-actions">
                <button type="button" className="ghost" onClick={() => run("setCommentsApproved", [c.id], !c.approved)}>
                  {c.approved ? "Hide" : "Show"}
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={() => window.confirm(`Delete the comment from ${c.name}?`) && run("deleteComments", [c.id])}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </>
  );
}
