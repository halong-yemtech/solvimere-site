const STUDIO = "hello@solvimere.com";

export function memberMailto(person) {
  const address = person.email || STUDIO;
  const subject = encodeURIComponent(`Hello ${person.name}`);
  const body = encodeURIComponent(`Hello ${person.name},\n\n`);
  return `mailto:${address}?subject=${subject}&body=${body}`;
}

export function TeamMail({ person }) {
  const address = person.email || STUDIO;
  return (
    <a
      className="team-action team-mail"
      href={memberMailto(person)}
      aria-label={`Email ${person.name}`}
      title={address}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    </a>
  );
}
