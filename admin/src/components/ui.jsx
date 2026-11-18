import { Search, X } from "lucide-react";

/*
 * Small building blocks shared by every admin page, so they all look and behave the same.
 */

/** Page title row: optional icon, title, description, actions on the right, stats below. */
export function PageHead({ icon: Icon, title, description, actions, stats }) {
  return (
    <header className="ui-head">
      <div className="ui-head-main">
        {Icon ? (
          <span className="ui-head-icon" aria-hidden="true">
            <Icon />
          </span>
        ) : null}
        <div>
          <h1>{title}</h1>
          {description ? <p>{description}</p> : null}
        </div>
      </div>
      {actions || stats ? (
        <div className="ui-head-side">
          {stats ? <div className="ui-stats">{stats}</div> : null}
          {actions ? <div className="ui-head-actions">{actions}</div> : null}
        </div>
      ) : null}
    </header>
  );
}

/** A small counter chip: <Stat icon={Users} value={3} label="total" />. */
export function Stat({ icon: Icon, value, label, tone }) {
  return (
    <span className={tone ? `is-${tone}` : undefined}>
      {Icon ? <Icon /> : null}
      <b>{value}</b> {label}
    </span>
  );
}

/** Search field with an icon and a clear button. */
export function SearchBox({ value, onChange, placeholder = "Search", label = "Search" }) {
  return (
    <label className="ui-search">
      <Search aria-hidden="true" />
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label={label}
        onChange={(e) => onChange(e.target.value)}
      />
      {value ? (
        <button type="button" className="ui-search-clear" aria-label="Clear search" onClick={() => onChange("")}>
          <X />
        </button>
      ) : null}
    </label>
  );
}

/** Filter tabs with optional counts: options = [{ value, label, icon, count }]. */
export function Tabs({ value, onChange, options, label = "Filter" }) {
  return (
    <div className="ui-tabs" role="tablist" aria-label={label}>
      {options.map((o) => {
        const Icon = o.icon;
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={on}
            className={on ? "is-on" : ""}
            onClick={() => onChange(o.value)}
          >
            {Icon ? <Icon /> : null}
            {o.label}
            {o.count != null ? <em>{o.count}</em> : null}
          </button>
        );
      })}
    </div>
  );
}

/** A toolbar row above a list: search on the left, filters/actions on the right. */
export function Toolbar({ children }) {
  return <div className="ui-toolbar">{children}</div>;
}

const UNITS = [
  ["year", 31536000],
  ["month", 2592000],
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
];
const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

/** "3 hours ago", "yesterday", "in 2 days". */
export function timeAgo(iso) {
  if (!iso) return "";
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

/** Case-insensitive "does any of these fields contain the query". */
export function matches(query, ...fields) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields.some((f) =>
    String(f || "")
      .toLowerCase()
      .includes(q),
  );
}
