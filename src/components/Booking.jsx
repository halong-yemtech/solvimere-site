import { useEffect, useMemo, useState } from "react";
import { supabase, supabaseConfigured } from "../lib/supabase";
import { useSiteAuth } from "../auth/SiteAuth";
import { Icon } from "./Icons";

// Must match private.is_bookable_slot() in supabase/migrations/*_appointments.sql.
const BUSINESS_TZ = "America/New_York";
const OPEN_HOUR = 9;
const CLOSE_HOUR = 17; // last slot starts 16:30
const SLOT_MINUTES = 30;
const LEAD_MS = 2 * 60 * 60 * 1000;
const DAYS_SHOWN = 10;

const visitorTz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";

/** Wall-clock parts of an instant in a time zone. */
function zonedParts(ms, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(ms));
  const get = (type) => Number(parts.find((p) => p.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day"), hour: get("hour"), minute: get("minute"), second: get("second") };
}

/** The UTC instant of a wall-clock time in a time zone (handles DST). */
function zonedToUtc(year, month, day, hour, minute, timeZone) {
  const wall = Date.UTC(year, month - 1, day, hour, minute);
  let guess = wall;
  for (let i = 0; i < 2; i++) {
    const p = zonedParts(guess, timeZone);
    const shown = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
    guess += wall - shown;
  }
  return guess;
}

/** The next business days (Mon–Fri, New York) that still have a bookable slot. */
function upcomingDays(now) {
  const days = [];
  const today = zonedParts(now, BUSINESS_TZ);
  for (let offset = 0; days.length < DAYS_SHOWN && offset < 30; offset++) {
    const date = new Date(Date.UTC(today.year, today.month - 1, today.day + offset));
    const weekday = date.getUTCDay();
    if (weekday === 0 || weekday === 6) continue;
    const [y, m, d] = [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()];
    const slots = [];
    for (let minutes = OPEN_HOUR * 60; minutes < CLOSE_HOUR * 60; minutes += SLOT_MINUTES) {
      const at = zonedToUtc(y, m, d, Math.floor(minutes / 60), minutes % 60, BUSINESS_TZ);
      if (at >= now + LEAD_MS) slots.push(at);
    }
    if (slots.length) days.push({ key: `${y}-${m}-${d}`, slots });
  }
  return days;
}

const fmtDayShort = (ms) => new Date(ms).toLocaleDateString(undefined, { weekday: "short" });
const fmtDayNum = (ms) => new Date(ms).toLocaleDateString(undefined, { day: "numeric", month: "short" });
const fmtTime = (ms) => new Date(ms).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
const fmtFull = (ms) =>
  new Date(ms).toLocaleString(undefined, { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" });

/** An .ics file so the visitor can add the meeting to their calendar. */
function icsHref(startMs, title) {
  const stamp = (ms) => new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Solvimere//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${startMs}-${Math.random().toString(36).slice(2)}@solvimere.com`,
    `DTSTAMP:${stamp(Date.now())}`,
    `DTSTART:${stamp(startMs)}`,
    `DTEND:${stamp(startMs + SLOT_MINUTES * 60 * 1000)}`,
    `SUMMARY:${title}`,
    "DESCRIPTION:Booked on solvimere.com. We'll email you the meeting link.",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(body)}`;
}

export function Booking({ contactEmail }) {
  const { user } = useSiteAuth();
  const [now] = useState(() => Date.now());
  const days = useMemo(() => upcomingDays(now), [now]);
  const [dayKey, setDayKey] = useState(days[0]?.key || "");
  const [busy, setBusy] = useState(() => new Set());
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(!supabaseConfigured);
  const [slot, setSlot] = useState(null);
  const [form, setForm] = useState({
    name: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    company: "",
    topic: "",
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [booked, setBooked] = useState(null);

  async function loadBusy() {
    if (!supabaseConfigured || !days.length) return;
    setLoading(true);
    const first = days[0].slots[0];
    const last = days[days.length - 1].slots.at(-1) + 1;
    const { data, error: rpcError } = await supabase.rpc("appointment_busy_slots", {
      range_start: new Date(first).toISOString(),
      range_end: new Date(last).toISOString(),
    });
    setLoading(false);
    if (rpcError) {
      setUnavailable(true);
      return;
    }
    setBusy(new Set((data || []).map((value) => new Date(value).getTime())));
  }

  useEffect(() => {
    loadBusy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const day = days.find((d) => d.key === dayKey) || days[0];

  async function submit(event) {
    event.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    if (!name || !email) {
      setError("Add your name and email so we can send the meeting link.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email.");
      return;
    }
    setError("");
    setPending(true);
    const { error: insertError } = await supabase.from("appointments").insert({
      starts_at: new Date(slot).toISOString(),
      duration_minutes: SLOT_MINUTES,
      name,
      email,
      company: form.company.trim(),
      topic: form.topic.trim(),
      visitor_timezone: visitorTz,
      user_id: user?.id ?? null,
    });
    setPending(false);
    if (insertError) {
      // 23505: someone took the slot first; 42501: the slot is outside the bookable window.
      if (insertError.code === "23505" || insertError.code === "42501") {
        setError("That time was just taken. Please pick another slot.");
        setSlot(null);
        loadBusy();
      } else {
        setError("We couldn't book that right now. Please try again, or email us.");
      }
      return;
    }
    setBooked(slot);
  }

  if (unavailable) {
    return (
      <div className="booking">
        <p className="booking-note">
          Online booking isn&apos;t available right now. Email us at{" "}
          <a href={`mailto:${contactEmail}?subject=${encodeURIComponent("Meeting request")}`}>{contactEmail}</a> with a few
          times that suit you, and we&apos;ll confirm one.
        </p>
      </div>
    );
  }

  if (booked) {
    return (
      <div className="booking booking-done">
        <span className="booking-done-ico">
          <Icon name="calendar" />
        </span>
        <h3>You&apos;re booked</h3>
        <p>
          {fmtFull(booked)}
          <br />
          <span>{SLOT_MINUTES} minutes · your time ({visitorTz})</span>
        </p>
        <p className="booking-note">We&apos;ll email {form.email.trim()} to confirm, with the meeting link.</p>
        <a className="booking-ics" href={icsHref(booked, "Meeting with Solvimere")} download="solvimere-meeting.ics">
          <Icon name="calendar" /> Add to calendar
        </a>
      </div>
    );
  }

  if (slot) {
    return (
      <form className="booking booking-form" onSubmit={submit}>
        <button type="button" className="booking-back" onClick={() => setSlot(null)}>
          <Icon name="chevL" /> {fmtFull(slot)}
        </button>
        <label>
          Name
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" required maxLength={120} />
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" required maxLength={254} />
        </label>
        <label>
          Company <small>(optional)</small>
          <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} autoComplete="organization" maxLength={160} />
        </label>
        <label>
          What would you like to discuss? <small>(optional)</small>
          <textarea rows="3" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} maxLength={2000} />
        </label>
        {error ? <p className="assistant-error">{error}</p> : null}
        <button type="submit" className="booking-submit" disabled={pending}>
          {pending ? "Booking…" : "Book this time"}
        </button>
      </form>
    );
  }

  const free = (day?.slots || []).filter((ms) => !busy.has(ms));
  return (
    <div className="booking">
      <p className="booking-note">Pick a time for a {SLOT_MINUTES}-minute video call with our team.</p>
      <div className="booking-days" role="tablist" aria-label="Day">
        {days.map((d) => (
          <button
            key={d.key}
            type="button"
            role="tab"
            aria-selected={d.key === day?.key}
            className={d.key === day?.key ? "is-on" : ""}
            onClick={() => setDayKey(d.key)}
          >
            <small>{fmtDayShort(d.slots[0])}</small>
            <strong>{fmtDayNum(d.slots[0])}</strong>
          </button>
        ))}
      </div>
      {error ? <p className="assistant-error">{error}</p> : null}
      {loading ? (
        <p className="booking-note">Loading available times…</p>
      ) : free.length ? (
        <div className="booking-slots" aria-label="Available times">
          {free.map((ms) => (
            <button key={ms} type="button" onClick={() => setSlot(ms)}>
              {fmtTime(ms)}
            </button>
          ))}
        </div>
      ) : (
        <p className="booking-note">No free times on this day. Try another day.</p>
      )}
      <p className="booking-tz">
        <Icon name="clock" /> Times in your time zone{visitorTz ? ` (${visitorTz})` : ""}
      </p>
    </div>
  );
}
