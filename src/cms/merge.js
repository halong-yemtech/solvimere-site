/**
 * Saved page content (Supabase `pages.content`) layered over the code defaults
 * (src/cms/defaults.js): objects merge key by key, arrays and values replace.
 * Shared by the site (src/cms/Content.jsx) and the admin page editor.
 */
export function mergeContent(fallback, remote) {
  if (remote == null) return fallback;
  if (Array.isArray(fallback)) return Array.isArray(remote) ? remote : fallback;
  if (!fallback || typeof fallback !== "object") return remote;
  if (typeof remote !== "object" || Array.isArray(remote)) return remote;
  const next = { ...fallback };
  Object.keys(remote).forEach((key) => {
    next[key] = key in fallback ? mergeContent(fallback[key], remote[key]) : remote[key];
  });
  return next;
}
