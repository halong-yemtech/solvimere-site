import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  CalendarDays,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  Eye,
  Globe,
  History,
  LayoutList,
  Loader2,
  Monitor,
  MousePointerClick,
  PanelTop,
  ShieldOff,
  Smartphone,
  FolderOpen,
  Tablet,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../auth";
import { supabase } from "../lib/supabase";
import { SITE_URL } from "../portfolio/api";
import { Avatar } from "../components/Avatar";
import { Empty } from "../components/Empty";
import { Spinner } from "../components/Spinner";
import { toast } from "../components/Toast";
import { VisitTimeline, channelLabel, duration, sectionLabel } from "../components/VisitTimeline";
import { PageHead, Tabs, Toolbar, timeAgo } from "../components/ui";

const PAGE_SIZE = 25;
const RANGES = [7, 30, 90];
const DEVICE_ICONS = { desktop: Monitor, mobile: Smartphone, tablet: Tablet };
const TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

const number = (n) => Number(n || 0).toLocaleString();
const plural = (n, word) => `${number(n)} ${word}${Number(n) === 1 ? "" : "s"}`;
const fullDate = (iso) =>
  new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
// `day` is a plain date: read it as local so it doesn't shift by a day.
const dayDate = (day) => new Date(`${day}T00:00:00`);
const shortDay = (day) => dayDate(day).toLocaleDateString(undefined, { day: "numeric", month: "short" });
const longDay = (day) =>
  dayDate(day).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });

let regionNames = null;
function countryName(code) {
  if (!code) return "";
  try {
    regionNames ||= new Intl.DisplayNames(undefined, { type: "region" });
    return regionNames.of(code) || code;
  } catch {
    return code;
  }
}

/** "Chrome on Windows" from a browser's user-agent text. */
function browserLabel(agent) {
  if (!agent) return "";
  const browser = /Edg\//.test(agent)
    ? "Edge"
    : /OPR\/|Opera/.test(agent)
      ? "Opera"
      : /SamsungBrowser/.test(agent)
        ? "Samsung Internet"
        : /Firefox|FxiOS/.test(agent)
          ? "Firefox"
          : /Chrome|CriOS/.test(agent)
            ? "Chrome"
            : /Safari/.test(agent)
              ? "Safari"
              : "";
  const system = /iPhone|iPad|iPod/.test(agent)
    ? "iOS"
    : /Android/.test(agent)
      ? "Android"
      : /Windows/.test(agent)
        ? "Windows"
        : /Mac OS X/.test(agent)
          ? "macOS"
          : /CrOS/.test(agent)
            ? "ChromeOS"
            : /Linux/.test(agent)
              ? "Linux"
              : "";
  return [browser, system].filter(Boolean).join(" on ");
}

const isMissing = (error) =>
  error?.code === "PGRST202" || error?.code === "42883" || /schema cache|does not exist/i.test(error?.message || "");

async function rpc(name, args) {
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw error;
  return data;
}

/** Like rpc(), but null when that database function isn't installed yet. */
async function optionalRpc(name, args) {
  const { data, error } = await supabase.rpc(name, args);
  if (error && isMissing(error)) return null;
  if (error) throw error;
  return data || [];
}

/** A ranked list with one bar per row; rows can filter the visits below. */
function RankCard({ icon: Icon, title, rows, empty, active, onPick }) {
  const top = Math.max(1, ...rows.map((r) => r.total));
  return (
    <section className="ui-card views-rank">
      <h2 className="views-title">
        <Icon aria-hidden="true" /> {title}
      </h2>
      {rows.length === 0 ? (
        <p className="ui-muted views-none">{empty}</p>
      ) : (
        <ul>
          {rows.map((row) => {
            const body = (
              <>
                <span className="views-rank-top">
                  <span title={row.label}>{row.label}</span>
                  <b>{number(row.total)}</b>
                </span>
                <i>
                  <b style={{ width: `${(row.total / top) * 100}%` }} />
                </i>
                {row.note ? <small>{row.note}</small> : null}
              </>
            );
            return (
              <li key={row.key}>
                {onPick ? (
                  <button
                    type="button"
                    className={active === row.key ? "is-on" : ""}
                    aria-pressed={active === row.key}
                    title={active === row.key ? "Show all visits" : `Show visits that clicked ${row.label}`}
                    onClick={() => onPick(active === row.key ? null : row.key)}
                  >
                    {body}
                  </button>
                ) : (
                  <div>{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/** Bulk delete: choose what goes, then type DELETE. */
function ClearDialog({ memberName, profileId, onClose, onDone }) {
  const ref = useRef(null);
  const [age, setAge] = useState("all");
  const [word, setWord] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!ref.current.open) ref.current.showModal();
  }, []);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const deleted = await rpc("clear_portfolio_views", {
        p_confirm: word,
        p_profile_id: profileId,
        p_older_than_days: age === "all" ? null : Number(age),
      });
      toast.success(`${plural(deleted, "visit")} and their actions deleted.`);
      onDone();
    } catch (err) {
      toast.error(err);
      setBusy(false);
    }
  }

  return (
    <dialog ref={ref} className="views-dialog" onClose={onClose}>
      <form onSubmit={submit}>
        <header>
          <h2>Delete records</h2>
          <button type="button" className="views-mini" aria-label="Close" onClick={onClose}>
            <X />
          </button>
        </header>
        <p>
          This permanently deletes visits and every action in them for <strong>{memberName}</strong>. View counts will
          go down, and it can't be undone.
        </p>
        <label className="ui-field">
          <span>Which records</span>
          <select value={age} onChange={(e) => setAge(e.target.value)}>
            <option value="all">All records</option>
            <option value="30">Older than 30 days</option>
            <option value="90">Older than 90 days</option>
            <option value="365">Older than 1 year</option>
          </select>
        </label>
        <label className="ui-field">
          <span>
            Type <code>DELETE</code> to confirm
          </span>
          <input value={word} autoComplete="off" onChange={(e) => setWord(e.target.value)} />
        </label>
        <footer>
          <button type="button" className="ghost" onClick={onClose}>
            <X /> Cancel
          </button>
          <button type="submit" className="danger" disabled={word !== "DELETE" || busy}>
            {busy ? <Loader2 className="spin" /> : <Trash2 />} Delete records
          </button>
        </footer>
      </form>
    </dialog>
  );
}

/** Top of the y axis: a round number at or above the highest day. */
function niceMax(value) {
  if (value <= 4) return 4;
  const step = 10 ** Math.floor(Math.log10(value));
  const multiple = [1, 2, 2.5, 5, 10].find((m) => m * step >= value);
  return multiple * step;
}

function DailyChart({ days }) {
  const [hover, setHover] = useState(null);
  const top = niceMax(Math.max(...days.map((d) => Number(d.views))));
  const total = days.reduce((sum, d) => sum + Number(d.views), 0);
  const ticks = [top, top / 2, 0];
  const labelEvery = Math.ceil(days.length / 6);
  const shown = hover == null ? null : days[hover];

  return (
    <div className="views-chart" onMouseLeave={() => setHover(null)}>
      <div className="views-y" aria-hidden="true">
        {ticks.map((t) => (
          <span key={t}>{number(t)}</span>
        ))}
      </div>
      <div className="views-plot">
        <div
          className="views-bars"
          role="img"
          aria-label={`${plural(total, "view")} from ${longDay(days[0].day)} to ${longDay(days[days.length - 1].day)}`}
        >
          {days.map((d, i) => (
            <div
              key={d.day}
              className={`views-col${hover === i ? " is-on" : ""}`}
              onMouseEnter={() => setHover(i)}
              onClick={() => setHover(i)}
            >
              <i style={{ height: `${(Number(d.views) / top) * 100}%` }} />
            </div>
          ))}
          {shown ? (
            <div
              className={`views-tip${hover > days.length / 2 ? " is-left" : ""}`}
              style={{ left: `${((hover + 0.5) / days.length) * 100}%` }}
              role="status"
            >
              <strong>{longDay(shown.day)}</strong>
              <span>{plural(shown.views, "view")}</span>
              <span>{plural(shown.visitors, "visitor")}</span>
            </div>
          ) : null}
        </div>
        <div className="views-x" aria-hidden="true">
          {days.map((d, i) => (
            <span key={d.day}>{(days.length - 1 - i) % labelEvery === 0 ? shortDay(d.day) : ""}</span>
          ))}
        </div>
      </div>
      <table className="views-sr">
        <caption>Views per day</caption>
        <thead>
          <tr>
            <th>Day</th>
            <th>Views</th>
            <th>Visitors</th>
          </tr>
        </thead>
        <tbody>
          {days.map((d) => (
            <tr key={d.day}>
              <td>{longDay(d.day)}</td>
              <td>{d.views}</td>
              <td>{d.visitors}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CopyIp({ ip }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(ip);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy the address.");
    }
  }
  return (
    <button type="button" className="views-mini" title="Copy IP address" aria-label={`Copy ${ip}`} onClick={copy}>
      {copied ? <Check /> : <Copy />}
    </button>
  );
}

/** Who opened each member's portfolio, when and from where. IP addresses are admin-only. */
export default function PortfolioViews() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  const [members, setMembers] = useState(null);
  const [overview, setOverview] = useState(null);
  const [visits, setVisits] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [member, setMember] = useState("all");
  const [range, setRange] = useState(30);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null); // null: action tracking not installed
  const [channel, setChannel] = useState(null);
  const [open, setOpen] = useState(() => new Set());
  const [selected, setSelected] = useState(() => new Set());
  const [clearing, setClearing] = useState(false);
  const latest = useRef(0);

  const profileId = member === "all" ? null : Number(member);

  const load = useCallback(async () => {
    const run = ++latest.current;
    try {
      const activityArgs = { p_profile_id: profileId, p_limit: PAGE_SIZE + 1, p_channel: channel };
      const [stats, totals, days, actions, activity] = await Promise.all([
        rpc("portfolio_view_stats"),
        rpc("portfolio_view_totals", { p_profile_id: profileId, p_days: range }),
        rpc("portfolio_view_daily", { p_profile_id: profileId, p_days: range, p_time_zone: TIME_ZONE }),
        optionalRpc("portfolio_event_summary", { p_profile_id: profileId, p_days: range }),
        optionalRpc("portfolio_visit_activity", activityArgs),
      ]);
      // Until the actions migration is applied, fall back to the plain list of visits.
      const recent =
        activity ?? (await rpc("portfolio_recent_views", { p_profile_id: profileId, p_limit: PAGE_SIZE + 1 }));
      if (run !== latest.current) return;
      setSummary(actions);
      setSelected(new Set());
      setMembers(stats || []);
      setOverview({ totals: totals?.[0] || { views: 0, visitors: 0 }, days: days || [] });
      setVisits((recent || []).slice(0, PAGE_SIZE));
      setHasMore((recent || []).length > PAGE_SIZE);
      setError(null);
    } catch (err) {
      if (run !== latest.current) return;
      setError(err);
      setMembers((current) => current || []);
    }
  }, [profileId, range, channel]);

  useEffect(() => {
    load();
  }, [load]);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const args = { p_profile_id: profileId, p_limit: PAGE_SIZE + 1, p_before_id: visits[visits.length - 1].id };
      const rows = summary
        ? await rpc("portfolio_visit_activity", { ...args, p_channel: channel })
        : await rpc("portfolio_recent_views", args);
      setVisits((current) => [...current, ...rows.slice(0, PAGE_SIZE)]);
      setHasMore(rows.length > PAGE_SIZE);
    } catch (err) {
      toast.error(err);
    } finally {
      setLoadingMore(false);
    }
  }

  async function eraseIp(ip) {
    if (!window.confirm(`Erase ${ip} from every visit? The view counts stay. This can't be undone.`)) return;
    try {
      const erased = await rpc("erase_portfolio_view_ip", { p_ip: ip });
      toast.success(`${ip} erased from ${plural(erased, "visit")}.`);
      load();
    } catch (err) {
      toast.error(err);
    }
  }

  async function deleteVisits(ids) {
    const question =
      ids.length === 1
        ? "Delete this visit and all its actions? The view count goes down. This can't be undone."
        : `Delete ${ids.length} visits and all their actions? View counts go down. This can't be undone.`;
    if (!window.confirm(question)) return;
    try {
      const deleted = await rpc("delete_portfolio_views", { p_ids: ids });
      toast.success(`${plural(deleted, "visit")} deleted.`);
      load();
    } catch (err) {
      toast.error(err);
    }
  }

  function toggle(setter, id) {
    setter((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const allTime = useMemo(() => {
    const list = (members || []).filter((m) => profileId == null || Number(m.profile_id) === profileId);
    return {
      total: list.reduce((sum, m) => sum + Number(m.total), 0),
      last:
        list
          .map((m) => m.last_viewed_at)
          .filter(Boolean)
          .sort()
          .pop() || null,
    };
  }, [members, profileId]);

  if (!members) return <Spinner label="Loading views…" />;

  const head = (
    <PageHead
      icon={Eye}
      title="Portfolio views"
      description="Who opened each member's portfolio and what they did there. Known bots aren't counted."
      actions={
        isAdmin && summary ? (
          <button type="button" className="danger" onClick={() => setClearing(true)}>
            <Trash2 /> Delete records
          </button>
        ) : null
      }
    />
  );

  if (error && isMissing(error)) {
    return (
      <div className="ui-page">
        {head}
        <Empty icon={Eye} title="View tracking isn't switched on yet">
          <span>
            Apply <code>supabase/migrations/20261119100000_portfolio_views.sql</code> to the database. Visits are
            recorded from then on.
          </span>
        </Empty>
      </div>
    );
  }

  const ranked = members.filter((m) => m.visibility === "public" || Number(m.total) > 0);
  const best = Math.max(1, ...ranked.map((m) => Number(m.last_30)));
  const rangeViews = Number(overview?.totals.views || 0);
  const rowsOf = (kind) =>
    (summary || [])
      .filter((r) => r.kind === kind)
      .map((r) => ({ ...r, total: Number(r.total), visits: Number(r.visits) }));
  const byTotal = (a, b) => b.total - a.total;
  const channelRows = rowsOf("channel")
    .sort(byTotal)
    .map((r) => ({ key: r.key, label: channelLabel(r.key), total: r.total, note: plural(r.visits, "visit") }));
  const sectionRows = rowsOf("section")
    .sort(byTotal)
    .map((r) => ({
      key: r.key,
      label: sectionLabel(r.key),
      total: r.total,
      note: r.avg_seconds ? `${duration(r.avg_seconds)} per visit` : plural(r.visits, "visit"),
    }));
  const workRows = rowsOf("work")
    .sort(byTotal)
    .slice(0, 8)
    .map((r) => ({ key: r.key, label: r.key, total: r.total, note: plural(r.visits, "visit") }));
  const linkClicks = channelRows.reduce((sum, r) => sum + r.total, 0);
  const kpis = [
    { icon: Eye, label: `Views, last ${range} days`, value: number(rangeViews) },
    { icon: Users, label: `Visitors, last ${range} days`, value: number(overview?.totals.visitors) },
    { icon: Activity, label: "All-time views", value: number(allTime.total) },
    summary
      ? { icon: MousePointerClick, label: `Link clicks, last ${range} days`, value: number(linkClicks) }
      : {
          icon: History,
          label: "Last view",
          value: allTime.last ? timeAgo(allTime.last) : "None yet",
          title: allTime.last ? fullDate(allTime.last) : undefined,
        },
  ];
  const canDelete = isAdmin && Boolean(summary);
  const memberName = profileId == null ? "all members" : members.find((m) => Number(m.profile_id) === profileId)?.name;
  const allSelected = visits.length > 0 && visits.every((v) => selected.has(v.id));

  return (
    <div className="ui-page">
      {head}
      {error ? <p className="error">{error.message}</p> : null}

      <Toolbar>
        <label className="views-select">
          <span>Member</span>
          <select value={member} onChange={(e) => setMember(e.target.value)}>
            <option value="all">All members</option>
            {members.map((m) => (
              <option key={m.profile_id} value={m.profile_id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
        <Tabs
          value={range}
          onChange={setRange}
          label="Period"
          options={RANGES.map((days) => ({ value: days, label: `${days} days` }))}
        />
      </Toolbar>

      <div className="views-kpis">
        {kpis.map(({ icon: Icon, label, value, title }) => (
          <div key={label} className="ui-card views-kpi" title={title}>
            <span>
              <Icon aria-hidden="true" />
              {label}
            </span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <section className="ui-card">
        <h2 className="views-title">
          <CalendarDays aria-hidden="true" /> Views per day
        </h2>
        {rangeViews > 0 ? (
          <DailyChart days={overview.days} />
        ) : (
          <Empty compact icon={CalendarDays} title="No views in this period">
            Views appear here as soon as someone opens a portfolio.
          </Empty>
        )}
      </section>

      {summary ? (
        <div className="views-insights">
          <RankCard
            icon={MousePointerClick}
            title="Links clicked"
            rows={channelRows}
            empty="No links clicked in this period."
            active={channel}
            onPick={setChannel}
          />
          <RankCard
            icon={PanelTop}
            title="Sections opened"
            rows={sectionRows}
            empty="No sections opened in this period."
          />
          <RankCard
            icon={FolderOpen}
            title="Projects opened"
            rows={workRows}
            empty="No projects opened in this period."
          />
        </div>
      ) : (
        <p className="views-note">
          <LayoutList aria-hidden="true" />
          Detailed action tracking is off. Apply supabase/migrations/20261119120000_portfolio_events.sql to turn it on.
        </p>
      )}

      <div className="views-layout">
        <section className="ui-card views-members">
          <h2 className="views-title">
            <Users aria-hidden="true" /> By member
          </h2>
          <ul>
            {ranked.map((m) => {
              const on = Number(m.profile_id) === profileId;
              return (
                <li key={m.profile_id}>
                  <button
                    type="button"
                    className={on ? "is-on" : ""}
                    aria-pressed={on}
                    title={on ? "Show all members" : `Show only ${m.name}`}
                    onClick={() => setMember(on ? "all" : String(m.profile_id))}
                  >
                    <Avatar src={m.avatar_url} name={m.name} size={30} />
                    <span className="views-member">
                      <strong>{m.name}</strong>
                      <small>{m.last_viewed_at ? timeAgo(m.last_viewed_at) : "No views yet"}</small>
                      <i>
                        <b style={{ width: `${(Number(m.last_30) / best) * 100}%` }} />
                      </i>
                    </span>
                    <span className="views-count">
                      <strong>{number(m.last_30)}</strong>
                      <small>{number(m.total)} total</small>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="ui-muted">Bars and large numbers show the last 30 days.</p>
        </section>

        <section className="ui-card views-recent">
          <div className="views-recent-head">
            <h2 className="views-title">
              <History aria-hidden="true" /> {summary ? "Visits and actions" : "Recent visits"}
            </h2>
            {channel ? (
              <button type="button" className="ghost views-chip" onClick={() => setChannel(null)}>
                {channelLabel(channel)} <X />
              </button>
            ) : null}
          </div>
          {canDelete && visits.length > 0 ? (
            <div className="views-bulk">
              <label>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => setSelected(allSelected ? new Set() : new Set(visits.map((v) => v.id)))}
                />
                Select all shown
              </label>
              {selected.size > 0 ? (
                <button type="button" className="danger" onClick={() => deleteVisits([...selected])}>
                  <Trash2 /> Delete {selected.size} selected
                </button>
              ) : null}
            </div>
          ) : null}
          {visits.length === 0 ? (
            <Empty compact icon={Eye} title={channel ? "No matching visits" : "No visits yet"}>
              {channel ? "No visit in this list clicked that link." : "Each new visit is listed here."}
            </Empty>
          ) : (
            <ul>
              {visits.map((v) => {
                const Device = DEVICE_ICONS[v.device] || Monitor;
                const browser = browserLabel(v.user_agent);
                const expanded = open.has(v.id);
                return (
                  <li key={v.id} className={selected.has(v.id) ? "is-selected" : ""}>
                    <div className="views-row">
                      {canDelete ? (
                        <input
                          type="checkbox"
                          className="views-check"
                          aria-label={`Select visit to ${v.name}, ${timeAgo(v.created_at)}`}
                          checked={selected.has(v.id)}
                          onChange={() => toggle(setSelected, v.id)}
                        />
                      ) : null}
                      <span className="views-device" title={v.device}>
                        <Device aria-hidden="true" />
                      </span>
                      <div className="views-visit">
                        <p>
                          <strong>{v.name}</strong>
                          <time dateTime={v.created_at} title={fullDate(v.created_at)}>
                            {timeAgo(v.created_at)}
                          </time>
                          {SITE_URL ? (
                            <a
                              className="views-mini"
                              href={`${SITE_URL}/team/${v.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Open portfolio"
                              aria-label={`Open ${v.name}'s portfolio`}
                            >
                              <ExternalLink />
                            </a>
                          ) : null}
                        </p>
                        <p className="ui-muted">
                          {[
                            countryName(v.country),
                            browser || v.device.charAt(0).toUpperCase() + v.device.slice(1),
                            v.referrer ? `from ${v.referrer}` : "direct visit",
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                        {summary ? (
                          <p className="views-tags">
                            <span>{plural(v.actions, "action")}</span>
                            {Number(v.seconds) > 0 ? <span>{duration(v.seconds)}</span> : null}
                            {(v.channels || []).map((c) => (
                              <span key={c} className="is-channel">
                                {channelLabel(c)}
                              </span>
                            ))}
                          </p>
                        ) : null}
                      </div>
                      {isAdmin ? (
                        <div className="views-ip">
                          {v.ip ? (
                            <>
                              <code title={v.ip}>{v.ip}</code>
                              <CopyIp ip={v.ip} />
                              <button
                                type="button"
                                className="views-mini"
                                title="Erase this IP address from every visit"
                                aria-label={`Erase ${v.ip}`}
                                onClick={() => eraseIp(v.ip)}
                              >
                                <ShieldOff />
                              </button>
                            </>
                          ) : (
                            <span className="ui-muted">IP erased</span>
                          )}
                        </div>
                      ) : null}
                      <div className="views-row-tools">
                        {summary ? (
                          <button
                            type="button"
                            className={`views-mini views-expand${expanded ? " is-open" : ""}`}
                            aria-expanded={expanded}
                            title={expanded ? "Hide actions" : "Show actions"}
                            aria-label={`${expanded ? "Hide" : "Show"} actions in this visit`}
                            onClick={() => toggle(setOpen, v.id)}
                          >
                            <ChevronDown />
                          </button>
                        ) : null}
                        {canDelete ? (
                          <button
                            type="button"
                            className="views-mini is-danger"
                            title="Delete this visit"
                            aria-label={`Delete visit to ${v.name}`}
                            onClick={() => deleteVisits([v.id])}
                          >
                            <Trash2 />
                          </button>
                        ) : null}
                      </div>
                    </div>
                    {expanded ? <VisitTimeline viewId={v.id} canDelete={canDelete} onChanged={load} /> : null}
                  </li>
                );
              })}
            </ul>
          )}
          {hasMore ? (
            <button type="button" className="ghost views-more" disabled={loadingMore} onClick={loadMore}>
              {loadingMore ? <Loader2 className="spin" /> : <History />}
              {loadingMore ? "Loading…" : "Show older visits"}
            </button>
          ) : null}
          <p className="views-note">
            <Globe aria-hidden="true" />
            {isAdmin
              ? "Only admins can see IP addresses or delete records. IPs are erased automatically after 90 days. Text typed into forms is never recorded."
              : "IP addresses and deleting records are for admins only."}
          </p>
        </section>
      </div>

      {clearing ? (
        <ClearDialog
          memberName={memberName}
          profileId={profileId}
          onClose={() => setClearing(false)}
          onDone={() => {
            setClearing(false);
            setChannel(null);
            load();
          }}
        />
      ) : null}
    </div>
  );
}
