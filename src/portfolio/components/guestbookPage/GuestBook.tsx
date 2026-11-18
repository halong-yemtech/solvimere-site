import { useCallback, useEffect, useRef, useState } from "react";
import GuestComments from "./GuestComments";
import GuestForm from "./GuestForm";
import { getGuestbookComments } from "@/lib/actions";
import type { GuestbookComment } from "@/lib/siteTypes";

/** Guest book: leave a comment, read what others wrote. */
export default function GuestBook() {
  const [comments, setComments] = useState<GuestbookComment[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const nextPage = useRef(1);
  const loading = useRef(false);

  const loadMore = useCallback(async () => {
    if (loading.current) return;
    loading.current = true;
    setLoadingMore(true);
    const res = await getGuestbookComments(nextPage.current);
    loading.current = false;
    setLoadingMore(false);
    if (!res.ok) {
      setError(res.error);
      setHasMore(false);
      setComments((prev) => prev ?? []);
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
    <section>
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] items-start">
        <GuestForm onCreated={(c) => setComments((prev) => [c, ...(prev ?? [])])} />
        <GuestComments
          comments={comments}
          error={error}
          hasMore={hasMore}
          loadingMore={loadingMore}
          loadMore={loadMore}
        />
      </div>
    </section>
  );
}
