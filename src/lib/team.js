/** A team_members row as the site's components use it. Loading happens in cms/Content.jsx. */
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
