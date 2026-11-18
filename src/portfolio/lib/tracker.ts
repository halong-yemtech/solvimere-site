// Records what a visitor does on a portfolio (Admin -> Portfolio -> Views).
// Clicks are captured once at document level, so new links and buttons are covered
// automatically. What people type is never read: forms report only "started" and "sent".
import { recordPortfolioView } from "./actions";

export type TrackType =
  | "section_view"
  | "section_leave"
  | "link_click"
  | "button_click"
  | "work_open"
  | "work_close"
  | "work_filter"
  | "work_image"
  | "scroll_depth"
  | "form_start"
  | "form_submit"
  | "form_error"
  | "text_copy"
  | "page_leave"
  | "page_return";

interface Fields {
  channel?: string;
  section?: string;
  area?: string;
  label?: string;
  target?: string;
  value?: number;
}
type Queued = Fields & { type: TrackType; at: number };

const FLUSH_MS = 2500;
const BATCH = 30;
const SCROLL_STEPS = [25, 50, 75, 100];
const CHANNELS: [RegExp, string][] = [
  [/(^|\.)(wa\.me|whatsapp\.com)$/, "whatsapp"],
  [/(^|\.)upwork\.com$/, "upwork"],
  [/(^|\.)linkedin\.com$/, "linkedin"],
  [/(^|\.)github\.com$/, "github"],
  [/(^|\.)fiverr\.com$/, "fiverr"],
  [/(^|\.)(x\.com|twitter\.com)$/, "x"],
  [/(^|\.)(facebook\.com|fb\.com)$/, "facebook"],
  [/(^|\.)instagram\.com$/, "instagram"],
  [/(^|\.)(youtube\.com|youtu\.be)$/, "youtube"],
  [/(^|\.)(t\.me|telegram\.me)$/, "telegram"],
  [/(^|\.)medium\.com$/, "medium"],
  [/(^|\.)stackoverflow\.com$/, "stackoverflow"],
  [/(^|\.)dev\.to$/, "devto"],
];

const baseUrl = String(import.meta.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const apiKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || "");

interface Session {
  slug: string;
  queue: Queued[];
  timer: number | null;
  ready: boolean;
  off: boolean;
  section: string | undefined;
  visibleSince: number | null;
  pageMs: number;
  sectionMs: number;
  scrolled: Set<string>;
  sectionAt: number;
  forms: Set<string>;
}
let session: Session | null = null;

const clip = (text: string | null | undefined, max: number) => (text || "").replace(/\s+/g, " ").trim().slice(0, max);

function send(keepalive: boolean) {
  const s = session;
  if (!s || s.off || !s.ready || s.queue.length === 0) return;
  const now = Date.now();
  const events = s.queue.splice(0, BATCH).map(({ at, ...event }) => ({ ...event, ms_ago: now - at }));
  fetch(`${baseUrl}/rest/v1/rpc/record_portfolio_events`, {
    method: "POST",
    keepalive,
    headers: { "Content-Type": "application/json", apikey: apiKey, Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ p_slug: s.slug, p_events: events }),
  })
    .then((res) => {
      // The database feature isn't installed: stop trying until the next page load.
      if (res.status === 404) s.off = true;
    })
    .catch(() => undefined);
  if (s.queue.length > 0) schedule();
}

function schedule() {
  const s = session;
  if (!s || s.timer != null) return;
  s.timer = window.setTimeout(() => {
    s.timer = null;
    send(false);
  }, FLUSH_MS);
}

/** Records one action. Does nothing outside a portfolio page. */
export function track(type: TrackType, fields: Fields = {}) {
  const s = session;
  if (!s || s.off) return;
  s.queue.push({ type, section: s.section, ...fields, at: Date.now() });
  if (s.queue.length >= BATCH) send(false);
  else schedule();
}

function bankTime(s: Session) {
  if (s.visibleSince == null) return;
  const spent = Date.now() - s.visibleSince;
  s.pageMs += spent;
  s.sectionMs += spent;
  s.visibleSince = Date.now();
}

function closeSection(s: Session) {
  bankTime(s);
  const seconds = Math.round(s.sectionMs / 1000);
  if (s.section && seconds > 0) track("section_leave", { section: s.section, value: seconds });
  s.sectionMs = 0;
}

/** Call when the open section changes. */
export function trackSection(key: string | null) {
  const s = session;
  if (!s || !key || key === s.section) return;
  closeSection(s);
  s.section = key;
  s.scrolled = new Set();
  s.sectionAt = Date.now();
  track("section_view", { section: key });
}

function pause(s: Session) {
  if (s.visibleSince == null) return;
  closeSection(s);
  const seconds = Math.round(s.pageMs / 1000);
  if (seconds > 0) track("page_leave", { value: seconds });
  s.pageMs = 0;
  s.visibleSince = null;
  send(true);
}

function resume(s: Session) {
  if (s.visibleSince != null) return;
  s.visibleSince = Date.now();
  track("page_return");
}

function linkDetails(link: HTMLAnchorElement) {
  const raw = link.getAttribute("href") || "";
  if (raw.startsWith("mailto:")) return { channel: "email", target: raw };
  if (raw.startsWith("tel:")) return { channel: "phone", target: raw };
  try {
    const url = new URL(link.href);
    const target = url.origin === window.location.origin ? url.pathname : url.origin + url.pathname;
    if (url.origin === window.location.origin) {
      return { channel: /\/cv\/?$/.test(url.pathname) ? "cv" : "internal", target };
    }
    const host = url.hostname.replace(/^www\./, "");
    return { channel: CHANNELS.find(([re]) => re.test(host))?.[1] || "website", target };
  } catch {
    return { channel: "website", target: "" };
  }
}

function onClick(event: MouseEvent) {
  if (event.type === "auxclick" && event.button !== 1) return; // middle click opens a link too
  const start = event.target as Element | null;
  if (!start?.closest?.(".pf-root")) return;
  const el = start.closest<HTMLElement>('a[href], button, [role="button"], input[type="checkbox"], summary');
  if (!el || el.closest("[data-track-ignore]")) return;
  const area = el.closest<HTMLElement>("[data-track-area]")?.dataset.trackArea;
  const box = el instanceof HTMLInputElement ? el.closest("label") : el;
  const label = clip(el.dataset.trackLabel || el.getAttribute("aria-label") || box?.textContent, 100);
  if (el instanceof HTMLAnchorElement) {
    const details = linkDetails(el);
    track("link_click", { ...details, channel: el.dataset.trackChannel || details.channel, area, label });
  } else {
    track("button_click", { area, label });
  }
}

function onScroll() {
  const s = session;
  // Changing section resizes the page and moves the scroll position by itself.
  if (!s?.section || Date.now() - s.sectionAt < 1000) return;
  const page = document.documentElement;
  const reached = ((window.scrollY + window.innerHeight) / Math.max(page.scrollHeight, 1)) * 100;
  for (const step of SCROLL_STEPS) {
    const key = `${s.section}:${step}`;
    if (reached >= step - 0.5 && !s.scrolled.has(key)) {
      s.scrolled.add(key);
      track("scroll_depth", { value: step });
    }
  }
}

function onCopy(event: ClipboardEvent) {
  const start = event.target as Element | null;
  if (!start?.closest?.(".pf-root") || start.closest("input, textarea")) return;
  const length = window.getSelection()?.toString().length || 0;
  if (length > 0) {
    track("text_copy", { area: start.closest<HTMLElement>("[data-track-area]")?.dataset.trackArea, value: length });
  }
}

function onFocus(event: FocusEvent) {
  const s = session;
  const form = (event.target as Element | null)?.closest?.<HTMLElement>("form[data-track-form]");
  const name = form?.dataset.trackForm;
  if (!s || !name || s.forms.has(name)) return;
  s.forms.add(name);
  track("form_start", { label: name });
}

function onVisibility() {
  if (!session) return;
  if (document.visibilityState === "hidden") pause(session);
  else resume(session);
}
const onPageHide = () => session && pause(session);
const onPageShow = (event: PageTransitionEvent) => {
  if (event.persisted && session) resume(session);
};

/** Counts the visit and starts recording. Returns the function that stops it. */
export function startTracking(slug: string) {
  if (!baseUrl || !apiKey) return () => undefined;
  const s: Session = {
    slug,
    queue: [],
    timer: null,
    ready: false,
    off: false,
    section: undefined,
    visibleSince: document.visibilityState === "visible" ? Date.now() : null,
    pageMs: 0,
    sectionMs: 0,
    scrolled: new Set(),
    sectionAt: Date.now(),
    forms: new Set(),
  };
  session = s;
  // Actions attach to the visit, so they wait until it has been recorded.
  recordPortfolioView(slug).then(() => {
    s.ready = true;
    if (session === s) send(false);
  });

  const scrollOptions = { passive: true } as const;
  document.addEventListener("click", onClick, true);
  document.addEventListener("auxclick", onClick, true);
  document.addEventListener("copy", onCopy, true);
  document.addEventListener("focusin", onFocus);
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("scroll", onScroll, scrollOptions);
  window.addEventListener("pagehide", onPageHide);
  window.addEventListener("pageshow", onPageShow);

  return () => {
    pause(s);
    if (s.timer != null) window.clearTimeout(s.timer);
    if (session === s) session = null;
    document.removeEventListener("click", onClick, true);
    document.removeEventListener("auxclick", onClick, true);
    document.removeEventListener("copy", onCopy, true);
    document.removeEventListener("focusin", onFocus);
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("pagehide", onPageHide);
    window.removeEventListener("pageshow", onPageShow);
  };
}
