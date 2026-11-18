/** A person's photo, or their initials on a colour derived from their name. */
const HUES = [210, 160, 265, 25, 330, 190, 95, 45];

function initials(name) {
  const parts = String(name || "?")
    .replace(/@.*/, "")
    .split(/[\s._-]+/)
    .filter(Boolean);
  return ((parts[0]?.[0] || "?") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

function hueFor(text) {
  let hash = 0;
  for (const ch of String(text || "")) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return HUES[hash % HUES.length];
}

export function Avatar({ src, name, size = 36, className = "" }) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.38) };
  if (src) return <img className={`avatar-img ${className}`} src={src} alt="" style={style} />;
  const hue = hueFor(name);
  return (
    <span
      className={`avatar-img is-initials ${className}`}
      aria-hidden="true"
      style={{
        ...style,
        background: `linear-gradient(135deg, hsl(${hue} 70% 45%), hsl(${(hue + 40) % 360} 70% 35%))`,
      }}
    >
      {initials(name)}
    </span>
  );
}
