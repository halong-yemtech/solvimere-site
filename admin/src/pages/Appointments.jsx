import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const STATUSES = ["pending", "confirmed", "cancelled"];
const BUSINESS_TZ = "America/New_York";

const fmt = (iso, timeZone) =>
  new Date(iso).toLocaleString(undefined, {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

/** Meetings booked by visitors from the site's assistant ("Book a meeting"). */
export default function Appointments() {
  const [rows, setRows] = useState([]);
  const [view, setView] = useState("upcoming");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    let query = supabase.from("appointments").select("*");
    query =
      view === "upcoming"
        ? query.gte("starts_at", since).order("starts_at", { ascending: true })
        : query.lt("starts_at", since).order("starts_at", { ascending: false }).limit(200);
    query.then(({ data, error: queryError }) => {
      setLoading(false);
      if (queryError) {
        setError(
          /appointments/.test(queryError.message) && /exist|schema cache/.test(queryError.message)
            ? "The appointments table isn't set up yet. Apply supabase/migrations/20261117140000_appointments.sql."
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

  async function setStatus(row, status) {
    setError("");
    setMessage("");
    const { error: saveError } = await supabase.from("appointments").update({ status }).eq("id", row.id);
    if (saveError) {
      setError(saveError.code === "23505" ? "Another active booking already holds that time." : saveError.message);
      return;
    }
    setRows((current) => current.map((r) => (r.id === row.id ? { ...r, status } : r)));
    setMessage(`Marked ${row.name} as ${status}.`);
  }

  async function remove(row) {
    if (!window.confirm(`Delete the booking from ${row.name}? This can't be undone.`)) return;
    setError("");
    setMessage("");
    const { error: deleteError } = await supabase.from("appointments").delete().eq("id", row.id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setRows((current) => current.filter((r) => r.id !== row.id));
    setMessage("Booking deleted.");
  }

  return (
    <>
      <header className="top row">
        <div>
          <p className="eyebrow">Public site</p>
          <h1>Appointments</h1>
          <p>Meetings visitors booked from the site&apos;s assistant. Confirm them and email the meeting link.</p>
        </div>
        <div className="appt-tabs">
          <button
            type="button"
            className={`ghost ${view === "upcoming" ? "is-on" : ""}`}
            onClick={() => setView("upcoming")}
          >
            Upcoming
          </button>
          <button type="button" className={`ghost ${view === "past" ? "is-on" : ""}`} onClick={() => setView("past")}>
            Past
          </button>
        </div>
      </header>
      {error ? <p className="error">{error}</p> : null}
      {message ? <p className="ok">{message}</p> : null}
      {loading ? <p className="empty">Loading…</p> : null}
      {!loading && !error && rows.length === 0 ? (
        <p className="empty">{view === "upcoming" ? "No upcoming bookings." : "No past bookings."}</p>
      ) : null}
      <div className="appt-list">
        {rows.map((row) => (
          <article key={row.id} className={`panel appt is-${row.status}`}>
            <div className="appt-when">
              <strong>{fmt(row.starts_at, BUSINESS_TZ)}</strong>
              <span>
                {row.duration_minutes} min
                {row.visitor_timezone ? ` · visitor: ${fmt(row.starts_at, row.visitor_timezone)}` : ""}
              </span>
            </div>
            <div className="appt-who">
              <strong>{row.name}</strong>
              <a href={`mailto:${row.email}?subject=${encodeURIComponent("Your meeting with Solvimere")}`}>
                {row.email}
              </a>
              {row.company ? <span>{row.company}</span> : null}
            </div>
            {row.topic ? <p className="appt-topic">{row.topic}</p> : null}
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
              <button type="button" className="danger" onClick={() => remove(row)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
