import { motion } from "framer-motion";
import { FiMessageCircle } from "react-icons/fi";
import Loader from "../Loader";
import type { GuestbookComment } from "@/lib/siteTypes";

const fullDate = (d: string) =>
  new Date(d).toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
function timeAgo(d: string) {
  const s = (new Date(d).getTime() - Date.now()) / 1000;
  const steps: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.35, "week"],
    [12, "month"],
    [Infinity, "year"],
  ];
  let v = s;
  for (const [size, unit] of steps) {
    if (Math.abs(v) < size) return relative.format(Math.round(v), unit);
    v /= size;
  }
  return "";
}

/** Same colour for the same name, from a small hue wheel. */
const hue = (name: string) => [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);

interface Props {
  comments: GuestbookComment[] | null;
  error: string | null;
  hasMore: boolean;
  loadingMore: boolean;
  loadMore: () => void;
}

export default function GuestComments({ comments, error, hasMore, loadingMore, loadMore }: Props) {
  if (!comments) {
    return (
      <div className="flex justify-center py-16">
        <Loader />
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="pf-card p-12 text-center text-[1.6rem] text-gray-400">
        <FiMessageCircle className="mx-auto mb-4 text-[3rem] text-gray-500" aria-hidden />
        {error ? `${error} Please check back later.` : "No comments yet. Be the first to say hello!"}
      </div>
    );
  }

  return (
    <div>
      <ul className="space-y-3">
        {comments.map((c) => (
          <motion.li
            key={c.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="pf-card flex gap-4 p-6"
          >
            <span
              className="grid h-[4.4rem] w-[4.4rem] shrink-0 place-items-center rounded-full text-[1.7rem] font-bold uppercase text-white"
              style={{
                background: `linear-gradient(135deg, hsl(${hue(c.name)} 60% 45%), hsl(${hue(c.name) + 40} 60% 30%))`,
              }}
              aria-hidden
            >
              {c.name.trim().charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-3">
                <h3 className="text-[1.55rem] font-semibold capitalize text-white">{c.name}</h3>
                <time className="text-[1.25rem] text-gray-500" dateTime={c.createdAt} title={fullDate(c.createdAt)}>
                  {timeAgo(c.createdAt)}
                </time>
              </div>
              <p className="mt-1.5 text-[1.5rem] leading-[1.65] text-gray-300 whitespace-pre-line break-words">
                {c.comment}
              </p>
            </div>
          </motion.li>
        ))}
      </ul>
      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button type="button" onClick={loadMore} disabled={loadingMore} className="pf-btn pf-btn-ghost pf-btn-plain">
            {loadingMore ? "Loading…" : "Show more comments"}
          </button>
        </div>
      )}
    </div>
  );
}
