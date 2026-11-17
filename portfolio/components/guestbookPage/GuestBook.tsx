"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Title from "../Title";
import GuestComments from "./GuestComments";
import GuestForm from "./GuestForm";
import { getGuestbookComments } from "@/app/(frontend)/actions";
import type { GuestbookComment } from "@/lib/siteTypes";

export default function GuestBook() {
  const [comments, setComments] = useState<GuestbookComment[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const nextPage = useRef(1);
  const loading = useRef(false);

  const loadMore = useCallback(async () => {
    if (loading.current) return;
    loading.current = true;
    const res = await getGuestbookComments(nextPage.current);
    loading.current = false;
    if (!res.ok) {
      setError(res.error);
      setHasMore(false);
      return;
    }
    nextPage.current += 1;
    setHasMore(res.data.hasNextPage);
    setComments((prev) => {
      // Skip any comment already shown (e.g. one just posted from this browser).
      const seen = new Set((prev ?? []).map((c) => c.id));
      return [...(prev ?? []), ...res.data.comments.filter((c) => !seen.has(c.id))];
    });
  }, []);

  useEffect(() => {
    loadMore();
  }, [loadMore]);

  return (
    <section className="lg:h-full h-[95rem] overflow-y-scroll myScroll" id="guestComments">
      <Title name="guest book" />
      <section className="px-12 py-8">
        <GuestForm onCreated={(c) => setComments((prev) => [c, ...(prev ?? [])])} />
        <GuestComments comments={comments} error={error} hasMore={hasMore} loadMore={loadMore} />
      </section>
    </section>
  );
}
