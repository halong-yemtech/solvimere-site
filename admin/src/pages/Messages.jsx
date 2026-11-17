import { useEffect, useState } from "react";
import { Archive, Inbox, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Spinner } from "../components/Spinner";
import { Empty } from "../components/Empty";
import { toast } from "../components/Toast";

const STATUSES = ["new", "read", "archived"];
const fmt = (iso) =>
  new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

/** Messages visitors sent from the site's corner widget ("Send us a message"). */
export default function Messages() {
  const [rows, setRows] = useState([]);
  const [view, setView] = useState("inbox"); // inbox = new + read, archived
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    let query = supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(300);
    query = view === "inbox" ? query.in("status", ["new", "read"]) : query.eq("status", "archived");
    query.then(({ data, error: queryError }) => {
      setLoading(false);
      if (queryError) {
        setError(
          /contact_messages/.test(queryError.message) && /exist|schema cache/.test(queryError.message)
            ? "The messages table isn't set up yet. Apply supabase/migrations/20261117160000_contact_messages.sql."
            : queryError.message,
        );
        return;
      }
      setError("");
      setRows(data || []);
    });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  async function setStatus(row, status, { quiet = false } = {}) {
    const { error: saveError } = await supabase.from("contact_messages").update({ status }).eq("id", row.id);
    if (saveError) {
      toast.error(saveError);
      return;
    }
    if (!quiet) {
      toast.success(
        status === "archived"
          ? `Message from ${row.name} archived.`
          : status === "new"
            ? `Message from ${row.name} marked unread.`
            : row.status === "archived"
              ? `Message from ${row.name} moved to the inbox.`
              : `Message from ${row.name} marked read.`,
      );
    }
    const leavesView = (view === "inbox") !== (status !== "archived");
    setRows((current) =>
      leavesView
        ? current.filter((r) => r.id !== row.id)
        : current.map((r) => (r.id === row.id ? { ...r, status } : r)),
    );
  }

  async function remove(row) {
    if (!window.confirm(`Delete the message from ${row.name}? This can't be undone.`)) return;
    const { error: deleteError } = await supabase.from("contact_messages").delete().eq("id", row.id);
    if (deleteError) {
      toast.error(deleteError);
      return;
    }
    setRows((current) => current.filter((r) => r.id !== row.id));
    toast.success(`Message from ${row.name} deleted.`);
  }

  if (loading) return <Spinner label="Loading messages…" />;

  const unread = rows.filter((r) => r.status === "new").length;

  return (
    <>
      <header className="top row">
        <div>
          <p className="eyebrow">Public site</p>
          <h1>Messages</h1>
          <p>
            Sent from the site&apos;s “Send us a message” widget.
            {view === "inbox" && unread ? ` ${unread} unread.` : ""}
          </p>
        </div>
        <div className="appt-tabs">
          <button type="button" className={`ghost ${view === "inbox" ? "is-on" : ""}`} onClick={() => setView("inbox")}>
            <Inbox />
            Inbox
          </button>
          <button
            type="button"
            className={`ghost ${view === "archived" ? "is-on" : ""}`}
            onClick={() => setView("archived")}
          >
            <Archive />
            Archived
          </button>
        </div>
      </header>
      {error ? <p className="error">{error}</p> : null}
      {!error && rows.length === 0 ? (
        <Empty
          icon={view === "inbox" ? Inbox : Archive}
          title={view === "inbox" ? "Inbox is empty" : "No archived messages"}
        >
          {view === "inbox"
            ? "Messages visitors send from the site and the portfolios will appear here."
            : "Messages you archive are kept here."}
        </Empty>
      ) : null}
      <div className="appt-list">
        {rows.map((row) => (
          <article key={row.id} className={`panel appt msg is-${row.status}`}>
            <div className="appt-who">
              <strong>
                {row.status === "new" ? <span className="msg-dot" aria-label="Unread" /> : null}
                {row.name}
              </strong>
              <a
                href={`mailto:${row.email}?subject=${encodeURIComponent("Re: your message to Solvimere")}`}
                onClick={() => row.status === "new" && setStatus(row, "read", { quiet: true })}
              >
                {row.email}
              </a>
            </div>
            <div className="appt-when">
              <span>{fmt(row.created_at)}</span>
              {row.page ? <span>from {row.page}</span> : null}
            </div>
            <p className="appt-topic">{row.message}</p>
            <div className="appt-actions">
              <label>
                <span className="sr-only">Status</span>
                <select value={row.status} onChange={(event) => setStatus(row, event.target.value)}>
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status[0].toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="danger icon-btn"
                onClick={() => remove(row)}
                aria-label={`Delete the message from ${row.name}`}
                title="Delete"
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
