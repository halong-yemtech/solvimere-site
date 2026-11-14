import { useEffect, useState } from "react";
import { supabase, supabaseConfigured } from "./supabase";

export function mapTeamMember(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email || "",
    image: row.avatar_url,
    avatarScale: Number(row.avatar_scale) || 1,
    roles: row.role ? [row.role] : [],
    bio: row.bio || "",
    highlight: row.highlight_text
      ? { label: row.highlight_label || "Highlights", text: row.highlight_text }
      : null,
    expertise: row.expertise_text
      ? { label: row.expertise_label || "Expertise", text: row.expertise_text }
      : null,
    quote: row.quote || "",
  };
}

export function useTeamMembers(fallback) {
  const [members, setMembers] = useState(null);

  useEffect(() => {
    if (!supabaseConfigured) return undefined;
    let cancelled = false;
    supabase
      .from("team_members")
      .select(
        "id, name, role, email, avatar_url, avatar_scale, bio, highlight_label, highlight_text, expertise_label, expertise_text, quote, sort_order",
      )
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })
      .then(({ data, error }) => {
        if (cancelled || error || !data) return;
        setMembers(data.map(mapTeamMember));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return members ?? fallback;
}
