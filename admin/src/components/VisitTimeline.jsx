import { useEffect, useState } from "react";
import {
  ArrowDownToLine,
  BookOpen,
  Clipboard,
  ExternalLink,
  FileWarning,
  FolderOpen,
  Images,
  ListFilter,
  LogOut,
  MousePointerClick,
  PanelTop,
  PenLine,
  RotateCcw,
  Send,
  Timer,
  Trash2,
  X,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { Spinner } from "./Spinner";
import { toast } from "./Toast";

export const CHANNEL_LABELS = {
  whatsapp: "WhatsApp",
  upwork: "Upwork",
  linkedin: "LinkedIn",
  github: "GitHub",
  fiverr: "Fiverr",
  x: "X / Twitter",
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  telegram: "Telegram",
  medium: "Medium",
  stackoverflow: "Stack Overflow",
  devto: "DEV",
  email: "Email",
  phone: "Phone",
  cv: "CV download",
  website: "Other website",
  internal: "Solvimere pages",
  other: "Other",
};

export const SECTION_LABELS = {
  about: "About",
  resume: "Resume",
  works: "Works",
  blog: "Blog",
  stats: "Stats",
  contact: "Contact",
  guestbook: "Guest book",
};

export const channelLabel = (key) => CHANNEL_LABELS[key] || key;
export const sectionLabel = (key) => SECTION_LABELS[key] || key || "";

export function duration(seconds) {
  const total = Math.round(Number(seconds) || 0);
  if (total < 60) return `${total}s`;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  return hours ? `${hours}h ${minutes}m` : `${minutes}m ${String(total % 60).padStart(2, "0")}s`;
}

/** What one recorded action means, in words. */
function describe(e) {
  const section = sectionLabel(e.section);
  switch (e.type) {
    case "section_view":
      return { icon: PanelTop, text: `Opened ${section}` };
    case "section_leave":
      return { icon: Timer, text: `Spent ${duration(e.value)} in ${section}`, quiet: true };
    case "link_click":
      return {
        icon: ExternalLink,
        text: `Clicked ${channelLabel(e.channel)}`,
        detail: [e.label, e.area].filter(Boolean).join(" · "),
        strong: !["internal", "website"].includes(e.channel),
      };
    case "button_click":
      return { icon: MousePointerClick, text: `Pressed “${e.label || "button"}”`, detail: e.area };
    case "work_open":
      return { icon: FolderOpen, text: `Opened project “${e.label}”`, strong: true };
    case "work_close":
      return { icon: X, text: `Closed project after ${duration(e.value)}`, detail: e.label, quiet: true };
    case "work_filter":
      return { icon: ListFilter, text: `Filtered projects by ${e.label}` };
    case "work_image":
      return { icon: Images, text: `Viewed image ${e.value}`, detail: e.label };
    case "scroll_depth":
      return { icon: ArrowDownToLine, text: `Scrolled ${e.value}% of ${section}`, quiet: true };
    case "form_start":
      return { icon: PenLine, text: `Started the ${e.label} form` };
    case "form_submit":
      return { icon: e.label === "contact" ? Send : BookOpen, text: `Sent the ${e.label} form`, strong: true };
    case "form_error":
      return { icon: FileWarning, text: `Couldn't send the ${e.label} form` };
    case "text_copy":
      return { icon: Clipboard, text: `Copied ${e.value} characters`, detail: e.area };
    case "page_leave":
      return { icon: LogOut, text: `Left or switched away after ${duration(e.value)}`, quiet: true };
    case "page_return":
      return { icon: RotateCcw, text: "Came back to the page", quiet: true };
    default:
      return { icon: MousePointerClick, text: e.type };
  }
}

const clock = (iso) =>
  new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", second: "2-digit" });

const safeHref = (target) => (/^(https?:|mailto:|tel:)/i.test(target || "") ? target : null);

/** Everything one visitor did during a visit, in order. */
export function VisitTimeline({ viewId, canDelete, onChanged }) {
  const [events, setEvents] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    supabase.rpc("portfolio_visit_events", { p_view_id: viewId }).then(({ data, error: loadError }) => {
      if (!active) return;
      setError(loadError?.message || "");
      setEvents(data || []);
    });
    return () => {
      active = false;
    };
  }, [viewId]);

  async function remove(event) {
    if (!window.confirm("Delete this action from the visit? This can't be undone.")) return;
    const { error: deleteError } = await supabase.rpc("delete_portfolio_events", { p_ids: [event.id] });
    if (deleteError) {
      toast.error(deleteError);
      return;
    }
    setEvents((list) => list.filter((e) => e.id !== event.id));
    toast.success("Action deleted.");
    onChanged?.();
  }

  if (!events) return <Spinner inline size="sm" label="Loading actions…" />;
  if (error) return <p className="error">{error}</p>;
  if (events.length === 0) return <p className="ui-muted views-none">No actions were recorded in this visit.</p>;

  return (
    <div className="views-timeline" role="list" aria-label="Actions in this visit">
      {events.map((event) => {
        const info = describe(event);
        const Icon = info.icon;
        const href = safeHref(event.target);
        return (
          <div
            key={event.id}
            role="listitem"
            className={`views-step${info.strong ? " is-strong" : ""}${info.quiet ? " is-quiet" : ""}`}
          >
            <span className="views-step-icon">
              <Icon aria-hidden="true" />
            </span>
            <div className="views-step-text">
              <strong>{info.text}</strong>
              {info.detail ? <small>{info.detail}</small> : null}
              {href ? (
                <a href={href} target="_blank" rel="noreferrer noopener">
                  {event.target}
                </a>
              ) : null}
            </div>
            <time dateTime={event.created_at}>{clock(event.created_at)}</time>
            {canDelete ? (
              <button
                type="button"
                className="views-mini is-danger"
                title="Delete this action"
                aria-label={`Delete: ${info.text}`}
                onClick={() => remove(event)}
              >
                <Trash2 />
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
