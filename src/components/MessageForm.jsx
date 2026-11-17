import { useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase, supabaseConfigured } from "../lib/supabase";
import { Icon } from "./Icons";

/** "Send us a message" in the corner widget; saved to Supabase `contact_messages`. */
export function MessageForm({ contactEmail, onBook }) {
  const location = useLocation();
  const [form, setForm] = useState({ name: "", email: "", message: "", website: "" });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (form.website) return; // honeypot: only bots fill the hidden field
    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();
    if (!name || !email || !message) {
      setError("Add your name, email and a message.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email so we can reply.");
      return;
    }
    if (!supabaseConfigured) {
      setError("Messages can't be sent right now.");
      return;
    }
    setError("");
    setPending(true);
    const { error: insertError } = await supabase
      .from("contact_messages")
      .insert({ name, email, message, page: `${location.pathname}${location.hash}`.slice(0, 300) });
    setPending(false);
    if (insertError) {
      setError("Your message couldn't be sent.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="booking booking-done">
        <span className="booking-done-ico">
          <Icon name="send" />
        </span>
        <h3>Message sent</h3>
        <p className="booking-note">
          Thanks, {form.name.trim()}. We&apos;ll reply to {form.email.trim()}, usually within one business day.
        </p>
        <button type="button" className="link-btn" onClick={onBook}>
          Prefer to talk? Book a meeting
        </button>
      </div>
    );
  }

  return (
    <form className="booking booking-form" onSubmit={submit} noValidate>
      <p className="booking-note">Tell us what you&apos;re working on and we&apos;ll get back to you.</p>
      <label>
        <span>Name</span>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          autoComplete="name"
          maxLength={120}
          required
        />
      </label>
      <label>
        <span>Email</span>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          autoComplete="email"
          maxLength={254}
          required
        />
      </label>
      <label>
        <span>Message</span>
        <textarea
          rows="4"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          maxLength={4000}
          required
        />
      </label>
      <label className="hp-field" aria-hidden="true">
        Website
        <input
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(e) => setForm({ ...form, website: e.target.value })}
        />
      </label>
      {error ? (
        <p className="assistant-error">
          {error}{" "}
          {error.startsWith("Your message") || error.startsWith("Messages") ? (
            <>
              Email us at <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
            </>
          ) : null}
        </p>
      ) : null}
      <button type="submit" className="booking-submit" disabled={pending}>
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
