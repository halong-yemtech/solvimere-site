"use client";

import InfiniteScroll from "react-infinite-scroll-component";
import { motion } from "framer-motion";
import Loader from "../Loader";
import type { GuestbookComment } from "@/lib/siteTypes";

function formatDate(d: string) {
  return new Date(d).toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface Props {
  comments: GuestbookComment[] | null;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
}

export default function GuestComments({ comments, error, hasMore, loadMore }: Props) {
  if (error && !comments) {
    return <p className="mt-10 text-xl text-gray-500">{error} Please check back later.</p>;
  }

  if (!comments)
    return (
      <div className="flex justify-center mt-8">
        <Loader />
      </div>
    );

  return (
    <InfiniteScroll
      dataLength={comments.length}
      next={loadMore}
      hasMore={hasMore}
      loader={
        <div className="flex justify-center mt-8 mb-5">
          <Loader />
        </div>
      }
      scrollableTarget="guestComments"
    >
      <motion.ul className="relative mt-12 customLine before:top-0 borderLeft">
        {comments.map((c) => (
          <motion.li
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            key={c.id}
            className="pt-10"
          >
            <div className="flex items-center gap-x-6">
              <h3 className="text-2xl font-semibold capitalize text-main-orange">{c.name}</h3>
              <time className="hidden text-xl text-gray-600 sm:block" dateTime={c.createdAt}>
                {formatDate(c.createdAt)}
              </time>
            </div>
            <p className="mt-4 text-2xl tracking-wider text-gray-400 whitespace-pre-line break-words">
              {c.comment}
            </p>
          </motion.li>
        ))}
      </motion.ul>
    </InfiniteScroll>
  );
}
