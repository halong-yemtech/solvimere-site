import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  CalendarX,
  Check,
  Clock,
  Globe,
  History,
  Mail,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { Avatar } from "../components/Avatar";
import { Empty } from "../components/Empty";
import { Spinner } from "../components/Spinner";
import { toast } from "../components/Toast";
import { PageHead, SearchBox, Stat, Tabs, Toolbar, matches } from "../components/ui";

const BUSINESS_TZ = "America/New_York";
const STATUS = {
  pending: { label: "Pending", tone: "amber" },
  confirmed: { label: "Confirmed", tone: "green" },
  cancelled: { label: "Cancelled", tone: "red" },
};

const time = (iso, timeZone) =>
  new Date(iso).toLocaleTimeString(undefined, { timeZone, hour: "numeric", minute: "2-digit", timeZoneName: "short" });

function dayLabel(iso) {
  const d = new Date(iso);
  const today = new Date();
  const start = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((start(d) - start(today)) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
}

/** A calendar file for the meeting, so it can be added to any calendar app. */
function downloadIcs(row) {
  const fmt = (d) =>
    d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  const start = new Date(row.starts_at);
  const end = new Date(start.getTime() + (row.duration_minutes || 30) * 60000);
  const esc = (s) =>
    String(s || "")
      .replace(/[\\,;]/g, (c) => `\\${c}`)
      .replace(/\n/g, "\\n");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Solvimere//Admin//EN",
    "BEGIN:VEVENT",
    `UID:${row.id}@solvimere`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${esc(`Solvimere meeting with ${row.name}`)}`,
    `DESCRIPTION:${esc([row.topic, row.email, row.company].filter(Boolean).join("\n"))}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: `meeting-${row.name}.ics` });
  a.click();
  URL.revokeObjectURL(url);
}

function mailtoFor(row) {
  const when = `${new Date(row.starts_at).toLocaleString(undefined, {
    timeZone: row.visitor_timezone || BUSINESS_TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  })}`;
  const body = `Hi ${row.name},\n\nThanks for booking a call with Solvimere. Your meeting is on ${when} (${row.duration_minutes || 30} minutes).\n\nMeeting link: \n\nSee you then,\nSolvimere`;
  return `mailto:${row.email}?subject=${encodeURIComponent("Your meeting with Solvimere")}&body=${encodeURIComponent(body)}`;
}

/** Meetings booked by visitors from the site's assistant ("Book a meeting"). */
export default function Appointments() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [view, setView] = useState("upcoming");
  const [query, setQuery] = useState("");

  useEffect(() => {
    supabase
      .from("appointments")
      .select("*")
      .order("starts_at", { ascending: true })
      .limit(1000)
      .then(({ data, error: queryError }) => {
        if (queryError) {
          setError(
            /appointments/.test(queryError.message) && /exist|schema cache/.test(queryError.message)
              ? "The appointments table isn't set up yet. Apply supabase/migrations/20261117140000_appointments.sql."
              : queryError.message,
          );
        }
        setRows(data || []);
      });
  }, []);

  const groups = useMemo(() => {
    const since = Date.now() - 60 * 60 * 1000; // a meeting stays "upcoming" until an hour after it starts
    const all = rows || [];
    const upcoming = all.filter((r) => r.status !== "cancelled" && new Date(r.starts_at).getTime() >= since);
    const past = all.filter((r) => r.status !== "cancelled" && new Date(r.starts_at).getTime() < since).reverse();
    const cancelled = all.filter((r) => r.status === "cancelled").reverse();
    return { upcoming, past, cancelled };
  }, [rows]);

  const shown = useMemo(
    () => groups[view].filter((r) => matches(query, r.name, r.email, r.company, r.topic)),
    [groups, view, query],
  );

  // Upcoming meetings are grouped by day.
  const byDay = useMemo(() => {
    const map = new Map();
    shown.forEach((r) => {
      const key = dayLabel(r.starts_at);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(r);
    });
    return [...map.entries()];
  }, [shown]);

  async function setStatus(row, status) {
    const before = row.status;
    setRows((all) => all.map((r) => (r.id === row.id ? { ...r, status } : r)));
    const { error: saveError } = await supabase.from("appointments").update({ status }).eq("id", row.id);
    if (saveError) {
      setRows((all) => all.map((r) => (r.id === row.id ? { ...r, status: before } : r)));
      toast.error(saveError.code === "23505" ? "Another active booking already holds that time." : saveError);
      return;
    }
    toast.success(`Booking from ${row.name} ${status === "pending" ? "restored" : status}.`);
  }

  async function remove(row) {
    if (!window.confirm(`Delete the booking from ${row.name}? This can't be undone.`)) return;
    const { error: deleteError } = await supabase.from("appointments").delete().eq("id", row.id);
    if (deleteError) {
      toast.error(deleteError);
      return;
    }
    setRows((all) => all.filter((r) => r.id !== row.id));
    toast.success(`Booking from ${row.name} deleted.`);
  }

  if (!rows) return <Spinner label="Loading bookings…" />;

  const pending = groups.upcoming.filter((r) => r.status === "pending").length;

  return (
    <div className="ui-page">
      <PageHead
        icon={CalendarDays}
        title="Appointments"
        description="Meetings visitors booked from the site's assistant. Confirm them and email the meeting link. Times are New York time."
        stats={
          <>
            <Stat icon={CalendarClock} value={groups.upcoming.length} label="upcoming" />
            <Stat icon={Clock} value={pending} label="to confirm" tone={pending ? "warn" : undefined} />
          </>
        }
      />
      {error ? <p className="error">{error}</p> : null}

      <Toolbar>
        <SearchBox value={query} onChange={setQuery} placeholder="Search name, email, company or topic" />
        <Tabs
          value={view}
          onChange={setView}
          label="Bookings"
          options={[
            { value: "upcoming", label: "Upcoming", icon: CalendarClock, count: groups.upcoming.length },
            { value: "past", label: "Past", icon: History, count: groups.past.length },
            { value: "cancelled", label: "Cancelled", icon: CalendarX, count: groups.cancelled.length },
          ]}
        />
      </Toolbar>

      {!error && shown.length === 0 ? (
        <Empty
          icon={view === "upcoming" ? CalendarClock : view === "past" ? History : CalendarX}
          title={
            query
              ? "No matching bookings"
              : view === "upcoming"
                ? "No upcoming bookings"
                : view === "past"
                  ? "No past bookings"
                  : "No cancelled bookings"
          }
        >
          {query
            ? `Nothing matches “${query}”.`
            : view === "upcoming"
              ? "Meetings visitors book from the site's assistant will appear here."
              : "Bookings move here once their time has passed or they're cancelled."}
        </Empty>
      ) : (
        byDay.map(([day, list]) => (
          <section key={day} className="appt-day">
            <h2>
              {day}
              <em>{list.length}</em>
            </h2>
            <ul className="appt-cards">
              {list.map((row) => {
                const status = STATUS[row.status] || STATUS.pending;
                return (
                  <li key={row.id} className={`appt-card is-${row.status}`}>
                    <div className="appt-time">
                      <strong>{time(row.starts_at, BUSINESS_TZ)}</strong>
                      <span>{row.duration_minutes || 30} min</span>
                    </div>
                    <div className="appt-person">
                      <Avatar name={row.name} size={36} />
                      <div className="ui-row-main">
                        <strong>
                          {row.name}
                          {row.company ? <span className="appt-company"> · {row.company}</span> : null}
                        </strong>
                        <a href={`mailto:${row.email}`}>{row.email}</a>
                      </div>
                    </div>
                    <div className="appt-detail">
                      {row.topic ? <p>{row.topic}</p> : <p className="ui-muted">No topic given</p>}
                      {row.visitor_timezone && row.visitor_timezone !== BUSINESS_TZ ? (
                        <span className="ui-muted">
                          <Globe /> Their time: {time(row.starts_at, row.visitor_timezone)}
                        </span>
                      ) : null}
                    </div>
                    <span className={`ui-badge is-${status.tone}`}>{status.label}</span>
                    <div className="appt-buttons">
                      {row.status === "pending" ? (
                        <button
                          type="button"
                          className="primary icon-btn"
                          title="Confirm"
                          aria-label={`Confirm the booking from ${row.name}`}
                          onClick={() => setStatus(row, "confirmed")}
                        >
                          <Check />
                        </button>
                      ) : null}
                      <a
                        className="ghost icon-btn"
                        href={mailtoFor(row)}
                        title="Email the meeting details"
                        aria-label={`Email ${row.name}`}
                      >
                        <Mail />
                      </a>
                      {row.status !== "cancelled" ? (
                        <button
                          type="button"
                          className="ghost icon-btn"
                          title="Add to calendar (.ics)"
                          aria-label="Add to calendar"
                          onClick={() => downloadIcs(row)}
                        >
                          <CalendarPlus />
                        </button>
                      ) : null}
                      {row.status === "cancelled" ? (
                        <button
                          type="button"
                          className="ghost icon-btn"
                          title="Restore booking"
                          aria-label="Restore booking"
                          onClick={() => setStatus(row, "pending")}
                        >
                          <RotateCcw />
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="ghost icon-btn"
                          title="Cancel booking"
                          aria-label={`Cancel the booking from ${row.name}`}
                          onClick={() =>
                            window.confirm(`Cancel the booking from ${row.name}?`) && setStatus(row, "cancelled")
                          }
                        >
                          <X />
                        </button>
                      )}
                      <button
                        type="button"
                        className="danger icon-btn"
                        title="Delete"
                        aria-label={`Delete the booking from ${row.name}`}
                        onClick={() => remove(row)}
                      >
                        <Trash2 />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
      {view === "upcoming" && groups.upcoming.some((r) => r.status === "confirmed") ? (
        <p className="ui-muted appt-foot">
          <CalendarCheck /> Confirmed meetings stay here until an hour after they start.
        </p>
      ) : null}
    </div>
  );
}
