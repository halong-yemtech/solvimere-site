import type { IconType } from "react-icons";
import { FaWhatsapp } from "react-icons/fa";
import {
  FiActivity,
  FiBriefcase,
  FiCalendar,
  FiGlobe,
  FiInfo,
  FiMail,
  FiMapPin,
  FiPhone,
  FiTag,
  FiUser,
} from "react-icons/fi";

const ICONS: Record<string, IconType> = {
  address: FiMapPin,
  location: FiMapPin,
  residence: FiGlobe,
  email: FiMail,
  phone: FiPhone,
  whatsapp: FaWhatsapp,
  status: FiActivity,
  age: FiCalendar,
  date: FiCalendar,
  client: FiBriefcase,
  owner: FiUser,
  categories: FiTag,
};

interface Props {
  field: string;
  value: React.ReactNode;
  /** Override the icon picked from the field name. */
  icon?: IconType;
  /** Shown under the value in a smaller line, e.g. "Chat on WhatsApp". */
  hint?: string;
}

/** One labelled detail (address, email, …) as an icon card. */
export default function MyInfo({ field, value, icon, hint }: Props) {
  const Icon = icon ?? ICONS[field.toLowerCase()] ?? FiInfo;
  const isStatus = field.toLowerCase() === "status";
  return (
    <li className="group flex min-w-0 items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] px-4 py-4 transition-colors duration-200 hover:border-main-orange/40 hover:bg-white/[0.045]">
      <span className="grid h-[4.4rem] w-[4.4rem] shrink-0 place-items-center rounded-xl bg-main-orange/10 text-[1.9rem] text-main-orange ring-1 ring-inset ring-main-orange/25 transition-colors group-hover:bg-main-orange/20">
        <Icon aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-[1.1rem] font-semibold uppercase tracking-[0.14em] text-gray-500">{field}</span>
        <span className="flex items-center gap-2 text-[1.55rem] leading-snug text-white break-words">
          {isStatus && (
            <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-400" />
            </span>
          )}
          <span className="min-w-0 break-words">{value}</span>
        </span>
        {hint && <span className="block text-[1.2rem] text-gray-400">{hint}</span>}
      </span>
    </li>
  );
}
