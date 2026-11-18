import { useEffect, useState } from "react";

const TYPE_MS = 45;
const DELETE_MS = 22;
const HOLD_MS = 2600;

/** Types each title, holds it, deletes it, and moves on. With one title (or reduced motion) it just shows it. */
export default function Typing({ titles, className = "" }: { titles: string[]; className?: string }) {
  const [index, setIndex] = useState(0);
  const [length, setLength] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const still =
    titles.length < 2 ||
    (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

  const title = titles[index % Math.max(titles.length, 1)] ?? "";

  useEffect(() => {
    if (still) return undefined;
    let delay = deleting ? DELETE_MS : TYPE_MS;
    if (!deleting && length === title.length) delay = HOLD_MS;
    const t = window.setTimeout(() => {
      if (!deleting && length === title.length) setDeleting(true);
      else if (deleting && length === 0) {
        setDeleting(false);
        setIndex((i) => (i + 1) % titles.length);
      } else setLength((l) => l + (deleting ? -1 : 1));
    }, delay);
    return () => window.clearTimeout(t);
  }, [still, deleting, length, title, titles.length]);

  if (titles.length === 0) return null;

  return (
    <p className={className} aria-label={titles.join(", ")}>
      <span aria-hidden>{still ? titles[0] : title.slice(0, length)}</span>
      {!still && <span className="pf-caret" aria-hidden />}
    </p>
  );
}
