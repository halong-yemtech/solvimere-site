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
    highlight: row.highlight_text ? { label: row.highlight_label || "Highlights", text: row.highlight_text } : null,
    expertise: row.expertise_text ? { label: row.expertise_label || "Expertise", text: row.expertise_text } : null,
    quote: row.quote || "",
  };
}

// One request per page load, shared by every component that shows the team
// (hero pill, home team grid, team page); later mounts get the result instantly.
let cached = null;
let request = null;

function loadTeam() {
  request ??= supabase
    .from("team_members")
    .select(
      "id, name, role, email, avatar_url, avatar_scale, bio, highlight_label, highlight_text, expertise_label, expertise_text, quote, sort_order",
    )
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })
    .then(({ data, error }) => {
      if (error || !data) {
        request = null; // try again on the next mount
        return null;
      }
      cached = data.map(mapTeamMember);
      return cached;
    });
  return request;
}

export function useTeamMembers(fallback) {
  const [members, setMembers] = useState(cached);

  useEffect(() => {
    if (!supabaseConfigured || cached) return undefined;
    let cancelled = false;
    loadTeam().then((list) => {
      if (!cancelled && list) setMembers(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return members ?? fallback;
}
