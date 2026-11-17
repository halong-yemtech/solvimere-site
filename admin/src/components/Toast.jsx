import { useEffect, useState } from "react";
import { X } from "lucide-react";

/*
 * Toast notifications for the result of every action.
 *   toast.success("Member saved.")
 *   toast.error(err)              an Error, a Supabase error, or a string
 *   toast.info("Nothing to save.")
 * Render <Toaster /> once at the app root.
 */

const DURATION = { success: 3500, info: 3500, error: 7000 };
const MAX = 4;

let items = [];
let seq = 0;
const listeners = new Set();
const timers = new Map();

function emit() {
  listeners.forEach((listener) => listener(items));
}

function text(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.message || value.error_description || value.error || String(value);
}

function schedule(id, ms) {
  clearTimeout(timers.get(id));
  timers.set(
    id,
    setTimeout(() => dismiss(id), ms),
  );
}

function push(type, value, { duration } = {}) {
  const message = text(value);
  if (!message) return null;
  // The same message again (e.g. a double click) refreshes the existing toast instead of stacking.
  const same = items.find((t) => t.type === type && t.message === message);
  const id = same ? same.id : ++seq;
  const ms = duration ?? DURATION[type];
  if (!same) {
    items = [...items, { id, type, message }];
    items.slice(0, Math.max(0, items.length - MAX)).forEach((t) => dismiss(t.id));
    emit();
  }
  schedule(id, ms);
  return id;
}

export function dismiss(id) {
  clearTimeout(timers.get(id));
  timers.delete(id);
  if (!items.some((t) => t.id === id)) return;
  items = items.filter((t) => t.id !== id);
  emit();
}

export const toast = {
  success: (message, options) => push("success", message, options),
  error: (message, options) => push("error", message, options),
  info: (message, options) => push("info", message, options),
  dismiss,
};

const ICONS = {
  success: <path d="M5 12.5l4.2 4.2L19 7" />,
  error: (
    <>
      <path d="M12 5.5v8" />
      <path d="M12 18.5h.01" />
    </>
  ),
  info: (
    <>
      <path d="M12 10.5v8" />
      <path d="M12 5.5h.01" />
    </>
  ),
};

function Toast({ item }) {
  return (
    <div
      className={`toast is-${item.type}`}
      role={item.type === "error" ? "alert" : "status"}
      onMouseEnter={() => clearTimeout(timers.get(item.id))}
      onMouseLeave={() => schedule(item.id, 2000)}
    >
      <span className="toast-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          {ICONS[item.type]}
        </svg>
      </span>
      <p>{item.message}</p>
      <button
        type="button"
        className="toast-close"
        aria-label="Dismiss"
        title="Dismiss"
        onClick={() => dismiss(item.id)}
      >
        <X />
      </button>
    </div>
  );
}

export function Toaster() {
  const [list, setList] = useState(items);
  useEffect(() => {
    listeners.add(setList);
    setList(items);
    return () => listeners.delete(setList);
  }, []);
  return (
    <div className="toasts" aria-label="Notifications">
      {list.map((item) => (
        <Toast key={item.id} item={item} />
      ))}
    </div>
  );
}
