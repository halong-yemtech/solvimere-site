import { portfolioSlug } from "../lib/slug";
import { TeamMail } from "./TeamMail";

export function portfolioPath(person) {
  const slug = portfolioSlug(person.name);
  return slug ? `/team/${slug}` : "";
}

/**
 * Props for a link that opens a member's portfolio in a new tab, leaving the
 * current page as it is. The portfolio is a separate app (portfolio/) served
 * under /team/<slug>, so this is a plain <a>, never a router <Link>.
 */
export function portfolioLinkProps(person) {
  const href = portfolioPath(person);
  return href ? { href, target: "_blank", rel: "noopener noreferrer" } : {};
}

/** Portfolio button shown next to the email button. */
export function TeamPortfolio({ person }) {
  if (!portfolioPath(person)) return null;
  return (
    <a
      className="team-action team-folio"
      {...portfolioLinkProps(person)}
      aria-label={`View ${person.name}'s portfolio (opens in a new tab)`}
      title="View portfolio"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
        <path d="M3 12.5h18" />
      </svg>
    </a>
  );
}

/** The buttons on a team photo: portfolio next to email. */
export function TeamActions({ person }) {
  return (
    <div className="team-actions">
      <TeamPortfolio person={person} />
      <TeamMail person={person} />
    </div>
  );
}
