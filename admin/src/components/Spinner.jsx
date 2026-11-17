/**
 * Loading indicator: the Solvimere mark turning inside a spinning ring.
 *   <Spinner label="Loading profiles…" />   covers the whole screen, centred; nothing else shows
 *                                           until the page has its data (the default)
 *   <Spinner inline size="sm" />            inside a modal or a small area
 */
export function Spinner({ label = "Loading…", size = "md", inline = false }) {
  return (
    <div className={`spinner is-${size}${inline ? "" : " is-full"}`} role="status" aria-live="polite">
      <span className="spinner-mark" aria-hidden="true">
        <img src="/favicon.png" alt="" />
      </span>
      {label ? <span className="spinner-label">{label}</span> : <span className="sr-only">Loading…</span>}
    </div>
  );
}
