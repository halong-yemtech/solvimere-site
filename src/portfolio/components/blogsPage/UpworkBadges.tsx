/**
 * Upwork profile badges (Job Success, Top Rated, ID verified…) shown the way upwork.com shows
 * them: a small coloured icon followed by plain text, not as pills.
 */

type Kind = "jss" | "topRated" | "topRatedPlus" | "risingTalent" | "expertVetted" | "verified" | "available" | "other";

const COLORS: Record<Kind, string> = {
  jss: "#1f57c3",
  topRated: "#1f57c3",
  topRatedPlus: "#e1097f",
  risingTalent: "#14a800",
  expertVetted: "#6b31d6",
  verified: "#1f57c3",
  available: "#14a800",
  other: "#14a800",
};

function kindOf(label: string): Kind {
  const l = label.toLowerCase();
  if (/job success|jss/.test(l)) return "jss";
  if (/top rated plus|top-rated plus/.test(l)) return "topRatedPlus";
  if (/top rated|top-rated/.test(l)) return "topRated";
  if (/rising/.test(l)) return "risingTalent";
  if (/expert/.test(l)) return "expertVetted";
  if (/verified/.test(l)) return "verified";
  if (/open for work|available|availability/.test(l)) return "available";
  return "other";
}

/** Scalloped badge outline (the shape of Upwork's Top Rated / Rising Talent badges). */
const BADGE =
  "M12 1.5l2.1 1.6 2.6-.4 1 2.4 2.4 1-.4 2.6L21.3 12l-1.6 2.1.4 2.6-2.4 1-1 2.4-2.6-.4L12 22.5l-2.1-1.6-2.6.4-1-2.4-2.4-1 .4-2.6L2.7 12l1.6-2.1-.4-2.6 2.4-1 1-2.4 2.6.4z";
const STAR = "M12 6.8l1.55 3.15 3.47.5-2.51 2.45.59 3.46L12 14.72l-3.1 1.64.59-3.46-2.51-2.45 3.47-.5z";

function BadgeIcon({ kind }: { kind: Kind }) {
  const color = COLORS[kind];
  const common = { width: "1em", height: "1em", viewBox: "0 0 24 24", "aria-hidden": true } as const;
  switch (kind) {
    case "jss":
      // Medal with ribbon tails and a check.
      return (
        <svg {...common}>
          <path
            d="M7.5 13.5L5 22l3.6-1.6L11 23l1-6.5zM16.5 13.5L19 22l-3.6-1.6L13 23l-1-6.5z"
            fill={color}
            opacity=".75"
          />
          <circle cx="12" cy="9" r="7.5" fill={color} />
          <path
            d="M8.6 9.2l2.3 2.3 4.5-4.6"
            fill="none"
            stroke="#fff"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "topRated":
    case "topRatedPlus":
    case "risingTalent":
      return (
        <svg {...common}>
          <path d={BADGE} fill={color} />
          <path d={STAR} fill="#fff" />
        </svg>
      );
    case "expertVetted":
      return (
        <svg {...common}>
          <path d="M12 1.8l8 3v6.1c0 5.1-3.4 9.3-8 11.1-4.6-1.8-8-6-8-11.1V4.8z" fill={color} />
          <path
            d="M8.4 12l2.5 2.5 4.8-4.9"
            fill="none"
            stroke="#fff"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "verified":
      return (
        <svg {...common}>
          <path d={BADGE} fill={color} />
          <path
            d="M8.3 12.1l2.5 2.5 4.9-5"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "available":
      // Upwork marks "Available now" with a lightning bolt.
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10.5" fill={color} />
          <path d="M13.2 4.8L7.6 13h3.6l-.9 6.2 5.8-8.4h-3.8z" fill="#fff" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10.5" fill={color} />
          <path
            d="M8 12.2l2.7 2.7L16 9.6"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

export default function UpworkBadges({ badges }: { badges: string[] }) {
  return (
    <ul className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
      {badges.map((label) => {
        const kind = kindOf(label);
        return (
          <li key={label} className="flex items-center gap-2 text-[1.45rem] font-medium text-gray-100">
            <span className="text-[2.1rem] leading-none">
              <BadgeIcon kind={kind} />
            </span>
            {label}
          </li>
        );
      })}
    </ul>
  );
}
