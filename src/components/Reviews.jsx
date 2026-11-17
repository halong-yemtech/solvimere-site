const STAR = "m10 1.8 2.1 4.6 5 .6-3.7 3.4.9 5-4.3-2.4L5.7 15.4l.9-5L2.9 7l5-.6L10 1.8Z";

/** Small brand marks for the rating platforms; unknown platforms show their initial. */
function PlatformMark({ platform }) {
  switch (String(platform || "").toLowerCase().replace(/[^a-z]/g, "")) {
    case "google":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.7Z" />
          <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9h-4v3.1A12 12 0 0 0 12 24Z" />
          <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.7V6.6h-4a12 12 0 0 0 0 10.9l4-3.1Z" />
          <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8Z" />
        </svg>
      );
    case "trustpilot":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#00B67A" d="m12 1.5 2.6 7.6h8l-6.5 4.7 2.5 7.7L12 16.8l-6.6 4.7 2.5-7.7-6.5-4.7h8L12 1.5Z" />
        </svg>
      );
    case "goodfirms":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect width="24" height="24" rx="6" fill="#1D2B4F" />
          <path fill="none" stroke="#F2563C" strokeWidth="3" strokeLinecap="round" d="M17 7.2A6.5 6.5 0 1 0 18.5 12H12.5" />
        </svg>
      );
    case "sortlist":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect width="24" height="24" rx="6" fill="#0E1B3D" />
          <path fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" d="M16 7.5c-1-.9-2.4-1.4-4-1.4-2.2 0-3.8 1.1-3.8 2.8 0 3.7 7.9 2.1 7.9 6.1 0 1.8-1.7 3-4.1 3-1.7 0-3.2-.6-4.2-1.6" />
          <circle cx="17.6" cy="17.4" r="1.5" fill="#3D7BFF" />
        </svg>
      );
    case "meta":
    case "facebook":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="none"
            stroke="#0866FF"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 12c-1.6-2.6-3.3-4.6-5-4.6-2.3 0-3.7 2.6-3.7 5 0 2 1 3.3 2.6 3.3 1.8 0 3.1-1.7 6.1-6.2 2-3 3.6-2.1 4.6-2.1 2.3 0 4.1 2.7 4.1 5.3 0 1.8-.8 3-2.4 3-1.8 0-3.2-1.8-6.3-6.7"
          />
        </svg>
      );
    default:
      return <span className="review-initial">{String(platform || "?").trim().charAt(0).toUpperCase()}</span>;
  }
}

/** Five stars, filled in proportion to the score (e.g. 4.9 → 98%). */
function Stars({ score }) {
  const value = Math.max(0, Math.min(5, Number.parseFloat(score) || 0));
  const row = (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" aria-hidden="true">
          <path d={STAR} />
        </svg>
      ))}
    </>
  );
  return (
    <span className="review-stars" aria-hidden="true">
      <span className="review-stars-base">{row}</span>
      <span className="review-stars-fill" style={{ width: `${(value / 5) * 100}%` }}>
        {row}
      </span>
    </span>
  );
}

/** Opens external review/award pages in a new tab; renders a plain element without a URL. */
function MaybeLink({ url, className, label, children }) {
  if (!url) return <div className={className}>{children}</div>;
  return (
    <a className={`${className} is-link`} href={url} target="_blank" rel="noopener noreferrer" aria-label={label}>
      {children}
    </a>
  );
}

export function Reviews({ content }) {
  const ratings = (content?.ratings || []).filter((item) => item.platform && item.score);
  const badges = (content?.badges || []).filter((item) => item.image);
  if (!ratings.length && !badges.length) return null;

  return (
    <section id="reviews" className="section reviews" aria-label="Client ratings and recognition">
      <div className="wrap reviews-grid">
        {ratings.length ? (
          <div className="reviews-ratings">
            {content.ratingsLabel ? <p className="reviews-label">{content.ratingsLabel}</p> : null}
            <ul className="review-cards">
              {ratings.map((item) => (
                <li key={item.platform}>
                  <MaybeLink
                    url={item.url}
                    className="review-card"
                    label={`${item.platform}: rated ${item.score} out of 5${item.count ? `, ${item.count}` : ""} (opens in a new tab)`}
                  >
                    <span className="review-mark">
                      <PlatformMark platform={item.platform} />
                    </span>
                    <span className="review-body">
                      <span className="review-score">
                        <strong>{item.score}</strong>
                        <Stars score={item.score} />
                      </span>
                      <span className="review-source">{item.platform}</span>
                      {item.count ? <span className="review-count">{item.count}</span> : null}
                    </span>
                  </MaybeLink>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {badges.length ? (
          <div className="reviews-badges">
            {content.badgesLabel ? <p className="reviews-label">{content.badgesLabel}</p> : null}
            <ul className="badge-grid">
              {badges.map((badge) => (
                <li key={badge.image}>
                  <MaybeLink url={badge.url} className="badge-tile" label={`${badge.name} (opens in a new tab)`}>
                    <img src={badge.image} alt={badge.name} loading="lazy" decoding="async" />
                  </MaybeLink>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
