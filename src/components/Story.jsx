import { useEffect } from "react";
import { Button, Eyebrow } from "./Chrome";

export function RichTitle({ title = "", emphasis = "" }) {
  return String(title)
    .split("\n")
    .map((line, index) => {
      const match = emphasis && line.includes(emphasis);
      const [before, after] = match ? line.split(emphasis) : [line, ""];
      return (
        <span key={`${line}-${index}`}>
          {index > 0 ? <br /> : null}
          {before}
          {match ? <em>{emphasis}</em> : null}
          {match ? after : null}
        </span>
      );
    });
}

export function PageHero({ documentTitle, eyebrow, title, lede, actions, children }) {
  useEffect(() => {
    const previous = document.title;
    document.title = documentTitle;
    return () => {
      document.title = previous;
    };
  }, [documentTitle]);

  return (
    <header className="page-hero">
      <div className="team-glow" aria-hidden="true" />
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1>{title}</h1>
      <p className="lede">{lede}</p>
      {actions ? <div className="page-actions">{actions}</div> : null}
      {children}
    </header>
  );
}

export function SectionHead({ kicker, title, lede, aside }) {
  return (
    <div className="section-head">
      <div>
        {kicker ? <p className="kicker">{kicker}</p> : null}
        <h2>{title}</h2>
        {lede ? <p>{lede}</p> : null}
      </div>
      {aside}
    </div>
  );
}

export function PageCta({ title, body, href = "/#contact", label = "Start a conversation", extra }) {
  return (
    <div className="page-cta">
      <h2>{title}</h2>
      <p>{body}</p>
      <div className="page-actions">
        <Button href={href}>{label}</Button>
        {extra}
      </div>
    </div>
  );
}

export function StatRow({ items }) {
  return (
    <ul className="team-facts page-facts">
      {items.map(([value, label]) => (
        <li key={label}>
          <strong>{value}</strong>
          <span>{label}</span>
        </li>
      ))}
    </ul>
  );
}

export function Filters({ label, options, value, onChange, counts = false }) {
  return (
    <div className="filters" role="group" aria-label={label}>
      {options.map((option) => {
        const name = Array.isArray(option) ? option[0] : option;
        const count = Array.isArray(option) ? option[1] : null;
        const selected = value === name;
        return (
          <button
            key={name}
            type="button"
            className={selected ? "is-on" : ""}
            aria-pressed={selected}
            onClick={() => onChange(name)}
          >
            {name}
            {counts && count && name !== "All" ? <span>{count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
